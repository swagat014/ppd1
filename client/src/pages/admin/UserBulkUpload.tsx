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
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { CloudUpload, ExpandMore, ExpandLess, Error, CheckCircle, Info, Download, Clear, Expand, Close } from '@mui/icons-material';
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
      {value === index && <Box p={2}>{children}</Box>}
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
      <Card 
        sx={{ 
          mb: 2,
          background: '#0a0a0a',
          border: '1px solid rgba(0, 204, 82, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.light">
              <CloudUpload sx={{ mr: 1, verticalAlign: 'middle', color: '#00ff64' }} />
              Upload {type.charAt(0).toUpperCase() + type.slice(1)}s via CSV
            </Typography>
            <Chip 
              label={type.charAt(0).toUpperCase() + type.slice(1)} 
              sx={{
                background: 'linear-gradient(90deg, rgba(0, 255, 100, 0.2), rgba(0, 255, 100, 0.1))',
                color: '#00ff64',
                border: '1px solid rgba(0, 255, 100, 0.3)',
              }}
            />
          </Box>
          
          <Accordion 
            sx={{
              background: '#0a0a0a',
              border: '1px solid rgba(0, 204, 82, 0.2)',
              mb: 2,
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: '0' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: '#00ff64' }} />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                },
              }}
            >
              <Info fontSize="small" sx={{ color: '#00ff64' }} /> 
              <Typography variant="body2" fontWeight="bold" color="primary.light">Instructions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph color="text.secondary" mb={1}>
                Upload a CSV file containing {type} information. The CSV file should have the following columns:
              </Typography>
              
              {type === 'student' && (
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="name - Student's full name" 
                      secondary="Format: First Middle Last or First Last"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="father_name - Father's name" 
                      secondary="Full name of the student's father"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="phone - Phone number" 
                      secondary="Valid 10-digit mobile number"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="date_of_birth - Date of birth in YYYY-MM-DD format" 
                      secondary="Used as default password for login"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="email - Email address ending with @gcekbpatna.ac.in" 
                      secondary="Unique identifier for login"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                </List>
              )}
              
              {(type === 'teacher' || type === 'tpo') && (
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="name - Full name" 
                      secondary="Format: First Middle Last or First Last"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="phone - Phone number" 
                      secondary="Valid 10-digit mobile number"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="email - Email address" 
                      secondary="Unique identifier for login"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="department - Department name" 
                      secondary="Department affiliation"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="date_of_birth - Date of birth in YYYY-MM-DD format" 
                      secondary="Used as default password for login (first 4 letters of name + year of birth)"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                </List>
              )}
              
              <Box mt={1} display="flex" alignItems="center" gap={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Download />}
                  onClick={() => downloadTemplate(type)}
                  size="small"
                  sx={{
                    background: 'linear-gradient(90deg, #00cc52, #00ff64)',
                    color: 'black',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    px: 2,
                    py: 0.5,
                    boxShadow: '0 4px 12px rgba(0, 255, 100, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #00ff64, #00cc52)',
                      boxShadow: '0 6px 16px rgba(0, 255, 100, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Download Template
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${isDragActive ? '#00ff64' : 'rgba(0, 255, 100, 0.5)'}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'rgba(0, 255, 100, 0.1)' : 'rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 100, 0.15)',
                borderColor: '#00ff64',
              },
              mb: 2,
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload fontSize="large" sx={{ color: '#00ff64' }} />
            <Typography variant="body1" mt={1} color="primary.light">
              {isDragActive ? `Drop the ${type} CSV file here` : `Drag & drop a ${type} CSV file here, or click to select`}
            </Typography>
            <Typography variant="caption" color="text.secondary" mt={1}>
              Only CSV files accepted
            </Typography>
          </Box>

          {file && (
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="primary.light">
                  Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setFiles(prev => ({ ...prev, [type]: null }));
                    setPreviewData([]);
                  }}
                  sx={{ color: '#ff5252' }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              </Box>
              
              {/* CSV Preview Table */}
              {previewData.length > 0 && (
                <Paper sx={{ 
                  maxHeight: 200, 
                  overflow: 'auto', 
                  border: '1px solid rgba(0, 255, 100, 0.3)', 
                  borderRadius: 1,
                  background: 'rgba(0, 0, 0, 0.4)',
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: 'rgba(0, 255, 100, 0.1)' }}>
                        {Object.keys(previewData[0]).map((header) => (
                          <TableCell key={header} sx={{ 
                            fontWeight: 'bold', 
                            color: '#00ff64',
                            fontSize: '0.75rem',
                            borderBottom: '1px solid rgba(0, 255, 100, 0.2)',
                          }}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index} sx={{
                          '&:nth-of-type(odd)': { background: 'rgba(255, 255, 255, 0.02)' },
                          '&:hover': { background: 'rgba(0, 255, 100, 0.05)' },
                        }}>
                          {Object.values(row).map((value, cellIndex) => (
                            <TableCell key={cellIndex} sx={{ fontSize: '0.75rem' }}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Box p={0.5} textAlign="right" fontSize="0.7rem" color="text.secondary">
                    Showing preview of first {previewData.length} rows
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={handleUpload}
              disabled={!file || uploading}
              size="small"
              sx={{
                background: 'linear-gradient(90deg, #00cc52, #00ff64)',
                color: 'black',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.8rem',
                px: 2,
                py: 0.8,
                boxShadow: '0 4px 12px rgba(0, 255, 100, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #00ff64, #00cc52)',
                  boxShadow: '0 6px 16px rgba(0, 255, 100, 0.4)',
                  transform: 'translateY(-1px)',
                },
                minWidth: '120px',
              }}
            >
              {uploading ? 'Uploading...' : `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}s`}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={() => {
                setFiles(prev => ({ ...prev, [type]: null }));
                setResult(null);
                setErrors([]);
                setPreviewData([]);
              }}
              size="small"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'text.secondary',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.8rem',
                px: 2,
                py: 0.8,
                minWidth: '80px',
                '&:hover': {
                  borderColor: '#00ff64',
                  color: '#00ff64',
                  background: 'rgba(0, 255, 100, 0.1)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Reset
            </Button>
          </Box>

          {uploading && (
            <Box mb={2}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, background: 'rgba(0, 0, 0, 0.3)' }} />
              <Typography variant="caption" align="center" display="block" mt={0.5} color="text.secondary">
                {progress}% Complete
              </Typography>
            </Box>
          )}

          {errors.length > 0 && (
            <Box mb={2}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Error sx={{ color: '#ff5252' }} />
                <Typography variant="body2" color="error">
                  Validation Errors ({errors.length})
                </Typography>
                <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ExpandLess sx={{ color: '#ff5252' }} /> : <ExpandMore sx={{ color: '#ff5252' }} />}
                </IconButton>
              </Box>
              <Collapse in={expanded}>
                <Alert severity="error" sx={{ 
                  background: 'rgba(255, 82, 82, 0.1)',
                  border: '1px solid rgba(255, 82, 82, 0.3)',
                }}>
                  <List dense>
                    {errors.map((error, index) => (
                      <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: '20px' }}><Error fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText 
                          primary={error} 
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              </Collapse>
            </Box>
          )}

          {result && (
            <Box>
              <Typography variant="body2" gutterBottom fontWeight="bold" color="primary.light" mb={1}>
                Upload Result
              </Typography>
              <TableContainer sx={{
                border: '1px solid rgba(0, 255, 100, 0.2)',
                borderRadius: 1,
                background: 'rgba(0, 0, 0, 0.3)',
              }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ width: '40px', borderBottom: 'none' }}>
                        <CheckCircle color="success" />
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {result.createdCount + result.updatedCount > 0 
                            ? `${result.createdCount + result.updatedCount} records processed successfully` 
                            : 'No records were processed'}
                        </Typography>
                        {result.createdCount > 0 && (
                          <Typography variant="caption" color="success.main">• {result.createdCount} {userType}{result.createdCount > 1 ? 's' : ''} created</Typography>
                        )}
                        {result.updatedCount > 0 && (
                          <Typography variant="caption" color="info.main">• {result.updatedCount} {userType}{result.updatedCount > 1 ? 's' : ''} updated</Typography>
                        )}
                        {result.totalProcessed === 0 && (
                          <Typography variant="caption" color="error.main">• No records were processed (check validation errors below)</Typography>
                        )}
                        {result.errors && result.errors.length > 0 && (
                          <Typography variant="caption" color="warning.main">• {result.errors.length} validation error{result.errors.length > 1 ? 's' : ''}</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <Container maxWidth="md" sx={{ pt: 2, pb: 4 }}>
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary.light">
              <CloudUpload sx={{ mr: 1, verticalAlign: 'middle', color: '#00ff64' }} />
              Bulk Upload Users
            </Typography>
          </Box>
          
          <Card 
            sx={{ 
              background: '#0a0a0a',
              border: '1px solid rgba(0, 204, 82, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                indicatorColor="primary"
                textColor="primary"
                centered
                sx={{
                  '& .MuiTab-root': {
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    minWidth: '120px',
                    minHeight: '40px',
                    transition: 'all 0.3s ease',
                  },
                  '& .Mui-selected': {
                    color: '#00ff64',
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    background: 'linear-gradient(90deg, #00cc52, #00ff64)',
                  },
                }}
              >
                <Tab label="Students" />
                <Tab label="Teachers" />
                <Tab label="TPO Officers" />
              </Tabs>
            </CardContent>
          </Card>

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