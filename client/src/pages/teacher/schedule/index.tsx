import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { Container, Typography, Box } from '@mui/material';

const SchedulePage: React.FC = () => {
  return (
    <TeacherLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Schedule
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your class schedule, appointments, and important events.
          </Typography>
        </Box>
      </Container>
    </TeacherLayout>
  );
};

export default SchedulePage;