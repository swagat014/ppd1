import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { RecordVoiceOver, VideoCall, Assessment, Start } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Interview {
  interviewId: string;
  type: 'technical' | 'hr' | 'managerial';
  date: Date;
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    overall: string;
  };
}

const MockInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [interviewType, setInterviewType] = useState<'technical' | 'hr' | 'managerial'>('technical');
  const [starting, setStarting] = useState(false);

  const handleStartInterview = async () => {
    setStarting(true);
    try {
      const response = await axios.post('/student/interviews/start', { type: interviewType });
      toast.success('Mock interview session started!');
      // TODO: Implement actual interview flow
      toast.info('Mock interview feature coming soon!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'primary';
      case 'hr':
        return 'success';
      case 'managerial':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Mock Interviews
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Practice interviews with AI-powered feedback and analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Start Interview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Start New Interview
            </Typography>
            <FormControl fullWidth sx={{ mt: 3, mb: 3 }}>
              <InputLabel>Interview Type</InputLabel>
              <Select
                value={interviewType}
                label="Interview Type"
                onChange={(e) => setInterviewType(e.target.value as any)}
              >
                <MenuItem value="technical">Technical Interview</MenuItem>
                <MenuItem value="hr">HR Interview</MenuItem>
                <MenuItem value="managerial">Managerial Interview</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={starting ? <CircularProgress size={20} /> : <VideoCall />}
              onClick={handleStartInterview}
              disabled={starting}
              sx={{ py: 1.5 }}
            >
              {starting ? 'Starting...' : 'Start Mock Interview'}
            </Button>
            <Alert severity="info" sx={{ mt: 2 }}>
              Feature coming soon! AI-powered mock interviews with real-time feedback.
            </Alert>
          </Paper>
        </Grid>

        {/* Interview Types Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Interview Types
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Chip label="Technical" color="primary" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Practice coding problems, algorithms, data structures, and system design questions.
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Chip label="HR" color="success" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Practice behavioral questions, situational responses, and soft skills assessment.
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Chip label="Managerial" color="warning" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Practice leadership scenarios, project management, and decision-making questions.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>

        {/* Past Interviews */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Past Interviews
            </Typography>
            {interviews.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No past interviews. Start your first mock interview to see feedback here.
              </Alert>
            ) : (
              <List>
                {interviews.map((interview, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Chip
                            label={interview.type}
                            color={getTypeColor(interview.type) as any}
                            size="small"
                          />
                          <Typography variant="body1" fontWeight="bold">
                            Score: {interview.score}%
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(interview.date).toLocaleDateString()}
                          </Typography>
                          {interview.feedback.overall && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {interview.feedback.overall}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MockInterviews;
