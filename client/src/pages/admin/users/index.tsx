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
import { Edit, Delete, Add, Search, Person, School, Work, Business, AdminPanelSettings } from '@mui/icons-material';
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

  useEffect(() => {
    fetchUsers();
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
      if (!currentUser) return;
      
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
      
      // Always include date of birth in the profile update
      payload.dateOfBirth = dateOfBirth;
      
      await axios.put(`/admin/users/${currentUser._id}`, payload);
      toast.success('User updated successfully');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
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
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main" gutterBottom>
                User Management Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary">
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
                    sx={{ minWidth: 140 }}
                  >
                    Delete ({selectedUsers.length})
                  </Button>
                </Tooltip>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    department: '',
                    role: 'student',
                    isActive: true,
                  });
                  setCurrentUser(null);
                  setEditDialogOpen(true);
                }}
                sx={{ minWidth: 140 }}
              >
                Add User
              </Button>
            </Box>
          </Box>

          <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  placeholder="Search users by name, email, or role..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1 }} />,
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
                    />
                    <Chip
                      label={`Students: ${users.filter(u => u.role === 'student').length}`}
                      variant="outlined"
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`Teachers: ${users.filter(u => u.role === 'teacher').length}`}
                      variant="outlined"
                      color="info"
                      size="small"
                    />
                    <Chip
                      label={`TPO: ${users.filter(u => u.role === 'tpo').length}`}
                      variant="outlined"
                      color="warning"
                      size="small"
                    />
                  </Box>
                  <ToggleButtonGroup
                    value={roleFilter}
                    exclusive
                    onChange={(event, newRole) => newRole !== null && setRoleFilter(newRole)}
                    size="small"
                    color="primary"
                  >
                    <ToggleButton value="all" size="small">
                      All
                    </ToggleButton>
                    <ToggleButton value="student" size="small">
                      Students
                    </ToggleButton>
                    <ToggleButton value="teacher" size="small">
                      Teachers
                    </ToggleButton>
                    <ToggleButton value="tpo" size="small">
                      TPO
                    </ToggleButton>
                    <ToggleButton value="admin" size="small">
                      Admin
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(event, newViewMode) => newViewMode !== null && setViewMode(newViewMode)}
                    size="small"
                    color="primary"
                  >
                    <ToggleButton value="table" size="small">
                      Table
                    </ToggleButton>
                    <ToggleButton value="cards" size="small">
                      Cards
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {viewMode === 'table' ? (
            <Paper elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: 'primary.light', '& th': { fontWeight: 'bold', color: 'primary.contrastText' } }}>
                    <TableRow>
                      <TableCell padding="checkbox" width={60}>
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell width={200}>User</TableCell>
                      <TableCell width={200}>Email</TableCell>
                      <TableCell width={120}>Role</TableCell>
                      <TableCell width={150}>Department</TableCell>
                      <TableCell width={150}>Contact</TableCell>
                      <TableCell width={200}>Additional Info</TableCell>
                      <TableCell width={100}>Status</TableCell>
                      <TableCell width={120}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow 
                        key={user._id} 
                        hover 
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:nth-of-type(even)': { backgroundColor: 'grey.50' },
                          transition: 'background-color 0.2s',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectOne(user._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: `${getRoleAvatarColor(user.role)}.main`, color: 'white' }}>
                              {getRoleIcon(user.role)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="bold" color="text.primary">{user.profile.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap>{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            color={getRoleColor(user.role)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography noWrap>{user.profile.department || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap>{user.profile.phone || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>
                          {user.role === 'student' && user.studentInfo ? (
                            <Box>
                              <Typography variant="body2" display="block" color="text.primary" fontWeight="500">Father: {user.studentInfo.fathers_name}</Typography>
                              <Typography variant="body2" display="block" color="text.secondary">DOB: {user.studentInfo.date_of_birth || user.profile.dateOfBirth}</Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="body2" display="block" color="text.secondary">DOB: {user.profile.dateOfBirth || 'N/A'}</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(user)}
                            size="small"
                            title="Edit user"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(user)}
                            size="small"
                            title="Delete user"
                          >
                            <Delete />
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
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      }
                    }}
                  >
                    <Box sx={{ bgcolor: `${getRoleAvatarColor(user.role)}.light`, p: 2, borderBottom: 1, borderColor: 'divider' }}>
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
                      <Box mb={2}>
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          color={getRoleColor(user.role)}
                          size="small"
                          variant="filled"
                          sx={{ mb: 1 }}
                        />
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                          variant="filled"
                          sx={{ ml: 1 }}
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
            <Paper sx={{ p: 6, textAlign: 'center', mt: 4, borderRadius: 3, border: '2px dashed', borderColor: 'grey.300' }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.light', width: 100, height: 100, mb: 2 }}>
                  <Person sx={{ fontSize: 50, color: 'primary.main' }} />
                </Avatar>
                <Typography variant="h5" color="textPrimary" fontWeight="bold" gutterBottom>
                  No users found
                </Typography>
                <Typography variant="body1" color="textSecondary" mb={2}>
                  {searchTerm ? 'Try adjusting your search criteria' : 'No users have been created yet'}
                </Typography>
                {!searchTerm && (
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => {
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        department: '',
                        role: 'student',
                        isActive: true,
                      });
                      setCurrentUser(null);
                      setEditDialogOpen(true);
                    }}
                    sx={{ mt: 1 }}
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
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
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
              <TextField
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                fullWidth
              />
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
                value={formData.role === 'student' ? formData.studentInfo?.date_of_birth || '' : formData.dateOfBirth || ''}
                onChange={(e) => {
                  if (formData.role === 'student') {
                    setFormData({
                      ...formData,
                      studentInfo: {
                        ...formData.studentInfo,
                        date_of_birth: e.target.value
                      }
                    });
                  } else {
                    setFormData({
                      ...formData,
                      dateOfBirth: e.target.value
                    });
                  }
                }}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
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
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">
              {currentUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user {currentUser?.profile.name}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default UsersPage;