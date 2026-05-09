import { AssignCandidateError, assignCandidateToPositionService } from './positionService';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
    const txClient: any = {
        position: { findUnique: jest.fn() },
        candidate: { findUnique: jest.fn() },
        application: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    };
    const mockPrisma: any = {
        __tx: txClient,
        $transaction: jest.fn((fn: (tx: any) => Promise<unknown>) => fn(txClient)),
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

const prisma: any = new PrismaClient();
const tx = prisma.__tx;

const buildPosition = (overrides: Partial<any> = {}) => ({
    id: 10,
    status: 'Open',
    interviewFlow: {
        id: 1,
        interviewSteps: [
            { id: 100, orderIndex: 1 },
            { id: 200, orderIndex: 2 },
        ],
    },
    ...overrides,
});

beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((fn: any) => fn(tx));
});

describe('assignCandidateToPositionService', () => {
    it('happy path returns 201-shaped payload, picks lowest orderIndex step, interviewStepId === currentInterviewStep', async () => {
        tx.position.findUnique.mockResolvedValue(buildPosition());
        tx.candidate.findUnique.mockResolvedValue({ id: 5 });
        tx.application.findFirst.mockResolvedValue(null);
        tx.application.create.mockResolvedValue({
            id: 999,
            positionId: 10,
            candidateId: 5,
            applicationDate: new Date('2026-05-09T00:00:00Z'),
            currentInterviewStep: 100,
            notes: 'Referred',
        });

        const result = await assignCandidateToPositionService(10, { candidateId: 5, notes: 'Referred' });

        expect(result.currentInterviewStep).toBe(100);
        expect(result.interviewStepId).toBe(100);
        expect(result.interviewStepId).toBe(result.currentInterviewStep);
        expect(result.notes).toBe('Referred');
        expect(tx.application.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                positionId: 10,
                candidateId: 5,
                currentInterviewStep: 100,
                notes: 'Referred',
            }),
        });
    });

    it('throws POSITION_NOT_FOUND when position is null', async () => {
        tx.position.findUnique.mockResolvedValue(null);
        await expect(assignCandidateToPositionService(10, { candidateId: 5 })).rejects.toMatchObject({
            code: 'POSITION_NOT_FOUND',
        });
    });

    it('throws POSITION_CLOSED for status Closed and Hired', async () => {
        for (const status of ['Closed', 'Hired']) {
            jest.clearAllMocks();
            prisma.$transaction.mockImplementation((fn: any) => fn(tx));
            tx.position.findUnique.mockResolvedValue(buildPosition({ status }));
            await expect(assignCandidateToPositionService(10, { candidateId: 5 })).rejects.toMatchObject({
                code: 'POSITION_CLOSED',
            });
        }
    });

    it('throws CANDIDATE_NOT_FOUND when candidate is null', async () => {
        tx.position.findUnique.mockResolvedValue(buildPosition());
        tx.candidate.findUnique.mockResolvedValue(null);
        await expect(assignCandidateToPositionService(10, { candidateId: 5 })).rejects.toMatchObject({
            code: 'CANDIDATE_NOT_FOUND',
        });
    });

    it('throws NO_INTERVIEW_STEPS when interview flow has zero steps', async () => {
        tx.position.findUnique.mockResolvedValue(
            buildPosition({ interviewFlow: { id: 1, interviewSteps: [] } }),
        );
        tx.candidate.findUnique.mockResolvedValue({ id: 5 });
        await expect(assignCandidateToPositionService(10, { candidateId: 5 })).rejects.toMatchObject({
            code: 'NO_INTERVIEW_STEPS',
        });
    });

    it('throws DUPLICATE_APPLICATION when an Application already exists', async () => {
        tx.position.findUnique.mockResolvedValue(buildPosition());
        tx.candidate.findUnique.mockResolvedValue({ id: 5 });
        tx.application.findFirst.mockResolvedValue({ id: 42 });
        await expect(assignCandidateToPositionService(10, { candidateId: 5 })).rejects.toMatchObject({
            code: 'DUPLICATE_APPLICATION',
        });
        expect(tx.application.create).not.toHaveBeenCalled();
    });

    it('persists notes when provided; persists null when omitted', async () => {
        tx.position.findUnique.mockResolvedValue(buildPosition());
        tx.candidate.findUnique.mockResolvedValue({ id: 5 });
        tx.application.findFirst.mockResolvedValue(null);
        tx.application.create.mockResolvedValue({
            id: 1,
            positionId: 10,
            candidateId: 5,
            applicationDate: new Date(),
            currentInterviewStep: 100,
            notes: null,
        });

        await assignCandidateToPositionService(10, { candidateId: 5 });
        expect(tx.application.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ notes: null }),
        });

        jest.clearAllMocks();
        prisma.$transaction.mockImplementation((fn: any) => fn(tx));
        tx.position.findUnique.mockResolvedValue(buildPosition());
        tx.candidate.findUnique.mockResolvedValue({ id: 5 });
        tx.application.findFirst.mockResolvedValue(null);
        tx.application.create.mockResolvedValue({
            id: 1,
            positionId: 10,
            candidateId: 5,
            applicationDate: new Date(),
            currentInterviewStep: 100,
            notes: 'hi',
        });
        await assignCandidateToPositionService(10, { candidateId: 5, notes: 'hi' });
        expect(tx.application.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ notes: 'hi' }),
        });
    });

    it('uses prisma.$transaction exactly once on happy path', async () => {
        tx.position.findUnique.mockResolvedValue(buildPosition());
        tx.candidate.findUnique.mockResolvedValue({ id: 5 });
        tx.application.findFirst.mockResolvedValue(null);
        tx.application.create.mockResolvedValue({
            id: 1,
            positionId: 10,
            candidateId: 5,
            applicationDate: new Date(),
            currentInterviewStep: 100,
            notes: null,
        });
        await assignCandidateToPositionService(10, { candidateId: 5 });
        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('AssignCandidateError exposes code field', () => {
        const err = new AssignCandidateError('POSITION_NOT_FOUND', 'x');
        expect(err.code).toBe('POSITION_NOT_FOUND');
        expect(err).toBeInstanceOf(Error);
    });
});
