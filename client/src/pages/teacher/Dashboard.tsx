import React, { useState, useEffect } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
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
  IconButton,
  Button,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  School,
  Assignment,
  Assessment,
  BarChart,
  Chat,
  Grade,
  Event,
  People,
  TrendingUp,
  EmojiEvents,
  LocalLibrary,
  PictureAsPdf,
  Download,
  Visibility,
  AccessTime,
  CheckCircle,
  FiberManualRecord,
  Add,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonDashboard } from '../../components/common/SkeletonLoading';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

interface CoreSubjectNote {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  subject: string;
  semester: number;
  academicYear: string;
  downloads: number;
  createdAt: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [performanceTrend, setPerformanceTrend] = useState<any[]>([]);
  const [supportList, setSupportList] = useState<any[]>([]);
  const [notes, setNotes] = useState<CoreSubjectNote[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchTeacherNotes();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/teacher/dashboard');
      if (response.data.success) {
        setTeacherStats(response.data.data.stats);
        setPerformanceTrend(response.data.data.performanceTrend || []);
        setSupportList(response.data.data.studentsNeedingSupport || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const masteryData = [
    { subject: 'DSA', A: 85, fullMark: 100 },
    { subject: 'OS', A: 70, fullMark: 100 },
    { subject: 'DBMS', A: 90, fullMark: 100 },
    { subject: 'Aptitude', A: 65, fullMark: 100 },
    { subject: 'Soft Skills', A: 75, fullMark: 100 },
    { subject: 'Projects', A: 80, fullMark: 100 },
  ];

  const stats = [
    { title: 'My Students', value: teacherStats?.totalStudents?.toString() || '0', icon: <People />, color: 'primary' },
    { title: 'Pending Sync', value: teacherStats?.pendingAssignments?.toString() || '0', icon: <Assignment />, color: 'warning' },
    { title: 'Cohort Readiness', value: `${teacherStats?.avgReadiness || 0}%`, icon: <Grade />, color: 'success' },
    { title: 'Active Labs', value: teacherStats?.classes?.toString() || '0', icon: <School />, color: 'info' },
  ];

  const upcomingClasses = [
    { subject: 'Operating Systems', class: 'CS-A', time: '10:00 AM', status: 'Next', icon: <AccessTime /> },
    { subject: 'Database Management', class: 'CS-B', time: '12:00 PM', status: 'Pending', icon: <AccessTime /> },
    { subject: 'Computer Networks', class: 'CS-A', time: '02:30 PM', status: 'Pending', icon: <AccessTime /> },
  ];

  const fetchTeacherNotes = async () => {
    try {
      setLoading(true);
      const department = user?.profile?.department || 'CSE';
      const response = await axios.get(`/core-subjects/department/${department}`);
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error fetching teacher notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const response = await axios.get(`/core-subjects/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  };

  return (
    <TeacherLayout>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ mb: 2 }} className="dashboard-entry-1">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" fontWeight="900" sx={{
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #ff4da6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px'
                }}>
                  Academic Command
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                  Monitoring educational excellence and student trajectories
                </Typography>
              </Box>
              <Chip 
                label="ACADEMIC YEAR 2024-25" 
                variant="outlined" 
                sx={{ borderRadius: 2, borderColor: 'rgba(247, 37, 133, 0.3)', color: '#ff4da6', fontWeight: 'bold' }} 
              />
            </Box>
          </Grid>

          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} className={`dashboard-entry-${(index % 3) + 1}`}>
              <Card className="glass-card">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="caption" fontWeight="bold" sx={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="900" mt={0.5} sx={{ color: '#fff' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        background: `linear-gradient(135deg, ${stat.color === 'primary' ? '#6c63ff' : stat.color === 'success' ? '#00f593' : stat.color === 'warning' ? '#ffd60a' : '#00d4ff'} 0%, rgba(0,0,0,0.5) 100%)`,
                        width: 50,
                        height: 50,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Subject Mastery Radar */}
          <Grid item xs={12} md={6} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" mb={1} display="flex" alignItems="center" gap={1}>
                  <TrendingUp color="secondary" /> Subject Mastery Nexus
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Aggregate competency levels across core functional domains
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={masteryData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                    <Radar
                      name="Cohort"
                      dataKey="A"
                      stroke="#ff4da6"
                      fill="#ff4da6"
                      fillOpacity={0.6}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1228', border: '1px solid rgba(247, 37, 133, 0.3)', borderRadius: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Students Needing Support Timeline */}
          <Grid item xs={12} md={6} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3} color="#f72585" display="flex" alignItems="center" gap={1}>
                  <FiberManualRecord className="led-pulse" sx={{ fontSize: 14 }} /> Critical Support Pulse
                </Typography>
                <Stack spacing={2} sx={{ maxHeight: 340, overflowY: 'auto', pr: 1 }}>
                  {supportList.length > 0 ? supportList.map((student) => (
                    <Box key={student._id} sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      bgcolor: 'rgba(247, 37, 133, 0.05)', 
                      border: '1px solid rgba(247, 37, 133, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'rgba(247, 37, 133, 0.2)', color: '#f72585', fontWeight: 'bold', width: 32, height: 32, fontSize: '0.8rem' }}>
                          {student.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{student.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Score: {student.score}%</Typography>
                        </Box>
                      </Box>
                      <Button size="small" variant="outlined" color="secondary" sx={{ borderRadius: 1.5, fontSize: '0.6rem' }}>
                        Intervene
                      </Button>
                    </Box>
                  )) : (
                    <Box textAlign="center" py={5}>
                      <CheckCircle sx={{ fontSize: 48, color: '#00f593', mb: 2, opacity: 0.5 }} />
                      <Typography color="text.secondary">All students meet proficiency standards.</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Class Schedule */}
          <Grid item xs={12} md={4} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                  <Event color="primary" /> Class Timeline
                </Typography>
                <Box sx={{ position: 'relative', pl: 3, borderLeft: '2px dashed rgba(255,255,255,0.1)' }}>
                  {upcomingClasses.map((cl, idx) => (
                    <Box key={idx} sx={{ mb: 4, position: 'relative' }}>
                      <Box sx={{ 
                        position: 'absolute', left: '-31px', top: 0, 
                        width: 14, height: 14, borderRadius: '50%', 
                        bgcolor: cl.status === 'Next' ? '#ff4da6' : 'rgba(255,255,255,0.2)',
                        boxShadow: cl.status === 'Next' ? '0 0 10px #ff4da6' : 'none'
                      }} className={cl.status === 'Next' ? 'led-pulse' : ''} />
                      <Typography variant="caption" sx={{ color: cl.status === 'Next' ? '#ff4da6' : 'text.secondary', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                        {cl.time} {cl.status === 'Next' && '• COMING UP'}
                      </Typography>
                      <Box sx={{ 
                        p: 2, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2.5, 
                        background: cl.status === 'Next' ? 'rgba(255,255,255,0.03)' : 'transparent' 
                      }}>
                        <Typography variant="body2" fontWeight="bold">{cl.subject}</Typography>
                        <Typography variant="caption" color="text.secondary">Target: {cl.class}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cohort Progress Area Chart */}
          <Grid item xs={12} md={8} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: 450 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Cohort Resilience Velocity
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={performanceTrend}>
                    <defs>
                      <linearGradient id="teacherColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f72585" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f72585" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1228', border: '1px solid rgba(247, 37, 133, 0.3)', borderRadius: 12 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="avgScore" 
                      name="Readiness"
                      stroke="#f72585" 
                      fillOpacity={1} 
                      fill="url(#teacherColor)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Academic Resources Hub */}
          <Grid item xs={12} className="dashboard-entry-3">
            <Card className="glass-card neon-border-purple">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box>
                    <Typography variant="h5" fontWeight="900" display="flex" alignItems="center" gap={1}>
                      <LocalLibrary color="primary" /> Knowledge Repository
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Distributed assets and synthesis materials for core domains</Typography>
                  </Box>
                  <Button variant="contained" startIcon={<Add />} onClick={() => window.location.href = '/teacher/core-subjects'} sx={{ bgcolor: '#6c63ff', borderRadius: 2 }}>
                    Sync New Asset
                  </Button>
                </Box>
                
                {loading ? (
                  <Box textAlign="center" py={5}>
                    <SkeletonDashboard type="teacher" />
                  </Box>
                ) : notes.length === 0 ? (
                  <Box textAlign="center" py={8} sx={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 4 }}>
                    <PictureAsPdf sx={{ fontSize: 60, mb: 2, opacity: 0.1 }} />
                    <Typography color="text.secondary">The knowledge vault is currently empty.</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {notes.slice(0, 4).map((note) => (
                      <Grid item xs={12} sm={6} md={3} key={note._id}>
                        <Box sx={{ 
                          p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                          position: 'relative', overflow: 'hidden', height: '100%',
                          transition: '0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(108, 99, 255, 0.3)' }
                        }}>
                          <PictureAsPdf sx={{ position: 'absolute', top: -10, right: -10, fontSize: 80, opacity: 0.05, color: '#f72585' }} />
                          <Chip label={note.subject} size="small" sx={{ mb: 2, bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6c63ff', fontWeight: 'bold' }} />
                          <Typography variant="body1" fontWeight="bold" gutterBottom noWrap>{note.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, height: 40, overflow: 'hidden' }}>
                            {note.description}
                          </Typography>
                          <Divider sx={{ my: 2, opacity: 0.05 }} />
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">{formatFileSize(note.fileSize)}</Typography>
                            <Box>
                              <IconButton size="small" onClick={() => handleDownload(note._id, note.fileName)} color="primary"><Download /></IconButton>
                              <IconButton size="small" onClick={() => window.location.href = '/teacher/core-subjects'}><Visibility /></IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
