'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, Chip, useTheme, alpha, InputAdornment,
} from '@mui/material';
import { Add, EventNote, Notes, Assessment, Person } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AttendancePage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    presentDays: '',
    absentDays: '',
    notes: '',
  });

  useEffect(() => {
    fetchReports();
    fetchEmployees();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/attendance');
      setReports(response.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch attendance reports', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get('/employees');
      setEmployees(response.data.data || []);
    } catch { /* handled silently */ }
  };

  const filteredReports = useMemo(() => {
    let result = [...reports];
    if (filter.month) result = result.filter((r) => r.month === filter.month);
    if (filter.year) result = result.filter((r) => r.year === filter.year);
    return result;
  }, [reports, filter]);

  const summary = useMemo(() => {
    const totalPresent = filteredReports.reduce((s, r) => s + Number(r.presentDays || 0), 0);
    const totalAbsent = filteredReports.reduce((s, r) => s + Number(r.absentDays || 0), 0);
    return { totalPresent, totalAbsent, employees: filteredReports.length };
  }, [filteredReports]);

  const handleEdit = (record) => {
    setFormData({
      employeeId: record.employeeId,
      month: record.month,
      year: record.year,
      presentDays: record.presentDays,
      absentDays: record.absentDays,
      notes: record.notes || '',
    });
    setEditingId(record.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance report?')) return;
    try {
      await apiClient.delete(`/attendance/${id}`);
      enqueueSnackbar('Report deleted', { variant: 'success' });
      fetchReports();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.presentDays) {
      enqueueSnackbar('Employee and present days are required', { variant: 'warning' });
      return;
    }
    try {
      const payload = {
        employeeId: parseInt(formData.employeeId),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        presentDays: parseInt(formData.presentDays),
        absentDays: parseInt(formData.absentDays) || 0,
        notes: formData.notes,
      };
      if (editingId) {
        await apiClient.put(`/attendance/${editingId}`, payload);
        enqueueSnackbar('Attendance report updated', { variant: 'success' });
      } else {
        await apiClient.post('/attendance', payload);
        enqueueSnackbar('Attendance report added', { variant: 'success' });
      }
      setOpen(false);
      resetForm();
      fetchReports();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || 'Failed to save', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      presentDays: '',
      absentDays: '',
      notes: '',
    });
    setEditingId(null);
  };

  const columns = [
    {
      id: 'employeeId', label: 'Employee', bold: true,
      format: (v) => {
        const emp = employees.find((e) => e.id === v);
        return emp ? emp.fullName : '-';
      },
      exportFormat: (v) => {
        const emp = employees.find((e) => e.id === v);
        return emp ? emp.fullName : '-';
      },
    },
    { id: 'month', label: 'Month', format: (v) => MONTHS[v - 1] || v },
    { id: 'year', label: 'Year' },
    {
      id: 'presentDays', label: 'Present Days',
      format: (v) => <Chip label={`${v} days`} size="small" color="success" variant="outlined" />,
      exportFormat: (v) => `${v} days`,
    },
    {
      id: 'absentDays', label: 'Absent Days',
      format: (v) => <Chip label={`${v} days`} size="small" color="error" variant="outlined" />,
      exportFormat: (v) => `${v} days`,
    },
    { id: 'notes', label: 'Notes', format: (v) => v || '-', hiddenOnMobile: true },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const summaryCards = [
    { label: 'Employees Reported', value: summary.employees, color: theme.palette.primary.main, icon: <Person /> },
    { label: 'Total Present Days', value: summary.totalPresent, color: theme.palette.success.main, icon: <EventNote /> },
    { label: 'Total Absent Days', value: summary.totalAbsent, color: theme.palette.error.main, icon: <EventNote /> },
  ];

  const filterToolbar = (
    <Box display="flex" gap={1.5} flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Month</InputLabel>
        <Select value={filter.month} label="Month" onChange={(e) => setFilter({ ...filter, month: e.target.value })}>
          {MONTHS.map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Year</InputLabel>
        <Select value={filter.year} label="Year" onChange={(e) => setFilter({ ...filter, year: e.target.value })}>
          {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Attendance Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Monthly attendance reports for employees</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Monthly Report</Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid item xs={12} md={4} key={card.label}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
              <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">{card.label}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: card.color, mt: 0.5 }}>{card.value}</Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(card.color, 0.1), color: card.color, display: 'flex' }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <EnhancedDataTable
        columns={columns}
        data={filteredReports}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        title="Monthly Attendance Reports"
        emptyMessage="No attendance reports found for this period"
        toolbar={filterToolbar}
      />

      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Assessment color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Monthly Report' : 'Add Monthly Attendance Report'}</Typography>
              <Typography variant="caption" color="text.secondary">Record monthly present and absent days for an employee</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Employee</InputLabel>
                <Select value={formData.employeeId} label="Employee" onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>👤 {emp.fullName} — {emp.role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select value={formData.month} label="Month" onChange={(e) => setFormData({ ...formData, month: e.target.value })}>
                  {MONTHS.map((m, i) => <MenuItem key={m} value={i + 1}>📅 {m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select value={formData.year} label="Year" onChange={(e) => setFormData({ ...formData, year: e.target.value })}>
                  {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Present Days"
                type="number"
                placeholder="e.g. 25"
                value={formData.presentDays}
                onChange={(e) => setFormData({ ...formData, presentDays: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EventNote fontSize="small" color="success" /></InputAdornment>,
                  inputProps: { min: 0, max: 31 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Absent Days"
                type="number"
                placeholder="e.g. 5"
                value={formData.absentDays}
                onChange={(e) => setFormData({ ...formData, absentDays: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EventNote fontSize="small" color="error" /></InputAdornment>,
                  inputProps: { min: 0, max: 31 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                placeholder="Optional notes about this month..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: -1 }}><Notes fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? null : <Assessment />}>
            {editingId ? 'Update Report' : 'Save Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
