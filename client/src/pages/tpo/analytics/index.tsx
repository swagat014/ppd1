import React from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import { Container, Typography, Box } from '@mui/material';

const AnalyticsPage: React.FC = () => {
  return (
    <TpoLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Placement Analytics
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View detailed analytics on placement trends, company statistics, and student performance metrics.
          </Typography>
        </Box>
      </Container>
    </TpoLayout>
  );
};

export default AnalyticsPage;