import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import { CloudUpload, ExpandMore, ExpandLess, Error, CheckCircle } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`upload-tabpanel-${index}`}
      aria-labelledby={`upload-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const UserBulkUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    student: null,
    teacher: null,
    tpo: null,
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher' | 'tpo'>('student');

  const onDrop = (acceptedFiles: File[], type: 'student' | 'teacher' | 'tpo') => {
    const csvFile = acceptedFiles.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    if (csvFile) {
      setFiles(prev => ({
        ...prev,
        [type]: csvFile
      }));
      setErrors([]);
      setResult(null);
    } else {
      toast.error('Please upload a valid CSV file');
    }
  };

  const getDropzoneProps = (type: 'student' | 'teacher' | 'tpo') => {
    return useDropzone({
      onDrop: (files) => onDrop(files, type),
      accept: {
        'text/csv': ['.csv'],
      },
      maxFiles: 1,
    });
  };

  const handleUpload = async () => {
    const fileToUpload = files[userType];
    if (!fileToUpload) {
      toast.error(`Please select a CSV file for ${userType}`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('userType', userType);

      const response = await axios.post('/api/admin/users/upload', formData, {
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
      toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)}s uploaded successfully!`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || `Failed to upload ${userType}s`;
      toast.error(errorMsg);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (type: 'student' | 'teacher' | 'tpo') => {
    let csvContent = '';
    
    if (type === 'student') {
      csvContent = "name,father_name,phone,date_of_birth,email\n";
    } else if (type === 'teacher') {
      csvContent = "name,phone,email,department\n";
    } else if (type === 'tpo') {
      csvContent = "name,phone,email,department\n";
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_upload_template.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderUploadSection = (type: 'student' | 'teacher' | 'tpo') => {
    const { getRootProps, getInputProps, isDragActive } = getDropzoneProps(type);
    const file = files[type];

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload {type.charAt(0).toUpperCase() + type.slice(1)}s via CSV
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <Typography variant="body1" paragraph>
            Upload a CSV file containing {type} information. The CSV file should have the following columns:
          </Typography>
          
          {type === 'student' && (
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
          )}
          
          {type === 'teacher' && (
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="name - Teacher's full name (will be split into first and last name)" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="phone - Phone number" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="email - Email address" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="department - Department name" />
              </ListItem>
            </List>
          )}
          
          {type === 'tpo' && (
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="name - TPO Officer's full name (will be split into first and last name)" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="phone - Phone number" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="email - Email address" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText primary="department - Department name" />
              </ListItem>
            </List>
          )}
          
          <Box mt={2}>
            <Button 
              variant="outlined" 
              startIcon={<CloudUpload />} 
              onClick={() => downloadTemplate(type)}
            >
              Download {type} CSV Template
            </Button>
          </Box>
        </Paper>

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
            {isDragActive ? `Drop the ${type} CSV file here` : `Drag & drop a ${type} CSV file here, or click to select`}
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
            {uploading ? 'Uploading...' : `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}s`}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => {
              setFiles(prev => ({ ...prev, [type]: null }));
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
                      {result.createdCount} {userType}s created, {result.updatedCount} {userType}s updated
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Bulk Upload Users
          </Typography>
          
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="Students" />
              <Tab label="Teachers" />
              <Tab label="TPO Officers" />
            </Tabs>
          </Paper>

          <TabPanel value={activeTab} index={0}>
            {renderUploadSection('student')}
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            {renderUploadSection('teacher')}
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            {renderUploadSection('tpo')}
          </TabPanel>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default UserBulkUpload;