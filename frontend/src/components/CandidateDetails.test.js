import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CandidateDetails from './CandidateDetails';

const translate = (key) => key;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: translate
  })
}));

jest.mock('../services/interviewService', () => ({
  updateInterview: jest.fn(),
  deleteInterview: jest.fn()
}));

describe('CandidateDetails', () => {
  const originalFetch = global.fetch;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = window.matchMedia || (() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));

    global.fetch = jest.fn((url) => {
      if (String(url).includes('/employees')) {
        return Promise.resolve({
          json: () => Promise.resolve([])
        });
      }

      return Promise.resolve({
        json: () =>
          Promise.resolve({
            id: 1,
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            phone: '123456789',
            address: 'Test Street',
            educations: [],
            workExperiences: [],
            resumes: [],
            applications: []
          })
      });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    window.matchMedia = originalMatchMedia;
    jest.clearAllMocks();
  });

  it('adds the candidate-details-offcanvas class to offcanvas', async () => {
    render(<CandidateDetails candidate={{ id: 1 }} onClose={jest.fn()} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const offcanvas = screen.getByRole('dialog');
    expect(offcanvas.classList.contains('candidate-details-offcanvas')).toBe(true);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<CandidateDetails candidate={{ id: 1 }} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
