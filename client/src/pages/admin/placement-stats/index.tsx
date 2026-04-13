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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Work,
  CurrencyRupee,
  Business,
  CheckCircle,
  FileDownload,
} from '@mui/icons-material';
import { Button } from '@mui/material';
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

const COLORS = ['#00ff64', '#00d4ff', '#ffb300', '#ff4d4d', '#7e57c2'];

const PlacementStatsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlacementStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/placement-stats');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch placement stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementStats();
  }, []);

  const handleExport = () => {
    if (!data) return;
    
    const { statusDistribution, topCompanies, avgPackage } = data;
    const totalPlaced = statusDistribution.find((s: any) => s._id === 'Placed')?.count || 0;

    const headers = ['Category', 'Value'];
    const rows = [
      ['Total Placed', totalPlaced],
      ['Average Package', avgPackage],
      ...statusDistribution.map((s: any) => [`Status: ${s._id}`, s.count]),
      ...topCompanies.map((c: any) => [`Company: ${c._id}`, c.count])
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `placement_stats_${new Date().toLocaleDateString()}.csv`);
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

  const { statusDistribution, packageDistribution, topCompanies, departmentWise, avgPackage } = data;

  const statusPieData = statusDistribution.map((item: any) => ({
    name: item._id,
    value: item.count,
  }));

  const pkgBarData = packageDistribution.map((item: any) => ({
    range: item._id,
    count: item.count,
  }));

  const totalPlaced = statusDistribution.find((s: any) => s._id === 'Placed')?.count || 0;
  const totalOffered = statusDistribution.find((s: any) => s._id === 'Offered')?.count || 0;
  const totalNotPlaced = statusDistribution.find((s: any) => s._id === 'Not Placed')?.count || 0;
  const totalStudents = totalPlaced + totalOffered + totalNotPlaced;
  const placementRate = totalStudents > 0 ? ((totalPlaced / totalStudents) * 100).toFixed(1) : '0';

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.light">
                Placement Statistics
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Comprehensive overview of hiring trends and salary distribution.
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
                    <CheckCircle sx={{ color: '#00ff64' }} />
                    <Typography variant="subtitle1" color="textSecondary">Placement Rate</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">{placementRate}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Work sx={{ color: '#00d4ff' }} />
                    <Typography variant="subtitle1" color="textSecondary">Total Placed</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">{totalPlaced}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(255, 179, 0, 0.2)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Business sx={{ color: '#ffb300' }} />
                    <Typography variant="subtitle1" color="textSecondary">Companies Hired</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">{topCompanies.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card" sx={{ height: '100%', border: '1px solid rgba(126, 87, 194, 0.2)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <CurrencyRupee sx={{ color: '#7e57c2' }} />
                    <Typography variant="subtitle1" color="textSecondary">Avg Package</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">₹{(avgPackage || 0).toFixed(1)}L</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Dept-wise Placement Rate Bar Chart */}
            <Grid item xs={12} lg={7}>
              <Paper className="glass-card" sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Placement Rate by Department
                </Typography>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={departmentWise} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} domain={[0, 100]} />
                    <YAxis 
                      dataKey="department" 
                      type="category" 
                      stroke="rgba(255,255,255,0.5)" 
                      fontSize={10} 
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="rate" name="Placement Rate (%)" fill="#00ff64" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Status Distribution Pie Chart */}
            <Grid item xs={12} lg={5}>
              <Paper className="glass-card" sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Employment Status
                </Typography>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusPieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Package Range Bar Chart */}
            <Grid item xs={12} md={6}>
              <Paper className="glass-card" sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Package Distribution (LPA)
                </Typography>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={pkgBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    />
                    <Bar dataKey="count" name="Students" fill="#7e57c2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Top Hiring Companies Table */}
            <Grid item xs={12} md={6}>
              <Paper className="glass-card" sx={{ p: 3, height: 400, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Top Hiring Companies
                </Typography>
                <Divider sx={{ mb: 3, opacity: 0.1 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>Company Name</TableCell>
                        <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>Offers</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topCompanies.map((company: any) => (
                        <TableRow key={company._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ color: 'primary.light' }}>{company._id}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{company.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default PlacementStatsPage;