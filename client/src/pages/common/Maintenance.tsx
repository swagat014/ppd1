import React from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { Settings, Construction, Engineering } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Maintenance: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #0d1228 0%, #050914 100%)',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          className="glass-card"
          sx={{
            p: 6,
            borderRadius: 8,
            border: '1px solid rgba(108, 99, 255, 0.2)',
            boxShadow: '0 0 40px rgba(108, 99, 255, 0.1)',
          }}
        >
          <Box position="relative" display="inline-flex" mb={4}>
            <Engineering
              sx={{
                fontSize: 100,
                color: '#6c63ff',
                animation: 'pulse 2s infinite ease-in-out',
              }}
            />
            <Settings
              sx={{
                fontSize: 40,
                color: '#00d4ff',
                position: 'absolute',
                top: 0,
                right: -10,
                animation: 'spin 4s infinite linear',
              }}
            />
          </Box>
          
          <Typography variant="h3" fontWeight="900" gutterBottom sx={{
            background: 'linear-gradient(135deg, #f0f4ff 0%, #6c63ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Systems Under Maintenance
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            We're currently performing some scheduled upgrades to bring you a better experience. 
            We'll be back online shortly!
          </Typography>
          
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{
                borderRadius: 4,
                px: 4,
                py: 1.5,
                borderColor: 'rgba(108, 99, 255, 0.5)',
                '&:hover': {
                  borderColor: '#6c63ff',
                  background: 'rgba(108, 99, 255, 0.05)',
                }
              }}
            >
              Check Status
            </Button>
            
            <Button
              variant="contained"
              onClick={handleLogout}
              sx={{
                borderRadius: 4,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #ff5252 100%)',
                }
              }}
            >
              Logout
            </Button>
          </Box>

          {localStorage.getItem('role') === 'admin' && (
            <Box mt={3}>
              <Button
                variant="text"
                onClick={() => navigate('/admin')}
                sx={{
                  color: '#6c63ff',
                  fontWeight: 'bold',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Go to Admin Dashboard (Admin Access)
              </Button>
            </Box>
          )}
          
          <Typography variant="caption" display="block" sx={{ mt: 4, opacity: 0.5 }}>
            Thank you for your patience.
          </Typography>
        </Paper>
      </Container>
      
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default Maintenance;
