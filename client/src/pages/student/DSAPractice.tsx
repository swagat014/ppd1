import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Card, CardContent,
  Chip, Select, MenuItem, FormControl, InputLabel, Pagination, CircularProgress,
  Tabs, Tab, LinearProgress, Alert, Tooltip, Badge, Stack, InputAdornment,
  Divider, IconButton,
} from '@mui/material';
import {
  Search, Code, TrendingUp, Business, CheckCircle, EmojiEvents, 
  Bolt, FilterAlt, ClearAll, Lock, Psychology, Timeline,
  WorkspacePremium, LocalFireDepartment, Star, AutoAwesome,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  pattern: string;
  companies: string[];
  tags: string[];
  acceptanceRate: number;
  submissions: number;
}

interface StudentStats {
  solved: number;
  total: number;
  accuracy: number;
  companySpecific: { [key: string]: { solved: number; total: number; accuracy: number } };
  recentActivity: { problemId: string; date: string; status: string }[];
}

const COMPANY_CONFIG: { name: string; color: string; type: 'service' | 'product' }[] = [
  { name: 'TCS',        color: '#1e88e5', type: 'service' },
  { name: 'Infosys',    color: '#43a047', type: 'service' },
  { name: 'Wipro',      color: '#fb8c00', type: 'service' },
  { name: 'Cognizant',  color: '#43a047', type: 'service' },
  { name: 'Accenture',  color: '#7e57c2', type: 'service' },
  { name: 'Google',     color: '#e53935', type: 'product' },
  { name: 'Microsoft',  color: '#00acc1', type: 'product' },
  { name: 'Amazon',     color: '#ff8f00', type: 'product' },
  { name: 'Meta',       color: '#1976d2', type: 'product' },
  { name: 'Apple',      color: '#9e9e9e', type: 'product' },
];

const CATEGORIES = ['Arrays','Strings','Linked List','Trees','Graphs','Dynamic Programming','Greedy','Math','Stack','Queue','Hash Table'];
const PATTERNS = ['Two Pointers','Sliding Window','Binary Search','BFS/DFS','Backtracking','Dynamic Programming','Recursion','Sorting','Hash Table','Stack','Greedy'];

const DIFFICULTY_CONFIG = {
  easy:   { color: '#00f593', bg: 'rgba(0,245,147,0.12)', label: 'Easy' },
  medium: { color: '#ffd60a', bg: 'rgba(255,214,10,0.12)', label: 'Medium' },
  hard:   { color: '#f72585', bg: 'rgba(247,37,133,0.12)', label: 'Hard' },
};

const DSAPractice: React.FC = () => {
  const [problems, setProblems]     = useState<Problem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const [filters, setFilters]       = useState({ difficulty: '', category: '', pattern: '', company: '', search: '' });
  const [activeTab, setActiveTab]   = useState(0);
  const [stats, setStats]           = useState<StudentStats>({ solved: 0, total: 0, accuracy: 0, companySpecific: {}, recentActivity: [] });
  const navigate = useNavigate();

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 9 };
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.category)   params.category   = filters.category;
      if (filters.pattern)    params.pattern     = filters.pattern;
      if (filters.company)    params.company     = filters.company;
      if (filters.search)     params.search      = filters.search;

      const res = await axios.get('/student/dsa/problems', { params });
      setProblems(res.data.data.problems || []);
      setTotalPages(res.data.data.pagination?.pages || 1);
      setTotalProblems(res.data.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/student/analytics');
      const d = res.data.data;
      const dsa = d.practice?.dsa || {};
      // companySpecific may be a Map-like object or plain object
      const cs: { [key: string]: { solved: number; total: number; accuracy: number } } = {};
      if (dsa.companySpecific) {
        // handle both Map (serialised as {}) and plain object
        Object.entries(dsa.companySpecific).forEach(([k, v]: [string, any]) => {
          cs[k] = { solved: v.solved || 0, total: v.total || 0, accuracy: v.accuracy || 0 };
        });
      }
      setStats({
        solved:   dsa.solvedProblems || dsa.solved || 0,
        total:    dsa.totalProblems  || dsa.total  || 0,
        accuracy: dsa.accuracy || 0,
        companySpecific: cs,
        recentActivity: dsa.recentActivity || [],
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters({ difficulty: '', category: '', pattern: '', company: '', search: '' });
    setPage(1);
  };

  const goalTarget    = Math.max(50, totalProblems);
  const goalPct       = Math.min(100, (stats.solved / goalTarget) * 100);
  const easyCount     = problems.filter(p => p.difficulty === 'easy').length;
  const mediumCount   = problems.filter(p => p.difficulty === 'medium').length;
  const hardCount     = problems.filter(p => p.difficulty === 'hard').length;
  const hasFilters    = Object.values(filters).some(Boolean);

  const filteredProblems = filters.search
    ? problems.filter(p => p.title.toLowerCase().includes(filters.search.toLowerCase()))
    : problems;

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Header ─────────────────────────────── */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
          <AutoAwesome sx={{ color: '#00d4ff', fontSize: 28 }} />
          <Typography variant="h3" fontWeight={900} sx={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #6c63ff 60%, #f72585 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px',
          }}>
            DSA Practice Arena
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
          Master Data Structures & Algorithms · {totalProblems} problems from top companies
        </Typography>
      </Box>

      {/* ── Stats Row ──────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {[
          { icon: <CheckCircle sx={{ color: '#00f593' }} />, value: stats.solved,  label: 'Solved',       color: '#00f593' },
          { icon: <TrendingUp  sx={{ color: '#6c63ff' }} />, value: `${stats.accuracy.toFixed(0)}%`, label: 'Accuracy', color: '#6c63ff' },
          { icon: <EmojiEvents sx={{ color: '#ffd60a' }} />, value: `${goalPct.toFixed(0)}%`, label: `Goal (${goalTarget})`, color: '#ffd60a' },
          { icon: <LocalFireDepartment sx={{ color: '#f72585' }} />, value: totalProblems, label: 'Total Problems', color: '#f72585' },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Paper elevation={0} sx={{
              p: 2, borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(13,18,40,0.5)',
              backdropFilter: 'blur(20px)',
              position: 'relative', overflow: 'hidden',
              '&::before': {
                content: '""', position: 'absolute', top: 0, left: 0,
                width: '100%', height: '3px',
                background: `linear-gradient(90deg, ${s.color}, transparent)`,
              },
            }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>{s.icon}</Box>
              <Typography variant="h4" fontWeight={900} sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Progress Bar ─────────────────────────── */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(13,18,40,0.5)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight={700}>Overall Progress</Typography>
          <Typography variant="body2" color="text.secondary">{stats.solved} / {goalTarget} problems</Typography>
        </Box>
        <LinearProgress variant="determinate" value={goalPct} sx={{
          height: 10, borderRadius: 5,
          bgcolor: 'rgba(255,255,255,0.08)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #00f593, #6c63ff)',
            borderRadius: 5,
          },
        }} />
        <Box display="flex" gap={3} mt={1.5}>
          {(['easy','medium','hard'] as const).map(d => (
            <Box key={d} display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ w: 8, h: 8, width: 8, height: 8, borderRadius: '50%', bgcolor: DIFFICULTY_CONFIG[d].color }} />
              <Typography variant="caption" color="text.secondary" textTransform="capitalize">{d}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── Company Filter ─────────────────────── */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(13,18,40,0.5)' }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Business sx={{ color: '#6c63ff' }} />
          <Typography variant="h6" fontWeight={700}>Practice by Company</Typography>
        </Box>
        {['service','product'].map(type => (
          <Box key={type} mb={1.5}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
              {type === 'service' ? '🏢 Service' : '🚀 Product'} Companies
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {COMPANY_CONFIG.filter(c => c.type === type).map(company => {
                const selected = filters.company === company.name;
                const cs = stats.companySpecific[company.name];
                return (
                  <Tooltip key={company.name} title={cs ? `Solved: ${cs.solved}` : `Practice ${company.name} questions`}>
                    <Chip
                      label={
                        <Box display="flex" alignItems="center" gap={0.5}>
                          {company.name}
                          {cs && cs.solved > 0 && <CheckCircle sx={{ fontSize: 12, color: '#00f593' }} />}
                        </Box>
                      }
                      onClick={() => handleFilterChange('company', selected ? '' : company.name)}
                      clickable
                      sx={{
                        borderColor: selected ? company.color : 'rgba(255,255,255,0.12)',
                        bgcolor: selected ? `${company.color}22` : 'transparent',
                        color: selected ? company.color : 'text.secondary',
                        fontWeight: selected ? 700 : 400,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: `${company.color}18`, borderColor: company.color },
                      }}
                      variant="outlined"
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        ))}
      </Paper>

      {/* ── Tabs ────────────────────────────────── */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{
        mb: 3, borderBottom: '1px solid rgba(255,255,255,0.07)',
        '& .MuiTab-root': { fontWeight: 600 },
        '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #6c63ff, #00d4ff)' },
      }}>
        <Tab label="All Problems" icon={<Code />} iconPosition="start" />
        <Tab label="My Progress" icon={<Timeline />} iconPosition="start" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* ── Search & Filters ──────────────── */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(13,18,40,0.5)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField fullWidth placeholder="Search problems…" variant="outlined" size="small"
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Difficulty</InputLabel>
                  <Select value={filters.difficulty} label="Difficulty" onChange={e => handleFilterChange('difficulty', e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {(['easy','medium','hard'] as const).map(d => (
                      <MenuItem key={d} value={d} sx={{ color: DIFFICULTY_CONFIG[d].color, fontWeight: 600, textTransform: 'capitalize' }}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={filters.category} label="Category" onChange={e => handleFilterChange('category', e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Pattern</InputLabel>
                  <Select value={filters.pattern} label="Pattern" onChange={e => handleFilterChange('pattern', e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {PATTERNS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                {hasFilters && (
                  <Button fullWidth variant="outlined" size="small" startIcon={<ClearAll />} onClick={clearFilters} color="warning">
                    Clear
                  </Button>
                )}
              </Grid>
            </Grid>
            {hasFilters && (
              <Box mt={1.5} display="flex" gap={1} flexWrap="wrap">
                {filters.difficulty && <Chip label={filters.difficulty} size="small" onDelete={() => handleFilterChange('difficulty', '')} sx={{ textTransform: 'capitalize', bgcolor: DIFFICULTY_CONFIG[filters.difficulty as keyof typeof DIFFICULTY_CONFIG]?.bg, color: DIFFICULTY_CONFIG[filters.difficulty as keyof typeof DIFFICULTY_CONFIG]?.color }} />}
                {filters.category  && <Chip label={filters.category}  size="small" onDelete={() => handleFilterChange('category', '')}  />}
                {filters.pattern   && <Chip label={filters.pattern}   size="small" onDelete={() => handleFilterChange('pattern', '')}   />}
                {filters.company   && <Chip label={filters.company}   size="small" onDelete={() => handleFilterChange('company', '')}   />}
                {filters.search    && <Chip label={`"${filters.search}"`} size="small" onDelete={() => handleFilterChange('search', '')} />}
              </Box>
            )}
          </Paper>

          {/* ── Problem Grid ──────────────────── */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : filteredProblems.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid rgba(255,255,255,0.07)' }}>
              <Psychology sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No problems found</Typography>
              <Typography variant="body2" color="text.secondary">Try clearing your filters or exploring a different category.</Typography>
              {hasFilters && <Button sx={{ mt: 2 }} onClick={clearFilters} startIcon={<ClearAll />}>Clear Filters</Button>}
            </Paper>
          ) : (
            <>
              <Grid container spacing={2.5}>
                {filteredProblems.map(problem => {
                  const dConfig = DIFFICULTY_CONFIG[problem.difficulty];
                  return (
                    <Grid item xs={12} sm={6} md={4} key={problem._id}>
                      <Card elevation={0} onClick={() => navigate(`/student/dsa/problem/${problem._id}`)} sx={{
                        cursor: 'pointer',
                        height: '100%',
                        background: 'rgba(13,18,40,0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.25,0.8,0.25,1)',
                        '&::before': {
                          content: '""', position: 'absolute', top: 0, left: 0,
                          width: '100%', height: '3px',
                          background: `linear-gradient(90deg, ${dConfig.color}, transparent)`,
                        },
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: `0 16px 40px rgba(0,0,0,0.4), 0 0 20px ${dConfig.color}22`,
                          borderColor: `${dConfig.color}40`,
                        },
                      }}>
                        <CardContent sx={{ p: 2.5 }}>
                          {/* title + difficulty */}
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, pr: 1, lineHeight: 1.3 }}>
                              {problem.title}
                            </Typography>
                            <Chip label={problem.difficulty} size="small" sx={{
                              textTransform: 'capitalize', fontWeight: 700, flexShrink: 0,
                              bgcolor: dConfig.bg, color: dConfig.color, border: `1px solid ${dConfig.color}44`,
                            }} />
                          </Box>

                          {/* category + pattern */}
                          <Box display="flex" flexWrap="wrap" gap={0.5} mb={1.5}>
                            <Chip label={problem.category} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
                            <Chip label={problem.pattern}  size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
                          </Box>

                          {/* companies */}
                          {problem.companies?.length > 0 && (
                            <Box mb={1.5}>
                              <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {problem.companies.slice(0, 3).map((co, idx) => {
                                  const cfg = COMPANY_CONFIG.find(c => c.name === co);
                                  return (
                                    <Chip key={idx} label={co} size="small" sx={{
                                      fontSize: 10, height: 20, fontWeight: 600,
                                      bgcolor: cfg ? `${cfg.color}18` : 'rgba(255,255,255,0.05)',
                                      color: cfg?.color || 'text.secondary',
                                      border: 'none',
                                    }} />
                                  );
                                })}
                                {problem.companies.length > 3 && (
                                  <Chip label={`+${problem.companies.length - 3}`} size="small" sx={{ fontSize: 10, height: 20 }} />
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* footer */}
                          <Divider sx={{ mb: 1.5, opacity: 0.3 }} />
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              Acceptance: {problem.acceptanceRate?.toFixed(0) || 0}%
                            </Typography>
                            <Button variant="contained" size="small" startIcon={<Bolt />}
                              onClick={e => { e.stopPropagation(); navigate(`/student/dsa/problem/${problem._id}`); }}
                              sx={{
                                background: `linear-gradient(135deg, ${dConfig.color}cc, ${dConfig.color}88)`,
                                color: '#000', fontWeight: 700, fontSize: 11, py: 0.4, px: 1.5,
                                '&:hover': { background: dConfig.color, transform: 'scale(1.05)' },
                              }}
                            >
                              Solve
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="large" />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" fontWeight={700} mb={2.5}>Your Performance</Typography>

          {/* Summary stats */}
          <Grid container spacing={2} mb={3}>
            {[
              { label: 'Total Solved',    value: stats.solved,            color: '#00f593', icon: <CheckCircle /> },
              { label: 'Accuracy',        value: `${stats.accuracy.toFixed(1)}%`, color: '#6c63ff', icon: <TrendingUp /> },
              { label: 'Goal Progress',   value: `${goalPct.toFixed(0)}%`, color: '#ffd60a', icon: <EmojiEvents /> },
            ].map((item, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Paper elevation={0} sx={{
                  p: 3, textAlign: 'center', borderRadius: 3,
                  border: `1px solid ${item.color}33`, background: `${item.color}0a`,
                }}>
                  <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
                  <Typography variant="h4" fontWeight={900} sx={{ color: item.color }}>{item.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Company-wise progress */}
          <Typography variant="h6" fontWeight={700} mb={2}>Company-wise Progress</Typography>
          {Object.keys(stats.companySpecific).length > 0 ? (
            <Grid container spacing={2}>
              {Object.entries(stats.companySpecific).map(([company, cs]) => {
                const cfg = COMPANY_CONFIG.find(c => c.name === company);
                const pct = cs.total > 0 ? (cs.solved / cs.total) * 100 : 0;
                return (
                  <Grid item xs={12} sm={6} md={4} key={company}>
                    <Card elevation={0} sx={{
                      borderRadius: 3, p: 2, border: '1px solid rgba(255,255,255,0.07)',
                      background: 'rgba(13,18,40,0.5)',
                      '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: cfg?.color || '#6c63ff', borderRadius: '12px 12px 0 0' },
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" fontWeight={700}>{company}</Typography>
                          <Chip label={`${cs.solved}/${cs.total}`} size="small" sx={{ bgcolor: `${cfg?.color || '#6c63ff'}22`, color: cfg?.color || '#6c63ff', fontWeight: 700 }} />
                        </Box>
                        <LinearProgress variant="determinate" value={pct} sx={{
                          height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.08)',
                          '& .MuiLinearProgress-bar': { background: cfg?.color || '#6c63ff', borderRadius: 3 },
                        }} />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {pct.toFixed(0)}% accuracy
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              No company-wise data yet. Start solving company-tagged problems to track your progress here!
            </Alert>
          )}

          {/* Recent activity */}
          {stats.recentActivity.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6" fontWeight={700} mb={2}>Recent Activity</Typography>
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                {stats.recentActivity.slice(0, 8).map((act, i) => (
                  <Box key={i} sx={{
                    px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 2,
                    borderBottom: i < stats.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                  }}>
                    <CheckCircle sx={{ color: '#00f593', fontSize: 18 }} />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600}>Problem Solved</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(act.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Chip label={act.status} size="small" sx={{ bgcolor: 'rgba(0,245,147,0.12)', color: '#00f593', fontWeight: 700, textTransform: 'capitalize' }} />
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DSAPractice;
