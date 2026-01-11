import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { Container, Typography, Box } from '@mui/material';

const StudentsPage: React.FC = () => {
  return (
    <TeacherLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Student Progress
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Monitor and track your students' progress, assignments, and performance.
          </Typography>
        </Box>
      </Container>
    </TeacherLayout>
  );
};

export default StudentsPage;