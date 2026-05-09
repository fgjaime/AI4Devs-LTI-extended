import express from 'express';
import request from 'supertest';
import positionRoutes from './positionRoutes';
import { removeCandidateFromPositionService } from '../application/services/positionService';
import { validateCandidatePositionDeletion } from '../application/validator';

jest.mock('../application/services/positionService', () => ({
  removeCandidateFromPositionService: jest.fn(),
  getCandidatesByPositionService: jest.fn(),
  getInterviewFlowByPositionService: jest.fn(),
  getAllPositionsService: jest.fn(),
  getCandidateNamesByPositionService: jest.fn(),
  getPositionByIdService: jest.fn(),
  updatePositionService: jest.fn(),
}));

jest.mock('../application/validator', () => ({
  validateCandidatePositionDeletion: jest.fn(),
  validatePositionUpdateData: jest.fn(),
}));

describe('positionRoutes delete candidate integration', () => {
  const app = express();
  app.use(express.json());
  app.use('/positions', positionRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 204 for an existing relation delete', async () => {
    (validateCandidatePositionDeletion as jest.Mock).mockImplementation(() => {});
    (removeCandidateFromPositionService as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete('/positions/2/candidates/2');

    expect(response.status).toBe(204);
    expect(validateCandidatePositionDeletion).toHaveBeenCalledWith(2, 2);
    expect(removeCandidateFromPositionService).toHaveBeenCalledWith(2, 2);
  });

  it('returns 400 for invalid params', async () => {
    (validateCandidatePositionDeletion as jest.Mock).mockImplementation(() => {
      throw new Error('positionId must be a positive integer');
    });

    const response = await request(app).delete('/positions/abc/candidates/2');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Validation error',
      error: 'positionId must be a positive integer',
    });
  });

  it('returns 404 for missing relation or resources', async () => {
    (validateCandidatePositionDeletion as jest.Mock).mockImplementation(() => {});
    (removeCandidateFromPositionService as jest.Mock).mockRejectedValue(
      new Error('Application relation not found')
    );

    const response = await request(app).delete('/positions/999999/candidates/999999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Not found',
      error: 'Application relation not found',
    });
  });
});
