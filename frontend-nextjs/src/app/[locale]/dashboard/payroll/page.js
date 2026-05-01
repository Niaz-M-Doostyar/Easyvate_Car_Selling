// src/app/[locale]/dashboard/payroll/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Payroll');

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
      enqueueSnackbar(t('fetchError'), { variant: 'error' });
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
      enqueueSnackbar(t('selectEmployee'), { variant: 'warning' });
      return;
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (genForm.year > currentYear || (genForm.year === currentYear && genForm.month > currentMonth)) {
      enqueueSnackbar(t('futureMonthError'), { variant: 'error' });
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
      enqueueSnackbar(t('payrollGenerated'), { variant: 'success' });
      setGenerateOpen(false);
      setGenForm({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), commission: '0', deductions: '0', notes: '' });
      fetchPayrolls();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || t('generateError'), { variant: 'error' });
    }
  };

  const handleGenerateBulk = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (filter.year > currentYear || (filter.year === currentYear && filter.month > currentMonth)) {
      enqueueSnackbar(t('futureMonthError'), { variant: 'error' });
      return;
    }
    try {
      await apiClient.post('/payroll/generate-bulk', { month: filter.month, year: filter.year });
      enqueueSnackbar(t('bulkGenerated'), { variant: 'success' });
      fetchPayrolls();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || t('bulkGenerateError'), { variant: 'error' });
    }
  };

  const openPayDialog = (row) => {
    setSelectedPayroll(row);
    const remaining = Number(row.totalAmount || 0) - Number(row.paidAmount || 0);
    setPayAmount(String(remaining > 0 ? remaining : 0));
    setPayOpen(true);
  };

  const handlePay = async () => {
    if (payAmount === undefined || payAmount === null || parseFloat(payAmount) < 0) {
      enqueueSnackbar(t('validAmountRequired'), { variant: 'warning' });
      return;
    }
    try {
      await apiClient.post(`/payroll/${selectedPayroll.id}/pay`, { amount: parseFloat(payAmount) });
      enqueueSnackbar(t('paymentRecorded'), { variant: 'success' });
      setPayOpen(false);
      setSelectedPayroll(null);
      fetchPayrolls();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || t('paymentError'), { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await apiClient.delete(`/payroll/${id}`);
      enqueueSnackbar(t('payrollDeleted'), { variant: 'success' });
      fetchPayrolls();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || t('deleteError'), { variant: 'error' });
    }
  };

  const statusColor = { Paid: 'success', Pending: 'warning', Partial: 'info' };

  const summaryCards = [
    { label: t('summaryTotalSalary'), value: formatCurrency(summary.total), color: theme.palette.primary.main, icon: <AccountBalance /> },
    { label: t('summaryTotalPaid'), value: formatCurrency(summary.paid), color: theme.palette.success.main, icon: <Payment /> },
    { label: t('summaryPending'), value: formatCurrency(summary.pending), color: theme.palette.warning.main, icon: <Payment /> },
  ];

  const columns = [
    { id: 'Employee', label: t('columnEmployee'), format: (v) => v?.fullName || '-', exportFormat: (v) => v?.fullName || '-', bold: true },
    { id: 'month', label: t('columnMonth'), format: (v) => MONTHS[v - 1] || v },
    { id: 'year', label: t('columnYear') },
    { id: 'calculatedSalary', label: t('columnBaseSalary'), format: (v) => `${Number(v || 0).toLocaleString()} ؋`, hiddenOnMobile: true },
    { id: 'commission', label: t('columnCommission'), format: (v) => `${Number(v || 0).toLocaleString()} ؋`, hiddenOnMobile: true },
    { id: 'deductions', label: t('columnDeductions'), format: (v) => `${Number(v || 0).toLocaleString()} ؋`, hiddenOnMobile: true },
    { id: 'totalAmount', label: t('columnTotal'), format: (v) => formatCurrency(v || 0), bold: true },
    { id: 'paidAmount', label: t('columnPaid'), format: (v) => `${Number(v || 0).toLocaleString()} ؋` },
    {
      id: 'status', label: t('columnStatus'),
      format: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} />,
      exportFormat: (v) => v,
    },
    {
      id: '_pay', label: t('columnPay'),
      format: (_, row) =>
        row.status !== 'Paid' ? (
          <Button size="small" variant="outlined" color="success" onClick={() => openPayDialog(row)}>{t('payButton')}</Button>
        ) : null,
      exportFormat: () => '',
    },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const filterToolbar = (
    <Box display="flex" gap={1.5} flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t('filterMonth')}</InputLabel>
        <Select value={filter.month} label={t('filterMonth')} onChange={(e) => setFilter({ ...filter, month: e.target.value })}>
          {MONTHS.map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>{t('filterYear')}</InputLabel>
        <Select value={filter.year} label={t('filterYear')} onChange={(e) => setFilter({ ...filter, year: e.target.value })}>
          {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t('filterStatus')}</InputLabel>
        <Select value={filter.status} label={t('filterStatus')} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <MenuItem value="">{t('allStatuses')}</MenuItem>
          <MenuItem value="Pending">{t('statusPending')}</MenuItem>
          <MenuItem value="Partial">{t('statusPartial')}</MenuItem>
          <MenuItem value="Paid">{t('statusPaid')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('pageTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{t('pageSubtitle')}</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={handleGenerateBulk}>{t('generateAll')}</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setGenerateOpen(true)}>{t('generatePayroll')}</Button>
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
        title={t('tableTitle')}
        emptyMessage={t('noRecords')}
        toolbar={filterToolbar}
      />

      {/* Generate Payroll Dialog */}
      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ReceiptLong color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{t('generateTitle')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('generateSubtitle')}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.5, letterSpacing: '0.1em' }}>
            {t('employeePeriodSection')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>{t('labelEmployee')}</InputLabel>
                <Select value={genForm.employeeId} label={t('labelEmployee')} onChange={(e) => setGenForm({ ...genForm, employeeId: e.target.value })}>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>👤 {emp.fullName} — {emp.role} ({formatCurrency(emp.monthlySalary || 0)})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>{t('labelMonth')}</InputLabel>
                <Select value={genForm.month} label={t('labelMonth')} onChange={(e) => setGenForm({ ...genForm, month: e.target.value })}>
                  {MONTHS.map((m, i) => <MenuItem key={m} value={i + 1}>📅 {m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>{t('labelYear')}</InputLabel>
                <Select value={genForm.year} label={t('labelYear')} onChange={(e) => setGenForm({ ...genForm, year: e.target.value })}>
                  {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1.5, letterSpacing: '0.1em' }}>
            {t('adjustmentsSection')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('labelCommission')}
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
                label={t('labelDeductions')}
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
                label={t('labelNotes')}
                multiline
                rows={2}
                placeholder={t('notesPlaceholder')}
                value={genForm.notes}
                onChange={(e) => setGenForm({ ...genForm, notes: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: -1 }}><Notes fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setGenerateOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleGenerate} startIcon={<ReceiptLong />}>{t('generateButton')}</Button>
        </DialogActions>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Payment color="success" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{t('recordPaymentTitle')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('recordPaymentSubtitle')}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayroll && (
            <Box sx={{ mt: 0.5 }}>
              <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  👤 {t('employeeLabel')}: <strong>{selectedPayroll.Employee?.fullName}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  💰 {t('totalLabel')}: <strong>{formatCurrency(selectedPayroll.totalAmount || 0)}</strong> &bull;
                  {t('paidLabel')}: <strong>{formatCurrency(selectedPayroll.paidAmount || 0)}</strong> &bull;
                  {t('remainingLabel')}: <strong>{formatCurrency(Number(selectedPayroll.totalAmount || 0) - Number(selectedPayroll.paidAmount || 0))}</strong>
                </Typography>
              </Card>
              <TextField
                fullWidth
                label={t('paymentAmountLabel')}
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
          <Button onClick={() => setPayOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" color="success" onClick={handlePay} startIcon={<Payment />}>{t('recordPaymentButton')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}