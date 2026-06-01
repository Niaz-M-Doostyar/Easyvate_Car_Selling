// pages/attendance-dashboard.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, FormControl, InputLabel,
  Select, MenuItem, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import { Refresh, Today, EventNote } from '@mui/icons-material';
import apiClient from '@/utils/api';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AttendanceDashboard() {
  const [todayData, setTodayData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchToday = useCallback(async () => {
    setLoadingToday(true);
    try {
      const res = await apiClient.get('/attendance/today');
      setTodayData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await apiClient.get(`/attendance/monthly-summary?month=${month}&year=${year}`);
      setSummaryData(res.data.data);
      setTotalDays(res.data.totalDays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchToday();
    fetchSummary();
  }, [fetchToday, fetchSummary]);

  // Auto-refresh today's data every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchToday, 30000);
    return () => clearInterval(interval);
  }, [fetchToday]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Attendance Dashboard</Typography>

      {/* Today's Attendance Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Today's Check‑in / Check‑out</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Check‑In Time</TableCell>
                  <TableCell>Check‑Out Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingToday ? (
                  <TableRow><TableCell colSpan={3} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : todayData.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">No employees found</TableCell></TableRow>
                ) : (
                  todayData.map(emp => (
                    <TableRow key={emp.employeeId}>
                      <TableCell>{emp.employeeName}</TableCell>
                      <TableCell>{emp.checkIn ? new Date(emp.checkIn).toLocaleTimeString() : '—'}</TableCell>
                      <TableCell>{emp.checkOut ? new Date(emp.checkOut).toLocaleTimeString() : '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={1} textAlign="right">
            <Button size="small" startIcon={<Refresh />} onClick={fetchToday}>Refresh</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Monthly Summary Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Monthly Summary (Present / Absent Days)</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select value={month} label="Month" onChange={e => setMonth(e.target.value)}>
                  {MONTHS.map((m, i) => <MenuItem key={m} value={i+1}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select value={year} label="Year" onChange={e => setYear(e.target.value)}>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" onClick={fetchSummary} disabled={loadingSummary}>Load Summary</Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell align="center">Present Days</TableCell>
                  <TableCell align="center">Absent Days</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingSummary ? (
                  <TableRow><TableCell colSpan={3} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : summaryData.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">No data for selected month</TableCell></TableRow>
                ) : (
                  summaryData.map(emp => (
                    <TableRow key={emp.employeeId}>
                      <TableCell>{emp.employeeName}</TableCell>
                      <TableCell align="center">{emp.presentDays}</TableCell>
                      <TableCell align="center">{emp.absentDays}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Total days in {MONTHS[month-1]} {year}: {totalDays}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}