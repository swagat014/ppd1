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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  LinearProgress,
  Avatar,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Assignment,
  CalendarToday,
  People,
  CheckCircle,
  Schedule,
  Search,
  FilterList,
  Close,
} from '@mui/icons-material';
import axios from 'axios';
import { SkeletonDashboard, SkeletonTable } from '../../../components/common/SkeletonLoading';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  type: 'dsa' | 'aptitude' | 'core_subject' | 'project';
  dueDate: string;
  totalMarks: number;
  status: 'draft' | 'published' | 'closed';
  assignedTo: string[];
  submissions: Array<{
    studentId: string;
    submittedAt: string;
    marks?: number;
    status: 'pending' | 'submitted' | 'graded';
  }>;
  createdAt: string;
}

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    subject: string;
    type: 'dsa' | 'aptitude' | 'core_subject' | 'project';
    dueDate: string;
    totalMarks: number;
  }>({
    title: '',
    description: '',
    subject: '',
    type: 'dsa',
    dueDate: '',
    totalMarks: 100,
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchQuery, filterType, assignments, activeTab]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulated API call - replace with actual endpoint when available
      // const response = await axios.get('/teacher/assignments');
      // if (response.data.success) {
      //   setAssignments(response.data.data);
      // }
      
      // Mock data for now
      setTimeout(() => {
        setAssignments([
          {
            _id: '1',
            title: 'Array Manipulation Problems',
            description: 'Solve 5 array manipulation problems from the DSA sheet',
            subject: 'Data Structures',
            type: 'dsa',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalMarks: 100,
            status: 'published',
            assignedTo: ['student1', 'student2', 'student3'],
            submissions: [
              { studentId: 'student1', submittedAt: new Date().toISOString(), marks: 85, status: 'graded' },
              { studentId: 'student2', submittedAt: new Date().toISOString(), status: 'submitted' },
            ],
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            title: 'TCS Mock Aptitude Test',
            description: 'Complete the TCS pattern aptitude test',
            subject: 'Aptitude',
            type: 'aptitude',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            totalMarks: 50,
            status: 'published',
            assignedTo: ['student1', 'student2', 'student3', 'student4'],
            submissions: [],
            createdAt: new Date().toISOString(),
          },
          {
            _id: '3',
            title: 'DBMS Normalization Exercise',
            description: 'Practice normalization problems',
            subject: 'Database Management',
            type: 'core_subject',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            totalMarks: 50,
            status: 'draft',
            assignedTo: [],
            submissions: [],
            createdAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError(err.response?.data?.message || 'Failed to fetch assignments');
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = [...assignments];

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter((a) => a.status === 'published');
    } else if (activeTab === 2) {
      filtered = filtered.filter((a) => a.status === 'draft');
    } else if (activeTab === 3) {
      filtered = filtered.filter((a) => a.status === 'closed');
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.subject.toLowerCase().includes(query)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    setFilteredAssignments(filtered);
  };

  const handleOpenDialog = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        type: assignment.type,
        dueDate: assignment.dueDate.split('T')[0],
        totalMarks: assignment.totalMarks,
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        title: '',
        description: '',
        subject: '',
        type: 'dsa',
        dueDate: '',
        totalMarks: 100,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssignment(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAssignment) {
        // Update existing
        setAssignments((prev) =>
          prev.map((a) =>
            a._id === editingAssignment._id
              ? { ...a, ...formData, dueDate: new Date(formData.dueDate).toISOString() }
              : a
          )
        );
      } else {
        // Create new
        const newAssignment: Assignment = {
          _id: Date.now().toString(),
          ...formData,
          dueDate: new Date(formData.dueDate).toISOString(),
          status: 'draft',
          assignedTo: [],
          submissions: [],
          createdAt: new Date().toISOString(),
        };
        setAssignments((prev) => [newAssignment, ...prev]);
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save assignment');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    }
  };

  const handlePublish = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: 'published' as const } : a))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dsa':
        return '#6c63ff';
      case 'aptitude':
        return '#00f593';
      case 'core_subject':
        return '#ffd60a';
      case 'project':
        return '#f72585';
      default:
        return '#6c63ff';
    }
  };

  const stats = [
    {
      title: 'Total Assignments',
      value: assignments.length,
      icon: <Assignment />,
      color: '#6c63ff',
    },
    {
      title: 'Published',
      value: assignments.filter((a) => a.status === 'published').length,
      icon: <CheckCircle />,
      color: '#00f593',
    },
    {
      title: 'Drafts',
      value: assignments.filter((a) => a.status === 'draft').length,
      icon: <Schedule />,
      color: '#ffd60a',
    },
    {
      title: 'Total Submissions',
      value: assignments.reduce((acc, a) => acc + a.submissions.length, 0),
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

  return (
    <TeacherLayout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box my={4}>
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
            Assignments
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create, assign, and manage assignments for your students
          </Typography>
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

        {/* Actions Bar */}
        <Card className="glass-card" sx={{ mb: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                <TextField
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  sx={{ minWidth: 250 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="dsa">DSA</MenuItem>
                    <MenuItem value="aptitude">Aptitude</MenuItem>
                    <MenuItem value="core_subject">Core Subject</MenuItem>
                    <MenuItem value="project">Project</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                >
                  Clear
                </Button>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background: 'linear-gradient(45deg, #6c63ff 30%, #f72585 90%)',
                }}
              >
                Create Assignment
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="All Assignments" />
          <Tab label="Published" />
          <Tab label="Drafts" />
          <Tab label="Closed" />
        </Tabs>

        {/* Assignments Table */}
        <Card className="glass-card">
          <CardContent>
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Assignment</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Due Date</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Submissions</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No assignments found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssignments.map((assignment) => (
                      <TableRow key={assignment._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {assignment.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {assignment.subject}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.type.replace('_', ' ').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: `${getTypeColor(assignment.type)}20`,
                              color: getTypeColor(assignment.type),
                              fontWeight: 'bold',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {assignment.submissions.length} / {assignment.assignedTo.length || 'All'}
                            </Typography>
                            {assignment.assignedTo.length > 0 && (
                              <LinearProgress
                                variant="determinate"
                                value={(assignment.submissions.length / assignment.assignedTo.length) * 100}
                                sx={{
                                  width: 80,
                                  height: 6,
                                  borderRadius: 3,
                                  mt: 0.5,
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.status.toUpperCase()}
                            size="small"
                            color={getStatusColor(assignment.status) as any}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View">
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(assignment)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          {assignment.status === 'draft' && (
                            <Tooltip title="Publish">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handlePublish(assignment._id)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(assignment._id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
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
                rows={3}
                required
              />
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  label="Type"
                >
                  <MenuItem value="dsa">DSA</MenuItem>
                  <MenuItem value="aptitude">Aptitude</MenuItem>
                  <MenuItem value="core_subject">Core Subject</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Total Marks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) =>
                  setFormData({ ...formData, totalMarks: parseInt(e.target.value) })
                }
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
              disabled={!formData.title || !formData.description || !formData.dueDate}
            >
              {editingAssignment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </TeacherLayout>
  );
};

export default AssignmentsPage;