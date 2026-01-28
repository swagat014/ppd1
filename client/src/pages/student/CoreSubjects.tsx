import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Book, CheckCircle, PlayCircle, PictureAsPdf, Download, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  uploadedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const CoreSubjects: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [notes, setNotes] = useState<CoreSubjectNote[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Load first subject notes by default when subjects are loaded
    if (subjects.length > 0) {
      fetchNotesBySubject(subjects[0]);
    }
  }, [subjects]);

  const fetchSubjects = async () => {
    if (!user?.profile?.department) return;
    
    try {
      const response = await axios.get(`/core-subjects/department/${user.profile?.department}/subjects`);
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      showSnackbar('Failed to load subjects', 'error');
    }
  };



  const fetchNotesBySubject = async (subject: string) => {
    if (!user?.profile?.department) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/core-subjects/department/${user.profile?.department}/subject/${subject}`);
      setNotes(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notes by subject:', error);
      showSnackbar('Failed to load notes', 'error');
    } finally {
      setLoading(false);
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
      
      showSnackbar('Note downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading note:', error);
      showSnackbar('Failed to download note', 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubjectChange = (subject: string) => {
    fetchNotesBySubject(subject);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Core Subjects
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Access study materials and PDF notes for {user?.profile?.department} department
      </Typography>

      <Tabs 
        value={0} // Always show the 'By Subject' view
        sx={{ mb: 3 }}
      >
        <Tab label="By Subject" icon={<Book />} />
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={2}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Subjects
            </Typography>
            <List>
              {subjects.map((subject, index) => (
                <ListItem 
                  button 
                  key={index}
                  onClick={() => handleSubjectChange(subject)}
                  selected={notes.length > 0 && notes[0]?.subject === subject}
                >
                  <ListItemIcon>
                    <Book color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={subject} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          {notes.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {notes[0]?.subject} Notes
              </Typography>
              {notes.map((note) => (
                <Card key={note._id} elevation={2} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <PictureAsPdf color="error" />
                      <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                        {note.title}
                      </Typography>
                      <Tooltip title="Download">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDownload(note._id, note.fileName)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {note.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Semester {note.semester} | Size: {formatFileSize(note.fileSize)} | Downloads: {note.downloads}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded by: {note.uploadedBy.firstName} {note.uploadedBy.lastName}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No notes available for this subject.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

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
    </Box>
  );
};

export default CoreSubjects;
