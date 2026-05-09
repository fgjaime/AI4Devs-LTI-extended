import { PrismaClient } from '@prisma/client';
import { Position } from '../../domain/models/Position';

const prisma = new PrismaClient();

export type AssignCandidateErrorCode =
    | 'POSITION_NOT_FOUND'
    | 'CANDIDATE_NOT_FOUND'
    | 'POSITION_CLOSED'
    | 'NO_INTERVIEW_STEPS'
    | 'DUPLICATE_APPLICATION';

export class AssignCandidateError extends Error {
    public readonly code: AssignCandidateErrorCode;

    constructor(code: AssignCandidateErrorCode, message: string) {
        super(message);
        this.code = code;
        this.name = 'AssignCandidateError';
        Object.setPrototypeOf(this, AssignCandidateError.prototype);
    }
}

const CLOSED_POSITION_STATUSES = ['Closed', 'Hired'];

export interface AssignCandidatePayload {
    candidateId: number;
    notes?: string | null;
}

export const assignCandidateToPositionService = async (
    positionId: number,
    payload: AssignCandidatePayload,
) => {
    return prisma.$transaction(async (tx: any) => {
        const position = await tx.position.findUnique({
            where: { id: positionId },
            include: {
                interviewFlow: {
                    include: {
                        interviewSteps: { orderBy: { orderIndex: 'asc' } },
                    },
                },
            },
        });

        if (!position) {
            throw new AssignCandidateError('POSITION_NOT_FOUND', `Position ${positionId} not found`);
        }

        if (CLOSED_POSITION_STATUSES.includes(position.status)) {
            throw new AssignCandidateError(
                'POSITION_CLOSED',
                `Position ${positionId} is ${position.status} and cannot accept candidates`,
            );
        }

        const candidate = await tx.candidate.findUnique({ where: { id: payload.candidateId } });
        if (!candidate) {
            throw new AssignCandidateError(
                'CANDIDATE_NOT_FOUND',
                `Candidate ${payload.candidateId} not found`,
            );
        }

        const steps = position.interviewFlow?.interviewSteps ?? [];
        if (steps.length === 0) {
            throw new AssignCandidateError(
                'NO_INTERVIEW_STEPS',
                `Position ${positionId} has no configured interview steps`,
            );
        }

        const firstStep = steps[0];

        const existing = await tx.application.findFirst({
            where: { positionId, candidateId: payload.candidateId },
        });
        if (existing) {
            throw new AssignCandidateError(
                'DUPLICATE_APPLICATION',
                `Candidate ${payload.candidateId} is already assigned to position ${positionId}`,
            );
        }

        const created = await tx.application.create({
            data: {
                positionId,
                candidateId: payload.candidateId,
                applicationDate: new Date(),
                currentInterviewStep: firstStep.id,
                notes: payload.notes ?? null,
            },
        });

        return {
            id: created.id,
            positionId: created.positionId,
            candidateId: created.candidateId,
            applicationDate: created.applicationDate,
            currentInterviewStep: created.currentInterviewStep,
            interviewStepId: created.currentInterviewStep,
            notes: created.notes,
        };
    });
};

const calculateAverageScore = (interviews: any[]) => {
    if (interviews.length === 0) return 0;
    const totalScore = interviews.reduce((acc, interview) => acc + (interview.score || 0), 0);
    return totalScore / interviews.length;
};

export const getCandidatesByPositionService = async (positionId: number) => {
    try {
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true,
                interviews: true,
                interviewStep: true
            }
        });

        return applications.map(app => ({
            fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
            currentInterviewStep: app.interviewStep.name,
            candidateId: app.candidateId,
            applicationId: app.id,
            averageScore: calculateAverageScore(app.interviews)
        }));
    } catch (error) {
        console.error('Error retrieving candidates by position:', error);
        throw new Error('Error retrieving candidates by position');
    }
};

export const getInterviewFlowByPositionService = async (positionId: number) => {
    const positionWithInterviewFlow = await prisma.position.findUnique({
        where: { id: positionId },
        include: {
            interviewFlow: {
                include: {
                    interviewSteps: true
                }
            }
        }
    });

    if (!positionWithInterviewFlow) {
        throw new Error('Position not found');
    }

    // Formatear la respuesta para incluir el nombre de la posición y el flujo de entrevistas
    return {
        positionName: positionWithInterviewFlow.title,
        interviewFlow: {
            id: positionWithInterviewFlow.interviewFlow.id,
            description: positionWithInterviewFlow.interviewFlow.description,
            interviewSteps: positionWithInterviewFlow.interviewFlow.interviewSteps.map(step => ({
                id: step.id,
                interviewFlowId: step.interviewFlowId,
                interviewTypeId: step.interviewTypeId,
                name: step.name,
                orderIndex: step.orderIndex
            }))
        }
    };
};

export const getAllPositionsService = async () => {
    try {
        return await prisma.position.findMany({
            where: { isVisible: true }
        });
    } catch (error) {
        console.error('Error retrieving all positions:', error);
        throw new Error('Error retrieving all positions');
    }
};

export const getPositionByIdService = async (positionId: number) => {
    try {
        const position = await Position.findOne(positionId);
        if (!position) {
            throw new Error('Position not found');
        }
        return position;
    } catch (error) {
        console.error('Error retrieving position by ID:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error retrieving position by ID');
    }
};

export const getCandidateNamesByPositionService = async (positionId: number) => {
    try {
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true
            }
        });

        return applications.map(app => ({
            candidateId: app.candidateId,
            fullName: `${app.candidate.firstName} ${app.candidate.lastName}`
        }));
    } catch (error) {
        console.error('Error retrieving candidate names by position:', error);
        throw new Error('Error retrieving candidate names by position');
    }
};

const UPDATABLE_FIELDS = [
    'title', 'description', 'status', 'isVisible', 'location', 'jobDescription',
    'requirements', 'responsibilities', 'salaryMin', 'salaryMax', 'employmentType',
    'benefits', 'companyDescription', 'applicationDeadline', 'contactInfo'
] as const;

export const updatePositionService = async (positionId: number, updateData: Record<string, unknown>): Promise<any> => {
    try {
        const existingPosition = await Position.findOne(positionId);
        if (!existingPosition) {
            throw new Error('Position not found');
        }

        for (const field of UPDATABLE_FIELDS) {
            if (updateData[field] !== undefined) {
                (existingPosition as any)[field] = field === 'applicationDeadline' && typeof updateData[field] === 'string'
                    ? new Date(updateData[field] as string)
                    : updateData[field];
            }
        }

        if (existingPosition.salaryMin !== undefined && existingPosition.salaryMax !== undefined) {
            if (existingPosition.salaryMax < existingPosition.salaryMin) {
                throw new Error('salaryMax must be greater than or equal to salaryMin');
            }
        }

        const updated = await existingPosition.save();
        return updated;
    } catch (error) {
        if (error instanceof Error && error.message === 'Position not found') {
            throw error;
        }
        if (error instanceof Error && error.message.includes('salaryMax')) {
            throw error;
        }
        console.error('Error updating position:', error);
        throw new Error('Error updating position');
    }
};