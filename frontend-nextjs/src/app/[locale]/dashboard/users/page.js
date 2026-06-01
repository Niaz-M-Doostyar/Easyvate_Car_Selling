// src/app/[locale]/dashboard/users/page.js
'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add, Visibility, VisibilityOff, Person, Email, Lock, Phone, AdminPanelSettings, Security } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { validateEmail, validatePassword, validateRequired } from '@/utils/validation';

export default function UsersPage() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('Users');

  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Sales',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/auth/users');
      setUsers(response.data.data || []);
    } catch {
      enqueueSnackbar(t('fetchUsersError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Super Admin': 'error',
      'Owner': 'error',
      'Manager': 'warning',
      'Inventory & Sales': 'info',
      'Sales': 'info',
      'Accountant': 'success',
      'Financial': 'primary',
      'Viewer': 'default',
    };
    return colors[role] || 'default';
  };

  const getRolePermissions = (role) => {
    const permissions = {
      'Super Admin': ['All Access', 'User Management', 'System Settings'],
      'Owner': ['Dashboard', 'Reports', 'Financial', 'User Management'],
      'Manager': ['Dashboard', 'Reports', 'Sales Management', 'Employees'],
      'Inventory & Sales': ['Dashboard', 'Vehicles', 'Sales', 'Customers'],
      'Sales': ['Dashboard', 'Sales', 'Customers'],
      'Accountant': ['Ledger', 'Reports', 'Payments', 'Payroll'],
      'Financial': ['Financial Reports', 'Ledger', 'Payments', 'Currency'],
      'Viewer': ['Dashboard (Read Only)', 'Reports (Read Only)'],
    };
    return permissions[role] || [];
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!validateRequired(formData.fullName)) newErrors.fullName = t('validationFullNameRequired');
    if (!validateRequired(formData.email) || !validateEmail(formData.email)) {
      newErrors.email = t('validationEmailRequired');
    }
    if (!editingId && (!validateRequired(formData.password) || !validatePassword(formData.password))) {
      newErrors.password = t('validationPasswordRequired');
    }
    if (!validateRequired(formData.role)) newErrors.role = t('validationRoleRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      enqueueSnackbar(t('fixValidationErrors'), { variant: 'error' });
      return;
    }

    try {
      if (editingId) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await apiClient.put(`/auth/users/${editingId}`, updateData);
        enqueueSnackbar(t('userUpdated'), { variant: 'success' });
      } else {
        await apiClient.post('/auth/register', formData);
        enqueueSnackbar(t('userCreated'), { variant: 'success' });
      }
      setOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || t('saveError'), { variant: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await apiClient.delete(`/auth/users/${userId}`);
      enqueueSnackbar(t('userDeleted'), { variant: 'success' });
      fetchUsers();
    } catch (error) {
      enqueueSnackbar(t('deleteError'), { variant: 'error' });
    }
  };

  const handleEdit = (user) => {
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      phoneNumber: user.phoneNumber || '',
    });
    setEditingId(user.id);
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'Sales',
      phoneNumber: '',
    });
    setErrors({});
    setEditingId(null);
  };

  const handleDialogClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {t('pageTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('pageSubtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          {t('addUser')}
        </Button>
      </Box>

      <Card sx={{ mb: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <EnhancedDataTable
            columns={[
              { id: 'fullName', label: t('columnFullName'), bold: true },
              { id: 'email', label: t('columnEmail') },
              { id: 'phoneNumber', label: t('columnPhone') },
              { id: 'role', label: t('columnRole'), format: (val) => <Chip label={val} size="small" color={getRoleColor(val)} /> },
            ]}
            data={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            emptyMessage={t('noUsers')}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminPanelSettings color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingId ? t('editUser') : t('addNewUser')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('configureAccount')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.5, letterSpacing: '0.1em' }}>
            {t('accountInfo')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('fullNameLabel')}
                placeholder={t('fullNamePlaceholder')}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('phoneLabel')}
                placeholder={t('phonePlaceholder')}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('emailLabel')}
                type="email"
                placeholder={t('emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={editingId ? t('passwordEditLabel') : t('passwordLabel')}
                type={showPassword ? 'text' : 'password'}
                placeholder={editingId ? t('passwordEditPlaceholder') : t('passwordPlaceholder')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={!!errors.password}
                helperText={errors.password}
                required={!editingId}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1.5, letterSpacing: '0.1em' }}>
            {t('rolePermissions')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.role}>
                <InputLabel>{t('roleLabel')}</InputLabel>
                <Select
                  value={formData.role}
                  label={t('roleLabel')}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="Super Admin">🔴 {t('superAdmin')}</MenuItem>
                  <MenuItem value="Owner">🟠 {t('owner')}</MenuItem>
                  <MenuItem value="Manager">🟡 {t('manager')}</MenuItem>
                  <MenuItem value="Inventory & Sales">🟢 {t('inventorySales')}</MenuItem>
                  {/* <MenuItem value="Sales">🔵 {t('sales')}</MenuItem> */}
                  <MenuItem value="Accountant">🟣 {t('accountant')}</MenuItem>
                  {/* <MenuItem value="Financial">🟤 {t('financial')}</MenuItem> */}
                  <MenuItem value="Viewer">⚪ {t('viewer')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Security fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    {t('rolePermissionsLabel')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {getRolePermissions(formData.role).join(' • ')}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDialogClose}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? null : <Add />}>
            {editingId ? t('updateUser') : t('addUser')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}