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
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

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
      <Typography variant="h3" gutterBottom fontWeight="900" sx={{
        background: 'linear-gradient(135deg, #00d4ff 0%, #6c63ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-1px'
      }}>
        Analytics & Progress
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4, fontSize: '1.1rem' }}>
        Track your placement preparation progress and analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Readiness Overview */}
        <Grid item xs={12} md={6}>
            <Paper elevation={0} className="glass-card" sx={{ p: 3 }}>
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
            <Paper elevation={0} className="glass-card" sx={{ p: 3 }}>
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
            <Card className="glass-card" elevation={0}>
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
            <Card className="glass-card" elevation={0}>
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
            <Card className="glass-card" elevation={0}>
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

        {/* Radar Chart for Skills and Line Chart for History */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} className="glass-card" sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Skills Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                { subject: 'Technical', A: readinessData.technicalScore || 0, fullMark: 100 },
                { subject: 'Aptitude', A: readinessData.aptitudeScore || 0, fullMark: 100 },
                { subject: 'Communication', A: readinessData.communicationScore || 0, fullMark: 100 },
                { subject: 'DSA', A: analytics.practice?.dsa?.accuracy || 0, fullMark: 100 },
                { subject: 'Quizzes', A: analytics.practice?.aptitude?.averageScore || 0, fullMark: 100 },
              ]}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)' }} />
                <Radar
                  name="Proficiency"
                  dataKey="A"
                  stroke="#00d4ff"
                  fill="#00d4ff"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper elevation={0} className="glass-card" sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Performance History
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={analytics.analytics?.testHistory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1228', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6c63ff"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#6c63ff', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                  name="Readiness Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
