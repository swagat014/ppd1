import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import Profile from '../../components/common/Profile';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Description,
  Code,
  Quiz,
  RecordVoiceOver,
  Translate,
  Analytics,
  Book,
  Assessment,
  Logout,
  Person,
  Notifications,
} from '@mui/icons-material';

const drawerWidth = 280;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/student' },
  { text: 'Resume Analysis', icon: <Description />, path: '/student/resume' },
  { text: 'DSA Practice', icon: <Code />, path: '/student/dsa' },
  { text: 'Aptitude Practice', icon: <Quiz />, path: '/student/aptitude' },
  { text: 'Mock Interviews', icon: <RecordVoiceOver />, path: '/student/interviews' },
  { text: 'English Analysis', icon: <Translate />, path: '/student/english' },
  { text: 'Readiness Analyzer', icon: <Assessment />, path: '/student/readiness' },
  { text: 'Core Subjects', icon: <Book />, path: '/student/core-subjects' },
  { text: 'Analytics', icon: <Analytics />, path: '/student/analytics' },
];

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const primaryColor = settings?.appearance?.primaryColor || '#00d4ff';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    setAnchorEl(null);
    setProfileOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        minHeight: 80, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {settings?.logoUrl ? (
            <Box
              component="img"
              src={settings.logoUrl}
              alt={`${settings.siteName || 'Student Zone'} logo`}
              sx={{ height: 40, width: 'auto', objectFit: 'contain', borderRadius: 1, boxShadow: `0 0 16px ${primaryColor}33` }}
            />
          ) : (
            <Dashboard sx={{ fontSize: 28, color: primaryColor }} />
          )}
          <Typography variant="h6" noWrap component="div" fontWeight="800" sx={{
            background: `linear-gradient(135deg, #f0f4ff 0%, ${primaryColor} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px'
          }}>
            {settings?.siteName || 'STUDENT ZONE'}
          </Typography>
        </Box>
      </Toolbar>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    ...(isActive ? {
                      background: 'rgba(139, 92, 246, 0.12)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.1)',
                    } : {
                      background: 'transparent',
                      border: '1px solid transparent',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }
                    })
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? '#8b5cf6' : '#94a3b8', 
                    minWidth: 40,
                    transition: 'color 0.3s ease'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#f8fafc' : '#94a3b8',
                      sx: { transition: 'color 0.3s ease' }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome, {user?.profile.firstName}!
          </Typography>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.profile.firstName?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleOpenProfile}>
              <Person sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
          <Profile open={profileOpen} onClose={() => setProfileOpen(false)} />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, sm: 8 },
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Background Orbs for Premium Look */}
        <div className="bg-orb bg-orb-purple" />
        <div className="bg-orb bg-orb-pink" />
        <div className="bg-orb bg-orb-cyan" />

        <div className="fade-in-up">
          {children}
        </div>
      </Box>
    </Box>
  );
};

export default StudentLayout;
