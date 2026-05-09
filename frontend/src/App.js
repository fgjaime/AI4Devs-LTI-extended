import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecruiterDashboard from './components/RecruiterDashboard';
import AddCandidate from './components/AddCandidateForm';
import CandidatesList from './components/CandidatesList';
import Positions from './components/Positions';
import PositionDetails from './components/PositionDetails';
import EditPositionForm from './components/EditPositionForm';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RecruiterDashboard />} />
        <Route path="/add-candidate" element={<AddCandidate />} />
        <Route path="/candidates" element={<CandidatesList />} />
        <Route path="/candidates/:id" element={<CandidatesList />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/positions/:id" element={<PositionDetails />} />
        <Route path="/positions/:id/edit" element={<EditPositionForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;