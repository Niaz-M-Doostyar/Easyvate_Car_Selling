'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, Chip, useTheme, alpha, InputAdornment,
} from '@mui/material';
import { Add, AccountBalance, TrendingUp, TrendingDown, MenuBook, Person, AttachMoney, CalendarToday, Description, FilterList, Edit } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

const ENTRY_TYPES = [
  'Income', 'Expense', 'Vehicle Purchase', 'Vehicle Sale',
  'Salary', 'Currency Exchange', 'Loan Given', 'Loan Received', 'Commission',
];
const INCOME_TYPES = ['Income', 'Vehicle Sale', 'Loan Received'];
const EXPENSE_TYPES = ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given', 'Commission'];

export default function ShowroomLedgerPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [entries, setEntries] = useState([]);
  const [balance, setBalance] = useState({ income: 0, expenses: 0, balance: 0, ownerBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ type: '', dateFrom: '', dateTo: '', search: '' });
  const [formData, setFormData] = useState({
    type: 'Income', personName: '', amount: '', currency: 'AFN', date: new Date().toISOString().split('T')[0], description: '',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entryRes, balRes] = await Promise.all([
        apiClient.get('/ledger/showroom'),
        apiClient.get('/ledger/showroom/balance'),
      ]);
      setEntries(entryRes.data.data || []);
      setBalance(balRes.data || { income: 0, expenses: 0, balance: 0, ownerBalance: 0 });
    } catch {
      enqueueSnackbar('Failed to fetch showroom ledger', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (filter.type) result = result.filter((e) => e.type === filter.type);
    if (filter.search) {
      const term = filter.search.toLowerCase();
      result = result.filter((e) =>
        e.personName?.toLowerCase().includes(term) || e.description?.toLowerCase().includes(term)
      );
    }
    if (filter.dateFrom) result = result.filter((e) => e.date >= filter.dateFrom);
    if (filter.dateTo) result = result.filter((e) => e.date <= filter.dateTo + 'T23:59:59');
    return result;
  }, [entries, filter]);

  const handleEdit = (record) => {
    setFormData({
      type: record.type, personName: record.personName || '', amount: record.amount,
      currency: record.currency || 'AFN', date: record.date?.split('T')[0] || '', description: record.description || '',
    });
    setEditingId(record.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await apiClient.delete(`/ledger/showroom/${id}`);
      enqueueSnackbar('Entry deleted', { variant: 'success' });
      fetchData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Delete failed', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.type) {
      enqueueSnackbar('Type and amount are required', { variant: 'warning' });
      return;
    }
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingId) {
        await apiClient.put(`/ledger/showroom/${editingId}`, payload);
        enqueueSnackbar('Entry updated', { variant: 'success' });
      } else {
        await apiClient.post('/ledger/showroom', payload);
        enqueueSnackbar('Entry added', { variant: 'success' });
      }
      setOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Failed to save', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ type: 'Income', personName: '', amount: '', currency: 'AFN', date: new Date().toISOString().split('T')[0], description: '' });
    setEditingId(null);
  };

  const getTypeColor = (type) => {
    if (INCOME_TYPES.includes(type)) return 'success';
    if (EXPENSE_TYPES.includes(type)) return 'error';
    return 'info';
  };

  const summaryCards = [
    { label: 'Total Income', value: formatCurrency(balance.income), color: theme.palette.success.main, icon: <TrendingUp /> },
    { label: 'Total Expenses', value: formatCurrency(balance.expenses), color: theme.palette.error.main, icon: <TrendingDown /> },
    { label: 'Net Balance', value: formatCurrency(balance.balance), color: theme.palette.primary.main, icon: <AccountBalance /> },
    { label: 'Owner Balance', value: formatCurrency(balance.ownerBalance), color: theme.palette.info.main, icon: <AccountBalance /> },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Showroom Ledger</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Track all showroom income, expenses, and balances</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Entry</Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid item xs={6} md={3} key={card.label}>
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

      {/* Filters */}
      <Card sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" placeholder="Search person or description..."
                value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><FilterList fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={filter.type} label="Type" onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                  <MenuItem value="">All Types</MenuItem>
                  {ENTRY_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="From Date" type="date" value={filter.dateFrom}
                onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="To Date" type="date" value={filter.dateTo}
                onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <EnhancedDataTable
        columns={[
          { id: 'type', label: 'Type', format: (v) => <Chip label={v} size="small" color={getTypeColor(v)} variant="outlined" />, exportFormat: (v) => v },
          { id: 'personName', label: 'Person', format: (v) => v || '-' },
          { id: 'amount', label: 'Amount', format: (v, row) => `${Number(v).toLocaleString()} ${row.currency || 'AFN'}`, bold: true },
          { id: 'amountInPKR', label: 'Amount', format: (v) => `${Number(v).toLocaleString()}`, hiddenOnMobile: true },
          { id: 'description', label: 'Description', format: (v) => v || '-' },
          { id: 'date', label: 'Date', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
        ]}
        data={filteredEntries}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        title="Showroom Ledger"
        emptyMessage="No entries found"
      />

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <MenuBook color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Entry' : 'Add Ledger Entry'}</Typography>
              <Typography variant="caption" color="text.secondary">Record income or expense transactions</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Entry Type</InputLabel>
                <Select value={formData.type} label="Entry Type" onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <MenuItem value="Income">🟢 Income</MenuItem>
                  <MenuItem value="Expense">🔴 Expense</MenuItem>
                  <MenuItem value="Vehicle Purchase">🚗 Vehicle Purchase</MenuItem>
                  <MenuItem value="Vehicle Sale">💰 Vehicle Sale</MenuItem>
                  <MenuItem value="Salary">💼 Salary</MenuItem>
                  <MenuItem value="Currency Exchange">💱 Currency Exchange</MenuItem>
                  <MenuItem value="Loan Given">🟡 Loan Given</MenuItem>
                  <MenuItem value="Loan Received">🟣 Loan Received</MenuItem>
                  <MenuItem value="Commission">🟠 Commission</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Person Name (optional)" placeholder="e.g. Ahmad Khan" value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Amount" type="number" placeholder="0" value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small" color="action" /></InputAdornment> }}
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
              <TextField fullWidth label="Date" type="date" value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} placeholder="Describe this transaction..."
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: -1 }}><Description fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? <Edit /> : <Add />}>
            {editingId ? 'Update' : 'Add Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
