// src/app/[locale]/dashboard/attendance/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box, Card, CardContent, Typography, Grid, FormControl, InputLabel,
  Select, MenuItem, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Tooltip
} from '@mui/material';
import { Refresh, Today, EventNote, Settings, Add } from '@mui/icons-material';
import apiClient from '@/utils/api';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AttendanceDashboard() {
  const t = useTranslations('Attendance');
  const [todayData, setTodayData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', leaveType: 'Casual' });
  const [openSettings, setOpenSettings] = useState(false);
  const [workHours, setWorkHours] = useState({ start: '08:00', end: '17:00' });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchToday = useCallback(async () => {
    setLoadingToday(true);
    try {
      const res = await apiClient.get('/attendance/today');
      setTodayData(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingToday(false); }
  }, []);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await apiClient.get(`/attendance/monthly-summary?month=${month}&year=${year}`);
      setSummaryData(res.data.data);
      setTotalDays(res.data.totalDays);
    } catch (err) { console.error(err); }
    finally { setLoadingSummary(false); }
  }, [month, year]);

  const fetchWorkHours = async () => {
    const res = await apiClient.get('/time-settings/work-hours');
    setWorkHours(res.data);
  };

  const updateWorkHours = async () => {
    await apiClient.put('/time-settings/work-hours', workHours);
    alert('Work hours updated');
    fetchToday();
  };

  const submitLeave = async () => {
    if (!selectedEmployee || !leaveForm.startDate || !leaveForm.endDate) return;
    try {
      await apiClient.post('/leaves', {
        employeeId: selectedEmployee,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        leaveType: leaveForm.leaveType
      });
      alert('Leave added successfully');
      setOpenLeaveDialog(false);
      setLeaveForm({ startDate: '', endDate: '', leaveType: 'Casual' });
      fetchToday();
      fetchSummary();
    } catch (err) {
      console.error(err);
      alert('Failed to add leave');
    }
  };

  useEffect(() => {
    fetchToday();
    fetchSummary();
    fetchWorkHours();
  }, [fetchToday, fetchSummary]);

  useEffect(() => {
    const interval = setInterval(fetchToday, 30000);
    return () => clearInterval(interval);
  }, [fetchToday]);

  return (
    <Box>
      {/* Header with Settings button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>{t('pageTitle')}</Typography>
        <Tooltip title={t('workHoursSettings')}>
          <IconButton onClick={() => setOpenSettings(true)}>
            <Settings />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Today's Attendance Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{t('todayTitle')}</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('columnEmployeeName')}</TableCell>
                  <TableCell>{t('columnCheckIn')}</TableCell>
                  <TableCell>{t('columnCheckOut')}</TableCell>
                  <TableCell align="center">{t('columnActions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingToday ? (
                  <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : todayData.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">{t('noEmployees')}</TableCell></TableRow>
                ) : (
                  todayData.flatMap(emp => 
                    emp.pairs.map((pair, idx) => (
                      <TableRow key={`${emp.employeeId}_${idx}`}>
                        {idx === 0 && <TableCell rowSpan={emp.pairs.length}>{emp.employeeName}</TableCell>}
                        <TableCell>{pair.checkIn ? new Date(pair.checkIn).toLocaleTimeString() : '—'}</TableCell>
                        <TableCell>{pair.checkOut ? new Date(pair.checkOut).toLocaleTimeString() : '—'}</TableCell>
                        {idx === 0 && (
                          <TableCell rowSpan={emp.pairs.length}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={() => {
                                setSelectedEmployee(emp.employeeId);
                                setOpenLeaveDialog(true);
                              }}
                            >
                              {t('addLeave')}
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={1} textAlign="right">
            <Button size="small" startIcon={<Refresh />} onClick={fetchToday}>{t('refresh')}</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Monthly Summary Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{t('monthlyTitle')}</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('monthLabel')}</InputLabel>
                <Select value={month} label={t('monthLabel')} onChange={e => setMonth(e.target.value)}>
                  {MONTHS.map((m, i) => <MenuItem key={m} value={i+1}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('yearLabel')}</InputLabel>
                <Select value={year} label={t('yearLabel')} onChange={e => setYear(e.target.value)}>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" onClick={fetchSummary} disabled={loadingSummary}>{t('loadSummary')}</Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('columnEmployeeName')}</TableCell>
                  <TableCell align="center">{t('columnPresentDays')}</TableCell>
                  <TableCell align="center">{t('columnAbsentDays')}</TableCell>
                  <TableCell align="center">{t('columnLeaveDays')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingSummary ? (
                  <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : summaryData.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">{t('noMonthlyData')}</TableCell></TableRow>
                ) : (
                  summaryData.map(emp => (
                    <TableRow key={emp.employeeId}>
                      <TableCell>{emp.employeeName}</TableCell>
                      <TableCell align="center">{emp.presentDays}</TableCell>
                      <TableCell align="center">{emp.absentDays}</TableCell>
                      <TableCell align="center">{emp.leaveDays || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {t('totalDaysInfo', { month: MONTHS[month-1], year, totalDays })}
          </Typography>
        </CardContent>
      </Card>

      {/* Leave Request Dialog */}
      <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)}>
        <DialogTitle>{t('addLeaveTitle')}</DialogTitle>
        <DialogContent>
          <TextField label={t('startDate')} type="date" fullWidth margin="dense"
            value={leaveForm.startDate}
            onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          <TextField label={t('endDate')} type="date" fullWidth margin="dense"
            value={leaveForm.endDate}
            onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>{t('leaveType')}</InputLabel>
            <Select value={leaveForm.leaveType} onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})}>
              <MenuItem value="Casual">{t('leaveCasual')}</MenuItem>
              <MenuItem value="Sick">{t('leaveSick')}</MenuItem>
              <MenuItem value="Annual">{t('leaveAnnual')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeaveDialog(false)}>{t('cancel')}</Button>
          <Button onClick={submitLeave} variant="contained">{t('addLeaveSubmit')}</Button>
        </DialogActions>
      </Dialog>

      {/* Work Hours Settings Dialog */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('workHoursSettings')}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense" label={t('startTime')} type="time" fullWidth
            value={workHours.start} onChange={e => setWorkHours({ ...workHours, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense" label={t('endTime')} type="time" fullWidth
            value={workHours.end} onChange={e => setWorkHours({ ...workHours, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>{t('cancel')}</Button>
          <Button onClick={updateWorkHours} variant="contained">{t('save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}