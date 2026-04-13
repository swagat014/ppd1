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

const COLORS = ['#6c63ff', '#00f593', '#ffd60a', '#f72585', '#00d4ff'];

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
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ mb: 2 }} className="dashboard-entry-1">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" fontWeight="900" sx={{
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #6c63ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px'
                }}>
                  Admin Command Center
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                  Live System Intelligence & Performance Overseer
                </Typography>
              </Box>
              <Box>
                <Chip 
                  icon={<Autorenew className="led-pulse" />} 
                  label="LIVE SYSTEM PULSE" 
                  color="success" 
                  variant="outlined" 
                  sx={{ borderRadius: 2, fontWeight: 'bold' }} 
                />
              </Box>
            </Box>
          </Grid>

          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} className={`dashboard-entry-${(index % 3) + 1}`}>
              <Card className="glass-card">
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" variant="subtitle2" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="900" mt={0.5} sx={{ color: '#fff' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        backgroundColor: `${stat.color}.main`,
                        color: 'white',
                        width: 52,
                        height: 52,
                        boxShadow: `0 4px 15px ${stat.color === 'primary' ? 'rgba(108, 99, 255, 0.4)' : 'rgba(0,0,0,0.3)'}`
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {/* Quick Actions */}
          <Grid item xs={12} className="dashboard-entry-1">
            <Card className="glass-card neon-border-purple">
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                  <Speed color="primary" /> Strategic Control Hub
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddCircleOutline />}
                      onClick={() => navigate('/admin/users')}
                      sx={{ py: 1.8, borderRadius: 3, background: 'linear-gradient(135deg, #6c63ff 0%, #4a42d4 100%)', boxShadow: '0 8px 20px rgba(108, 99, 255, 0.3)' }}
                    >
                      Infrastructure Users
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CloudUpload />}
                      onClick={() => navigate('/admin/bulk-upload')}
                      sx={{ py: 1.8, borderRadius: 3, background: 'linear-gradient(135deg, #00f593 0%, #00cc52 100%)', color: '#000', fontWeight: 'bold' }}
                    >
                      Bulk Synthesis (CSV)
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AdminPanelSettings />}
                      onClick={() => navigate('/admin/settings')}
                      sx={{ py: 1.8, borderRadius: 3, background: 'linear-gradient(135deg, #ffd60a 0%, #ffc300 100%)', color: '#000', fontWeight: 'bold' }}
                    >
                      System Protocols
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Assessment />}
                      onClick={() => navigate('/admin/placement-stats')}
                      sx={{ py: 1.8, borderRadius: 3, background: 'linear-gradient(135deg, #00d4ff 0%, #00b8e6 100%)', color: '#000', fontWeight: 'bold' }}
                    >
                      Intelligence Reports
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* System Heartbeat Chart */}
          <Grid item xs={12} md={8} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent sx={{ height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    System Response Heartbeat (Latent Pulse)
                  </Typography>
                  <Chip size="small" label="NORMAL" color="success" className="led-pulse" />
                </Box>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={heartbeatData}>
                    <defs>
                      <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 150]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1228', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: 12 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00d4ff" 
                      fillOpacity={1} 
                      fill="url(#colorPulse)" 
                      strokeWidth={3}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* System Environment Status */}
          <Grid item xs={12} md={4} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Environment Integrity
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {[
                    { name: 'Database (MongoDB)', status: 'Connected', color: '#00f593', icon: <Circle className="led-pulse" sx={{ fontSize: 12 }} /> },
                    { name: 'API Gateway', status: 'Operational', color: '#00f593', icon: <Circle className="led-pulse" sx={{ fontSize: 12 }} /> },
                    { name: 'Auth Server', status: 'Secure', color: '#00d4ff', icon: <Circle className="led-pulse" sx={{ fontSize: 12 }} /> },
                    { name: 'File Storage', status: 'Healthy', color: '#00f593', icon: <Circle className="led-pulse" sx={{ fontSize: 12 }} /> },
                    { name: 'Email Dispatcher', status: 'Standby', color: '#ffd60a', icon: <Circle className="led-pulse" sx={{ fontSize: 12 }} /> },
                    { name: 'Audit Engine', status: 'Active', color: '#f72585', icon: <Circle className="led-pulse" sx={{ fontSize: 12 }} /> },
                  ].map((service, idx) => (
                    <Box key={idx} sx={{ 
                      p: 1.8, 
                      borderRadius: '16px',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Typography fontWeight="500" variant="body2">{service.name}</Typography>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography variant="caption" sx={{ color: service.color, fontWeight: 'bold', letterSpacing: '1px' }}>{service.status}</Typography>
                        <Box sx={{ color: service.color }}>{service.icon}</Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User Distribution Chart */}
          <Grid item xs={12} md={6} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Identity Distribution
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={data.userDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(data.userDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1228', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Placement Status Overview */}
          <Grid item xs={12} md={6} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Success Conversion Map
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={placementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1228', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    />
                    <Bar dataKey="value" name="Personnel" radius={[8, 8, 0, 0]}>
                      {placementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities Timeline */}
          <Grid item xs={12} className="dashboard-entry-3">
            <Card className="glass-card">
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={4}>
                  Secure System Protocols (Audit Log)
                </Typography>
                <Box sx={{ position: 'relative', ml: 4, pl: 4, borderLeft: '2px solid rgba(108, 99, 255, 0.2)' }}>
                  {data.recentLogs && data.recentLogs.length > 0 ? (
                    data.recentLogs.map((log: any, index: number) => (
                      <Box key={log._id} sx={{ mb: 4, position: 'relative' }}>
                        <Box sx={{ 
                          position: 'absolute', 
                          left: '-43px', 
                          top: '0', 
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          bgcolor: '#6c63ff',
                          boxShadow: '0 0 10px #6c63ff'
                        }} className="led-pulse" />
                        
                        <Box sx={{ 
                          p: 2.5, 
                          borderRadius: '20px', 
                          bgcolor: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          transition: '0.3s',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(108, 99, 255, 0.3)' }
                        }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="body1" fontWeight="700" color="#f0f4ff">
                                {log.action}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {log.details}
                              </Typography>
                              <Box display="flex" gap={2} mt={1.5} alignItems="center">
                                <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'primary.main' }}>
                                  {log.user?.profile?.name?.charAt(0) || 'U'}
                                </Avatar>
                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                  {log.user?.profile?.name || 'Unknown Operator'}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.5 }}>
                                  • {new Date(log.createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip 
                              label={log.module.toUpperCase()} 
                              size="small" 
                              sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1.5, fontSize: '0.65rem' }} 
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary" align="center" py={4}>No operational logs detected</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
