import React from 'react';
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
} from '@mui/icons-material';

const TeacherDashboard: React.FC = () => {
  // Sample data for demonstration
  const stats = [
    { title: 'My Students', value: '128', icon: <People />, color: 'primary' },
    { title: 'Pending Assignments', value: '24', icon: <Assignment />, color: 'warning' },
    { title: 'Avg. Grade', value: '82%', icon: <Grade />, color: 'success' },
    { title: 'Classes', value: '6', icon: <School />, color: 'info' },
    { title: 'Resources', value: '42', icon: <LocalLibrary />, color: 'secondary' },
    { title: 'Scheduled Events', value: '5', icon: <Event />, color: 'primary' },
  ];

  const recentActivities = [
    { id: 1, text: 'Graded assignment: Data Structures homework', time: '15 minutes ago' },
    { id: 2, text: 'Added new learning resource: Algorithm tutorials', time: '1 hour ago' },
    { id: 3, text: 'Updated student progress for John Smith', time: '2 hours ago' },
    { id: 4, text: 'Created new assignment: OOP Concepts', time: '4 hours ago' },
    { id: 5, text: 'Sent feedback to 8 students on their projects', time: '5 hours ago' },
  ];

  const upcomingClasses = [
    { subject: 'Data Structures', class: 'CS301', time: '9:00 AM - 10:30 AM', students: 32 },
    { subject: 'Algorithms', class: 'CS302', time: '11:00 AM - 12:30 PM', students: 28 },
    { subject: 'Database Systems', class: 'CS401', time: '2:00 PM - 3:30 PM', students: 25 },
  ];

  return (
    <TeacherLayout>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Page Header */}
          <Grid item xs={12}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Teacher Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your classes, assignments, and student progress
            </Typography>
          </Grid>

          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                      label={index % 2 === 0 ? '+3 from last week' : '+12% improvement'}
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

          {/* Upcoming Classes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Upcoming Classes
                </Typography>
                <List>
                  {upcomingClasses.map((classItem, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <School color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${classItem.subject} (${classItem.class})`}
                          secondary={`${classItem.time} | Students: ${classItem.students}`}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Student Progress Chart Placeholder */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Student Performance
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
                    Student Performance Chart would appear here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Assignment Overview Chart Placeholder */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Assignment Completion
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
                    Assignment Overview Chart would appear here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
