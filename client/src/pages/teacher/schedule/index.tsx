import React, { useState, useEffect } from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Event,
  Schedule as ScheduleIcon,
  LocationOn,
  People,
  CalendarToday,
  AccessTime,
  Close,
} from '@mui/icons-material';
import axios from 'axios';
import { SkeletonDashboard } from '../../../components/common/SkeletonLoading';

interface ScheduleEvent {
  _id: string;
  title: string;
  description: string;
  type: 'class' | 'meeting' | 'exam' | 'deadline' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees?: string[];
  subject?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: 'class' | 'meeting' | 'exam' | 'deadline' | 'other';
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    subject: string;
  }>({
    title: '',
    description: '',
    type: 'class',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    subject: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulated API call
      // const response = await axios.get('/teacher/schedule');
      
      // Mock data
      setTimeout(() => {
        const today = new Date();
        const mockEvents: ScheduleEvent[] = [
          {
            _id: '1',
            title: 'Data Structures Lecture',
            description: 'Advanced tree structures and algorithms',
            type: 'class',
            date: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
            startTime: '10:00 AM',
            endTime: '11:30 AM',
            location: 'Room 301, CS Building',
            subject: 'Data Structures',
            status: 'scheduled',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            title: 'Faculty Meeting',
            description: 'Department curriculum review',
            type: 'meeting',
            date: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
            startTime: '02:00 PM',
            endTime: '03:30 PM',
            location: 'Conference Room A',
            status: 'scheduled',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '3',
            title: 'Mid-Term Exam',
            description: 'Database Management Systems',
            type: 'exam',
            date: new Date(today.setDate(today.getDate() + 3)).toISOString(),
            startTime: '09:00 AM',
            endTime: '11:00 AM',
            location: 'Exam Hall 2',
            subject: 'DBMS',
            status: 'scheduled',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '4',
            title: 'Assignment Deadline',
            description: 'DSA Problem Set 3 submission',
            type: 'deadline',
            date: new Date(today.setDate(today.getDate() + 5)).toISOString(),
            startTime: '11:59 PM',
            endTime: '11:59 PM',
            location: 'Online',
            subject: 'Data Structures',
            status: 'scheduled',
            createdAt: new Date().toISOString(),
          },
        ];
        setEvents(mockEvents);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      console.error('Error fetching schedule:', err);
      setError(err.response?.data?.message || 'Failed to fetch schedule');
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    switch (activeTab) {
      case 0: // All
        return events;
      case 1: // Today
        return events.filter((e) => {
          const eventDate = new Date(e.date);
          return eventDate.toDateString() === now.toDateString();
        });
      case 2: // Upcoming
        return events.filter((e) => new Date(e.date) > now);
      case 3: // Past
        return events.filter((e) => new Date(e.date) < now);
      default:
        return events;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return '#6c63ff';
      case 'meeting':
        return '#00f593';
      case 'exam':
        return '#f72585';
      case 'deadline':
        return '#ffd60a';
      default:
        return '#00d4ff';
    }
  };

  const handleOpenDialog = (event?: ScheduleEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        type: event.type as any,
        date: new Date(event.date).toISOString().split('T')[0],
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        subject: event.subject || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        type: 'class',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        subject: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingEvent) {
        setEvents((prev) =>
          prev.map((e) =>
            e._id === editingEvent._id
              ? { ...e, ...formData, date: new Date(formData.date).toISOString() }
              : e
          )
        );
      } else {
        const newEvent: ScheduleEvent = {
          _id: Date.now().toString(),
          ...formData,
          date: new Date(formData.date).toISOString(),
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, newEvent]);
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents((prev) => prev.filter((e) => e._id !== id));
    }
  };

  const stats = [
    {
      title: 'Total Events',
      value: events.length,
      icon: <Event />,
      color: '#6c63ff',
    },
    {
      title: 'Classes',
      value: events.filter((e) => e.type === 'class').length,
      icon: <ScheduleIcon />,
      color: '#00f593',
    },
    {
      title: 'Exams',
      value: events.filter((e) => e.type === 'exam').length,
      icon: <CalendarToday />,
      color: '#f72585',
    },
    {
      title: 'Meetings',
      value: events.filter((e) => e.type === 'meeting').length,
      icon: <People />,
      color: '#00d4ff',
    },
  ];

  if (loading) {
    return (
      <TeacherLayout>
        <SkeletonDashboard type="teacher" />
      </TeacherLayout>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <TeacherLayout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography
                variant="h3"
                fontWeight="900"
                sx={{
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #ff4da6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                  mb: 1,
                }}
              >
                Schedule
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage your class schedule, appointments, and important events
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #6c63ff 30%, #f72585 90%)',
              }}
            >
              Add Event
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="glass-card">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        fontWeight="bold"
                        sx={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="900" mt={0.5} sx={{ color: '#fff' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        background: `linear-gradient(135deg, ${stat.color} 0%, rgba(0,0,0,0.5) 100%)`,
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
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="All Events" />
          <Tab label="Today" />
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>

        {/* Events List */}
        <Card className="glass-card">
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              {activeTab === 0 && 'All Events'}
              {activeTab === 1 && "Today's Events"}
              {activeTab === 2 && 'Upcoming Events'}
              {activeTab === 3 && 'Past Events'}
              {' '}({filteredEvents.length})
            </Typography>

            {filteredEvents.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Event sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography color="text.secondary">No events found</Typography>
              </Box>
            ) : (
              <List>
                {filteredEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event, index) => (
                    <React.Fragment key={event._id}>
                      <ListItem
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.02)',
                          borderRadius: 2,
                          mb: 1,
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: `${getEventTypeColor(event.type)}20`,
                              color: getEventTypeColor(event.type),
                            }}
                          >
                            <Event />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {event.title}
                              </Typography>
                              <Chip
                                label={event.type.toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: `${getEventTypeColor(event.type)}20`,
                                  color: getEventTypeColor(event.type),
                                  fontWeight: 'bold',
                                  fontSize: '0.65rem',
                                }}
                              />
                              {event.subject && (
                                <Chip
                                  label={event.subject}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box mt={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {event.description}
                              </Typography>
                              <Box display="flex" gap={3} mt={1} flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <CalendarToday fontSize="small" color="action" />
                                  <Typography variant="caption">
                                    {new Date(event.date).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <AccessTime fontSize="small" color="action" />
                                  <Typography variant="caption">
                                    {event.startTime} - {event.endTime}
                                  </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <LocationOn fontSize="small" color="action" />
                                  <Typography variant="caption">{event.location}</Typography>
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <IconButton size="small" onClick={() => handleOpenDialog(event)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(event._id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Add New Event'}
            <IconButton
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  label="Type"
                >
                  <MenuItem value="class">Class</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="deadline">Deadline</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  margin="normal"
                  placeholder="e.g., 10:00 AM"
                  required
                />
                <TextField
                  fullWidth
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  margin="normal"
                  placeholder="e.g., 11:30 AM"
                  required
                />
              </Box>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.title || !formData.date || !formData.startTime || !formData.endTime}
            >
              {editingEvent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </TeacherLayout>
  );
};

export default SchedulePage;