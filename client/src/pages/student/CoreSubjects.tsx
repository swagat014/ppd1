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
} from '@mui/material';
import { Book, CheckCircle, PlayCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Subject {
  name: string;
  score: number;
  completedModules: number;
  totalModules: number;
  lastAccessed: Date | null;
}

const CoreSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/student/core-subjects');
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getProgress = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
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
        Study core computer science subjects for placement preparation
      </Typography>

      <Grid container spacing={3}>
        {subjects.map((subject, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              elevation={2}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(`/student/core-subjects/${encodeURIComponent(subject.name)}`)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Book color="primary" />
                  <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                    {subject.name}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {subject.completedModules} / {subject.totalModules} modules
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getProgress(subject.completedModules, subject.totalModules)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Score
                    </Typography>
                    <Chip
                      label={`${subject.score}%`}
                      color={getScoreColor(subject.score) as 'success' | 'warning' | 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  {subject.lastAccessed && (
                    <Typography variant="caption" color="text.secondary">
                      Last accessed: {new Date(subject.lastAccessed).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PlayCircle />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/student/core-subjects/${encodeURIComponent(subject.name)}`);
                  }}
                >
                  Study
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {subjects.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No subjects available. Content coming soon!
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CoreSubjects;
