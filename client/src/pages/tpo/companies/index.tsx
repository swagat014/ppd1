import React, { useState, useEffect } from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business,
  Work,
  TrendingUp,
  Code,
  Quiz,
  People,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COMPANIES = [
  { name: 'TCS', type: 'Service', tier: 'Tier 1', avgPackage: '₹3.5-7 LPA', color: '#1e88e5' },
  { name: 'Infosys', type: 'Service', tier: 'Tier 1', avgPackage: '₹3.5-6 LPA', color: '#43a047' },
  { name: 'Wipro', type: 'Service', tier: 'Tier 1', avgPackage: '₹3.5-6 LPA', color: '#7cb342' },
  { name: 'Cognizant', type: 'Service', tier: 'Tier 1', avgPackage: '₹4-7 LPA', color: '#fb8c00' },
  { name: 'Accenture', type: 'Service', tier: 'Tier 1', avgPackage: '₹4.5-8 LPA', color: '#8e24aa' },
  { name: 'Google', type: 'Product', tier: 'Tier 1', avgPackage: '₹20-50 LPA', color: '#e53935' },
  { name: 'Microsoft', type: 'Product', tier: 'Tier 1', avgPackage: '₹15-40 LPA', color: '#00acc1' },
  { name: 'Amazon', type: 'Product', tier: 'Tier 1', avgPackage: '₹15-45 LPA', color: '#f57c00' },
];

interface CompanyStats {
  name: string;
  dsaProblems: number;
  aptitudeTests: number;
  studentsAttempted: number;
  avgScore: number;
}

const CompaniesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalProblems: 0,
    totalTests: 0,
    totalStudents: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [dsaRes, aptitudeRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/tpo/dsa/problems`, { headers }),
        axios.get(`${API_URL}/tpo/aptitude/tests`, { headers }),
        axios.get(`${API_URL}/tpo/students`, { headers }),
      ]);

      const dsaProblems = dsaRes.data.data || [];
      const aptitudeTests = aptitudeRes.data.data || [];
      const students = studentsRes.data.data || [];

      // Calculate stats per company
      const stats: CompanyStats[] = COMPANIES.map((company) => {
        const companyDsa = dsaProblems.filter((p: any) => 
          p.companies?.includes(company.name)
        );
        const companyTests = aptitudeTests.filter((t: any) => 
          t.companies?.includes(company.name)
        );

        // Count students who attempted content for this company
        let studentsAttempted = 0;
        let totalScore = 0;

        students.forEach((student: any) => {
          const dsaCompany = student.practice?.dsa?.companySpecific?.get?.(company.name);
          const aptitudeCompany = student.practice?.aptitude?.companySpecific?.get?.(company.name);
          
          if (dsaCompany?.solved > 0 || aptitudeCompany?.completed > 0) {
            studentsAttempted++;
            if (aptitudeCompany?.averageScore) {
              totalScore += aptitudeCompany.averageScore;
            }
          }
        });

        return {
          name: company.name,
          dsaProblems: companyDsa.length,
          aptitudeTests: companyTests.length,
          studentsAttempted,
          avgScore: studentsAttempted > 0 ? Math.round(totalScore / studentsAttempted) : 0,
        };
      });

      setCompanyStats(stats);
      setTotalStats({
        totalProblems: dsaProblems.length,
        totalTests: aptitudeTests.length,
        totalStudents: students.length,
      });
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCompanyColor = (name: string) => {
    const company = COMPANIES.find(c => c.name === name);
    return company?.color || '#757575';
  };

  const getCompanyDetails = (name: string) => {
    return COMPANIES.find(c => c.name === name);
  };

  if (loading) {
    return (
      <TpoLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </TpoLayout>
    );
  }

  return (
    <TpoLayout>
      <Container maxWidth="xl">
        <Box mb={3}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Company Insights
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track content coverage and student engagement across companies
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Overview Stats */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Business color="primary" />
                  <Typography color="text.secondary" variant="body2">
                    Companies Covered
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {COMPANIES.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Code color="success" />
                  <Typography color="text.secondary" variant="body2">
                    Total DSA Problems
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {totalStats.totalProblems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Quiz color="secondary" />
                  <Typography color="text.secondary" variant="body2">
                    Total Aptitude Tests
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {totalStats.totalTests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <People color="info" />
                  <Typography color="text.secondary" variant="body2">
                    Active Students
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {totalStats.totalStudents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Company Cards */}
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Company Overview
        </Typography>
        <Grid container spacing={3} mb={3}>
          {COMPANIES.map((company) => {
            const stats = companyStats.find(s => s.name === company.name);
            const contentCount = (stats?.dsaProblems || 0) + (stats?.aptitudeTests || 0);
            const hasContent = contentCount > 0;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={company.name}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderTop: 3,
                    borderColor: company.color,
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Avatar sx={{ bgcolor: company.color, width: 40, height: 40 }}>
                        {company.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {company.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {company.type} • {company.tier}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Avg Package: <strong>{company.avgPackage}</strong>
                    </Typography>

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">Content Available</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {contentCount} items
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(contentCount * 10, 100)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: hasContent ? company.color : 'grey.400',
                          },
                        }}
                      />
                    </Box>

                    {stats && (
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          size="small"
                          icon={<Code fontSize="small" />}
                          label={`${stats.dsaProblems} DSA`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          icon={<Quiz fontSize="small" />}
                          label={`${stats.aptitudeTests} Tests`}
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {hasContent && (
                      <Box mt={2} display="flex" alignItems="center" gap={0.5}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="caption" color="success.main">
                          Ready for students
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Detailed Stats Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Company-wise Content & Engagement
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>DSA Problems</TableCell>
                    <TableCell>Aptitude Tests</TableCell>
                    <TableCell>Students Engaged</TableCell>
                    <TableCell>Avg Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyStats.map((stats) => {
                    const company = getCompanyDetails(stats.name);
                    const contentCount = stats.dsaProblems + stats.aptitudeTests;
                    
                    return (
                      <TableRow key={stats.name} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: company?.color }}>
                              {stats.name.charAt(0)}
                            </Avatar>
                            <Typography fontWeight="medium">{stats.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={company?.type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {stats.dsaProblems > 0 ? (
                            <Chip
                              label={stats.dsaProblems}
                              size="small"
                              color="success"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {stats.aptitudeTests > 0 ? (
                            <Chip
                              label={stats.aptitudeTests}
                              size="small"
                              color="primary"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {stats.studentsAttempted > 0 ? (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <People fontSize="small" color="action" />
                              <Typography>{stats.studentsAttempted}</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {stats.avgScore > 0 ? (
                            <Chip
                              label={`${stats.avgScore}%`}
                              size="small"
                              color={stats.avgScore >= 70 ? 'success' : stats.avgScore >= 50 ? 'warning' : 'error'}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </TpoLayout>
  );
};

export default CompaniesPage;
