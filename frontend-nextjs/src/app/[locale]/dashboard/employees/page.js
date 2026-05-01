// src/app/[locale]/dashboard/employees/page.js
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
  const t = useTranslations('Employees');
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
      enqueueSnackbar(t('fetchError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!validateRequired(formData.fullName)) {
      newErrors.fullName = t('validationFullNameRequired');
    }

    if (!validateRequired(formData.phoneNumber)) {
      newErrors.phoneNumber = t('validationPhoneRequired');
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = t('validationPhoneInvalid');
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = t('validationEmailInvalid');
    }

    if (!validateRequired(formData.role)) {
      newErrors.role = t('validationRoleRequired');
    }

    if (!validateRequired(formData.monthlySalary)) {
      newErrors.monthlySalary = t('validationSalaryRequired');
    } else if (!validatePrice(formData.monthlySalary)) {
      newErrors.monthlySalary = t('validationSalaryPositive');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      enqueueSnackbar(t('fixValidationErrors'), { variant: 'error' });
      return;
    }

    try {
      const employeeData = {
        ...formData,
        monthlySalary: parseFloat(formData.monthlySalary),
      };

      if (editingId) {
        await apiClient.put(`/employees/${editingId}`, employeeData);
        enqueueSnackbar(t('employeeUpdated'), { variant: 'success' });
      } else {
        await apiClient.post('/employees', employeeData);
        enqueueSnackbar(t('employeeAdded'), { variant: 'success' });
      }

      setOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || t('saveError'), { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;

    try {
      await apiClient.delete(`/employees/${id}`);
      enqueueSnackbar(t('employeeDeleted'), { variant: 'success' });
      fetchEmployees();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || t('deleteError'), { variant: 'error' });
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
          {t('addEmployee')}
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
            placeholder={t('searchPlaceholder')}
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
          { id: 'fullName', label: t('columnFullName'), bold: true },
          { id: 'role', label: t('columnRole') },
          { id: 'phoneNumber', label: t('columnPhone') },
          { id: 'email', label: t('columnEmail') },
          { id: 'monthlySalary', label: t('columnSalary'), align: 'right', color: 'success.main', bold: true, format: (v) => `${Number(v || 0).toLocaleString()} ؋` },
          { id: 'joiningDate', label: t('columnJoinDate'), format: (date) => date ? new Date(date).toLocaleDateString() : '-' },
          { id: 'status', label: t('columnStatus') },
        ]}
        data={filteredEmployees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage={t('noEmployeesFound')}
      />

      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingId ? t('editEmployee') : t('addNewEmployee')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('dialogSubtitle')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.5, letterSpacing: '0.1em' }}>
            {t('personalInfoSection')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('labelFullName')}
                placeholder={t('placeholderFullName')}
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
                label={t('labelPhone')}
                placeholder={t('placeholderPhone')}
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
                label={t('labelEmail')}
                type="email"
                placeholder={t('placeholderEmail')}
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
                label={t('labelTazkira')}
                placeholder={t('placeholderTazkira')}
                value={formData.tazkiraNumber}
                onChange={(e) => setFormData({ ...formData, tazkiraNumber: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('labelBiometricId')}
                placeholder={t('placeholderBiometricId')}
                value={formData.biometricId}
                onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('labelAddress')}
                placeholder={t('placeholderAddress')}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1.5, letterSpacing: '0.1em' }}>
            {t('employmentDetailsSection')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('labelRole')}
                placeholder={t('placeholderRole')}
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
                label={t('labelMonthlySalary')}
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
                label={t('labelJoiningDate')}
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
                <InputLabel>{t('labelStatus')}</InputLabel>
                <Select
                  value={formData.status}
                  label={t('labelStatus')}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Active">{t('statusActive')}</MenuItem>
                  <MenuItem value="Inactive">{t('statusInactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDialogClose}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? null : <Add />}>
            {editingId ? t('updateEmployee') : t('addEmployee')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}