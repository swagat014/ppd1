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
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

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
  const [notes, setNotes] = useState<CoreSubjectNote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sample data for demonstration
  const stats = [
    { title: 'My Students', value: '128', icon: <People />, color: 'primary' },
    { title: 'Pending Assignments', value: '24', icon: <Assignment />, color: 'warning' },
    { title: 'Avg. Grade', value: '82%', icon: <Grade />, color: 'success' },
    { title: 'Classes', value: '6', icon: <School />, color: 'info' },
    { title: 'Resources', value: notes.length.toString(), icon: <LocalLibrary />, color: 'secondary' },
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

  useEffect(() => {
    fetchTeacherNotes();
  }, []);

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

          {/* Recently Uploaded Notes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Recently Uploaded Notes
                  </Typography>
                  <Chip 
                    label={`${notes.length} notes`} 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
                
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <Typography>Loading notes...</Typography>
                  </Box>
                ) : notes.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <PictureAsPdf sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No notes uploaded yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload your first PDF note in Core Subjects section
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {notes.slice(0, 5).map((note) => (
                      <React.Fragment key={note._id}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            <PictureAsPdf color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body1" fontWeight="medium">
                                  {note.title}
                                </Typography>
                                <Chip 
                                  label={note.subject} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: 'rgba(0, 204, 82, 0.2)',
                                    color: '#00cc52',
                                    fontWeight: 'bold'
                                  }} 
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {note.description.substring(0, 80)}...
                                </Typography>
                                <Box display="flex" gap={2} mt={0.5}>
                                  <Typography variant="caption" color="text.secondary">
                                    Semester {note.semester}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatFileSize(note.fileSize)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {note.downloads} downloads
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                          <Box display="flex" gap={1}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownload(note._id, note.fileName)}
                              title="Download"
                            >
                              <Download />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => window.location.href = '/teacher/core-subjects'}
                              title="View All Notes"
                            >
                              <Visibility />
                            </IconButton>
                          </Box>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                    {notes.length > 5 && (
                      <ListItem>
                        <Box width="100%" textAlign="center" py={2}>
                          <Button 
                            variant="outlined" 
                            onClick={() => window.location.href = '/teacher/core-subjects'}
                          >
                            View All {notes.length} Notes
                          </Button>
                        </Box>
                      </ListItem>
                    )}
                  </List>
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
