import React from 'react';
import { act } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CandidateProcessConsultation from './CandidateProcessConsultation';
import { getCandidateById, getCandidates } from '../services/candidateService';

jest.mock('../services/candidateService', () => ({
  getCandidates: jest.fn(),
  getCandidateById: jest.fn()
}));

const listPayload = {
  data: [
    {
      id: 10,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '555-0011',
      applications: [
        {
          id: 100,
          position: { title: 'Backend Engineer' },
          applicationDate: '2026-01-10T00:00:00.000Z',
          currentInterviewStep: 2,
          interviews: [{ id: 900, interviewDate: '2026-01-15T10:00:00.000Z', result: 'Passed' }]
        }
      ]
    },
    {
      id: 11,
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@example.com',
      phone: null,
      applications: []
    }
  ],
  metadata: { total: 2, page: 1, limit: 10, totalPages: 1 }
};

describe('CandidateProcessConsultation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCandidates.mockResolvedValue(listPayload);
  });

  it('renders candidates and process summary', async () => {
    render(
      <MemoryRouter>
        <CandidateProcessConsultation />
      </MemoryRouter>
    );

    expect(await screen.findByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('Alan Turing')).toBeTruthy();
    expect(screen.getByText('Backend Engineer', { exact: false })).toBeTruthy();
    expect(screen.getByText('This candidate has no process participation yet.')).toBeTruthy();
  });

  it('filters candidates by process status', async () => {
    render(
      <MemoryRouter>
        <CandidateProcessConsultation />
      </MemoryRouter>
    );

    await screen.findByText('Ada Lovelace');

    fireEvent.change(screen.getByDisplayValue('All statuses'), {
      target: { value: 'Passed' }
    });

    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.queryByText('Alan Turing')).toBeNull();
  });

  it('applies search term with debounce', async () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter>
        <CandidateProcessConsultation />
      </MemoryRouter>
    );

    await screen.findByText('Ada Lovelace');

    fireEvent.change(screen.getByPlaceholderText('Search by name or email'), {
      target: { value: 'Ada' }
    });

    act(() => {
      jest.advanceTimersByTime(320);
    });

    await waitFor(() => {
      expect(getCandidates).toHaveBeenLastCalledWith({ page: 1, limit: 10, search: 'Ada' });
    });

    jest.useRealTimers();
  });

  it('opens process detail and shows interview timeline', async () => {
    getCandidateById.mockResolvedValueOnce({
      id: 10,
      firstName: 'Ada',
      lastName: 'Lovelace',
      applications: [
        {
          id: 100,
          position: { title: 'Backend Engineer' },
          currentInterviewStep: 2,
          interviews: [
            {
              id: 900,
              interviewDate: '2026-01-15T10:00:00.000Z',
              result: 'Passed',
              score: 5,
              notes: 'Excellent communication',
              interviewStep: { name: 'Technical Interview' }
            }
          ]
        }
      ]
    });

    render(
      <MemoryRouter>
        <CandidateProcessConsultation />
      </MemoryRouter>
    );

    await screen.findByText('Ada Lovelace');
    fireEvent.click(screen.getByRole('button', { name: 'View detail' }));

    expect(await screen.findByText('Process detail')).toBeTruthy();
    expect(await screen.findByText('Technical Interview')).toBeTruthy();
    expect(screen.getByText(/Excellent communication/)).toBeTruthy();
  });
});
