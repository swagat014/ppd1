import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import {
  Assessment,
  Code,
  Quiz,
  Description,
  TrendingUp,
  Assignment,
  Timer,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  readiness: {
    overallScore: number;
    technicalScore: number;
    aptitudeScore: number;
    communicationScore: number;
  };
  practice: {
    dsa: {
      solved: number;
      total: number;
      accuracy: number;
    };
    aptitude: {
      completed: number;
      averageScore: number;
    };
  };
  recentActivity?: {
    dsa?: Array<{
      problemId: string;
      date: Date;
      status: 'solved' | 'attempted' | 'skipped';
    }>;
    aptitude?: Array<{
      testId: string;
      date: Date;
      score: number;
    }>;
    interviews?: Array<any>;
  };
}

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/student/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  const readinessScore = stats?.readiness.overallScore || 0;
  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Welcome back, {user?.profile.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Here's your placement preparation overview
      </Typography>

      <Grid container spacing={3}>
        {/* Readiness Score Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" color="text.secondary">
                  Overall Readiness
                </Typography>
                <Assessment color="primary" />
              </Box>
              <Typography variant="h3" fontWeight="bold" color={`${getReadinessColor(readinessScore)}.main`}>
                {readinessScore}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={readinessScore}
                color={getReadinessColor(readinessScore) as 'success' | 'warning' | 'error'}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => navigate('/student/readiness')}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* DSA Practice Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" color="text.secondary">
                  DSA Practice
                </Typography>
                <Code color="primary" />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats?.practice.dsa.solved || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Problems Solved
              </Typography>
              <Box mt={2}>
                <Chip
                  label={`Accuracy: ${stats?.practice.dsa.accuracy.toFixed(1) || 0}%`}
                  color="primary"
                  size="small"
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => navigate('/student/dsa')}
              >
                Practice More
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Aptitude Practice Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" color="text.secondary">
                  Aptitude Tests
                </Typography>
                <Quiz color="primary" />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats?.practice.aptitude.completed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tests Completed
              </Typography>
              <Box mt={2}>
                <Chip
                  label={`Avg Score: ${stats?.practice.aptitude.averageScore.toFixed(1) || 0}%`}
                  color="secondary"
                  size="small"
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => navigate('/student/aptitude')}
              >
                Take Test
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Description />}
                  onClick={() => navigate('/student/resume')}
                  sx={{ py: 1.5 }}
                >
                  Analyze Resume
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Code />}
                  onClick={() => navigate('/student/dsa')}
                  sx={{ py: 1.5 }}
                >
                  Practice DSA
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Quiz />}
                  onClick={() => navigate('/student/aptitude')}
                  sx={{ py: 1.5 }}
                >
                  Aptitude Test
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/student/readiness')}
                  sx={{ py: 1.5 }}
                >
                  Check Readiness
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent DSA Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.recentActivity?.dsa && stats.recentActivity.dsa.length > 0 ? (
                stats.recentActivity.dsa.map((activity: { problemId: string; date: Date; status: 'solved' | 'attempted' | 'skipped' }, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < stats.recentActivity!.dsa!.length - 1 ? '1px solid #e0e0e0' : 'none',
                    }}
                  >
                    <CheckCircle
                      color={activity.status === 'solved' ? 'success' : 'disabled'}
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="body2">
                      Problem #{activity.problemId?.slice(-6) || 'N/A'} - {activity.status || 'N/A'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent activity. Start practicing!
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Progress Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Progress Overview
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Technical Skills</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats?.readiness.technicalScore || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats?.readiness.technicalScore || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Aptitude</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats?.readiness.aptitudeScore || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats?.readiness.aptitudeScore || 0}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Communication</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats?.readiness.communicationScore || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats?.readiness.communicationScore || 0}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
