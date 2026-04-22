import React, { useState, useEffect } from 'react';
import TpoLayout from '../../components/tpo/TpoLayout';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People,
  Work,
  Assessment,
  BarChart,
  TrendingUp,
  EmojiEvents,
  Business,
  School,
  Code,
  Quiz,
  Refresh,
  Visibility,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SkeletonDashboard } from '../../components/common/SkeletonLoading';
import Leaderboard from '../../components/common/Leaderboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface DashboardStats {
  totalStudents: number;
  totalProblems: number;
  totalTests: number;
  placedStudents: number;
  avgPackage: string;
  activeCompanies: number;
}

interface RecentStudent {
  _id: string;
  userId: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  readiness: {
    overallScore: number;
  };
  updatedAt: string;
}

const TpoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalProblems: 0,
    totalTests: 0,
    placedStudents: 0,
    avgPackage: '₹0L',
    activeCompanies: 0,
  });
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch dashboard stats
      const dashboardRes = await axios.get(`${API_URL}/tpo/dashboard`, { headers });
      
      if (dashboardRes.data.success) {
        const { stats: apiStats, recentStudents: apiStudents } = dashboardRes.data.data;
        
        setStats({
          totalStudents: apiStats.totalStudents || 0,
          totalProblems: apiStats.totalProblems || 0,
          totalTests: apiStats.totalTests || 0,
          placedStudents: Math.floor((apiStats.totalStudents || 0) * 0.75), // Estimated
          avgPackage: '₹6.2L', // Placeholder
          activeCompanies: 42, // Placeholder
        });
        
        setRecentStudents(apiStudents || []);
      }

      // Fetch analytics for additional data
      const analyticsRes = await axios.get(`${API_URL}/tpo/analytics`, { headers });
      
      if (analyticsRes.data.success) {
        // Generate recent activities based on data
        const activities = [
          { id: 1, text: `${stats.totalProblems} DSA problems available for practice`, time: 'Active', type: 'dsa' },
          { id: 2, text: `${stats.totalTests} aptitude tests created`, time: 'Active', type: 'aptitude' },
          { id: 3, text: `${stats.totalStudents} students registered`, time: 'Total', type: 'students' },
        ];
        setRecentActivities(activities);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents.toString(), icon: <People />, color: 'primary', path: '/tpo/students' },
    { title: 'DSA Problems', value: stats.totalProblems.toString(), icon: <Code />, color: 'success', path: '/tpo/analytics' },
    { title: 'Aptitude Tests', value: stats.totalTests.toString(), icon: <Quiz />, color: 'warning', path: '/tpo/analytics' },
    { title: 'Active Companies', value: stats.activeCompanies.toString(), icon: <Business />, color: 'info', path: '/tpo/companies' },
  ];

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <TpoLayout>
        <SkeletonDashboard type="tpo" />
      </TpoLayout>
    );
  }

  return (
    <TpoLayout>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Page Header */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" fontWeight="900" sx={{
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #00f593 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px'
                }}>
                  TPO Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                  Manage student placements and track performance metrics
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchDashboardData}
              >
                Refresh
              </Button>
            </Box>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Grid>
          )}

          {/* Stats Cards */}
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                className="glass-card"
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(stat.path)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" variant="body2" fontWeight="medium">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" mt={1}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        backgroundColor: `${stat.color}.main`,
                        color: 'white',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card className="glass-card">
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Quick Actions
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/tpo/analytics')}
                  >
                    Manage DSA Problems
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Add />}
                    onClick={() => navigate('/tpo/analytics')}
                  >
                    Manage Aptitude Tests
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    onClick={() => navigate('/tpo/students')}
                  >
                    View Students
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<BarChart />}
                    onClick={() => navigate('/tpo/performance')}
                  >
                    View Analytics
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Students */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Student Activity
                  </Typography>
                  <Button size="small" onClick={() => navigate('/tpo/students')}>
                    View All
                  </Button>
                </Box>
                {recentStudents.length === 0 ? (
                  <Typography color="text.secondary" align="center" py={4}>
                    No recent student activity
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell>Readiness Score</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentStudents.slice(0, 5).map((student) => (
                          <TableRow key={student._id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {student.userId?.profile?.firstName} {student.userId?.profile?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.userId?.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${student.readiness?.overallScore || 0}%`}
                                size="small"
                                color={getReadinessColor(student.readiness?.overallScore || 0) as any}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/tpo/students`)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Content Overview */}
          <Grid item xs={12} md={6}>
            <Card className="glass-card" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Content Overview
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Code color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="DSA Problems"
                      secondary={`${stats.totalProblems} problems available for student practice`}
                    />
                    <Chip
                      label="Active"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <Quiz color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Aptitude Tests"
                      secondary={`${stats.totalTests} tests covering various companies and topics`}
                    />
                    <Chip
                      label="Active"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <People color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Registered Students"
                      secondary={`${stats.totalStudents} students actively using the platform`}
                    />
                    <Chip
                      label="Growing"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <Business color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Company Coverage"
                      secondary="TCS, Infosys, Wipro, Cognizant, Accenture, Google, Microsoft, Amazon"
                    />
                    <Chip
                      label="8 Companies"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Global Elite Rankings (Leaderboard) */}
          <Grid item xs={12} className="dashboard-entry-3">
             <Leaderboard limit={10} showPagination={true} />
          </Grid>
        </Grid>
      </Container>
    </TpoLayout>
  );
};

export default TpoDashboard;
