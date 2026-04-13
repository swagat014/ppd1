import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save, Settings, Shield, Info, ContactPhone } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    maintenanceMode: false,
    allowRegistration: true,
    logoUrl: '',
    appearance: {
      primaryColor: '#00ff64',
      darkMode: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAppearanceChange = (name: string, value: string | boolean) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/admin/settings', settings);
      toast.success('System settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress color="primary" />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.light">
            System Configuration
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom mb={4}>
            Manage global settings, security preferences, and administrative details.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* General Settings */}
              <Grid item xs={12}>
                <Paper className="glass-card" sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Info color="primary" />
                    <Typography variant="h6" fontWeight="bold">General Information</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Site Name"
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Site Logo URL"
                        name="logoUrl"
                        value={settings.logoUrl}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="https://example.com/logo.png"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Paper className="glass-card" sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <ContactPhone color="primary" />
                    <Typography variant="h6" fontWeight="bold">Contact Details</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Admin Email"
                        name="contactEmail"
                        value={settings.contactEmail}
                        onChange={handleChange}
                        variant="outlined"
                        type="email"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Support Phone"
                        name="contactPhone"
                        value={settings.contactPhone}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Office Address"
                        name="address"
                        value={settings.address}
                        onChange={handleChange}
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Appearance */}
              <Grid item xs={12}>
                <Paper className="glass-card" sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Settings color="primary" />
                    <Typography variant="h6" fontWeight="bold">Appearance</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Primary Theme Color"
                        name="primaryColor"
                        type="color"
                        value={settings.appearance?.primaryColor || '#00ff64'}
                        onChange={(e) => handleAppearanceChange('primaryColor', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.appearance?.darkMode || false}
                            onChange={(e) => handleAppearanceChange('darkMode', e.target.checked)}
                            name="darkMode"
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">Dark Mode</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Use the preferred dark theme for the application shell.
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Security & System */}
              <Grid item xs={12}>
                <Paper className="glass-card" sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Shield color="primary" />
                    <Typography variant="h6" fontWeight="bold">System Controls</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.maintenanceMode}
                            onChange={handleChange}
                            name="maintenanceMode"
                            color="error"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">Maintenance Mode</Typography>
                            <Typography variant="caption" color="textSecondary">
                              When active, only admins can access the application.
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1, opacity: 0.1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.allowRegistration}
                            onChange={handleChange}
                            name="allowRegistration"
                            color="success"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">Public Registration</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Allow new users to create accounts independently.
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mb={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    disabled={saving}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #00cc52, #00ff64)',
                      color: 'black',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #00ff64, #00cc52)',
                      },
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default SettingsPage;