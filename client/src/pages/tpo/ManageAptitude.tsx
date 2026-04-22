import React, { useState, useEffect } from 'react';
import TpoLayout from '../../components/tpo/TpoLayout';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Quiz,
  Search,
  Save,
  Close,
  Timer,
  QuestionAnswer,
  Business,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface AptitudeTest {
  _id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  companies: string[];
  questions: Question[];
  totalQuestions: number;
}

const ManageAptitude: React.FC = () => {
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<AptitudeTest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<AptitudeTest>>({
    title: '',
    description: '',
    type: 'mixed',
    duration: 30,
    companies: [],
    questions: []
  });

  const fetchTests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/tpo/aptitude/tests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTests(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleOpenDialog = (test?: AptitudeTest) => {
    if (test) {
      setEditingTest(test);
      setFormData(test);
    } else {
      setEditingTest(null);
      setFormData({
        title: '',
        description: '',
        type: 'mixed',
        duration: 30,
        companies: [],
        questions: []
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingTest) {
        await axios.put(`${API_URL}/tpo/aptitude/tests/${editingTest._id}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}/tpo/aptitude/tests`, formData, { headers });
      }
      
      setDialogOpen(false);
      fetchTests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save test');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tpo/aptitude/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete test');
    }
  };

  const addQuestion = () => {
    const newQuestions = [...(formData.questions || []), {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      topic: ''
    }];
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...(formData.questions || [])];
    newQuestions.splice(index, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...(formData.questions || [])];
    (newQuestions[index] as any)[field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TpoLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, background: 'transparent' }} className="dashboard-entry-1">
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={5}>
          <Box>
            <Typography variant="h3" fontWeight="999" className="text-gradient" sx={{ letterSpacing: -1, mb: 1 }}>
              APTITUDE FORGE
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
              Engineering high-fidelity cognitive assessments for top-tier placement rounds.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary) 100%)',
              padding: '12px 32px',
              borderRadius: '16px',
              fontWeight: 999,
              boxShadow: 'var(--glow-cyan)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 0 40px rgba(6, 182, 212, 0.4)' }
            }}
          >
            Forge Assessment
          </Button>
        </Box>

        <Paper 
          className="glass-card holographic-glow" 
          sx={{ 
            p: 1.5, mb: 6, 
            display: 'flex', gap: 2, alignItems: 'center', 
            bgcolor: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 4
          }}
        >
          <Search sx={{ color: 'var(--accent-cyan)', ml: 2 }} />
          <TextField
            placeholder="Search assessments, corporate signatures, or categories..."
            variant="standard"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ disableUnderline: true, sx: { color: '#fff', fontWeight: 500 } }}
          />
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={20}>
            <CircularProgress size={60} thickness={2} sx={{ color: 'var(--accent-cyan)' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 3 }}>{error}</Alert>
        ) : (
          <Grid container spacing={4}>
            {filteredTests.map((test, index) => (
              <Grid item xs={12} md={6} lg={4} key={test._id} className={`dashboard-entry-${(index % 3) + 1}`}>
                <Card 
                  className="glass-card" 
                  sx={{ 
                    height: '100%',
                    borderBottom: '4px solid var(--accent-cyan)',
                    transition: 'var(--transition-smooth)',
                    '&:hover': { transform: 'translateY(-10px)', background: 'rgba(15, 23, 42, 0.85)' }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Chip 
                        label={test.type.toUpperCase()} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(34, 211, 238, 0.1)', 
                          color: 'var(--accent-cyan)', 
                          fontWeight: '999',
                          borderRadius: '6px',
                          border: '1px solid rgba(34, 211, 238, 0.2)',
                          letterSpacing: 1
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleOpenDialog(test)} sx={{ color: 'var(--accent-cyan)', bgcolor: 'rgba(34, 211, 238, 0.1)' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(test._id)} sx={{ color: 'var(--secondary)', bgcolor: 'rgba(219, 39, 119, 0.1)' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h5" fontWeight="999" gutterBottom sx={{ color: '#fff', letterSpacing: -0.5 }}>
                      {test.title}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ my: 3 }}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.03)', color: 'var(--accent-cyan)' }}>
                            <Timer sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Duration</Typography>
                            <Typography variant="subtitle2" fontWeight="bold">{test.duration} min</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.03)', color: 'var(--accent-emerald)' }}>
                            <QuestionAnswer sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Capacity</Typography>
                            <Typography variant="subtitle2" fontWeight="bold">{test.questions?.length || 0} Items</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box display="flex" flexWrap="wrap" gap={1} mb={4}>
                      {test.companies.map((c, i) => (
                        <Chip key={i} label={c} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', fontWeight: 'bold' }} />
                      ))}
                    </Box>

                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={() => handleOpenDialog(test)}
                      sx={{ 
                        mt: 2, 
                        borderRadius: '12px', 
                        borderColor: 'rgba(34, 211, 238, 0.3)', 
                        color: 'var(--accent-cyan)',
                        fontWeight: 900,
                        py: 1.5,
                        '&:hover': { borderColor: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.05)' }
                      }}
                    >
                      CALIBRATE QUESTIONS
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          fullWidth 
          maxWidth="lg"
          PaperProps={{ 
            sx: { 
              background: 'var(--bg-obsidian)', 
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 25px 70px rgba(0,0,0,0.9)',
              backdropFilter: 'blur(40px)'
            } 
          }}
        >
          <DialogTitle sx={{ p: 4, pb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight="999" className="text-gradient">
                  {editingTest ? 'CALIBRATE ASSESSMENT' : 'FORGE ASSESSMENT'}
                </Typography>
                <Typography variant="body2" color="text.secondary">Orchestrate a high-fidelity cognitive evaluation</Typography>
              </Box>
              <IconButton onClick={() => setDialogOpen(false)} sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}><Close /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
             <Grid container spacing={5}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight="999" color="var(--accent-cyan)" sx={{ mb: 3, letterSpacing: 2 }}>ASSESSMENT CONFIGURATION</Typography>
                <Stack spacing={4}>
                  <TextField
                    fullWidth
                    label="ASSESSMENT TITLE"
                    placeholder="Quantitative Mastery Rounds"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    select
                    label="COGNITIVE CATEGORY"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="quantitative">QUANTITATIVE ANALYSIS</MenuItem>
                    <MenuItem value="logical">LOGICAL REASONING</MenuItem>
                    <MenuItem value="verbal">VERBAL PROFICIENCY</MenuItem>
                    <MenuItem value="technical">TECHNICAL KERNEL</MenuItem>
                    <MenuItem value="mixed">HYBRID ASSESSMENT</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    type="number"
                    label="CHRONO DURATION (MINUTES)"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                  <TextField
                    fullWidth
                    label="CORPORATE SIGNATURES"
                    placeholder="Google, Microsoft, Amazon"
                    value={formData.companies?.join(', ')}
                    onChange={(e) => setFormData({ ...formData, companies: e.target.value.split(',').map(s => s.trim()) })}
                  />
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="subtitle2" fontWeight="999" color="var(--primary)" sx={{ letterSpacing: 2 }}>QUESTION PROTOCOLS ({formData.questions?.length || 0})</Typography>
                  <Button 
                    startIcon={<Add />} 
                    onClick={addQuestion} 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 3, 
                      color: 'var(--primary)', 
                      borderColor: 'rgba(124, 58, 237, 0.3)',
                      fontWeight: 900
                    }}
                  >
                    ADD PROTOCOL
                  </Button>
                </Box>
                
                <Box sx={{ maxHeight: '65vh', overflowY: 'auto', pr: 2 }}>
                  {formData.questions?.map((q, idx) => (
                    <Paper key={idx} className="glass-card" sx={{ p: 4, mb: 4, bgcolor: 'rgba(255,255,255,0.01)', position: 'relative', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <IconButton 
                        onClick={() => removeQuestion(idx)} 
                        sx={{ position: 'absolute', top: 16, right: 16, color: 'var(--secondary)', bgcolor: 'rgba(219, 39, 119, 0.05)' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900, mb: 2, display: 'block' }}>ITEM #{idx + 1}</Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="PROTOCOL STATEMENT"
                        placeholder="Define the problem statement..."
                        value={q.question}
                        onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                        sx={{ mb: 4 }}
                      />
                      <Grid container spacing={3} mb={4}>
                        {q.options.map((opt, optIdx) => (
                          <Grid item xs={6} key={optIdx}>
                            <TextField
                              fullWidth
                              label={`OPTION ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                updateQuestion(idx, 'options', newOpts);
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      <Box display="flex" gap={3} mb={4}>
                        <TextField
                          select
                          fullWidth
                          label="VALID RESPONSE"
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                        >
                          <MenuItem value={0}>OPTION 1</MenuItem>
                          <MenuItem value={1}>OPTION 2</MenuItem>
                          <MenuItem value={2}>OPTION 3</MenuItem>
                          <MenuItem value={3}>OPTION 4</MenuItem>
                        </TextField>
                        <TextField
                          fullWidth
                          label="TOPIC TAG"
                          placeholder="Probability / Geometry"
                          value={q.topic}
                          onChange={(e) => updateQuestion(idx, 'topic', e.target.value)}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="RATIONALE / EXPLANATION"
                        placeholder="Detailed walkthrough of the solution..."
                        value={q.explanation}
                        onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                      />
                    </Paper>
                  ))}
                  {(!formData.questions || formData.questions.length === 0) && (
                    <Box textAlign="center" py={10} sx={{ border: '2px dashed rgba(255,255,255,0.03)', borderRadius: '24px' }}>
                      <Quiz sx={{ fontSize: 60, opacity: 0.1, mb: 2 }} />
                      <Typography color="text.muted" fontWeight="bold">ORCHESTRATION PENDING</Typography>
                      <Typography variant="caption" color="text.muted">No questions added to this assessment yet.</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ fontWeight: 900 }}>ABORT</Button>
            <Button 
              variant="contained" 
              onClick={handleSave} 
              sx={{ 
                px: 6, py: 1.5,
                background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary) 100%)',
                borderRadius: 3,
                fontWeight: 999,
                boxShadow: 'var(--glow-cyan)'
              }}
            >
              COMMIT ASSESSMENT
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </TpoLayout>
  );
};

export default ManageAptitude;
