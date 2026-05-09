import { updateCandidateStage, getAllCandidates, buildActiveProcesses } from './candidateService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    application: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    candidate: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('updateCandidateStage', () => {
  it('should update the candidate stage and return the updated application', async () => {
    const mockApplication = {
      id: 1,
      positionId: 1,
      candidateId: 1,
      currentInterviewStep: 1,
      applicationDate: new Date(),
      notes: null,
    };

    jest.spyOn(prisma.application, 'findFirst').mockResolvedValue(mockApplication);
    jest.spyOn(prisma.application, 'update').mockResolvedValue({
      ...mockApplication,
      currentInterviewStep: 2,
    });

    const result = await updateCandidateStage(1, 1, 2);
    expect(result).toEqual(expect.objectContaining({
      ...mockApplication,
      currentInterviewStep: 2,
    }));
  });
});

describe('getAllCandidates: validation', () => {
  beforeEach(() => {
    (prisma.candidate.findMany as jest.Mock).mockReset();
    (prisma.candidate.count as jest.Mock).mockReset();
    (prisma.candidate.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.candidate.count as jest.Mock).mockResolvedValue(0);
  });

  it('throws Invalid sort field when sort is not whitelisted', async () => {
    await expect(getAllCandidates({ sort: 'phone' as any })).rejects.toThrow('Invalid sort field');
  });

  it('throws Invalid order value when order is not asc or desc', async () => {
    await expect(getAllCandidates({ order: 'sideways' as any })).rejects.toThrow('Invalid order value');
  });

  it('passes lastName as a valid sort field', async () => {
    await getAllCandidates({ sort: 'lastName', order: 'asc' });
    const findManyArgs = (prisma.candidate.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyArgs.orderBy).toEqual({ lastName: 'asc' });
  });
});

describe('buildActiveProcesses', () => {
  const baseStep = { id: 10, name: 'Phone Screen', orderIndex: 1 };
  const interviewFlowSteps = [
    { id: 10, name: 'Phone Screen', orderIndex: 1 },
    { id: 11, name: 'Tech Interview', orderIndex: 2 },
    { id: 12, name: 'Onsite', orderIndex: 3 },
  ];

  it('returns [] when there are no applications', () => {
    expect(buildActiveProcesses([])).toEqual([]);
  });

  it('returns [] when no application points to an Open position', () => {
    const apps = [
      {
        id: 1,
        applicationDate: new Date('2025-01-01'),
        position: {
          id: 1, title: 'Eng', status: 'Closed',
          company: { id: 1, name: 'A' },
          interviewFlow: { interviewSteps: interviewFlowSteps },
        },
        interviewStep: baseStep,
      },
    ];
    expect(buildActiveProcesses(apps)).toEqual([]);
  });

  it('returns all Open applications (multi-process edge case)', () => {
    const apps = [
      {
        id: 2,
        applicationDate: new Date('2025-03-01'),
        position: {
          id: 2, title: 'Senior Eng', status: 'Open',
          company: { id: 5, name: 'Acme' },
          interviewFlow: { interviewSteps: interviewFlowSteps },
        },
        interviewStep: { id: 11, name: 'Tech Interview', orderIndex: 2 },
      },
      {
        id: 1,
        applicationDate: new Date('2025-01-01'),
        position: {
          id: 1, title: 'Eng', status: 'Open',
          company: { id: 5, name: 'Acme' },
          interviewFlow: { interviewSteps: interviewFlowSteps },
        },
        interviewStep: baseStep,
      },
    ];
    const result = buildActiveProcesses(apps);
    expect(result).toHaveLength(2);
    expect(result[0].applicationId).toBe(2);
    expect(result[1].applicationId).toBe(1);
  });

  it('returns only Open applications when mixed statuses present', () => {
    const apps = [
      {
        id: 2,
        applicationDate: new Date('2025-03-01'),
        position: {
          id: 2, title: 'Senior Eng', status: 'Open',
          company: { id: 5, name: 'Acme' },
          interviewFlow: { interviewSteps: interviewFlowSteps },
        },
        interviewStep: { id: 11, name: 'Tech Interview', orderIndex: 2 },
      },
      {
        id: 1,
        applicationDate: new Date('2025-01-01'),
        position: {
          id: 1, title: 'Old Role', status: 'Closed',
          company: { id: 5, name: 'Acme' },
          interviewFlow: { interviewSteps: interviewFlowSteps },
        },
        interviewStep: baseStep,
      },
    ];
    const result = buildActiveProcesses(apps);
    expect(result).toHaveLength(1);
    expect(result[0].applicationId).toBe(2);
  });

  it('skips entries where interviewStep is missing', () => {
    const apps = [
      {
        id: 3,
        applicationDate: new Date('2025-04-01'),
        position: {
          id: 1, title: 'Eng', status: 'Open',
          company: { id: 1, name: 'A' },
          interviewFlow: { interviewSteps: interviewFlowSteps },
        },
        interviewStep: null,
      },
    ];
    expect(buildActiveProcesses(apps)).toEqual([]);
  });
});

describe('getAllCandidates: list DTO shape', () => {
  beforeEach(() => {
    (prisma.candidate.findMany as jest.Mock).mockReset();
    (prisma.candidate.count as jest.Mock).mockReset();
  });

  it('excludes educations/workExperiences/resumes and includes activeProcesses array', async () => {
    const interviewFlowSteps = [
      { id: 10, name: 'Phone Screen', orderIndex: 1 },
      { id: 11, name: 'Tech Interview', orderIndex: 2 },
    ];
    (prisma.candidate.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1,
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '555-0100',
        address: '1 Analytical St',
        applications: [
          {
            id: 9,
            applicationDate: new Date('2025-05-01'),
            position: {
              id: 7, title: 'Engineer', status: 'Open',
              company: { id: 3, name: 'AcmeCo' },
              interviewFlow: { interviewSteps: interviewFlowSteps },
            },
            interviewStep: { id: 10, name: 'Phone Screen', orderIndex: 1 },
          },
        ],
      },
    ]);
    (prisma.candidate.count as jest.Mock).mockResolvedValue(1);

    const result = await getAllCandidates({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    const item = result.data[0] as any;
    expect(item).toEqual({
      id: 1,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '555-0100',
      address: '1 Analytical St',
      activeProcesses: [
        {
          applicationId: 9,
          applicationDate: new Date('2025-05-01').toISOString(),
          position: {
            id: 7,
            title: 'Engineer',
            status: 'Open',
            company: { id: 3, name: 'AcmeCo' },
          },
          currentStep: { id: 10, name: 'Phone Screen', orderIndex: 1 },
          totalSteps: 2,
        },
      ],
    });
    expect(item.educations).toBeUndefined();
    expect(item.workExperiences).toBeUndefined();
    expect(item.resumes).toBeUndefined();

    // Verify the prisma query was called with the correct nested select for applications
    const findManyArgs = (prisma.candidate.findMany as jest.Mock).mock.calls[0][0];
    expect(findManyArgs.include).toBeUndefined();
    expect(findManyArgs.select.applications).toBeDefined();
    expect(findManyArgs.select.applications.orderBy).toEqual({ applicationDate: 'desc' });
    expect(findManyArgs.select.applications.select.interviewStep).toBeDefined();
    expect(findManyArgs.select.applications.select.position.select.company).toBeDefined();
    expect(findManyArgs.select.applications.select.position.select.interviewFlow.select.interviewSteps).toBeDefined();
  });
});
