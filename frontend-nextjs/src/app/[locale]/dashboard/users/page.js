'use client';
import { useState, useEffect } from 'react';
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
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
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

    if (!validateRequired(formData.fullName)) newErrors.fullName = 'Full name is required';
    if (!validateRequired(formData.email) || !validateEmail(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!editingId && (!validateRequired(formData.password) || !validatePassword(formData.password))) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!validateRequired(formData.role)) newErrors.role = 'Role is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      enqueueSnackbar('Please fix validation errors', { variant: 'error' });
      return;
    }

    try {
      if (editingId) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await apiClient.put(`/auth/users/${editingId}`, updateData);
        enqueueSnackbar('User updated successfully', { variant: 'success' });
      } else {
        await apiClient.post('/auth/register', formData);
        enqueueSnackbar('User created successfully', { variant: 'success' });
      }
      setOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to save user', { variant: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiClient.delete(`/auth/users/${userId}`);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      fetchUsers();
    } catch (error) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
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
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage system users and their roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add User
        </Button>
      </Box>

      <Card sx={{ mb: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <EnhancedDataTable
            columns={[
              { id: 'fullName', label: 'Full Name', bold: true },
              { id: 'email', label: 'Email' },
              { id: 'phoneNumber', label: 'Phone Number' },
              { id: 'role', label: 'Role', format: (val) => <Chip label={val} size="small" color={getRoleColor(val)} /> },
            ]}
            data={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminPanelSettings color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit User' : 'Add New User'}</Typography>
              <Typography variant="caption" color="text.secondary">Configure user account and permissions</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.5, letterSpacing: '0.1em' }}>
            👤 Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Ahmad Khan"
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
                label="Phone Number"
                placeholder="+93 70 123 4567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                placeholder="user@easyvate.com"
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
                label={editingId ? 'Password (leave empty to keep current)' : 'Password'}
                type={showPassword ? 'text' : 'password'}
                placeholder={editingId ? '••••••••' : 'Min 8 characters'}
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
            🛡️ Role & Permissions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="Super Admin">🔴 Super Admin</MenuItem>
                  <MenuItem value="Owner">🟠 Owner</MenuItem>
                  <MenuItem value="Manager">🟡 Manager</MenuItem>
                  <MenuItem value="Inventory & Sales">🟢 Inventory & Sales</MenuItem>
                  <MenuItem value="Sales">🔵 Sales</MenuItem>
                  <MenuItem value="Accountant">🟣 Accountant</MenuItem>
                  <MenuItem value="Financial">🟤 Financial</MenuItem>
                  <MenuItem value="Viewer">⚪ Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Security fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={600}>Role Permissions:</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {getRolePermissions(formData.role).join(' • ')}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? null : <Add />}>
            {editingId ? 'Update User' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
