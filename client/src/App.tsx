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
    mode: 'dark',
    primary: {
      main: '#006400', // Dark green
      light: '#388e3c',
      dark: '#003d00',
    },
    secondary: {
      main: '#00c853', // Vibrant green
    },
    background: {
      default: '#000000', // Pure black
      paper: '#0a0a0a', // Very dark black
    },
    text: {
      primary: '#e8f5e9',
      secondary: '#a5d6a7',
    },
    divider: '#00cc52',
    action: {
      active: '#e8f5e9',
      hover: 'rgba(0, 204, 82, 0.3)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#e8f5e9',
          boxShadow: '0 4px 20px rgba(0, 204, 82, 0.4)',
          borderBottom: '1px solid rgba(0, 204, 82, 0.4)',
          backgroundImage: 'linear-gradient(90deg, transparent, rgba(0, 204, 82, 0.1), transparent)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#000000',
          color: '#e8f5e9',
          borderRight: '1px solid rgba(0, 204, 82, 0.5)',
          backgroundImage: 'radial-gradient(ellipse at center, rgba(0, 204, 82, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          boxShadow: 'inset -10px 0 15px -10px rgba(0, 204, 82, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'linear-gradient(145deg, #0a0a0a, #000000)',
          boxShadow: '0 10px 40px rgba(0, 204, 82, 0.25)',
          border: '1px solid rgba(0, 204, 82, 0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(145deg, transparent, rgba(0, 204, 82, 0.05), transparent)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          },
          position: 'relative',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 204, 82, 0.3)',
          padding: '14px 16px',
          background: 'rgba(0, 204, 82, 0.05)',
          '&:first-of-type': {
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
          },
          '&:last-of-type': {
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.01)',
            boxShadow: '0 0 20px rgba(0, 204, 82, 0.3)',
            zIndex: 1,
            position: 'relative',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '10px',
          padding: '10px 20px',
          transition: 'all 0.3s ease',
          fontSize: '0.95rem',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00cc52 0%, #00ff64 100%)',
          color: '#000',
          boxShadow: '0 6px 15px rgba(0, 204, 82, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00ff64 0%, #00cc52 100%)',
            boxShadow: '0 8px 25px rgba(0, 204, 82, 0.6)',
            transform: 'translateY(-3px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 204, 82, 0.5)',
          color: '#e8f5e9',
          background: 'rgba(0, 204, 82, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 204, 82, 0.2)',
            borderColor: '#00ff64',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 204, 82, 0.1)',
          borderRadius: '10px',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 204, 82, 0.5)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00ff64',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00ff64',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(0, 204, 82, 0.2), rgba(0, 255, 100, 0.2))',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(0, 204, 82, 0.3)',
          borderRadius: '20px',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #0a0a0a, #000000)',
          boxShadow: '0 10px 40px rgba(0, 204, 82, 0.25)',
          border: '1px solid rgba(0, 204, 82, 0.3)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '16px',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(145deg, transparent, rgba(0, 204, 82, 0.1), transparent)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          },
          position: 'relative',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        regular: {
          minHeight: '64px !important',
        },
      },
    },
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
