import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Stack,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  People,
  Work,
  Assessment,
  Settings,
  TrendingUp,
  EmojiEvents,
  Business,
  School,
  LocalLibrary,
  FiberManualRecord as Circle,
  CloudUpload,
  AddCircleOutline,
  AdminPanelSettings,
  Speed,
  Autorenew,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SkeletonDashboard } from '../../components/common/SkeletonLoading';
import Leaderboard from '../../components/common/Leaderboard';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [placementData, setPlacementData] = useState<any[]>([]);
  const [heartbeatData, setHeartbeatData] = useState<any[]>([]);
  
  useEffect(() => {
    fetchDashboardData();
    // Simulate real-time heartbeat
    const interval = setInterval(() => {
      setHeartbeatData(prev => {
        const newData = [...prev.slice(-14), { time: new Date().toLocaleTimeString(), value: Math.floor(Math.random() * 40) + 60 }];
        return newData;
      });
    }, 3000);
    
    // Initial heartbeat data
    const initialHeartbeat = Array.from({ length: 15 }, (_, i) => ({
      time: new Date(Date.now() - (14 - i) * 3000).toLocaleTimeString(),
      value: Math.floor(Math.random() * 40) + 60
    }));
    setHeartbeatData(initialHeartbeat);

    return () => clearInterval(interval);
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, placementRes] = await Promise.all([
        axios.get('/admin/dashboard'),
        axios.get('/admin/placement-stats')
      ]);
      
      const dashData = dashRes.data.data;
      const placeData = placementRes.data.data;
      
      setData(dashData);
      
      // Map placement status for chart
      setPlacementData(placeData.statusDistribution?.map((item: any) => ({
        name: item._id,
        value: item.count
      })) || []);

      setStats([
        { title: 'Total Users', value: dashData.totalUsers?.toString() || '0', icon: <People />, color: 'primary' },
        { title: 'Students', value: dashData.students?.toString() || '0', icon: <School />, color: 'success' },
        { title: 'TPO Officers', value: dashData.tpos?.toString() || '0', icon: <Work />, color: 'warning' },
        { title: 'Teachers', value: dashData.teachers?.toString() || '0', icon: <LocalLibrary />, color: 'info' },
        { title: 'Placed Students', value: dashData.placedStudents?.toString() || '0', icon: <EmojiEvents />, color: 'success' },
        { title: 'Avg Package', value: dashData.avgPackage || '₹0L', icon: <TrendingUp />, color: 'secondary' },
        { title: 'Departments', value: dashData.departments?.toString() || '0', icon: <Business />, color: 'secondary' },
        { title: 'Content Items', value: ((dashData.content?.totalProblems || 0) + (dashData.content?.totalTests || 0)).toString(), icon: <Assessment />, color: 'primary' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard statistics');
      // Set default empty data to prevent null errors
      setData({
        totalUsers: 0,
        students: 0,
        tpos: 0,
        teachers: 0,
        placedStudents: 0,
        avgPackage: '₹0L',
        departments: 0,
        content: { totalProblems: 0, totalTests: 0 },
        userDistribution: [],
        recentLogs: []
      });
      setPlacementData([]);
      setStats([
        { title: 'Total Users', value: '0', icon: <People />, color: 'primary' },
        { title: 'Students', value: '0', icon: <School />, color: 'success' },
        { title: 'TPO Officers', value: '0', icon: <Work />, color: 'warning' },
        { title: 'Teachers', value: '0', icon: <LocalLibrary />, color: 'info' },
        { title: 'Placed Students', value: '0', icon: <EmojiEvents />, color: 'success' },
        { title: 'Avg Package', value: '₹0L', icon: <TrendingUp />, color: 'secondary' },
        { title: 'Departments', value: '0', icon: <Business />, color: 'secondary' },
        { title: 'Content Items', value: '0', icon: <Assessment />, color: 'primary' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <AdminLayout>
        <SkeletonDashboard type="admin" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, background: 'transparent' }} className="dashboard-entry-1">
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={6}>
          <Box>
            <Typography variant="h3" fontWeight="999" className="text-gradient" sx={{ letterSpacing: -1, mb: 1 }}>
              SYSTEM ARCH-COMMAND
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 500 }}>
              Strategic oversight across the entire Placement Preparation Nexus.
            </Typography>
          </Box>
          <Box>
            <Chip 
              icon={<Autorenew className="led-pulse" sx={{ color: 'var(--accent-emerald) !important' }} />} 
              label="SYSTEM PULSE: NOMINAL" 
              sx={{ 
                bgcolor: 'rgba(52, 211, 153, 0.05)', 
                color: 'var(--accent-emerald)', 
                fontWeight: 999, 
                borderRadius: 2,
                border: '1px solid rgba(52, 211, 153, 0.2)',
                px: 1
              }} 
            />
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} className={`dashboard-entry-${(index % 3) + 1}`}>
              <Card 
                className="glass-card holographic-glow"
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'var(--transition-smooth)',
                  '&:hover': { transform: 'translateY(-10px)', background: 'rgba(255,255,255,0.03)' }
                }} 
                onClick={() => navigate(stat.path)}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, color: 'var(--primary)' }}>
                    {stat.icon}
                  </Box>
                  <Typography color="text.secondary" variant="caption" fontWeight="999" sx={{ letterSpacing: 1.5, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h3" fontWeight="999" sx={{ letterSpacing: -1 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {/* Quick Actions */}
          <Grid item xs={12} className="dashboard-entry-1">
            <Card className="glass-card" sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="999" mb={4} display="flex" alignItems="center" gap={2} sx={{ letterSpacing: 1 }}>
                <Speed sx={{ color: 'var(--primary)' }} /> STRATEGIC CONTROL HUB
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddCircleOutline />}
                    onClick={() => navigate('/admin/users')}
                    sx={{ py: 2, borderRadius: 4, background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', boxShadow: 'var(--glow-violet)', fontWeight: 999 }}
                  >
                    USER ARCHIVE
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => navigate('/admin/bulk-upload')}
                    sx={{ py: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 999, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                  >
                    BULK SYNTHESIS
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AdminPanelSettings />}
                    onClick={() => navigate('/admin/settings')}
                    sx={{ py: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 999, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                  >
                    CORE PROTOCOLS
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Assessment />}
                    onClick={() => navigate('/admin/placement-stats')}
                    sx={{ py: 2, borderRadius: 4, background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(34, 211, 238, 0.2)', fontWeight: 999 }}
                  >
                    INTEL REPORTS
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* System Heartbeat Chart */}
          <Grid item xs={12} md={8} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 500, p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
                <Typography variant="h6" fontWeight="999" sx={{ letterSpacing: 1 }}>
                  SYSTEM LATENCY HEARTBEAT
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="caption" sx={{ color: 'var(--accent-emerald)', fontWeight: 999 }}>LIVE FEED</Typography>
                  <Circle className="led-pulse" sx={{ fontSize: 14, color: 'var(--accent-emerald)' }} />
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="75%">
                <AreaChart data={heartbeatData}>
                  <defs>
                    <linearGradient id="colorPulseV2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 150]} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  />
                  <Area 
                    type="step" 
                    dataKey="value" 
                    stroke="var(--accent-cyan)" 
                    fillOpacity={1} 
                    fill="url(#colorPulseV2)" 
                    strokeWidth={3}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* System Environment Status */}
          <Grid item xs={12} md={4} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 500, p: 4 }}>
              <Typography variant="h6" fontWeight="999" mb={5} sx={{ letterSpacing: 1 }}>
                ENVIRONMENT INTEGRITY
              </Typography>
              <Stack spacing={3}>
                {[
                  { name: 'Database (MongoDB)', status: 'ACTIVE', color: 'var(--accent-emerald)' },
                  { name: 'API Gateway', status: 'SYNCHRONIZED', color: 'var(--accent-emerald)' },
                  { name: 'Auth Server', status: 'SECURE', color: 'var(--primary)' },
                  { name: 'File Storage', status: 'OPTIMAL', color: 'var(--accent-emerald)' },
                  { name: 'Email Dispatcher', status: 'STANDBY', color: 'var(--accent-amber)' },
                  { name: 'Audit Engine', status: 'INDEXING', color: 'var(--secondary)' },
                ].map((service, idx) => (
                  <Box key={idx} sx={{ 
                    p: 2.5, 
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Typography fontWeight="900" variant="body2" sx={{ color: '#fff' }}>{service.name}</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="caption" sx={{ color: service.color, fontWeight: 999, letterSpacing: 1 }}>{service.status}</Typography>
                      <Circle className="led-pulse" sx={{ fontSize: 12, color: service.color }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>

          {/* User Distribution Chart */}
          <Grid item xs={12} md={6} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: 500, p: 4 }}>
              <Typography variant="h6" fontWeight="999" mb={4} sx={{ letterSpacing: 1 }}>
                IDENTITY SPECTRUM
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={data.userDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {(data.userDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 16 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

           {/* Readiness Distribution Chart */}
          <Grid item xs={12} md={6} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: 500, p: 4 }}>
              <Typography variant="h6" fontWeight="999" mb={1} display="flex" alignItems="center" gap={2} sx={{ letterSpacing: 1 }}>
                <Speed sx={{ color: 'var(--accent-emerald)' }} /> READINESS MATRIX
              </Typography>
              <Typography variant="caption" color="text.secondary" mb={5} display="block">Student count by readiness proficiency levels</Typography>
              <ResponsiveContainer width="100%" height="75%">
                <BarChart data={data.readinessDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} fontWeight="bold" />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 16 }}
                  />
                  <Bar dataKey="value" name="Capacities" radius={[12, 12, 0, 0]}>
                    {(data.readinessDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Student Rankings Leaderboard */}
          <Grid item xs={12} md={6} className="dashboard-entry-3">
            <Leaderboard limit={5} />
          </Grid>

          {/* Recent Activities Timeline */}
          <Grid item xs={12} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="999" mb={5} sx={{ letterSpacing: 1 }}>
                SYSTEM AUDIT MANIFEST
              </Typography>
              <Box sx={{ position: 'relative', ml: 4, pl: 6, borderLeft: '3px solid rgba(124, 58, 237, 0.1)' }}>
                {data.recentLogs && data.recentLogs.length > 0 ? (
                  data.recentLogs.map((log: any, index: number) => (
                    <Box key={log._id} sx={{ mb: 6, position: 'relative' }}>
                      <Box sx={{ 
                        position: 'absolute', 
                        left: '-57px', 
                        top: '0', 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        bgcolor: 'var(--primary)',
                        boxShadow: '0 0 20px var(--primary)',
                        border: '4px solid var(--bg-obsidian)',
                        zIndex: 1
                      }} className="led-pulse" />
                      
                      <Box sx={{ 
                        p: 4, 
                        borderRadius: 5, 
                        bgcolor: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        transition: 'var(--transition-smooth)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'var(--primary)' }
                      }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="999" color="#fff" sx={{ mb: 1 }}>
                              {log.action}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                              {log.details}
                            </Typography>
                            <Box display="flex" gap={3} alignItems="center">
                              <Box display="flex" gap={1.5} alignItems="center">
                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', fontWeight: 900, fontSize: 12 }}>
                                  {log.user?.profile?.name?.charAt(0) || 'O'}
                                </Avatar>
                                <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 999, letterSpacing: 0.5 }}>
                                  {log.user?.profile?.name || 'ROOT OPERATOR'}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 'bold' }}>
                                • {new Date(log.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={log.module.toUpperCase()} 
                            size="small" 
                            sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'text.secondary', fontWeight: 999, borderRadius: 1.5, px: 1 }} 
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box textAlign="center" py={10} sx={{ border: '2px dashed rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <Typography color="text.muted" fontWeight="999">NO AUDIT DATA DETECTED</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
