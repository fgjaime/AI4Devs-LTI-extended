import { addCandidateToPosition } from './positionController';
import { Request, Response } from 'express';
import {
    assignCandidateToPositionService,
    AssignCandidateError,
} from '../../application/services/positionService';
import { validateAssignCandidateToPositionData } from '../../application/validator';

jest.mock('../../application/services/positionService', () => {
    class AssignCandidateErrorMock extends Error {
        public readonly code: string;
        constructor(code: string, message: string) {
            super(message);
            this.code = code;
            this.name = 'AssignCandidateError';
            Object.setPrototypeOf(this, AssignCandidateErrorMock.prototype);
        }
    }
    return {
        assignCandidateToPositionService: jest.fn(),
        AssignCandidateError: AssignCandidateErrorMock,
    };
});
jest.mock('../../application/validator');

describe('addCandidateToPosition controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn();
        mockResponse = { status: mockStatus, json: mockJson };
        (validateAssignCandidateToPositionData as jest.Mock).mockImplementation(() => undefined);
    });

    it('returns 400 on non-numeric :id', async () => {
        mockRequest = { params: { id: 'abc' }, body: { candidateId: 1 } };
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ code: 'VALIDATION_ERROR' }));
    });

    it('returns 400 when validator throws (missing candidateId)', async () => {
        mockRequest = { params: { id: '1' }, body: {} };
        (validateAssignCandidateToPositionData as jest.Mock).mockImplementation(() => {
            throw new Error('candidateId is required');
        });
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'VALIDATION_ERROR', error: 'candidateId is required' }),
        );
    });

    it('returns 201 with body returned by the service on happy path', async () => {
        const responseBody = {
            id: 99,
            positionId: 1,
            candidateId: 5,
            applicationDate: new Date('2026-05-09'),
            currentInterviewStep: 100,
            interviewStepId: 100,
            notes: null,
        };
        mockRequest = { params: { id: '1' }, body: { candidateId: 5 } };
        (assignCandidateToPositionService as jest.Mock).mockResolvedValue(responseBody);
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(assignCandidateToPositionService).toHaveBeenCalledWith(1, { candidateId: 5, notes: undefined });
        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith(responseBody);
    });

    it('returns 404 on POSITION_NOT_FOUND', async () => {
        mockRequest = { params: { id: '1' }, body: { candidateId: 5 } };
        (assignCandidateToPositionService as jest.Mock).mockRejectedValue(
            new (AssignCandidateError as any)('POSITION_NOT_FOUND', 'not found'),
        );
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ code: 'POSITION_NOT_FOUND' }));
    });

    it('returns 404 on CANDIDATE_NOT_FOUND', async () => {
        mockRequest = { params: { id: '1' }, body: { candidateId: 5 } };
        (assignCandidateToPositionService as jest.Mock).mockRejectedValue(
            new (AssignCandidateError as any)('CANDIDATE_NOT_FOUND', 'not found'),
        );
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ code: 'CANDIDATE_NOT_FOUND' }));
    });

    it('returns 409 on POSITION_CLOSED', async () => {
        mockRequest = { params: { id: '1' }, body: { candidateId: 5 } };
        (assignCandidateToPositionService as jest.Mock).mockRejectedValue(
            new (AssignCandidateError as any)('POSITION_CLOSED', 'closed'),
        );
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(409);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ code: 'POSITION_CLOSED' }));
    });

    it('returns 409 on DUPLICATE_APPLICATION', async () => {
        mockRequest = { params: { id: '1' }, body: { candidateId: 5 } };
        (assignCandidateToPositionService as jest.Mock).mockRejectedValue(
            new (AssignCandidateError as any)('DUPLICATE_APPLICATION', 'dup'),
        );
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(409);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ code: 'DUPLICATE_APPLICATION' }));
    });

    it('returns 422 on NO_INTERVIEW_STEPS', async () => {
        mockRequest = { params: { id: '1' }, body: { candidateId: 5 } };
        (assignCandidateToPositionService as jest.Mock).mockRejectedValue(
            new (AssignCandidateError as any)('NO_INTERVIEW_STEPS', 'no steps'),
        );
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(422);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ code: 'NO_INTERVIEW_STEPS' }));
    });

    it('returns 500 on unexpected error', async () => {
        mockRequest = { params: { id: '1' }, body: { candidateId: 5 } };
        (assignCandidateToPositionService as jest.Mock).mockRejectedValue(new Error('boom'));
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ code: 'INTERNAL_ERROR' }));
    });

    it('error response body always includes code field', async () => {
        mockRequest = { params: { id: '1' }, body: { candidateId: 5 } };
        (assignCandidateToPositionService as jest.Mock).mockRejectedValue(
            new (AssignCandidateError as any)('DUPLICATE_APPLICATION', 'dup'),
        );
        await addCandidateToPosition(mockRequest as Request, mockResponse as Response);
        const body = mockJson.mock.calls[0][0];
        expect(body).toHaveProperty('code');
        expect(typeof body.code).toBe('string');
    });
});
