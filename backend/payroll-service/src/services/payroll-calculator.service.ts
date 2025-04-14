import logger from '../utils/logger';
import axios from 'axios';
import { env } from '../config/env';
import { AppError } from '../utils/error-handler';

interface Employee {
  _id: string;
  name: string;
  salario: string;
  contract: 'CLT' | 'PJ';
}

interface Benefit {
  _id: string;
  value: number;
  status: string;
  benefitType: {
    name: string;
    hasDiscount: boolean;
    discountPercentage?: number;
  };
}

export interface PayrollCalculation {
  employeeId: string;
  employeeName: string;
  contract: 'CLT' | 'PJ';
  baseSalary: number;
  overtimePay: number;
  overtimeHours: number;
  deductions: number;
  totalSalary: number;
  inss?: number;
  fgts?: number;
  irrf?: number;
  benefits?: {
    name: string;
    value: number;
    hasDiscount: boolean;
    discountValue?: number;
  }[];
}

class PayrollCalculatorService {
  // Buscar funcionário pelo ID
  private async getEmployee(employeeId: string): Promise<Employee> {
    try {
      const response = await axios.get<Employee>(`${env.workerServiceUrl}/api/workers/${employeeId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching employee ${employeeId}:`, error);
      throw new AppError('Erro ao buscar informações do funcionário', 500);
    }
  }

  // Buscar benefícios do funcionário
  private async getEmployeeBenefits(employeeId: string): Promise<Benefit[]> {
    try {
      const response = await axios.get<Benefit[]>(`${env.benefitsServiceUrl}/api/employee-benefits/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching benefits for employee ${employeeId}:`, error);
      // Não lançar erro, apenas retornar array vazio
      return [];
    }
  }

  // Calcular INSS (tabela 2024)
  private calculateINSS(salary: number): number {
    const inssRanges = [
      { max: 1412.00, rate: 0.075 },
      { max: 2666.68, rate: 0.09 },
      { max: 4000.03, rate: 0.12 },
      { max: 7786.02, rate: 0.14 }
    ];
    
    let inss = 0;
    let remainingSalary = salary;
    let previousMax = 0;

    for (const range of inssRanges) {
      if (remainingSalary > 0) {
        const baseCalc = Math.min(remainingSalary, range.max - previousMax);
        inss += baseCalc * range.rate;
        remainingSalary -= baseCalc;
        previousMax = range.max;
      }
    }

    return Number(inss.toFixed(2));
  }

  // Calcular IRRF (tabela 2024)
  private calculateIRRF(salary: number, inss: number): number {
    const baseCalc = salary - inss;
    
    if (baseCalc <= 2259.20) return 0;
    if (baseCalc <= 2826.65) return Number(((baseCalc * 0.075) - 169.44).toFixed(2));
    if (baseCalc <= 3751.05) return Number(((baseCalc * 0.15) - 381.44).toFixed(2));
    if (baseCalc <= 4664.68) return Number(((baseCalc * 0.225) - 662.77).toFixed(2));
    return Number(((baseCalc * 0.275) - 896.00).toFixed(2));
  }

  // Calcular FGTS (8% do salário bruto)
  private calculateFGTS(salary: number): number {
    return Number((salary * 0.08).toFixed(2));
  }

  // Calcular horas extras
  private calculateOvertime(baseSalary: number, overtimeHours: number, isCLT: boolean): number {
    const hourlyRate = baseSalary / 220; // 220 = horas mensais padrão
    const overtimeRate = isCLT ? 1.5 : 1; // 50% adicional para CLT
    return Number((hourlyRate * overtimeHours * overtimeRate).toFixed(2));
  }

  // Calcular folha de pagamento para um funcionário
  public async calculatePayroll(employeeId: string, overtimeHours: number = 0): Promise<PayrollCalculation> {
    try {
      // Buscar funcionário
      const employee = await this.getEmployee(employeeId);
      
      // Converter salário para número
      const baseSalary = Number(employee.salario.replace(/[^\d,.]/g, '').replace(',', '.'));
      
      // Verificar se o contrato é CLT
      const isCLT = employee.contract === 'CLT';
      
      // Calcular horas extras
      const overtimePay = this.calculateOvertime(baseSalary, overtimeHours, isCLT);
      
      // Salário bruto (base + horas extras)
      const grossSalary = baseSalary + overtimePay;
      
      // Buscar benefícios
      const employeeBenefits = await this.getEmployeeBenefits(employeeId);
      
      // Processar benefícios
      const benefits = employeeBenefits
        .filter(benefit => benefit.status === 'active')
        .map(benefit => {
          const hasDiscount = benefit.benefitType.hasDiscount;
          const discountValue = hasDiscount && benefit.benefitType.discountPercentage
            ? Number((benefit.value * (benefit.benefitType.discountPercentage / 100)).toFixed(2))
            : 0;
            
          return {
            name: benefit.benefitType.name,
            value: benefit.value,
            hasDiscount,
            discountValue
          };
        });
        
      // Somar descontos dos benefícios
      const benefitsDeduction = benefits.reduce((sum, benefit) => 
        sum + (benefit.discountValue || 0), 0);
        
      // Inicializar valores específicos de CLT
      let inss = 0;
      let fgts = 0;
      let irrf = 0;
      
      // Calcular impostos para CLT
      if (isCLT) {
        inss = this.calculateINSS(grossSalary);
        irrf = this.calculateIRRF(grossSalary, inss);
        fgts = this.calculateFGTS(grossSalary);
      }
      
      // Total de deduções
      const deductions = inss + irrf + benefitsDeduction;
      
      // Salário líquido
      const totalSalary = grossSalary - deductions;
      
      // Retornar resultado do cálculo
      return {
        employeeId: employee._id,
        employeeName: employee.name,
        contract: employee.contract,
        baseSalary,
        overtimePay,
        overtimeHours,
        deductions,
        totalSalary,
        inss: isCLT ? inss : undefined,
        fgts: isCLT ? fgts : undefined,
        irrf: isCLT ? irrf : undefined,
        benefits
      };
    } catch (error) {
      logger.error(`Error calculating payroll for employee ${employeeId}:`, error);
      throw error instanceof AppError ? error : new AppError('Erro ao calcular folha de pagamento', 500);
    }
  }
}

export default new PayrollCalculatorService();