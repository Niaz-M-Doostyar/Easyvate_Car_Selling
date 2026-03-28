'use client';
import { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Tooltip, CircularProgress,
  Tabs, Tab, Rating as MuiRating
} from '@mui/material';
import {
  Add, Edit, Delete, Language, Star
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

export default function TestimonialsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [activeLang, setActiveLang] = useState('en');
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    rating: 5,
    title: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTestimonials(activeLang);
  }, [activeLang]);

  const fetchTestimonials = async (lang) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/testimonial/${lang}`);
      setTestimonials(res.data.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch testimonials', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', year: '', rating: 5, title: '', message: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      year: item.year || '',
      rating: item.rating || 5,
      title: item.title || '',
      message: item.message || '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await apiClient.delete(`/testimonial/${activeLang}/${id}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      fetchTestimonials(activeLang);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validateRequired(formData.name)) newErrors.name = 'Name is required';
    if (!validateRequired(formData.year)) newErrors.year = 'Year is required';
    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }
    if (!validateRequired(formData.title)) newErrors.title = 'Title is required';
    if (!validateRequired(formData.message)) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        year: formData.year ? formData.year : null,
        rating: formData.rating ? parseInt(formData.rating) : null,
        title: formData.title,
        message: formData.message,
      };

      if (editingItem) {
        await apiClient.put(`/testimonial/${activeLang}/${editingItem.id}`, payload);
        enqueueSnackbar('Updated successfully', { variant: 'success' });
      } else {
        await apiClient.post(`/testimonial/${activeLang}`, payload);
        enqueueSnackbar('Added successfully', { variant: 'success' });
      }
      setDialogOpen(false);
      fetchTestimonials(activeLang);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { id: 'id', label: 'ID', width: 70 },
    { id: 'name', label: 'Name', bold: true },
    { id: 'year', label: 'Year', width: 100 },
    {
      id: 'rating',
      label: 'Rating',
      format: (val) => val ? <MuiRating value={val} readOnly size="small" /> : '-'
    },
    { id: 'title', label: 'Title' },
    { id: 'message', label: 'Message', format: (val) => val?.substring(0, 50) + (val?.length > 50 ? '...' : '') },
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
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Testimonials Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add Testimonial
        </Button>
      </Box>

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
          columns={columns}
          data={testimonials}
          loading={loading}
          emptyMessage="No testimonials yet."
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Star color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {editingItem ? 'Edit' : 'Add'} Testimonial ({LANGUAGES.find(l => l.code === activeLang)?.name})
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Month, Year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                error={!!errors.year}
                helperText={errors.year}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography component="legend">Rating</Typography>
              <MuiRating
                value={formData.rating}
                onChange={(e, newValue) => setFormData({ ...formData, rating: newValue })}
              />
              {errors.rating && <Typography color="error" variant="caption">{errors.rating}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message *"
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                error={!!errors.message}
                helperText={errors.message}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={editingItem ? <Edit /> : <Add />}
          >
            {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}