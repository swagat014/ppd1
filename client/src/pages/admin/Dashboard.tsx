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
} from '@mui/material';
import {
  People,
  Work,
  Assessment,
  BarChart,
  Settings,
  TrendingUp,
  EmojiEvents,
  Business,
  School,
  LocalLibrary,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', icon: <People />, color: 'primary' },
    { title: 'Students', value: '0', icon: <School />, color: 'success' },
    { title: 'TPO Officers', value: '0', icon: <Work />, color: 'warning' },
    { title: 'Teachers', value: '0', icon: <LocalLibrary />, color: 'info' },
    { title: 'Departments', value: '0', icon: <Business />, color: 'secondary' },
    { title: 'Colleges', value: '1', icon: <Assessment />, color: 'primary' },
  ]);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/dashboard');
      const data = response.data.data;
      
      setStats([
        { title: 'Total Users', value: data.totalUsers.toString(), icon: <People />, color: 'primary' },
        { title: 'Students', value: data.students.toString(), icon: <School />, color: 'success' },
        { title: 'TPO Officers', value: data.tpos.toString(), icon: <Work />, color: 'warning' },
        { title: 'Teachers', value: data.teachers.toString(), icon: <LocalLibrary />, color: 'info' },
        { title: 'Departments', value: data.departments.toString(), icon: <Business />, color: 'secondary' },
        { title: 'Colleges', value: '1', icon: <Assessment />, color: 'primary' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const recentActivities = [
    { id: 1, text: 'New user registration: John Doe (Student)', time: '5 minutes ago' },
    { id: 2, text: 'System configuration updated', time: '30 minutes ago' },
    { id: 3, text: 'New college added: ABC Institute', time: '1 hour ago' },
    { id: 4, text: 'User deactivated: Jane Smith', time: '2 hours ago' },
    { id: 5, text: 'New department created: Computer Science', time: '3 hours ago' },
  ];

  const systemStatus = [
    { name: 'Database', status: 'Operational', indicator: 'online' },
    { name: 'API Server', status: 'Operational', indicator: 'online' },
    { name: 'Web Server', status: 'Operational', indicator: 'online' },
    { name: 'Email Service', status: 'Warning', indicator: 'warning' },
  ];

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Page Header */}
          <Grid item xs={12}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              System administration and management console
            </Typography>
          </Grid>

          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" variant="h6">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" mt={1}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        backgroundColor: `${stat.color}.main`,
                        color: 'white',
                        width: 56,
                        height: 56,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                  <Box mt={2}>
                    <Chip
                      label={index % 2 === 0 ? '+5% from last week' : '+12% from last month'}
                      size="small"
                      color={index % 2 === 0 ? 'success' : 'primary'}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Recent Activities
                </Typography>
                <List>
                  {recentActivities.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <EmojiEvents color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.text}
                          secondary={activity.time}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* System Status */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  System Status
                </Typography>
                <List>
                  {systemStatus.map((service, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: service.indicator === 'online' ? 'success.main' : 
                                       service.indicator === 'warning' ? 'warning.main' : 'error.main'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={service.name}
                          secondary={service.status}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* User Distribution Chart Placeholder */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  User Distribution
                </Typography>
                <Box
                  height={250}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border={1}
                  borderColor="divider"
                  borderRadius={2}
                >
                  <Typography color="text.secondary">
                    User Distribution Chart would appear here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Placement Overview Chart Placeholder */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Placement Overview
                </Typography>
                <Box
                  height={250}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border={1}
                  borderColor="divider"
                  borderRadius={2}
                >
                  <Typography color="text.secondary">
                    Placement Overview Chart would appear here
                  </Typography>
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
