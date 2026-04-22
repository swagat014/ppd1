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
  CircularProgress,
  Tooltip,
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
import Leaderboard from '../../components/common/Leaderboard';
import {
  LineChart,
  Line,
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
  PolarRadiusAxis,
  Legend,
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
      <Box sx={{ p: { xs: 2, md: 4 }, background: 'transparent' }} className="dashboard-entry-1">
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={6}>
          <Box>
            <Typography variant="h3" fontWeight="999" className="text-gradient" sx={{ letterSpacing: -1, mb: 1 }}>
              ACADEMIC COMMAND
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 500 }}>
              Monitoring architectural excellence and cognitive trajectories for the {user?.profile?.department || 'Research'} sector.
            </Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.1)', textAlign: 'right' }}>
            <Typography variant="caption" color="var(--primary)" fontWeight="999" sx={{ letterSpacing: 2, display: 'block', mb: 0.5 }}>ACTIVE CYCLE</Typography>
            <Typography variant="subtitle2" fontWeight="bold">2024-25 GENESIS</Typography>
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
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)',
                  '&:hover': { transform: 'translateY(-10px)', background: 'rgba(255,255,255,0.03)' }
                }}
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

          {/* Subject Mastery Radar */}
          <Grid item xs={12} md={6} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 500, p: 2 }}>
              <Typography variant="h6" fontWeight="999" mb={1} display="flex" alignItems="center" gap={1.5} sx={{ color: 'var(--accent-emerald)', letterSpacing: 1 }}>
                <TrendingUp /> SUBJECT MASTERY NEXUS
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: 'block' }}>Aggregate competency levels across core functional domains</Typography>
              <ResponsiveContainer width="100%" height="75%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={masteryData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 'bold' }} />
                  <Radar
                    name="Cohort"
                    dataKey="A"
                    stroke="var(--accent-emerald)"
                    fill="var(--accent-emerald)"
                    fillOpacity={0.2}
                    strokeWidth={4}
                  />
                  <ReTooltip contentStyle={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 16 }} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Students Needing Support Timeline */}
          <Grid item xs={12} md={6} className="dashboard-entry-2">
            <Card className="glass-card" sx={{ height: 500 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="999" mb={4} color="var(--secondary)" display="flex" alignItems="center" gap={2} sx={{ letterSpacing: 1 }}>
                  <FiberManualRecord className="led-pulse" sx={{ fontSize: 16 }} /> CRITICAL SUPPORT PULSE
                </Typography>
                <Stack spacing={3} sx={{ maxHeight: 360, overflowY: 'auto', pr: 2 }}>
                  {supportList.length > 0 ? supportList.map((student) => (
                    <Box key={student._id} sx={{ 
                      p: 3, 
                      borderRadius: 4, 
                      bgcolor: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: '0.3s',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(219, 39, 119, 0.2)' }
                    }}>
                      <Box display="flex" alignItems="center" gap={3}>
                        <Avatar sx={{ bgcolor: 'rgba(219, 39, 119, 0.1)', color: 'var(--secondary)', fontWeight: 900, width: 44, height: 44 }}>
                          {student.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="900" sx={{ color: '#fff' }}>{student.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>READINESS SCORE: {student.score}%</Typography>
                        </Box>
                      </Box>
                      <Button size="small" variant="contained" sx={{ borderRadius: 2, bgcolor: 'var(--secondary)', color: '#fff', fontWeight: 999, px: 3 }}>
                        DEPLOY SUPPORT
                      </Button>
                    </Box>
                  )) : (
                    <Box textAlign="center" py={12}>
                      <CheckCircle sx={{ fontSize: 60, color: 'var(--accent-emerald)', mb: 3, opacity: 0.3 }} />
                      <Typography color="text.secondary" fontWeight="900">ALL SYSTEMS OPTIMAL</Typography>
                      <Typography variant="caption" color="text.muted">Cohort proficiency exceeds baseline requirements.</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Class Schedule */}
          <Grid item xs={12} md={4} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: 500, p: 4 }}>
              <Typography variant="h6" fontWeight="999" mb={5} display="flex" alignItems="center" gap={2} sx={{ letterSpacing: 1 }}>
                <Event sx={{ color: 'var(--primary)' }} /> CLASS TIMELINE
              </Typography>
              <Box sx={{ position: 'relative', pl: 4, borderLeft: '2px solid rgba(255,255,255,0.03)' }}>
                {upcomingClasses.map((cl, idx) => (
                  <Box key={idx} sx={{ mb: 6, position: 'relative' }}>
                    <Box sx={{ 
                      position: 'absolute', left: '-41px', top: 0, 
                      width: 18, height: 18, borderRadius: '50%', 
                      bgcolor: cl.status === 'Next' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      boxShadow: cl.status === 'Next' ? '0 0 20px var(--primary)' : 'none',
                      border: '4px solid var(--bg-obsidian)',
                      zIndex: 1
                    }} />
                    <Typography variant="caption" sx={{ color: cl.status === 'Next' ? 'var(--primary)' : 'text.secondary', fontWeight: '999', display: 'block', mb: 1, letterSpacing: 1 }}>
                      {cl.time} {cl.status === 'Next' && '• IMMINENT'}
                    </Typography>
                    <Box sx={{ 
                      p: 3, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, 
                      background: cl.status === 'Next' ? 'rgba(124, 58, 237, 0.05)' : 'rgba(255,255,255,0.01)' 
                    }}>
                      <Typography variant="subtitle1" fontWeight="999" sx={{ color: '#fff' }}>{cl.subject}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>TARGET SECTOR: {cl.class}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* Cohort Progress Area Chart */}
          <Grid item xs={12} md={8} className="dashboard-entry-3">
            <Card className="glass-card" sx={{ height: 500, p: 4 }}>
              <Typography variant="h6" fontWeight="999" mb={4} sx={{ letterSpacing: 1 }}>
                COHORT RESILIENCE VELOCITY
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={performanceTrend}>
                  <defs>
                    <linearGradient id="teacherColorV2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} fontWeight="bold" />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} fontWeight="bold" domain={[0, 100]} />
                  <ReTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgScore" 
                    name="Readiness Velocity"
                    stroke="var(--secondary)" 
                    fillOpacity={1} 
                    fill="url(#teacherColorV2)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Academic Resources Hub */}
          <Grid item xs={12} className="dashboard-entry-3">
            <Card className="glass-card holographic-glow" sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
                <Box>
                  <Typography variant="h4" fontWeight="999" display="flex" alignItems="center" gap={2} className="text-gradient">
                    <LocalLibrary sx={{ fontSize: 32, color: 'var(--primary)' }} /> KNOWLEDGE VAULT
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>Distributed assets and synthesis materials for core domains</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => window.location.href = '/teacher/core-subjects'} 
                  sx={{ 
                    bgcolor: 'var(--primary)', 
                    borderRadius: 3, 
                    fontWeight: 999, 
                    px: 4, py: 1.5,
                    boxShadow: 'var(--glow-violet)'
                  }}
                >
                  SYNC NEW ASSET
                </Button>
              </Box>
              
              {loading ? (
                <Box textAlign="center" py={10}>
                  <CircularProgress color="primary" />
                </Box>
              ) : notes.length === 0 ? (
                <Box textAlign="center" py={15} sx={{ border: '2px dashed rgba(255,255,255,0.03)', borderRadius: 6 }}>
                  <PictureAsPdf sx={{ fontSize: 80, mb: 3, opacity: 0.1, color: 'var(--secondary)' }} />
                  <Typography color="text.secondary" fontWeight="900" sx={{ letterSpacing: 1 }}>THE VAULT IS CURRENTLY SEALED</Typography>
                  <Typography variant="caption" color="text.muted">No departmental assets detected in the current cycle.</Typography>
                </Box>
              ) : (
                <Grid container spacing={4}>
                  {notes.slice(0, 4).map((note) => (
                    <Grid item xs={12} sm={6} md={3} key={note._id}>
                      <Box className="glass-card" sx={{ 
                        p: 4, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)',
                        position: 'relative', overflow: 'hidden', height: '100%',
                        transition: 'var(--transition-smooth)', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'var(--primary)', transform: 'translateY(-5px)' }
                      }}>
                        <PictureAsPdf sx={{ position: 'absolute', top: -15, right: -15, fontSize: 100, opacity: 0.03, color: 'var(--secondary)' }} />
                        <Chip label={note.subject} size="small" sx={{ mb: 3, bgcolor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', fontWeight: '999', letterSpacing: 1 }} />
                        <Typography variant="h6" fontWeight="999" gutterBottom sx={{ color: '#fff' }}>{note.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 4, height: 44, overflow: 'hidden', fontWeight: 500 }}>
                          {note.description}
                        </Typography>
                        <Divider sx={{ my: 3, opacity: 0.05 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>{formatFileSize(note.fileSize)}</Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={() => handleDownload(note._id, note.fileName)} sx={{ color: 'var(--primary)', bgcolor: 'rgba(124, 58, 237, 0.05)' }}><Download fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => window.location.href = '/teacher/core-subjects'} sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}><Visibility fontSize="small" /></IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Card>
          </Grid>
          
          <Grid item xs={12} className="dashboard-entry-3">
             <Leaderboard limit={8} initialDepartment={user?.profile?.department} lockDepartment={true} />
          </Grid>
        </Grid>
      </Box>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
