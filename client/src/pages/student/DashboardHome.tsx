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
import Leaderboard from '../../components/common/Leaderboard';

interface Opportunity {
  _id: string;
  name: string;
  role: string;
  eventType: string;
  deadline: string;
  location: string;
}

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
  opportunities?: Opportunity[];
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
  const streakDays = stats?.analytics?.streak || 0;
  const globalRank = stats?.analytics?.rank || 0;
  const totalStudents = stats?.analytics?.totalStudents || 0;

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

  const opportunities = stats?.opportunities || [];

  const coreCards = [
    { title: 'Readiness Index', value: `${readinessScore}%`, icon: <AutoGraph />, color: '#8b5cf6', path: '/student/readiness' },
    { title: 'DSA Progress', value: `${stats?.practice.dsa.solved || 0}/${stats?.practice.dsa.total || 0}`, icon: <Code />, color: '#10b981', path: '/student/dsa' },
    { title: 'Test Accuracy', value: `${(stats?.practice.dsa.accuracy || 0).toFixed(1)}%`, icon: <TrendingUp />, color: '#f59e0b', path: '/student/analytics' },
    { title: 'Aptitude Score', value: `${(stats?.practice.aptitude.averageScore || 0).toFixed(1)}%`, icon: <Quiz />, color: '#ec4899', path: '/student/aptitude' },
  ];

  return (
    <Box className="dashboard-entry-1" sx={{ p: { xs: 1, md: 3 } }}>
        {/* Cinematic Header Section */}
        <Box 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 6, 
            background: 'linear-gradient(225deg, rgba(124, 58, 237, 0.1) 0%, rgba(3, 7, 18, 0) 50%, rgba(219, 39, 119, 0.05) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated Background Orbs */}
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, bgcolor: 'var(--primary)', opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%' }} />
          <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, bgcolor: 'var(--secondary)', opacity: 0.05, filter: 'blur(60px)', borderRadius: '50%' }} />

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar 
                  sx={{ 
                    width: 100, height: 100, 
                    border: '4px solid rgba(124, 58, 237, 0.3)',
                    boxShadow: '0 0 30px rgba(124, 58, 237, 0.2)',
                    fontSize: '2.5rem',
                    bgcolor: 'var(--bg-slate)',
                    fontWeight: 900
                  }}
                >
                  {user?.profile.firstName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="900" sx={{
                    background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}>
                    Welcome back, {user?.profile.firstName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip 
                      label={`GLOBAL RANK #${globalRank}`} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa', fontWeight: 'bold', border: '1px solid rgba(124, 58, 237, 0.3)' }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      out of {totalStudents} specialized candidates
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Paper className="glass-card holographic-glow" sx={{ py: 2, px: 4, textAlign: 'center', minWidth: 140 }}>
                  <Typography variant="h4" fontWeight="900" sx={{ color: 'var(--secondary)', mb: 0.5 }}>{streakDays}</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ letterSpacing: 2, opacity: 0.6 }}>STREAK</Typography>
                </Paper>
                <Paper className="glass-card holographic-glow" sx={{ py: 2, px: 4, textAlign: 'center', minWidth: 140 }}>
                  <Typography variant="h4" fontWeight="900" sx={{ color: 'var(--accent-cyan)', mb: 0.5 }}>{readinessScore}%</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ letterSpacing: 2, opacity: 0.6 }}>READINESS</Typography>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Quick Stats Grid */}
          {coreCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} className={`dashboard-entry-${index + 1}`}>
              <Card 
                className="glass-card" 
                sx={{ 
                  position: 'relative', 
                  overflow: 'hidden', 
                  '&:hover': { '& .stat-icon': { transform: 'scale(1.2) rotate(10deg)', opacity: 0.2 } } 
                }}
              >
                <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, transition: '0.4s' }} className="stat-icon">
                  {React.cloneElement(card.icon as React.ReactElement, { sx: { fontSize: 100, color: card.color } })}
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="caption" fontWeight="900" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="999" sx={{ mt: 1, mb: 2 }}>
                    {card.value}
                  </Typography>
                  <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <Box sx={{ width: '70%', height: '100%', bgcolor: card.color, borderRadius: 2, boxShadow: `0 0 10px ${card.color}` }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Performance Ecosystem */}
          <Grid item xs={12} md={8} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 500, p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                    <TrendingUp sx={{ color: 'var(--primary)' }} /> EVOLUTION TRAJECTORY
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Mapping your professional transcendence</Typography>
                </Box>
                <Button size="small" sx={{ color: 'var(--primary)', fontWeight: 'bold' }}>FULL ANALYSIS</Button>
              </Box>
              <ResponsiveContainer width="100%" height="75%">
                <AreaChart data={roadmapData}>
                  <defs>
                    <linearGradient id="colorScoreV2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="stage" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                  <YAxis hide domain={[0, 100]} />
                  <ReTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                    itemStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorScoreV2)" />
                </AreaChart>
              </ResponsiveContainer>
              <Box display="flex" justifyContent="space-around" mt={2}>
                  {roadmapData.map((d, i) => (
                    <Box key={i} textAlign="center">
                      <Typography variant="caption" sx={{ color: d.status === 'Completed' || d.status === 'Victory' ? 'var(--accent-emerald)' : d.status === 'Active' ? 'var(--primary)' : 'text.muted', fontWeight: 'bold' }}>
                        {d.stage.split(' ')[0]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
            </Card>
          </Grid>

          {/* Ability Matrix */}
          <Grid item xs={12} md={4} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 500, p: 2 }}>
              <Typography variant="h6" fontWeight="bold" mb={1} display="flex" alignItems="center" gap={1}>
                <Psychology sx={{ color: 'var(--accent-emerald)' }} /> ABILITY MATRIX
              </Typography>
              <Typography variant="caption" color="text.secondary" mb={4} display="block">Synthesized cognitive competence mapping</Typography>
              <ResponsiveContainer width="100%" height="75%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar name="Skills" dataKey="A" stroke="var(--accent-emerald)" fill="var(--accent-emerald)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Opportunity Window (Real Data) */}
          <Grid item xs={12} md={7} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: '100%' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                    <Event sx={{ color: 'var(--secondary)' }} /> OPPORTUNITY WINDOW
                  </Typography>
                  <Box sx={{ px: 2, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                    <Typography variant="caption" color="var(--accent-emerald)" fontWeight="999">LIVE SIGNALS</Typography>
                  </Box>
              </Box>
              <CardContent>
                <Grid container spacing={2}>
                  {opportunities.length > 0 ? (
                    opportunities.map((evt: Opportunity, i: number) => (
                      <Grid item xs={12} key={i}>
                        <Box sx={{ 
                          p: 2.5, 
                          borderRadius: 4, 
                          bgcolor: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(255,255,255,0.03)', 
                          borderLeft: `4px solid ${i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)'}`, 
                          transition: 'var(--transition-smooth)', 
                          '&:hover': { transform: 'scale(1.01)', bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' } 
                        }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle1" fontWeight="900" color="#fff">{evt.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{evt.role}</Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="caption" sx={{ color: 'var(--secondary)', fontWeight: '900', display: 'block' }}>
                                EXPIRES: {new Date(evt.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </Typography>
                              <Chip label={evt.eventType} size="small" sx={{ height: 18, fontSize: '0.6rem', mt: 0.5, bgcolor: 'rgba(255,255,255,0.05)' }} />
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ py: 8, textAlign: 'center' }}>
                        <Typography color="text.muted">Awaiting corporate signal transmission...</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Global Elite Rankings (Leaderboard) */}
          <Grid item xs={12} md={5} className="dashboard-entry-3">
             <Box mb={4}>
               <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                 <Box>
                   <Typography variant="h6" fontWeight="999" sx={{ letterSpacing: 1, color: '#fff' }}>GLOBAL STATUS</Typography>
                   <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Top 1% performative elite</Typography>
                 </Box>
                 <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(34, 211, 238, 0.05)', display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid rgba(34, 211, 238, 0.1)' }}>
                   <Box className="led-pulse" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--accent-cyan)' }} />
                   <Typography variant="caption" fontWeight="999" sx={{ color: 'var(--accent-cyan)', letterSpacing: 1 }}>SYNC</Typography>
                 </Box>
               </Box>
               
               <Box mb={2} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <Typography variant="subtitle2" fontWeight="999" display="flex" alignItems="center" gap={1.5}>
                   <EmojiEvents sx={{ color: '#ffd60a', fontSize: 20 }} /> GLOBAL ELITE
                 </Typography>
                 <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Top performers across the decentralized disciplines</Typography>
               </Box>
             </Box>

              <Leaderboard 
                limit={6} 
                initialDepartment={user?.profile.department} 
                lockDepartment={true} 
                hideHeader={true}
                compact={true}
              />
          </Grid>

          {/* Final Gateway Card */}
          <Grid item xs={12} className="dashboard-entry-3">
            <Card 
              className="glass-card holographic-glow" 
              sx={{ 
                p: 1, 
                border: '1px solid rgba(34, 211, 238, 0.2)',
                background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.05) 0%, rgba(3, 7, 18, 0) 100%)'
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5" fontWeight="999" sx={{ color: 'var(--accent-cyan)' }}>INITIATE FINAL PROTOCOL</Typography>
                    <Typography variant="body2" color="text.secondary">Your trajectory exceeds 94% of active candidates. Execute your career deployment test.</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    endIcon={<ArrowForward />} 
                    sx={{ 
                      bgcolor: 'var(--primary)', 
                      color: '#fff', 
                      borderRadius: 3, 
                      px: 5, py: 2, 
                      fontWeight: 900,
                      boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)',
                      '&:hover': { bgcolor: '#6d28d9', transform: 'scale(1.05)' } 
                    }} 
                    onClick={() => navigate('/student/readiness/test')}
                  >
                    DEPLOY NOW
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
