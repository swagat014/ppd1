import React, { useState, useEffect } from 'react';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Link as LinkIcon,
  Description,
  VideoLibrary,
  Book,
  OpenInNew,
  Search,
  FilterList,
  Close,
  CloudUpload,
} from '@mui/icons-material';
import axios from 'axios';
import { SkeletonDashboard } from '../../../components/common/SkeletonLoading';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link' | 'document' | 'code';
  subject: string;
  url?: string;
  fileSize?: number;
  tags: string[];
  createdAt: string;
  downloads?: number;
}

const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'document' | 'code';
    subject: string;
    url: string;
    tags: string;
  }>({
    title: '',
    description: '',
    type: 'pdf',
    subject: '',
    url: '',
    tags: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, filterType, resources, activeTab]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulated API call
      // const response = await axios.get('/teacher/resources');
      
      // Mock data
      setTimeout(() => {
        setResources([
          {
            _id: '1',
            title: 'DSA Complete Notes',
            description: 'Comprehensive notes covering all DSA topics',
            type: 'pdf',
            subject: 'Data Structures',
            fileSize: 15420,
            tags: ['dsa', 'notes', 'algorithms'],
            createdAt: new Date().toISOString(),
            downloads: 156,
          },
          {
            _id: '2',
            title: 'Operating Systems Video Lectures',
            description: 'Complete video series on OS concepts',
            type: 'video',
            subject: 'Operating Systems',
            url: 'https://example.com/os-videos',
            tags: ['os', 'videos', 'lectures'],
            createdAt: new Date().toISOString(),
            downloads: 89,
          },
          {
            _id: '3',
            title: 'Aptitude Practice Problems',
            description: 'Collection of aptitude problems with solutions',
            type: 'document',
            subject: 'Aptitude',
            fileSize: 8200,
            tags: ['aptitude', 'practice', 'problems'],
            createdAt: new Date().toISOString(),
            downloads: 234,
          },
          {
            _id: '4',
            title: 'LeetCode Problem Set',
            description: 'Curated list of important LeetCode problems',
            type: 'link',
            subject: 'Data Structures',
            url: 'https://leetcode.com',
            tags: ['leetcode', 'coding', 'practice'],
            createdAt: new Date().toISOString(),
            downloads: 312,
          },
          {
            _id: '5',
            title: 'Java Code Examples',
            description: 'Sample Java code for common algorithms',
            type: 'code',
            subject: 'Programming',
            fileSize: 4500,
            tags: ['java', 'code', 'examples'],
            createdAt: new Date().toISOString(),
            downloads: 178,
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.response?.data?.message || 'Failed to fetch resources');
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    // Filter by tab
    if (activeTab === 1) filtered = filtered.filter((r) => r.type === 'pdf');
    else if (activeTab === 2) filtered = filtered.filter((r) => r.type === 'video');
    else if (activeTab === 3) filtered = filtered.filter((r) => r.type === 'link');

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.subject.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((r) => r.type === filterType);
    }

    setFilteredResources(filtered);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <Description />;
      case 'video':
        return <VideoLibrary />;
      case 'link':
        return <LinkIcon />;
      case 'code':
        return <Book />;
      default:
        return <Description />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return '#f72585';
      case 'video':
        return '#6c63ff';
      case 'link':
        return '#00f593';
      case 'code':
        return '#ffd60a';
      default:
        return '#00d4ff';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        subject: resource.subject,
        url: resource.url || '',
        tags: resource.tags.join(', '),
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        type: 'pdf',
        subject: '',
        url: '',
        tags: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingResource(null);
  };

  const handleSubmit = async () => {
    try {
      const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
      
      if (editingResource) {
        setResources((prev) =>
          prev.map((r) =>
            r._id === editingResource._id
              ? { ...r, ...formData, tags: tagsArray }
              : r
          )
        );
      } else {
        const newResource: Resource = {
          _id: Date.now().toString(),
          ...formData,
          tags: tagsArray,
          createdAt: new Date().toISOString(),
          downloads: 0,
        };
        setResources((prev) => [newResource, ...prev]);
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      setResources((prev) => prev.filter((r) => r._id !== id));
    }
  };

  const stats = [
    {
      title: 'Total Resources',
      value: resources.length,
      icon: <Description />,
      color: '#6c63ff',
    },
    {
      title: 'PDFs',
      value: resources.filter((r) => r.type === 'pdf').length,
      icon: <Description />,
      color: '#f72585',
    },
    {
      title: 'Videos',
      value: resources.filter((r) => r.type === 'video').length,
      icon: <VideoLibrary />,
      color: '#00f593',
    },
    {
      title: 'Links',
      value: resources.filter((r) => r.type === 'link').length,
      icon: <LinkIcon />,
      color: '#00d4ff',
    },
  ];

  if (loading) {
    return (
      <TeacherLayout>
        <SkeletonDashboard type="teacher" />
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography
                variant="h3"
                fontWeight="900"
                sx={{
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #ff4da6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                  mb: 1,
                }}
              >
                Resources
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage educational resources, materials, and learning content
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #6c63ff 30%, #f72585 90%)',
              }}
            >
              Add Resource
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="glass-card">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        fontWeight="bold"
                        sx={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="900" mt={0.5} sx={{ color: '#fff' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        background: `linear-gradient(135deg, ${stat.color} 0%, rgba(0,0,0,0.5) 100%)`,
                        width: 50,
                        height: 50,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Card className="glass-card" sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ minWidth: 300 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="link">Link</MenuItem>
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="code">Code</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
              >
                Clear
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="All Resources" />
          <Tab label="PDFs" />
          <Tab label="Videos" />
          <Tab label="Links" />
        </Tabs>

        {/* Resources Grid */}
        <Grid container spacing={3}>
          {filteredResources.length === 0 ? (
            <Grid item xs={12}>
              <Box textAlign="center" py={8}>
                <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography color="text.secondary">No resources found</Typography>
              </Box>
            </Grid>
          ) : (
            filteredResources.map((resource) => (
              <Grid item xs={12} md={6} lg={4} key={resource._id}>
                <Card
                  className="glass-card"
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: `${getResourceColor(resource.type)}20`,
                          color: getResourceColor(resource.type),
                        }}
                      >
                        {getResourceIcon(resource.type)}
                      </Avatar>
                      <Box display="flex" gap={0.5}>
                        <IconButton size="small" onClick={() => handleOpenDialog(resource)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(resource._id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {resource.description}
                    </Typography>

                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      <Chip
                        label={resource.type.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: `${getResourceColor(resource.type)}20`,
                          color: getResourceColor(resource.type),
                          fontWeight: 'bold',
                        }}
                      />
                      <Chip label={resource.subject} size="small" variant="outlined" />
                    </Box>

                    <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
                      {resource.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {resource.fileSize && formatFileSize(resource.fileSize)}
                        {resource.downloads !== undefined && `${resource.downloads} downloads`}
                      </Typography>
                      {resource.url && (
                        <Button
                          size="small"
                          startIcon={<OpenInNew />}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
            <IconButton
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  label="Type"
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="link">Link</MenuItem>
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="code">Code</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                margin="normal"
                required
              />
              {formData.type === 'link' || formData.type === 'video' ? (
                <TextField
                  fullWidth
                  label="URL"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  margin="normal"
                  required
                />
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mt: 2, mb: 1 }}
                  startIcon={<CloudUpload />}
                >
                  Upload File
                  <input type="file" hidden />
                </Button>
              )}
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                margin="normal"
                placeholder="e.g., dsa, algorithms, notes"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.title || !formData.subject}
            >
              {editingResource ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </TeacherLayout>
  );
};

export default ResourcesPage;