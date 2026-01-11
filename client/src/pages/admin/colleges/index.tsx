import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Container, Typography, Box } from '@mui/material';

const CollegesPage: React.FC = () => {
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            College Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage colleges, their information, and institutional settings.
          </Typography>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default CollegesPage;