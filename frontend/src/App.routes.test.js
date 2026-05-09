import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

jest.mock('./components/RecruiterDashboard', () => () => <div>Dashboard Page</div>);
jest.mock('./components/AddCandidateForm', () => () => <div>Add Candidate Page</div>);
jest.mock('./components/CandidatesList', () => () => <div>Candidates List Page</div>);
jest.mock('./components/Positions', () => () => <div>Positions Page</div>);
jest.mock('./components/PositionDetails', () => () => <div>Position Details Page</div>);
jest.mock('./components/EditPositionForm', () => () => <div>Edit Position Page</div>);

describe('App candidate routes', () => {
  it('renders candidate details route for /candidates/:id', async () => {
    window.history.pushState({}, '', '/candidates/1');

    render(<App />);

    expect(await screen.findByText('Candidates List Page')).toBeInTheDocument();
  });
});
