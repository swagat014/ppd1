import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { School, BusinessCenter, AdminPanelSettings, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-tabpanel-${index}`}
      aria-labelledby={`role-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'tpo' | 'admin' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Generate snow-like dots with different properties
  const snowDots = useMemo(() => 
    [...Array(150)].map((_, i) => ({
      size: 1 + Math.random() * 3, // 1-4px
      left: Math.random() * 100,
      top: -10 - Math.random() * 10, // Start above the viewport
      delay: Math.random() * 20,
      duration: 10 + Math.random() * 20,
      opacity: 0.4 + Math.random() * 0.5,
      sway: Math.random() * 100 - 50, // Horizontal movement
      speed: 0.5 + Math.random() * 1,
      blur: Math.random() > 0.7 ? 0.5 + Math.random() * 1 : 0,
    })), []
  );

  // Generate twinkling background stars
  const backgroundStars = useMemo(() => 
    [...Array(50)].map((_, i) => ({
      size: 0.5 + Math.random() * 1.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      speed: 3 + Math.random() * 7,
      opacity: 0.1 + Math.random() * 0.3,
    })), []
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      const rolePath: { [key: string]: string } = {
        student: '/student',
        tpo: '/tpo',
        admin: '/admin',
        teacher: '/teacher',
      };
      navigate(rolePath[user.role] || '/student');
    }
  }, [isAuthenticated, user, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const roles: ('student' | 'tpo' | 'admin' | 'teacher')[] = ['student', 'tpo', 'admin', 'teacher'];
    setRole(roles[newValue]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#000000',
      }}
    >
      {/* Background Stars Layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'transparent',
          pointerEvents: 'none',
        }}
      >
        {backgroundStars.map((star, i) => (
          <div
            key={`star-${i}`}
            className="background-star"
            style={{
              width: star.size,
              height: star.size,
              left: `${star.left}%`,
              top: `${star.top}%`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.speed}s`,
            }}
          />
        ))}
      </Box>

      {/* Snow-like Dots Layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {snowDots.map((dot, i) => (
          <div
            key={`snow-${i}`}
            className="snow-dot"
            style={{
              width: dot.size,
              height: dot.size,
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              opacity: dot.opacity,
              filter: dot.blur ? `blur(${dot.blur}px)` : 'none',
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
              animationTimingFunction: 'linear',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(0, 5, 2, 0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            boxShadow: `
              0 0 60px rgba(6, 78, 59, 0.15),
              0 0 120px rgba(6, 78, 59, 0.1),
              inset 0 0 40px rgba(0, 0, 0, 0.8)
            `,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.03) 50%, transparent 70%)',
              pointerEvents: 'none',
              borderRadius: 4,
            },
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(4, 20, 10, 0.6) 0%, rgba(6, 25, 15, 0.8) 100%)',
              color: '#6ee7b7',
              p: 4,
              textAlign: 'center',
              borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header glow */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="700"
              sx={{
                color: '#10b981',
                textShadow: '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)',
                position: 'relative',
                letterSpacing: '0.5px',
              }}
            >
              ZestPrep
            </Typography>
            <Typography variant="body2" sx={{ color: '#6ee7b7', opacity: 0.9, position: 'relative' }}>
              Login to continue your placement journey
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(16, 185, 129, 0.2)', bgcolor: 'rgba(0, 10, 5, 0.4)' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  color: '#a7f3d0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.1)',
                  },
                  '&.Mui-selected': { 
                    color: '#10b981',
                    textShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                  },
                },
                '& .MuiTabs-indicator': { 
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
                  height: 3,
                },
              }}
            >
              <Tab icon={<Person />} iconPosition="start" label="Student" />
              <Tab icon={<BusinessCenter />} iconPosition="start" label="TPO" />
              <Tab icon={<AdminPanelSettings />} iconPosition="start" label="Admin" />
              <Tab icon={<School />} iconPosition="start" label="Teacher" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={tabValue}>
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                sx={inputStyle}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                sx={inputStyle}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="large"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={role === 'student' ? 'Students: Use your date of birth as password (YYYY-MM-DD format)' : ''}
                FormHelperTextProps={{
                  sx: {
                    color: '#a7f3d0',
                    fontSize: '0.75rem',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(90deg, #064e3b, #047857, #059669)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    background: 'linear-gradient(90deg, #047857, #059669, #10b981)',
                    boxShadow: '0 0 30px rgba(16,185,129,0.5), 0 0 60px rgba(16,185,129,0.2)',
                    transform: 'translateY(-2px)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                )}
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 2, color: '#a7f3d0', opacity: 0.8 }}>
                Don't have an account? Contact your administrator
              </Typography>
            </form>
          </TabPanel>
        </Paper>
      </Container>

      {/* CSS Styles for Snow Effect */}
      <style>{`
        /* Background Stars */
        .background-star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: starTwinkle infinite ease-in-out;
          pointer-events: none;
        }

        @keyframes starTwinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* Snow Dots Animation */
        .snow-dot {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%, 
            rgba(255, 255, 255, 0.9) 0%, 
            rgba(255, 255, 255, 0.7) 40%, 
            rgba(255, 255, 255, 0.3) 70%, 
            transparent 100%
          );
          box-shadow: 
            0 0 4px rgba(255, 255, 255, 0.8),
            0 0 8px rgba(255, 255, 255, 0.4),
            0 0 12px rgba(255, 255, 255, 0.2);
          pointer-events: none;
          animation-name: snowFall;
          animation-iteration-count: infinite;
        }

        @keyframes snowFall {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            transform: translate(calc(var(--sway, 20px) * 0.2), 10vh) rotate(36deg) scale(1);
            opacity: var(--opacity, 0.7);
          }
          30% {
            transform: translate(calc(var(--sway, 20px) * 0.4), 30vh) rotate(72deg) scale(1.1);
            opacity: var(--opacity, 0.9);
          }
          50% {
            transform: translate(calc(var(--sway, 20px) * 0.6), 50vh) rotate(108deg) scale(1.2);
            opacity: var(--opacity, 1);
          }
          70% {
            transform: translate(calc(var(--sway, 20px) * 0.8), 70vh) rotate(144deg) scale(1.1);
            opacity: var(--opacity, 0.8);
          }
          90% {
            transform: translate(calc(var(--sway, 20px) * 1), 90vh) rotate(180deg) scale(1);
            opacity: var(--opacity, 0.5);
          }
          100% {
            transform: translate(calc(var(--sway, 20px) * 1.2), 110vh) rotate(216deg) scale(0.8);
            opacity: 0;
          }
        }

        /* Subtle floating effect for some dots */
        .snow-dot:nth-child(3n) {
          animation-timing-function: ease-in-out;
        }

        .snow-dot:nth-child(5n) {
          animation-name: snowFloat;
        }

        @keyframes snowFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(50px, 25vh) scale(1.2);
            opacity: 0.8;
          }
          50% {
            transform: translate(-30px, 50vh) scale(1);
            opacity: 1;
          }
          75% {
            transform: translate(40px, 75vh) scale(1.1);
            opacity: 0.6;
          }
        }

        /* Add slight glow to some dots */
        .snow-dot:nth-child(7n) {
          box-shadow: 
            0 0 6px rgba(255, 255, 255, 0.9),
            0 0 12px rgba(255, 255, 255, 0.6),
            0 0 18px rgba(255, 255, 255, 0.3);
        }

        /* Add subtle color variation to some dots */
        .snow-dot:nth-child(4n) {
          background: radial-gradient(
            circle at 30% 30%, 
            rgba(167, 243, 208, 0.8) 0%, 
            rgba(110, 231, 183, 0.6) 40%, 
            rgba(52, 211, 153, 0.3) 70%, 
            transparent 100%
          );
        }

        .snow-dot:nth-child(6n) {
          background: radial-gradient(
            circle at 30% 30%, 
            rgba(147, 197, 253, 0.8) 0%, 
            rgba(96, 165, 250, 0.6) 40%, 
            rgba(59, 130, 246, 0.3) 70%, 
            transparent 100%
          );
        }
      `}</style>
    </Box>
  );
};

// Enhanced input style with dark green theme
const inputStyle = {
  '& .MuiOutlinedInput-root': {
    color: '#d1fae5',
    background: 'rgba(6, 25, 15, 0.3)',
    transition: 'all 0.3s ease',
    '& fieldset': { 
      borderColor: 'rgba(16, 185, 129, 0.2)',
      borderWidth: 1,
    },
    '&:hover fieldset': { 
      borderColor: 'rgba(52, 211, 153, 0.4)',
      boxShadow: '0 0 8px rgba(52, 211, 153, 0.2)',
    },
    '&.Mui-focused fieldset': { 
      borderColor: '#10b981', 
      borderWidth: 2,
      boxShadow: '0 0 15px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.1)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#a7f3d0',
    '&.Mui-focused': { 
      color: '#34d399',
      textShadow: '0 0 5px rgba(52, 211, 153, 0.5)',
    },
  },
  '& .MuiInputBase-input': {
    '&::placeholder': {
      color: 'rgba(167, 243, 208, 0.5)',
    },
  },
};

export default Login;