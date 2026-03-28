'use client';
import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, Paper, Divider, CircularProgress,
  ImageList, ImageListItem, ImageListItemBar, IconButton as MuiIconButton,
  Tab, Tabs, Alert
} from '@mui/material';
import {
  Add, Edit, Delete, Close, CloudUpload, Delete as DeleteIcon,
  Facebook, Instagram, Twitter, Person
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { validateRequired } from '@/utils/validation';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
  { code: 'fa', name: 'Dari', flag: '🇦🇫' },
];

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TeamPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [activeLang, setActiveLang] = useState('en');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    description: '',
    facebook: '',
    instagram: '',
    x: '',
    image: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  useEffect(() => {
    fetchMembers(activeLang);
  }, [activeLang]);

  const fetchMembers = async (lang) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/team/${lang}`);
      setMembers(res.data.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch team members', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      position: '',
      description: '',
      facebook: '',
      instagram: '',
      x: '',
      image: null,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setDialogOpen(true);
    setRemoveCurrentImage(false);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      position: member.position || '',
      description: member.description || '',
      facebook: member.facebook || '',
      instagram: member.instagram || '',
      x: member.x || '',
      image: member.image || null,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setDialogOpen(true);
    setRemoveCurrentImage(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    try {
      await apiClient.delete(`/team/${activeLang}/${id}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      fetchMembers(activeLang);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        enqueueSnackbar('File too large. Max 1MB.', { variant: 'warning' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        enqueueSnackbar('Only image files are allowed.', { variant: 'warning' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    if (!validateRequired(formData.name)) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }
    if (!validateRequired(formData.position)) {
      enqueueSnackbar('Position is required', { variant: 'warning' });
      return;
    }

    if (removeCurrentImage) {
        submitData.append('remove_image', 'true');
    }

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'image' && formData[key]) {
        submitData.append(key, formData[key]);
      }
    });
    if (selectedFile) {
      submitData.append('image', selectedFile);
    }

    setSubmitting(true);
    try {
      if (editingMember) {
        await apiClient.put(`/team/${activeLang}/${editingMember.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Updated successfully', { variant: 'success' });
      } else {
        await apiClient.post(`/team/${activeLang}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Added successfully', { variant: 'success' });
      }
      setDialogOpen(false);
      fetchMembers(activeLang);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    // Already has /api? return as is (for safety)
    if (path.startsWith('/api')) return path;
    return `/api${path}`;
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Team Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add Member
        </Button>
      </Box>

      {/* Language Tabs */}
      <Tabs value={activeLang} onChange={(e, val) => setActiveLang(val)} sx={{ mb: 3 }}>
        {LANGUAGES.map(lang => (
          <Tab key={lang.code} value={lang.code} label={`${lang.flag} ${lang.name}`} />
        ))}
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <EnhancedDataTable
          columns={[
            { id: 'name', label: 'Name', bold: true },
            { id: 'position', label: 'Position' },
            {
              id: 'image',
              label: 'Photo',
              format: (val) => val ? <Chip size="small" icon={<Person />} label="Has photo" /> : '-'
            },
            {
              id: 'social',
              label: 'Social',
              format: (_, row) => (
                <Box display="flex" gap={0.5}>
                  {row.facebook && <Facebook fontSize="small" color="primary" />}
                  {row.instagram && <Instagram fontSize="small" color="secondary" />}
                  {row.x && <Twitter fontSize="small" />}
                </Box>
              )
            },
            {
              id: '_actions',
              label: '',
              align: 'center',
              format: (_, row) => (
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEdit(row)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(row.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            },
          ]}
          data={members}
          loading={loading}
          emptyMessage="No team members yet."
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Person color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {editingMember ? 'Edit Team Member' : 'Add Team Member'} ({LANGUAGES.find(l => l.code === activeLang)?.name})
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position *"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Social Media Links
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Facebook URL"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                InputProps={{ startAdornment: <Facebook fontSize="small" sx={{ mr: 1, color: '#1877f2' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Instagram URL"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                InputProps={{ startAdornment: <Instagram fontSize="small" sx={{ mr: 1, color: '#e4405f' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="X (Twitter) URL"
                value={formData.x}
                onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                InputProps={{ startAdornment: <Twitter fontSize="small" sx={{ mr: 1 }} /> }}
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Profile Image (Optional, Max 1MB)
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => document.getElementById('team-image-upload').click()}
              >
                <input
                  id="team-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2">Click to upload a new image</Typography>
              </Box>

              {/* Existing image preview */}
              {/* Existing image preview (only if not marked for removal) */}
                {formData.image && !selectedFile && !removeCurrentImage && (
                <Box mt={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Current Image:</Typography>
                    <IconButton size="small" onClick={() => setRemoveCurrentImage(true)} color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                    </Box>
                    <ImageList cols={1} gap={8} sx={{ width: 150 }}>
                    <ImageListItem>
                        <img
                        src={getImageUrl(formData.image)}
                        alt="Team member"
                        style={{ width: '100%', height: 'auto', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }}
                        />
                    </ImageListItem>
                    </ImageList>
                </Box>
                )}

              {/* Selected file preview */}
              {selectedFile && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">New Image:</Typography>
                  <ImageList cols={1} gap={8} sx={{ width: 150, position: 'relative' }}>
                    <ImageListItem>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ width: '100%', height: 'auto', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <ImageListItemBar
                        position="bottom"
                        actionIcon={
                          <MuiIconButton size="small" onClick={removeSelectedFile} sx={{ color: 'white' }}>
                            <DeleteIcon fontSize="small" />
                          </MuiIconButton>
                        }
                      />
                    </ImageListItem>
                  </ImageList>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={editingMember ? <Edit /> : <Add />}
          >
            {submitting ? 'Saving...' : (editingMember ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}