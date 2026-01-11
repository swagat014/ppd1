import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { Container, Typography, Box } from '@mui/material';

const AssignmentsPage: React.FC = () => {
  return (
    <TeacherLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Assignments
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create, assign, and manage assignments for your students.
          </Typography>
        </Box>
      </Container>
    </TeacherLayout>
  );
};

export default AssignmentsPage;