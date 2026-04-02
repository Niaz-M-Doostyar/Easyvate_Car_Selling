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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { Add, Search, Person, Phone, Email, Work, AttachMoney, CalendarToday, Badge, LocationOn } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import { validateEmail, validatePhone, validateRequired, validatePrice } from '@/utils/validation';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

export default function EmployeesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    role: '',
    monthlySalary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    tazkiraNumber: '',
    address: '',
    biometricId: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/employees');
      setEmployees(response.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch employees', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    const newErrors = {};

    if (!validateRequired(formData.fullName)) {
      newErrors.fullName = 'Full name is required';
    }

    if (!validateRequired(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone format';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!validateRequired(formData.role)) {
      newErrors.role = 'Role/Position is required';
    }

    if (!validateRequired(formData.monthlySalary)) {
      newErrors.monthlySalary = 'Salary is required';
    } else if (!validatePrice(formData.monthlySalary)) {
      newErrors.monthlySalary = 'Salary must be a positive number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      enqueueSnackbar('Please fix validation errors', { variant: 'error' });
      return;
    }

    try {
      const employeeData = {
        ...formData,
        monthlySalary: parseFloat(formData.monthlySalary),
      };

      if (editingId) {
        // Update existing employee
        await apiClient.put(`/employees/${editingId}`, employeeData);
        enqueueSnackbar('Employee updated successfully', { variant: 'success' });
      } else {
        // Create new employee
        await apiClient.post('/employees', employeeData);
        enqueueSnackbar('Employee added successfully', { variant: 'success' });
      }

      setOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to save employee', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await apiClient.delete(`/employees/${id}`);
      enqueueSnackbar('Employee deleted successfully', { variant: 'success' });
      fetchEmployees();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete employee', { variant: 'error' });
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      fullName: employee.fullName,
      phoneNumber: employee.phoneNumber,
      email: employee.email || '',
      role: employee.role,
      monthlySalary: employee.monthlySalary,
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
      status: employee.status,
      tazkiraNumber: employee.tazkiraNumber || '',
      address: employee.address || '',
      biometricId: employee.biometricId || '',
    });
    setEditingId(employee.id);
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      role: '',
      monthlySalary: '',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      tazkiraNumber: '',
      address: '',
      biometricId: '',
    });
    setErrors({});
    setEditingId(null);
  };

  const handleDialogClose = () => {
    setOpen(false);
    resetForm();
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phoneNumber?.includes(searchTerm)
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Employee Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage employee information and payroll
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add Employee
        </Button>
      </Box>

      <Card
        sx={{
          mb: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name, position, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </CardContent>
      </Card>

      <EnhancedDataTable
        columns={[
          { id: 'fullName', label: 'Full Name', bold: true },
          { id: 'role', label: 'Position' },
          { id: 'phoneNumber', label: 'Phone Number' },
          { id: 'email', label: 'Email' },
          { id: 'monthlySalary', label: 'Salary (AFN)', align: 'right', color: 'success.main', bold: true, format: (v) => `${Number(v || 0).toLocaleString()} ؋` },
          { id: 'joiningDate', label: 'Join Date', format: (date) => date ? new Date(date).toLocaleDateString() : '-' },
          { id: 'status', label: 'Status' },
        ]}
        data={filteredEmployees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No employees found"
      />

      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Employee' : 'Add New Employee'}</Typography>
              <Typography variant="caption" color="text.secondary">Enter employee information and details</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.5, letterSpacing: '0.1em' }}>
            👤 Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Ahmad Khan"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
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
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
                }}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                placeholder="example@domain.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tazkira Number"
                placeholder="e.g. 1234-5678-90123"
                value={formData.tazkiraNumber}
                onChange={(e) => setFormData({ ...formData, tazkiraNumber: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Biometric ID"
                placeholder="e.g. BIO-12345"
                value={formData.biometricId}
                onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                placeholder="e.g. Kabul, District 5"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1.5, letterSpacing: '0.1em' }}>
            💼 Employment Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position / Role"
                placeholder="e.g. Sales Manager"
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value });
                  if (errors.role) setErrors({ ...errors, role: '' });
                }}
                error={!!errors.role}
                helperText={errors.role}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><Work fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Salary"
                type="number"
                placeholder="0"
                value={formData.monthlySalary}
                onChange={(e) => {
                  setFormData({ ...formData, monthlySalary: e.target.value });
                  if (errors.monthlySalary) setErrors({ ...errors, monthlySalary: '' });
                }}
                error={!!errors.monthlySalary}
                helperText={errors.monthlySalary}
                required
                InputProps={{ startAdornment: <InputAdornment position="start">؋</InputAdornment>, endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Joining Date"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Active">🟢 Active</MenuItem>
                  <MenuItem value="Inactive">🔴 Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? null : <Add />}>
            {editingId ? 'Update Employee' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
