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
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Upload,
  Download,
  Edit,
  Delete,
  Visibility,
  PictureAsPdf,
  Add,
  School
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

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
  uploadedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const CoreSubjectsPage: React.FC = () => {
  const { user } = useAuth();
  const department = user?.profile?.department || 'CSE'; // Default to CSE if not specified
  const [notes, setNotes] = useState<CoreSubjectNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<CoreSubjectNote | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    semester: '',
    academicYear: new Date().getFullYear().toString(),
    file: null as File | null
  });

  const subjects = [
    'Data Structures',
    'Algorithms',
    'Database Management Systems',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Object Oriented Programming',
    'Discrete Mathematics',
    'Theory of Computation',
    'Compiler Design'
  ];

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/core-subjects/department/${department}`);
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      showSnackbar('Failed to fetch notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file) {
      showSnackbar('Please select a PDF file', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('semester', formData.semester);
      formDataToSend.append('academicYear', formData.academicYear);

      if (editingNote) {
        // Update existing note
        await axios.put(`/core-subjects/${editingNote._id}`, formDataToSend);
        showSnackbar('Note updated successfully', 'success');
      } else {
        // Create new note
        await axios.post('/core-subjects/upload', formDataToSend);
        showSnackbar('Note uploaded successfully', 'success');
      }

      handleCloseDialog();
      fetchNotes();
    } catch (error: any) {
      console.error('Error saving note:', error);
      showSnackbar(error.response?.data?.message || 'Failed to save note', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await axios.delete(`/core-subjects/${id}`);
      showSnackbar('Note deleted successfully', 'success');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      showSnackbar('Failed to delete note', 'error');
    }
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
      showSnackbar('Failed to download note', 'error');
    }
  };

  const handleEdit = (note: CoreSubjectNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      description: note.description,
      subject: note.subject,
      semester: note.semester.toString(),
      academicYear: note.academicYear,
      file: null
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNote(null);
    setFormData({
      title: '',
      description: '',
      subject: '',
      semester: '',
      academicYear: new Date().getFullYear().toString(),
      file: null
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type !== 'application/pdf') {
      showSnackbar('Please select a PDF file', 'error');
      return;
    }
    if (file && file.size > 50 * 1024 * 1024) {
      showSnackbar('File size should be less than 50MB', 'error');
      return;
    }
    setFormData({ ...formData, file: file || null });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <TeacherLayout>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Core Subjects Management
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage PDF notes and study materials for your department
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #00cc52 30%, #00aa44 90%)',
                boxShadow: '0 4px 15px rgba(0, 204, 82, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00aa44 30%, #008833 90%)',
                  boxShadow: '0 6px 20px rgba(0, 204, 82, 0.6)',
                }
              }}
            >
              Upload Note
            </Button>
          </Box>

          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="All Notes" icon={<School />} />
            <Tab label="By Subject" icon={<PictureAsPdf />} />
          </Tabs>

          {activeTab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#0a0a0a' }}>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Semester</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Size</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Downloads</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Uploaded</TableCell>
                    <TableCell sx={{ color: '#e8f5e9', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notes.map((note) => (
                    <TableRow key={note._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PictureAsPdf color="error" />
                          <Typography variant="body2" fontWeight="medium">
                            {note.title}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {note.description.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={note.subject} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(0, 204, 82, 0.2)',
                            color: '#00cc52',
                            fontWeight: 'bold'
                          }} 
                        />
                      </TableCell>
                      <TableCell>{note.semester}</TableCell>
                      <TableCell>{formatFileSize(note.fileSize)}</TableCell>
                      <TableCell>{note.downloads}</TableCell>
                      <TableCell>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Download">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownload(note._id, note.fileName)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(note)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(note._id)}
                            sx={{ color: 'error.main' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              {subjects.map((subject) => {
                const subjectNotes = notes.filter(note => note.subject === subject);
                if (subjectNotes.length === 0) return null;
                
                return (
                  <Grid item xs={12} md={6} key={subject}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                          {subject}
                        </Typography>
                        {subjectNotes.map((note) => (
                          <Box 
                            key={note._id} 
                            display="flex" 
                            justifyContent="space-between" 
                            alignItems="center"
                            py={1}
                            borderBottom={1}
                            borderColor="divider"
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {note.title}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Semester {note.semester} • {formatFileSize(note.fileSize)}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Download">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDownload(note._id, note.fileName)}
                                >
                                  <Download />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleEdit(note)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDelete(note._id)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {notes.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No notes available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload your first PDF note to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  onClick={() => setOpenDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Upload Note
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Upload/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingNote ? 'Edit Note' : 'Upload New Note'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
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

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  label="Subject"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  label="Semester"
                >
                  {semesters.map((sem) => (
                    <MenuItem key={sem} value={sem.toString()}>{sem}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Academic Year"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                margin="normal"
                required
              />

              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mt: 2, mb: 1 }}
              >
                <Upload sx={{ mr: 1 }} />
                {formData.file ? formData.file.name : (editingNote ? 'Change PDF File' : 'Select PDF File')}
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {!editingNote && (
                <Typography variant="caption" color="textSecondary">
                  Max file size: 50MB. Only PDF files allowed.
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              onClick={handleSubmit as any}
              disabled={!formData.title || !formData.description || !formData.subject || !formData.semester || !formData.academicYear}
            >
              {editingNote ? 'Update' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({...snackbar, open: false})}
        >
          <Alert 
            onClose={() => setSnackbar({...snackbar, open: false})} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </TeacherLayout>
  );
};

export default CoreSubjectsPage;