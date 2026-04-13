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
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { ArrowBack, PlayArrow, CheckCircle, Error, Code, ExpandMore, Lightbulb } from '@mui/icons-material';
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
  solution?: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    code?: string;
  };
}

const defaultCodeTemplates: { [key: string]: string } = {
  javascript: `/**
 * Write your solution here
 * Function name must be 'solve'
 * The function will receive parameters based on the problem
 * Return your answer (number, array, boolean, etc.)
 */

function solve(nums, target) {
  // Write your code here
  // Example: return the indices of two numbers that add up to target
  
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  python: `# Write your solution here
# Function name must be 'solve'
# The function will receive parameters based on the problem
# Return your answer (number, list, boolean, etc.)

def solve(nums, target):
    # Write your code here
    # Example: return the indices of two numbers that add up to target
    
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
  java: `// Write your solution here
// You can use any class name (Main, Solution, etc.)
// Method should be public static
// Return your answer with the correct type

public class Solution {
    public static int[] solve(int[] nums, int target) {
        // Write your code here
        // Example: return the indices of two numbers that add up to target
        
        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
  c: `// Write your solution here
// Function name should match the expected signature
// Use standard libraries only

#include <stdio.h>
#include <stdlib.h>

// Example: Two Sum - return indices as array
// Note: In C, you typically return via output parameters
void solve(int* nums, int numsSize, int target, int* returnSize, int** returnArray) {
    // Write your code here
    // This is a template - adjust based on problem requirements
    
    *returnSize = 0;
    *returnArray = (int*)malloc(2 * sizeof(int));
    
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                (*returnArray)[0] = i;
                (*returnArray)[1] = j;
                *returnSize = 2;
                return;
            }
        }
    }
}`,
};

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [code, setCode] = useState(defaultCodeTemplates.javascript);
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id]);

  useEffect(() => {
    setCode(defaultCodeTemplates[language]);
  }, [language]);

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
        toast.success('Solution accepted! All test cases passed!');
      } else {
        toast.error('Some test cases failed. Check the results below.');
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
        <Grid item xs={12} md={5}>
          <Paper elevation={0} className="glass-card" sx={{ p: 3 }}>
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

            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Description" />
              <Tab label="Solution" />
            </Tabs>

            {activeTab === 0 ? (
              <>
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
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography>Hints</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
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
                    </AccordionDetails>
                  </Accordion>
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
              </>
            ) : (
              /* Solution Tab */
              <>
                {problem.solution ? (
                  <>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Approach
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                      {problem.solution.approach}
                    </Typography>

                    <Box display="flex" gap={2} mb={2}>
                      <Chip
                        label={`Time: ${problem.solution.timeComplexity}`}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={`Space: ${problem.solution.spaceComplexity}`}
                        color="secondary"
                        size="small"
                      />
                    </Box>

                    {problem.solution.code && (
                      <>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                          Reference Code
                        </Typography>
                        <Box sx={{ bgcolor: 'grey.900', p: 2, borderRadius: 1 }}>
                          <pre style={{ margin: 0, color: '#fff', fontSize: '14px' }}>
                            <code>{problem.solution.code}</code>
                          </pre>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <Alert severity="info">
                    Solution will be available after you solve the problem or attempt it 3 times.
                  </Alert>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Code Editor */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} className="glass-card" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
                Code Editor
              </Typography>
              <Box display="flex" gap={1}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={language}
                    onChange={(e: SelectChangeEvent<string>) => setLanguage(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="javascript">JavaScript</MenuItem>
                    <MenuItem value="python">Python</MenuItem>
                    <MenuItem value="java">Java</MenuItem>
                    <MenuItem value="c">C</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={16} /> : <PlayArrow />}
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                  color="success"
                >
                  {submitting ? 'Running...' : 'Run & Submit'}
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', minHeight: '400px' }}>
              <Editor
                height="100%"
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

            {/* Results Section */}
            {result && (
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity={result.isCorrect ? 'success' : 'error'}
                  icon={result.isCorrect ? <CheckCircle /> : <Error />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {result.message}
                  </Typography>
                  {result.passedCount !== undefined && (
                    <Typography variant="body2">
                      Passed: {result.passedCount} / {result.totalCount} test cases
                    </Typography>
                  )}
                </Alert>

                {result.results && result.results.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      Test Case Results
                    </Typography>
                    {result.results.map((testResult: any, idx: number) => (
                      <Box
                        key={idx}
                        sx={{
                          mb: 1,
                          p: 1.5,
                          bgcolor: testResult.passed ? 'success.light' : 'error.light',
                          borderRadius: 1,
                          opacity: 0.9,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          {testResult.passed ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Error color="error" fontSize="small" />
                          )}
                          <Typography variant="body2" fontWeight="bold">
                            Test Case {idx + 1} {testResult.isPublic ? '(Public)' : '(Hidden)'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" display="block">
                          <strong>Input:</strong> {JSON.stringify(testResult.input)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          <strong>Expected:</strong> {JSON.stringify(testResult.expectedOutput)}
                        </Typography>
                        {!testResult.passed && (
                          <Typography variant="caption" display="block" color="error">
                            <strong>Got:</strong> {JSON.stringify(testResult.actualOutput)}
                          </Typography>
                        )}
                        {testResult.error && (
                          <Typography variant="caption" display="block" color="error">
                            <strong>Error:</strong> {testResult.error}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Paper>
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
