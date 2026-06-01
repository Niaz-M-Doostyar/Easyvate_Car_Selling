'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, Chip, useTheme, alpha, InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add, AccountBalance, TrendingUp, TrendingDown, MenuBook, Person,
  CalendarToday, Description, FilterList, Edit, CurrencyExchange,
  AttachMoney
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

const ENTRY_TYPES = ['Showroom Balance', 'Expense', 'Commission', 'Owner Withdrawal', 'Currency Exchange', 'Vehicle Purchase', 'Vehicle Sale', 'Salary', 'Loan Given', 'Loan Received'];

const convertFromAFN = (amountAFN, targetCurrency, rates) => {
  if (!amountAFN) return 0;
  if (targetCurrency === 'AFN') return amountAFN;
  const directKey = `${targetCurrency}-AFN`;
  const directRate = rates[directKey];
  if (directRate && directRate !== 0) return amountAFN / directRate;
  const inverseKey = `AFN-${targetCurrency}`;
  const inverseRate = rates[inverseKey];
  if (inverseRate && inverseRate !== 0) return amountAFN * inverseRate;
  return amountAFN;
};

export default function ShowroomLedgerPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('ShowroomLedger');

  const [entries, setEntries] = useState([]);
  const [balance, setBalance] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalCommission: 0,
    totalVehiclePurchases: 0,
    totalOwnerWithdrawal: 0,
    showroomBalance: 0,
    ownerProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [displayCurrency, setDisplayCurrency] = useState('AFN');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ type: '', dateFrom: '', dateTo: '', search: '' });
  const [formData, setFormData] = useState({
    type: 'Showroom Balance',
    personName: '',
    amount: '',
    currency: 'AFN',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true);
      try {
        const res = await apiClient.get('/currency/rates');
        setExchangeRates(res.data.data || {});
      } catch (err) {
        console.error('Failed to fetch exchange rates', err);
        setExchangeRates({});
      } finally {
        setRatesLoading(false);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entryRes, balRes] = await Promise.all([
        apiClient.get('/ledger/showroom'),
        apiClient.get('/ledger/showroom/balance'),
      ]);
      setEntries(entryRes.data.data || []);
      setBalance(balRes.data || {
        totalIncome: 0, totalExpenses: 0, totalVehiclePurchases: 0,
        totalCommission: 0, totalOwnerWithdrawal: 0, showroomBalance: 0, ownerProfit: 0
      });
    } catch {
      enqueueSnackbar(t('fetchError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Income by currency (only 'Showroom Balance' entries)
  const incomeByCurrency = useMemo(() => {
    const result = { AFN: 0, USD: 0, PKR: 0, AED: 0 };
    entries.forEach(entry => {
      if (entry.type === 'Vehicle Sale') {
        const currency = entry.currency || 'AFN';
        const amount = parseFloat(entry.amount) || 0;
        if (result.hasOwnProperty(currency)) result[currency] += amount;
        else result[currency] = (result[currency] || 0) + amount;
      }
    });
    return result;
  }, [entries]);

  // Net balance per currency (exactly as requested: Showroom Balance + Vehicle Sale + Commission minus Expenses + Vehicle Purchases + Owner Withdrawal)
  const netBalanceByCurrency = useMemo(() => {
    const creditTypes = ['Showroom Balance', 'Vehicle Sale', 'Commission', 'Currency Exchange'];
    const debitTypes = ['Expense', 'Vehicle Purchase', 'Owner Withdrawal'];

    const result = { AFN: 0, USD: 0, PKR: 0, AED: 0 };
    entries.forEach(entry => {
      const currency = entry.currency || 'AFN';
      const amount = parseFloat(entry.amount) || 0;
      if (creditTypes.includes(entry.type)) {
        result[currency] += amount;
      } else if (debitTypes.includes(entry.type)) {
        result[currency] -= amount;
      }
      // Ignore all other types (Loan Received, Loan Given, Salary, Currency Exchange, etc.)
    });
    return result;
  }, [entries]);

  // Convert summary AFN totals to display currency (for main summary cards)
  const convertedSummary = useMemo(() => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return {
        totalIncome: balance.totalIncome,
        totalExpenses: balance.totalExpenses,
        totalCommission: balance.totalCommission,
        totalOwnerWithdrawal: balance.totalOwnerWithdrawal,
        showroomBalance: balance.showroomBalance,
        ownerProfit: balance.ownerProfit,
      };
    }
    const conv = (val) => convertFromAFN(val, displayCurrency, exchangeRates);
    return {
      totalIncome: conv(balance.totalIncome),
      totalExpenses: conv(balance.totalExpenses),
      totalCommission: conv(balance.totalCommission),
      totalOwnerWithdrawal: conv(balance.totalOwnerWithdrawal),
      showroomBalance: conv(balance.showroomBalance),
      ownerProfit: conv(balance.ownerProfit),
    };
  }, [balance, displayCurrency, exchangeRates]);

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
      type: record.type,
      personName: record.personName || '',
      amount: record.amount,
      currency: record.currency || 'AFN',
      date: record.date?.split('T')[0] || '',
      description: record.description || '',
    });
    setEditingId(record.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await apiClient.delete(`/ledger/showroom/${id}`);
      enqueueSnackbar(t('entryDeleted'), { variant: 'success' });
      fetchData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || t('deleteError'), { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.type) {
      enqueueSnackbar(t('typeAmountRequired'), { variant: 'warning' });
      return;
    }
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingId) {
        await apiClient.put(`/ledger/showroom/${editingId}`, payload);
        enqueueSnackbar(t('entryUpdated'), { variant: 'success' });
      } else {
        await apiClient.post('/ledger/showroom', payload);
        enqueueSnackbar(t('entryAdded'), { variant: 'success' });
      }
      setOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || t('saveError'), { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Showroom Balance',
      personName: '',
      amount: '',
      currency: 'AFN',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingId(null);
  };

  const getTypeColor = (type) => {
    if (type === 'Showroom Balance') return 'success';
    if (type === 'Vehicle Purchase') return 'warning';
    return 'error';
  };

  const summaryCards = [
    { label: t('totalIncome'), value: formatCurrency(convertedSummary.totalIncome, displayCurrency), color: theme.palette.success.main, icon: <TrendingUp />, formula: t('totalIncomeFormula') },
    { label: t('totalExpenses'), value: formatCurrency(convertedSummary.totalExpenses, displayCurrency), color: theme.palette.error.main, icon: <TrendingDown />, formula: t('totalExpensesFormula') },
    { label: t('totalCommission'), value: formatCurrency(convertedSummary.totalCommission, displayCurrency), color: theme.palette.warning.main, icon: <AccountBalance />, formula: t('totalCommissionFormula') },
    { label: t('ownerWithdrawal'), value: formatCurrency(convertedSummary.totalOwnerWithdrawal, displayCurrency), color: theme.palette.info.main, icon: <Person />, formula: t('ownerWithdrawalFormula') },
    { label: t('mainWalletBalance'), value: formatCurrency(convertedSummary.showroomBalance, displayCurrency), color: theme.palette.primary.main, icon: <AccountBalance />, formula: t('mainWalletBalanceFormula') },
    { label: t('ownerProfit'), value: formatCurrency(convertedSummary.ownerProfit, displayCurrency), color: theme.palette.secondary.main, icon: <AccountBalance />, formula: t('ownerProfitFormula') }
  ];

  const currencyIncomeCards = [
    { label: t('afnIncome'), value: formatCurrency(incomeByCurrency.AFN, 'AFN'), color: theme.palette.primary.dark, currency: 'AFN' },
    { label: t('usdIncome'), value: formatCurrency(incomeByCurrency.USD, 'USD'), color: theme.palette.success.dark, currency: 'USD' },
    { label: t('pkrIncome'), value: formatCurrency(incomeByCurrency.PKR, 'PKR'), color: theme.palette.warning.dark, currency: 'PKR' },
    { label: t('aedIncome'), value: formatCurrency(incomeByCurrency.AED, 'AED'), color: theme.palette.info.dark, currency: 'AED' }
  ];

  const walletBalanceCards = [
    { label: t('mainWalletAfn'), value: formatCurrency(netBalanceByCurrency.AFN, 'AFN'), color: theme.palette.primary.dark, currency: 'AFN' },
    { label: t('mainWalletUsd'), value: formatCurrency(netBalanceByCurrency.USD, 'USD'), color: theme.palette.success.dark, currency: 'USD' },
    { label: t('mainWalletPkr'), value: formatCurrency(netBalanceByCurrency.PKR, 'PKR'), color: theme.palette.warning.dark, currency: 'PKR' },
    { label: t('mainWalletAed'), value: formatCurrency(netBalanceByCurrency.AED, 'AED'), color: theme.palette.info.dark, currency: 'AED' }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('pageTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{t('pageSubtitle')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>{t('addEntry')}</Button>
      </Box>

      {/* Currency Selector */}
      <Card sx={{ mb: 3, p: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <CurrencyExchange color="primary" />
          <Typography variant="subtitle2" fontWeight={600}>{t('displayCurrency')}</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)}>
              <MenuItem value="AFN">🇦🇫 AFN</MenuItem>
              <MenuItem value="USD">🇺🇸 USD</MenuItem>
              <MenuItem value="PKR">🇵🇰 PKR</MenuItem>
              <MenuItem value="AED">🇦🇪 AED</MenuItem>
            </Select>
          </FormControl>
          {ratesLoading && <CircularProgress size={20} />}
        </Box>
      </Card>

      {/* Income by Currency Cards */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 2 }}>{t('incomeByCurrency')}</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {currencyIncomeCards.map((card) => (
          <Grid item xs={6} sm={4} md={3} key={card.currency}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', height: '100%' }}>
              <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">{card.label}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: card.color, mt: 0.5 }}>{card.value}</Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(card.color, 0.1), color: card.color, display: 'flex' }}>
                    <AttachMoney fontSize="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Wallet Balance by Currency Cards */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 2 }}>{t('walletBalanceByCurrency')}</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {walletBalanceCards.map((card) => (
          <Grid item xs={6} sm={4} md={3} key={card.currency}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', height: '100%' }}>
              <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">{card.label}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: card.color, mt: 0.5 }}>{card.value}</Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(card.color, 0.1), color: card.color, display: 'flex' }}>
                    <AccountBalance fontSize="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Summary Cards (AFN totals converted to display currency) */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 2 }}>{t('financialSummary')}</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.label}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', height: '100%' }}>
              <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">{card.label}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: card.color, mt: 0.5 }}>{card.value}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem' }}>{card.formula}</Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(card.color, 0.1), color: card.color, display: 'flex' }}>{card.icon}</Box>
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
              <TextField fullWidth size="small" placeholder={t('searchPlaceholder')}
                value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><FilterList fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('typeLabel')}</InputLabel>
                <Select value={filter.type} label={t('typeLabel')} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                  <MenuItem value="">{t('allTypes')}</MenuItem>
                  {ENTRY_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label={t('fromDate')} type="date" value={filter.dateFrom}
                onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label={t('toDate')} type="date" value={filter.dateTo}
                onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <EnhancedDataTable
        columns={[
          { id: 'type', label: t('columnType'), format: (v) => <Chip label={v} size="small" color={getTypeColor(v)} variant="outlined" />, exportFormat: (v) => v },
          { id: 'personName', label: t('columnPerson'), format: (v) => v || '-' },
          { id: 'amount', label: t('columnAmount'), format: (v, row) => `${Number(v).toLocaleString()} ${row.currency || 'AFN'}`, bold: true },
          { id: 'amountInPKR', label: t('columnAmountPKR'), format: (v) => `${Number(v).toLocaleString()}`, hiddenOnMobile: true },
          { id: 'description', label: t('columnDescription'), format: (v) => v || '-' },
          { id: 'date', label: t('columnDate'), format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
        ]}
        data={filteredEntries}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        title={t('tableTitle')}
        emptyMessage={t('noEntries')}
      />

      {/* Add / Edit Dialog (unchanged) */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <MenuBook color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? t('editEntryTitle') : t('addEntryTitle')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('entryDialogSubtitle')}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('entryTypeLabel')}</InputLabel>
                <Select value={formData.type} label={t('entryTypeLabel')} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <MenuItem value="Showroom Balance">{t('typeShowroomBalance')}</MenuItem>
                  <MenuItem value="Expense">{t('typeExpense')}</MenuItem>
                  <MenuItem value="Commission">{t('typeCommission')}</MenuItem>
                  <MenuItem value="Owner Withdrawal">{t('typeOwnerWithdrawal')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label={t('personNameLabel')} placeholder={t('personNamePlaceholder')}
                value={formData.personName} onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label={t('amountLabel')} type="number" placeholder="0" value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required
                InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(formData.currency)}</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>{t('currencyLabel')}</InputLabel>
                <Select value={formData.currency} label={t('currencyLabel')} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                  <MenuItem value="AFN">🇦🇫 ؋ AFN</MenuItem>
                  <MenuItem value="USD">🇺🇸 $ USD</MenuItem>
                  <MenuItem value="PKR">🇵🇰 ₨ PKR</MenuItem>
                  <MenuItem value="AED">🇦🇪 AED</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label={t('dateLabel')} type="date" value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label={t('descriptionLabel')} multiline rows={2} placeholder={t('descriptionPlaceholder')}
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: -1 }}><Description fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? <Edit /> : <Add />}>
            {editingId ? t('updateButton') : t('addButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}