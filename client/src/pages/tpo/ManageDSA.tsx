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
  Tooltip,
  Paper,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Code as CodeIcon,
  Search,
  FilterList,
  Save,
  Close,
  ChevronRight,
  Lightbulb,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  pattern: string;
  companies: string[];
  tags: string[];
  testCases: any[];
  constraints: string;
  examples: any[];
  hints: string[];
  solution: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    code: string;
  };
}

const ManageDSA: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Problem>>({
    title: '',
    description: '',
    difficulty: 'easy',
    category: '',
    pattern: '',
    companies: [],
    testCases: [{ input: '', expectedOutput: '', isPublic: true }],
    constraints: '',
    solution: { approach: '', timeComplexity: '', spaceComplexity: '', code: '' }
  });

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/tpo/dsa/problems`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProblems(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleOpenDialog = (problem?: Problem) => {
    if (problem) {
      setEditingProblem(problem);
      setFormData(problem);
    } else {
      setEditingProblem(null);
      setFormData({
        title: '',
        description: '',
        difficulty: 'easy',
        category: '',
        pattern: '',
        companies: [],
        testCases: [{ input: '', expectedOutput: '', isPublic: true }],
        constraints: '',
        solution: { approach: '', timeComplexity: '', spaceComplexity: '', code: '' }
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingProblem) {
        await axios.put(`${API_URL}/tpo/dsa/problems/${editingProblem._id}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}/tpo/dsa/problems`, formData, { headers });
      }
      
      setDialogOpen(false);
      fetchProblems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save problem');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tpo/dsa/problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProblems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete problem');
    }
  };

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TpoLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, background: 'transparent' }} className="dashboard-entry-1">
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={5}>
          <Box>
            <Typography variant="h3" fontWeight="999" className="text-gradient" sx={{ letterSpacing: -1, mb: 1 }}>
              DSA ARCHIVE
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
              Architecting the elite algorithmic curriculum for the next generation.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              padding: '12px 32px',
              borderRadius: '16px',
              fontWeight: 900,
              boxShadow: 'var(--glow-violet)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)' }
            }}
          >
            Launch Challenge
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
          <Search sx={{ color: 'var(--primary)', ml: 2 }} />
          <TextField
            placeholder="Query challenge signature, category, or difficulty matrix..."
            variant="standard"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ disableUnderline: true, sx: { color: '#fff', fontWeight: 500, fontSize: '1rem' } }}
          />
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.05)', mx: 1 }} />
          <Tooltip title="Filter Calibration">
            <IconButton sx={{ color: 'var(--primary)', mr: 1 }}><FilterList /></IconButton>
          </Tooltip>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={20}>
            <CircularProgress size={60} thickness={2} sx={{ color: 'var(--primary)' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 3 }}>{error}</Alert>
        ) : (
          <Grid container spacing={4}>
            {filteredProblems.map((problem, index) => (
              <Grid item xs={12} md={6} lg={4} key={problem._id} className={`dashboard-entry-${(index % 3) + 1}`}>
                <Card 
                  className="glass-card" 
                  sx={{ 
                    height: '100%', 
                    position: 'relative',
                    borderBottom: `4px solid ${
                      problem.difficulty === 'easy' ? 'var(--accent-emerald)' : 
                      problem.difficulty === 'medium' ? 'var(--accent-amber)' : 'var(--secondary)'
                    }`,
                    transition: 'var(--transition-smooth)',
                    '&:hover': { transform: 'translateY(-10px)', background: 'rgba(15, 23, 42, 0.8)' }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Box sx={{ 
                        px: 2, py: 0.5, borderRadius: 1, 
                        bgcolor: problem.difficulty === 'easy' ? 'rgba(52, 211, 153, 0.1)' : 
                                 problem.difficulty === 'medium' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(219, 39, 119, 0.1)',
                        border: `1px solid ${
                          problem.difficulty === 'easy' ? 'rgba(52, 211, 153, 0.2)' : 
                          problem.difficulty === 'medium' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(219, 39, 119, 0.2)'
                        }`
                      }}>
                        <Typography variant="caption" fontWeight="999" sx={{ 
                          color: problem.difficulty === 'easy' ? 'var(--accent-emerald)' : 
                                 problem.difficulty === 'medium' ? 'var(--accent-amber)' : 'var(--secondary)',
                          letterSpacing: 1
                        }}>
                          {problem.difficulty.toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleOpenDialog(problem)} sx={{ color: 'var(--primary)', bgcolor: 'rgba(124, 58, 237, 0.1)' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(problem._id)} sx={{ color: 'var(--secondary)', bgcolor: 'rgba(219, 39, 119, 0.1)' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h5" fontWeight="900" gutterBottom sx={{ color: '#fff', letterSpacing: -0.5 }}>
                      {problem.title}
                    </Typography>
                    
                    <Typography variant="body2" sx={{
                      color: 'text.secondary',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 3,
                      lineHeight: 1.6
                    }}>
                      {problem.description}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" gap={1} mb={4}>
                      <Chip 
                        label={problem.category} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'text.secondary', fontWeight: 'bold' }} 
                      />
                      {problem.companies.slice(0, 2).map((c, i) => (
                        <Chip key={i} label={c} size="small" sx={{ bgcolor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', fontWeight: 'bold' }} />
                      ))}
                      {problem.companies.length > 2 && (
                        <Chip label={`+${problem.companies.length - 2}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      )}
                    </Box>

                    <Divider sx={{ my: 3, opacity: 0.05 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)' }}>
                          <CodeIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Validation Assets</Typography>
                          <Typography variant="subtitle2" fontWeight="bold">{problem.testCases.length} Scenarios</Typography>
                        </Box>
                      </Box>
                      <Button 
                        size="small" 
                        endIcon={<ChevronRight />} 
                        onClick={() => handleOpenDialog(problem)}
                        sx={{ color: 'var(--primary)', fontWeight: '900' }}
                      >
                        VIEW MANIFEST
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create/Edit Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          fullWidth 
          maxWidth="md"
          PaperProps={{
            sx: {
              background: 'var(--bg-obsidian)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }
          }}
        >
          <DialogTitle sx={{ p: 4, pb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight="999" className="text-gradient">
                  {editingProblem ? 'MODIFY CHALLENGE' : 'FORGE CHALLENGE'}
                </Typography>
                <Typography variant="body2" color="text.secondary">Configure the algorithmic parameters</Typography>
              </Box>
              <IconButton onClick={() => setDialogOpen(false)} sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}><Close /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="CHALLENGE SIGNATURE"
                  placeholder="Mastering Arrays: The Ultimate Test"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  sx={{ mb: 4 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="CHALLENGE MANIFESTO"
                  placeholder="Articulate the algorithmic requirement... (Markdown Support Active)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 4 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="DIFFICULTY MATRIX"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  sx={{ mb: 4 }}
                >
                  <MenuItem value="easy">EASY (GREEN-TIER)</MenuItem>
                  <MenuItem value="medium">MEDIUM (AMBER-TIER)</MenuItem>
                  <MenuItem value="hard">HARD (VIOLET-TIER)</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="TECHNICAL CATEGORY"
                  placeholder="Dynamic Programming"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  sx={{ mb: 4 }}
                />
                <TextField
                  fullWidth
                  label="PATTERN SYNTHESIS"
                  placeholder="Two-Pointer / Sliding Window"
                  value={formData.pattern}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2, opacity: 0.05 }} />
                <Typography variant="subtitle2" fontWeight="999" color="var(--primary)" sx={{ letterSpacing: 2, mb: 3 }}>
                  ALGORITHMIC SOLUTION & COMPLEXITY
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                 <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="OPTIMAL ARCHITECTURE"
                  placeholder="Explain the logical flow of the solution..."
                  value={formData.solution?.approach}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    solution: { ...formData.solution!, approach: e.target.value } 
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={4}>
                  <Box display="flex" gap={3}>
                    <TextField 
                      label="TIME COMPLEXITY" 
                      placeholder="O(N log N)" 
                      fullWidth
                      value={formData.solution?.timeComplexity}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        solution: { ...formData.solution!, timeComplexity: e.target.value } 
                      })}
                    />
                    <TextField 
                      label="SPACE COMPLEXITY" 
                      placeholder="O(N)" 
                      fullWidth
                      value={formData.solution?.spaceComplexity}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        solution: { ...formData.solution!, spaceComplexity: e.target.value } 
                      })}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="REFERENCE KERNEL"
                    placeholder="Paste the high-performance solution code..."
                    value={formData.solution?.code}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      solution: { ...formData.solution!, code: e.target.value } 
                    })}
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>ABORT</Button>
            <Button 
              variant="contained" 
              startIcon={<Save />} 
              onClick={handleSave}
              sx={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                px: 6, py: 1.5,
                borderRadius: 3,
                fontWeight: 999,
                boxShadow: 'var(--glow-violet)'
              }}
            >
              COMMIT CHALLENGE
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </TpoLayout>
  );
};

export default ManageDSA;
