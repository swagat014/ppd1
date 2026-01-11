import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Container, Typography, Box } from '@mui/material';

const PlacementStatsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Placement Statistics
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View detailed placement statistics across departments, colleges, and time periods.
          </Typography>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default PlacementStatsPage;