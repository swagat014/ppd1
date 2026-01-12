import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Chip,
} from '@mui/material';
import { LocalLibrary, School } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const CollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState([
    {
      name: 'Government College of Engineering Kalahandi Bhawanipatna',
      code: 'GCEKB',
      established: 1962,
      type: 'Government',
      status: 'Active'
    }
  ]);
  
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.light">
            <LocalLibrary sx={{ mr: 1, verticalAlign: 'middle', color: '#00ff64' }} />
            College Management
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={3}>
            Manage colleges, their information, and institutional settings.
          </Typography>
          
          <Paper elevation={4} sx={{ p: 3, background: '#0a0a0a', border: '1px solid rgba(0, 204, 82, 0.2)', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.light" mb={2}>
              Available Colleges
            </Typography>
            <List>
              {colleges.map((college, index) => (
                <ListItem key={index} sx={{ mb: 1, borderRadius: 2, background: 'rgba(0, 204, 82, 0.05)', border: '1px solid rgba(0, 204, 82, 0.1)', '&:hover': { background: 'rgba(0, 204, 82, 0.15)' } }}>
                  <ListItemIcon>
                    <School sx={{ color: '#00ff64' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={college.name}
                    secondary={`Established: ${college.established} | Type: ${college.type}`}
                    primaryTypographyProps={{ color: 'primary.light', fontWeight: 'medium' }}
                    secondaryTypographyProps={{ color: 'textSecondary' }}
                  />
                  <Chip 
                    label={college.status} 
                    color="success" 
                    size="small" 
                    sx={{ background: 'linear-gradient(135deg, #00cc52, #00ff64)', color: 'black', fontWeight: 'bold' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default CollegesPage;