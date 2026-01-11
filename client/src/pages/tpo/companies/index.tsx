import React from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import { Container, Typography, Box } from '@mui/material';

const CompaniesPage: React.FC = () => {
  return (
    <TpoLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Company Insights
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Access detailed insights about companies visiting campus, their requirements, and hiring trends.
          </Typography>
        </Box>
      </Container>
    </TpoLayout>
  );
};

export default CompaniesPage;