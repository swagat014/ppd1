import React, { useState, useEffect } from 'react';
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
  
  // Create separate dropzone instances for each user type
  const studentDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'student'),
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });
  
  const teacherDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'teacher'),
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });
  
  const tpoDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'tpo'),
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });
  
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
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  
  // Update userType when activeTab changes
  useEffect(() => {
    const userTypes: Array<'student' | 'teacher' | 'tpo'> = ['student', 'teacher', 'tpo'];
    setUserType(userTypes[activeTab]);
  }, [activeTab]);

  const onDrop = (acceptedFiles: File[], type: 'student' | 'teacher' | 'tpo') => {
    const csvFile = acceptedFiles.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    if (csvFile) {
      setFiles(prev => ({
        ...prev,
        [type]: csvFile
      }));
      setErrors([]);
      setResult(null);
      
      // Parse the CSV file to show preview
      parseCSVFile(csvFile);
    } else {
      toast.error('Please upload a valid CSV file');
    }
  };
  
  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = [];
        
        // Process up to 5 rows for preview
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = String(values[index] || '');
            });
            dataRows.push(row);
          }
        }
        
        setPreviewData(dataRows);
      }
    };
    reader.readAsText(file);
  };

  const getDropzoneProps = (type: 'student' | 'teacher' | 'tpo') => {
    switch(type) {
      case 'student':
        return studentDropzone;
      case 'teacher':
        return teacherDropzone;
      case 'tpo':
        return tpoDropzone;
      default:
        return studentDropzone;
    }
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

      const response = await axios.post('/admin/users/upload', formData, {
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
      csvContent += "John Doe,Michael Doe,9876543210,2000-01-15,john.doe@gcekbpatna.ac.in\n";
      csvContent += "Jane Smith,Robert Smith,9123456789,1999-05-20,jane.smith@gcekbpatna.ac.in\n";
    } else if (type === 'teacher') {
      csvContent = "name,phone,email,department,date_of_birth\n";
      csvContent += "Dr. Alice Johnson,9876501234,alice.johnson@gcekbpatna.ac.in,Computer Science,1985-05-15\n";
      csvContent += "Prof. Bob Wilson,9811122233,bob.wilson@gcekbpatna.ac.in,Electrical Engineering,1980-08-20\n";
    } else if (type === 'tpo') {
      csvContent = "name,phone,email,department,date_of_birth\n";
      csvContent += "Mr. Charles Brown,9876554321,charles.brown@gcekbpatna.ac.in,Training & Placement,1982-03-10\n";
      csvContent += "Ms. Diana Davis,9876112233,diana.davis@gcekbpatna.ac.in,Training & Placement,1983-07-25\n";
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
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
          <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
          Upload {type.charAt(0).toUpperCase() + type.slice(1)}s via CSV
        </Typography>
        
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUpload fontSize="small" /> Instructions
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Upload a CSV file containing {type} information. The CSV file should have the following columns:
          </Typography>
                    
          {type === 'student' && (
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="name - Student's full name (will be split into first and last name)" 
                  secondary="Format: First Middle Last or First Last"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="father_name - Father's name" 
                  secondary="Full name of the student's father"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="phone - Phone number" 
                  secondary="Valid 10-digit mobile number"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="date_of_birth - Date of birth in YYYY-MM-DD format" 
                  secondary="Used as default password for login"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="email - Email address ending with @gcekbpatna.ac.in" 
                  secondary="Unique identifier for login"
                />
              </ListItem>
            </List>
          )}
                    
          {(type === 'teacher' || type === 'tpo') && (
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="name - Full name (will be split into first and last name)" 
                  secondary="Format: First Middle Last or First Last"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="phone - Phone number" 
                  secondary="Valid 10-digit mobile number"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="email - Email address" 
                  secondary="Unique identifier for login"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="department - Department name" 
                  secondary="Department affiliation"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="date_of_birth - Date of birth in YYYY-MM-DD format (optional for teachers/TPOs)" 
                  secondary="Used as default password for login (first 4 letters of name + year of birth)"
                />
              </ListItem>
            </List>
          )}
                    
          <Box mt={2} display="flex" alignItems="center" gap={1}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUpload />}
              onClick={() => downloadTemplate(type)}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Download {type.charAt(0).toUpperCase() + type.slice(1)} CSV Template
            </Button>
            <Typography variant="caption" color="text.secondary">
              Includes sample data for reference
            </Typography>
          </Box>
        </Paper>

        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? '#1976d2' : '#ccc'}`,
            borderRadius: 3,
            p: 5,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              borderColor: '#1976d2',
              transform: 'scale(1.02)',
            },
            backdropFilter: 'blur(4px)',
            borderStyle: 'dashed',
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
            <Typography variant="body1" gutterBottom>
              Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </Typography>
            
            {/* CSV Preview Table */}
            {previewData.length > 0 && (
              <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', borderRadius: 2 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {Object.keys(previewData[0]).map((header) => (
                          <TableCell key={header} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index} hover>
                          {Object.values(row).map((value, cellIndex) => (
                            <TableCell key={cellIndex}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box p={1} textAlign="right" fontSize="0.8rem" color="#666">
                  Showing preview of first {previewData.length} rows
                </Box>
              </Paper>
            )}
          </Box>
        )}

        <Box mt={3} display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleUpload}
            disabled={!file || uploading}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-2px)',
              },
              minWidth: '180px',
            }}
          >
            {uploading ? 'Uploading...' : `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}s`}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => {
              setFiles(prev => ({ ...prev, [type]: null }));
              setResult(null);
              setErrors([]);
              setPreviewData([]);
            }}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              minWidth: '100px',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
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
                    <TableCell>Upload Status</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {result.createdCount + result.updatedCount > 0 
                          ? `${result.createdCount + result.updatedCount} records processed successfully` 
                          : 'No records were processed'}
                      </Typography>
                      {result.createdCount > 0 && (
                        <Typography color="success.main">• {result.createdCount} {userType}{result.createdCount > 1 ? 's' : ''} created</Typography>
                      )}
                      {result.updatedCount > 0 && (
                        <Typography color="info.main">• {result.updatedCount} {userType}{result.updatedCount > 1 ? 's' : ''} updated</Typography>
                      )}
                      {result.totalProcessed === 0 && (
                        <Typography color="error.main">• No records were processed (check validation errors below)</Typography>
                      )}
                      {result.errors && result.errors.length > 0 && (
                        <Typography color="warning.main">• {result.errors.length} validation error{result.errors.length > 1 ? 's' : ''}</Typography>
                      )}
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
          
          <Paper 
            sx={{ 
              mb: 3,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              centered
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  minWidth: '160px',
                  minHeight: '60px',
                  transition: 'all 0.3s ease',
                },
                '& .Mui-selected': {
                  color: 'primary.light',
                },
                '& .MuiTabs-indicator': {
                  height: 4,
                  background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                },
              }}
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