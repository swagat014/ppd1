import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Translate, Upload, Assessment, CheckCircle } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const EnglishAnalysis: React.FC = () => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await axios.post('/student/english/analyze', { text });
      setAnalysis(response.data.data);
      toast.success('English analysis completed!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to analyze English');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        English Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Analyze your English skills: grammar, vocabulary, pronunciation, and writing
      </Typography>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Enter Text for Analysis
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder="Enter your text here for grammar, vocabulary, and writing analysis..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{ mt: 2, mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={analyzing ? <CircularProgress size={20} /> : <Assessment />}
              onClick={handleAnalyze}
              disabled={analyzing || !text.trim()}
              sx={{ py: 1.5 }}
            >
              {analyzing ? 'Analyzing...' : 'Analyze English'}
            </Button>
            <Alert severity="info" sx={{ mt: 2 }}>
              Audio pronunciation analysis coming soon! For now, analyze your written text.
            </Alert>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {analysis && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Analysis Results
              </Typography>

              {/* Overall Score */}
              <Box sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1" fontWeight="bold">
                    Overall Score
                  </Typography>
                  <Chip
                    label={`${analysis.overallScore}%`}
                    color={getScoreColor(analysis.overallScore) as 'success' | 'warning' | 'error'}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={analysis.overallScore}
                  color={getScoreColor(analysis.overallScore) as 'success' | 'warning' | 'error'}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>

              {/* Grammar */}
              <Box sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1" fontWeight="bold">
                    Grammar
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {analysis.grammar}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={analysis.grammar}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Vocabulary */}
              <Box sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1" fontWeight="bold">
                    Vocabulary
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {analysis.vocabulary}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={analysis.vocabulary}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Writing */}
              <Box sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1" fontWeight="bold">
                    Writing
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {analysis.writing}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={analysis.writing}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Pronunciation */}
              {analysis.pronunciation > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1" fontWeight="bold">
                      Pronunciation
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {analysis.pronunciation}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.pronunciation}
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              {/* Improvements */}
              {analysis.improvements && analysis.improvements.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Improvement Suggestions
                  </Typography>
                  <List>
                    {analysis.improvements.map((improvement: string, idx: number) => (
                      <ListItem key={idx}>
                        <CheckCircle color="success" sx={{ mr: 2 }} />
                        <ListItemText primary={improvement} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnglishAnalysis;
