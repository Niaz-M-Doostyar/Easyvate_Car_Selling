'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, Chip, useTheme, alpha, IconButton, Tooltip, InputAdornment, Autocomplete,
} from '@mui/material';
import { Add, CheckCircle, AccountBalanceWallet, Person, CalendarToday, Notes } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

const CURRENCIES = ['AFN', 'USD', 'PKR'];
const LOAN_TYPES = ['Lent', 'Borrowed', 'Owner Loan'];

export default function LoansPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ status: '', type: '' });
  const [formData, setFormData] = useState({
    personName: '', amount: '', currency: 'AFN', borrowDate: new Date().toISOString().split('T')[0], type: 'Lent', notes: '',
  });
  const [customers, setCustomers] = useState([]);

  useEffect(() => { fetchLoans(); fetchCustomers(); }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/loans');
      setLoans(response.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch loans', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data.data || []);
    } catch { /* non-critical */ }
  };

  const filteredLoans = useMemo(() => {
    let result = [...loans];
    if (filter.status) result = result.filter((l) => l.status === filter.status);
    if (filter.type) result = result.filter((l) => l.type === filter.type);
    return result;
  }, [loans, filter]);

  const summary = useMemo(() => {
    // Use amountInPKR (AFN equivalent) for consistent currency display
    const given = loans.filter((l) => l.type === 'Lent' && l.status === 'Open').reduce((s, l) => s + Number(l.amountInPKR || l.amount || 0), 0);
    const received = loans.filter((l) => (l.type === 'Borrowed' || l.type === 'Owner Loan') && l.status === 'Open').reduce((s, l) => s + Number(l.amountInPKR || l.amount || 0), 0);
    return { given, received, total: loans.length, open: loans.filter((l) => l.status === 'Open').length };
  }, [loans]);

  const handleEdit = (record) => {
    setFormData({
      personName: record.personName, amount: record.amount, currency: record.currency || 'AFN',
      borrowDate: record.borrowDate?.split('T')[0] || '', type: record.type, notes: record.notes || '',
    });
    setEditingId(record.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan record?')) return;
    try {
      await apiClient.delete(`/loans/${id}`);
      enqueueSnackbar('Loan deleted', { variant: 'success' });
      fetchLoans();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || 'Delete failed', { variant: 'error' });
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await apiClient.post(`/loans/${id}/mark-paid`);
      enqueueSnackbar('Loan marked as paid', { variant: 'success' });
      fetchLoans();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || 'Failed to mark paid', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.personName || !formData.amount) {
      enqueueSnackbar('Person name and amount are required', { variant: 'warning' });
      return;
    }
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingId) {
        await apiClient.put(`/loans/${editingId}`, payload);
        enqueueSnackbar('Loan updated', { variant: 'success' });
      } else {
        await apiClient.post('/loans', payload);
        enqueueSnackbar('Loan created', { variant: 'success' });
      }
      setOpen(false);
      resetForm();
      fetchLoans();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || 'Failed to save', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ personName: '', amount: '', currency: 'AFN', borrowDate: new Date().toISOString().split('T')[0], type: 'Lent', notes: '' });
    setEditingId(null);
  };

  const summaryCards = [
    { label: 'Total Given (Open)', value: formatCurrency(summary.given), color: theme.palette.warning.main },
    { label: 'Total Received (Open)', value: formatCurrency(summary.received), color: theme.palette.success.main },
    { label: 'Open Loans', value: summary.open, color: theme.palette.info.main },
    { label: 'Total Records', value: summary.total, color: theme.palette.primary.main },
  ];

  const columns = [
    { id: 'personName', label: 'Person', bold: true },
    {
      id: 'type', label: 'Type',
      format: (v) => <Chip label={v} size="small" color={v === 'Lent' ? 'warning' : v === 'Borrowed' ? 'success' : 'secondary'} variant="outlined" />,
      exportFormat: (v) => v,
    },
    { id: 'amount', label: 'Amount', format: (v, row) => `${Number(v).toLocaleString()} ${row.currency || 'AFN'}` },
    { id: 'borrowDate', label: 'Date', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    {
      id: 'status', label: 'Status',
      format: (v) => <Chip label={v} size="small" color={v === 'Paid' ? 'success' : 'warning'} />,
      exportFormat: (v) => v,
    },
    { id: 'notes', label: 'Notes', format: (v) => v || '-', hiddenOnMobile: true },
    {
      id: '_actions', label: 'Mark Paid',
      format: (_, row) =>
        row.status === 'Open' ? (
          <Tooltip title="Mark as Paid">
            <IconButton size="small" onClick={() => handleMarkPaid(row.id)} sx={{ color: theme.palette.success.main }}>
              <CheckCircle fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null,
      exportFormat: () => '',
    },
  ];

  const filterToolbar = (
    <Box display="flex" gap={1.5}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select value={filter.status} label="Status" onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="Paid">Paid</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Type</InputLabel>
        <Select value={filter.type} label="Type" onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <MenuItem value="">All</MenuItem>
          {LOAN_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Loans Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Track money lent and borrowed</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Loan</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid item xs={6} md={3} key={card.label}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
              <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">{card.label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: card.color, mt: 0.5 }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <EnhancedDataTable
        columns={columns}
        data={filteredLoans}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        title="Loans"
        emptyMessage="No loans found"
        toolbar={filterToolbar}
      />

      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWallet color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Loan' : 'Add New Loan'}</Typography>
              <Typography variant="caption" color="text.secondary">Record money lent or borrowed</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Loan Type</InputLabel>
                <Select value={formData.type} label="Loan Type" onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <MenuItem value="Lent">🟡 Lent (Given)</MenuItem>
                  <MenuItem value="Borrowed">🟢 Borrowed (Received)</MenuItem>
                  <MenuItem value="Owner Loan">🟣 Owner Loan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={customers}
                getOptionLabel={(opt) => typeof opt === 'string' ? opt : (opt.fullName || '')}
                value={formData.personName || ''}
                onChange={(_, val) => setFormData({ ...formData, personName: typeof val === 'string' ? val : (val?.fullName || '') })}
                onInputChange={(_, val, reason) => { if (reason === 'input') setFormData({ ...formData, personName: val }); }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth label="Person Name" placeholder="Search customer..." required
                    InputProps={{ ...params.InputProps, startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(formData.currency)}</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select value={formData.currency} label="Currency" onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                  <MenuItem value="AFN">🇦🇫 ؋ AFN</MenuItem>
                  <MenuItem value="USD">🇺🇸 $ USD</MenuItem>
                  <MenuItem value="PKR">🇵🇰 ₨ PKR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.borrowDate}
                onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                placeholder="Loan details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: -1 }}><Notes fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? null : <Add />}>
            {editingId ? 'Update' : 'Add Loan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
