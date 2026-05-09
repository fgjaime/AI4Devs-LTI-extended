import { getCandidatesByPositionService, updatePositionService, removeCandidateFromPositionService } from './positionService';
import { PrismaClient } from '@prisma/client';
import { Position } from '../../domain/models/Position';

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    position: {
      findUnique: jest.fn(),
    },
    candidate: {
      findUnique: jest.fn(),
    },
    application: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('../../domain/models/Position', () => ({
  Position: {
    findOne: jest.fn(),
  },
}));

describe('getCandidatesByPositionService', () => {
  it('should return candidates with their average scores', async () => {
    const mockApplications = [
      {
        id: 1,
        positionId: 1,
        candidateId: 1,
        applicationDate: new Date(),
        currentInterviewStep: 1,
        notes: null,
        candidate: { firstName: 'John', lastName: 'Doe' },
        interviewStep: { name: 'Technical Interview' },
        interviews: [{ score: 5 }, { score: 3 }],
      },
    ];

    jest.spyOn(prisma.application, 'findMany').mockResolvedValue(mockApplications);

    const result = await getCandidatesByPositionService(1);
    expect(result).toEqual([
      {
        fullName: 'John Doe',
        currentInterviewStep: 'Technical Interview',
        candidateId: 1,
        applicationId: 1,
        averageScore: 4,
      },
    ]);
  });
});

describe('updatePositionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update position with partial data and return updated position', async () => {
    const mockSave = jest.fn().mockResolvedValue({
      id: 1,
      companyId: 1,
      interviewFlowId: 1,
      title: 'Updated Title',
      description: 'Original Description',
      status: 'Draft',
      isVisible: false,
      location: 'Location',
      jobDescription: 'JobDesc',
    });
    const mockPosition = {
      id: 1,
      companyId: 1,
      interviewFlowId: 1,
      title: 'Original Title',
      description: 'Original Description',
      status: 'Draft',
      isVisible: false,
      location: 'Location',
      jobDescription: 'JobDesc',
      salaryMin: undefined,
      salaryMax: undefined,
      applicationDeadline: undefined,
      save: mockSave,
    };
    (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);

    const result = await updatePositionService(1, { title: 'Updated Title' });

    expect(Position.findOne).toHaveBeenCalledWith(1);
    expect(mockPosition.title).toBe('Updated Title');
    expect(mockSave).toHaveBeenCalled();
    expect(result.title).toBe('Updated Title');
  });

  it('should throw Position not found when position does not exist', async () => {
    (Position.findOne as jest.Mock).mockResolvedValue(null);

    await expect(updatePositionService(99999, { title: 'Test' })).rejects.toThrow('Position not found');
    expect(Position.findOne).toHaveBeenCalledWith(99999);
  });

  it('should throw when salaryMax is less than salaryMin after merge', async () => {
    const mockSave = jest.fn();
    const mockPosition = {
      id: 1,
      companyId: 1,
      interviewFlowId: 1,
      title: 'Title',
      description: 'Desc',
      status: 'Draft',
      isVisible: false,
      location: 'Loc',
      jobDescription: 'JD',
      salaryMin: 50000,
      salaryMax: 80000,
      applicationDeadline: undefined,
      save: mockSave,
    };
    (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);

    await expect(
      updatePositionService(1, { salaryMin: 60000, salaryMax: 40000 })
    ).rejects.toThrow('salaryMax must be greater than or equal to salaryMin');

    expect(mockSave).not.toHaveBeenCalled();
  });
});

describe('removeCandidateFromPositionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove existing candidate-position relationship', async () => {
    jest.spyOn(prisma.position, 'findUnique').mockResolvedValue({ id: 10 } as any);
    jest.spyOn(prisma.candidate, 'findUnique').mockResolvedValue({ id: 20 } as any);
    jest.spyOn(prisma.application, 'findFirst').mockResolvedValue({ id: 100 } as any);
    const deleteSpy = jest.spyOn(prisma.application, 'delete').mockResolvedValue({ id: 100 } as any);

    await expect(removeCandidateFromPositionService(10, 20)).resolves.toBeUndefined();
    expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 100 } });
  });

  it('should throw not found when relation does not exist', async () => {
    jest.spyOn(prisma.position, 'findUnique').mockResolvedValue({ id: 10 } as any);
    jest.spyOn(prisma.candidate, 'findUnique').mockResolvedValue({ id: 20 } as any);
    jest.spyOn(prisma.application, 'findFirst').mockResolvedValue(null as any);

    await expect(removeCandidateFromPositionService(10, 20)).rejects.toThrow('Application relation not found');
  });
});

