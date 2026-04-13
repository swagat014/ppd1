import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
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
import CoreSubjectsPage from './pages/teacher/core-subjects';
import Maintenance from './pages/common/Maintenance';
import axios from 'axios';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6c63ff', // Premium purple
      light: '#8b83ff',
      dark: '#4a42d4',
    },
    secondary: {
      main: '#f72585', // Vibrant pink
      light: '#ff4da6',
      dark: '#d1156c',
    },
    info: {
      main: '#00d4ff', // Cyan
    },
    success: {
      main: '#00f593', // Neon green
    },
    warning: {
      main: '#ffd60a', // Neon yellow
    },
    background: {
      default: '#050914', // Deep dark blue-black
      paper: '#0d1228', // Slightly lighter dark blue
    },
    text: {
      primary: '#f0f4ff',
      secondary: 'rgba(200, 210, 255, 0.65)',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    action: {
      active: '#f0f4ff',
      hover: 'rgba(108, 99, 255, 0.15)',
      selected: 'rgba(108, 99, 255, 0.25)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Space Grotesk", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#050914',
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(108, 99, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(247, 37, 133, 0.05) 0%, transparent 50%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(5, 9, 20, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(13, 18, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(13, 18, 40, 0.6) !important',
          backdropFilter: 'blur(20px) !important',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(13, 18, 40, 0.6) !important',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(108, 99, 255, 0.15)',
            border: '1px solid rgba(108, 99, 255, 0.3)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          padding: '10px 24px',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6c63ff 0%, #4a42d4 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #8b83ff 0%, #6c63ff 100%)',
            boxShadow: '0 8px 25px rgba(108, 99, 255, 0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #f72585 0%, #d1156c 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #ff4da6 0%, #f72585 100%)',
            boxShadow: '0 8px 25px rgba(247, 37, 133, 0.4)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        outlined: {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        },
        colorInfo: {
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          color: '#00d4ff',
          border: '1px solid rgba(0, 212, 255, 0.3)',
        },
        colorSuccess: {
          backgroundColor: 'rgba(0, 245, 147, 0.15)',
          color: '#00f593',
          border: '1px solid rgba(0, 245, 147, 0.3)',
        },
        colorWarning: {
          backgroundColor: 'rgba(255, 214, 10, 0.15)',
          color: '#ffd60a',
          border: '1px solid rgba(255, 214, 10, 0.3)',
        },
        colorError: {
          backgroundColor: 'rgba(247, 37, 133, 0.15)',
          color: '#f72585',
          border: '1px solid rgba(247, 37, 133, 0.3)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          color: '#f0f4ff',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02) !important',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6c63ff',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '4px 12px',
          padding: '10px 16px',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(108, 99, 255, 0.15)',
            borderLeft: '4px solid #6c63ff',
            '&:hover': {
              backgroundColor: 'rgba(108, 99, 255, 0.25)',
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        },
      },
    },
  },
});

function App() {
  // Add global maintenance interceptor
  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 503 && error.response?.data?.isMaintenance) {
          const userRole = localStorage.getItem('role');
          if (userRole !== 'admin') {
            window.location.href = '/maintenance';
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SettingsProvider>
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
          <Route
            path="/teacher/core-subjects"
            element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <CoreSubjectsPage />
                </PrivateRoute>
            }
          />
            <Route path="/maintenance" element={<Maintenance />} />
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
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
