import React, { useState, useEffect } from 'react';
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
  Checkbox,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import axios from 'axios';

interface Student {
  _id: string;
  email: string;
  role: 'student' | 'teacher' | 'tpo' | 'admin';
  profile: {
    name: string;
    phone?: string;
    department?: string;
  };
  studentInfo?: {
    fathers_name: string;
    phone: string;
    date_of_birth: string;
  };
  isActive: boolean;
  createdAt: string;
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    fathers_name: '',
    date_of_birth: '',
    department: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users');
      // Filter to only show students
      const studentUsers = response.data.data.filter((user: any) => user.role === 'student');
      setStudents(studentUsers);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    const filtered = students.filter(student =>
      student.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentInfo?.fathers_name && student.studentInfo.fathers_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredStudents(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(itemId => itemId !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleEditClick = (student: Student) => {
    // Split the full name back into first and last name
    const nameParts = student.profile.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setCurrentStudent(student);
    setFormData({
      firstName: firstName,
      lastName: lastName,
      email: student.email,
      phone: student.profile.phone || '',
      fathers_name: student.studentInfo?.fathers_name || '',
      date_of_birth: student.studentInfo?.date_of_birth || '',
      department: student.profile.department || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setCurrentStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (!currentStudent) return;
      
      await axios.put(`/admin/users/${currentStudent._id}`, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: 'student',
        isActive: currentStudent.isActive || true
      });
      toast.success('Student updated successfully');
      setEditDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!currentStudent) return;
      
      await axios.delete(`/admin/users/${currentStudent._id}`);
      toast.success('Student deleted successfully');
      setDeleteDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.delete('/admin/users/bulk', { data: { ids: selectedStudents } });
      toast.success('Selected students deleted successfully');
      setSelectedStudents([]);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete students');
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Student Management
            </Typography>
            <Box display="flex" gap={2}>
              {selectedStudents.length > 0 && (
                <Tooltip title="Delete Selected">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleBulkDelete}
                  >
                    Delete ({selectedStudents.length})
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                placeholder="Search students..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />,
                }}
              />
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Father's Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Date of Birth</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleSelectOne(student._id)}
                      />
                    </TableCell>
                    <TableCell>
                      {student.profile.name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.studentInfo?.fathers_name || 'N/A'}</TableCell>
                    <TableCell>{student.profile.phone || 'N/A'}</TableCell>
                    <TableCell>{student.profile.department || 'N/A'}</TableCell>
                    <TableCell>{student.studentInfo?.date_of_birth ? new Date(student.studentInfo.date_of_birth).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(student)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(student)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredStudents.length === 0 && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
              <Typography variant="h6" color="textSecondary">
                No students found
              </Typography>
            </Paper>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography variant="h6">Loading students...</Typography>
            </Box>
          )}
        </Box>
      </Container>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Father's Name"
              value={formData.fathers_name}
              onChange={(e) => setFormData({ ...formData, fathers_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete student {currentStudent?.profile.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default StudentManagement;