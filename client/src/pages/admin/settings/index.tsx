import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Container, Typography, Box } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure system-wide settings, preferences, and administrative configurations.
          </Typography>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default SettingsPage;