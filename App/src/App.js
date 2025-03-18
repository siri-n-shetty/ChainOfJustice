import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import Dashboard from './Dashboard';
import CreateEvent from './createevent';
import ViewEvent from './view_event';
import LoginPage from './LoginPage';
import AdminCreateUserPage from './admin-dashboard';
import OfficerDashboard from './officer-dashboard';
import ExaminerDashboard from './examiner-dashboard';
import Logs from './logs';
import InvestigatorDashboard from './investigator-dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminCreateUserPage />} />
        <Route path="/officer-dashboard" element={<OfficerDashboard />} />
        <Route path="/examiner-dashboard" element={<ExaminerDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/view-event/:event_id" element={<ViewEvent />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/head-investigator-dashboard" element={<InvestigatorDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;