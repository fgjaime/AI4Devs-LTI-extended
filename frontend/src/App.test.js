import React from 'react';
import { render, screen } from '@testing-library/react';
import { getCandidates } from './services/candidateService';

jest.mock('bootstrap/dist/css/bootstrap.min.css', () => ({}));
jest.mock('./components/AddCandidateForm', () => () => <div>Add Candidate Mock</div>);
jest.mock('./components/Positions', () => () => <div>Positions Mock</div>);
jest.mock('./components/PositionDetails', () => () => <div>Position Details Mock</div>);
jest.mock('./components/EditPositionForm', () => () => <div>Edit Position Mock</div>);
jest.mock('./components/RecruiterDashboard', () => () => <div>Dashboard Mock</div>);
const App = require('./App').default;

jest.mock('./services/candidateService', () => ({
  getCandidates: jest.fn(),
  getCandidateById: jest.fn()
}));

describe('App routing', () => {
  it('renders candidate consultation route', async () => {
    getCandidates.mockResolvedValueOnce({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, totalPages: 1 }
    });

    window.history.pushState({}, 'Consultation', '/candidates/consultation');
    render(<App />);

    expect(await screen.findByText('Candidate Process Consultation')).toBeTruthy();
  });
});
