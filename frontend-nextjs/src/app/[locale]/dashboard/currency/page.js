// src/app/[locale]/dashboard/currency/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, useTheme, alpha, Divider, Chip, InputAdornment, IconButton, Tooltip,
} from '@mui/material';
import { CurrencyExchange as CurrencyIcon, SwapHoriz, Add, AttachMoney, Notes, Settings, Edit, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';

const CURRENCIES = ['AFN', 'USD', 'PKR', 'AED'];

export default function CurrencyPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('Currency');

  const [exchanges, setExchanges] = useState([]);
  const [rates, setRates] = useState({});
  const [currentRates, setCurrentRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingRate, setEditingRate] = useState({ currency: '', rateToAFN: '' });
  const [formData, setFormData] = useState({
    fromCurrency: 'USD', toCurrency: 'AFN', fromAmount: '', exchangeRate: '', notes: '',
  });

  useEffect(() => { fetchExchanges(); fetchRates(); fetchCurrentRates(); }, []);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/currency/exchanges');
      setExchanges(response.data.data || []);
    } catch {
      enqueueSnackbar(t('fetchExchangesError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      const response = await apiClient.get('/currency/rates');
      setRates(response.data.data || {});
    } catch { /* silent */ }
  };

  const fetchCurrentRates = async () => {
    try {
      const response = await apiClient.get('/currency/settings');
      setCurrentRates(response.data.data || []);
    } catch { /* silent */ }
  };

  const handleUpdateRate = async () => {
    if (!editingRate.currency || !editingRate.rateToAFN || editingRate.rateToAFN <= 0) {
      enqueueSnackbar(t('validRateRequired'), { variant: 'warning' });
      return;
    }

    try {
      await apiClient.put(`/currency/settings/${editingRate.currency}`, {
        rateToAFN: parseFloat(editingRate.rateToAFN)
      });
      enqueueSnackbar(t('rateUpdated'), { variant: 'success' });
      setEditingRate({ currency: '', rateToAFN: '' });
      fetchCurrentRates();
      fetchRates();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || t('rateUpdateFailed'), { variant: 'error' });
    }
  };

  const toAmount = useMemo(() => {
    const from = parseFloat(formData.fromAmount) || 0;
    const rate = parseFloat(formData.exchangeRate) || 0;
    return (from * rate).toFixed(2);
  }, [formData.fromAmount, formData.exchangeRate]);

  useEffect(() => {
    const handleRateKey = `${formData.fromCurrency}-${formData.toCurrency}`;
    if (rates[handleRateKey]) {
      setFormData((prev) => ({ ...prev, exchangeRate: String(rates[handleRateKey]) }));
    }
  }, [formData.fromCurrency, formData.toCurrency, rates]);

  const handleSwapCurrencies = () => {
    setFormData((prev) => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
      exchangeRate: prev.exchangeRate ? String((1 / parseFloat(prev.exchangeRate)).toFixed(6)) : ''
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fromAmount || !formData.exchangeRate) {
      enqueueSnackbar(t('amountRateRequired'), { variant: 'warning' });
      return;
    }

    if (formData.fromCurrency === formData.toCurrency) {
      enqueueSnackbar(t('cannotExchangeSameCurrency'), { variant: 'error' });
      return;
    }
    try {
      await apiClient.post('/currency/exchange', {
        ...formData,
        fromAmount: parseFloat(formData.fromAmount),
        exchangeRate: parseFloat(formData.exchangeRate),
      });
      enqueueSnackbar(t('exchangeCompleted'), { variant: 'success' });
      setOpen(false);
      setFormData({ fromCurrency: 'USD', toCurrency: 'AFN', fromAmount: '', exchangeRate: '', notes: '' });
      fetchExchanges();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || t('exchangeFailed'), { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await apiClient.delete(`/currency/exchanges/${id}`);
      enqueueSnackbar(t('deleted'), { variant: 'success' });
      fetchExchanges();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || t('deleteFailed'), { variant: 'error' });
    }
  };

  const rateCardData = [
    { pair: 'USD → ؋', key: 'USD-AFN', color: theme.palette.success.main },
    { pair: 'PKR → ؋', key: 'PKR-AFN', color: theme.palette.primary.main },
    { pair: 'AED → ؋', key: 'AED-AFN', color: theme.palette.warning.main },
  ];

  const columns = [
    { id: 'fromCurrency', label: t('columnFrom'), format: (v, row) => <Chip label={`${Number(row.fromAmount).toLocaleString()} ${v}`} size="small" variant="outlined" /> },
    { id: 'toCurrency', label: t('columnTo'), format: (v, row) => <Chip label={`${Number(row.toAmount).toLocaleString()} ${v}`} size="small" color="primary" /> },
    { id: 'exchangeRate', label: t('columnRate'), format: (v) => Number(v).toFixed(4) },
    { id: 'date', label: t('columnDate'), format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { id: 'notes', label: t('columnNotes'), format: (v) => v || '-', hiddenOnMobile: true },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('pageTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{t('pageSubtitle')}</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title={t('manageRates')}>
            <Button variant="outlined" startIcon={<Settings />} onClick={() => setSettingsOpen(true)}>{t('settings')}</Button>
          </Tooltip>
          <Button variant="contained" startIcon={<SwapHoriz />} onClick={() => setOpen(true)}>{t('newExchange')}</Button>
        </Box>
      </Box>

      {/* Rate Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {rateCardData.map((card) => (
          <Grid item xs={6} sm={4} md key={card.key}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
              <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <CurrencyIcon sx={{ fontSize: 18, color: card.color }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">{card.pair}</Typography>
                </Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: card.color }}>
                  {rates[card.key] ? Number(rates[card.key]).toFixed(card.key.includes('AFN-USD') ? 4 : 2) : '—'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <EnhancedDataTable
        columns={columns}
        data={exchanges}
        onDelete={handleDelete}
        loading={loading}
        title={t('exchangeHistory')}
        emptyMessage={t('noExchangeRecords')}
      />

      {/* New Exchange Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CurrencyIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{t('newExchangeTitle')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('newExchangeSubtitle')}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 1, mb: 1.5, letterSpacing: '0.1em' }}>
            {t('exchangeDetails')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <FormControl fullWidth>
                <InputLabel>{t('fromCurrency')}</InputLabel>
                <Select value={formData.fromCurrency} label={t('fromCurrency')} onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value })}>
                  <MenuItem value="USD">🇺🇸 USD</MenuItem>
                  <MenuItem value="AFN">🇦🇫 ؋</MenuItem>
                  <MenuItem value="PKR">🇵🇰 PKR</MenuItem>
                  <MenuItem value="AED">🇦🇪 AED</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSwapCurrencies}
                sx={{ minWidth: '40px', height: '40px', p: 0.5 }}
                title={t('swapCurrencies')}
              >
                <SwapHoriz />
              </Button>
            </Grid>
            <Grid item xs={5}>
              <FormControl fullWidth>
                <InputLabel>{t('toCurrency')}</InputLabel>
                <Select value={formData.toCurrency} label={t('toCurrency')} onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value })}>
                  <MenuItem value="USD">🇺🇸 USD</MenuItem>
                  <MenuItem value="AFN">🇦🇫 ؋</MenuItem>
                  <MenuItem value="PKR">🇵🇰 PKR</MenuItem>
                  <MenuItem value="AED">🇦🇪 AED</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('amount')}
                type="number"
                placeholder="0"
                value={formData.fromAmount}
                onChange={(e) => setFormData({ ...formData, fromAmount: e.target.value })}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('exchangeRate')}
                type="number"
                placeholder="0.0000"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><SwapHoriz fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                <Typography variant="body2" color="text.secondary">{t('convertedAmount')}</Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {toAmount} {formData.toCurrency}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('notes')}
                multiline
                rows={2}
                placeholder={t('notesPlaceholder')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: -1 }}><Notes fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={<SwapHoriz />}>{t('completeExchange')}</Button>
        </DialogActions>
      </Dialog>

      {/* Exchange Rate Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Settings color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{t('rateSettingsTitle')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('rateSettingsSubtitle')}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('rateInfo')}
          </Typography>
          
          {['USD', 'PKR', 'AED'].map((currency) => {
            const currentRate = currentRates.find(r => r.currency === currency);
            const isEditing = editingRate.currency === currency;
            
            return (
              <Card key={currency} sx={{ mb: 2, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {currency === 'USD' ? '🇺🇸' : currency === 'PKR' ? '🇵🇰' : '🇦🇪'} {currency}
                      </Typography>
                      <Chip 
                        label={currentRate ? t('rateValue', {currency: currentRate.currency, rate: Number(currentRate.rateToAFN).toFixed(4)}) : t('notSet')}
                        size="small" 
                        color={currentRate ? 'success' : 'default'}
                      />
                    </Box>
                    {!isEditing && (
                      <IconButton size="small" onClick={() => setEditingRate({ currency, rateToAFN: currentRate?.rateToAFN || '' })}>
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {isEditing && (
                    <Box>
                      <TextField
                        fullWidth
                        label={t('editRateLabel', { currency })}
                        type="number"
                        placeholder="0.0000"
                        value={editingRate.rateToAFN}
                        onChange={(e) => setEditingRate({ ...editingRate, rateToAFN: e.target.value })}
                        size="small"
                        sx={{ mb: 1 }}
                        InputProps={{ 
                          startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
                          endAdornment: <InputAdornment position="end">؋</InputAdornment>
                        }}
                      />
                      <Box display="flex" gap={1}>
                        <Button size="small" onClick={() => setEditingRate({ currency: '', rateToAFN: '' })}>{t('cancel')}</Button>
                        <Button size="small" variant="contained" onClick={handleUpdateRate}>{t('update')}</Button>
                      </Box>
                    </Box>
                  )}
                  
                  {currentRate && !isEditing && (
                    <Typography variant="caption" color="text.secondary">
                      {t('lastUpdated', { date: new Date(currentRate.effectiveDate).toLocaleString() })}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.06), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` }}>
            <Typography variant="caption" color="warning.dark" display="block" fontWeight={600}>{t('important')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('importantNote')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setSettingsOpen(false); setEditingRate({ currency: '', rateToAFN: '' }); }}>{t('close')}</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => { fetchCurrentRates(); fetchRates(); }}>{t('refreshRates')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}