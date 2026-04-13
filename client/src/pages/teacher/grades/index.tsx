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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Save,
  Edit,
  Assessment,
  TrendingUp,
  School,
  Grade,
  Search,
  FilterList,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';
import { SkeletonDashboard } from '../../../components/common/SkeletonLoading';

interface StudentGrade {
  _id: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      email: string;
      rollNumber?: string;
    };
  };
  grades: Array<{
    _id: string;
    assignmentId: string;
    assignmentTitle: string;
    subject: string;
    marks: number;
    totalMarks: number;
    grade: string;
    feedback?: string;
    submittedAt: string;
    gradedAt?: string;
  }>;
  overallStats: {
    averageGrade: number;
    totalAssignments: number;
    completedAssignments: number;
  };
}

const GradesPage: React.FC = () => {
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulated API call - replace with actual endpoint
      // const response = await axios.get('/teacher/grades');
      
      // Mock data
      setTimeout(() => {
        const mockStudents: StudentGrade[] = [
          {
            _id: '1',
            userId: {
              _id: 'u1',
              profile: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                rollNumber: 'CS2021001',
              },
            },
            grades: [
              {
                _id: 'g1',
                assignmentId: 'a1',
                assignmentTitle: 'Array Manipulation',
                subject: 'Data Structures',
                marks: 85,
                totalMarks: 100,
                grade: 'A',
                feedback: 'Good work!',
                submittedAt: new Date().toISOString(),
                gradedAt: new Date().toISOString(),
              },
              {
                _id: 'g2',
                assignmentId: 'a2',
                assignmentTitle: 'TCS Mock Test',
                subject: 'Aptitude',
                marks: 42,
                totalMarks: 50,
                grade: 'A',
                submittedAt: new Date().toISOString(),
                gradedAt: new Date().toISOString(),
              },
            ],
            overallStats: {
              averageGrade: 87.5,
              totalAssignments: 5,
              completedAssignments: 2,
            },
          },
          {
            _id: '2',
            userId: {
              _id: 'u2',
              profile: {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                rollNumber: 'CS2021002',
              },
            },
            grades: [
              {
                _id: 'g3',
                assignmentId: 'a1',
                assignmentTitle: 'Array Manipulation',
                subject: 'Data Structures',
                marks: 72,
                totalMarks: 100,
                grade: 'B',
                submittedAt: new Date().toISOString(),
                gradedAt: new Date().toISOString(),
              },
            ],
            overallStats: {
              averageGrade: 72,
              totalAssignments: 5,
              completedAssignments: 1,
            },
          },
          {
            _id: '3',
            userId: {
              _id: 'u3',
              profile: {
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob@example.com',
                rollNumber: 'CS2021003',
              },
            },
            grades: [],
            overallStats: {
              averageGrade: 0,
              totalAssignments: 5,
              completedAssignments: 0,
            },
          },
        ];
        setStudents(mockStudents);
        setFilteredStudents(mockStudents);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      console.error('Error fetching grades:', err);
      setError(err.response?.data?.message || 'Failed to fetch grades');
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

    setFilteredStudents(filtered);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
      case 'A+':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
      case 'F':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateGrade = (marks: number, totalMarks: number): string => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleOpenGradeDialog = (student: StudentGrade) => {
    setSelectedStudent(student);
    setGradeDialogOpen(true);
  };

  const handleSaveGrade = async (gradeData: any) => {
    try {
      // API call to save grade
      // await axios.post('/teacher/grades', gradeData);
      
      // Update local state
      setStudents((prev) =>
        prev.map((s) => {
          if (s._id === selectedStudent?._id) {
            const updatedGrades = [...s.grades];
            const existingIndex = updatedGrades.findIndex(
              (g) => g._id === gradeData._id
            );
            if (existingIndex >= 0) {
              updatedGrades[existingIndex] = {
                ...updatedGrades[existingIndex],
                ...gradeData,
                grade: calculateGrade(gradeData.marks, gradeData.totalMarks),
              };
            }
            return {
              ...s,
              grades: updatedGrades,
            };
          }
          return s;
        })
      );
      setGradeDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save grade');
    }
  };

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: <School />,
      color: '#6c63ff',
    },
    {
      title: 'Avg Class Grade',
      value: `${Math.round(
        students.reduce((acc, s) => acc + (s.overallStats?.averageGrade || 0), 0) /
          (students.length || 1)
      )}%`,
      icon: <Grade />,
      color: '#00f593',
    },
    {
      title: 'Submissions',
      value: students.reduce((acc, s) => acc + (s.overallStats?.completedAssignments || 0), 0),
      icon: <Assessment />,
      color: '#ffd60a',
    },
    {
      title: 'Pending Grading',
      value: students.reduce(
        (acc, s) =>
          acc + s.grades.filter((g) => !g.gradedAt).length,
        0
      ),
      icon: <TrendingUp />,
      color: '#f72585',
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
            Grades Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage and update grades for your students' assignments and exams
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
                size="small"
                sx={{ minWidth: 300 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setSearchQuery('')}
              >
                Clear
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Students Grades Table */}
        <Card className="glass-card">
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Student Grades ({filteredStudents.length})
            </Typography>
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Student</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Roll Number</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Overall Grade</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Assignments</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Recent Grades</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No students found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
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
                          <Typography variant="body2">
                            {student.userId?.profile?.rollNumber || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="bold">
                              {student.overallStats?.averageGrade || 0}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.overallStats?.averageGrade || 0}
                              sx={{
                                width: 60,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor:
                                    (student.overallStats?.averageGrade || 0) >= 80
                                      ? '#00f593'
                                      : (student.overallStats?.averageGrade || 0) >= 60
                                      ? '#00d4ff'
                                      : (student.overallStats?.averageGrade || 0) >= 40
                                      ? '#ffd60a'
                                      : '#f72585',
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.overallStats?.completedAssignments || 0} /{' '}
                            {student.overallStats?.totalAssignments || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {student.grades.slice(0, 3).map((grade) => (
                              <Chip
                                key={grade._id}
                                label={grade.grade}
                                size="small"
                                color={getGradeColor(grade.grade) as any}
                                sx={{ fontWeight: 'bold' }}
                              />
                            ))}
                            {student.grades.length > 3 && (
                              <Chip
                                label={`+${student.grades.length - 3}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {student.grades.length === 0 && (
                              <Typography variant="caption" color="text.secondary">
                                No grades yet
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleOpenGradeDialog(student)}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Grade Management Dialog */}
        <Dialog
          open={gradeDialogOpen}
          onClose={() => setGradeDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedStudent && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      {selectedStudent.userId?.profile?.firstName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedStudent.userId?.profile?.firstName}{' '}
                        {selectedStudent.userId?.profile?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage grades for this student
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setGradeDialogOpen(false)}>
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <TableContainer sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Assignment</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedStudent.grades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              No grades recorded yet
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedStudent.grades.map((grade) => (
                          <TableRow key={grade._id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {grade.assignmentTitle}
                              </Typography>
                            </TableCell>
                            <TableCell>{grade.subject}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {grade.marks} / {grade.totalMarks}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={grade.grade}
                                size="small"
                                color={getGradeColor(grade.grade) as any}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell>
                              {grade.gradedAt ? (
                                <Chip
                                  icon={<CheckCircle />}
                                  label="Graded"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip
                                  label="Pending"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit Grade">
                                <IconButton size="small">
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setGradeDialogOpen(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </TeacherLayout>
  );
};

export default GradesPage;