import React, { useState, useEffect } from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  Code,
  Quiz,
  School,
  People,
  TrendingDown,
  TrendingFlat,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface PerformanceData {
  dsa: {
    totalProblems: number;
    totalSubmissions: number;
    avgAcceptanceRate: number;
  };
  aptitude: {
    totalTests: number;
    totalAttempts: number;
    avgScore: number;
  };
  students: {
    avgReadinessScore: number;
    totalStudents: number;
  };
}

interface Student {
  _id: string;
  userId: {
    profile: {
      firstName: string;
      lastName: string;
      department?: string;
    };
    email: string;
  };
  readiness: {
    overallScore: number;
    technicalScore: number;
    aptitudeScore: number;
    communicationScore: number;
  };
  practice: {
    dsa: {
      solvedProblems: number;
      accuracy: number;
    };
    aptitude: {
      completedTests: number;
      averageScore: number;
    };
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PerformancePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PerformanceData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/tpo/analytics`, { headers }),
        axios.get(`${API_URL}/tpo/students`, { headers }),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return 'Ready';
    if (score >= 60) return 'Getting Ready';
    return 'Needs Work';
  };

  // Calculate department-wise stats
  const departmentStats = React.useMemo(() => {
    const stats: { [key: string]: { count: number; avgReadiness: number; students: Student[] } } = {};
    
    students.forEach((student) => {
      const dept = student.userId?.profile?.department || 'Unknown';
      if (!stats[dept]) {
        stats[dept] = { count: 0, avgReadiness: 0, students: [] };
      }
      stats[dept].count++;
      stats[dept].avgReadiness += student.readiness?.overallScore || 0;
      stats[dept].students.push(student);
    });

    // Calculate averages
    Object.keys(stats).forEach((dept) => {
      stats[dept].avgReadiness = Math.round(stats[dept].avgReadiness / stats[dept].count);
    });

    return stats;
  }, [students]);

  // Top performers
  const topPerformers = React.useMemo(() => {
    return [...students]
      .sort((a, b) => (b.readiness?.overallScore || 0) - (a.readiness?.overallScore || 0))
      .slice(0, 10);
  }, [students]);

  // Students needing attention
  const needAttention = React.useMemo(() => {
    return [...students]
      .filter((s) => (s.readiness?.overallScore || 0) < 50)
      .sort((a, b) => (a.readiness?.overallScore || 0) - (b.readiness?.overallScore || 0))
      .slice(0, 10);
  }, [students]);

  if (loading) {
    return (
      <TpoLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </TpoLayout>
    );
  }

  return (
    <TpoLayout>
      <Container maxWidth="xl">
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Performance Tracking
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track overall placement performance, student progress, and department-wise statistics
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Overview Stats */}
        {analytics && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <School color="primary" />
                    <Typography color="text.secondary" variant="body2">
                      Avg Readiness Score
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(analytics.students.avgReadinessScore || 0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.students.avgReadinessScore || 0}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Code color="success" />
                    <Typography color="text.secondary" variant="body2">
                      DSA Acceptance Rate
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(analytics.dsa.avgAcceptanceRate || 0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.dsa.avgAcceptanceRate || 0}
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Quiz color="secondary" />
                    <Typography color="text.secondary" variant="body2">
                      Aptitude Avg Score
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(analytics.aptitude.avgScore || 0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.aptitude.avgScore || 0}
                    color="secondary"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <People color="info" />
                    <Typography color="text.secondary" variant="body2">
                      Total Students
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.students.totalStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    actively tracked
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Department Overview" />
              <Tab label="Top Performers" />
              <Tab label="Needs Attention" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Department-wise Performance
              </Typography>
              {Object.keys(departmentStats).length === 0 ? (
                <Alert severity="info">No department data available</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell>Students</TableCell>
                        <TableCell>Avg Readiness</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Distribution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(departmentStats).map(([dept, data]) => {
                        const ready = data.students.filter(s => (s.readiness?.overallScore || 0) >= 80).length;
                        const gettingReady = data.students.filter(s => {
                          const score = s.readiness?.overallScore || 0;
                          return score >= 60 && score < 80;
                        }).length;
                        const needsWork = data.students.filter(s => (s.readiness?.overallScore || 0) < 60).length;

                        return (
                          <TableRow key={dept} hover>
                            <TableCell>
                              <Typography fontWeight="medium">{dept}</Typography>
                            </TableCell>
                            <TableCell>{data.count}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${data.avgReadiness}%`}
                                size="small"
                                color={getReadinessColor(data.avgReadiness) as any}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getReadinessLabel(data.avgReadiness)}
                                size="small"
                                variant="outlined"
                                color={getReadinessColor(data.avgReadiness) as any}
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={0.5}>
                                <Chip size="small" color="success" label={`${ready} Ready`} />
                                <Chip size="small" color="warning" label={`${gettingReady} Getting Ready`} />
                                <Chip size="small" color="error" label={`${needsWork} Needs Work`} />
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Top Performers
              </Typography>
              {topPerformers.length === 0 ? (
                <Alert severity="info">No student data available</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Student</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Readiness Score</TableCell>
                        <TableCell>DSA Solved</TableCell>
                        <TableCell>Aptitude Avg</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topPerformers.map((student, index) => (
                        <TableRow key={student._id} hover>
                          <TableCell>
                            <Chip
                              label={`#${index + 1}`}
                              size="small"
                              color={index < 3 ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">
                              {student.userId?.profile?.firstName} {student.userId?.profile?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.userId?.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{student.userId?.profile?.department || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${student.readiness?.overallScore || 0}%`}
                              size="small"
                              color="success"
                            />
                          </TableCell>
                          <TableCell>
                            {student.practice?.dsa?.solvedProblems || 0} problems
                            <Typography variant="caption" display="block" color="text.secondary">
                              {student.practice?.dsa?.accuracy || 0}% accuracy
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {student.practice?.aptitude?.completedTests || 0} tests
                            <Typography variant="caption" display="block" color="text.secondary">
                              {student.practice?.aptitude?.averageScore || 0}% avg
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Students Needing Attention
              </Typography>
              {needAttention.length === 0 ? (
                <Alert severity="success">All students are performing well!</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Readiness Score</TableCell>
                        <TableCell>DSA Progress</TableCell>
                        <TableCell>Aptitude Progress</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {needAttention.map((student) => (
                        <TableRow key={student._id} hover>
                          <TableCell>
                            <Typography fontWeight="medium">
                              {student.userId?.profile?.firstName} {student.userId?.profile?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.userId?.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{student.userId?.profile?.department || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${student.readiness?.overallScore || 0}%`}
                              size="small"
                              color="error"
                            />
                          </TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={student.practice?.dsa?.accuracy || 0}
                              color="error"
                              sx={{ width: 100, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" display="block">
                              {student.practice?.dsa?.solvedProblems || 0} solved
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={student.practice?.aptitude?.averageScore || 0}
                              color="error"
                              sx={{ width: 100, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" display="block">
                              {student.practice?.aptitude?.completedTests || 0} tests
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </CardContent>
        </Card>
      </Container>
    </TpoLayout>
  );
};

export default PerformancePage;
