import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  Avatar,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Add, Search, Person, School, Work, Business, AdminPanelSettings, People } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

interface StudentInfo {
  fathers_name: string;
  phone: string;
  date_of_birth: string;
}

interface User {
  _id: string;
  email: string;
  role: 'student' | 'teacher' | 'tpo' | 'admin';
  profile: {
    name: string;
    phone?: string;
    department?: string;
    dateOfBirth?: string;
  };
  studentInfo?: StudentInfo;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface FormProfile {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: 'student' | 'teacher' | 'tpo' | 'admin';
  isActive: boolean;
  dateOfBirth?: string;
  studentInfo?: {
    fathers_name?: string;
    date_of_birth?: string;
  };
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'tpo' | 'admin'>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<{ _id: string; name: string; isActive: boolean }[]>([]);
  const [formData, setFormData] = useState<FormProfile>({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'student',
    isActive: true,
    studentInfo: {
      fathers_name: '',
      date_of_birth: '',
    },
  });

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/admin/departments');
      setDepartments(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch departments');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users');
      setUsers(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user =>
      user.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Apply role filter if not 'all'
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(itemId => itemId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.profile.name,
      email: user.email,
      phone: user.profile.phone || '',
      department: user.profile.department || '',
      role: user.role,
      isActive: user.isActive,
      dateOfBirth: user.profile.dateOfBirth || '',
      studentInfo: {
        fathers_name: user.studentInfo?.fathers_name || '',
        date_of_birth: user.studentInfo?.date_of_birth || '',
      },
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      // Prepare the payload, extracting student info if needed
      const { studentInfo, dateOfBirth, ...userData } = formData;
      
      // Create the payload dynamically
      let payload: any = { ...userData };
      
      if (formData.role === 'student' && studentInfo) {
        payload.studentData = {
          fathers_name: studentInfo.fathers_name || '',
          date_of_birth: studentInfo.date_of_birth || '',
        };
      }
      
      // Determine the date of birth to use - prioritize student date of birth for students
      const dobToUse = formData.role === 'student' && studentInfo?.date_of_birth 
        ? studentInfo.date_of_birth 
        : dateOfBirth;
      
      // Include date of birth in the payload
      if (dobToUse) {
        payload.dateOfBirth = dobToUse;
      }
      
      if (formData.role === 'student' && studentInfo) {
        payload.studentData = {
          fathers_name: studentInfo.fathers_name || '',
          date_of_birth: studentInfo.date_of_birth || '',
        };
      }
      
      if (currentUser) {
        // Update existing user
        await axios.put(`/admin/users/${currentUser._id}`, payload);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await axios.post('/admin/users', payload);
        toast.success('User created successfully');
      }
      
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!currentUser) return;
      
      await axios.delete(`/admin/users/${currentUser._id}`);
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.delete('/admin/users/bulk', { data: { ids: selectedUsers } });
      toast.success('Selected users deleted successfully');
      setSelectedUsers([]);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete users');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'secondary';
      case 'tpo': return 'warning';
      case 'teacher': return 'info';
      case 'student': return 'primary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'tpo': return <Business />;
      case 'teacher': return <Work />;
      case 'student': return <School />;
      default: return <Person />;
    }
  };

  const getRoleAvatarColor = (role: string) => {
    switch (role) {
      case 'admin': return 'secondary';
      case 'tpo': return 'warning';
      case 'teacher': return 'info';
      case 'student': return 'primary';
      default: return 'default';
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box my={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main" gutterBottom sx={{ textShadow: '0 0 15px rgba(0, 100, 0, 0.4)', fontSize: { xs: '1.8rem', sm: '2.2rem' } }}>
                👥 User Management
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.8 }}>
                Manage all platform users and their roles
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              {selectedUsers.length > 0 && (
                <Tooltip title="Delete Selected Users">
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleBulkDelete}
                    size="small"
                    sx={{ minWidth: 120, height: 36 }}
                  >
                    Delete ({selectedUsers.length})
                  </Button>
                </Tooltip>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add sx={{ color: 'black' }} />}
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    department: '',
                    role: 'student',
                    isActive: true,
                    dateOfBirth: '',
                    studentInfo: {
                      fathers_name: '',
                      date_of_birth: '',
                    },
                  });
                  setCurrentUser(null);
                  setEditDialogOpen(true);
                }}
                size="small"
                sx={{ 
                  background: 'linear-gradient(135deg, #00cc52, #00ff64)',
                  color: 'black',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  minWidth: 100, 
                  height: 36,
                  boxShadow: '0 4px 12px rgba(0, 204, 82, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00ff64, #00cc52)',
                    boxShadow: '0 6px 16px rgba(0, 204, 82, 0.4)',
                  },
                }}
              >
                Add User
              </Button>
            </Box>
          </Box>

          <Paper elevation={8} sx={{ p: 2, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(10, 10, 10, 0.7))', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 100, 0, 0.4)', boxShadow: '0 10px 30px rgba(0, 100, 0, 0.25)', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(0, 100, 0, 0.8), transparent)' }} />
            <Grid container alignItems="center" spacing={2} pt={1}>
              <Grid item xs={12} md={6}>
                <TextField
                  placeholder="Search users by name, email, or role..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1.5 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(0, 100, 0, 0.15)',
                      borderRadius: 2,
                      pl: 1,
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 100, 0, 0.7)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(0, 100, 0, 0.9)',
                        borderWidth: '2px',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent={{ xs: 'space-between', md: 'flex-end' }} alignItems="center" flexWrap="wrap" gap={2}>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={`Total: ${users.length}`}
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ height: 28, background: 'rgba(0, 204, 82, 0.15)', border: '1px solid rgba(0, 204, 82, 0.4)', fontWeight: 600, color: '#e8f5e9' }}
                    />
                    <Chip
                      label={`Students: ${users.filter(u => u.role === 'student').length}`}
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ height: 28, background: 'rgba(0, 204, 82, 0.15)', border: '1px solid rgba(0, 204, 82, 0.4)', fontWeight: 600, color: '#e8f5e9' }}
                    />
                    <Chip
                      label={`Teachers: ${users.filter(u => u.role === 'teacher').length}`}
                      variant="outlined"
                      color="info"
                      size="small"
                      sx={{ height: 28, background: 'rgba(0, 204, 82, 0.15)', border: '1px solid rgba(0, 204, 82, 0.4)', fontWeight: 600, color: '#e8f5e9' }}
                    />
                    <Chip
                      label={`TPO: ${users.filter(u => u.role === 'tpo').length}`}
                      variant="outlined"
                      color="warning"
                      size="small"
                      sx={{ height: 28, background: 'rgba(0, 204, 82, 0.15)', border: '1px solid rgba(0, 204, 82, 0.4)', fontWeight: 600, color: '#e8f5e9' }}
                    />
                  </Box>
                  <ToggleButtonGroup
                    value={roleFilter}
                    exclusive
                    onChange={(event, newRole) => newRole !== null && setRoleFilter(newRole)}
                    size="medium"
                    color="primary"
                    orientation="horizontal"
                    sx={{ 
                      height: 40, 
                      background: 'rgba(0, 204, 82, 0.1)', 
                      borderRadius: 2, 
                      border: '2px solid rgba(0, 204, 82, 0.4)', 
                      p: 0.5,
                      display: 'inline-flex',
                      flexWrap: 'nowrap',
                      gap: 0.5,
                      '& .MuiToggleButtonGroup-grouped': {
                        margin: 0,
                        border: 'none',
                        borderRadius: '8px !important',
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #00cc52, #00ff64)',
                          color: 'black',
                          boxShadow: '0 4px 10px rgba(0, 204, 82, 0.3)',
                        },
                        '&:not(:first-of-type)': {
                          borderRadius: '8px !important',
                        },
                        '&:first-of-type': {
                          borderRadius: '8px !important',
                        },
                      }
                    }}
                  >
                    <ToggleButton value="all" size="medium" sx={{ px: 2.5, py: 1, color: 'text.primary', fontWeight: 'bold', fontSize: '0.9rem', minWidth: 80 }}>
                      All
                    </ToggleButton>
                    <ToggleButton value="student" size="medium" sx={{ px: 2.5, py: 1, color: 'text.primary', fontWeight: 'bold', fontSize: '0.9rem', minWidth: 80 }}>
                      Students
                    </ToggleButton>
                    <ToggleButton value="teacher" size="medium" sx={{ px: 2.5, py: 1, color: 'text.primary', fontWeight: 'bold', fontSize: '0.9rem', minWidth: 80 }}>
                      Teachers
                    </ToggleButton>
                    <ToggleButton value="tpo" size="medium" sx={{ px: 2.5, py: 1, color: 'text.primary', fontWeight: 'bold', fontSize: '0.9rem', minWidth: 80 }}>
                      TPO
                    </ToggleButton>
                    <ToggleButton value="admin" size="medium" sx={{ px: 2.5, py: 1, color: 'text.primary', fontWeight: 'bold', fontSize: '0.9rem', minWidth: 80 }}>
                      Admin
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(event, newViewMode) => newViewMode !== null && setViewMode(newViewMode)}
                    size="small"
                    color="primary"
                    sx={{ height: 32, background: 'rgba(0, 204, 82, 0.15)', borderRadius: 2, border: '1px solid rgba(0, 204, 82, 0.4)', p: 0.5 }}
                  >
                    <ToggleButton value="table" size="small" sx={{ px: 2, py: 0.8, color: 'text.primary', '&.Mui-selected': { color: 'black', background: 'linear-gradient(135deg, #00cc52, #00ff64)' }, borderRadius: 1.5 }}>
                      Table
                    </ToggleButton>
                    <ToggleButton value="cards" size="small" sx={{ px: 2, py: 0.8, color: 'text.primary', '&.Mui-selected': { color: 'black', background: 'linear-gradient(135deg, #00cc52, #00ff64)' }, borderRadius: 1.5 }}>
                      Cards
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {viewMode === 'table' ? (
            <Paper elevation={4} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ background: '#000000', '& th': { fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: 1, border: '1px solid rgba(0, 204, 82, 0.3)', fontSize: '0.8rem', py: 1 }, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
                    <TableRow>
                      <TableCell padding="checkbox" width={40}>
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAll}
                          size="small"
                          sx={{
                            color: '#00ff64',
                            '&.Mui-checked': {
                              color: '#00ff64',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell width={160}>User</TableCell>
                      <TableCell width={160}>Email</TableCell>
                      <TableCell width={100}>Role</TableCell>
                      <TableCell width={120}>Department</TableCell>
                      <TableCell width={120}>Contact</TableCell>
                      <TableCell width={160}>Additional Info</TableCell>
                      <TableCell width={80}>Status</TableCell>
                      <TableCell width={100}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow 
                        key={user._id} 
                        hover 
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: '1px solid rgba(0, 204, 82, 0.4)' },
                          '&:nth-of-type(even)': { backgroundColor: 'rgba(0, 204, 82, 0.04)' },
                          transition: 'all 0.3s ease',
                          '&:hover': { backgroundColor: 'rgba(0, 204, 82, 0.15)', transform: 'scale(1.005)', boxShadow: '0 0 15px rgba(0, 204, 82, 0.3)' },
                          border: '1px solid rgba(0, 204, 82, 0.2)',
                          borderBottom: '1px solid rgba(0, 204, 82, 0.5)',
                          '&:not(:last-child)': {
                            borderBottom: '1px solid rgba(0, 204, 82, 0.4)',
                          },
                          '&:first-of-type': {
                            borderTop: '1px solid rgba(0, 204, 82, 0.5)',
                          },
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', verticalAlign: 'middle', py: 1 }}>
                          <Checkbox
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectOne(user._id)}
                            size="small"
                            sx={{
                              color: '#00ff64',
                              '&.Mui-checked': {
                                color: '#00ff64',
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', fontWeight: '500', verticalAlign: 'middle', py: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ bgcolor: `${getRoleAvatarColor(user.role)}.main`, color: 'white', border: '2px solid rgba(0, 204, 82, 0.4)', width: 32, height: 32, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                              {getRoleIcon(user.role)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="bold" color="primary.light" variant="body2">{user.profile.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', verticalAlign: 'middle', py: 1 }}>
                          <Typography noWrap variant="body2" color="primary.light">{user.email}</Typography>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', verticalAlign: 'middle', py: 1 }}>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            color={getRoleColor(user.role)}
                            size="small"
                            variant="outlined"
                            sx={{
                              border: '1px solid rgba(0, 204, 82, 0.4)',
                              background: 'rgba(0, 204, 82, 0.15)',
                              height: '24px',
                              fontSize: '0.7rem',
                              color: '#e8f5e9',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', verticalAlign: 'middle', py: 1 }}>
                          <Typography noWrap variant="body2" color="primary.light">{user.profile.department || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', verticalAlign: 'middle', py: 1 }}>
                          <Typography noWrap variant="body2" color="primary.light">{user.profile.phone || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', verticalAlign: 'middle', py: 1 }}>
                          {user.role === 'student' && user.studentInfo ? (
                            <Box>
                              <Typography variant="caption" display="block" color="primary.light" fontWeight="500">Father: {user.studentInfo.fathers_name}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary">DOB: {user.studentInfo.date_of_birth || user.profile.dateOfBirth}</Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="caption" display="block" color="text.secondary">DOB: {user.profile.dateOfBirth || 'N/A'}</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', verticalAlign: 'middle', py: 1 }}>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                            sx={{
                              border: '1px solid rgba(0, 204, 82, 0.4)',
                              background: 'rgba(0, 204, 82, 0.15)',
                              height: '24px',
                              fontSize: '0.7rem',
                              color: '#e8f5e9',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ border: '1px solid rgba(0, 204, 82, 0.3)', verticalAlign: 'middle', py: 1 }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(user)}
                            size="small"
                            title="Edit user"
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
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(user)}
                            size="small"
                            title="Delete user"
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredUsers.map((user) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
                  <Card 
                    elevation={8} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(10, 10, 10, 0.7))',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(0, 100, 0, 0.4)',
                      borderRadius: 3,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-5px) scale(1.03)',
                        boxShadow: '0 15px 35px rgba(0, 100, 0, 0.4)',
                        borderColor: 'rgba(0, 100, 0, 0.7)',
                      }
                    }}
                  >
                    <Box sx={{ bgcolor: 'rgba(0, 100, 0, 0.15)', p: 2, borderBottom: '2px solid rgba(0, 100, 0, 0.3)' }}>
                      <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                        <Avatar sx={{ bgcolor: `${getRoleAvatarColor(user.role)}.main`, color: 'white', width: 50, height: 50 }}>
                          {getRoleIcon(user.role)}
                        </Avatar>
                      </Box>
                      <Typography variant="h6" align="center" fontWeight="bold" color="text.primary">
                        {user.profile.name}
                      </Typography>
                      <Typography align="center" variant="caption" color="text.secondary" gutterBottom>
                        {user.email}
                      </Typography>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box mb={2} display="flex" gap={1}>
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          color={getRoleColor(user.role)}
                          size="small"
                          variant="filled"
                          sx={{
                            background: 'linear-gradient(135deg, #006400, #00c853)',
                            color: 'white',
                            border: '1px solid rgba(0, 100, 0, 0.5)',
                          }}
                        />
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                          variant="filled"
                          sx={{
                            background: 'linear-gradient(135deg, #006400, #00c853)',
                            color: 'white',
                            border: '1px solid rgba(0, 100, 0, 0.5)',
                          }}
                        />
                      </Box>
                      
                      <Box mb={1.5}>
                        <Typography variant="caption" color="text.secondary" display="block">Department</Typography>
                        <Typography noWrap variant="body2">{user.profile.department || 'N/A'}</Typography>
                      </Box>
                      
                      <Box mb={1.5}>
                        <Typography variant="caption" color="text.secondary" display="block">Phone</Typography>
                        <Typography noWrap variant="body2">{user.profile.phone || 'N/A'}</Typography>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>User Info</Typography>
                        {user.role === 'student' && user.studentInfo && (
                          <Typography variant="body2" display="block">Father: {user.studentInfo.fathers_name}</Typography>
                        )}
                        <Typography variant="body2" display="block">DOB: {user.profile.dateOfBirth || 'N/A'}</Typography>
                      </Box>
                    </CardContent>
                    
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-around' }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(user)}
                        size="small"
                        title="Edit user"
                        sx={{ flex: 1, mx: 0.5 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(user)}
                        size="small"
                        title="Delete user"
                        sx={{ flex: 1, mx: 0.5 }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {filteredUsers.length === 0 && !loading && (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center', 
              mt: 4, 
              borderRadius: 3, 
              border: '2px dashed', 
              borderColor: 'rgba(0, 100, 0, 0.5)',
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(10, 10, 10, 0.7))',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(0, 100, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(0, 100, 0, 0.8), transparent)' }} />
              <Box display="flex" flexDirection="column" alignItems="center" pt={1}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 100, height: 100, mb: 2, border: '2px solid', borderColor: 'rgba(0, 100, 0, 0.5)', boxShadow: '0 0 25px rgba(0, 100, 0, 0.4)', mt: 2 }}>
                  <People sx={{ fontSize: 50, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom sx={{ textShadow: '0 0 15px rgba(0, 100, 0, 0.4)', mt: 1 }}>
                  No users found
                </Typography>
                <Typography variant="h6" color="textSecondary" mb={3} sx={{ opacity: 0.8 }}>
                  {searchTerm ? 'Try adjusting your search criteria' : 'No users have been created yet'}
                </Typography>
                {!searchTerm && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="large"
                    startIcon={<Add />} 
                    onClick={() => {
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        department: '',
                        role: 'student',
                        isActive: true,
                        dateOfBirth: '',
                        studentInfo: {
                          fathers_name: '',
                          date_of_birth: '',
                        },
                      });
                      setCurrentUser(null);
                      setEditDialogOpen(true);
                    }}
                    sx={{ 
                      mt: 1,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(0, 100, 0, 0.4)',
                      '&:hover': {
                        boxShadow: '0 10px 30px rgba(0, 100, 0, 0.5)',
                      }
                    }}
                  >
                    Add Your First User
                  </Button>
                )}
              </Box>
            </Paper>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
              <Box display="flex" flexDirection="column" alignItems="center">
                <CircularProgress size={60} sx={{ mb: 2, color: 'primary.main' }} />
                <Typography variant="h6" color="textSecondary">Loading users...</Typography>
                <Typography variant="body2" color="textSecondary">Please wait while we fetch the user data</Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'linear-gradient(135deg, #000000, #0a0a0a)', borderRadius: 3, border: '1px solid rgba(0, 100, 0, 0.4)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)' } }}>
          <DialogTitle sx={{ background: 'linear-gradient(to right, #006400, #388e3c)', color: 'white', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 255, 255, 0.3)', py: 2 }}>
            {currentUser ? 'Edit User' : 'Add User'}
          </DialogTitle>
          <DialogContent>
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="tpo">TPO</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              {/* Student-specific fields - only show when role is student */}
              {formData.role === 'student' && (
                <>
                  <TextField
                    label="Father's Name"
                    value={formData.studentInfo?.fathers_name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      studentInfo: {
                        ...formData.studentInfo,
                        fathers_name: e.target.value
                      }
                    })}
                    fullWidth
                  />
                </>
              )}
              
              {/* Date of Birth field for all users */}
              <TextField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    dateOfBirth: e.target.value
                  });
                }}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              {/* Student-specific fields - only show when role is student */}
              {formData.role === 'student' && (
                <>
                  <TextField
                    label="Father's Name"
                    value={formData.studentInfo?.fathers_name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      studentInfo: {
                        ...formData.studentInfo,
                        fathers_name: e.target.value
                      }
                    })}
                    fullWidth
                  />
                </>
              )}
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive ? 'active' : 'inactive'}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEditDialogOpen(false)} 
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
              onClick={handleEditSubmit} 
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
              {currentUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { background: 'linear-gradient(135deg, #000000, #0a0a0a)', borderRadius: 3, border: '1px solid rgba(220, 20, 60, 0.4)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)' } }}>
          <DialogTitle sx={{ background: 'linear-gradient(to right, #b71c1c, #d32f2f)', color: 'white', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 255, 255, 0.3)', py: 2 }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user {currentUser?.profile.name}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
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
              onClick={handleDeleteConfirm} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #ff4d4d, #ff6666)',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff6666, #ff4d4d)',
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default UsersPage;