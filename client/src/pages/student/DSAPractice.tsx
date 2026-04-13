import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { Search, FilterList, Code, TrendingUp, Business, CheckCircle, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  pattern: string;
  companies: string[];
  tags: string[];
  acceptanceRate: number;
  submissions: number;
}

interface CompanyStats {
  company: string;
  solved: number;
  total: number;
  accuracy: number;
}

const companies = [
  { name: 'TCS', color: '#1e88e5', type: 'service' },
  { name: 'Infosys', color: '#43a047', type: 'service' },
  { name: 'Wipro', color: '#fb8c00', type: 'service' },
  { name: 'Cognizant', color: '#43a047', type: 'service' },
  { name: 'Accenture', color: '#7e57c2', type: 'service' },
  { name: 'Google', color: '#e53935', type: 'product' },
  { name: 'Microsoft', color: '#00acc1', type: 'product' },
  { name: 'Amazon', color: '#ff8f00', type: 'product' },
  { name: 'Meta', color: '#1976d2', type: 'product' },
  { name: 'Apple', color: '#757575', type: 'product' },
];

const categories = [
  'Arrays',
  'Strings',
  'Linked List',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Math',
  'Stack',
  'Queue',
  'Hash Table',
];

const patterns = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'BFS/DFS',
  'Backtracking',
  'Dynamic Programming',
  'Recursion',
  'Sorting',
  'Hash Table',
  'Stack',
  'Greedy',
];

const DSAPractice: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    pattern: '',
    company: '',
    search: '',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    solved: 0,
    total: 0,
    accuracy: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, [page, filters]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.category) params.category = filters.category;
      if (filters.pattern) params.pattern = filters.pattern;
      if (filters.company) params.company = filters.company;

      const response = await axios.get('/student/dsa/problems', { params });
      setProblems(response.data.data.problems);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/student/analytics');
      const data = response.data.data;
      setOverallStats({
        solved: data.practice?.dsa?.solved || 0,
        total: data.practice?.dsa?.total || 100,
        accuracy: data.practice?.dsa?.accuracy || 0,
      });
      
      if (data.practice?.dsa?.companySpecific) {
        const stats = Object.entries(data.practice.dsa.companySpecific).map(([company, stats]: [string, any]) => ({
          company,
          solved: stats.solved || 0,
          total: stats.total || 0,
          accuracy: stats.accuracy || 0,
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCompanyClick = (companyName: string) => {
    setFilters({ ...filters, company: companyName });
    setActiveTab(0);
  };

  const filteredProblems = problems.filter((problem) => {
    if (filters.search) {
      return problem.title.toLowerCase().includes(filters.search.toLowerCase());
    }
    return true;
  });

  const serviceCompanies = companies.filter((c) => c.type === 'service');
  const productCompanies = companies.filter((c) => c.type === 'product');

  return (
    <Box>
      <Typography variant="h3" gutterBottom fontWeight="900" sx={{
        background: 'linear-gradient(135deg, #00d4ff 0%, #6c63ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-1px'
      }}>
        DSA Practice
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4, fontSize: '1.1rem' }}>
        Master Data Structures and Algorithms with company-specific problems
      </Typography>

      {/* Overall Progress */}
      <Paper elevation={0} className="glass-card" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {overallStats.solved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Problems Solved
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingUp color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {overallStats.accuracy.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accuracy Rate
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <EmojiEvents color="warning" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {Math.min(100, Math.round((overallStats.solved / 50) * 100))}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Goal Progress (50 problems)
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (overallStats.solved / 50) * 100)}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {overallStats.solved} / 50 problems
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
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
          Service-Based Companies
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {serviceCompanies.map((company) => (
            <Tooltip key={company.name} title={`Practice ${company.name} questions`}>
              <Chip
                label={company.name}
                onClick={() => handleCompanyClick(company.name)}
                color={filters.company === company.name ? 'primary' : 'default'}
                variant={filters.company === company.name ? 'filled' : 'outlined'}
                clickable
                sx={{
                  borderColor: company.color,
                  '&:hover': {
                    bgcolor: `${company.color}20`,
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
          Product-Based Companies
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {productCompanies.map((company) => (
            <Tooltip key={company.name} title={`Practice ${company.name} questions`}>
              <Chip
                label={company.name}
                onClick={() => handleCompanyClick(company.name)}
                color={filters.company === company.name ? 'primary' : 'default'}
                variant={filters.company === company.name ? 'filled' : 'outlined'}
                clickable
                sx={{
                  borderColor: company.color,
                  '&:hover': {
                    bgcolor: `${company.color}20`,
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="All Problems" />
        <Tab label="My Progress" />
      </Tabs>

      {activeTab === 0 ? (
        <>
          {/* Filters */}
          <Paper elevation={0} className="glass-card" sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search problems..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={filters.difficulty}
                    label="Difficulty"
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Pattern</InputLabel>
                  <Select
                    value={filters.pattern}
                    label="Pattern"
                    onChange={(e) => handleFilterChange('pattern', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {patterns.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={filters.company}
                    label="Company"
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

          {/* Problems Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {filteredProblems.map((problem) => (
                  <Grid item xs={12} sm={6} md={4} key={problem._id}>
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
                      onClick={() => navigate(`/student/dsa/problem/${problem._id}`)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                            {problem.title}
                          </Typography>
                          <Chip
                            label={problem.difficulty}
                            color={getDifficultyColor(problem.difficulty) as 'success' | 'warning' | 'error'}
                            size="small"
                          />
                        </Box>

                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                          <Chip label={problem.category} size="small" variant="outlined" />
                          <Chip label={problem.pattern} size="small" variant="outlined" />
                        </Box>

                        {problem.companies && problem.companies.length > 0 && (
                          <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">
                              Asked in:{' '}
                              {problem.companies.slice(0, 4).map((company, idx) => (
                                <Chip
                                  key={idx}
                                  label={company}
                                  size="small"
                                  sx={{ ml: 0.5, height: 20 }}
                                />
                              ))}
                              {problem.companies.length > 4 && ' +' + (problem.companies.length - 4)}
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Acceptance: {problem.acceptanceRate?.toFixed(1) || 0}%
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Code />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/student/dsa/problem/${problem._id}`);
                            }}
                          >
                            Solve
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {filteredProblems.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No problems found. Try adjusting your filters.
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Select a company above to see company-specific problems, or clear filters to see all available problems.
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
                        Solved: {stat.solved} / {stat.total}
                      </Typography>
                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          Accuracy
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={stat.accuracy}
                          color={stat.accuracy >= 60 ? 'success' : stat.accuracy >= 40 ? 'warning' : 'error'}
                          sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {stat.accuracy.toFixed(1)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No progress data yet. Start solving problems to track your company-wise performance!
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default DSAPractice;
