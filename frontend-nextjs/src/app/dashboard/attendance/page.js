'use client';
import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, Chip, useTheme, alpha, InputAdornment,
} from '@mui/material';
import { Add, EventNote, CalendarToday, Notes } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';

export default function AttendancePage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    employeeId: '', date: new Date().toISOString().split('T')[0], status: 'Present', notes: '',
  });

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/attendance');
      setAttendance(response.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch attendance', { variant: 'error' });
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

  const handleEdit = (record) => {
    setFormData({ employeeId: record.employeeId, date: record.date, status: record.status, notes: record.notes || '' });
    setEditingId(record.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await apiClient.delete(`/attendance/${id}`);
      enqueueSnackbar('Record deleted', { variant: 'success' });
      fetchAttendance();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.date) {
      enqueueSnackbar('Employee and date are required', { variant: 'warning' });
      return;
    }
    try {
      const payload = { ...formData, employeeId: parseInt(formData.employeeId) };
      if (editingId) {
        await apiClient.put(`/attendance/${editingId}`, payload);
        enqueueSnackbar('Attendance updated', { variant: 'success' });
      } else {
        await apiClient.post('/attendance', payload);
        enqueueSnackbar('Attendance marked', { variant: 'success' });
      }
      setOpen(false);
      resetForm();
      fetchAttendance();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to save', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ employeeId: '', date: new Date().toISOString().split('T')[0], status: 'Present', notes: '' });
    setEditingId(null);
  };

  const statusColorMap = { Present: 'success', Absent: 'error', 'Half Day': 'warning', Leave: 'info', Holiday: 'secondary' };

  const columns = [
    { id: 'Employee', label: 'Employee', format: (v) => v?.fullName || '-', exportFormat: (v) => v?.fullName || '-' },
    { id: 'date', label: 'Date', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    {
      id: 'status', label: 'Status',
      format: (v) => <Chip label={v} size="small" color={statusColorMap[v] || 'default'} />,
      exportFormat: (v) => v,
    },
    { id: 'notes', label: 'Notes', format: (v) => v || '-', hiddenOnMobile: true },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Attendance Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Track employee attendance records</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Mark Attendance</Button>
      </Box>

      <EnhancedDataTable
        columns={columns}
        data={attendance}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        title="Attendance Records"
        emptyMessage="No attendance records found"
      />

      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <EventNote color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Attendance' : 'Mark Attendance'}</Typography>
              <Typography variant="caption" color="text.secondary">Record employee attendance for the day</Typography>
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
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <MenuItem value="Present">🟢 Present</MenuItem>
                  <MenuItem value="Absent">🔴 Absent</MenuItem>
                  <MenuItem value="Half Day">🟡 Half Day</MenuItem>
                  <MenuItem value="Leave">🟠 Leave</MenuItem>
                  <MenuItem value="Holiday">🟣 Holiday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: -1 }}><Notes fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? null : <EventNote />}>
            {editingId ? 'Update' : 'Mark Attendance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
