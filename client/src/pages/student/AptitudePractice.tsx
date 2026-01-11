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
} from '@mui/material';
import { Quiz, TrendingUp, AccessTime } from '@mui/icons-material';
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

const AptitudePractice: React.FC = () => {
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    company: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Aptitude Practice
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Practice quantitative aptitude, logical reasoning, and verbal ability
      </Typography>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Company</InputLabel>
              <Select
                value={filters.company}
                label="Company"
                onChange={(e) => handleFilterChange('company', e.target.value)}
              >
                <MenuItem value="">All Companies</MenuItem>
                <MenuItem value="TCS">TCS</MenuItem>
                <MenuItem value="Infosys">Infosys</MenuItem>
                <MenuItem value="Wipro">Wipro</MenuItem>
                <MenuItem value="Cognizant">Cognizant</MenuItem>
                <MenuItem value="Accenture">Accenture</MenuItem>
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
            {tests.map((test) => (
              <Grid item xs={12} sm={6} md={4} key={test._id}>
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
                      />
                      <Chip
                        label={`${test.totalQuestions} Questions`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {test.companies && test.companies.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          Companies:{' '}
                          {test.companies.slice(0, 3).map((company, idx) => (
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
                      startIcon={<Quiz />}
                      onClick={() => navigate(`/student/aptitude/test/${test._id}`)}
                    >
                      Start Test
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {tests.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No tests found. Try adjusting your filters.
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

export default AptitudePractice;
