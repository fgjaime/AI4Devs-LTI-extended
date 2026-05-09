import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { Application } from '../../domain/models/Application';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALLOWED_SORT_FIELDS = ['firstName', 'lastName', 'email'] as const;
type AllowedSort = typeof ALLOWED_SORT_FIELDS[number];
const ALLOWED_ORDER = ['asc', 'desc'] as const;
type AllowedOrder = typeof ALLOWED_ORDER[number];

export interface ActiveProcessDTO {
    applicationId: number;
    applicationDate: string;
    position: {
        id: number;
        title: string;
        status: string;
        company: { id: number; name: string };
    };
    currentStep: { id: number; name: string; orderIndex: number };
    totalSteps: number;
}

export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData);
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData);
    try {
        const savedCandidate = await candidate.save();
        const candidateId = savedCandidate.id;

        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.educations.push(educationModel);
            }
        }

        if (candidateData.workExperiences) {
            for (const experience of candidateData.workExperiences) {
                const experienceModel = new WorkExperience(experience);
                experienceModel.candidateId = candidateId;
                await experienceModel.save();
                candidate.workExperiences.push(experienceModel);
            }
        }

        if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
            const resumeModel = new Resume(candidateData.cv);
            resumeModel.candidateId = candidateId;
            await resumeModel.save();
            candidate.resumes.push(resumeModel);
        }
        return savedCandidate;
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};

export const findCandidateById = async (id: number): Promise<Candidate | null> => {
    try {
        const candidate = await Candidate.findOne(id);
        return candidate;
    } catch (error) {
        console.error('Error al buscar el candidato:', error);
        throw new Error('Error al recuperar el candidato');
    }
};

export const updateCandidateStage = async (id: number, applicationIdNumber: number, currentInterviewStep: number) => {
    try {
        const application = await Application.findOneByPositionCandidateId(applicationIdNumber, id);
        if (!application) {
            throw new Error('Application not found');
        }
        application.currentInterviewStep = currentInterviewStep;
        await application.save();
        return application;
    } catch (error: any) {
        throw new Error(error);
    }
};

/**
 * Returns all applications on Open positions for a candidate, ordered by
 * applicationDate desc (Prisma ordering is preserved). Applications missing
 * the interviewStep relation are skipped as a data-integrity guard.
 * Returns [] when no open applications exist.
 */
export const buildActiveProcesses = (applications: any[] | undefined | null): ActiveProcessDTO[] => {
    if (!applications || applications.length === 0) return [];
    const result: ActiveProcessDTO[] = [];
    for (const app of applications) {
        if (!app || !app.position || app.position.status !== 'Open') continue;
        if (!app.interviewStep) continue;
        const totalSteps = app.position?.interviewFlow?.interviewSteps?.length ?? 0;
        const applicationDate = app.applicationDate instanceof Date
            ? app.applicationDate.toISOString()
            : new Date(app.applicationDate).toISOString();
        result.push({
            applicationId: app.id,
            applicationDate,
            position: {
                id: app.position.id,
                title: app.position.title,
                status: app.position.status,
                company: { id: app.position.company.id, name: app.position.company.name },
            },
            currentStep: {
                id: app.interviewStep.id,
                name: app.interviewStep.name,
                orderIndex: app.interviewStep.orderIndex,
            },
            totalSteps,
        });
    }
    return result;
};

export const getAllCandidates = async (options: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}) => {
    try {
        const { page = 1, limit = 10, search, sort = 'firstName', order = 'asc' } = options;

        if (page < 1) throw new Error('Page number must be greater than 0');
        if (limit < 1) throw new Error('Limit must be greater than 0');
        if (!ALLOWED_SORT_FIELDS.includes(sort as AllowedSort)) throw new Error('Invalid sort field');
        if (!ALLOWED_ORDER.includes(order as AllowedOrder)) throw new Error('Invalid order value');

        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [candidates, total] = await Promise.all([
            prisma.candidate.findMany({
                where,
                orderBy: { [sort]: order },
                skip,
                take: limit,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    address: true,
                    applications: {
                        orderBy: { applicationDate: 'desc' },
                        select: {
                            id: true,
                            applicationDate: true,
                            position: {
                                select: {
                                    id: true,
                                    title: true,
                                    status: true,
                                    company: { select: { id: true, name: true } },
                                    interviewFlow: {
                                        select: {
                                            interviewSteps: {
                                                select: { id: true, name: true, orderIndex: true },
                                                orderBy: { orderIndex: 'asc' },
                                            },
                                        },
                                    },
                                },
                            },
                            interviewStep: { select: { id: true, name: true, orderIndex: true } },
                        },
                    },
                },
            }),
            prisma.candidate.count({ where }),
        ]);

        const data = candidates.map((c: any) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            phone: c.phone,
            address: c.address,
            activeProcesses: buildActiveProcesses(c.applications),
        }));

        return {
            data,
            metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    } catch (error: any) {
        console.error('Error retrieving candidates:', error);
        throw new Error(error.message || 'Error retrieving candidates');
    }
};
