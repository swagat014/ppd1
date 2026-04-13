import React, { useState, useEffect } from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import {
  Container,
  Typography,
  Box,
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
  IconButton,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  FilterList,
  TrendingUp,
  Code,
  Quiz,
  School,
  Email,
  Phone,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Student {
  _id: string;
  userId: {
    _id: string;
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
      totalProblems: number;
      accuracy: number;
    };
    aptitude: {
      completedTests: number;
      averageScore: number;
    };
  };
  analytics: {
    achievements: string[];
  };
  createdAt: string;
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
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_URL}/tpo/students`, { headers });
      
      if (response.data.success) {
        setStudents(response.data.data);
        setFilteredStudents(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter((student) => {
        const fullName = `${student.userId?.profile?.firstName || ''} ${student.userId?.profile?.lastName || ''}`.toLowerCase();
        const email = student.userId?.email?.toLowerCase() || '';
        const dept = student.userId?.profile?.department?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query) || dept.includes(query);
      });
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

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

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedStudent(null);
    setTabValue(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const stats = {
    total: students.length,
    ready: students.filter(s => (s.readiness?.overallScore || 0) >= 80).length,
    gettingReady: students.filter(s => {
      const score = s.readiness?.overallScore || 0;
      return score >= 60 && score < 80;
    }).length,
    needsWork: students.filter(s => (s.readiness?.overallScore || 0) < 60).length,
  };

  return (
    <TpoLayout>
      <Container maxWidth="xl">
        <Box mb={3}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Student Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor student progress, readiness scores, and practice activities
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Total Students
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Ready for Placement
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.ready}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Getting Ready
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {stats.gettingReady}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Needs Work
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {stats.needsWork}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                placeholder="Search students by name, email, or department..."
                variant="outlined"
                size="small"
                fullWidth
                sx={{ flex: 1, minWidth: 300 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchStudents}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              All Students ({filteredStudents.length})
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredStudents.length === 0 ? (
              <Typography color="text.secondary" align="center" py={4}>
                No students found
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Readiness</TableCell>
                      <TableCell>DSA Progress</TableCell>
                      <TableCell>Aptitude</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {student.userId?.profile?.firstName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.userId?.profile?.firstName} {student.userId?.profile?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.userId?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {student.userId?.profile?.department || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${student.readiness?.overallScore || 0}% - ${getReadinessLabel(student.readiness?.overallScore || 0)}`}
                            size="small"
                            color={getReadinessColor(student.readiness?.overallScore || 0) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Code fontSize="small" color="action" />
                            <Typography variant="body2">
                              {student.practice?.dsa?.solvedProblems || 0} / {student.practice?.dsa?.totalProblems || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({student.practice?.dsa?.accuracy || 0}%)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Quiz fontSize="small" color="action" />
                            <Typography variant="body2">
                              {student.practice?.aptitude?.completedTests || 0} tests
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (Avg: {student.practice?.aptitude?.averageScore || 0}%)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(student)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Student Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          {selectedStudent && (
            <>
              <DialogTitle>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {selectedStudent.userId?.profile?.firstName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedStudent.userId?.profile?.firstName} {selectedStudent.userId?.profile?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStudent.userId?.email}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                  <Tab label="Overview" />
                  <Tab label="DSA Progress" />
                  <Tab label="Aptitude" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Readiness Scores
                      </Typography>
                      {[
                        { label: 'Overall', value: selectedStudent.readiness?.overallScore || 0 },
                        { label: 'Technical', value: selectedStudent.readiness?.technicalScore || 0 },
                        { label: 'Aptitude', value: selectedStudent.readiness?.aptitudeScore || 0 },
                        { label: 'Communication', value: selectedStudent.readiness?.communicationScore || 0 },
                      ].map((item) => (
                        <Box key={item.label} mb={2}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2">{item.label}</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {item.value}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={item.value}
                            color={getReadinessColor(item.value) as any}
                          />
                        </Box>
                      ))}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Achievements
                      </Typography>
                      {selectedStudent.analytics?.achievements?.length > 0 ? (
                        selectedStudent.analytics.achievements.map((achievement, idx) => (
                          <Chip
                            key={idx}
                            label={achievement}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No achievements yet
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="text.secondary" variant="body2">
                            Problems Solved
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedStudent.practice?.dsa?.solvedProblems || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            out of {selectedStudent.practice?.dsa?.totalProblems || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="text.secondary" variant="body2">
                            Accuracy Rate
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedStudent.practice?.dsa?.accuracy || 0}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="text.secondary" variant="body2">
                            Completion
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedStudent.practice?.dsa?.totalProblems > 0
                              ? Math.round(((selectedStudent.practice?.dsa?.solvedProblems || 0) / selectedStudent.practice?.dsa?.totalProblems) * 100)
                              : 0}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="text.secondary" variant="body2">
                            Tests Completed
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedStudent.practice?.aptitude?.completedTests || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="text.secondary" variant="body2">
                            Average Score
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {selectedStudent.practice?.aptitude?.averageScore || 0}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDetails}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </TpoLayout>
  );
};

export default StudentsPage;
