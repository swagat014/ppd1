import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  Group,
  Assessment,
  School,
  FileDownload,
} from '@mui/icons-material';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#00ff64', '#00d4ff', '#ffb300', '#ff4d4d', '#7e57c2', '#f06292'];

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/analytics');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExport = () => {
    if (!data) return;
    
    const headers = ['Department', 'Students', 'Avg Readiness (%)', 'Avg Technical (%)'];
    const rows = departmentWise.map((dept: any) => [
      dept._id,
      dept.studentCount,
      dept.avgReadiness.toFixed(2),
      dept.avgTechnical.toFixed(2)
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_analytics_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress color="primary" />
        </Box>
      </AdminLayout>
    );
  }

  const { departmentWise, readinessLevelDistribution, summary } = data;

  // Prepare data for readiness distribution pie chart
  const pieData = readinessLevelDistribution.map((item: any) => ({
    name: item._id,
    value: item.count,
  }));

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, background: 'transparent' }} className="dashboard-entry-1">
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={6}>
          <Box>
            <Typography variant="h3" fontWeight="999" className="text-gradient" sx={{ letterSpacing: -1, mb: 1 }}>
              INTELLIGENCE SYNTHESIS
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 500 }}>
              Insightful performance metrics across the entire student population.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExport}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              fontWeight: 999,
              px: 4, py: 1.5,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)' }
            }}
          >
            EXPORT MANIFEST
          </Button>
        </Box>

        {/* Key Metrics Row */}
        <Grid container spacing={4} mb={8}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card holographic-glow" sx={{ border: '1px solid rgba(52, 211, 153, 0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Group sx={{ color: 'var(--accent-emerald)' }} />
                  </Box>
                  <Typography variant="caption" fontWeight="999" sx={{ letterSpacing: 1.5, color: 'text.secondary', textTransform: 'uppercase' }}>TOTAL STUDENTS</Typography>
                </Box>
                <Typography variant="h3" fontWeight="999" sx={{ letterSpacing: -1 }}>{summary.totalStudents}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card holographic-glow" sx={{ border: '1px solid rgba(34, 211, 238, 0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(34, 211, 238, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Assessment sx={{ color: 'var(--accent-cyan)' }} />
                  </Box>
                  <Typography variant="caption" fontWeight="999" sx={{ letterSpacing: 1.5, color: 'text.secondary', textTransform: 'uppercase' }}>AVG READINESS</Typography>
                </Box>
                <Typography variant="h3" fontWeight="999" sx={{ letterSpacing: -1 }}>{summary.averageReadiness.toFixed(1)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card holographic-glow" sx={{ border: '1px solid rgba(251, 191, 36, 0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <School sx={{ color: 'var(--accent-amber)' }} />
                  </Box>
                  <Typography variant="caption" fontWeight="999" sx={{ letterSpacing: 1.5, color: 'text.secondary', textTransform: 'uppercase' }}>DEPARTMENTS</Typography>
                </Box>
                <Typography variant="h3" fontWeight="999" sx={{ letterSpacing: -1 }}>{departmentWise.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card holographic-glow" sx={{ border: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp sx={{ color: 'var(--primary)' }} />
                  </Box>
                  <Typography variant="caption" fontWeight="999" sx={{ letterSpacing: 1.5, color: 'text.secondary', textTransform: 'uppercase' }}>TOP GRADIENT</Typography>
                </Box>
                <Typography variant="h3" fontWeight="999" sx={{ letterSpacing: -1 }}>92%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Dept-wise Performance Bar Chart */}
          <Grid item xs={12} lg={8}>
            <Card className="glass-card" sx={{ p: 4, height: 500 }}>
              <Typography variant="h6" fontWeight="999" mb={4} sx={{ letterSpacing: 1 }}>
                DEPARTMENTAL PROFICIENCY MATRIX
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={departmentWise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis 
                    dataKey="_id" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={11} 
                    fontWeight="bold"
                    tickFormatter={(val) => val.split(' ')[0]} 
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="avgReadiness" name="Overall Readiness" fill="var(--accent-emerald)" radius={[10, 10, 0, 0]} opacity={0.8} />
                  <Bar dataKey="avgTechnical" name="Technical Index" fill="var(--accent-cyan)" radius={[10, 10, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Readiness Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card className="glass-card" sx={{ p: 4, height: 500 }}>
              <Typography variant="h6" fontWeight="999" mb={4} sx={{ letterSpacing: 1 }}>
                READINESS SPECTRUM
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--glass-border)', borderRadius: 16 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Dept Details Grid */}
          <Grid item xs={12}>
            <Card className="glass-card" sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="999" mb={5} sx={{ letterSpacing: 1 }}>
                SECTOR ANALYTICS MANIFEST
              </Typography>
              <Grid container spacing={3}>
                {departmentWise.map((dept: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={dept._id}>
                    <Box sx={{ 
                      p: 4, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)',
                      transition: 'var(--transition-smooth)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: 'var(--primary)' }
                    }}>
                      <Typography variant="subtitle1" fontWeight="999" color="var(--primary)" sx={{ mb: 2, letterSpacing: 0.5 }} noWrap>{dept._id}</Typography>
                      <Divider sx={{ mb: 3, opacity: 0.05 }} />
                      <Box display="flex" justifyContent="space-between" mb={1.5}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 900 }}>COHORT SIZE</Typography>
                        <Typography variant="body2" fontWeight="999" sx={{ color: '#fff' }}>{dept.studentCount}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 900 }}>MEAN SCORE</Typography>
                        <Typography variant="body2" fontWeight="999" sx={{ color: 'var(--accent-emerald)' }}>{dept.avgReadiness.toFixed(1)}%</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AnalyticsPage;