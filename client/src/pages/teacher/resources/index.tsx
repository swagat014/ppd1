import React from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { Container, Typography, Box } from '@mui/material';

const ResourcesPage: React.FC = () => {
  return (
    <TeacherLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Resources
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage educational resources, materials, and learning content for your students.
          </Typography>
        </Box>
      </Container>
    </TeacherLayout>
  );
};

export default ResourcesPage;