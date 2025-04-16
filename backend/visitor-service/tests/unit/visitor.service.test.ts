import { VisitorService } from '../../src/services/visitor.service';
import { VisitorRepository } from '../../src/repositories/visitor.repository';
import { AppError } from '../../src/utils/error-handler';

// Mock do VisitorRepository
jest.mock('../../src/repositories/visitor.repository');

describe('VisitorService', () => {
  let visitorService: VisitorService;
  let mockVisitorRepository: jest.Mocked<VisitorRepository>;

  beforeEach(() => {
    mockVisitorRepository = new VisitorRepository() as jest.Mocked<VisitorRepository>;
    visitorService = new VisitorService();
    (visitorService as any).visitorRepository = mockVisitorRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVisitors', () => {
    it('should return all visitors', async () => {
      const mockVisitors = [
        { _id: '1', name: 'Test User 1', rg: '123', cpf: '12345678901', phone: '123456789', email: 'test1@example.com', address: 'Test Address 1', logs: [], createdAt: new Date() },
        { _id: '2', name: 'Test User 2', rg: '456', cpf: '98765432109', phone: '987654321', email: 'test2@example.com', address: 'Test Address 2', logs: [], createdAt: new Date() }
      ];

      mockVisitorRepository.findAll.mockResolvedValue(mockVisitors as any);

      const result = await visitorService.getAllVisitors();

      expect(mockVisitorRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  // Adicione mais testes aqui
});