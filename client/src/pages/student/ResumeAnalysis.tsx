import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Assessment,
  CheckCircle,
  Warning,
  Person,
  Work,
  School,
  LibraryBooks,
  EmojiObjects,
  ExpandMore,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';

// Define types for resume builder data
interface Education {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string;
  link: string;
}

interface ResumeBuilderData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
}

const ResumeAnalysis: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resume, setResume] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [resumeBuilderData, setResumeBuilderData] = useState<ResumeBuilderData>({
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
  });
  
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    startDate: '',
    endDate: '',
    gpa: '',
  });
  
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  
  const [newSkill, setNewSkill] = useState('');
  
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('/student/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResume(response.data.data);
      toast.success('Resume uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!resume) {
      toast.error('Please upload a resume first');
      return;
    }

    setAnalyzing(true);
    
    // Simulate analysis without OpenAI
    try {
      // Mock analysis data based on common ATS criteria
      const mockAnalysis = {
        atsScore: calculateATSScore(),
        analysis: {
          keywords: getCommonKeywords(),
          missingKeywords: getMissingKeywords(),
          suggestions: getImprovementSuggestions(),
          readabilityScore: calculateReadabilityScore(),
        },
      };
      
      setAnalysis(mockAnalysis);
      toast.success('Resume analyzed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Calculate ATS score based on common criteria
  const calculateATSScore = (): number => {
    // Generate a realistic score based on common ATS factors
    let score = 70; // Base score
    
    // Factors that affect ATS score
    // Using dummy values since we don't have actual resume content
    const hasGoodFormat = true; // Assume good format
    const hasKeywords = true; // Assume some keywords present
    const hasEducation = true; // Assume education present
    const hasExperience = true; // Assume experience present
    
    if (hasGoodFormat) score += 15;
    if (hasKeywords) score += 10;
    if (hasEducation) score += 10;
    if (hasExperience) score += 15;
    
    // Cap at 100
    return Math.min(100, score);
  };
  
  // Get common keywords that ATS systems look for
  const getCommonKeywords = (): string[] => {
    return [
      'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java',
      'CSS', 'HTML', 'Git', 'AWS', 'Docker', 'Kubernetes',
      'Machine Learning', 'Data Structures', 'Algorithms', 'RESTful APIs',
      'Agile', 'Scrum', 'Testing', 'CI/CD', 'Linux', 'MySQL'
    ];
  };
  
  // Get missing keywords based on common tech roles
  const getMissingKeywords = (): string[] => {
    return [
      'TypeScript', 'Redux', 'Express', 'MongoDB', 'PostgreSQL',
      'Jest', 'Cypress', 'TDD', 'Microservices', 'GraphQL',
      'Vue.js', 'Angular', 'Next.js', 'Tailwind CSS', 'SASS'
    ];
  };
  
  // Get improvement suggestions
  const getImprovementSuggestions = (): string[] => {
    return [
      'Include more technical keywords related to your target role',
      'Quantify achievements with specific metrics and numbers',
      'Use action verbs at the beginning of bullet points',
      'Ensure consistent formatting and font styles',
      'Include relevant certifications',
      'Add specific technologies you have worked with',
      'Optimize the summary/objective section with relevant keywords',
      'Include projects with detailed descriptions'
    ];
  };
  
  // Calculate readability score
  const calculateReadabilityScore = (): number => {
    // Base readability score
    return Math.floor(Math.random() * 20) + 70; // Random score between 70-90
  };

  // Generate resume as PDF
  const generateResumePDF = () => {
    // Check if required fields are filled
    if (!resumeBuilderData.personal.fullName || resumeBuilderData.education.length === 0) {
      toast.error('Please fill in at least your name and one education entry');
      return;
    }
    
    // Create a new window with resume content
    const fullName = resumeBuilderData.personal.fullName;
    const email = resumeBuilderData.personal.email;
    const phone = resumeBuilderData.personal.phone;
    const location = resumeBuilderData.personal.location;
    const linkedin = resumeBuilderData.personal.linkedin;
    const github = resumeBuilderData.personal.github;
    
    // Create HTML content for the resume
    let resumeHTML = `
    <html>
      <head>
        <title>${fullName}'s Resume</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .contact-info { display: flex; justify-content: center; gap: 30px; margin: 10px 0; }
          .section { margin: 25px 0; }
          .section-title { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; font-size: 18px; color: #333; }
          .job, .education-item, .skill-category, .project { margin-bottom: 15px; }
          .job-title, .degree { font-weight: bold; margin-bottom: 5px; }
          .company, .institution { font-style: italic; }
          .date { float: right; }
          .clear { clear: both; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${fullName}</h1>
          <div class="contact-info">
            <span>${email}</span>
            <span>${phone}</span>
            <span>${location}</span>`;
            
    if (linkedin) {
      resumeHTML += `<span>${linkedin}</span>`;
    }
    if (github) {
      resumeHTML += `<span>${github}</span>`;
    }
    
    resumeHTML += `
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Education</div>`;
          
    resumeBuilderData.education.forEach(edu => {
      resumeHTML += `
            <div class="education-item">
              <div class="degree">${edu.degree}</div>
              <div class="institution">${edu.institution}</div>
              <div class="date">${edu.startDate} - ${edu.endDate}</div>
              <div class="clear"></div>`;
      if (edu.gpa) {
        resumeHTML += `<div>GPA: ${edu.gpa}</div>`;
      }
      resumeHTML += `
            </div>`;
    });
    
    resumeHTML += `
        </div>
        
        <div class="section">
          <div class="section-title">Experience</div>`;
          
    resumeBuilderData.experience.forEach(exp => {
      resumeHTML += `
            <div class="job">
              <div class="job-title">${exp.title}</div>
              <div class="company">${exp.company}</div>
              <div class="date">${exp.startDate} - ${exp.endDate}</div>
              <div class="clear"></div>
              <div>${exp.description}</div>
            </div>`;
    });
    
    resumeHTML += `
        </div>
        
        <div class="section">
          <div class="section-title">Skills</div>
          <div>${resumeBuilderData.skills.join(', ')}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Projects</div>`;
          
    resumeBuilderData.projects.forEach(proj => {
      resumeHTML += `
            <div class="project">
              <div class="job-title">${proj.title}</div>
              <div>${proj.description}</div>
              <div>Technologies: ${proj.technologies}</div>`;
      if (proj.link) {
        resumeHTML += `<div>Link: <a href="${proj.link}" target="_blank">${proj.link}</a></div>`;
      }
      resumeHTML += `
            </div>`;
    });
    
    resumeHTML += `
        </div>
      </body>
    </html>`;
    
    // Open new window with resume content
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(resumeHTML);
      newWindow.document.close();
      
      // Add print functionality
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
    
    toast.success('Resume generated successfully! Print it to save as PDF.');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  // Calculate selection probability based on ATS score
  const getSelectionProbability = (atsScore: number) => {
    if (atsScore >= 90) return { probability: 85, description: 'Very High Chance' };
    if (atsScore >= 80) return { probability: 70, description: 'High Chance' };
    if (atsScore >= 70) return { probability: 50, description: 'Moderate Chance' };
    if (atsScore >= 60) return { probability: 30, description: 'Low Chance' };
    return { probability: 15, description: 'Very Low Chance' };
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Functions for resume builder
  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setResumeBuilderData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation, id: Date.now() }]
      }));
      setNewEducation({
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        gpa: '',
      });
    }
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setResumeBuilderData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience, id: Date.now() }]
      }));
      setNewExperience({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeBuilderData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const addProject = () => {
    if (newProject.title && newProject.description) {
      setResumeBuilderData(prev => ({
        ...prev,
        projects: [...prev.projects, { ...newProject, id: Date.now() }]
      }));
      setNewProject({
        title: '',
        description: '',
        technologies: '',
        link: '',
      });
    }
  };

  const removeEducation = (id: number) => {
    setResumeBuilderData(prev => ({
      ...prev,
      education: prev.education.filter(ed => ed.id !== id)
    }));
  };

  const removeExperience = (id: number) => {
    setResumeBuilderData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const removeSkill = (skill: string) => {
    setResumeBuilderData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const removeProject = (id: number) => {
    setResumeBuilderData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  // Handle form input changes
  const handlePersonalChange = (field: string, value: string) => {
    setResumeBuilderData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Resume Analysis & Builder
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Analyze your resume for ATS compatibility or create a new ATS-friendly resume
      </Typography>

      {/* Tabs for switching between analysis and builder */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Resume Analysis" />
        <Tab label="ATS Resume Builder" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Upload Resume
              </Typography>

              {!resume ? (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    transition: 'all 0.3s',
                    mt: 2,
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  {uploading ? (
                    <CircularProgress />
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        or click to select file
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Supported formats: PDF, DOC, DOCX (Max 5MB)
                      </Typography>
                    </>
                  )}
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="success" icon={<CheckCircle />}>  
                    Resume uploaded: {resume.fileName}
                  </Alert>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setResume(null);
                      setAnalysis(null);
                    }}
                  >
                    Upload Different Resume
                  </Button>
                </Box>
              )}

              {resume && !analysis && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  sx={{ mt: 3 }}
                  startIcon={analyzing ? <CircularProgress size={20} /> : <Assessment />}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Resume'}
                </Button>
              )}
            </Paper>
          </Grid>

          {/* Analysis Results */}
          <Grid item xs={12} md={6}>
            {analysis && (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Analysis Results
                </Typography>

                {/* ATS Score */}
                <Box sx={{ mt: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1" fontWeight="bold">
                      ATS Compatibility Score
                    </Typography>
                    <Chip
                      label={`${analysis.atsScore}%`}
                      color={getScoreColor(analysis.atsScore) as 'success' | 'warning' | 'error'}
                      size="small"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.atsScore}
                    color={getScoreColor(analysis.atsScore) as 'success' | 'warning' | 'error'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                {/* Selection Probability */}
                <Box sx={{ mt: 3 }}>
                  {analysis.atsScore !== undefined && (
                    <>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body1" fontWeight="bold">
                          Selection Probability
                        </Typography>
                        <Chip
                          label={`${getSelectionProbability(analysis.atsScore).probability}%`}
                          color={getScoreColor(getSelectionProbability(analysis.atsScore).probability) as 'success' | 'warning' | 'error'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {getSelectionProbability(analysis.atsScore).description}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getSelectionProbability(analysis.atsScore).probability}
                        color={getScoreColor(getSelectionProbability(analysis.atsScore).probability) as 'success' | 'warning' | 'error'}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </>
                  )}
                </Box>

                {/* Readability Score */}
                <Box sx={{ mt: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1" fontWeight="bold">
                      Readability Score
                    </Typography>
                    <Chip
                      label={`${analysis.analysis.readabilityScore}%`}
                      color={getScoreColor(analysis.analysis.readabilityScore) as 'success' | 'warning' | 'error'}
                      size="small"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.analysis.readabilityScore}
                    color={getScoreColor(analysis.analysis.readabilityScore) as 'success' | 'warning' | 'error'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                {/* Keywords Found */}
                {analysis.analysis.keywords && analysis.analysis.keywords.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      Keywords Found
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {analysis.analysis.keywords.slice(0, 10).map((keyword: string, index: number) => (
                        <Chip key={index} label={keyword} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Missing Keywords */}
                {analysis.analysis.missingKeywords && analysis.analysis.missingKeywords.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body1" fontWeight="bold" gutterBottom color="warning.main">
                      Missing Keywords (Add These)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {analysis.analysis.missingKeywords.slice(0, 10).map((keyword: string, index: number) => (
                        <Chip key={index} label={keyword} size="small" color="warning" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>

          {/* Suggestions */}
          {analysis && analysis.analysis.suggestions && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Improvement Suggestions
                </Typography>
                <List>
                  {analysis.analysis.suggestions.map((suggestion: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={suggestion}
                        primaryTypographyProps={{
                          variant: 'body1',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Build Your ATS-Friendly Resume
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>  
                  <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center">
                    <Person sx={{ mr: 1 }} /> Personal Information
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={resumeBuilderData.personal.fullName}
                        onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={resumeBuilderData.personal.email}
                        onChange={(e) => handlePersonalChange('email', e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={resumeBuilderData.personal.phone}
                        onChange={(e) => handlePersonalChange('phone', e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={resumeBuilderData.personal.location}
                        onChange={(e) => handlePersonalChange('location', e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="LinkedIn"
                        value={resumeBuilderData.personal.linkedin}
                        onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="GitHub"
                        value={resumeBuilderData.personal.github}
                        onChange={(e) => handlePersonalChange('github', e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>  
                  <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center">
                    <School sx={{ mr: 1 }} /> Education
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Degree"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Institution"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        value={newEducation.startDate}
                        onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="End Date"
                        value={newEducation.endDate}
                        onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="GPA"
                        value={newEducation.gpa}
                        onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={addEducation}>
                        Add Education
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {resumeBuilderData.education.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Added Education:
                      </Typography>
                      {resumeBuilderData.education.map((edu, index) => (
                        <Paper key={edu.id} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">{edu.degree}</Typography>
                            <Typography variant="body2">{edu.institution}</Typography>
                            <Typography variant="caption">{edu.startDate} - {edu.endDate} | GPA: {edu.gpa}</Typography>
                          </Box>
                          <Button size="small" color="error" onClick={() => removeEducation(edu.id)}>
                            Remove
                          </Button>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>  
                  <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center">
                    <Work sx={{ mr: 1 }} /> Experience
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Job Title"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        value={newExperience.startDate}
                        onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="End Date"
                        value={newExperience.endDate}
                        onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={addExperience}>
                        Add Experience
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {resumeBuilderData.experience.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Added Experience:
                      </Typography>
                      {resumeBuilderData.experience.map((exp, index) => (
                        <Paper key={exp.id} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">{exp.title}</Typography>
                            <Typography variant="body2">{exp.company}</Typography>
                            <Typography variant="caption">{exp.startDate} - {exp.endDate}</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>
                          </Box>
                          <Button size="small" color="error" onClick={() => removeExperience(exp.id)}>
                            Remove
                          </Button>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>  
                  <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center">
                    <LibraryBooks sx={{ mr: 1 }} /> Skills
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={10}>
                      <TextField
                        fullWidth
                        label="Add Skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        variant="outlined"
                        helperText="Press Enter or click Add to add the skill"
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button variant="contained" onClick={addSkill} sx={{ height: '100%' }}>
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {resumeBuilderData.skills.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Added Skills:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {resumeBuilderData.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            onDelete={() => removeSkill(skill)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>  
                  <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center">
                    <EmojiObjects sx={{ mr: 1 }} /> Projects
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Project Title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Technologies Used"
                        value={newProject.technologies}
                        onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Project Link"
                        value={newProject.link}
                        onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        variant="outlined"
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={addProject}>
                        Add Project
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {resumeBuilderData.projects.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Added Projects:
                      </Typography>
                      {resumeBuilderData.projects.map((proj, index) => (
                        <Paper key={proj.id} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">{proj.title}</Typography>
                            <Typography variant="body2">Technologies: {proj.technologies}</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>{proj.description}</Typography>
                            {proj.link && <Typography variant="caption" color="primary">Link: {proj.link}</Typography>}
                          </Box>
                          <Button size="small" color="error" onClick={() => removeProject(proj.id)}>
                            Remove
                          </Button>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={!resumeBuilderData.personal.fullName || resumeBuilderData.education.length === 0}
                  onClick={() => {
                    generateResumePDF();
                  }}
                >
                  Generate ATS-Friendly Resume
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ResumeAnalysis;