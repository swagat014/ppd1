import React, { useState, useEffect } from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Alert,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  TrendingUp,
  School,
  Assessment,
  Code,
  Quiz,
  Person,
  Email,
  Phone,
  CalendarToday,
  Close,
} from '@mui/icons-material';
import axios from 'axios';
import { SkeletonDashboard, SkeletonTable } from '../../../components/common/SkeletonLoading';

interface Student {
  _id: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      email: string;
      department: string;
      rollNumber?: string;
    };
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
      totalProblems: number;
      accuracy: number;
    };
    aptitude: {
      completedTests: number;
      averageScore: number;
    };
  };
  resume?: {
    atsScore?: number;
  };
  interviews?: Array<{
    score: number;
  }>;
  updatedAt: string;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, filterStatus, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/teacher/students');
      if (response.data.success) {
        setStudents(response.data.data);
        setFilteredStudents(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.userId?.profile?.firstName?.toLowerCase().includes(query) ||
          s.userId?.profile?.lastName?.toLowerCase().includes(query) ||
          s.userId?.profile?.email?.toLowerCase().includes(query) ||
          s.userId?.profile?.rollNumber?.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((s) => {
        const score = s.readiness?.overallScore || 0;
        switch (filterStatus) {
          case 'excellent':
            return score >= 80;
          case 'good':
            return score >= 60 && score < 80;
          case 'average':
            return score >= 40 && score < 60;
          case 'needs-improvement':
            return score < 40;
          default:
            return true;
        }
      });
    }

    setFilteredStudents(filtered);
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: <School />,
      color: '#6c63ff',
    },
    {
      title: 'Excellent Performance',
      value: students.filter((s) => (s.readiness?.overallScore || 0) >= 80).length,
      icon: <TrendingUp />,
      color: '#00f593',
    },
    {
      title: 'Needs Support',
      value: students.filter((s) => (s.readiness?.overallScore || 0) < 40).length,
      icon: <Assessment />,
      color: '#f72585',
    },
    {
      title: 'Avg Readiness',
      value: `${Math.round(
        students.reduce((acc, s) => acc + (s.readiness?.overallScore || 0), 0) /
          (students.length || 1)
      )}%`,
      icon: <Assessment />,
      color: '#00d4ff',
    },
  ];

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
            Student Progress
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and track your students' progress, assignments, and performance
          </Typography>
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

        {/* Filters */}
        <Card className="glass-card" sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
                size="small"
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Performance</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Performance"
                >
                  <MenuItem value="all">All Students</MenuItem>
                  <MenuItem value="excellent">Excellent (80%+)</MenuItem>
                  <MenuItem value="good">Good (60-79%)</MenuItem>
                  <MenuItem value="average">Average (40-59%)</MenuItem>
                  <MenuItem value="needs-improvement">Needs Improvement (&lt;40%)</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="glass-card">
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Students ({filteredStudents.length})
            </Typography>
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Student</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Readiness</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>DSA Progress</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Aptitude</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Resume ATS</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No students found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                width: 40,
                                height: 40,
                              }}
                            >
                              {student.userId?.profile?.firstName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {student.userId?.profile?.firstName}{' '}
                                {student.userId?.profile?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.userId?.profile?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {student.readiness?.overallScore || 0}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.readiness?.overallScore || 0}
                              sx={{
                                width: 60,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor:
                                    student.readiness?.overallScore >= 80
                                      ? '#00f593'
                                      : student.readiness?.overallScore >= 60
                                      ? '#00d4ff'
                                      : student.readiness?.overallScore >= 40
                                      ? '#ffd60a'
                                      : '#f72585',
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Code fontSize="small" color="action" />
                            <Typography variant="body2">
                              {student.practice?.dsa?.solvedProblems || 0}/
                              {student.practice?.dsa?.totalProblems || 0}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {student.practice?.dsa?.accuracy || 0}% accuracy
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Quiz fontSize="small" color="action" />
                            <Typography variant="body2">
                              {student.practice?.aptitude?.completedTests || 0} tests
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Avg: {student.practice?.aptitude?.averageScore || 0}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {student.resume?.atsScore ? (
                            <Chip
                              label={`${student.resume.atsScore}%`}
                              size="small"
                              color={student.resume.atsScore >= 70 ? 'success' : 'warning'}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Not analyzed
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getReadinessLabel(student.readiness?.overallScore || 0)}
                            size="small"
                            color={getReadinessColor(student.readiness?.overallScore || 0) as any}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(student)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Student Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedStudent && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {selectedStudent.userId?.profile?.firstName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedStudent.userId?.profile?.firstName}{' '}
                        {selectedStudent.userId?.profile?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedStudent.userId?.profile?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setDetailsOpen(false)}>
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Overview" />
                  <Tab label="DSA Progress" />
                  <Tab label="Aptitude" />
                  <Tab label="Skills" />
                  <Tab label="Academic" />
                </Tabs>

                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Contact Information
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2">
                              {selectedStudent.userId?.profile?.email}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <School fontSize="small" color="action" />
                            <Typography variant="body2">
                              {selectedStudent.userId?.profile?.department}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2">
                              Last updated:{' '}
                              {new Date(selectedStudent.updatedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Readiness Breakdown
                          </Typography>
                          {[
                            { label: 'Overall', value: selectedStudent.readiness?.overallScore || 0 },
                            { label: 'Technical', value: selectedStudent.readiness?.technicalScore || 0 },
                            { label: 'Aptitude', value: selectedStudent.readiness?.aptitudeScore || 0 },
                            { label: 'Communication', value: selectedStudent.readiness?.communicationScore || 0 },
                          ].map((item) => (
                            <Box key={item.label} mb={1.5}>
                              <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="body2">{item.label}</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {item.value}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={item.value}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                }}
                              />
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      DSA Practice Progress
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="text.secondary" variant="caption">
                              Problems Solved
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {selectedStudent.practice?.dsa?.solvedProblems || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              out of {selectedStudent.practice?.dsa?.totalProblems || 0} total
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="text.secondary" variant="caption">
                              Accuracy Rate
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {selectedStudent.practice?.dsa?.accuracy || 0}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={selectedStudent.practice?.dsa?.accuracy || 0}
                              sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Aptitude Test Performance
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="text.secondary" variant="caption">
                              Tests Completed
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {selectedStudent.practice?.aptitude?.completedTests || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="text.secondary" variant="caption">
                              Average Score
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {selectedStudent.practice?.aptitude?.averageScore || 0}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={selectedStudent.practice?.aptitude?.averageScore || 0}
                              sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Skills Assessment
                    </Typography>
                    <Typography color="text.secondary">
                      Skills data will be displayed here based on student performance across
                      different modules.
                    </Typography>
                  </Box>
                )}

                {activeTab === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Academic Records
                    </Typography>
                    {(selectedStudent as any).academicInfo ? (
                      <Card variant="outlined">
                        <CardContent>
                          <Grid container spacing={2}>
                            {((selectedStudent as any).academicInfo.semesterRecords || []).map((record: any) => (
                              <Grid item xs={6} sm={3} key={record.semester}>
                                <Typography variant="body2" color="textSecondary">Semester {record.semester}</Typography>
                                <Typography variant="h6" color="primary">
                                  {record.sgpa ? record.sgpa.toFixed(2) : 'N/A'}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                          <Divider sx={{ my: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2" color="textSecondary">Current CGPA</Typography>
                              <Typography variant="h5" fontWeight="bold" color="secondary">
                                {(selectedStudent as any).academicInfo.cgpa ? (selectedStudent as any).academicInfo.cgpa.toFixed(2) : 'N/A'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ) : (
                      <Typography color="text.secondary">
                        No academic records uploaded yet.
                      </Typography>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </TeacherLayout>
  );
};

export default StudentsPage;