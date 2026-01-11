import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { Analytics as AnalyticsIcon, TrendingUp, Code, Quiz, Assignment } from '@mui/icons-material';
import axios from 'axios';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/student/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No analytics data available yet. Start practicing to see your progress!
        </Typography>
      </Paper>
    );
  }

  const progressData = analytics.progress || {};
  const readinessData = analytics.readiness || {};

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Analytics & Progress
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Track your placement preparation progress and analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Readiness Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Overall Readiness
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h2" fontWeight="bold" color="primary.main">
                {readinessData.overallScore || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={readinessData.overallScore || 0}
                sx={{ mt: 2, height: 12, borderRadius: 6 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Goals Progress */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Weekly Goals Progress
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">DSA Problems</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {progressData.dsa?.solved || 0} / {progressData.dsa?.goal || 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressData.dsa?.percentage || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Aptitude Tests</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {progressData.aptitude?.completed || 0} / {progressData.aptitude?.goal || 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressData.aptitude?.percentage || 0}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Practice Stats */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Code color="primary" />
                <Typography variant="h6">DSA Practice</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {analytics.practice?.dsa?.solved || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Problems Solved
              </Typography>
              <Chip
                label={`Accuracy: ${analytics.practice?.dsa?.accuracy?.toFixed(1) || 0}%`}
                color="primary"
                size="small"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Quiz color="secondary" />
                <Typography variant="h6">Aptitude Tests</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {analytics.practice?.aptitude?.completed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tests Completed
              </Typography>
              <Chip
                label={`Avg Score: ${analytics.practice?.aptitude?.averageScore?.toFixed(1) || 0}%`}
                color="secondary"
                size="small"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Assignment color="success" />
                <Typography variant="h6">Readiness Score</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {readinessData.overallScore || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
