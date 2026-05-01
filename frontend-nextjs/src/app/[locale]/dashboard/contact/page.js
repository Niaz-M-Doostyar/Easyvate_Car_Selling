'use client';
import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, Divider, CircularProgress,
  Tabs, Tab
} from '@mui/material';
import {
  Add, Edit, Delete, Language, Email, Phone, Facebook,
  Instagram, Twitter, YouTube, AccessTime, LocationOn, Business
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { validateRequired, validateEmail } from '@/utils/validation';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
  { code: 'fa', name: 'Dari', flag: '🇦🇫' },
];

export default function ContactPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [activeLang, setActiveLang] = useState('en');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    facebook: '',
    instagram: '',
    x: '',
    youtube: '',
    weekdays: '',
    friday: '',
    branchName: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchContacts(activeLang);
  }, [activeLang]);

  const fetchContacts = async (lang) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/contact/${lang}`);
      setContacts(res.data.data || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch contact entries', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingContact(null);
    setFormData({
      email: '',
      phone: '',
      facebook: '',
      instagram: '',
      x: '',
      youtube: '',
      weekdays: '',
      friday: '',
      branchName: '',
      address: '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      email: contact.email || '',
      phone: contact.phone || '',
      facebook: contact.facebook || '',
      instagram: contact.instagram || '',
      x: contact.x || '',
      youtube: contact.youtube || '',
      weekdays: contact.weekdays || '',
      friday: contact.friday || '',
      branchName: contact.branchName || '',
      address: contact.address || '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact entry?')) return;
    try {
      await apiClient.delete(`/contact/${activeLang}/${id}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      fetchContacts(activeLang);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    // Convert empty strings to null to avoid validation errors
    const submitData = { ...formData };
    Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') submitData[key] = null;
    });

    setSubmitting(true);
    try {
        if (editingContact) {
        await apiClient.put(`/contact/${activeLang}/${editingContact.id}`, submitData);
        enqueueSnackbar('Updated successfully', { variant: 'success' });
        } else {
        await apiClient.post(`/contact/${activeLang}`, submitData);
        enqueueSnackbar('Added successfully', { variant: 'success' });
        }
        setDialogOpen(false);
        fetchContacts(activeLang);
    } catch (error) {
        enqueueSnackbar(error.response?.data?.message || 'Save failed', { variant: 'error' });
    } finally {
        setSubmitting(false);
    }
    };

    const columns = [
        { id: 'branchName', label: 'Branch Name', bold: true },
        { id: 'email', label: 'Email' },
        { id: 'phone', label: 'Phone' },
        {
        id: 'social',
        label: 'Social',
        format: (_, row) => (
            <Box display="flex" gap={0.5}>
            {row.facebook && <Facebook fontSize="small" color="primary" />}
            {row.instagram && <Instagram fontSize="small" color="secondary" />}
            {row.x && <Twitter fontSize="small" />}
            {row.youtube && <YouTube fontSize="small" color="error" />}
            </Box>
        )
        },
        { id: 'weekdays', label: 'Weekdays' },
        { id: 'friday', label: 'Friday' },
        { id: 'address', label: 'Address', format: (val) => val?.substring(0, 30) + (val?.length > 30 ? '...' : '') },
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
        <Typography variant="h4" fontWeight={700}>Contact Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add Branch
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
          data={contacts}
          loading={loading}
          emptyMessage="No contact entries yet."
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Language color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {editingContact ? 'Edit' : 'Add'} Branch ({LANGUAGES.find(l => l.code === activeLang)?.name})
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Branch Name"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                InputProps={{ startAdornment: <Business fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{ startAdornment: <Email fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                inputProps={{ maxLength: 10 }}
                InputProps={{ startAdornment: <Phone fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
               />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Facebook URL"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                InputProps={{ startAdornment: <Facebook fontSize="small" sx={{ mr: 1, color: '#1877f2' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instagram URL"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                InputProps={{ startAdornment: <Instagram fontSize="small" sx={{ mr: 1, color: '#e4405f' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="X (Twitter) URL"
                value={formData.x}
                onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                InputProps={{ startAdornment: <Twitter fontSize="small" sx={{ mr: 1 }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="YouTube URL"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                InputProps={{ startAdornment: <YouTube fontSize="small" sx={{ mr: 1, color: '#ff0000' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weekdays Hours"
                value={formData.weekdays}
                onChange={(e) => setFormData({ ...formData, weekdays: e.target.value })}
                placeholder="e.g. Mon-Fri 9am-6pm"
                InputProps={{ startAdornment: <AccessTime fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Friday Hours"
                value={formData.friday}
                onChange={(e) => setFormData({ ...formData, friday: e.target.value })}
                placeholder="e.g. Fri 2pm-6pm"
                InputProps={{ startAdornment: <AccessTime fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                InputProps={{ startAdornment: <LocationOn fontSize="small" sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} /> }}
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
            startIcon={editingContact ? <Edit /> : <Add />}
          >
            {submitting ? 'Saving...' : (editingContact ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}