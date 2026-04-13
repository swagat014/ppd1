import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Timer,
  Assessment,
  TrendingUp,
  Code,
  Calculate,
  Language,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Question {
  questionId: string;
  question: string;
  options: string[];
  type: 'aptitude' | 'technical' | 'coding';
  topic: string;
}

interface TestSection {
  name: string;
  duration: number;
  questions: Question[];
}

const SECTIONS: TestSection[] = [
  {
    name: 'Aptitude',
    duration: 10,
    questions: [],
  },
  {
    name: 'Technical',
    duration: 10,
    questions: [],
  },
  {
    name: 'Coding Concepts',
    duration: 10,
    questions: [],
  },
];

// Sample questions for 30-minute readiness test
const sampleQuestions: Question[] = [
  // Aptitude Questions (10 questions)
  {
    questionId: 'apt_1',
    question: 'If the ratio of ages of A and B is 3:4 and the sum of their ages is 56, what is the age of A?',
    options: ['21', '24', '28', '32'],
    type: 'aptitude',
    topic: 'Ratios',
  },
  {
    questionId: 'apt_2',
    question: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
    options: ['38', '40', '42', '44'],
    type: 'aptitude',
    topic: 'Number Series',
  },
  {
    questionId: 'apt_3',
    question: 'A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/hr?',
    options: ['30 km/hr', '36 km/hr', '40 km/hr', '45 km/hr'],
    type: 'aptitude',
    topic: 'Time and Distance',
  },
  {
    questionId: 'apt_4',
    question: 'The average of 5 numbers is 25. If one number is excluded, the average becomes 20. What is the excluded number?',
    options: ['35', '40', '45', '50'],
    type: 'aptitude',
    topic: 'Average',
  },
  {
    questionId: 'apt_5',
    question: 'If 20 men can complete a work in 30 days, how many days will 25 men take?',
    options: ['20 days', '22 days', '24 days', '26 days'],
    type: 'aptitude',
    topic: 'Time and Work',
  },
  {
    questionId: 'apt_6',
    question: 'What percentage of 120 is 30?',
    options: ['20%', '25%', '30%', '35%'],
    type: 'aptitude',
    topic: 'Percentage',
  },
  {
    questionId: 'apt_7',
    question: 'A shopkeeper sells an article for Rs. 720 at a loss of 20%. What is the cost price?',
    options: ['Rs. 800', 'Rs. 850', 'Rs. 900', 'Rs. 950'],
    type: 'aptitude',
    topic: 'Profit and Loss',
  },
  {
    questionId: 'apt_8',
    question: 'In how many ways can 5 people be arranged in a row?',
    options: ['100', '120', '125', '150'],
    type: 'aptitude',
    topic: 'Permutations',
  },
  {
    questionId: 'apt_9',
    question: 'What is the probability of getting a head when tossing a fair coin?',
    options: ['0', '0.25', '0.5', '1'],
    type: 'aptitude',
    topic: 'Probability',
  },
  {
    questionId: 'apt_10',
    question: 'Find the odd one out: 3, 5, 11, 14, 17, 21',
    options: ['3', '11', '14', '21'],
    type: 'aptitude',
    topic: 'Odd One Out',
  },
  // Technical Questions (10 questions)
  {
    questionId: 'tech_1',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
    type: 'technical',
    topic: 'Algorithms',
  },
  {
    questionId: 'tech_2',
    question: 'Which data structure uses LIFO (Last In First Out)?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    type: 'technical',
    topic: 'Data Structures',
  },
  {
    questionId: 'tech_3',
    question: 'What is the output of: console.log(typeof null)?',
    options: ['"null"', '"undefined"', '"object"', '"number"'],
    type: 'technical',
    topic: 'JavaScript',
  },
  {
    questionId: 'tech_4',
    question: 'In SQL, which keyword is used to remove duplicate rows?',
    options: ['UNIQUE', 'DISTINCT', 'GROUP BY', 'ORDER BY'],
    type: 'technical',
    topic: 'Database',
  },
  {
    questionId: 'tech_5',
    question: 'Which HTTP method is used to update a resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    type: 'technical',
    topic: 'Web Development',
  },
  {
    questionId: 'tech_6',
    question: 'What is the primary key in a database table?',
    options: ['A key that can be null', 'A unique identifier for each row', 'A foreign key', 'An index'],
    type: 'technical',
    topic: 'Database',
  },
  {
    questionId: 'tech_7',
    question: 'In OOP, which feature allows a subclass to provide a specific implementation of a method?',
    options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
    type: 'technical',
    topic: 'OOP',
  },
  {
    questionId: 'tech_8',
    question: 'What is the space complexity of DFS on a graph with V vertices?',
    options: ['O(1)', 'O(V)', 'O(E)', 'O(V+E)'],
    type: 'technical',
    topic: 'Algorithms',
  },
  {
    questionId: 'tech_9',
    question: 'Which sorting algorithm has the best average-case time complexity?',
    options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Merge Sort'],
    type: 'technical',
    topic: 'Algorithms',
  },
  {
    questionId: 'tech_10',
    question: 'What does ACID stand for in database transactions?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Atomicity, Concurrency, Isolation, Durability',
      'Availability, Consistency, Isolation, Durability',
      'Atomicity, Consistency, Integration, Durability',
    ],
    type: 'technical',
    topic: 'Database',
  },
  // Coding Concepts (10 questions)
  {
    questionId: 'code_1',
    question: 'What will be the output of: console.log(2 + "2")?',
    options: ['4', '22', 'NaN', 'Error'],
    type: 'coding',
    topic: 'JavaScript',
  },
  {
    questionId: 'code_2',
    question: 'What is the result of: [1, 2, 3].map(x => x * 2)?',
    options: ['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', 'undefined'],
    type: 'coding',
    topic: 'JavaScript',
  },
  {
    questionId: 'code_3',
    question: 'In Python, what is the output of: print(len("Hello World"))?',
    options: ['10', '11', '12', 'Error'],
    type: 'coding',
    topic: 'Python',
  },
  {
    questionId: 'code_4',
    question: 'What is the time complexity of accessing an element in an array by index?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    type: 'coding',
    topic: 'Data Structures',
  },
  {
    questionId: 'code_5',
    question: 'What does the "this" keyword refer to in JavaScript (non-strict mode)?',
    options: [
      'The current function',
      'The global object',
      'The parent object',
      'Undefined',
    ],
    type: 'coding',
    topic: 'JavaScript',
  },
  {
    questionId: 'code_6',
    question: 'Which of the following is NOT a JavaScript data type?',
    options: ['Number', 'String', 'Float', 'Boolean'],
    type: 'coding',
    topic: 'JavaScript',
  },
  {
    questionId: 'code_7',
    question: 'What is the output of: console.log(typeof [])?',
    options: ['"array"', '"object"', '"list"', '"undefined"'],
    type: 'coding',
    topic: 'JavaScript',
  },
  {
    questionId: 'code_8',
    question: 'In a binary search tree, where is the smallest element located?',
    options: ['Root', 'Leftmost node', 'Rightmost node', 'Any leaf node'],
    type: 'coding',
    topic: 'Data Structures',
  },
  {
    questionId: 'code_9',
    question: 'What is the purpose of the "async" keyword in JavaScript?',
    options: [
      'To make a function run faster',
      'To declare a function that returns a Promise',
      'To prevent function execution',
      'To create a new thread',
    ],
    type: 'coding',
    topic: 'JavaScript',
  },
  {
    questionId: 'code_10',
    question: 'What is the result of: 0.1 + 0.2 === 0.3 in JavaScript?',
    options: ['true', 'false', 'undefined', 'Error'],
    type: 'coding',
    topic: 'JavaScript',
  },
];

// Correct answers mapping
const correctAnswers: { [key: string]: number } = {
  apt_1: 1, apt_2: 2, apt_3: 1, apt_4: 2, apt_5: 2,
  apt_6: 1, apt_7: 2, apt_8: 1, apt_9: 2, apt_10: 2,
  tech_1: 1, tech_2: 1, tech_3: 2, tech_4: 1, tech_5: 2,
  tech_6: 1, tech_7: 2, tech_8: 1, tech_9: 2, tech_10: 0,
  code_1: 1, code_2: 1, code_3: 1, code_4: 0, code_5: 1,
  code_6: 2, code_7: 1, code_8: 1, code_9: 1, code_10: 1,
};

const ReadinessTest: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const aptitudeQuestions = sampleQuestions.filter((q) => q.type === 'aptitude');
  const technicalQuestions = sampleQuestions.filter((q) => q.type === 'technical');
  const codingQuestions = sampleQuestions.filter((q) => q.type === 'coding');

  const sections = [
    { name: 'Aptitude', questions: aptitudeQuestions, icon: <Calculate /> },
    { name: 'Technical', questions: technicalQuestions, icon: <Code /> },
    { name: 'Coding Concepts', questions: codingQuestions, icon: <Language /> },
  ];

  const currentSection = sections[activeStep];
  const totalQuestions = sampleQuestions.length;
  const answeredQuestions = Object.keys(answers).length;

  useEffect(() => {
    if (testStarted && timeLeft > 0 && !testCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !testCompleted) {
      handleSubmitTest();
    }
  }, [timeLeft, testStarted, testCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setTestStarted(true);
    setShowConfirmDialog(false);
  };

  const handleAnswerChange = (questionId: string, answer: number) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNextSection = () => {
    if (activeStep < sections.length - 1) {
      setActiveStep(activeStep + 1);
      setCurrentQuestion(0);
    } else {
      // Last section - show submit confirmation
      setShowSubmitDialog(true);
    }
  };

  const handleSubmitConfirm = () => {
    setShowSubmitDialog(false);
    handleSubmitTest();
  };

  const handlePrevSection = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setCurrentQuestion(0);
    }
  };

  const calculateScore = useCallback(() => {
    let correct = 0;
    let aptitudeCorrect = 0;
    let technicalCorrect = 0;
    let codingCorrect = 0;

    Object.entries(answers).forEach(([questionId, answer]) => {
      if (correctAnswers[questionId] === answer) {
        correct++;
        if (questionId.startsWith('apt_')) aptitudeCorrect++;
        else if (questionId.startsWith('tech_')) technicalCorrect++;
        else if (questionId.startsWith('code_')) codingCorrect++;
      }
    });

    const totalScore = (correct / totalQuestions) * 100;
    const aptitudeScore = (aptitudeCorrect / aptitudeQuestions.length) * 100;
    const technicalScore = (technicalCorrect / technicalQuestions.length) * 100;
    const codingScore = (codingCorrect / codingQuestions.length) * 100;

    return {
      totalScore: Math.round(totalScore),
      aptitudeScore: Math.round(aptitudeScore),
      technicalScore: Math.round(technicalScore),
      codingScore: Math.round(codingScore),
      correct,
      total: totalQuestions,
      sectionScores: {
        aptitude: { correct: aptitudeCorrect, total: aptitudeQuestions.length },
        technical: { correct: technicalCorrect, total: technicalQuestions.length },
        coding: { correct: codingCorrect, total: codingQuestions.length },
      },
    };
  }, [answers]);

  const handleSubmitTest = async () => {
    setTestCompleted(true);
    const scoreResult = calculateScore();
    setResult(scoreResult);

    try {
      // Save the readiness test result
      await axios.post('/student/readiness/test', {
        score: scoreResult.totalScore,
        aptitudeScore: scoreResult.aptitudeScore,
        technicalScore: scoreResult.technicalScore,
        codingScore: scoreResult.codingScore,
        timeTaken: 30 * 60 - timeLeft,
      });
      toast.success('Test completed! Your readiness score has been updated.');
    } catch (error) {
      console.error('Failed to save test result:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return 'Excellent - Ready for Placement';
    if (score >= 60) return 'Good - Almost Ready';
    if (score >= 40) return 'Average - Needs Improvement';
    return 'Below Average - Significant Improvement Needed';
  };

  if (!testStarted) {
    return (
      <Box>
        <Typography variant="h3" gutterBottom fontWeight="900" sx={{
          background: 'linear-gradient(135deg, #00d4ff 0%, #6c63ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          30-Minute Readiness Assessment
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4, fontSize: '1.1rem' }}>
          Evaluate your placement readiness with this comprehensive assessment
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} className="glass-card" sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Test Overview
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Stepper activeStep={-1} alternativeLabel>
                  {sections.map((section) => (
                    <Step key={section.name}>
                      <StepLabel icon={section.icon}>{section.name}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Card className="glass-card" variant="outlined" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Timer color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">30 Minutes</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Duration
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card className="glass-card" variant="outlined" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Assessment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">30 Questions</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Questions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card className="glass-card" variant="outlined" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <TrendingUp color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">100 Points</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Maximum Score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                Instructions
              </Typography>
              <Typography component="div" variant="body2" color="text.secondary">
                <ul>
                  <li>The test consists of 3 sections: Aptitude (10 questions), Technical (10 questions), and Coding Concepts (10 questions)</li>
                  <li>You have 30 minutes to complete all sections</li>
                  <li>Each question carries equal marks</li>
                  <li>You can navigate between sections using the Next/Previous buttons</li>
                  <li>The test will auto-submit when time runs out</li>
                  <li>Your readiness score will be calculated based on your performance</li>
                </ul>
              </Typography>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setShowConfirmDialog(true)}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Start Test
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} className="glass-card" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Scoring Guide
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ mb: 1 }}>
                  <strong>80-100:</strong> Excellent - Ready for Placement
                </Alert>
                <Alert severity="info" sx={{ mb: 1 }}>
                  <strong>60-79:</strong> Good - Almost Ready
                </Alert>
                <Alert severity="warning" sx={{ mb: 1 }}>
                  <strong>40-59:</strong> Average - Needs Improvement
                </Alert>
                <Alert severity="error">
                  <strong>Below 40:</strong> Significant Improvement Needed
                </Alert>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
          <DialogTitle>Start Test?</DialogTitle>
          <DialogContent>
            <Typography>
              You are about to start the 30-minute readiness assessment. Once started, the timer cannot be paused.
            </Typography>
            <Typography sx={{ mt: 2 }} color="warning.main">
              Make sure you have a stable internet connection and are in a distraction-free environment.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleStartTest}>
              Start Test
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  if (testCompleted && result) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Test Completed!
        </Typography>

        <Paper elevation={0} className="glass-card" sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your Readiness Score
          </Typography>
          <Typography
            variant="h1"
            fontWeight="bold"
            color={`${getScoreColor(result.totalScore)}.main`}
            gutterBottom
          >
            {result.totalScore}%
          </Typography>
          <Chip
            label={getReadinessLevel(result.totalScore)}
            color={getScoreColor(result.totalScore) as 'success' | 'warning' | 'error'}
            size="medium"
            sx={{ fontSize: '1rem', py: 1 }}
          />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Correct Answers: {result.correct} / {result.total}
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card className="glass-card" elevation={0}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Calculate color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Aptitude</Typography>
                <Typography variant="h4" fontWeight="bold" color={`${getScoreColor(result.aptitudeScore)}.main`}>
                  {result.aptitudeScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.sectionScores.aptitude.correct} / {result.sectionScores.aptitude.total} correct
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="glass-card" elevation={0}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Code color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Technical</Typography>
                <Typography variant="h4" fontWeight="bold" color={`${getScoreColor(result.technicalScore)}.main`}>
                  {result.technicalScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.sectionScores.technical.correct} / {result.sectionScores.technical.total} correct
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="glass-card" elevation={0}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Language color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Coding Concepts</Typography>
                <Typography variant="h4" fontWeight="bold" color={`${getScoreColor(result.codingScore)}.main`}>
                  {result.codingScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.sectionScores.coding.correct} / {result.sectionScores.coding.total} correct
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/student/readiness')}
            sx={{ mr: 2 }}
          >
            View Full Analysis
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/student')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} className="glass-card" sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setShowConfirmDialog(true)}
            >
              Exit Test
            </Button>
            <Typography variant="h6" fontWeight="bold">
              {currentSection.name} Section
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              icon={<Timer />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? 'error' : 'primary'}
              size="medium"
            />
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestion + 1} of {currentSection.questions.length}
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={((answeredQuestions) / totalQuestions) * 100}
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="text.secondary">
            Progress: {answeredQuestions}/{totalQuestions} answered
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Section {activeStep + 1} of {sections.length}
          </Typography>
        </Box>
      </Paper>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {sections.map((section, index) => (
          <Step key={section.name} completed={index < activeStep}>
            <StepLabel icon={section.icon}>
              {section.name}
              <Typography variant="caption" display="block" color="text.secondary">
                {section.questions.length} questions
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Question */}
      <Paper elevation={0} className="glass-card" sx={{ p: 4 }}>
        {currentSection.questions[currentQuestion] && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Question {currentQuestion + 1}
              </Typography>
              <Chip
                label={currentSection.questions[currentQuestion].topic}
                size="small"
                variant="outlined"
              />
            </Box>

            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
              {currentSection.questions[currentQuestion].question}
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentSection.questions[currentQuestion].questionId]?.toString() || ''}
                onChange={(e) =>
                  handleAnswerChange(
                    currentSection.questions[currentQuestion].questionId,
                    parseInt(e.target.value)
                  )
                }
              >
                {currentSection.questions[currentQuestion].options.map((option, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={idx.toString()}
                    control={<Radio />}
                    label={option}
                    sx={{
                      mb: 1,
                      p: 1.5,
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

            {/* Navigation */}
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                variant="outlined"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0 && activeStep === 0}
              >
                Previous
              </Button>

              <Box display="flex" gap={1}>
                {currentSection.questions.map((_, idx) => (
                  <Button
                    key={idx}
                    variant={currentQuestion === idx ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentQuestion(idx)}
                    color={
                      answers[currentSection.questions[idx]?.questionId] !== undefined
                        ? 'success'
                        : currentQuestion === idx
                        ? 'primary'
                        : 'inherit'
                    }
                    sx={{ minWidth: 40, px: 1 }}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </Box>

              {currentQuestion < currentSection.questions.length - 1 ? (
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
                  onClick={handleNextSection}
                  disabled={activeStep === sections.length - 1 && answeredQuestions < totalQuestions}
                >
                  {activeStep === sections.length - 1 
                    ? `Submit Test (${answeredQuestions}/${totalQuestions})` 
                    : 'Next Section'}
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Exit Test?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to exit? Your progress will be lost and the test will be marked as incomplete.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Continue Test</Button>
          <Button color="error" onClick={() => navigate('/student/readiness')}>
            Exit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Assessment color="primary" />
            Submit Test?
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to submit your test. Please review your answers:
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Total Questions:</strong> {totalQuestions}
            </Typography>
            <Typography variant="body2">
              <strong>Answered:</strong> {answeredQuestions}
            </Typography>
            <Typography variant="body2">
              <strong>Unanswered:</strong> {totalQuestions - answeredQuestions}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(answeredQuestions / totalQuestions) * 100}
              sx={{ mt: 1, height: 8, borderRadius: 4 }}
              color={answeredQuestions === totalQuestions ? 'success' : 'warning'}
            />
          </Box>
          {answeredQuestions < totalQuestions && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have {totalQuestions - answeredQuestions} unanswered question(s). Are you sure you want to submit?
            </Alert>
          )}
          {answeredQuestions === totalQuestions && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Great! You have answered all questions. Click Submit to see your results.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>
            Review Answers
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleSubmitConfirm}
            startIcon={<CheckCircle />}
          >
            Submit Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReadinessTest;