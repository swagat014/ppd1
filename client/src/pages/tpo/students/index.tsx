import React from 'react';
import TpoLayout from '../../../components/tpo/TpoLayout';
import { Container, Typography, Box } from '@mui/material';

const StudentsPage: React.FC = () => {
  return (
    <TpoLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Student Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and monitor student profiles, academic records, and placement readiness.
          </Typography>
        </Box>
      </Container>
    </TpoLayout>
  );
};

export default StudentsPage;