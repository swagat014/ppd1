import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { Container, Typography, Box } from '@mui/material';

const AnalyticsPage: React.FC = () => {
  return (
    <TeacherLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View detailed analytics on student performance, assignment completion, and class engagement.
          </Typography>
        </Box>
      </Container>
    </TeacherLayout>
  );
};

export default AnalyticsPage;