'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Card, CardContent, Typography, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Grid, InputAdornment
} from '@mui/material';
import {
  Add, Edit, Delete, Close, CloudUpload, Delete as DeleteIcon,
  Sort, VideoLibrary
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';

export default function ChooseVideoPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ order: 0 });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoError, setVideoError] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/choose-video');
      setVideos(res.data.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch videos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ order: 0 });
    setSelectedVideo(null);
    setVideoPreview(null);
    setVideoError('');
    setEditingId(null);
  };

  const handleOpen = (video = null) => {
    if (video) {
      setEditingId(video.id);
      setFormData({ order: video.order || 0 });
      setVideoPreview(video.videoPath); // existing video path
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size and type
    if (file.size > 10 * 1024 * 1024) {
      setVideoError('Video must be less than 10MB');
      return;
    }
    if (!file.type.startsWith('video/')) {
      setVideoError('File must be a video');
      return;
    }

    setVideoError('');
    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedVideo && !editingId) {
      enqueueSnackbar('Please select a video file', { variant: 'warning' });
      return;
    }

    const submitData = new FormData();
    submitData.append('order', formData.order);
    if (selectedVideo) submitData.append('video', selectedVideo);

    try {
      if (editingId) {
        await apiClient.put(`/choose-video/${editingId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Video updated', { variant: 'success' });
      } else {
        await apiClient.post('/choose-video', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Video added', { variant: 'success' });
      }
      handleClose();
      fetchVideos();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await apiClient.delete(`/choose-video/${id}`);
      enqueueSnackbar('Video deleted', { variant: 'success' });
      fetchVideos();
    } catch (error) {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };

  // Helper to get full video URL (same origin)
  const getVideoUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;        // absolute URL
  if (path.startsWith('blob:')) return path;       // local blob preview
  // If the path already includes the correct prefix, return as is
  if (path.startsWith('/admin/api/uploads/')) return path;
  // Otherwise, prepend the API static files base
  return `/admin/api${path.startsWith('/') ? path : `/${path}`}`;
};

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Choose Video Manager</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage videos displayed in the "Choose" section
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Video
        </Button>
      </Box>

      {/* Videos Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Preview</strong></TableCell>
              <TableCell align="center"><strong>Order</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} align="center">Loading...</TableCell></TableRow>
            ) : videos.length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center">No videos found</TableCell></TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    {video.videoPath ? (
                      <video
                        src={editingId && typeof videoPreview === 'string' && !videoPreview.startsWith('blob:')
                          ? getVideoUrl(videoPreview)
                          : videoPreview}
                        controls
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <Typography variant="caption">No video</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">{video.order}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpen(video)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(video.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <VideoLibrary color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {editingId ? 'Edit Video' : 'Add New Video'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                helperText="Lower numbers appear first"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Sort fontSize="small" /></InputAdornment>
                }}
              />
            </Grid>

            {/* Video upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Video File (max 10MB, MP4/MOV/WebM etc.)</Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: videoError ? 'error.main' : 'divider',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => document.getElementById('video-upload').click()}
              >
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handleVideoSelect}
                />
                <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2">Click to upload video</Typography>
                {videoError && (
                  <Typography variant="caption" color="error">{videoError}</Typography>
                )}
              </Box>

              {/* Video preview */}
              {videoPreview && (
                <Box sx={{ mt: 2, position: 'relative', width: 'fit-content' }}>
                  <video
                    src={editingId && typeof videoPreview === 'string' && !videoPreview.startsWith('blob:')
                      ? getVideoUrl(videoPreview)
                      : videoPreview}
                    controls
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper' }}
                    onClick={() => {
                      setSelectedVideo(null);
                      setVideoPreview(null);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? 'Update' : 'Add'} Video
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}