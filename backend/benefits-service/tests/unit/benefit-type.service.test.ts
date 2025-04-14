import benefitTypeService from '../../src/services/benefit-type.service';
import benefitTypeRepository from '../../src/repositories/benefit-type.repository';
import { AppError } from '../../src/utils/error-handler';

// Mock do repositório
jest.mock('../../src/repositories/benefit-type.repository');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn()
}));

describe('BenefitTypeService', () => {
  const mockBenefitType = {
    _id: '60d21b4667d0d8992e610c85',
    name: 'Vale Transporte',
    description: 'Auxílio para deslocamento',
    hasDiscount: true,
    discountPercentage: 6,
    defaultValue: 200,
    status: 'active',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBenefitTypeById', () => {
    it('should return a benefit type when found', async () => {
      (benefitTypeRepository.findById as jest.Mock).mockResolvedValue(mockBenefitType);
      
      const result = await benefitTypeService.getBenefitTypeById('60d21b4667d0d8992e610c85');
      
      expect(result).toEqual(mockBenefitType);
      expect(benefitTypeRepository.findById).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');
    });

    it('should throw an error when benefit type is not found', async () => {
      (benefitTypeRepository.findById as jest.Mock).mockResolvedValue(null);
      
      await expect(
        benefitTypeService.getBenefitTypeById('nonexistent-id')
      ).rejects.toThrow(new AppError('Benefit type not found', 404));
      
      expect(benefitTypeRepository.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('createBenefitType', () => {
    it('should create a new benefit type', async () => {
      const newBenefitTypeData = {
        name: 'Novo Benefício',
        description: 'Descrição do novo benefício',
        hasDiscount: false,
        defaultValue: 100
      };
      
      (benefitTypeRepository.create as jest.Mock).mockResolvedValue({
        _id: '60d21b4667d0d8992e610c86',
        ...newBenefitTypeData,
        status: 'active'
      });
      
      const result = await benefitTypeService.createBenefitType(newBenefitTypeData);
      
      expect(result).toHaveProperty('_id', '60d21b4667d0d8992e610c86');
      expect(result).toHaveProperty('name', 'Novo Benefício');
      expect(benefitTypeRepository.create).toHaveBeenCalledWith(newBenefitTypeData);
    });
  });
});