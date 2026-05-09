jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

import { positionService } from '../positionService';

const mockAxiosGet = jest.fn();
const mockAxiosDelete = jest.fn();

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const axiosMock = require('axios');
  axiosMock.default.get = mockAxiosGet;
  axiosMock.get = mockAxiosGet;
  axiosMock.default.delete = mockAxiosDelete;
  axiosMock.delete = mockAxiosDelete;
});

const basePosition = {
  id: 1,
  title: 'Test Position',
  description: 'desc',
  contactInfo: 'manager@example.com',
  applicationDeadline: '2026-12-31T00:00:00Z',
  isVisible: true,
};

describe('positionService — legacy status normalization', () => {
  beforeEach(() => {
    mockAxiosGet.mockReset();
    mockAxiosDelete.mockReset();
  });

  describe('getAllPositions', () => {
    it('maps "Contratado" → "Hired"', async () => {
      mockAxiosGet.mockResolvedValue({ data: [{ ...basePosition, status: 'Contratado' }] });
      const positions = await positionService.getAllPositions();
      expect(positions[0].status).toBe('Hired');
    });

    it('maps "Cerrado" → "Closed"', async () => {
      mockAxiosGet.mockResolvedValue({ data: [{ ...basePosition, status: 'Cerrado' }] });
      const positions = await positionService.getAllPositions();
      expect(positions[0].status).toBe('Closed');
    });

    it('maps "Borrador" → "Draft"', async () => {
      mockAxiosGet.mockResolvedValue({ data: [{ ...basePosition, status: 'Borrador' }] });
      const positions = await positionService.getAllPositions();
      expect(positions[0].status).toBe('Draft');
    });

    it('leaves canonical English statuses unchanged', async () => {
      for (const status of ['Draft', 'Open', 'Closed', 'Hired']) {
        mockAxiosGet.mockResolvedValue({ data: [{ ...basePosition, status }] });
        const positions = await positionService.getAllPositions();
        expect(positions[0].status).toBe(status);
      }
    });
  });

  describe('getPositionById', () => {
    it('maps "Contratado" → "Hired"', async () => {
      mockAxiosGet.mockResolvedValue({ data: { ...basePosition, status: 'Contratado' } });
      const position = await positionService.getPositionById(1);
      expect(position.status).toBe('Hired');
    });

    it('maps "Cerrado" → "Closed"', async () => {
      mockAxiosGet.mockResolvedValue({ data: { ...basePosition, status: 'Cerrado' } });
      const position = await positionService.getPositionById(1);
      expect(position.status).toBe('Closed');
    });

    it('maps "Borrador" → "Draft"', async () => {
      mockAxiosGet.mockResolvedValue({ data: { ...basePosition, status: 'Borrador' } });
      const position = await positionService.getPositionById(1);
      expect(position.status).toBe('Draft');
    });
  });

  describe('removeCandidateFromPosition', () => {
    it('calls delete endpoint with position and candidate ids', async () => {
      mockAxiosDelete.mockResolvedValue({ status: 204 });
      await positionService.removeCandidateFromPosition(11, 22);
      expect(mockAxiosDelete).toHaveBeenCalledWith('http://localhost:3010/positions/11/candidates/22');
    });
  });
});
