import React from 'react';
import TpoLayout from '../../components/tpo/TpoLayout';
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
  Description,
  TrendingUp,
  EmojiEvents,
  Business,
  School,
} from '@mui/icons-material';

const TpoDashboard: React.FC = () => {
  // Sample data for demonstration
  const stats = [
    { title: 'Total Students', value: '1,248', icon: <People />, color: 'primary' },
    { title: 'Placed Students', value: '987', icon: <Work />, color: 'success' },
    { title: 'Active Companies', value: '42', icon: <Business />, color: 'warning' },
    { title: 'Avg. Package', value: '₹6.2L', icon: <TrendingUp />, color: 'info' },
  ];

  const recentActivities = [
    { id: 1, text: 'Company XYZ visited campus for recruitment', time: '2 hours ago' },
    { id: 2, text: 'New placement record achieved: 95% students placed', time: '1 day ago' },
    { id: 3, text: 'Conducted mock interviews for 50 students', time: '2 days ago' },
    { id: 4, text: 'Updated company database with 15 new entries', time: '3 days ago' },
  ];

  const upcomingCompanies = [
    { name: 'TechCorp', role: 'Software Engineer', date: 'Jan 15, 2026', students: 50 },
    { name: 'Innovate Inc.', role: 'Data Analyst', date: 'Jan 18, 2026', students: 30 },
    { name: 'Global Solutions', role: 'DevOps Engineer', date: 'Jan 22, 2026', students: 25 },
    { name: 'Future Tech', role: 'Full Stack Developer', date: 'Jan 25, 2026', students: 40 },
  ];

  return (
    <TpoLayout>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Page Header */}
          <Grid item xs={12}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              TPO Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage student placements and track performance metrics
            </Typography>
          </Grid>

          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
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
                      label={index % 2 === 0 ? '+12% from last month' : '+8% from last quarter'}
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
            <Card>
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

          {/* Upcoming Companies */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Upcoming Companies
                </Typography>
                <List>
                  {upcomingCompanies.map((company, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Business color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${company.name} - ${company.role}`}
                          secondary={`Date: ${company.date} | Eligible Students: ${company.students}`}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Chart Placeholder */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Placement Statistics
                </Typography>
                <Box
                  height={300}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border={1}
                  borderColor="divider"
                  borderRadius={2}
                >
                  <Typography color="text.secondary">
                    Placement Analytics Chart would appear here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </TpoLayout>
  );
};

export default TpoDashboard;
