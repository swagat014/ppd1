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
} from '@mui/material';
import { Business, CheckCircle, Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Department {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState('');
  
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
          
          <Typography variant="body1" color="textSecondary" mb={3}>
            Manage academic departments, their configurations, and associated data.
          </Typography>
          
          <Paper elevation={4} sx={{ p: 3, background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.light" mb={2}>
              Available Departments
            </Typography>
            <List>
              {departments.map((dept) => (
                <ListItem 
                  key={dept._id} 
                  sx={{ 
                    mb: 1, 
                    borderRadius: 2, 
                    background: 'rgba(0, 204, 82, 0.05)', 
                    border: '1px solid rgba(0, 204, 82, 0.1)', 
                    '&:hover': { background: 'rgba(0, 204, 82, 0.15)' },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#00ff64' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={dept.name}
                      primaryTypographyProps={{ color: 'primary.light', fontWeight: 'medium' }}
                    />
                  </Box>
                  <Box display="flex" gap={1}>
                    <Chip 
                      label={dept.isActive ? "Active" : "Inactive"} 
                      color={dept.isActive ? "success" : "default"} 
                      size="small" 
                      sx={{ 
                        background: dept.isActive ? 'linear-gradient(135deg, #00cc52, #00ff64)' : 'rgba(100, 100, 100, 0.3)',
                        color: dept.isActive ? 'black' : 'text.primary',
                        fontWeight: 'bold'
                      }}
                    />
                    <Tooltip title="Edit department">
                      <IconButton 
                        color="primary" 
                        onClick={() => {
                          setEditingDepartment(dept);
                          setNewDepartment(dept.name);
                          setOpenDialog(true);
                        }}
                        size="small"
                        sx={{
                          color: '#00ff64',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 204, 82, 0.2)',
                            color: '#ffffff',
                          },
                          width: '32px',
                          height: '32px',
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete department">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteDepartment(dept._id)}
                        size="small"
                        sx={{
                          color: '#ff6b6b',
                          '&:hover': {
                            backgroundColor: 'rgba(220, 20, 60, 0.2)',
                            color: '#ffffff',
                          },
                          width: '32px',
                          height: '32px',
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
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