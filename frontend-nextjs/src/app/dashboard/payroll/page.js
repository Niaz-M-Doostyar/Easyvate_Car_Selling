'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, Chip, useTheme, alpha, InputAdornment,
} from '@mui/material';
import { Add, Payment, AccountBalance, AttachMoney, ReceiptLong, Notes } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PayrollPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: '' });
  const [genForm, setGenForm] = useState({
    employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), commission: '0', deductions: '0', notes: '',
  });

  useEffect(() => { fetchPayrolls(); fetchEmployees(); }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/payroll');
      setPayrolls(response.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch payroll', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get('/employees');
      setEmployees(response.data.data || []);
    } catch { /* silent */ }
  };

  const filteredPayrolls = useMemo(() => {
    let result = [...payrolls];
    if (filter.month) result = result.filter((p) => p.month === filter.month);
    if (filter.year) result = result.filter((p) => p.year === filter.year);
    if (filter.status) result = result.filter((p) => p.status === filter.status);
    return result;
  }, [payrolls, filter]);

  const summary = useMemo(() => {
    const total = filteredPayrolls.reduce((s, p) => s + Number(p.totalAmount || 0), 0);
    const paid = filteredPayrolls.reduce((s, p) => s + Number(p.paidAmount || 0), 0);
    const pending = total - paid;
    return { total, paid, pending, count: filteredPayrolls.length };
  }, [filteredPayrolls]);

  const handleGenerate = async () => {
    if (!genForm.employeeId) {
      enqueueSnackbar('Select an employee', { variant: 'warning' });
      return;
    }
    try {
      await apiClient.post('/payroll/generate', {
        employeeId: parseInt(genForm.employeeId),
        month: genForm.month,
        year: genForm.year,
        commission: parseFloat(genForm.commission) || 0,
        deductions: parseFloat(genForm.deductions) || 0,
        notes: genForm.notes,
      });
      enqueueSnackbar('Payroll generated', { variant: 'success' });
      setGenerateOpen(false);
      setGenForm({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), commission: '0', deductions: '0', notes: '' });
      fetchPayrolls();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Failed to generate', { variant: 'error' });
    }
  };

  const handleGenerateBulk = async () => {
    try {
      await apiClient.post('/payroll/generate-bulk', { month: filter.month, year: filter.year });
      enqueueSnackbar('Bulk payroll generated', { variant: 'success' });
      fetchPayrolls();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Bulk generate failed', { variant: 'error' });
    }
  };

  const openPayDialog = (row) => {
    setSelectedPayroll(row);
    const remaining = Number(row.totalAmount || 0) - Number(row.paidAmount || 0);
    setPayAmount(String(remaining > 0 ? remaining : 0));
    setPayOpen(true);
  };

  const handlePay = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      enqueueSnackbar('Enter a valid amount', { variant: 'warning' });
      return;
    }
    try {
      await apiClient.post(`/payroll/${selectedPayroll.id}/pay`, { amount: parseFloat(payAmount) });
      enqueueSnackbar('Payment recorded', { variant: 'success' });
      setPayOpen(false);
      setSelectedPayroll(null);
      fetchPayrolls();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Payment failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      await apiClient.delete(`/payroll/${id}`);
      enqueueSnackbar('Payroll deleted', { variant: 'success' });
      fetchPayrolls();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Delete failed', { variant: 'error' });
    }
  };

  const statusColor = { Paid: 'success', Pending: 'warning', Partial: 'info' };

  const summaryCards = [
    { label: 'Total Salary', value: formatCurrency(summary.total), color: theme.palette.primary.main, icon: <AccountBalance /> },
    { label: 'Total Paid', value: formatCurrency(summary.paid), color: theme.palette.success.main, icon: <Payment /> },
    { label: 'Pending', value: formatCurrency(summary.pending), color: theme.palette.warning.main, icon: <Payment /> },
  ];

  const columns = [
    { id: 'Employee', label: 'Employee', format: (v) => v?.fullName || '-', exportFormat: (v) => v?.fullName || '-', bold: true },
    { id: 'month', label: 'Month', format: (v) => MONTHS[v - 1] || v },
    { id: 'year', label: 'Year' },
    { id: 'calculatedSalary', label: 'Base Salary', format: (v) => `${Number(v || 0).toLocaleString()}`, hiddenOnMobile: true },
    { id: 'commission', label: 'Commission', format: (v) => `${Number(v || 0).toLocaleString()}`, hiddenOnMobile: true },
    { id: 'deductions', label: 'Deductions', format: (v) => `${Number(v || 0).toLocaleString()}`, hiddenOnMobile: true },
    { id: 'totalAmount', label: 'Total', format: (v) => formatCurrency(v || 0), bold: true },
    { id: 'paidAmount', label: 'Paid', format: (v) => `${Number(v || 0).toLocaleString()}` },
    {
      id: 'status', label: 'Status',
      format: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} />,
      exportFormat: (v) => v,
    },
    {
      id: '_pay', label: 'Pay',
      format: (_, row) =>
        row.status !== 'Paid' ? (
          <Button size="small" variant="outlined" color="success" onClick={() => openPayDialog(row)}>Pay</Button>
        ) : null,
      exportFormat: () => '',
    },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select value={filter.status} label="Status" onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Partial">Partial</MenuItem>
          <MenuItem value="Paid">Paid</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Payroll Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Generate and manage employee payroll</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={handleGenerateBulk}>Generate All</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setGenerateOpen(true)}>Generate Payroll</Button>
        </Box>
      </Box>

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
        data={filteredPayrolls}
        onDelete={handleDelete}
        loading={loading}
        title="Payroll Records"
        emptyMessage="No payroll records found"
        toolbar={filterToolbar}
      />

      {/* Generate Payroll Dialog */}
      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ReceiptLong color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>Generate Payroll</Typography>
              <Typography variant="caption" color="text.secondary">Create payroll record for an employee</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.5, letterSpacing: '0.1em' }}>
            👤 Employee & Period
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Employee</InputLabel>
                <Select value={genForm.employeeId} label="Employee" onChange={(e) => setGenForm({ ...genForm, employeeId: e.target.value })}>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>👤 {emp.fullName} — {emp.role} ({formatCurrency(emp.monthlySalary || 0)})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select value={genForm.month} label="Month" onChange={(e) => setGenForm({ ...genForm, month: e.target.value })}>
                  {MONTHS.map((m, i) => <MenuItem key={m} value={i + 1}>📅 {m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select value={genForm.year} label="Year" onChange={(e) => setGenForm({ ...genForm, year: e.target.value })}>
                  {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1.5, letterSpacing: '0.1em' }}>
            💰 Adjustments
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Commission"
                type="number"
                placeholder="0"
                value={genForm.commission}
                onChange={(e) => setGenForm({ ...genForm, commission: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small" color="action" /></InputAdornment>, endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Deductions"
                type="number"
                placeholder="0"
                value={genForm.deductions}
                onChange={(e) => setGenForm({ ...genForm, deductions: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small" color="action" /></InputAdornment>, endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                placeholder="Payroll notes..."
                value={genForm.notes}
                onChange={(e) => setGenForm({ ...genForm, notes: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: -1 }}><Notes fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setGenerateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} startIcon={<ReceiptLong />}>Generate</Button>
        </DialogActions>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Payment color="success" />
            <Box>
              <Typography variant="h6" fontWeight={700}>Record Payment</Typography>
              <Typography variant="caption" color="text.secondary">Pay employee salary</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayroll && (
            <Box sx={{ mt: 0.5 }}>
              <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  👤 Employee: <strong>{selectedPayroll.Employee?.fullName}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  💰 Total: <strong>{formatCurrency(selectedPayroll.totalAmount || 0)}</strong> &bull;
                  Paid: <strong>{formatCurrency(selectedPayroll.paidAmount || 0)}</strong> &bull;
                  Remaining: <strong>{formatCurrency(Number(selectedPayroll.totalAmount || 0) - Number(selectedPayroll.paidAmount || 0))}</strong>
                </Typography>
              </Card>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                placeholder="0"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small" color="action" /></InputAdornment>, endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handlePay} startIcon={<Payment />}>Record Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
