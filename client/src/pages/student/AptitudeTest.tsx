import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { ArrowBack, CheckCircle, Timer } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Question {
  questionId: string;
  question: string;
  options: string[];
  difficulty: string;
  topic: string;
}

const AptitudeTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchTest();
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  const fetchTest = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/student/aptitude/tests/${id}`);
      setTest(response.data.data);
      setQuestions(response.data.data.questions || []);
      setTimeLeft(response.data.data.duration * 60); // Convert minutes to seconds
    } catch (error) {
      toast.error('Failed to fetch test');
      navigate('/student/aptitude');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: number) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (submitted || submitting) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/student/aptitude/tests/${id}/submit`, {
        answers,
      });

      setResult(response.data.data);
      setSubmitted(true);
      toast.success(`Test completed! Score: ${response.data.data.score.toFixed(1)}%`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (submitted && result) {
    return (
      <Box>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Test Completed!
          </Typography>
          <Typography variant="h5" color="primary.main" gutterBottom>
            Your Score: {result.score.toFixed(1)}%
          </Typography>
          <Typography variant="body1" gutterBottom>
            Correct Answers: {result.correct} / {test.totalQuestions}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/student/aptitude')}
            sx={{ mt: 3 }}
          >
            Back to Tests
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!test || questions.length === 0) {
    return <Alert severity="error">Test not found</Alert>;
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/student/aptitude')}
        sx={{ mb: 2 }}
      >
        Back to Tests
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            {test.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Timer />
              <Typography variant="h6" color={timeLeft < 300 ? 'error.main' : 'inherit'}>
                {formatTime(timeLeft)}
              </Typography>
            </Box>
            <Chip
              label={`Question ${currentQuestion + 1} of ${questions.length}`}
              color="primary"
            />
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {questions[currentQuestion] && (
              <>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Question {currentQuestion + 1}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                  {questions[currentQuestion].question}
                </Typography>

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={answers[questions[currentQuestion].questionId]?.toString() || ''}
                    onChange={(e) =>
                      handleAnswerChange(
                        questions[currentQuestion].questionId,
                        parseInt(e.target.value)
                      )
                    }
                  >
                    {questions[currentQuestion].options.map((option, idx) => (
                      <FormControlLabel
                        key={idx}
                        value={idx.toString()}
                        control={<Radio />}
                        label={option}
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                <Box display="flex" justifyContent="space-between" mt={4}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  {currentQuestion < questions.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSubmit}
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={16} /> : <CheckCircle />}
                    >
                      Submit Test
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Question Navigator
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {questions.map((q, idx) => (
                <Button
                  key={q.questionId}
                  variant={currentQuestion === idx ? 'contained' : 'outlined'}
                  color={
                    answers[q.questionId] !== undefined
                      ? 'success'
                      : currentQuestion === idx
                      ? 'primary'
                      : 'inherit'
                  }
                  onClick={() => setCurrentQuestion(idx)}
                  sx={{ minWidth: 40 }}
                >
                  {idx + 1}
                </Button>
              ))}
            </Box>
            <Box mt={3}>
              <Typography variant="body2" color="text.secondary">
                Answered: {Object.keys(answers).length} / {questions.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AptitudeTest;
