import React, { useState, useEffect } from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Description,
  Download,
  Refresh,
  Code,
  Quiz,
  People,
  TrendingUp,
  School,
  CheckCircle,
  Warning,
  Error,
  Business,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ReportData {
  totalStudents: number;
  totalProblems: number;
  totalTests: number;
  avgReadiness: number;
  avgDsaAccuracy: number;
  avgAptitudeScore: number;
  readyStudents: number;
  gettingReadyStudents: number;
  needsWorkStudents: number;
  companyCoverage: { [key: string]: number };
  topPerformingDepts: { name: string; avgScore: number; count: number }[];
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, studentsRes, dsaRes, aptitudeRes] = await Promise.all([
        axios.get(`${API_URL}/tpo/analytics`, { headers }),
        axios.get(`${API_URL}/tpo/students`, { headers }),
        axios.get(`${API_URL}/tpo/dsa/problems`, { headers }),
        axios.get(`${API_URL}/tpo/aptitude/tests`, { headers }),
      ]);

      const analytics = analyticsRes.data.data;
      const students = studentsRes.data.data || [];
      const dsaProblems = dsaRes.data.data || [];
      const aptitudeTests = aptitudeRes.data.data || [];

      // Calculate detailed stats
      const readyStudents = students.filter((s: any) => (s.readiness?.overallScore || 0) >= 80).length;
      const gettingReadyStudents = students.filter((s: any) => {
        const score = s.readiness?.overallScore || 0;
        return score >= 60 && score < 80;
      }).length;
      const needsWorkStudents = students.filter((s: any) => (s.readiness?.overallScore || 0) < 60).length;

      // Calculate department stats
      const deptStats: { [key: string]: { total: number; score: number } } = {};
      students.forEach((s: any) => {
        const dept = s.userId?.profile?.department || 'Unknown';
        if (!deptStats[dept]) {
          deptStats[dept] = { total: 0, score: 0 };
        }
        deptStats[dept].total++;
        deptStats[dept].score += s.readiness?.overallScore || 0;
      });

      const topPerformingDepts = Object.entries(deptStats)
        .map(([name, data]) => ({
          name,
          avgScore: Math.round(data.score / data.total),
          count: data.total,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 5);

      // Company coverage
      const companyCoverage: { [key: string]: number } = {};
      dsaProblems.forEach((p: any) => {
        p.companies?.forEach((c: string) => {
          companyCoverage[c] = (companyCoverage[c] || 0) + 1;
        });
      });
      aptitudeTests.forEach((t: any) => {
        t.companies?.forEach((c: string) => {
          companyCoverage[c] = (companyCoverage[c] || 0) + 1;
        });
      });

      setReportData({
        totalStudents: students.length,
        totalProblems: dsaProblems.length,
        totalTests: aptitudeTests.length,
        avgReadiness: Math.round(analytics.students.avgReadinessScore || 0),
        avgDsaAccuracy: Math.round(analytics.dsa.avgAcceptanceRate || 0),
        avgAptitudeScore: Math.round(analytics.aptitude.avgScore || 0),
        readyStudents,
        gettingReadyStudents,
        needsWorkStudents,
        companyCoverage,
        topPerformingDepts,
      });
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportReport = () => {
    if (!reportData) return;
    
    const reportText = `
PLACEMENT PREPARATION PLATFORM - TPO REPORT
Generated: ${new Date().toLocaleString()}

=============================================
SUMMARY STATISTICS
=============================================
Total Students: ${reportData.totalStudents}
Total DSA Problems: ${reportData.totalProblems}
Total Aptitude Tests: ${reportData.totalTests}

Average Readiness Score: ${reportData.avgReadiness}%
Average DSA Accuracy: ${reportData.avgDsaAccuracy}%
Average Aptitude Score: ${reportData.avgAptitudeScore}%

=============================================
STUDENT READINESS DISTRIBUTION
=============================================
Ready for Placement: ${reportData.readyStudents} (${Math.round((reportData.readyStudents / reportData.totalStudents) * 100) || 0}%)
Getting Ready: ${reportData.gettingReadyStudents} (${Math.round((reportData.gettingReadyStudents / reportData.totalStudents) * 100) || 0}%)
Needs Work: ${reportData.needsWorkStudents} (${Math.round((reportData.needsWorkStudents / reportData.totalStudents) * 100) || 0}%)

=============================================
TOP PERFORMING DEPARTMENTS
=============================================
${reportData.topPerformingDepts.map((d, i) => `${i + 1}. ${d.name}: ${d.avgScore}% avg (${d.count} students)`).join('\n')}

=============================================
COMPANY CONTENT COVERAGE
=============================================
${Object.entries(reportData.companyCoverage).map(([c, count]) => `${c}: ${count} items`).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TPO_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Reports
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Generate and view placement preparation reports
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportReport}
                disabled={!reportData}
              >
                Export Report
              </Button>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {reportData && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <People color="primary" />
                      <Typography color="text.secondary" variant="body2">
                        Total Students
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {reportData.totalStudents}
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
                        DSA Problems
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {reportData.totalProblems}
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
                        Aptitude Tests
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {reportData.totalTests}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingUp color="info" />
                      <Typography color="text.secondary" variant="body2">
                        Avg Readiness
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {reportData.avgReadiness}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={reportData.avgReadiness}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Readiness Distribution */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Student Readiness Distribution
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Ready for Placement"
                          secondary={`${reportData.readyStudents} students (${Math.round((reportData.readyStudents / reportData.totalStudents) * 100) || 0}%)`}
                        />
                        <Chip
                          label={`${reportData.readyStudents}`}
                          color="success"
                          size="small"
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Getting Ready"
                          secondary={`${reportData.gettingReadyStudents} students (${Math.round((reportData.gettingReadyStudents / reportData.totalStudents) * 100) || 0}%)`}
                        />
                        <Chip
                          label={`${reportData.gettingReadyStudents}`}
                          color="warning"
                          size="small"
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                      <ListItem>
                        <ListItemIcon>
                          <Error color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Needs Work"
                          secondary={`${reportData.needsWorkStudents} students (${Math.round((reportData.needsWorkStudents / reportData.totalStudents) * 100) || 0}%)`}
                        />
                        <Chip
                          label={`${reportData.needsWorkStudents}`}
                          color="error"
                          size="small"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Platform Performance
                    </Typography>
                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">DSA Accuracy Rate</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {reportData.avgDsaAccuracy}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={reportData.avgDsaAccuracy}
                        color="success"
                      />
                    </Box>
                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">Aptitude Average Score</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {reportData.avgAptitudeScore}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={reportData.avgAptitudeScore}
                        color="secondary"
                      />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">Overall Readiness</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {reportData.avgReadiness}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={reportData.avgReadiness}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Top Performing Departments */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Top Performing Departments
                </Typography>
                {reportData.topPerformingDepts.length === 0 ? (
                  <Alert severity="info">No department data available</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Rank</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Students</TableCell>
                          <TableCell>Average Readiness</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.topPerformingDepts.map((dept, index) => (
                          <TableRow key={dept.name} hover>
                            <TableCell>
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                color={index < 3 ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="medium">{dept.name}</Typography>
                            </TableCell>
                            <TableCell>{dept.count}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={dept.avgScore}
                                  sx={{ width: 100, height: 8, borderRadius: 4 }}
                                />
                                <Typography>{dept.avgScore}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={dept.avgScore >= 80 ? 'Excellent' : dept.avgScore >= 60 ? 'Good' : 'Needs Improvement'}
                                size="small"
                                color={dept.avgScore >= 80 ? 'success' : dept.avgScore >= 60 ? 'warning' : 'error'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Company Coverage */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Company Content Coverage
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {Object.entries(reportData.companyCoverage)
                    .sort((a, b) => b[1] - a[1])
                    .map(([company, count]) => (
                      <Chip
                        key={company}
                        label={`${company}: ${count} items`}
                        color={count > 5 ? 'success' : count > 0 ? 'warning' : 'default'}
                        variant={count > 0 ? 'filled' : 'outlined'}
                      />
                    ))}
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </TpoLayout>
  );
};

export default ReportsPage;
