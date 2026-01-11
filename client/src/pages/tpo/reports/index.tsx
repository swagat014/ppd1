import React from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import { Container, Typography, Box } from '@mui/material';

const ReportsPage: React.FC = () => {
  return (
    <TpoLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Reports
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Generate and view various placement reports, including department-wise analysis and placement statistics.
          </Typography>
        </Box>
      </Container>
    </TpoLayout>
  );
};

export default ReportsPage;