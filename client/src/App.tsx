import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/student/Dashboard';
import TpoDashboard from './pages/tpo/Dashboard';
import StudentsPage from './pages/tpo/students';
import AnalyticsPage from './pages/tpo/analytics';
import CompaniesPage from './pages/tpo/companies';
import PerformancePage from './pages/tpo/performance';
import ReportsPage from './pages/tpo/reports';
import AdminDashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/users';
import AdminAnalyticsPage from './pages/admin/analytics';
import PlacementStatsPage from './pages/admin/placement-stats';
import SettingsPage from './pages/admin/settings';
import DepartmentsPage from './pages/admin/departments';
import CollegesPage from './pages/admin/colleges';
import UserBulkUpload from './pages/admin/UserBulkUpload';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherStudentsPage from './pages/teacher/students';
import AssignmentsPage from './pages/teacher/assignments';
import GradesPage from './pages/teacher/grades';
import TeacherAnalyticsPage from './pages/teacher/analytics';
import SchedulePage from './pages/teacher/schedule';
import ResourcesPage from './pages/teacher/resources';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/student/*"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
            path="/tpo"
            element={
                <PrivateRoute allowedRoles={['tpo']}>
                  <TpoDashboard />
                </PrivateRoute>
            }
          />
          <Route
            path="/tpo/students"
            element={
                <PrivateRoute allowedRoles={['tpo']}>
                  <StudentsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/tpo/analytics"
            element={
                <PrivateRoute allowedRoles={['tpo']}>
                  <AnalyticsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/tpo/companies"
            element={
                <PrivateRoute allowedRoles={['tpo']}>
                  <CompaniesPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/tpo/performance"
            element={
                <PrivateRoute allowedRoles={['tpo']}>
                  <PerformancePage />
                </PrivateRoute>
            }
          />
          <Route
            path="/tpo/reports"
            element={
                <PrivateRoute allowedRoles={['tpo']}>
                  <ReportsPage />
                </PrivateRoute>
            }
          />
            <Route
            path="/admin"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                  <UsersPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminAnalyticsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/admin/placement-stats"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                  <PlacementStatsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                  <SettingsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                  <DepartmentsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/admin/colleges"
            element={
                <PrivateRoute allowedRoles={['admin']}>
                  <CollegesPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/admin/bulk-upload"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <UserBulkUpload />
              </PrivateRoute>
            }
          />
            <Route
            path="/teacher"
            element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </PrivateRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <TeacherStudentsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <AssignmentsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/teacher/grades"
            element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <GradesPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/teacher/analytics"
            element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <TeacherAnalyticsPage />
                </PrivateRoute>
            }
          />
          <Route
            path="/teacher/schedule"
            element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <SchedulePage />
                </PrivateRoute>
            }
          />
          <Route
            path="/teacher/resources"
            element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <ResourcesPage />
                </PrivateRoute>
            }
          />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
