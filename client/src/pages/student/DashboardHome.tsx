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
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  IconButton,
  Tooltip,
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
  EmojiEvents,
  Speed,
  School,
  Whatshot as FireIcon,
  EmojiEvents as TrophyIcon,
  AutoGraph,
  Psychology,
  LocalFireDepartment,
  Event,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  readiness: {
    overallScore: number;
    technicalScore: number;
    aptitudeScore: number;
    communicationScore: number;
    projectsScore?: number;
    skillsScore?: number;
    recommendations?: string[];
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
    dsa: Array<{
      problemId: string;
      date: Date;
      status: 'solved' | 'attempted' | 'skipped';
    }>;
    aptitude: Array<{
      testId: string;
      date: Date;
      score: number;
    }>;
    interviews: Array<any>;
  };
  analytics?: {
    streak?: number;
    rank?: number;
    totalStudents?: number;
  };
  english?: {
    overallScore: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    writing: number;
  };
}

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic data refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/student/dashboard');
      setStats(response.data.data);
      setError(null);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to sync dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" className="pulse-glow">Initializing Player Profile...</Typography>
      </Box>
    );
  }

  const readinessScore = stats?.readiness.overallScore || 0;
  const streakDays = stats?.analytics?.streak || 7;
  const globalRank = stats?.analytics?.rank || 12;
  const totalStudents = stats?.analytics?.totalStudents || 1000;

  const skillData = [
    { subject: 'DSA', A: stats?.readiness.technicalScore || 0, fullMark: 100 },
    { subject: 'Aptitude', A: stats?.readiness.aptitudeScore || 0, fullMark: 100 },
    { subject: 'Comm', A: stats?.readiness.communicationScore || 0, fullMark: 100 },
    { subject: 'Projects', A: stats?.readiness.projectsScore || 0, fullMark: 100 },
    { subject: 'Skills', A: stats?.readiness.skillsScore || 0, fullMark: 100 },
    { subject: 'English', A: stats?.english?.overallScore || 0, fullMark: 100 },
  ];

  const roadmapData = [
    { stage: 'Skill Building', score: Math.min(100, (stats?.readiness.technicalScore || 0) + (stats?.readiness.aptitudeScore || 0)), status: (stats?.readiness.technicalScore || 0) > 50 ? 'Completed' : 'Active' },
    { stage: 'Projects', score: stats?.readiness.projectsScore || 0, status: (stats?.readiness.projectsScore || 0) > 30 ? 'Active' : 'Pending' },
    { stage: 'Mock Tests', score: stats?.practice.aptitude.completed || 0, status: (stats?.practice.aptitude.completed || 0) > 5 ? 'Active' : 'Pending' },
    { stage: 'Interview Prep', score: stats?.readiness.communicationScore || 0, status: (stats?.readiness.communicationScore || 0) > 60 ? 'Goal' : 'Pending' },
    { stage: 'Job Ready', score: readinessScore, status: readinessScore > 80 ? 'Victory' : 'Goal' },
  ];

  const coreCards = [
    { title: 'Readiness Index', value: `${readinessScore}%`, icon: <AutoGraph />, color: '#00d4ff', path: '/student/readiness' },
    { title: 'DSA Progress', value: `${stats?.practice.dsa.solved || 0}/${stats?.practice.dsa.total || 0}`, icon: <Code />, color: '#00f593', path: '/student/dsa' },
    { title: 'Test Accuracy', value: `${(stats?.practice.dsa.accuracy || 0).toFixed(1)}%`, icon: <TrendingUp />, color: '#ffd60a', path: '/student/analytics' },
    { title: 'Aptitude Score', value: `${(stats?.practice.aptitude.averageScore || 0).toFixed(1)}%`, icon: <Quiz />, color: '#f72585', path: '/student/aptitude' },
  ];

  return (
    <Box className="dashboard-entry-1">
        {/* Sync Status and Last Updated */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Last synced: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </Typography>
            {error && (
              <Chip 
                label="Sync Error" 
                size="small" 
                color="error" 
                onClick={fetchDashboardData}
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Box>
          <Button 
            size="small" 
            onClick={fetchDashboardData}
            startIcon={<TrendingUp />}
            sx={{ color: '#00d4ff' }}
          >
            Refresh
          </Button>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" fontWeight="900" sx={{
              background: 'linear-gradient(135deg, #f0f4ff 0%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}>
              Master {user?.profile.firstName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Leveling up your professional trajectory • Rank #{globalRank} of {totalStudents}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Paper className="glass-card" sx={{ p: 1.5, px: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 4, border: '1px solid rgba(247, 37, 133, 0.2)' }}>
              <LocalFireDepartment className="led-pulse" sx={{ color: '#f72585', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" fontWeight="900">{streakDays} Days</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">STREAK</Typography>
              </Box>
            </Paper>
            <Paper className="glass-card" sx={{ p: 1.5, px: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 4, border: '1px solid rgba(0, 212, 255, 0.2)' }}>
              <TrophyIcon sx={{ color: '#00d4ff', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" fontWeight="900">#{globalRank}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">GLOBAL RANK</Typography>
              </Box>
            </Paper>
          </Stack>
        </Box>

        {/* Milestone Bar */}
        <Card className="glass-card" sx={{ mb: 4, background: 'rgba(255,255,255,0.02)' }}>
          <CardContent sx={{ py: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <EmojiEvents sx={{ color: '#ffd60a' }} />
                <Typography variant="body2" fontWeight="bold">Next Achievement: Career Launchpad Ready</Typography>
              </Box>
              <Typography variant="caption" fontWeight="bold">{readinessScore}/80% Required</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(100, (readinessScore / 80) * 100)} 
              sx={{ 
                height: 10, borderRadius: 5,
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #ffd60a 0%, #00d4ff 100%)' }
              }} 
            />
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* Core Stats Cards */}
          {coreCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} className={`dashboard-entry-${(index % 3) + 1}`}>
              <Card className="glass-card" sx={{ borderLeft: `4px solid ${card.color}`, cursor: 'pointer', '&:hover': { transform: 'translateY(-5px)' }, transition: '0.3s' }} onClick={() => navigate(card.path)}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">{card.title}</Typography>
                      <Typography variant="h4" fontWeight="900" mt={0.5} sx={{ color: '#fff' }}>{card.value}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: card.color }}>{card.icon}</Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Career Path Trajectory */}
          <Grid item xs={12} md={8} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                  <TrendingUp color="primary" /> Professional Evolution Trajectory
                </Typography>
                <ResponsiveContainer width="100%" height="75%">
                  <LineChart data={roadmapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="stage" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis hide domain={[0, 100]} />
                    <ReTooltip contentStyle={{ backgroundColor: '#0d1228', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: 12 }} />
                    <Line type="stepAfter" dataKey="score" stroke="#00d4ff" strokeWidth={4} dot={{ r: 8, fill: '#00d4ff', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 10, fill: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
                <Box display="flex" justifyContent="space-around" mt={2}>
                  {roadmapData.map((d, i) => (
                    <Box key={i} textAlign="center">
                      <Typography variant="caption" sx={{ color: d.status === 'Completed' ? '#00f593' : d.status === 'Active' ? '#00d4ff' : 'text.secondary', fontWeight: 'bold' }}>
                        {d.status}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ability Matrix Radar */}
          <Grid item xs={12} md={4} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" mb={1} display="flex" alignItems="center" gap={1}>
                  <Psychology sx={{ color: '#00f593' }} /> Cognitive Matrix
                </Typography>
                <Typography variant="caption" color="text.secondary" mb={4} display="block">Synthesized ability distribution</Typography>
                <ResponsiveContainer width="100%" height="75%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                    <Radar name="Skills" dataKey="A" stroke="#00f593" fill="#00f593" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={5} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                  <Timer sx={{ color: '#ffd60a' }} /> Recent Activity
                </Typography>
                <Stack spacing={2.5}>
                  {stats?.recentActivity?.dsa?.slice(0, 3).map((activity, i) => (
                    <Box key={`dsa-${i}`} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: activity.status === 'solved' ? 'rgba(0, 245, 147, 0.1)' : 'rgba(0, 212, 255, 0.1)', color: activity.status === 'solved' ? '#00f593' : '#00d4ff' }}>
                            {activity.status === 'solved' ? <CheckCircle sx={{ fontSize: 18 }} /> : <Code sx={{ fontSize: 18 }} />}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">DSA Problem Solved</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={activity.status} 
                          size="small" 
                          sx={{ 
                            bgcolor: activity.status === 'solved' ? 'rgba(0, 245, 147, 0.1)' : 'rgba(0, 212, 255, 0.1)',
                            color: activity.status === 'solved' ? '#00f593' : '#00d4ff',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                    </Box>
                  ))}
                  {stats?.recentActivity?.aptitude?.slice(0, 2).map((activity, i) => (
                    <Box key={`apt-${i}`} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(247, 37, 133, 0.1)', color: '#f72585' }}>
                            <Quiz sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">Aptitude Test</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" fontWeight="900" color="#f72585">
                          {activity.score}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {(!stats?.recentActivity?.dsa?.length && !stats?.recentActivity?.aptitude?.length) && (
                    <Box sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Typography variant="body2" color="text.secondary">
                        No recent activity. Start practicing to see your progress here!
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Critical Timeline */}
          <Grid item xs={12} md={7} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                  <Event sx={{ color: '#ffd60a' }} /> Opportunity Window
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { company: 'Google', role: 'SDE Intern', date: 'Oct 15', type: 'Application Deadline', color: '#f72585' },
                    { company: 'Microsoft', role: 'Student Ambassador', date: 'Oct 12', type: 'Selection Round', color: '#00d4ff' },
                    { company: 'Placement Hub', role: 'Readiness Test', date: 'Oct 20', type: 'Simulation', color: '#00f593' },
                    { company: 'Amazon', role: 'Project ML', date: 'Oct 25', type: 'Workshop', color: '#ffd60a' },
                  ].map((evt, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `3px solid ${evt.color}`, transition: '0.3s', '&:hover': { transform: 'translateX(5px)', bgcolor: 'rgba(255,255,255,0.04)' } }}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="900">{evt.company}</Typography>
                          <Typography variant="caption" sx={{ color: evt.color, fontWeight: 'bold' }}>{evt.date}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{evt.role}</Typography>
                        <Chip label={evt.type} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box mt={3} p={2} sx={{ borderRadius: 3, bgcolor: 'rgba(0, 212, 255, 0.05)', border: '1px dashed rgba(0, 212, 255, 0.3)' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timer sx={{ color: '#00d4ff' }} /> Final semester eligibility sync starts in 48 hours.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Final Gateway Card */}
          <Grid item xs={12} className="dashboard-entry-3">
            <Card className="glass-card neon-border-cyan">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5" fontWeight="900" mb={1}>Ready for the Real World?</Typography>
                    <Typography variant="body2" color="text.secondary">Your current readiness index outperforms 70% of the cohort. Execute your final test now.</Typography>
                  </Box>
                  <Button variant="contained" endIcon={<ArrowForward />} sx={{ bgcolor: '#00d4ff', color: '#000', borderRadius: 2, px: 4, py: 1.5, fontWeight: 'bold' }} onClick={() => navigate('/student/readiness/test')}>
                    Initiate Final Protocol
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
  );
};

export default DashboardHome;
