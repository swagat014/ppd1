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
      <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.light">
                Student Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Insightful performance metrics across the entire student population.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExport}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              Export CSV
            </Button>
          </Box>

          {/* Key Metrics Row */}
          <Grid container spacing={3} mb={6}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(0, 255, 100, 0.2)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Group sx={{ color: '#00ff64' }} />
                    <Typography variant="subtitle1" color="textSecondary">Total Students</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">{summary.totalStudents}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Assessment sx={{ color: '#00d4ff' }} />
                    <Typography variant="subtitle1" color="textSecondary">Avg Readiness</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">{summary.averageReadiness.toFixed(1)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(255, 179, 0, 0.2)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <School sx={{ color: '#ffb300' }} />
                    <Typography variant="subtitle1" color="textSecondary">Departments</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">{departmentWise.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(126, 87, 194, 0.2)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <TrendingUp sx={{ color: '#7e57c2' }} />
                    <Typography variant="subtitle1" color="textSecondary">Top Performer</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">92%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Dept-wise Performance Bar Chart */}
            <Grid item xs={12} lg={8}>
              <Paper className="glass-card" sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Department-wise Performance
                </Typography>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={departmentWise}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="_id" 
                      stroke="rgba(255,255,255,0.5)" 
                      fontSize={12} 
                      tickFormatter={(val) => val.split(' ')[0]} 
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      itemStyle={{ color: '#00ff64' }}
                    />
                    <Legend />
                    <Bar dataKey="avgReadiness" name="Overall Readiness" fill="#00ff64" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgTechnical" name="Technical" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Readiness Distribution Pie Chart */}
            <Grid item xs={12} lg={4}>
              <Paper className="glass-card" sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Readiness Distribution
                </Typography>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Top Students / Dept Details Table */}
            <Grid item xs={12}>
              <Paper className="glass-card" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Department Statistics
                </Typography>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <Grid container spacing={2}>
                  {departmentWise.map((dept: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={dept._id}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="subtitle2" color="primary.light" noWrap>{dept._id}</Typography>
                        <Box display="flex" justifyContent="space-between" mt={1}>
                          <Typography variant="body2" color="textSecondary">Students:</Typography>
                          <Typography variant="body2" fontWeight="bold">{dept.studentCount}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="textSecondary">Avg Score:</Typography>
                          <Typography variant="body2" fontWeight="bold">{dept.avgReadiness.toFixed(1)}%</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
      </Container>
    </AdminLayout>
  );
};

export default AnalyticsPage;