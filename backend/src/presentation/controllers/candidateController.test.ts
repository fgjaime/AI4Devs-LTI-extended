import { updateCandidateStageController, getAllCandidatesController } from './candidateController';
import { Request, Response } from 'express';
import { updateCandidateStage, getAllCandidates } from '../../application/services/candidateService';

jest.mock('../../application/services/candidateService');

describe('updateCandidateStageController', () => {
    it('should return 200 and updated candidate stage', async () => {
      const req = { params: { id: '1' }, body: { applicationId: 1, currentInterviewStep: 2 } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
  
      (updateCandidateStage as jest.Mock).mockResolvedValue({
        id: 1,
        applicationId: 1,
        candidateId: 1,
        currentInterviewStep: 2,
      });
  
      await updateCandidateStageController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Candidate stage updated successfully',
        data: {
          id: 1,
          applicationId: 1,
          candidateId: 1,
          currentInterviewStep: 2,
        },
      });
    });
  });

describe('getAllCandidatesController', () => {
  it('returns 400 when service throws Invalid sort field', async () => {
    const req = { query: { sort: 'phone' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    (getAllCandidates as jest.Mock).mockRejectedValue(new Error('Invalid sort field'));

    await getAllCandidatesController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid sort field' });
  });

  it('returns 400 when service throws Invalid order value', async () => {
    const req = { query: { order: 'sideways' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    (getAllCandidates as jest.Mock).mockRejectedValue(new Error('Invalid order value'));

    await getAllCandidatesController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid order value' });
  });
});