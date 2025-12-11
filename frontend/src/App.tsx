import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import ProfessorLayout from './components/Layout/ProfessorLayout';
import StudentLayout from './components/Layout/StudentLayout';
import Dashboard from './pages/professor/Dashboard';
import Profile from './pages/professor/Profile';
import OpenGigs from './pages/professor/OpenGigs';
import ClosedProjects from './pages/professor/ClosedProjects';
import OnHoldProjects from './pages/professor/OnHoldProjects';
import CreateGig from './pages/professor/CreateGig';
import EditGig from './pages/professor/EditGig';
import ViewGigApplications from './pages/professor/ViewGigApplications';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// Student pages
import StudentLogin from './pages/student/StudentLogin';
import StudentRegister from './pages/student/StudentRegister';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import BrowseGigs from './pages/student/BrowseGigs';
import GigDetail from './pages/student/GigDetail';
import ProfessorProfile from './pages/student/ProfessorProfile';

const App: React.FC = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Landing / Home */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Professor Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Auth */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        
        {/* Public Professor Profile */}
        <Route path="/professor-profile/:id" element={<ProfessorProfile />} />
        
        {/* Professor Routes */}
        <Route path="/professor" element={<ProtectedRoute><ProfessorLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="gigs/open" element={<OpenGigs />} />
          <Route path="gigs/closed" element={<ClosedProjects />} />
          <Route path="gigs/hold" element={<OnHoldProjects />} />
          <Route path="gigs/create" element={<CreateGig />} />
          <Route path="gigs/edit/:id" element={<EditGig />} />
          <Route path="gigs/:id/applications" element={<ViewGigApplications />} />
        </Route>
        
        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="gigs" element={<BrowseGigs />} />
          <Route path="gigs/:id" element={<GigDetail />} />
          <Route path="applications" element={<StudentDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
