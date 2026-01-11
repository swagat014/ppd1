import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { CloudUpload, ExpandMore, ExpandLess, Error, CheckCircle } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    if (csvFile) {
      setFile(csvFile);
      setErrors([]);
      setResult(null);
    } else {
      toast.error('Please upload a valid CSV file');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/admin/students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        },
      });

      setResult(response.data);
      toast.success('Students uploaded successfully!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to upload students';
      toast.error(errorMsg);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV content for the template
    const csvContent = "name,father_name,phone,date_of_birth,email\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_upload_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Upload Students via CSV
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Typography variant="body1" paragraph>
              Upload a CSV file containing student information. The CSV file should have the following columns:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="name - Student's full name (will be split into first and last name)" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="father_name - Father's name" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="phone - Phone number" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="date_of_birth - Date of birth in YYYY-MM-DD format" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="email - Email address ending with @gcekbpatna.ac.in" />
              </ListItem>
            </List>
            
            <Box mt={2}>
              <Button 
                variant="outlined" 
                startIcon={<CloudUpload />} 
                onClick={downloadTemplate}
              >
                Download CSV Template
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload CSV File
            </Typography>
            
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#f0f8ff' : 'transparent',
                '&:hover': {
                  backgroundColor: '#f9f9f9',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload fontSize="large" color="primary" />
              <Typography variant="h6" mt={1}>
                {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here, or click to select'}
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Only CSV files accepted
              </Typography>
            </Box>

            {file && (
              <Box mt={2}>
                <Typography variant="body1">
                  Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
              </Box>
            )}

            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={handleUpload}
                disabled={!file || uploading}
                size="large"
              >
                {uploading ? 'Uploading...' : 'Upload Students'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setErrors([]);
                }}
              >
                Reset
              </Button>
            </Box>

            {uploading && (
              <Box mt={2}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" align="center" mt={1}>
                  {progress}% Complete
                </Typography>
              </Box>
            )}

            {errors.length > 0 && (
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="error">
                    Validation Errors
                  </Typography>
                  <IconButton onClick={() => setExpanded(!expanded)}>
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={expanded}>
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <List>
                      {errors.map((error, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon><Error color="error" /></ListItemIcon>
                          <ListItemText primary={error} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                </Collapse>
              </Box>
            )}

            {result && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Upload Result
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <CheckCircle color="success" />
                        </TableCell>
                        <TableCell>Upload Successful</TableCell>
                        <TableCell>
                          {result.createdCount} students created, {result.updatedCount} students updated
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default StudentUpload;