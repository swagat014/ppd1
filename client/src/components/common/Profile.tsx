import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Edit, Close, Save, Cancel, People, School, Work, Business, LocalLibrary } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

interface ProfileData {
  role: string;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      department?: string;
      year?: number;
      rollNumber?: string;
      enrollmentNumber?: string;
      course?: string;
      specialization?: string;
    };
  };
  studentInfo?: {
    fathers_name?: string;
    phone?: string;
    date_of_birth?: string;
    academicInfo?: {
      semesterRecords?: any[];
      cgpa?: number;
      backlogs?: any[];
      currentSemester?: number;
      year?: number;
    };
  };
  adminInfo?: {
    collegeName?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
  };
  teacherInfo?: {
    department?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
  };
  tpoInfo?: {
    department?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
  };
}

interface ProfileProps {
  open: boolean;
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ open, onClose }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingAcademic, setEditingAcademic] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [tempProfile, setTempProfile] = useState<any>(null);

  const handleEditProfile = () => {
    setTempProfile({ ...profile });
    if (profile?.adminInfo?.collegeName) {
      setCollegeName(profile.adminInfo.collegeName);
    }
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post('/api/profile', tempProfile);
      setProfile(tempProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setTempProfile(null);
    if (profile?.adminInfo?.collegeName) {
      setCollegeName(profile.adminInfo.collegeName);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile');
      setProfile(response.data.data);
      if (response.data.data.adminInfo) {
        setCollegeName(response.data.data.adminInfo.collegeName);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Loading Profile...</DialogTitle>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">User Profile</Typography>
          <Button onClick={onClose} startIcon={<Close />}>Close</Button>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic User Info */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile?.user?.email || ''}
                      disabled={!editing}
                      onChange={(e) => setTempProfile({...tempProfile, user: {...tempProfile?.user, email: e.target.value}})}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={editing ? tempProfile?.user?.profile.firstName || '' : profile?.user?.profile.firstName || ''}
                      disabled={!editing}
                      onChange={(e) => setTempProfile({...tempProfile, user: {...tempProfile?.user, profile: {...tempProfile?.user?.profile, firstName: e.target.value}}})}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={editing ? tempProfile?.user?.profile.lastName || '' : profile?.user?.profile.lastName || ''}
                      disabled={!editing}
                      onChange={(e) => setTempProfile({...tempProfile, user: {...tempProfile?.user, profile: {...tempProfile?.user?.profile, lastName: e.target.value}}})}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={editing ? tempProfile?.user?.profile.phone || '' : profile?.user?.profile.phone || ''}
                      disabled={!editing}
                      onChange={(e) => setTempProfile({...tempProfile, user: {...tempProfile?.user, profile: {...tempProfile?.user?.profile, phone: e.target.value}}})}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!editing}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={editing ? tempProfile?.user?.profile.department || '' : profile?.user?.profile.department || ''}
                        label="Department"
                        onChange={(e) => setTempProfile({...tempProfile, user: {...tempProfile?.user, profile: {...tempProfile?.user?.profile, department: e.target.value}}})}
                      >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="Computer Science">Computer Science</MenuItem>
                        <MenuItem value="Electrical">Electrical</MenuItem>
                        <MenuItem value="Mechanical">Mechanical</MenuItem>
                        <MenuItem value="Civil">Civil</MenuItem>
                        <MenuItem value="Chemical">Chemical</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {profile?.role === 'admin' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="College Name"
                        value={editing ? collegeName : profile?.adminInfo?.collegeName || ''}
                        disabled={!editing}
                        onChange={(e) => setCollegeName(e.target.value)}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Role-Specific Info */}
          {(profile?.role === 'student' || profile?.role === 'teacher' || profile?.role === 'tpo') && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {profile.role === 'student' ? 'Student' : profile.role === 'teacher' ? 'Teacher' : 'TPO'} Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {profile?.role === 'student' && profile?.studentInfo && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Father's Name"
                            value={profile.studentInfo.fathers_name || ''}
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Date of Birth"
                            value={profile.studentInfo.date_of_birth || ''}
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={profile.studentInfo.phone || ''}
                            disabled
                          />
                        </Grid>
                      </>
                    )}
                    
                    {(profile?.role === 'teacher' || profile?.role === 'tpo') && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={profile.role === 'teacher' ? profile.teacherInfo?.phone || '' : profile.tpoInfo?.phone || ''}
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            value={profile.role === 'teacher' ? profile.teacherInfo?.email || '' : profile.tpoInfo?.email || ''}
                            disabled
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* Academic Records for Students */}
          {profile?.role === 'student' && profile.studentInfo && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Academic Records</Typography>
              
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(semester => {
                      const record = profile.studentInfo?.academicInfo?.semesterRecords?.find(r => r.semester === semester);
                      return (
                        <Grid item xs={6} sm={3} key={semester}>
                          <Typography variant="body2" color="textSecondary">Semester {semester}</Typography>
                          <Typography variant="h6" color={record?.sgpa ? "primary" : "textSecondary"}>
                            {record?.sgpa ? record.sgpa.toFixed(2) : 'N/A'}
                          </Typography>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="textSecondary">Current CGPA</Typography>
                      <Typography variant="h6" color="primary">
                        {profile.studentInfo?.academicInfo?.cgpa ? profile.studentInfo.academicInfo.cgpa.toFixed(2) : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="textSecondary">Current Semester</Typography>
                      <Typography variant="h6" color="primary">
                        {profile.studentInfo?.academicInfo?.currentSemester || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        {!editing && (
          <Button onClick={handleEditProfile} variant="outlined" startIcon={<Edit />}>Edit Profile</Button>
        )}
        {editing && (
          <>
            <Button onClick={handleCancelEdit} color="secondary">Cancel</Button>
            <Button onClick={handleSaveProfile} variant="contained" color="primary">Save</Button>
          </>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Profile;