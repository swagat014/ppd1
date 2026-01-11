import React from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Container, Typography, Box } from '@mui/material';

const AnalyticsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Student Analytics
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View comprehensive analytics on student performance, engagement, and progress across all institutions.
          </Typography>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default AnalyticsPage;