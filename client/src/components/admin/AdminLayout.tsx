import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  People,
  Work,
  Assessment,
  BarChart,
  Settings,
  Group,
  School,
  LocalLibrary,
  Logout,
  Person,
  Notifications,
  CloudUpload,
} from '@mui/icons-material';

const drawerWidth = 280;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'User Management', icon: <People />, path: '/admin/users' },
  { text: 'Bulk Upload', icon: <CloudUpload />, path: '/admin/bulk-upload' },
  { text: 'Student Analytics', icon: <Assessment />, path: '/admin/analytics' },
  { text: 'Placement Statistics', icon: <BarChart />, path: '/admin/placement-stats' },
  { text: 'System Settings', icon: <Settings />, path: '/admin/settings' },
  { text: 'Department Management', icon: <School />, path: '/admin/departments' },
  { text: 'College Management', icon: <LocalLibrary />, path: '/admin/colleges' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(0, 204, 82, 0.05) 0%, transparent 40%)', pointerEvents: 'none' }} />
      <Toolbar sx={{ bgcolor: 'transparent', color: 'primary.main', pl: 2, pr: 2, minHeight: 64, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, background: 'rgba(0, 204, 82, 0.05)', border: '1px solid rgba(0, 204, 82, 0.1)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}>
            <Work sx={{ fontSize: 28, color: '#00cc52' }} />
            <Typography variant="h6" noWrap component="div" fontWeight="bold" color="primary.light">
              ADMIN PANEL
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(0, 204, 82, 0.2)', opacity: 0.3, position: 'relative', zIndex: 1 }} />
      <List sx={{ pt: 0, pb: 2, position: 'relative', zIndex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1, py: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  background: 'rgba(0, 204, 82, 0.03)',
                  border: '1px solid rgba(0, 204, 82, 0.05)',
                  minHeight: 44,
                  '&.Mui-selected': {
                    background: 'rgba(0, 204, 82, 0.15)',
                    color: 'white',
                    border: '1px solid rgba(0, 204, 82, 0.2)',
                    '&:hover': {
                      background: 'rgba(0, 204, 82, 0.2)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#00cc52',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(0, 204, 82, 0.1)',
                    border: '1px solid rgba(0, 204, 82, 0.15)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#00cc52' : 'primary.light', minWidth: 36, fontSize: 20 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: isActive ? 'white' : 'primary.light', fontWeight: isActive ? 'bold' : 'normal' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
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
            <Badge badgeContent={5} color="error">
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
          p: { xs: 1, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, sm: 6 },
          background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top left, rgba(0, 100, 0, 0.05) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;