import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { ArrowBack, PlayArrow, CheckCircle, Code } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  pattern: string;
  companies: string[];
  tags: string[];
  constraints: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  hints: string[];
  testCases: Array<{
    input: any;
    expectedOutput: any;
    isPublic: boolean;
  }>;
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [code, setCode] = useState('// Write your solution here\nfunction solve(input) {\n  // Your code here\n  return result;\n}');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id]);

  const fetchProblem = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/student/dsa/problems/${id}`);
      setProblem(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch problem');
      navigate('/student/dsa');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;

    setSubmitting(true);
    setResult(null);

    try {
      const response = await axios.post(`/student/dsa/problems/${id}/submit`, {
        code,
        language,
      });

      setResult(response.data.data);
      if (response.data.data.isCorrect) {
        toast.success('Solution accepted! 🎉');
      } else {
        toast.error('Solution incorrect. Try again!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!problem) {
    return <Alert severity="error">Problem not found</Alert>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/student/dsa')}
        sx={{ mb: 2 }}
      >
        Back to Problems
      </Button>

      <Grid container spacing={3}>
        {/* Problem Description */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Typography variant="h5" fontWeight="bold">
                {problem.title}
              </Typography>
              <Chip
                label={problem.difficulty}
                color={getDifficultyColor(problem.difficulty) as 'success' | 'warning' | 'error'}
              />
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
              <Chip label={problem.category} size="small" variant="outlined" />
              <Chip label={problem.pattern} size="small" variant="outlined" />
              {problem.companies?.map((company, idx) => (
                <Chip key={idx} label={company} size="small" color="primary" />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
              {problem.description}
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight="bold">
              Constraints
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
              {problem.constraints}
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight="bold">
              Examples
            </Typography>
            {problem.examples?.map((example, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Example {idx + 1}:
                </Typography>
                <Typography variant="body2">
                  <strong>Input:</strong> {example.input}
                </Typography>
                <Typography variant="body2">
                  <strong>Output:</strong> {example.output}
                </Typography>
                {example.explanation && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Explanation:</strong> {example.explanation}
                  </Typography>
                )}
              </Box>
            ))}

            {problem.hints && problem.hints.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                  Hints
                </Typography>
                <List>
                  {problem.hints.map((hint, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={`Hint ${idx + 1}: ${hint}`}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* Test Cases (Public ones only) */}
            {problem.testCases?.filter((tc) => tc.isPublic).length > 0 && (
              <>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                  Test Cases
                </Typography>
                {problem.testCases
                  .filter((tc) => tc.isPublic)
                  .map((testCase, idx) => (
                    <Box key={idx} sx={{ mb: 1, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Input:</strong> {JSON.stringify(testCase.input)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Expected Output:</strong> {JSON.stringify(testCase.expectedOutput)}
                      </Typography>
                    </Box>
                  ))}
              </>
            )}
          </Paper>
        </Grid>

        {/* Code Editor */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Code Editor
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setLanguage(language === 'javascript' ? 'python' : 'javascript')}
                >
                  {language === 'javascript' ? 'Python' : 'JavaScript'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={16} /> : <PlayArrow />}
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                >
                  {submitting ? 'Running...' : 'Run & Submit'}
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
              <Editor
                height="500px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </Box>

            {result && (
              <Box sx={{ mt: 2 }}>
                {result.isCorrect ? (
                  <Alert severity="success" icon={<CheckCircle />}>
                    {result.message}
                  </Alert>
                ) : (
                  <Alert severity="error">
                    {result.message}
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProblemDetail;
