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
} from '@mui/material';
import { Search, FilterList, Code, TrendingUp } from '@mui/icons-material';
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
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

  const filteredProblems = problems.filter((problem) => {
    if (filters.search) {
      return problem.title.toLowerCase().includes(filters.search.toLowerCase());
    }
    return true;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        DSA Practice
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Practice Data Structures and Algorithms with company-specific problems
      </Typography>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
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
                <MenuItem value="Arrays">Arrays</MenuItem>
                <MenuItem value="Strings">Strings</MenuItem>
                <MenuItem value="Trees">Trees</MenuItem>
                <MenuItem value="Graphs">Graphs</MenuItem>
                <MenuItem value="Dynamic Programming">DP</MenuItem>
                <MenuItem value="Greedy">Greedy</MenuItem>
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
                <MenuItem value="Two Pointers">Two Pointers</MenuItem>
                <MenuItem value="Sliding Window">Sliding Window</MenuItem>
                <MenuItem value="Binary Search">Binary Search</MenuItem>
                <MenuItem value="BFS/DFS">BFS/DFS</MenuItem>
                <MenuItem value="Backtracking">Backtracking</MenuItem>
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
                <MenuItem value="Google">Google</MenuItem>
                <MenuItem value="Microsoft">Microsoft</MenuItem>
                <MenuItem value="Amazon">Amazon</MenuItem>
                <MenuItem value="Meta">Meta</MenuItem>
                <MenuItem value="Apple">Apple</MenuItem>
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
                  elevation={2}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-4px)',
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
                          {problem.companies.slice(0, 3).map((company, idx) => (
                            <Chip
                              key={idx}
                              label={company}
                              size="small"
                              sx={{ ml: 0.5, height: 20 }}
                            />
                          ))}
                          {problem.companies.length > 3 && ' +' + (problem.companies.length - 3)}
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
    </Box>
  );
};

export default DSAPractice;
