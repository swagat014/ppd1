import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Container, Typography, Box } from '@mui/material';

const DepartmentsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Department Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage academic departments, their configurations, and associated data.
          </Typography>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default DepartmentsPage;