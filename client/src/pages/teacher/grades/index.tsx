import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { Container, Typography, Box } from '@mui/material';

const GradesPage: React.FC = () => {
  return (
    <TeacherLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Grades
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and update grades for your students' assignments and exams.
          </Typography>
        </Box>
      </Container>
    </TeacherLayout>
  );
};

export default GradesPage;