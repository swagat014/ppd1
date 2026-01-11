import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { Assessment, TrendingUp, CheckCircle } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

const ReadinessAnalyzer: React.FC = () => {
  const [readiness, setReadiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchReadiness();
  }, []);

  const fetchReadiness = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/student/readiness');
      setReadiness(response.data.data);
    } catch (error) {
      console.error('Failed to fetch readiness:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await axios.post('/student/readiness/analyze');
      setReadiness(response.data.data);
      toast.success('Readiness analysis completed!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to analyze readiness');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return 'Ready for Placement';
    if (score >= 60) return 'Almost Ready';
    if (score >= 40) return 'Needs Improvement';
    return 'Not Ready';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const chartData = readiness
    ? [
        { name: 'Technical', value: readiness.technicalScore, fill: '#1976d2' },
        { name: 'Aptitude', value: readiness.aptitudeScore, fill: '#dc004e' },
        { name: 'Communication', value: readiness.communicationScore, fill: '#2e7d32' },
        { name: 'Projects', value: readiness.projectsScore, fill: '#ed6c02' },
        { name: 'Skills', value: readiness.skillsScore, fill: '#9c27b0' },
      ]
    : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Placement Readiness Analyzer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analysis of your placement readiness
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={analyzing ? <CircularProgress size={20} /> : <Assessment />}
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : 'Analyze Readiness'}
        </Button>
      </Box>

      {readiness ? (
        <Grid container spacing={3}>
          {/* Overall Score */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Overall Readiness Score
              </Typography>
              <Typography variant="h1" fontWeight="bold" gutterBottom>
                {readiness.overallScore}%
              </Typography>
              <Chip
                label={getReadinessLevel(readiness.overallScore)}
                color={getScoreColor(readiness.overallScore) as 'success' | 'warning' | 'error'}
                sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}
              />
              <LinearProgress
                variant="determinate"
                value={readiness.overallScore}
                sx={{ mt: 3, height: 12, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.3)' }}
              />
            </Paper>
          </Grid>

          {/* Score Breakdown */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Score Breakdown
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" fontWeight="bold">
                        Technical Skills
                      </Typography>
                      <Chip
                        label={`${readiness.technicalScore}%`}
                        color={getScoreColor(readiness.technicalScore) as any}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={readiness.technicalScore}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" fontWeight="bold">
                        Aptitude
                      </Typography>
                      <Chip
                        label={`${readiness.aptitudeScore}%`}
                        color={getScoreColor(readiness.aptitudeScore) as any}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={readiness.aptitudeScore}
                      color="secondary"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" fontWeight="bold">
                        Communication
                      </Typography>
                      <Chip
                        label={`${readiness.communicationScore}%`}
                        color={getScoreColor(readiness.communicationScore) as any}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={readiness.communicationScore}
                      color="success"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" fontWeight="bold">
                        Projects
                      </Typography>
                      <Chip
                        label={`${readiness.projectsScore}%`}
                        color={getScoreColor(readiness.projectsScore) as any}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={readiness.projectsScore}
                      color="warning"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" fontWeight="bold">
                        Skills
                      </Typography>
                      <Chip
                        label={`${readiness.skillsScore}%`}
                        color={getScoreColor(readiness.skillsScore) as any}
                        size="small"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={readiness.skillsScore}
                      color="info"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recommendations
              </Typography>
              {readiness.recommendations && readiness.recommendations.length > 0 ? (
                <List sx={{ mt: 2 }}>
                  {readiness.recommendations.map((rec: string, idx: number) => (
                    <ListItem key={idx} sx={{ pl: 0 }}>
                      <CheckCircle color="success" sx={{ mr: 2 }} />
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No specific recommendations. Keep up the good work!
                </Alert>
              )}
              {readiness.lastAnalyzed && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Last analyzed: {new Date(readiness.lastAnalyzed).toLocaleString()}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">
          No readiness data available. Click "Analyze Readiness" to get started.
        </Alert>
      )}
    </Box>
  );
};

export default ReadinessAnalyzer;
