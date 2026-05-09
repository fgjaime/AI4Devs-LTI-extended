import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CandidateDetails from './CandidateDetails';
import { positionService } from '../services/positionService';

jest.mock('react-bootstrap', () => {
  const ReactLib = require('react');
  const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
  const Alert = ({ children, ...props }) => <div {...props}>{children}</div>;
  const Modal = ({ show, children }) => (show ? <div>{children}</div> : null);
  Modal.Header = ({ children }) => <div>{children}</div>;
  Modal.Title = ({ children }) => <div>{children}</div>;
  Modal.Body = ({ children }) => <div>{children}</div>;
  Modal.Footer = ({ children }) => <div>{children}</div>;
  const Offcanvas = ({ show, children }) => (show ? <div>{children}</div> : null);
  Offcanvas.Header = ({ children }) => <div>{children}</div>;
  Offcanvas.Title = ({ children }) => <div>{children}</div>;
  Offcanvas.Body = ({ children }) => <div>{children}</div>;
  const Form = ({ children, ...props }) => <form {...props}>{children}</form>;
  Form.Group = ({ children }) => <div>{children}</div>;
  Form.Label = ({ children }) => <label>{children}</label>;
  Form.Text = ({ children }) => <small>{children}</small>;
  Form.Control = ({ as, children, ...props }) =>
    as === 'textarea' ? <textarea {...props}>{children}</textarea> : <input {...props}>{children}</input>;
  Form.Control.Feedback = ({ children }) => <div>{children}</div>;
  Form.Select = ({ children, ...props }) => <select {...props}>{children}</select>;
  return {
    Button,
    Alert,
    Modal,
    Offcanvas,
    Form,
  };
});

const tMock = (key) => key;
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: tMock,
  }),
}));

jest.mock('../services/interviewService', () => ({
  createInterview: jest.fn(),
  updateInterview: jest.fn(),
  deleteInterview: jest.fn(),
}));

jest.mock('../services/positionService', () => ({
  positionService: {
    removeCandidateFromPosition: jest.fn(),
  },
}));

const candidateProp = { id: 2, applicationId: 11 };

const candidateDetailsPayload = {
  id: 2,
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '123123123',
  address: 'Street 1',
  educations: [],
  workExperiences: [],
  resumes: [],
  applications: [
    {
      id: 3,
      applicationDate: '2025-06-30T14:21:16.422Z',
      position: { id: 1, title: 'Senior Full-Stack Engineer' },
      interviews: [],
    },
    {
      id: 11,
      applicationDate: '2026-05-09T07:16:44.402Z',
      position: { id: 2, title: 'Data Scientist' },
      interviews: [],
    },
  ],
};

const refreshedPayload = {
  ...candidateDetailsPayload,
  applications: [candidateDetailsPayload.applications[0]],
};

const createFetchResponse = (payload) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(payload),
  });

describe('CandidateDetails remove application flow', () => {
  beforeAll(() => {
    const matchMediaMock = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMediaMock });
    global.matchMedia = matchMediaMock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (url.includes('/employees')) return createFetchResponse([]);
      if (url.includes('/interviewFlow')) {
        return createFetchResponse({
          interviewFlow: { interviewFlow: { interviewSteps: [] } },
        });
      }
      return createFetchResponse(candidateDetailsPayload);
    });
  });

  it('does not call API when user cancels the modal', async () => {
    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} onApplicationRemoved={jest.fn()} />);

    const removeButtons = await screen.findAllByLabelText('Remove application');
    fireEvent.click(removeButtons[1]);
    expect(screen.getByText('Remove application')).not.toBeNull();

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(positionService.removeCandidateFromPosition).not.toHaveBeenCalled();
    });
  });

  it('confirms removal and notifies parent to refresh/close', async () => {
    const onApplicationRemoved = jest.fn().mockResolvedValue(undefined);
    positionService.removeCandidateFromPosition.mockResolvedValue(undefined);
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => createFetchResponse(candidateDetailsPayload))
      .mockImplementationOnce(() => createFetchResponse([]))
      .mockImplementationOnce(() =>
        createFetchResponse({ interviewFlow: { interviewFlow: { interviewSteps: [] } } })
      )
      .mockImplementationOnce(() => createFetchResponse(refreshedPayload));

    render(
      <CandidateDetails candidate={candidateProp} onClose={jest.fn()} onApplicationRemoved={onApplicationRemoved} />
    );

    const removeButtons = await screen.findAllByLabelText('Remove application');
    fireEvent.click(removeButtons[1]);
    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(positionService.removeCandidateFromPosition).toHaveBeenCalledWith(2, 2);
      expect(onApplicationRemoved).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error feedback when removal fails', async () => {
    positionService.removeCandidateFromPosition.mockRejectedValue(new Error('Application relation not found'));

    render(<CandidateDetails candidate={candidateProp} onClose={jest.fn()} onApplicationRemoved={jest.fn()} />);

    const removeButtons = await screen.findAllByLabelText('Remove application');
    fireEvent.click(removeButtons[1]);
    fireEvent.click(screen.getByText('Remove'));

    expect(await screen.findByText('Application relation not found')).not.toBeNull();
  });
});
