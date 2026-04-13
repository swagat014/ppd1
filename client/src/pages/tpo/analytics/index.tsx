import React, { useState, useEffect } from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Code,
  Quiz,
  ExpandMore,
  Edit,
  Delete,
  Add,
  Refresh,
  Visibility,
  Business,
  TrendingUp,
  School,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface DSAProblem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  pattern: string;
  companies: string[];
  submissions: number;
  acceptanceRate: number;
  createdAt: string;
}

interface AptitudeTest {
  _id: string;
  title: string;
  type: string;
  duration: number;
  totalQuestions: number;
  companies: string[];
  attempts: number;
  averageScore: number;
  createdAt: string;
}

interface AnalyticsData {
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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dsaProblems, setDsaProblems] = useState<DSAProblem[]>([]);
  const [aptitudeTests, setAptitudeTests] = useState<AptitudeTest[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  const [selectedProblem, setSelectedProblem] = useState<DSAProblem | null>(null);
  const [selectedTest, setSelectedTest] = useState<AptitudeTest | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [dsaRes, aptitudeRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/tpo/dsa/problems`, { headers }),
        axios.get(`${API_URL}/tpo/aptitude/tests`, { headers }),
        axios.get(`${API_URL}/tpo/analytics`, { headers }),
      ]);

      if (dsaRes.data.success) setDsaProblems(dsaRes.data.data);
      if (aptitudeRes.data.success) setAptitudeTests(aptitudeRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
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

  const handleDeleteProblem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tpo/dsa/problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete problem');
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tpo/aptitude/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete test');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <TpoLayout>
      <Container maxWidth="xl">
        <Box mb={3}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Placement Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage DSA problems, aptitude tests, and view platform statistics
          </Typography>
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
                    <Code color="primary" />
                    <Typography color="text.secondary" variant="body2">
                      DSA Problems
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.dsa.totalProblems}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {analytics.dsa.totalSubmissions} total submissions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <TrendingUp color="success" />
                    <Typography color="text.secondary" variant="body2">
                      Avg Acceptance Rate
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(analytics.dsa.avgAcceptanceRate || 0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.dsa.avgAcceptanceRate || 0}
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
                      Aptitude Tests
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.aptitude.totalTests}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {analytics.aptitude.totalAttempts} total attempts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <School color="info" />
                    <Typography color="text.secondary" variant="body2">
                      Avg Readiness Score
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(analytics.students.avgReadinessScore || 0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    across {analytics.students.totalStudents} students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab icon={<Code />} label="DSA Problems" iconPosition="start" />
                <Tab icon={<Quiz />} label="Aptitude Tests" iconPosition="start" />
              </Tabs>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchData}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TabPanel value={tabValue} index={0}>
                  <Box mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      DSA Problems ({dsaProblems.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage coding problems for student practice
                    </Typography>
                  </Box>
                  
                  {dsaProblems.length === 0 ? (
                    <Alert severity="info">
                      No DSA problems found. Problems can be added through the database or API.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Companies</TableCell>
                            <TableCell>Stats</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dsaProblems.map((problem) => (
                            <TableRow key={problem._id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {problem.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {problem.pattern}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={problem.difficulty}
                                  size="small"
                                  color={getDifficultyColor(problem.difficulty) as any}
                                />
                              </TableCell>
                              <TableCell>{problem.category}</TableCell>
                              <TableCell>
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                  {problem.companies?.slice(0, 3).map((company) => (
                                    <Chip
                                      key={company}
                                      label={company}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                  {problem.companies?.length > 3 && (
                                    <Chip
                                      label={`+${problem.companies.length - 3}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {problem.submissions} submissions
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {Math.round(problem.acceptanceRate || 0)}% acceptance
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteProblem(problem._id)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Aptitude Tests ({aptitudeTests.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage aptitude tests for different companies
                    </Typography>
                  </Box>
                  
                  {aptitudeTests.length === 0 ? (
                    <Alert severity="info">
                      No aptitude tests found. Tests can be added through the database or API.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Questions</TableCell>
                            <TableCell>Companies</TableCell>
                            <TableCell>Performance</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {aptitudeTests.map((test) => (
                            <TableRow key={test._id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {test.title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={test.type}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>{test.duration} min</TableCell>
                              <TableCell>{test.totalQuestions}</TableCell>
                              <TableCell>
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                  {test.companies?.slice(0, 2).map((company) => (
                                    <Chip
                                      key={company}
                                      label={company}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                  {test.companies?.length > 2 && (
                                    <Chip
                                      label={`+${test.companies.length - 2}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {test.attempts} attempts
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Avg: {Math.round(test.averageScore || 0)}%
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteTest(test._id)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </TabPanel>
              </>
            )}
          </CardContent>
        </Card>

        {/* Company Coverage */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
              Company Coverage
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Content is available for the following companies:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Google', 'Microsoft', 'Amazon'].map((company) => (
                <Chip
                  key={company}
                  label={company}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </TpoLayout>
  );
};

export default AnalyticsPage;
