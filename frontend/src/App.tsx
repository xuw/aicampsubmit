import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import MySubmissions from './pages/MySubmissions';
import CreateAssignment from './pages/CreateAssignment';
import ReviewSubmission from './pages/ReviewSubmission';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Common routes for all authenticated users */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:id" element={<AssignmentDetail />} />

            {/* Student-specific routes */}
            <Route path="my-submissions" element={<MySubmissions />} />

            {/* Submission detail view (for all authenticated users) */}
            <Route path="submissions/:id" element={<ReviewSubmission />} />

            {/* TA/Instructor routes */}
            <Route
              path="assignments/create"
              element={
                <ProtectedRoute requiredRoles={['ta', 'instructor', 'admin']}>
                  <CreateAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="submissions/:id/review"
              element={
                <ProtectedRoute requiredRoles={['ta', 'instructor', 'admin']}>
                  <ReviewSubmission />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="admin/users"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
