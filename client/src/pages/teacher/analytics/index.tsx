import React, { useState, useEffect } from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  School,
  Assessment,
  BarChart as BarChartIcon,
  People,
  Code,
  Quiz,
  Grade,
} from '@mui/icons-material';
import axios from 'axios';
import { SkeletonDashboard } from '../../../components/common/SkeletonLoading';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AnalyticsData {
  totalStudents: number;
  averageReadiness: number;
  dsaProgress: {
    totalProblems: number;
    averageSolved: number;
    averageAccuracy: number;
  };
  aptitudeProgress: {
    totalTests: number;
    averageCompleted: number;
    averageScore: number;
  };
  subjectWisePerformance: Array<{
    subject: string;
    averageScore: number;
    studentCount: number;
  }>;
  weeklyProgress: Array<{
    week: string;
    dsaProblems: number;
    aptitudeTests: number;
    avgReadiness: number;
  }>;
  topPerformers: Array<{
    _id: string;
    name: string;
    readiness: number;
    dsaSolved: number;
    aptitudeAvg: number;
  }>;
  studentsNeedingSupport: Array<{
    _id: string;
    name: string;
    readiness: number;
    weakAreas: string[];
  }>;
}

const COLORS = ['#6c63ff', '#00f593', '#ffd60a', '#f72585', '#00d4ff'];

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulated API call
      // const response = await axios.get(`/teacher/analytics?range=${timeRange}`);
      
      // Mock data
      setTimeout(() => {
        setAnalytics({
          totalStudents: 45,
          averageReadiness: 68,
          dsaProgress: {
            totalProblems: 150,
            averageSolved: 42,
            averageAccuracy: 76,
          },
          aptitudeProgress: {
            totalTests: 25,
            averageCompleted: 8,
            averageScore: 72,
          },
          subjectWisePerformance: [
            { subject: 'DSA', averageScore: 76, studentCount: 45 },
            { subject: 'OS', averageScore: 68, studentCount: 45 },
            { subject: 'DBMS', averageScore: 72, studentCount: 45 },
            { subject: 'Networks', averageScore: 65, studentCount: 45 },
            { subject: 'Aptitude', averageScore: 70, studentCount: 45 },
          ],
          weeklyProgress: [
            { week: 'Week 1', dsaProblems: 125, aptitudeTests: 45, avgReadiness: 62 },
            { week: 'Week 2', dsaProblems: 142, aptitudeTests: 52, avgReadiness: 64 },
            { week: 'Week 3', dsaProblems: 158, aptitudeTests: 48, avgReadiness: 66 },
            { week: 'Week 4', dsaProblems: 189, aptitudeTests: 61, avgReadiness: 68 },
          ],
          topPerformers: [
            { _id: '1', name: 'John Doe', readiness: 92, dsaSolved: 89, aptitudeAvg: 88 },
            { _id: '2', name: 'Jane Smith', readiness: 88, dsaSolved: 76, aptitudeAvg: 85 },
            { _id: '3', name: 'Bob Johnson', readiness: 85, dsaSolved: 71, aptitudeAvg: 82 },
            { _id: '4', name: 'Alice Brown', readiness: 83, dsaSolved: 68, aptitudeAvg: 80 },
            { _id: '5', name: 'Charlie Wilson', readiness: 81, dsaSolved: 65, aptitudeAvg: 78 },
          ],
          studentsNeedingSupport: [
            { _id: '6', name: 'David Lee', readiness: 35, weakAreas: ['DSA', 'Aptitude'] },
            { _id: '7', name: 'Emma Davis', readiness: 38, weakAreas: ['Aptitude'] },
            { _id: '8', name: 'Frank Miller', readiness: 42, weakAreas: ['DSA'] },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      setLoading(false);
    }
  };

  const stats = analytics
    ? [
        {
          title: 'Total Students',
          value: analytics.totalStudents,
          icon: <People />,
          color: '#6c63ff',
        },
        {
          title: 'Avg Readiness',
          value: `${analytics.averageReadiness}%`,
          icon: <Assessment />,
          color: '#00f593',
        },
        {
          title: 'DSA Avg Solved',
          value: analytics.dsaProgress.averageSolved,
          icon: <Code />,
          color: '#ffd60a',
        },
        {
          title: 'Aptitude Avg',
          value: `${analytics.aptitudeProgress.averageScore}%`,
          icon: <Quiz />,
          color: '#00d4ff',
        },
      ]
    : [];

  if (loading) {
    return (
      <TeacherLayout>
        <SkeletonDashboard type="teacher" />
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography
                variant="h3"
                fontWeight="900"
                sx={{
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #ff4da6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                  mb: 1,
                }}
              >
                Analytics Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                View detailed analytics on student performance and engagement
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="semester">This Semester</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="glass-card">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        fontWeight="bold"
                        sx={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="900" mt={0.5} sx={{ color: '#fff' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        background: `linear-gradient(135deg, ${stat.color} 0%, rgba(0,0,0,0.5) 100%)`,
                        width: 50,
                        height: 50,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Performance" />
          <Tab label="Top Performers" />
          <Tab label="Support Needed" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Weekly Progress Chart */}
            <Grid item xs={12} md={8}>
              <Card className="glass-card" sx={{ height: 400 }}>
                <CardContent sx={{ height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Weekly Progress Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={analytics?.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0d1228',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="dsaProblems"
                        stroke="#6c63ff"
                        strokeWidth={2}
                        name="DSA Problems"
                      />
                      <Line
                        type="monotone"
                        dataKey="aptitudeTests"
                        stroke="#00f593"
                        strokeWidth={2}
                        name="Aptitude Tests"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgReadiness"
                        stroke="#f72585"
                        strokeWidth={2}
                        name="Avg Readiness"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Subject Performance */}
            <Grid item xs={12} md={4}>
              <Card className="glass-card" sx={{ height: 400 }}>
                <CardContent sx={{ height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Subject-wise Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={analytics?.subjectWisePerformance}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="averageScore"
                        nameKey="subject"
                      >
                        {analytics?.subjectWisePerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0d1228',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* DSA Progress */}
            <Grid item xs={12} md={6}>
              <Card className="glass-card">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    DSA Progress Overview
                  </Typography>
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Average Problems Solved</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {analytics?.dsaProgress.averageSolved} / {analytics?.dsaProgress.totalProblems}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        ((analytics?.dsaProgress.averageSolved || 0) /
                          (analytics?.dsaProgress.totalProblems || 1)) *
                        100
                      }
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#6c63ff' },
                      }}
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Average Accuracy</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {analytics?.dsaProgress.averageAccuracy}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={analytics?.dsaProgress.averageAccuracy || 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#00f593' },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Aptitude Progress */}
            <Grid item xs={12} md={6}>
              <Card className="glass-card">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    Aptitude Progress Overview
                  </Typography>
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Tests Completed</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {analytics?.aptitudeProgress.averageCompleted} / {analytics?.aptitudeProgress.totalTests}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        ((analytics?.aptitudeProgress.averageCompleted || 0) /
                          (analytics?.aptitudeProgress.totalTests || 1)) *
                        100
                      }
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#ffd60a' },
                      }}
                    />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Average Score</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {analytics?.aptitudeProgress.averageScore}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={analytics?.aptitudeProgress.averageScore || 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#00d4ff' },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card className="glass-card">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    Subject Performance Comparison
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics?.subjectWisePerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0d1228',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                        }}
                      />
                      <Bar dataKey="averageScore" name="Average Score" radius={[8, 8, 0, 0]}>
                        {analytics?.subjectWisePerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Card className="glass-card">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Top Performers
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Rank</TableCell>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Student</TableCell>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Readiness</TableCell>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>DSA Solved</TableCell>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Aptitude Avg</TableCell>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.topPerformers.map((student, index) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            color={index < 3 ? 'warning' : 'default'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                              {student.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="bold">
                              {student.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {student.readiness}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.readiness}
                              sx={{
                                width: 60,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': { bgcolor: '#00f593' },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{student.dsaSolved}</TableCell>
                        <TableCell>{student.aptitudeAvg}%</TableCell>
                        <TableCell>
                          <Chip
                            label="Excellent"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {activeTab === 3 && (
          <Card className="glass-card">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3} color="error">
                Students Needing Support
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Student</TableCell>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Readiness Score</TableCell>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Weak Areas</TableCell>
                      <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.studentsNeedingSupport.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'error.main', width: 36, height: 36 }}>
                              {student.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="bold">
                              {student.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="bold" color="error">
                              {student.readiness}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.readiness}
                              sx={{
                                width: 60,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': { bgcolor: '#f72585' },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {student.weakAreas.map((area) => (
                              <Chip
                                key={area}
                                label={area}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Intervene"
                            size="small"
                            color="error"
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>
    </TeacherLayout>
  );
};

export default AnalyticsPage;