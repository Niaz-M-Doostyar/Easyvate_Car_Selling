// src/app/[locale]/dashboard/sales/page.js
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Tooltip,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, useTheme, alpha, LinearProgress,
  Divider, Autocomplete,
} from '@mui/material';
import {
  Add, Search, PictureAsPdf, PointOfSale, DirectionsCar, Person,
  CalendarToday, AttachMoney, Payment as PaymentIcon, Notes,
  Visibility, Close, TrendingUp, GroupAdd, Info, Edit,
  AccountBalanceWallet, History, CreditScore, Delete,
  SwapHoriz, LocalShipping, Description,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import { validateRequired, validatePrice } from '@/utils/validation';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';
import EnhancedDataTable from '@/components/EnhancedDataTable';

const SALE_TYPES = [
  { value: 'Exchange Car', label: 'Exchange Car', pashto: 'تبادله', icon: <SwapHoriz />, color: '#1565c0' },
  { value: 'Container One Key', label: 'Container One Key', pashto: 'کانتینري یوه کیلي', icon: <LocalShipping />, color: '#e65100' },
  { value: 'Licensed Car', label: 'Licensed Car', pashto: 'اسناد دار هفتر مکمل', icon: <Description />, color: '#2e7d32' },
];

const defaultForm = {
  saleType: 'Container One Key',
  vehicleId: '',
  saleDate: new Date().toISOString().slice(0, 10),
  sellingPrice: '', downPayment: '', remainingAmount: '',
  paymentCurrency: 'AFN',
  notes: '',
  buyerName: '', buyerFatherName: '', buyerProvince: '', buyerDistrict: '',
  buyerVillage: '', buyerAddress: '', buyerIdNumber: '', buyerPhone: '',
  sellerName: '', sellerFatherName: '', sellerProvince: '', sellerDistrict: '',
  sellerVillage: '', sellerAddress: '', sellerIdNumber: '', sellerPhone: '',
  exchVehicleCategory: '', exchVehicleManufacturer: '', exchVehicleModel: '', exchVehicleYear: '',
  exchVehicleColor: '', exchVehicleChassis: '', exchVehicleEngine: '', exchVehicleEngineType: '',
  exchVehicleFuelType: '', exchVehicleTransmission: '', exchVehicleMileage: '',
  exchVehiclePlateNo: '', exchVehicleLicense: '', exchVehicleSteering: 'Left', exchVehicleMonolithicCut: 'Monolithic',
  priceDifference: '', priceDifferencePaidBy: 'Buyer',
  trafficTransferDate: '',
  witnessName1: '', witnessName2: '',
  exchangeVehicleCost: '',
};

export default function SalesPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('Sales');

  const [sales, setSales] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ ...defaultForm });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSale, setDetailSale] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [commissionDist, setCommissionDist] = useState([]);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentSale, setPaymentSale] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', currency: 'AFN', date: new Date().toISOString().slice(0, 10), note: '' });

  const selectedVehicle = useMemo(() => {
    if (!formData.vehicleId) return null;
    return vehicles.find((v) => v.id === formData.vehicleId || v.id === parseInt(formData.vehicleId));
  }, [formData.vehicleId, vehicles]);

  const isEdit = !!editingId;

  useEffect(() => {
    fetchSales();
    fetchVehicles();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/sales');
      setSales(response.data.data || []);
    } catch {
      enqueueSnackbar(t('errorFetchSales'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data.data || []);
    } catch { /* silent */ }
  };

  const fetchSaleDetails = async (saleId) => {
    try {
      const response = await apiClient.get(`/sales/${saleId}`);
      const sale = response.data.data || response.data;
      setDetailSale(sale);
      setCommissionDist(sale.commissions || sale.CommissionDistributions || sale.commissionDistributions || []);
    } catch {
      setCommissionDist([]);
    }
  };

  const fetchPaymentHistory = async (saleId) => {
    try {
      const res = await apiClient.get(`/sales/${saleId}/payments`);
      setPaymentHistory(res.data.data || []);
      setPaymentSummary(res.data.summary || null);
    } catch {
      setPaymentHistory([]);
      setPaymentSummary(null);
    }
  };

  const openPaymentDialog = (sale) => {
    setPaymentSale(sale);
    setPaymentForm({ amount: '', currency: 'AFN', date: new Date().toISOString().slice(0, 10), note: '' });
    fetchPaymentHistory(sale.id);
    setPaymentOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      enqueueSnackbar(t('errorValidPaymentAmount'), { variant: 'error' });
      return;
    }
    const remaining = Number(paymentSale?.remainingAmount || paymentSummary?.remainingAmount || 0);
    if ((paymentForm.currency || 'AFN') === 'AFN' && Number(paymentForm.amount) > remaining) {
      enqueueSnackbar(t('errorAmountExceedsRemaining', { remaining: formatCurrency(remaining) }), { variant: 'error' });
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await apiClient.post(`/sales/${paymentSale.id}/payments`, paymentForm);
      enqueueSnackbar(res.data.message || t('successPaymentRecorded'), { variant: 'success' });
      fetchSales();
      fetchPaymentHistory(paymentSale.id);
      setPaymentForm({ amount: '', currency: 'AFN', date: new Date().toISOString().slice(0, 10), note: '' });
      if (res.data.data?.sale) setPaymentSale(res.data.data.sale);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || t('errorPaymentSave'), { variant: 'error' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...defaultForm });
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (sale) => {
    setFormData({
      saleType: sale.saleType || 'Container One Key',
      vehicleId: sale.vehicleId || sale.vehicle?.id || '',
      saleDate: sale.saleDate ? new Date(sale.saleDate).toISOString().slice(0, 10) : '',
      sellingPrice: sale.sellingPrice?.toString() || '',
      downPayment: sale.downPayment?.toString() || '',
      remainingAmount: sale.remainingAmount?.toString() || '',
      paymentCurrency: sale.paymentCurrency || 'AFN',
      notes: sale.notes || '',
      buyerName: sale.buyerName || '', buyerFatherName: sale.buyerFatherName || '',
      buyerProvince: sale.buyerProvince || '', buyerDistrict: sale.buyerDistrict || '',
      buyerVillage: sale.buyerVillage || '', buyerAddress: sale.buyerAddress || '',
      buyerIdNumber: sale.buyerIdNumber || '', buyerPhone: sale.buyerPhone || '',
      sellerName: sale.sellerName || '', sellerFatherName: sale.sellerFatherName || '',
      sellerProvince: sale.sellerProvince || '', sellerDistrict: sale.sellerDistrict || '',
      sellerVillage: sale.sellerVillage || '', sellerAddress: sale.sellerAddress || '',
      sellerIdNumber: sale.sellerIdNumber || '', sellerPhone: sale.sellerPhone || '',
      exchVehicleCategory: sale.exchVehicleCategory || '',
      exchVehicleManufacturer: sale.exchVehicleManufacturer || '',
      exchVehicleModel: sale.exchVehicleModel || '',
      exchVehicleYear: sale.exchVehicleYear?.toString() || '',
      exchVehicleColor: sale.exchVehicleColor || '',
      exchVehicleChassis: sale.exchVehicleChassis || '',
      exchVehicleEngine: sale.exchVehicleEngine || '',
      exchVehicleEngineType: sale.exchVehicleEngineType || '',
      exchVehicleFuelType: sale.exchVehicleFuelType || '',
      exchVehicleTransmission: sale.exchVehicleTransmission || '',
      exchVehicleMileage: sale.exchVehicleMileage?.toString() || '',
      exchVehiclePlateNo: sale.exchVehiclePlateNo || '',
      exchVehicleLicense: sale.exchVehicleLicense || '',
      exchVehicleSteering: sale.exchVehicleSteering || 'Left',
      exchVehicleMonolithicCut: sale.exchVehicleMonolithicCut || 'Monolithic',
      priceDifference: sale.priceDifference?.toString() || '',
      priceDifferencePaidBy: sale.priceDifferencePaidBy || 'Buyer',
      trafficTransferDate: sale.trafficTransferDate ? new Date(sale.trafficTransferDate).toISOString().slice(0, 10) : '',
      witnessName1: sale.witnessName1 || '',
      witnessName2: sale.witnessName2 || '',
      exchangeVehicleCost: sale.exchangeVehicleCost?.toString() || '',
    });
    setEditingId(sale.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDeleteSale'))) return;
    try {
      await apiClient.delete(`/sales/${id}`);
      enqueueSnackbar(t('successSaleDeleted'), { variant: 'success' });
      fetchSales();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || t('errorDeleteSale'), { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (isEdit) {
      try {
        await apiClient.put(`/sales/${editingId}`, { notes: formData.notes });
        enqueueSnackbar(t('successNoteUpdated'), { variant: 'success' });
        setOpen(false);
        resetForm();
        fetchSales();
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message || t('errorUpdateNote'), { variant: 'error' });
      }
      return;
    }

    const newErrors = {};
    if (!validateRequired(formData.vehicleId)) newErrors.vehicleId = t('vehicleRequired');
    if (!validateRequired(formData.buyerName)) newErrors.buyerName = t('buyerNameRequired');
    if (!validateRequired(formData.sellingPrice) || !validatePrice(formData.sellingPrice)) {
      newErrors.sellingPrice = t('invalidPrice');
    }
    if (!validateRequired(formData.downPayment) || !validatePrice(formData.downPayment)) {
      newErrors.downPayment = t('invalidDownPayment');
    }

    if (formData.saleType === 'Exchange Car') {
      if (!validateRequired(formData.exchVehicleManufacturer)) newErrors.exchVehicleManufacturer = t('exchManufacturerRequired');
      if (!validateRequired(formData.exchVehicleModel)) newErrors.exchVehicleModel = t('exchModelRequired');
      if (!validateRequired(formData.exchVehicleYear)) newErrors.exchVehicleYear = t('exchYearRequired');
      else if (Number(formData.exchVehicleYear) < 1900 || Number(formData.exchVehicleYear) > new Date().getFullYear() + 2) newErrors.exchVehicleYear = t('exchYearInvalid');
      if (!validateRequired(formData.exchVehicleChassis)) newErrors.exchVehicleChassis = t('exchChassisRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      enqueueSnackbar(t('pleaseFixErrors'), { variant: 'error' });
      return;
    }

    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const remainingAmount = Math.max(sellingPrice - downPayment, 0);

    const payload = { ...formData, sellingPrice, downPayment, remainingAmount, exchangeVehicleCost: formData.exchangeVehicleCost || '' };

    try {
      const response = await apiClient.post('/sales', payload);
      enqueueSnackbar(t('successSaleRecorded'), { variant: 'success' });
      if (formData.saleType === 'Exchange Car' && formData.exchVehicleCategory) {
        enqueueSnackbar(t('successExchangeVehicleAdded', {
          make: formData.exchVehicleManufacturer || formData.exchVehicleCategory,
          model: formData.exchVehicleModel,
        }), { variant: 'info', autoHideDuration: 5000 });
      }
      setOpen(false);
      resetForm();
      fetchSales();
      fetchVehicles();
    } catch (error) {
      console.error('Sale save error:', error.response?.data || error.message || error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || t('errorSaveSale');
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const generateInvoice = async (saleId) => {
    try {
      const response = await apiClient.get(`/sales/${saleId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${saleId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar(t('successInvoiceGenerated'), { variant: 'success' });
    } catch (error) {
      let errorMsg = t('errorInvoiceGenerate');
      try {
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json.error) errorMsg = json.error;
        }
      } catch { /* ignore */ }
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleViewDetails = (sale) => {
    setDetailSale(sale);
    setDetailTab(0);
    fetchSaleDetails(sale.id);
    setDetailOpen(true);
  };

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    const term = searchTerm.toLowerCase();
    return sales.filter(
      (s) =>
        s.vehicle?.manufacturer?.toLowerCase().includes(term) ||
        s.vehicle?.model?.toLowerCase().includes(term) ||
        s.buyerName?.toLowerCase().includes(term) ||
        s.buyerPhone?.toLowerCase().includes(term) ||
        s.customer?.fullName?.toLowerCase().includes(term) ||
        s.saleId?.toString().includes(term)
    );
  }, [sales, searchTerm]);

  const availableVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'Available' || v.status === 'Reserved' || (editingId && formData.vehicleId === v.id));
  }, [vehicles, editingId, formData.vehicleId]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('pageTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('pageSubtitle')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          {t('recordSale')}
        </Button>
      </Box>

      <Card sx={{ mb: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <TextField fullWidth placeholder={t('searchPlaceholder')}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
        </CardContent>
      </Card>

      <EnhancedDataTable
        columns={[
          { id: 'saleId', label: t('columnSaleId'), bold: true, format: (val) => val || '-' },
          { id: 'saleType', label: t('columnType'), format: (val) => {
            const st = SALE_TYPES.find(st => st.value === val);
            return st ? <Chip label={st.label} size="small" sx={{ bgcolor: alpha(st.color, 0.1), color: st.color, fontWeight: 600, fontSize: '0.7rem' }} /> : (val || '-');
          }},
          { id: 'vehicle', label: t('columnVehicle'), format: (val, row) =>
            `${row.vehicle?.manufacturer || ''} ${row.vehicle?.model || ''} (${row.vehicle?.year || ''})`.trim() || '-',
          },
          { id: 'customer', label: t('columnCustomer'), format: (val, row) => row.customer?.fullName || row.buyerName || '-' },
          { id: 'saleDate', label: t('columnDate'), format: (date) => date ? new Date(date).toLocaleDateString() : '-' },
          { id: 'sellingPrice', label: t('columnPrice'), align: 'right', bold: true, format: (val) => formatCurrency(val) },
          { id: 'remainingAmount', label: t('columnStatus'), align: 'center', format: (val, row) => {
            const num = parseFloat(val) || 0;
            const status = row.paymentStatus;
            if (status === 'Paid' || num <= 0) return <Chip label={t('paid')} size="small" color="success" />;
            return <Chip label={formatCurrency(num)} size="small" color={status === 'Partial' ? 'warning' : 'error'} />;
          }},
          { id: '_actions', label: t('columnActions'), align: 'center', width: '220px', format: (val, row) => (
            <Box display="flex" gap={0.5} justifyContent="center">
              <Tooltip title={t('viewDetails')}><IconButton size="small" onClick={() => handleViewDetails(row)}><Visibility fontSize="small" /></IconButton></Tooltip>
              <Tooltip title={t('downloadBill')}><IconButton size="small" color="secondary" onClick={() => generateInvoice(row.id)}><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
              {(parseFloat(row.remainingAmount || 0) > 0) && (
                <Tooltip title={t('recordPayment')}>
                  <Button size="small" variant="contained" color="success" startIcon={<CreditScore />}
                    onClick={() => openPaymentDialog(row)}
                    sx={{ fontSize: '0.7rem', textTransform: 'none', borderRadius: 1.5, py: 0.3, px: 1, minWidth: 0 }}>
                    {t('pay')}
                  </Button>
                </Tooltip>
              )}
              <Tooltip title={t('edit')}><IconButton size="small" color="primary" onClick={() => handleEdit(row)}><Edit fontSize="small" /></IconButton></Tooltip>
              <Tooltip title={t('delete')}><IconButton size="small" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
            </Box>
          )},
        ]}
        data={filteredSales}
        loading={loading}
        emptyMessage={searchTerm ? t('noSalesMatch') : t('noSalesRecorded')}
      />

      {/* ═══════ RECORD / EDIT SALE DIALOG ═══════ */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PointOfSale color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingId ? t('editSaleNote') : t('recordSaleDialogTitle')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingId ? t('editSaleNoteHint') : t('recordSaleDialogHint')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '75vh' }}>
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5, letterSpacing: '0.1em' }}>
            {t('saleType')}
          </Typography>
          <Box display="flex" gap={1.5} mb={3} flexWrap="wrap">
            {SALE_TYPES.map((st) => (
              <Card key={st.value}
                onClick={() => !isEdit && setFormData({ ...formData, saleType: st.value })}
                sx={{
                  flex: '1 1 180px', cursor: isEdit ? 'default' : 'pointer', p: 2, textAlign: 'center',
                  border: formData.saleType === st.value ? `2px solid ${st.color}` : `1px solid ${theme.palette.divider}`,
                  bgcolor: formData.saleType === st.value ? alpha(st.color, 0.06) : 'transparent',
                  transition: 'all 0.2s',
                  ...(isEdit ? { opacity: 0.7 } : {}),
                }}>
                <Box color={st.color} mb={0.5}>{st.icon}</Box>
                <Typography variant="body2" fontWeight={700} color={formData.saleType === st.value ? st.color : 'text.primary'}>
                  {st.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">{st.pashto}</Typography>
              </Card>
            ))}
          </Box>

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {t('transactionDetails')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Autocomplete
                options={availableVehicles}
                getOptionLabel={(v) => `${v.manufacturer} ${v.model} (${v.year}) - ${v.color}`}
                value={availableVehicles.find(v => v.id == formData.vehicleId) || null}
                onChange={(event, newValue) => {
                  if (!isEdit) {
                    setFormData({
                      ...formData,
                      vehicleId: newValue?.id || '',
                      sellingPrice: newValue?.sellingPrice?.toString() || formData.sellingPrice,
                    });
                    if (errors.vehicleId) setErrors({ ...errors, vehicleId: '' });
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label={t('vehicleLabel')} required
                    error={!!errors.vehicleId} helperText={errors.vehicleId}
                    disabled={isEdit}
                  />
                )}
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('saleDateLabel')} type="date" value={formData.saleDate}
                onChange={(e) => !isEdit && setFormData({ ...formData, saleDate: e.target.value })}
                InputLabelProps={{ shrink: true }} required disabled={isEdit} />
            </Grid>
          </Grid>

          {selectedVehicle && (
            <Card variant="outlined" sx={{ mt: 2, p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.04), borderRadius: 2 }}>
              <Typography variant="overline" fontWeight={600} color="text.secondary">{t('selectedVehicle')}</Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {[
                  [t('type'), selectedVehicle.category],
                  [t('color'), selectedVehicle.color],
                  [t('engine'), selectedVehicle.engineNumber],
                  [t('chassis'), selectedVehicle.chassisNumber],
                  [t('plate'), selectedVehicle.plateNo],
                  [t('cost'), formatCurrency(selectedVehicle.totalCostPKR || 0)],
                ].map(([k, v]) => (
                  <Grid item xs={4} sm={2} key={k}>
                    <Typography variant="caption" color="text.secondary">{k}</Typography>
                    <Typography variant="body2" fontWeight={600}>{v || '-'}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Card>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Seller Info */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {formData.saleType === 'Exchange Car' ? t('sellerInfo') : t('sellerInfo')}
          </Typography>
          <Grid container spacing={2}>
            {[
              { key: 'sellerName', label: 'Name / نوم' },
              { key: 'sellerFatherName', label: 'Father Name / د پلار نوم' },
              { key: 'sellerProvince', label: 'Province / ولایت' },
              { key: 'sellerDistrict', label: 'District / ولسوالي' },
              { key: 'sellerVillage', label: 'Village / قریه' },
              { key: 'sellerAddress', label: 'Address / استوګنځاي' },
              { key: 'sellerIdNumber', label: 'ID / Tazkira No.' },
              { key: 'sellerPhone', label: 'Phone No.' },
            ].map(({ key, label }) => (
              <Grid item xs={12} sm={3} key={key}>
                <TextField fullWidth label={label} size="small" value={formData[key]}
                  onChange={(e) => !isEdit && setFormData({ ...formData, [key]: e.target.value })}
                  disabled={isEdit} />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Buyer Info */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {t('buyerInfo')}
          </Typography>
          <Grid container spacing={2}>
            {[
              { key: 'buyerName', label: 'Name / نوم', required: true, err: errors.buyerName },
              { key: 'buyerFatherName', label: 'Father Name / د پلار نوم' },
              { key: 'buyerProvince', label: 'Province / ولایت' },
              { key: 'buyerDistrict', label: 'District / ولسوالي' },
              { key: 'buyerVillage', label: 'Village / قریه' },
              { key: 'buyerAddress', label: 'Address / استوګنځاي' },
              { key: 'buyerIdNumber', label: 'ID / Tazkira No.' },
              { key: 'buyerPhone', label: 'Phone No.' },
            ].map(({ key, label, required, err }) => (
              <Grid item xs={12} sm={3} key={key}>
                <TextField fullWidth label={label} size="small" value={formData[key]}
                  required={!!required} error={!!err} helperText={err}
                  onChange={(e) => {
                    if (!isEdit) {
                      setFormData({ ...formData, [key]: e.target.value });
                      if (err) setErrors({ ...errors, [key]: '' });
                    }
                  }}
                  disabled={isEdit} />
              </Grid>
            ))}
          </Grid>

          {/* Exchange Car specific */}
          {formData.saleType === 'Exchange Car' && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" fontWeight={700} color="primary" sx={{ display: 'block', mb: 0.5 }}>
                {t('exchangeVehicleInfo')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {t('exchangeVehicleAddedHint')}
              </Typography>

              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {t('vehicleIdentity')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" required error={!!errors.exchVehicleManufacturer} disabled={isEdit}>
                    <InputLabel>{t('exchManufacturerLabel')}</InputLabel>
                    <Select value={formData.exchVehicleManufacturer} label={t('exchManufacturerLabel')}
                      onChange={(e) => { if (!isEdit) { setFormData({ ...formData, exchVehicleManufacturer: e.target.value }); if (errors.exchVehicleManufacturer) setErrors({ ...errors, exchVehicleManufacturer: '' }); } }}>
                      {['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet',
                        'KIA', 'Hyundai', 'Mazda', 'Nissan', 'Suzuki', 'Daihatsu', 'FAW', 'Changan'].map(m => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </Select>
                    {errors.exchVehicleManufacturer && <Typography color="error" variant="caption">{errors.exchVehicleManufacturer}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label={t('exchModelLabel')} size="small" value={formData.exchVehicleModel} required
                    error={!!errors.exchVehicleModel} helperText={errors.exchVehicleModel}
                    onChange={(e) => { if (!isEdit) { setFormData({ ...formData, exchVehicleModel: e.target.value }); if (errors.exchVehicleModel) setErrors({ ...errors, exchVehicleModel: '' }); } }}
                    disabled={isEdit} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label={t('exchYearLabel')} size="small" type="number" placeholder="2024" value={formData.exchVehicleYear} required
                    error={!!errors.exchVehicleYear} helperText={errors.exchVehicleYear}
                    onChange={(e) => { if (!isEdit) { setFormData({ ...formData, exchVehicleYear: e.target.value }); if (errors.exchVehicleYear) setErrors({ ...errors, exchVehicleYear: '' }); } }}
                    disabled={isEdit} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" disabled={isEdit}>
                    <InputLabel>{t('exchCategoryLabel')}</InputLabel>
                    <Select value={formData.exchVehicleCategory} label={t('exchCategoryLabel')}
                      onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleCategory: e.target.value })}>
                      <MenuItem value=""><em>{t('none')}</em></MenuItem>
                      {['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck', 'Pickup', 'Bus', 'Other'].map(c => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label={t('exchColorLabel')} size="small" value={formData.exchVehicleColor}
                    onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleColor: e.target.value })}
                    disabled={isEdit} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label={t('exchPlateLabel')} size="small" value={formData.exchVehiclePlateNo}
                    onChange={(e) => !isEdit && setFormData({ ...formData, exchVehiclePlateNo: e.target.value })}
                    disabled={isEdit} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label={t('exchLicenseLabel')} size="small" value={formData.exchVehicleLicense}
                    onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleLicense: e.target.value })}
                    disabled={isEdit} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label={t('exchMileageLabel')} size="small" type="number" value={formData.exchVehicleMileage}
                    onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleMileage: e.target.value })}
                    disabled={isEdit} />
                </Grid>
              </Grid>

              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 2.5, mb: 1 }}>
                {t('engineTechnical')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label={t('exchChassisLabel')} size="small" value={formData.exchVehicleChassis} required
                    error={!!errors.exchVehicleChassis} helperText={errors.exchVehicleChassis}
                    onChange={(e) => { if (!isEdit) { setFormData({ ...formData, exchVehicleChassis: e.target.value }); if (errors.exchVehicleChassis) setErrors({ ...errors, exchVehicleChassis: '' }); } }}
                    disabled={isEdit} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label={t('exchEngineNoLabel')} size="small" value={formData.exchVehicleEngine}
                    onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleEngine: e.target.value })}
                    disabled={isEdit} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" disabled={isEdit}>
                    <InputLabel>{t('exchEngineTypeLabel')}</InputLabel>
                    <Select value={formData.exchVehicleEngineType} label={t('exchEngineTypeLabel')}
                      onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleEngineType: e.target.value })}>
                      <MenuItem value=""><em>{t('none')}</em></MenuItem>
                      {['Inline-3', 'Inline-4', 'Inline-5', 'Inline-6', 'V4', 'V6', 'V8', 'V10', 'V12', 'Rotary', 'Turbo'].map(t => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" disabled={isEdit}>
                    <InputLabel>{t('exchFuelTypeLabel')}</InputLabel>
                    <Select value={formData.exchVehicleFuelType} label={t('exchFuelTypeLabel')}
                      onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleFuelType: e.target.value })}>
                      <MenuItem value=""><em>{t('none')}</em></MenuItem>
                      {['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG'].map(f => (
                        <MenuItem key={f} value={f}>{f}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" disabled={isEdit}>
                    <InputLabel>{t('exchTransmissionLabel')}</InputLabel>
                    <Select value={formData.exchVehicleTransmission} label={t('exchTransmissionLabel')}
                      onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleTransmission: e.target.value })}>
                      <MenuItem value=""><em>{t('none')}</em></MenuItem>
                      {['Manual', 'Automatic', 'CVT', 'Semi-Automatic'].map(t => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" disabled={isEdit}>
                    <InputLabel>{t('exchSteeringLabel')}</InputLabel>
                    <Select value={formData.exchVehicleSteering} label={t('exchSteeringLabel')}
                      onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleSteering: e.target.value })}>
                      <MenuItem value="Left">Left Hand</MenuItem>
                      <MenuItem value="Right">Right Hand</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" disabled={isEdit}>
                    <InputLabel>{t('exchMonolithicCutLabel')}</InputLabel>
                    <Select value={formData.exchVehicleMonolithicCut} label={t('exchMonolithicCutLabel')}
                      onChange={(e) => !isEdit && setFormData({ ...formData, exchVehicleMonolithicCut: e.target.value })}>
                      <MenuItem value="Monolithic">{t('monolithic')}</MenuItem>
                      <MenuItem value="Cut">{t('cut')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 2.5, mb: 1 }}>
                {t('priceDifferenceSection')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label={t('priceDifference')} type="number" value={formData.priceDifference}
                    onChange={(e) => !isEdit && setFormData({ ...formData, priceDifference: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }}
                    disabled={isEdit} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label={t('exchangeVehicleCostLabel')} type="number"
                    value={formData.exchangeVehicleCost || ''}
                    onChange={(e) => !isEdit && setFormData({ ...formData, exchangeVehicleCost: e.target.value })}
                    helperText={t('exchangeVehicleCostHelper')}
                    InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol('AFN')}</InputAdornment> }}
                    disabled={isEdit}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={isEdit}>
                    <InputLabel>{t('differencePaidBy')}</InputLabel>
                    <Select value={formData.priceDifferencePaidBy} label={t('differencePaidBy')}
                      onChange={(e) => !isEdit && setFormData({ ...formData, priceDifferencePaidBy: e.target.value })}>
                      <MenuItem value="Buyer">{t('buyerExchanger')}</MenuItem>
                      <MenuItem value="Seller">{t('sellerExchanger')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </>
          )}

          {/* Licensed Car */}
          {formData.saleType === 'Licensed Car' && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                {t('licenseDocumentInfo')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label={t('trafficTransferDate')} type="date"
                    value={formData.trafficTransferDate}
                    onChange={(e) => !isEdit && setFormData({ ...formData, trafficTransferDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={isEdit} />
                </Grid>
              </Grid>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Payment Info */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {t('paymentInfo')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small" disabled={isEdit}>
                <InputLabel>{t('currencyLabel')}</InputLabel>
                <Select value={formData.paymentCurrency} label={t('currencyLabel')}
                  onChange={(e) => !isEdit && setFormData({ ...formData, paymentCurrency: e.target.value })}>
                  <MenuItem value="AFN">{t('currencyAFN')}</MenuItem>
                  <MenuItem value="USD">{t('currencyUSD')}</MenuItem>
                  <MenuItem value="PKR">{t('currencyPKR')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label={t('sellingPrice')} type="number" value={formData.sellingPrice}
                onChange={(e) => {
                  if (!isEdit) {
                    const price = parseFloat(e.target.value) || 0;
                    const down = parseFloat(formData.downPayment) || 0;
                    setFormData({ ...formData, sellingPrice: e.target.value, remainingAmount: Math.max(price - down, 0).toString() });
                    if (errors.sellingPrice) setErrors({ ...errors, sellingPrice: '' });
                  }
                }}
                error={!!errors.sellingPrice} helperText={errors.sellingPrice} required
                InputProps={{ endAdornment: <InputAdornment position="end">{getCurrencySymbol(formData.paymentCurrency || 'AFN')}</InputAdornment> }}
                disabled={isEdit} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label={t('downPayment')} type="number" value={formData.downPayment}
                onChange={(e) => {
                  if (!isEdit) {
                    const down = parseFloat(e.target.value) || 0;
                    const price = parseFloat(formData.sellingPrice) || 0;
                    setFormData({ ...formData, downPayment: e.target.value, remainingAmount: Math.max(price - down, 0).toString() });
                    if (errors.downPayment) setErrors({ ...errors, downPayment: '' });
                  }
                }}
                error={!!errors.downPayment} helperText={errors.downPayment} required
                InputProps={{ endAdornment: <InputAdornment position="end">{getCurrencySymbol(formData.paymentCurrency || 'AFN')}</InputAdornment> }}
                disabled={isEdit} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label={t('remaining')} type="number" value={formData.remainingAmount} disabled
                InputProps={{ endAdornment: <InputAdornment position="end">{getCurrencySymbol(formData.paymentCurrency || 'AFN')}</InputAdornment> }}
                sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {t('notesAndWitnesses')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('noteLabel')} multiline rows={2} value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('witnessLabel')} size="small" value={formData.witnessName1}
                onChange={(e) => !isEdit && setFormData({ ...formData, witnessName1: e.target.value })}
                disabled={isEdit} />
              <TextField fullWidth label={t('witnessLabel')} size="small" value={formData.witnessName2}
                onChange={(e) => !isEdit && setFormData({ ...formData, witnessName2: e.target.value })}
                disabled={isEdit} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? <Edit /> : <PointOfSale />}
            sx={{ bgcolor: editingId ? theme.palette.info.main : (SALE_TYPES.find(st => st.value === formData.saleType)?.color || theme.palette.primary.main) }}>
            {editingId ? t('updateNote') : t('recordSaleSubmit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════ SALE DETAIL DIALOG ═══════ */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Info color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {t('saleDetailTitle')}{detailSale?.saleId || detailSale?.id}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('saleDetailVehicleToBuyer', {
                    vehicle: `${detailSale?.vehicle?.manufacturer || ''} ${detailSale?.vehicle?.model || ''}`,
                    buyer: detailSale?.buyerName || detailSale?.customer?.fullName
                  })}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDetailOpen(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>

        <Tabs value={detailTab} onChange={(e, v) => setDetailTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={t('saleInfoTab')} />
          <Tab label={t('sellerVehicleTab')} />
          <Tab label={t('profitPartnerSharesTab')} />
          <Tab label={t('partnerProfitDistributionTab')} />
          <Tab label={t('paymentHistoryTab')} />
        </Tabs>

        <DialogContent sx={{ minHeight: 300, pt: 2 }}>
          {/* Tab 0: Sale Info */}
          {detailTab === 0 && detailSale && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {(() => {
                  const st = SALE_TYPES.find(tp => tp.value === detailSale.saleType);
                  return st ? (
                    <Chip icon={st.icon} label={`${st.label} — ${st.pashto}`} sx={{ bgcolor: alpha(st.color, 0.1), color: st.color, fontWeight: 700, fontSize: '0.85rem', py: 2 }} />
                  ) : null;
                })()}
              </Grid>
              {parseFloat(detailSale.remainingAmount) > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`, mb: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="warning.main">
                          {detailSale.paymentStatus === 'Partial' ? t('partialPayment') : t('paymentPending')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('paidAmount')}: {formatCurrency(detailSale.paidAmount || detailSale.downPayment || 0)} — {t('remainingAmount')}: {formatCurrency(detailSale.remainingAmount)}
                        </Typography>
                      </Box>
                      <Button size="small" variant="contained" color="success" startIcon={<CreditScore />}
                        onClick={() => { setDetailOpen(false); openPaymentDialog(detailSale); }}>
                        {t('recordPayment')}
                      </Button>
                    </Box>
                    <LinearProgress variant="determinate" sx={{ mt: 1.5, borderRadius: 1, height: 6 }}
                      value={Math.min(((Number(detailSale.paidAmount || detailSale.downPayment || 0)) / Number(detailSale.sellingPrice || 1)) * 100, 100)}
                      color="warning" />
                  </Card>
                </Grid>
              )}
              {[
                [t('saleId'), detailSale.saleId || detailSale.id],
                [t('vehicle'), `${detailSale.vehicle?.manufacturer || ''} ${detailSale.vehicle?.model || ''} (${detailSale.vehicle?.year || ''})`],
                [t('buyerName'), detailSale.buyerName || detailSale.customer?.fullName],
                [t('buyerPhone'), detailSale.buyerPhone],
                [t('saleDate'), detailSale.saleDate ? new Date(detailSale.saleDate).toLocaleDateString() : '-'],
                [t('sellingPrice'), formatCurrency(detailSale.sellingPrice || 0)],
                [t('downPayment'), formatCurrency(detailSale.downPayment || 0)],
                [t('paidSoFar'), formatCurrency(detailSale.paidAmount || detailSale.downPayment || 0)],
                [t('remainingAmount'), formatCurrency(detailSale.remainingAmount || 0)],
                [t('paymentStatus'), detailSale.paymentStatus || 'Pending'],
                ...(detailSale.saleType === 'Licensed Car' && detailSale.trafficTransferDate
                  ? [[t('trafficTransferDate'), new Date(detailSale.trafficTransferDate).toLocaleDateString()]]
                  : []),
                ...(detailSale.saleType === 'Exchange Car' && detailSale.priceDifference
                  ? [[t('priceDifference'), `${formatCurrency(detailSale.priceDifference||0)} (${detailSale.priceDifferencePaidBy || t('buyer')})`]]
                  : []),
                [t('notes'), detailSale.notes],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  {label === t('paymentStatus') ? (
                    <Box mt={0.3}><Chip label={value} size="small" color={value === 'Paid' ? 'success' : value === 'Partial' ? 'warning' : 'error'} /></Box>
                  ) : (
                    <Typography variant="body2" fontWeight={600}>{value || '-'}</Typography>
                  )}
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 1: Seller & Exchange Vehicle Info */}
          {detailTab === 1 && detailSale && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('sellerLabel')}</Typography>
                {[
                  [t('name'), detailSale.sellerName], [t('fatherName'), detailSale.sellerFatherName],
                  [t('province'), detailSale.sellerProvince], [t('district'), detailSale.sellerDistrict],
                  [t('village'), detailSale.sellerVillage], [t('address'), detailSale.sellerAddress],
                  [t('idNumber'), detailSale.sellerIdNumber], [t('phone'), detailSale.sellerPhone],
                ].map(([l, v]) => (
                  <Box key={l} mb={0.5}>
                    <Typography variant="caption" color="text.secondary">{l}</Typography>
                    <Typography variant="body2" fontWeight={600}>{v || '-'}</Typography>
                  </Box>
                ))}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('buyerLabel')}</Typography>
                {[
                  [t('name'), detailSale.buyerName], [t('fatherName'), detailSale.buyerFatherName],
                  [t('province'), detailSale.buyerProvince], [t('district'), detailSale.buyerDistrict],
                  [t('village'), detailSale.buyerVillage], [t('address'), detailSale.buyerAddress],
                  [t('idNumber'), detailSale.buyerIdNumber], [t('phone'), detailSale.buyerPhone],
                ].map(([l, v]) => (
                  <Box key={l} mb={0.5}>
                    <Typography variant="caption" color="text.secondary">{l}</Typography>
                    <Typography variant="body2" fontWeight={600}>{v || '-'}</Typography>
                  </Box>
                ))}
              </Grid>
              {detailSale.saleType === 'Exchange Car' && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('exchangeVehicleDetail')}</Typography>
                  {detailSale.exchangeVehicleId && (
                    <Chip label={t('addedToInventory')} size="small" color="success" sx={{ mb: 1 }} />
                  )}
                  <Grid container spacing={1}>
                    {[
                      [t('category'), detailSale.exchVehicleCategory],
                      [t('manufacturer'), detailSale.exchVehicleManufacturer],
                      [t('model'), detailSale.exchVehicleModel],
                      [t('year'), detailSale.exchVehicleYear],
                      [t('color'), detailSale.exchVehicleColor],
                      [t('chassis'), detailSale.exchVehicleChassis],
                      [t('engineNo'), detailSale.exchVehicleEngine],
                      [t('engineType'), detailSale.exchVehicleEngineType],
                      [t('fuel'), detailSale.exchVehicleFuelType],
                      [t('transmission'), detailSale.exchVehicleTransmission],
                      [t('mileage'), detailSale.exchVehicleMileage],
                      [t('plate'), detailSale.exchVehiclePlateNo],
                      [t('license'), detailSale.exchVehicleLicense],
                      [t('steering'), detailSale.exchVehicleSteering],
                      [t('monolithicCut'), detailSale.exchVehicleMonolithicCut],
                    ].map(([l, v]) => (
                      <Grid item xs={6} sm={3} key={l}>
                        <Typography variant="caption" color="text.secondary">{l}</Typography>
                        <Typography variant="body2" fontWeight={600}>{v || '-'}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
              {detailSale.witnessName1 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">{t('witness')}:</Typography>
                  <Typography variant="body2">{detailSale.witnessName1}</Typography>
                </Grid>
              )}
            </Grid>
          )}

          {/* Tab 2: Profit & Partner Shares */}
          {detailTab === 2 && detailSale && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary">{t('totalCost')}</Typography>
                  <Typography variant="h5" fontWeight={700} color="info.main">
                    {formatCurrency(detailSale.totalCost || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary">{t('profit')}</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {formatCurrency(detailSale.profit || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary">{t('sharedWithPartners')}</Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    {formatCurrency(detailSale.commission || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                  <Typography variant="caption" color="text.secondary">{t('ownerShare')}</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatCurrency(detailSale.ownerShare || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}` }}>
                  <Typography variant="caption" color="text.secondary">{t('sellingPriceDetail')}</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(detailSale.sellingPrice || 0)}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Partner Profit Distribution */}
          {detailTab === 3 && (
            commissionDist.length > 0 ? (
              <>
                <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>{t('personLabel')}</strong></TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>{t('partnerCapital')}</strong></TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>{t('partnerSharePct')}</strong></TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>{t('partnerAmount')}</strong></TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>{t('partnerStatus')}</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {commissionDist.map((cd) => (
                        <TableRow key={cd.id}>
                          <TableCell><strong>{cd.personName}</strong></TableCell>
                          <TableCell align="right">{cd.investmentAmount ? formatCurrency(cd.investmentAmount) : '-'}</TableCell>
                          <TableCell align="right">{cd.sharePercentage}%</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>{formatCurrency(cd.amount || 0)}</TableCell>
                          <TableCell>
                            <Chip label={cd.status === 'Paid' ? t('statusPaid') : t('statusPending')} size="small"
                              color={cd.status === 'Paid' ? 'success' : 'warning'} />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell><strong>{t('ownerLabel')}</strong></TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">
                          <strong>{(100 - commissionDist.reduce((s, c) => s + Number(c.sharePercentage || 0), 0)).toFixed(2)}%</strong>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                          {formatCurrency(detailSale.ownerShare || 0)}
                        </TableCell>
                        <TableCell>
                          <Chip label={t('ownerTag')} size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {t('profitDistributionSummary')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">{t('totalProfitLabel')}</Typography>
                      <Typography variant="h6" fontWeight={700}>{formatCurrency(detailSale.profit || 0)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">{t('partnerProfitLabel')}</Typography>
                      <Typography variant="h6" fontWeight={700} color="warning.main">
                        {formatCurrency(detailSale.commission || 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box textAlign="center" py={4} color="text.secondary">
                <GroupAdd sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" mt={1}>{t('noSharing')}</Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2, maxWidth: 300, mx: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">{t('ownerReceivesAll')}</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main" mt={1}>
                    {formatCurrency(detailSale.profit || 0)}
                  </Typography>
                </Box>
              </Box>
            )
          )}

          {/* Tab 4: Payment History */}
          {detailTab === 4 && detailSale && <PaymentHistoryTab saleId={detailSale.id} theme={theme} t={t} />}
        </DialogContent>
      </Dialog>

      {/* ═══════ RECORD PAYMENT DIALOG ═══════ */}
      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWallet color="success" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{t('paymentProgressTitle')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {paymentSale?.vehicle?.manufacturer} {paymentSale?.vehicle?.model} → {paymentSale?.customer?.fullName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {paymentSale && (
            <Card sx={{ mb: 2.5, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${theme.palette.divider}` }}>
              <Grid container spacing={1.5}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">{t('sellingPriceProgress')}</Typography>
                  <Typography variant="body1" fontWeight={700}>{formatCurrency(paymentSale.sellingPrice || 0)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">{t('paidSoFar')}</Typography>
                  <Typography variant="body1" fontWeight={700} color="success.main">
                    {formatCurrency(paymentSale.paidAmount || paymentSale.downPayment || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">{t('remainingProgress')}</Typography>
                  <Typography variant="body1" fontWeight={700} color="error.main">
                    {formatCurrency(paymentSale.remainingAmount || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <LinearProgress variant="determinate" sx={{ borderRadius: 1, height: 8 }}
                    value={Math.min(((Number(paymentSale.paidAmount || paymentSale.downPayment || 0)) / Number(paymentSale.sellingPrice || 1)) * 100, 100)}
                    color="success"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {t('percentagePaid', { value: Math.round(((Number(paymentSale.paidAmount || paymentSale.downPayment || 0)) / Number(paymentSale.sellingPrice || 1)) * 100) })}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          )}

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {t('newPaymentTitle')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('paymentAmount')} type="number" value={paymentForm.amount} required
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder={`Max: ${Number(paymentSale?.remainingAmount || 0).toLocaleString()}`}
                InputProps={{ endAdornment: <InputAdornment position="end">؋</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('paymentDate')} type="date" value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label={t('paymentNote')} value={paymentForm.note}
                onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                placeholder="e.g. 2nd installment payment..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>{t('quickAmounts')}</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {paymentSale && [
                  { label: t('payFull'), value: Number(paymentSale.remainingAmount || 0) },
                  { label: t('halfRemaining'), value: Math.round(Number(paymentSale.remainingAmount || 0) / 2) },
                  { label: t('thirdRemaining'), value: Math.round(Number(paymentSale.remainingAmount || 0) / 3) },
                ].filter(b => b.value > 0).map((btn) => (
                  <Chip key={btn.label} label={`${btn.label} (${btn.value.toLocaleString()})`} variant="outlined" size="small"
                    onClick={() => setPaymentForm({ ...paymentForm, amount: btn.value.toString() })}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) } }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          {paymentHistory.length > 0 && (
            <Box mt={3}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {t('paymentHistoryTitle', { count: paymentHistory.length, plural: paymentHistory.length > 1 ? 's' : '' })}
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '40vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><b>#</b></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><b>{t('type')}</b></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><b>{t('amount')}</b></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><b>{t('date')}</b></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><b>{t('note')}</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentHistory.map((p, idx) => (
                      <TableRow key={p.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell><Chip label={p.type} size="small" color={p.type === 'Installment' ? 'info' : 'success'} variant="outlined" /></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>{Number(p.amount).toLocaleString()} {p.currency}</TableCell>
                        <TableCell>{p.date ? new Date(p.date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.purpose || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPaymentOpen(false)}>{t('close')}</Button>
          <Button variant="contained" color="success" onClick={handleRecordPayment} disabled={paymentLoading}
            startIcon={<CreditScore />}>
            {paymentLoading ? t('paymentProcessing') : t('recordPaymentButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Payment History Tab Component ───
function PaymentHistoryTab({ saleId, theme, t }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(`/sales/${saleId}/payments`);
        setPayments(res.data.data || []);
        setSummary(res.data.summary || null);
      } catch {
        enqueueSnackbar?.(t('errorFetchPayment'), { variant: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [saleId, t]);

  if (loading) return <Box textAlign="center" py={4}><Typography color="text.secondary">{t('loading')}</Typography></Box>;

  return (
    <Box>
      {summary && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">{t('sellingPriceProgress')}</Typography>
              <Typography variant="body1" fontWeight={700}>{Number(summary.sellingPrice).toLocaleString()} ؋</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.06), border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">{t('paidSoFar')}</Typography>
              <Typography variant="body1" fontWeight={700} color="success.main">{Number(summary.paidAmount).toLocaleString()} ؋</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.06), border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">{t('remainingProgress')}</Typography>
              <Typography variant="body1" fontWeight={700} color="error.main">{Number(summary.remainingAmount).toLocaleString()} ؋</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">{t('status')}</Typography>
              <Box mt={0.3}><Chip label={summary.paymentStatus} size="small" color={summary.paymentStatus === 'Paid' ? 'success' : summary.paymentStatus === 'Partial' ? 'warning' : 'error'} /></Box>
            </Card>
          </Grid>
        </Grid>
      )}
      {payments.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><b>#</b></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><b>{t('type')}</b></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><b>{t('amount')}</b></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><b>{t('date')}</b></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><b>{t('note')}</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell><Chip label={p.type} size="small" color={p.type === 'Installment' ? 'info' : 'success'} variant="outlined" /></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>{Number(p.amount).toLocaleString()} {p.currency}</TableCell>
                  <TableCell>{p.date ? new Date(p.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{p.purpose || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box textAlign="center" py={4}>
          <History sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2" color="text.secondary" mt={1}>{t('paymentHistoryEmpty')}</Typography>
        </Box>
      )}
    </Box>
  );
}