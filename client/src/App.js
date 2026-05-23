import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { AuthContext } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacilitiesDashboard from './pages/FacilitiesDashboard';
import SubmitIssue from './pages/SubmitIssue';
import IssueDetail from './pages/IssueDetail';
import Analytics from './pages/Analytics';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <p className="text-accent text-xl">Loading Reficere...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          } />

          <Route path="/facilities" element={
            <PrivateRoute roles={['facilities', 'staff', 'admin']}>
              <FacilitiesDashboard />
            </PrivateRoute>
          } />

          <Route path="/submit" element={
            <PrivateRoute>
              <SubmitIssue />
            </PrivateRoute>
          } />

          <Route path="/issues/:id" element={
            <PrivateRoute>
              <IssueDetail />
            </PrivateRoute>
          } />

          <Route path="/analytics" element={
            <PrivateRoute roles={['facilities', 'staff', 'admin']}>
              <Analytics />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
