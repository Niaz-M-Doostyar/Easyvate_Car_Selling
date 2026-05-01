'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, Chip, useTheme, alpha, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip,
} from '@mui/material';
import { Add, EventNote, Assessment, Person, Save, Refresh, Info } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AttendancePage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getTotalDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const totalDays = getTotalDaysInMonth(year, month);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/attendance/bulk?month=${month}&year=${year}`);
      const data = response.data.data || [];
      setAttendanceData(data);
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setHasChanges(false);
    } catch (error) {
      enqueueSnackbar('Failed to fetch attendance data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [month, year, enqueueSnackbar]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleGenerateAll = async () => {
    setLoading(true);
    try {
      const empRes = await apiClient.get('/employees');
      const employees = empRes.data.data || [];
      const currentEmployees = attendanceData.map(a => a.employeeId);
      const missingEmployees = employees.filter(emp => !currentEmployees.includes(emp.id));
      if (missingEmployees.length === 0) {
        enqueueSnackbar('All employees already have attendance records for this month', { variant: 'info' });
        setLoading(false);
        return;
      }
      const newRecords = missingEmployees.map(emp => ({
        employeeId: emp.id,
        month,
        year,
        presentDays: 0,
        absentDays: totalDays,
        notes: '',
      }));
      await apiClient.post('/attendance/bulk', { records: newRecords });
      enqueueSnackbar(`Added ${newRecords.length} new attendance records`, { variant: 'success' });
      fetchAttendance();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || 'Failed to generate', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    const changedRecords = attendanceData.filter((record, idx) => {
      const orig = originalData[idx];
      return (
        record.presentDays !== orig.presentDays ||
        record.absentDays !== orig.absentDays ||
        record.notes !== orig.notes
      );
    }).map(record => ({
      id: record.id,
      employeeId: record.employeeId,
      month: record.month,
      year: record.year,
      presentDays: record.presentDays,
      absentDays: record.absentDays,
      notes: record.notes,
    }));

    if (changedRecords.length === 0) {
      enqueueSnackbar('No changes to save', { variant: 'info' });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/attendance/bulk', { records: changedRecords });
      enqueueSnackbar(`Saved ${changedRecords.length} record(s)`, { variant: 'success' });
      fetchAttendance();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || 'Failed to save', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCtrlSave = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (hasChanges) handleSaveAll();
    }
  }, [hasChanges]);

  useEffect(() => {
    window.addEventListener('keydown', handleCtrlSave);
    return () => window.removeEventListener('keydown', handleCtrlSave);
  }, [handleCtrlSave]);

  const updateField = (index, field, value) => {
    let present = attendanceData[index].presentDays;
    let absent = attendanceData[index].absentDays;

    if (field === 'presentDays') {
      present = Math.min(Math.max(parseInt(value) || 0, 0), totalDays);
      absent = totalDays - present;
    } else if (field === 'absentDays') {
      absent = Math.min(Math.max(parseInt(value) || 0, 0), totalDays);
      present = totalDays - absent;
    } else if (field === 'notes') {
      const newData = [...attendanceData];
      newData[index][field] = value;
      setAttendanceData(newData);
      setHasChanges(true);
      return;
    }

    const newData = [...attendanceData];
    newData[index].presentDays = present;
    newData[index].absentDays = absent;
    setAttendanceData(newData);
    setHasChanges(true);
  };

  const summary = {
    totalEmployees: attendanceData.length,
    totalPresent: attendanceData.reduce((sum, r) => sum + (r.presentDays || 0), 0),
    totalAbsent: attendanceData.reduce((sum, r) => sum + (r.absentDays || 0), 0),
  };

  const summaryCards = [
    { label: 'Employees', value: summary.totalEmployees, color: theme.palette.primary.main, icon: <Person /> },
    { label: 'Total Present Days', value: summary.totalPresent, color: theme.palette.success.main, icon: <EventNote /> },
    { label: 'Total Absent Days', value: summary.totalAbsent, color: theme.palette.error.main, icon: <EventNote /> },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Attendance Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Monthly attendance records – edit present/absent days inline (Ctrl+S to save)
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAttendance} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<Add />} onClick={handleGenerateAll} disabled={loading}>
            Generate All
          </Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSaveAll} disabled={!hasChanges || loading}>
            Save Changes (Ctrl+S)
          </Button>
        </Box>
      </Box>

      {/* Month/Year Selector */}
      <Card sx={{ mb: 3, p: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                {MONTHS.map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="contained" onClick={fetchAttendance} disabled={loading}>
              Load Attendance
            </Button>
          </Grid>
        </Grid>
      </Card>

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

      {/* Month Info Banner */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.08), borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Info color="info" fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          <strong>{MONTHS[month-1]} {year}</strong> has <strong>{totalDays} days</strong>. 
          Present + Absent must equal {totalDays} for each employee.
        </Typography>
      </Box>

      {/* Editable Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Employee Name</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }} align="center">Present Days</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }} align="center">Absent Days</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && attendanceData.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
            ) : attendanceData.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No data. Click "Generate All" to create records.</TableCell></TableRow>
            ) : (
              attendanceData.map((row, idx) => (
                <TableRow key={row.employeeId}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.employeeName}</TableCell>
                  <TableCell align="center">
                    <TextField
                      type="text"
                      size="small"
                      value={row.presentDays}
                      onChange={(e) => updateField(idx, 'presentDays', e.target.value)}
                      inputProps={{ min: 0, max: totalDays, style: { textAlign: 'center', width: 70 } }}
                      sx={{ width: 90 }}
                      error={row.presentDays + row.absentDays !== totalDays}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="text"
                      size="small"
                      value={row.absentDays}
                      onChange={(e) => updateField(idx, 'absentDays', e.target.value)}
                      inputProps={{ min: 0, max: totalDays, style: { textAlign: 'center', width: 70 } }}
                      sx={{ width: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.notes || ''}
                      onChange={(e) => updateField(idx, 'notes', e.target.value)}
                      placeholder="Optional notes..."
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasChanges && !loading && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="warning.main">
            You have unsaved changes. Press Ctrl+S or click "Save Changes".
          </Typography>
        </Box>
      )}
    </Box>
  );
}