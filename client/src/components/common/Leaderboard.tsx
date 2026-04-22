import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Box as MuiBox,
  Skeleton,
  Pagination,
} from '@mui/material';
import { EmojiEvents, TrendingUp, LocalFireDepartment, WorkspacePremium, FilterList } from '@mui/icons-material';
import axios from 'axios';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface Ranking {
  rank: number;
  id: string;
  name: string;
  department: string;
  overallScore: number;
  dsaSolved: number;
  aptitudeScore: number;
  streak: number;
}

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'MBA', 'MCA'];

const Leaderboard: React.FC<{ 
  limit?: number; 
  showPagination?: boolean; 
  initialDepartment?: string;
  lockDepartment?: boolean;
  hideHeader?: boolean;
  compact?: boolean;
}> = ({ 
  limit = 10, 
  showPagination = false, 
  initialDepartment = '',
  lockDepartment = false,
  hideHeader = false,
  compact = false
}) => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [department, setDepartment] = useState(initialDepartment);

  useEffect(() => {
    if (initialDepartment) {
      setDepartment(initialDepartment);
    }
  }, [initialDepartment]);

  useEffect(() => {
    fetchRankings();
    
    const interval = setInterval(fetchRankings, 60000);
    return () => clearInterval(interval);
  }, [page, department]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      let url = `/student/leaderboard?page=${page}&limit=${limit}`;
      if (department) url += `&department=${department}`;
      
      const response = await axios.get(url);
      setRankings(response.data.data.rankings);
      setTotalPages(response.data.data.pages);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <WorkspacePremium sx={{ color: '#ffd60a', fontSize: 24 }} />;
    if (rank === 2) return <WorkspacePremium sx={{ color: '#e5e7eb', fontSize: 22 }} />;
    if (rank === 3) return <WorkspacePremium sx={{ color: '#d97706', fontSize: 20 }} />;
    return <Typography variant="caption" fontWeight="bold" sx={{ color: 'text.secondary' }}>{rank}</Typography>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00f593';
    if (score >= 60) return '#ffd60a';
    return '#f72585';
  };

  return (
    <Card className={`glass-card holographic-glow ${compact ? 'compact-leaderboard' : ''}`} sx={{ 
      height: '100%', 
      borderRadius: compact ? 4 : 6, 
      overflow: 'hidden',
      '& .MuiTableCell-root': compact ? { px: 1, py: 1.5 } : {}
    }}>
      <CardContent sx={{ p: compact ? 2 : 4 }}>
        {!hideHeader && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
            <Box>
              <Typography variant="h5" fontWeight="999" display="flex" alignItems="center" gap={2} sx={{ letterSpacing: 1, color: '#fff' }}>
                <EmojiEvents sx={{ color: '#ffd60a', fontSize: 28 }} /> GLOBAL ELITE
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.5 }}>Top performers across the decentralized disciplines</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={3}>
              {!lockDepartment && (
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={department}
                    displayEmpty
                    onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                    sx={{ 
                      height: 38, 
                      fontSize: '0.8rem', 
                      bgcolor: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      borderRadius: 3,
                      fontWeight: 999,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.05)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontWeight: 999 }}>ALL SECTORS</MenuItem>
                    {DEPARTMENTS.map(dept => (
                      <MenuItem key={dept} value={dept} sx={{ fontWeight: 999 }}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(34, 211, 238, 0.05)', display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid rgba(34, 211, 238, 0.1)' }}>
                <MuiBox className="led-pulse" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--accent-cyan)' }} />
                <Typography variant="caption" fontWeight="999" sx={{ color: 'var(--accent-cyan)', letterSpacing: 1 }}>SYNC</Typography>
              </Box>
            </Box>
          </Box>
        )}

        <TableContainer sx={{ overflow: 'visible' }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 999, borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'text.secondary', fontSize: '0.7rem', letterSpacing: 1.5 }}>RANK</TableCell>
                <TableCell sx={{ fontWeight: 999, borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'text.secondary', fontSize: '0.7rem', letterSpacing: 1.5 }}>OPERATIVE</TableCell>
                <TableCell sx={{ fontWeight: 999, borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'text.secondary', fontSize: '0.7rem', letterSpacing: 1.5 }} align="center">READINESS</TableCell>
                <TableCell sx={{ fontWeight: 999, borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'text.secondary', fontSize: '0.7rem', letterSpacing: 1.5 }} align="center">STREAK</TableCell>
                <TableCell sx={{ fontWeight: 999, borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'text.secondary', fontSize: '0.7rem', letterSpacing: 1.5 }} align="right">SOLVED</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && rankings.length === 0
                ? Array.from(new Array(limit)).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="circular" width={28} height={28} /></TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Skeleton variant="circular" width={36} height={36} />
                          <Skeleton variant="text" width={140} height={20} />
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="text" width={50} sx={{ mx: 'auto' }} /></TableCell>
                      <TableCell><Skeleton variant="text" width={50} sx={{ mx: 'auto' }} /></TableCell>
                      <TableCell><Skeleton variant="text" width={40} sx={{ ml: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                : rankings.map((row) => (
                    <TableRow 
                      key={row.id} 
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, 
                        transition: 'var(--transition-smooth)',
                        bgcolor: 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.01)'
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: row.rank <= 3 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                          {getRankIcon(row.rank)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={compact ? 1.5 : 2.5}>
                          <Avatar sx={{ 
                            width: compact ? 32 : 40, height: compact ? 32 : 40, fontSize: compact ? '0.75rem' : '0.9rem', 
                            background: row.rank === 1 ? 'linear-gradient(135deg, #ffd60a 0%, #d97706 100%)' : 'rgba(255,255,255,0.05)',
                            color: row.rank === 1 ? '#000' : '#fff',
                            fontWeight: 900,
                            border: row.rank === 1 ? '2px solid #ffd60a' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: row.rank === 1 ? '0 0 15px rgba(255, 214, 10, 0.3)' : 'none'
                          }}>
                            {row.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="999" sx={{ 
                              color: row.rank <= 3 ? '#fff' : 'rgba(255,255,255,0.9)',
                              fontSize: compact ? '0.85rem' : '0.95rem'
                            }}>{row.name}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', fontSize: compact ? '0.6rem' : '0.7rem', display: 'block', mt: 0.1 }}>{row.department.toUpperCase()}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box px={2} py={0.5} sx={{ 
                          bgcolor: `${getScoreColor(row.overallScore)}10`, 
                          borderRadius: 2, 
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: `1px solid ${getScoreColor(row.overallScore)}20`
                        }}>
                          <Typography variant="caption" fontWeight="999" sx={{ color: getScoreColor(row.overallScore), letterSpacing: 0.5 }}>
                            {Math.round(row.overallScore)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          <LocalFireDepartment sx={{ color: row.streak > 0 ? 'var(--secondary)' : 'rgba(255,255,255,0.05)', fontSize: 18 }} />
                          <Typography variant="subtitle2" fontWeight="999" sx={{ color: row.streak > 0 ? '#fff' : 'rgba(255,255,255,0.1)' }}>
                            {row.streak}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="999" sx={{ color: 'var(--primary)' }}>{row.dsaSolved}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>

        {showPagination && totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={5}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(_, v) => setPage(v)} 
              size="medium" 
              color="primary"
              sx={{ 
                '& .MuiPaginationItem-root': { color: 'rgba(255,255,255,0.4)', fontWeight: 999 },
                '& .Mui-selected': { bgcolor: 'var(--primary) !important', color: '#fff' }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
