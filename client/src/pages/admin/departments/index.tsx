import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  InputAdornment,
  Avatar,
  Stack,
  Grid,
  Divider,
} from '@mui/material';
import { Business, CheckCircle, Add, Edit, Delete, Search, GroupWork, ToggleOn, ToggleOff } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Department {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
  teacherCount?: number;
}

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const stats = {
    total: departments.length,
    active: departments.filter(d => d.isActive).length,
    inactive: departments.filter(d => !d.isActive).length,
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/departments');
      setDepartments(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDepartments();
  }, []);
  
  const handleCreateDepartment = async () => {
    try {
      await axios.post('/admin/departments', { name: newDepartment });
      toast.success('Department created successfully');
      setNewDepartment('');
      setOpenDialog(false);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    }
  };
  
  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;
    
    try {
      await axios.put(`/admin/departments/${editingDepartment._id}`, {
        name: editingDepartment.name,
        isActive: editingDepartment.isActive
      });
      toast.success('Department updated successfully');
      setOpenDialog(false);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update department');
    }
  };
  
  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await axios.delete(`/admin/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };
  
  const handleDialogSubmit = () => {
    if (editingDepartment) {
      handleUpdateDepartment();
    } else {
      handleCreateDepartment();
    }
  };
  
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.light">
              <Business sx={{ mr: 1, verticalAlign: 'middle', color: '#00ff64' }} />
              Department Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add sx={{ color: 'black' }} />}
              onClick={() => {
                setEditingDepartment(null);
                setNewDepartment('');
                setOpenDialog(true);
              }}
              sx={{
                background: 'linear-gradient(135deg, #00cc52, #00ff64)',
                color: 'black',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.9rem',
                minWidth: 120,
                height: 36,
                boxShadow: '0 4px 12px rgba(0, 204, 82, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00ff64, #00cc52)',
                  boxShadow: '0 6px 16px rgba(0, 204, 82, 0.4)',
                },
              }}
            >
              Add Department
            </Button>
          </Box>
          
          <Typography variant="body1" color="textSecondary" mb={4}>
            Configure and manage academic divisions, monitor enrollment, and oversee departmental performance.
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={4}>
              <Paper className="glass-card" sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(0, 255, 100, 0.1)' }}>
                <GroupWork sx={{ color: '#00ff64', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                <Typography variant="body2" color="textSecondary">Total Departments</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper className="glass-card" sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
                <ToggleOn sx={{ color: '#00d4ff', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">{stats.active}</Typography>
                <Typography variant="body2" color="textSecondary">Active</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper className="glass-card" sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(255, 77, 77, 0.1)' }}>
                <ToggleOff sx={{ color: '#ff4d4d', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">{stats.inactive}</Typography>
                <Typography variant="body2" color="textSecondary">Inactive</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={4} sx={{ p: 3, background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold" color="primary.light">
                Available Departments
              </Typography>
              <TextField
                size="small"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'rgba(255,255,255,0.3)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />
            </Box>
            <List>
              {filteredDepartments.map((dept) => (
                <ListItem 
                  key={dept._id} 
                  sx={{ 
                    mb: 1.5, 
                    borderRadius: 2, 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                    '&:hover': { background: 'rgba(0, 204, 82, 0.08)', borderColor: 'rgba(0, 204, 82, 0.3)' },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'rgba(0, 255, 100, 0.1)', color: '#00ff64' }}>
                      <Business />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="white">
                        {dept.name}
                      </Typography>
                      <Box display="flex" gap={2}>
                        <Typography variant="caption" color="textSecondary">
                          Created on {new Date(dept.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#00ff64', fontWeight: 'bold' }}>
                          {dept.studentCount || 0} Students
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#00d4ff', fontWeight: 'bold' }}>
                          {dept.teacherCount || 0} Teachers
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip 
                      label={dept.isActive ? "Active" : "Inactive"} 
                      size="small" 
                      sx={{ 
                        background: dept.isActive ? 'rgba(0, 204, 82, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: dept.isActive ? '#00ff64' : 'rgba(255,255,255,0.5)',
                        fontWeight: 'bold',
                        border: `1px solid ${dept.isActive ? 'rgba(0, 204, 82, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                      }}
                    />
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, opacity: 0.1 }} />
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => {
                          setEditingDepartment(dept);
                          setNewDepartment(dept.name);
                          setOpenDialog(true);
                        }}
                        size="small"
                        sx={{ color: '#00d4ff', '&:hover': { bgcolor: 'rgba(0, 212, 255, 0.1)' } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDeleteDepartment(dept._id)}
                        size="small"
                        sx={{ color: '#ff4d4d', '&:hover': { bgcolor: 'rgba(255, 77, 77, 0.1)' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItem>
              ))}
              {filteredDepartments.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography color="textSecondary">No departments found matching "{searchTerm}"</Typography>
                </Box>
              )}
            </List>
          </Paper>
          
          {/* Department Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'linear-gradient(135deg, #000000, #0a0a0a)', borderRadius: 3, border: '1px solid rgba(0, 100, 0, 0.4)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)' } }}>
            <DialogTitle sx={{ background: 'linear-gradient(to right, #006400, #388e3c)', color: 'white', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 255, 255, 0.3)', py: 2 }}>
              {editingDepartment ? 'Edit Department' : 'Add Department'}
            </DialogTitle>
            <DialogContent>
              <Box mt={2}>
                <TextField
                  label="Department Name"
                  value={editingDepartment ? editingDepartment.name : newDepartment}
                  onChange={(e) => {
                    if (editingDepartment) {
                      setEditingDepartment({
                        ...editingDepartment,
                        name: e.target.value
                      });
                    } else {
                      setNewDepartment(e.target.value);
                    }
                  }}
                  fullWidth
                  required
                  margin="normal"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setOpenDialog(false)} 
                sx={{
                  color: '#a5d6a7',
                  '&:hover': {
                    color: '#00ff64',
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDialogSubmit}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #00cc52, #00ff64)',
                  color: 'black',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00ff64, #00cc52)',
                  }
                }}
              >
                {editingDepartment ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default DepartmentsPage;