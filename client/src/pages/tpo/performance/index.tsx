import React from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import { Container, Typography, Box } from '@mui/material';

const PerformancePage: React.FC = () => {
  return (
    <TpoLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Performance Tracking
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track overall placement performance, student progress, and department-wise statistics.
          </Typography>
        </Box>
      </Container>
    </TpoLayout>
  );
};

export default PerformancePage;