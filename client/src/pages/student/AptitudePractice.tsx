import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
} from '@mui/material';
import { Quiz, TrendingUp, AccessTime, Business, EmojiEvents, Timer } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AptitudeTest {
  _id: string;
  title: string;
  description: string;
  type: 'quantitative' | 'logical' | 'verbal' | 'mixed';
  duration: number;
  totalQuestions: number;
  companies: string[];
  attempts: number;
  averageScore: number;
}

interface CompanyStats {
  company: string;
  completed: number;
  averageScore: number;
}

const companies = [
  { name: 'TCS', color: '#1e88e5' },
  { name: 'Infosys', color: '#43a047' },
  { name: 'Wipro', color: '#fb8c00' },
  { name: 'Cognizant', color: '#43a047' },
  { name: 'Accenture', color: '#7e57c2' },
  { name: 'Google', color: '#e53935' },
  { name: 'Microsoft', color: '#00acc1' },
  { name: 'Amazon', color: '#ff8f00' },
];

const AptitudePractice: React.FC = () => {
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    company: '',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
    fetchStats();
  }, [page, filters]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (filters.type) params.type = filters.type;
      if (filters.company) params.company = filters.company;

      const response = await axios.get('/student/aptitude/tests', { params });
      setTests(response.data.data.tests);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/student/analytics');
      const data = response.data.data;
      setOverallStats({
        totalTests: data.practice?.aptitude?.totalTests || 0,
        completedTests: data.practice?.aptitude?.completedTests || 0,
        averageScore: data.practice?.aptitude?.averageScore || 0,
      });
      
      // Convert company-specific stats
      if (data.practice?.aptitude?.companySpecific) {
        const stats = Object.entries(data.practice.aptitude.companySpecific).map(([company, stats]: [string, any]) => ({
          company,
          completed: stats.completed || 0,
          averageScore: stats.averageScore || 0,
        }));
        setCompanyStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quantitative':
        return 'primary';
      case 'logical':
        return 'secondary';
      case 'verbal':
        return 'success';
      case 'mixed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleCompanyClick = (companyName: string) => {
    setFilters({ ...filters, company: companyName });
    setActiveTab(0);
  };

  const filteredTests = tests.filter((test) => {
    if (filters.company) {
      return test.companies.includes(filters.company);
    }
    return true;
  });

  return (
    <Box>
      <Typography variant="h3" gutterBottom fontWeight="900" sx={{
        background: 'linear-gradient(135deg, #00d4ff 0%, #6c63ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-1px'
      }}>
        Aptitude Practice
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4, fontSize: '1.1rem' }}>
        Practice company-specific aptitude tests with timed assessments
      </Typography>

      {/* Overall Progress */}
      <Paper elevation={0} className="glass-card" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <EmojiEvents color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {overallStats.completedTests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tests Completed
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingUp color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {overallStats.averageScore.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (overallStats.completedTests / 10) * 100)}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary">
                Goal: 10 tests
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Company Selection */}
      <Paper elevation={0} className="glass-card" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
          Practice by Company
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
          <Chip
            label="All Companies"
            onClick={() => handleCompanyClick('')}
            color={filters.company === '' ? 'primary' : 'default'}
            variant={filters.company === '' ? 'filled' : 'outlined'}
            clickable
          />
          {companies.map((company) => (
            <Chip
              key={company.name}
              label={company.name}
              onClick={() => handleCompanyClick(company.name)}
              color={filters.company === company.name ? 'primary' : 'default'}
              variant={filters.company === company.name ? 'filled' : 'outlined'}
              clickable
              sx={{
                borderColor: filters.company === company.name ? 'primary.main' : company.color,
                '&:hover': {
                  bgcolor: `${company.color}20`,
                },
              }}
            />
          ))}
        </Box>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="All Tests" />
        <Tab label="My Progress" />
      </Tabs>

      {activeTab === 0 ? (
        <>
          {/* Filters */}
          <Paper elevation={0} className="glass-card" sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Test Type</InputLabel>
                  <Select
                    value={filters.type}
                    label="Test Type"
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="quantitative">Quantitative</MenuItem>
                    <MenuItem value="logical">Logical Reasoning</MenuItem>
                    <MenuItem value="verbal">Verbal Ability</MenuItem>
                    <MenuItem value="mixed">Mixed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Company Filter</InputLabel>
                  <Select
                    value={filters.company}
                    label="Company Filter"
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                  >
                    <MenuItem value="">All Companies</MenuItem>
                    {companies.map((c) => (
                      <MenuItem key={c.name} value={c.name}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Tests Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {filteredTests.map((test) => (
                  <Grid item xs={12} sm={6} md={4} key={test._id}>
                    <Card
                      className="glass-card"
                      elevation={0}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0, 212, 255, 0.15)',
                          borderColor: 'rgba(0, 212, 255, 0.3)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                            {test.title}
                          </Typography>
                          <Chip
                            label={test.type}
                            color={getTypeColor(test.type) as any}
                            size="small"
                          />
                        </Box>

                        {test.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {test.description}
                          </Typography>
                        )}

                        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                          <Chip
                            icon={<AccessTime />}
                            label={`${test.duration} min`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                          <Chip
                            icon={<Quiz />}
                            label={`${test.totalQuestions} Questions`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        {test.companies && test.companies.length > 0 && (
                          <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">
                              Companies:{' '}
                              {test.companies.map((company, idx) => (
                                <Chip
                                  key={idx}
                                  label={company}
                                  size="small"
                                  sx={{ ml: 0.5, height: 20 }}
                                />
                              ))}
                            </Typography>
                          </Box>
                        )}

                        {test.attempts > 0 && (
                          <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">
                              Avg Score: {test.averageScore.toFixed(1)}% ({test.attempts} attempts)
                            </Typography>
                          </Box>
                        )}

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Timer />}
                          onClick={() => navigate(`/student/aptitude/test/${test._id}`)}
                          sx={{
                            background: 'linear-gradient(135deg, #00d4ff 0%, #6c63ff 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #6c63ff 0%, #00d4ff 100%)',
                            },
                          }}
                        >
                          Start Timed Test
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {filteredTests.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No tests found. Try adjusting your filters.
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Select a company above to see company-specific tests, or clear filters to see all available tests.
                  </Alert>
                </Paper>
              )}

              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        /* Progress Tab */
        <Paper elevation={0} className="glass-card" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Company-wise Progress
          </Typography>
          {companyStats.length > 0 ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {companyStats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.company}>
                  <Card className="glass-card" variant="outlined" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">
                        {stat.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tests Completed: {stat.completed}
                      </Typography>
                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          Average Score
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={stat.averageScore}
                          color={stat.averageScore >= 60 ? 'success' : stat.averageScore >= 40 ? 'warning' : 'error'}
                          sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {stat.averageScore.toFixed(1)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No progress data yet. Start taking tests to track your company-wise performance!
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AptitudePractice;
