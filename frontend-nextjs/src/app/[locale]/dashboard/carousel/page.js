'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, InputAdornment,
  IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, ImageListItem, ImageListItemBar, Chip,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, Close, CloudUpload, Delete as DeleteIcon,
  AttachMoney, Tag, DirectionsCar
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient, { getUploadUrl } from '@/utils/api'; // adjust path to your api utility

export default function CarouselPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    model: '',
    price: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/carousel');
      setItems(res.data.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch carousel items', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', model: '', price: '' });
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
    setEditingId(null);
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title: item.title,
        model: item.model,
        price: item.price
      });
      if (item.image) setImagePreview(item.image); // existing image preview
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size and type (limit 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be less than 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageError('File must be an image');
      return;
    }

    setImageError('');
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title.trim() || !formData.model.trim() || !formData.price) {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('model', formData.model);
    submitData.append('price', formData.price);
    if (selectedImage) submitData.append('image', selectedImage);

    try {
      // Let the browser set the Content-Type (including boundary) for FormData
      if (editingId) {
        await apiClient.put(`/carousel/${editingId}`, submitData);
        enqueueSnackbar('Carousel item updated', { variant: 'success' });
      } else {
        await apiClient.post('/carousel', submitData);
        enqueueSnackbar('Carousel item added', { variant: 'success' });
      }
      handleClose();
      fetchItems();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiClient.delete(`/carousel/${id}`);
      enqueueSnackbar('Item deleted', { variant: 'success' });
      fetchItems();
    } catch (error) {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };
  
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return getUploadUrl(path.startsWith('/uploads') ? path : `/uploads${path}`);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Carousel Manager</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage slides shown on the homepage carousel
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Slide
        </Button>
      </Box>

      {/* Items Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Model</strong></TableCell>
              <TableCell align="right"><strong>Price</strong></TableCell>
              <TableCell><strong>Image</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No carousel items found</TableCell></TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.model}</TableCell>
                  <TableCell align="right">؋{parseFloat(item.price).toLocaleString()}</TableCell>
                  <TableCell>
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <Typography variant="caption">No image</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpen(item)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
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
            <DirectionsCar color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {editingId ? 'Edit Slide' : 'New Carousel Slide'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Tag fontSize="small" /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Model (e.g. Toyota Corolla)"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DirectionsCar fontSize="small" /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small" /></InputAdornment>
                }}
              />
            </Grid>

            {/* Image upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Slide Image (max 500KB)</Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: imageError ? 'error.main' : 'divider',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => document.getElementById('carousel-image').click()}
              >
                <input
                  id="carousel-image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2">Click to upload image</Typography>
                {imageError && (
                  <Typography variant="caption" color="error">{imageError}</Typography>
                )}
              </Box>

              {/* Image preview */}
              {imagePreview && (
                <Box sx={{ mt: 2, position: 'relative', width: 'fit-content' }}>
                    <img
                      src={
                        // If preview is a blob URL (newly selected file), use it directly.
                        typeof imagePreview === 'string' && imagePreview.startsWith('blob:')
                          ? imagePreview
                          : (typeof imagePreview === 'string' ? getImageUrl(imagePreview) : imagePreview)
                      }
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }}
                    />
                    <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper' }}
                    onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
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
            {editingId ? 'Update' : 'Add'} Slide
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}