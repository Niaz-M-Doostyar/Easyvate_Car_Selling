'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Tooltip,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, useTheme, alpha, LinearProgress, Stepper, Step, StepLabel,
  ToggleButton, ToggleButtonGroup, Divider,
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
  vehicleId: '', customerId: '',
  saleDate: new Date().toISOString().slice(0, 10),
  sellingPrice: '', downPayment: '', remainingAmount: '',
  notes: '', note2: '',
  // Seller info
  sellerName: '', sellerFatherName: '', sellerProvince: '', sellerDistrict: '',
  sellerVillage: '', sellerAddress: '', sellerIdNumber: '', sellerPhone: '',
  // Exchange fields
  exchVehicleCategory: '', exchVehicleManufacturer: '', exchVehicleModel: '', exchVehicleYear: '',
  exchVehicleColor: '', exchVehicleChassis: '', exchVehicleEngine: '', exchVehicleEngineType: '',
  exchVehicleFuelType: '', exchVehicleTransmission: '', exchVehicleMileage: '',
  exchVehiclePlateNo: '', exchVehicleLicense: '', exchVehicleSteering: 'Left', exchVehicleMonolithicCut: 'Monolithic',
  priceDifference: '', priceDifferencePaidBy: 'Buyer',
  // Licensed fields
  trafficTransferDate: '',
  // Witnesses
  witnessName1: '', witnessName2: '',
};

export default function SalesPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [sales, setSales] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ ...defaultForm });

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSale, setDetailSale] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [commissionDist, setCommissionDist] = useState([]);

  // Payment dialog
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentSale, setPaymentSale] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', currency: 'AFN', date: new Date().toISOString().slice(0, 10), note: '' });

  // Selected vehicle info for form
  const selectedVehicle = useMemo(() => {
    if (!formData.vehicleId) return null;
    return vehicles.find((v) => v.id === formData.vehicleId || v.id === parseInt(formData.vehicleId));
  }, [formData.vehicleId, vehicles]);

  useEffect(() => {
    fetchSales();
    fetchVehicles();
    fetchCustomers();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/sales');
      setSales(response.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch sales', { variant: 'error' });
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

  const fetchCustomers = async () => {
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data.data || []);
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

  // ─── Payment functions ─────────────────────────
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
      enqueueSnackbar('Enter a valid payment amount', { variant: 'error' });
      return;
    }
    const remaining = Number(paymentSale?.remainingAmount || paymentSummary?.remainingAmount || 0);
    if (Number(paymentForm.amount) > remaining) {
      enqueueSnackbar(`Amount exceeds remaining balance of ${formatCurrency(remaining)}`, { variant: 'error' });
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await apiClient.post(`/sales/${paymentSale.id}/payments`, paymentForm);
      enqueueSnackbar(res.data.message || 'Payment recorded', { variant: 'success' });
      // Refresh everything
      fetchSales();
      fetchPaymentHistory(paymentSale.id);
      setPaymentForm({ amount: '', currency: 'AFN', date: new Date().toISOString().slice(0, 10), note: '' });
      // Update the local sale object with new data
      if (res.data.data?.sale) setPaymentSale(res.data.data.sale);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Failed to record payment', { variant: 'error' });
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
      customerId: sale.customerId || sale.customer?.id || '',
      saleDate: sale.saleDate ? new Date(sale.saleDate).toISOString().slice(0, 10) : '',
      sellingPrice: sale.sellingPrice?.toString() || '',
      downPayment: sale.downPayment?.toString() || '',
      remainingAmount: sale.remainingAmount?.toString() || '',
      notes: sale.notes || '',
      note2: sale.note2 || '',
      sellerName: sale.sellerName || '',
      sellerFatherName: sale.sellerFatherName || '',
      sellerProvince: sale.sellerProvince || '',
      sellerDistrict: sale.sellerDistrict || '',
      sellerVillage: sale.sellerVillage || '',
      sellerAddress: sale.sellerAddress || '',
      sellerIdNumber: sale.sellerIdNumber || '',
      sellerPhone: sale.sellerPhone || '',
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
    });
    setEditingId(sale.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale record?')) return;
    try {
      await apiClient.delete(`/sales/${id}`);
      enqueueSnackbar('Sale deleted successfully', { variant: 'success' });
      fetchSales();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete sale', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!validateRequired(formData.vehicleId)) newErrors.vehicleId = 'Vehicle is required';
    if (!validateRequired(formData.customerId)) newErrors.customerId = 'Customer is required';
    if (!validateRequired(formData.sellingPrice) || !validatePrice(formData.sellingPrice)) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }
    if (!validateRequired(formData.downPayment) || !validatePrice(formData.downPayment)) {
      newErrors.downPayment = 'Valid down payment is required';
    }

    // Exchange Car specific validation
    if (formData.saleType === 'Exchange Car') {
      if (!validateRequired(formData.exchVehicleManufacturer)) newErrors.exchVehicleManufacturer = 'Manufacturer is required';
      if (!validateRequired(formData.exchVehicleModel)) newErrors.exchVehicleModel = 'Model is required';
      if (!validateRequired(formData.exchVehicleYear)) newErrors.exchVehicleYear = 'Year is required';
      else if (Number(formData.exchVehicleYear) < 1900 || Number(formData.exchVehicleYear) > new Date().getFullYear() + 2) newErrors.exchVehicleYear = 'Enter a valid year';
      if (!validateRequired(formData.exchVehicleChassis)) newErrors.exchVehicleChassis = 'Chassis number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      enqueueSnackbar('Please fix validation errors', { variant: 'error' });
      return;
    }

    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const remainingAmount = Math.max(sellingPrice - downPayment, 0);

    const payload = { ...formData, sellingPrice, downPayment, remainingAmount };

    try {
      if (editingId) {
        await apiClient.put(`/sales/${editingId}`, payload);
        enqueueSnackbar('Sale updated successfully', { variant: 'success' });
      } else {
        const response = await apiClient.post('/sales', payload);
        enqueueSnackbar('Sale recorded successfully', { variant: 'success' });
        // Notify user that exchange vehicle was added to inventory
        if (formData.saleType === 'Exchange Car' && formData.exchVehicleCategory) {
          enqueueSnackbar(`Exchange vehicle "${formData.exchVehicleManufacturer || formData.exchVehicleCategory} ${formData.exchVehicleModel}" added to inventory`, { variant: 'info', autoHideDuration: 5000 });
        }
      }
      setOpen(false);
      resetForm();
      fetchSales();
      fetchVehicles(); // Refresh (vehicle gets locked)
    } catch (error) {
      console.error('Sale save error:', error.response?.data || error.message || error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save sale';
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
      enqueueSnackbar('Invoice generated successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to generate invoice', { variant: 'error' });
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
        s.customer?.fullName?.toLowerCase().includes(term) ||
        s.saleId?.toString().includes(term)
    );
  }, [sales, searchTerm]);

  // Available (unsold) vehicles for the dropdown
  const availableVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'Available' || v.status === 'Reserved' || (editingId && formData.vehicleId === v.id));
  }, [vehicles, editingId, formData.vehicleId]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Sales Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track sales, commissions, and profit distribution
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Record Sale
        </Button>
      </Box>

      <Card sx={{ mb: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <TextField fullWidth placeholder="Search by vehicle, customer, or sale ID..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
        </CardContent>
      </Card>

      <EnhancedDataTable
        columns={[
          { id: 'saleId', label: 'Sale ID', bold: true, format: (val) => val || '-' },
          { id: 'saleType', label: 'Type', format: (val) => {
            const t = SALE_TYPES.find(st => st.value === val);
            return t ? <Chip label={t.label} size="small" sx={{ bgcolor: alpha(t.color, 0.1), color: t.color, fontWeight: 600, fontSize: '0.7rem' }} /> : (val || '-');
          }},
          { id: 'vehicle', label: 'Vehicle', format: (val, row) =>
            `${row.vehicle?.manufacturer || ''} ${row.vehicle?.model || ''} (${row.vehicle?.year || ''})`.trim() || '-',
          },
          { id: 'customer', label: 'Customer', format: (val, row) => row.customer?.fullName || '-' },
          { id: 'saleDate', label: 'Date', format: (date) => date ? new Date(date).toLocaleDateString() : '-' },
          { id: 'sellingPrice', label: 'Price', align: 'right', bold: true, format: (val) => formatCurrency(val) },
          { id: 'remainingAmount', label: 'Status', align: 'center', format: (val, row) => {
            const num = parseFloat(val) || 0;
            const status = row.paymentStatus;
            if (status === 'Paid' || num <= 0) return <Chip label="Paid" size="small" color="success" />;
            return <Chip label={formatCurrency(num)} size="small" color={status === 'Partial' ? 'warning' : 'error'} />;
          }},
          { id: '_actions', label: 'Actions', align: 'center', width: '220px', format: (val, row) => (
            <Box display="flex" gap={0.5} justifyContent="center">
              <Tooltip title="View Details"><IconButton size="small" onClick={() => handleViewDetails(row)}><Visibility fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Download Bill"><IconButton size="small" color="secondary" onClick={() => generateInvoice(row.id)}><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
              {(parseFloat(row.remainingAmount || 0) > 0) && (
                <Tooltip title="Record Payment">
                  <Button size="small" variant="contained" color="success" startIcon={<CreditScore />}
                    onClick={() => openPaymentDialog(row)}
                    sx={{ fontSize: '0.7rem', textTransform: 'none', borderRadius: 1.5, py: 0.3, px: 1, minWidth: 0 }}>
                    Pay
                  </Button>
                </Tooltip>
              )}
              <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleEdit(row)}><Edit fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
            </Box>
          )},
        ]}
        data={filteredSales}
        loading={loading}
        emptyMessage={searchTerm ? 'No sales match your search.' : 'No sales recorded yet.'}
      />

      {/* ═══════ RECORD / EDIT SALE DIALOG ═══════ */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PointOfSale color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Sale' : 'Record New Sale'}</Typography>
              <Typography variant="caption" color="text.secondary">Select sale type and fill in details</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '75vh' }}>
          {/* ── Sale Type Selector ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5, letterSpacing: '0.1em' }}>
            Sale Type / د خرنا ډول
          </Typography>
          <Box display="flex" gap={1.5} mb={3} flexWrap="wrap">
            {SALE_TYPES.map((st) => (
              <Card key={st.value}
                onClick={() => setFormData({ ...formData, saleType: st.value })}
                sx={{
                  flex: '1 1 180px', cursor: 'pointer', p: 2, textAlign: 'center',
                  border: formData.saleType === st.value ? `2px solid ${st.color}` : `1px solid ${theme.palette.divider}`,
                  bgcolor: formData.saleType === st.value ? alpha(st.color, 0.06) : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(st.color, 0.04), borderColor: st.color },
                }}>
                <Box color={st.color} mb={0.5}>{st.icon}</Box>
                <Typography variant="body2" fontWeight={700} color={formData.saleType === st.value ? st.color : 'text.primary'}>
                  {st.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">{st.pashto}</Typography>
              </Card>
            ))}
          </Box>

          {/* ── Common: Vehicle, Customer, Date ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Transaction Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required error={!!errors.vehicleId}>
                <InputLabel>Vehicle</InputLabel>
                <Select value={formData.vehicleId} label="Vehicle"
                  onChange={(e) => {
                    const veh = vehicles.find((v) => v.id === e.target.value);
                    setFormData({
                      ...formData,
                      vehicleId: e.target.value,
                      sellingPrice: veh?.sellingPrice?.toString() || formData.sellingPrice,
                    });
                    if (errors.vehicleId) setErrors({ ...errors, vehicleId: '' });
                  }}>
                  {availableVehicles.map((v) => (
                    <MenuItem key={v.id} value={v.id}>{v.manufacturer} {v.model} ({v.year}) - {v.color}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required error={!!errors.customerId}>
                <InputLabel>Buyer (Customer)</InputLabel>
                <Select value={formData.customerId} label="Buyer (Customer)"
                  onChange={(e) => { setFormData({ ...formData, customerId: e.target.value }); if (errors.customerId) setErrors({ ...errors, customerId: '' }); }}>
                  {customers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.fullName} — {c.phoneNumber}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Sale Date" type="date" value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                InputLabelProps={{ shrink: true }} required />
            </Grid>
          </Grid>

          {/* Vehicle summary */}
          {selectedVehicle && (
            <Card variant="outlined" sx={{ mt: 2, p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.04), borderRadius: 2 }}>
              <Typography variant="overline" fontWeight={600} color="text.secondary">Selected Vehicle</Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {[
                  ['Type', selectedVehicle.category], ['Color', selectedVehicle.color],
                  ['Engine', selectedVehicle.engineNumber], ['Chassis', selectedVehicle.chassisNumber],
                  ['Plate', selectedVehicle.plateNo], ['Cost', formatCurrency(selectedVehicle.totalCostPKR || 0)],
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

          {/* ── Seller Info (all 3 types use this) ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {formData.saleType === 'Exchange Car' ? 'Exchanger / Seller Info (رانبوونکي)' : 'Seller Info (رانبوونکي)'}
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
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
              </Grid>
            ))}
          </Grid>

          {/* ── Exchange Car: Exchange Vehicle Info ── */}
          {formData.saleType === 'Exchange Car' && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" fontWeight={700} color="primary" sx={{ display: 'block', mb: 0.5 }}>
                Exchange Vehicle Info (د تبادلي موټر)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                This vehicle will be added to your inventory automatically
              </Typography>

              {/* ── Section: Vehicle Identity ── */}
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Vehicle Identity / پیژندنه
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" required error={!!errors.exchVehicleManufacturer}>
                    <InputLabel>Manufacturer / شرکت</InputLabel>
                    <Select value={formData.exchVehicleManufacturer} label="Manufacturer / شرکت"
                      onChange={(e) => { setFormData({ ...formData, exchVehicleManufacturer: e.target.value }); if (errors.exchVehicleManufacturer) setErrors({ ...errors, exchVehicleManufacturer: '' }); }}>
                      {['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet',
                        'KIA', 'Hyundai', 'Mazda', 'Nissan', 'Suzuki', 'Daihatsu', 'FAW', 'Changan'].map(m => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </Select>
                    {errors.exchVehicleManufacturer && <Typography color="error" variant="caption">{errors.exchVehicleManufacturer}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Model / مادل" size="small" value={formData.exchVehicleModel} required
                    error={!!errors.exchVehicleModel} helperText={errors.exchVehicleModel}
                    onChange={(e) => { setFormData({ ...formData, exchVehicleModel: e.target.value }); if (errors.exchVehicleModel) setErrors({ ...errors, exchVehicleModel: '' }); }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Year / کال" size="small" type="number" placeholder="2024" value={formData.exchVehicleYear} required
                    error={!!errors.exchVehicleYear} helperText={errors.exchVehicleYear}
                    onChange={(e) => { setFormData({ ...formData, exchVehicleYear: e.target.value }); if (errors.exchVehicleYear) setErrors({ ...errors, exchVehicleYear: '' }); }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category / کټګوري</InputLabel>
                    <Select value={formData.exchVehicleCategory} label="Category / کټګوري"
                      onChange={(e) => setFormData({ ...formData, exchVehicleCategory: e.target.value })}>
                      <MenuItem value=""><em>None</em></MenuItem>
                      {['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck', 'Pickup', 'Bus', 'Other'].map(c => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Color / رنګ" size="small" value={formData.exchVehicleColor}
                    onChange={(e) => setFormData({ ...formData, exchVehicleColor: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Plate No. / اسکاچ نمبر" size="small" value={formData.exchVehiclePlateNo}
                    onChange={(e) => setFormData({ ...formData, exchVehiclePlateNo: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="License / لایسنس" size="small" value={formData.exchVehicleLicense}
                    onChange={(e) => setFormData({ ...formData, exchVehicleLicense: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Mileage (km) / مایلیج" size="small" type="number" value={formData.exchVehicleMileage}
                    onChange={(e) => setFormData({ ...formData, exchVehicleMileage: e.target.value })} />
                </Grid>
              </Grid>

              {/* ── Section: Engine & Technical ── */}
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 2.5, mb: 1 }}>
                Engine & Technical / انجن او تخنیکي
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Chassis No. / چیسي" size="small" value={formData.exchVehicleChassis} required
                    error={!!errors.exchVehicleChassis} helperText={errors.exchVehicleChassis}
                    onChange={(e) => { setFormData({ ...formData, exchVehicleChassis: e.target.value }); if (errors.exchVehicleChassis) setErrors({ ...errors, exchVehicleChassis: '' }); }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Engine No. / انجن نمبر" size="small" value={formData.exchVehicleEngine}
                    onChange={(e) => setFormData({ ...formData, exchVehicleEngine: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Engine Type / انجن ډول</InputLabel>
                    <Select value={formData.exchVehicleEngineType} label="Engine Type / انجن ډول"
                      onChange={(e) => setFormData({ ...formData, exchVehicleEngineType: e.target.value })}>
                      <MenuItem value=""><em>None</em></MenuItem>
                      {['Inline-3', 'Inline-4', 'Inline-5', 'Inline-6', 'V4', 'V6', 'V8', 'V10', 'V12', 'Rotary', 'Turbo'].map(t => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Fuel Type / تیل ډول</InputLabel>
                    <Select value={formData.exchVehicleFuelType} label="Fuel Type / تیل ډول"
                      onChange={(e) => setFormData({ ...formData, exchVehicleFuelType: e.target.value })}>
                      <MenuItem value=""><em>None</em></MenuItem>
                      {['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG'].map(f => (
                        <MenuItem key={f} value={f}>{f}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Transmission / ګیربکس</InputLabel>
                    <Select value={formData.exchVehicleTransmission} label="Transmission / ګیربکس"
                      onChange={(e) => setFormData({ ...formData, exchVehicleTransmission: e.target.value })}>
                      <MenuItem value=""><em>None</em></MenuItem>
                      {['Manual', 'Automatic', 'CVT', 'Semi-Automatic'].map(t => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Steering / سټیرنګ</InputLabel>
                    <Select value={formData.exchVehicleSteering} label="Steering / سټیرنګ"
                      onChange={(e) => setFormData({ ...formData, exchVehicleSteering: e.target.value })}>
                      <MenuItem value="Left">Left</MenuItem>
                      <MenuItem value="Right">Right</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Monolithic/Cut / مونولت/کت</InputLabel>
                    <Select value={formData.exchVehicleMonolithicCut} label="Monolithic/Cut / مونولت/کت"
                      onChange={(e) => setFormData({ ...formData, exchVehicleMonolithicCut: e.target.value })}>
                      <MenuItem value="Monolithic">Monolithic</MenuItem>
                      <MenuItem value="Cut">Cut</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* ── Section: Price Difference ── */}
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 2.5, mb: 1 }}>
                Price Difference / د قیمت توپیر
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Price Difference / د قیمت توپیر" type="number" value={formData.priceDifference}
                    onChange={(e) => setFormData({ ...formData, priceDifference: e.target.value })}
                    InputProps={{ endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Difference Paid By</InputLabel>
                    <Select value={formData.priceDifferencePaidBy} label="Difference Paid By"
                      onChange={(e) => setFormData({ ...formData, priceDifferencePaidBy: e.target.value })}>
                      <MenuItem value="Buyer">Buyer (خریدار)</MenuItem>
                      <MenuItem value="Seller">Seller (خرخونکي)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </>
          )}

          {/* ── Licensed Car: Traffic Transfer Date ── */}
          {formData.saleType === 'Licensed Car' && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                License / Document Info (اسناد)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Traffic Transfer Date / د ترافیک تبدیل نیټه" type="date"
                    value={formData.trafficTransferDate}
                    onChange={(e) => setFormData({ ...formData, trafficTransferDate: e.target.value })}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* ── Payment Info ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Payment Info / مالي معلومات
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Selling Price / قیمت" type="number" value={formData.sellingPrice}
                onChange={(e) => {
                  const price = parseFloat(e.target.value) || 0;
                  const down = parseFloat(formData.downPayment) || 0;
                  setFormData({ ...formData, sellingPrice: e.target.value, remainingAmount: Math.max(price - down, 0).toString() });
                  if (errors.sellingPrice) setErrors({ ...errors, sellingPrice: '' });
                }}
                error={!!errors.sellingPrice} helperText={errors.sellingPrice} required
                InputProps={{ endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Down Payment / پیشکي" type="number" value={formData.downPayment}
                onChange={(e) => {
                  const down = parseFloat(e.target.value) || 0;
                  const price = parseFloat(formData.sellingPrice) || 0;
                  setFormData({ ...formData, downPayment: e.target.value, remainingAmount: Math.max(price - down, 0).toString() });
                  if (errors.downPayment) setErrors({ ...errors, downPayment: '' });
                }}
                error={!!errors.downPayment} helperText={errors.downPayment} required
                InputProps={{ endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Remaining / پاتي" type="number" value={formData.remainingAmount} disabled
                InputProps={{ endAdornment: <InputAdornment position="end">{getCurrencySymbol('AFN')}</InputAdornment> }}
                sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* ── Notes & Witnesses ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Notes & Witnesses / یادښت او شاهدان
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Note 1 / لومړۍ یادښت" multiline rows={2} value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Note 2 / دوهمه یادښت" multiline rows={2} value={formData.note2}
                onChange={(e) => setFormData({ ...formData, note2: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Witness 1 / لومړی شاهد" size="small" value={formData.witnessName1}
                onChange={(e) => setFormData({ ...formData, witnessName1: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Witness 2 / دوهم شاهد" size="small" value={formData.witnessName2}
                onChange={(e) => setFormData({ ...formData, witnessName2: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? <Edit /> : <PointOfSale />}
            sx={{ bgcolor: SALE_TYPES.find(st => st.value === formData.saleType)?.color || theme.palette.primary.main }}>
            {editingId ? 'Update Sale' : 'Record Sale'}
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
                  Sale #{detailSale?.saleId || detailSale?.id}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {detailSale?.vehicle?.manufacturer} {detailSale?.vehicle?.model} → {detailSale?.customer?.fullName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDetailOpen(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>

        <Tabs value={detailTab} onChange={(e, v) => setDetailTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Sale Info" />
          <Tab label="Seller & Vehicle" />
          <Tab label="Profit & Commission" />
          <Tab label="Commission Distribution" />
          <Tab label="Payment History" />
        </Tabs>

        <DialogContent sx={{ minHeight: 300, pt: 2 }}>
          {/* Tab 0: Sale Info */}
          {detailTab === 0 && detailSale && (
            <Grid container spacing={2}>
              {/* Sale Type Badge */}
              <Grid item xs={12}>
                {(() => {
                  const st = SALE_TYPES.find(t => t.value === detailSale.saleType);
                  return st ? (
                    <Chip icon={st.icon} label={`${st.label} — ${st.pashto}`} sx={{ bgcolor: alpha(st.color, 0.1), color: st.color, fontWeight: 700, fontSize: '0.85rem', py: 2 }} />
                  ) : null;
                })()}
              </Grid>
              {/* Payment Status Banner */}
              {parseFloat(detailSale.remainingAmount) > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`, mb: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="warning.main">
                          {detailSale.paymentStatus === 'Partial' ? 'Partial Payment' : 'Payment Pending'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Paid: {formatCurrency(detailSale.paidAmount || detailSale.downPayment || 0)} — Remaining: {formatCurrency(detailSale.remainingAmount)}
                        </Typography>
                      </Box>
                      <Button size="small" variant="contained" color="success" startIcon={<CreditScore />}
                        onClick={() => { setDetailOpen(false); openPaymentDialog(detailSale); }}>
                        Record Payment
                      </Button>
                    </Box>
                    <LinearProgress variant="determinate" sx={{ mt: 1.5, borderRadius: 1, height: 6 }}
                      value={Math.min(((Number(detailSale.paidAmount || detailSale.downPayment || 0)) / Number(detailSale.sellingPrice || 1)) * 100, 100)}
                      color="warning" />
                  </Card>
                </Grid>
              )}
              {[
                ['Sale ID', detailSale.saleId || detailSale.id],
                ['Vehicle', `${detailSale.vehicle?.manufacturer || ''} ${detailSale.vehicle?.model || ''} (${detailSale.vehicle?.year || ''})`],
                ['Customer', detailSale.customer?.fullName],
                ['Sale Date', detailSale.saleDate ? new Date(detailSale.saleDate).toLocaleDateString() : '-'],
                ['Selling Price', formatCurrency(detailSale.sellingPrice || 0)],
                ['Down Payment', formatCurrency(detailSale.downPayment || 0)],
                ['Paid So Far', formatCurrency(detailSale.paidAmount || detailSale.downPayment || 0)],
                ['Remaining', formatCurrency(detailSale.remainingAmount || 0)],
                ['Payment Status', detailSale.paymentStatus || 'Pending'],
                ...(detailSale.saleType === 'Licensed Car' && detailSale.trafficTransferDate
                  ? [['Traffic Transfer Date', new Date(detailSale.trafficTransferDate).toLocaleDateString()]]
                  : []),
                ...(detailSale.saleType === 'Exchange Car' && detailSale.priceDifference
                  ? [['Price Difference', `${formatCurrency(detailSale.priceDifference||0)} (${detailSale.priceDifferencePaidBy || 'Buyer'})`]]
                  : []),
                ['Notes', detailSale.notes],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  {label === 'Payment Status' ? (
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
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Seller Info (رانبوونکي)</Typography>
                {[
                  ['Name', detailSale.sellerName], ['Father Name', detailSale.sellerFatherName],
                  ['Province', detailSale.sellerProvince], ['District', detailSale.sellerDistrict],
                  ['Village', detailSale.sellerVillage], ['Address', detailSale.sellerAddress],
                  ['ID Number', detailSale.sellerIdNumber], ['Phone', detailSale.sellerPhone],
                ].map(([l, v]) => (
                  <Box key={l} mb={0.5}>
                    <Typography variant="caption" color="text.secondary">{l}</Typography>
                    <Typography variant="body2" fontWeight={600}>{v || '-'}</Typography>
                  </Box>
                ))}
              </Grid>
              {detailSale.saleType === 'Exchange Car' && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Exchange Vehicle (د تبادلي موټر)</Typography>
                  {detailSale.exchangeVehicleId && (
                    <Chip label="✓ Added to Inventory" size="small" color="success" sx={{ mb: 1 }} />
                  )}
                  {[
                    ['Category', detailSale.exchVehicleCategory],
                    ['Manufacturer', detailSale.exchVehicleManufacturer],
                    ['Model', detailSale.exchVehicleModel],
                    ['Year', detailSale.exchVehicleYear],
                    ['Color', detailSale.exchVehicleColor],
                    ['Chassis', detailSale.exchVehicleChassis],
                    ['Engine No', detailSale.exchVehicleEngine],
                    ['Engine Type', detailSale.exchVehicleEngineType],
                    ['Fuel', detailSale.exchVehicleFuelType],
                    ['Transmission', detailSale.exchVehicleTransmission],
                    ['Mileage', detailSale.exchVehicleMileage],
                    ['Plate', detailSale.exchVehiclePlateNo],
                    ['License', detailSale.exchVehicleLicense],
                    ['Steering', detailSale.exchVehicleSteering],
                    ['Monolithic/Cut', detailSale.exchVehicleMonolithicCut],
                  ].map(([l, v]) => (
                    <Box key={l} mb={0.5}>
                      <Typography variant="caption" color="text.secondary">{l}</Typography>
                      <Typography variant="body2" fontWeight={600}>{v || '-'}</Typography>
                    </Box>
                  ))}
                </Grid>
              )}
              {detailSale.witnessName1 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">Witnesses:</Typography>
                  <Typography variant="body2">{detailSale.witnessName1}{detailSale.witnessName2 ? ` , ${detailSale.witnessName2}` : ''}</Typography>
                </Grid>
              )}
            </Grid>
          )}

          {/* Tab 2: Profit & Commission */}
          {detailTab === 2 && detailSale && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary">Total Cost</Typography>
                  <Typography variant="h5" fontWeight={700} color="info.main">
                    {formatCurrency(detailSale.totalCost || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary">Profit</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {formatCurrency(detailSale.profit || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary">Shared with Partners</Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    {formatCurrency(detailSale.commission || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                  <Typography variant="caption" color="text.secondary">Owner's Share</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatCurrency(detailSale.ownerShare || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}` }}>
                  <Typography variant="caption" color="text.secondary">Selling Price</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(detailSale.sellingPrice || 0)}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Commission Distribution */}
          {detailTab === 3 && (
            commissionDist.length > 0 ? (
              <>
                <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Person</strong></TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Share %</strong></TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Amount</strong></TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {commissionDist.map((cd) => (
                        <TableRow key={cd.id}>
                          <TableCell><strong>{cd.personName}</strong></TableCell>
                          <TableCell align="right">{cd.sharePercentage}%</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>{formatCurrency(cd.amount || 0)}</TableCell>
                          <TableCell>
                            <Chip label={cd.status || 'Pending'} size="small"
                              color={cd.status === 'Paid' ? 'success' : 'warning'} />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell><strong>Owner (Remaining)</strong></TableCell>
                        <TableCell align="right">
                          <strong>{(100 - commissionDist.reduce((s, c) => s + Number(c.sharePercentage || 0), 0)).toFixed(2)}%</strong>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                          {formatCurrency(detailSale.ownerShare || 0)}
                        </TableCell>
                        <TableCell>
                          <Chip label="Owner" size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    💡 Profit Distribution Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Total Profit</Typography>
                      <Typography variant="h6" fontWeight={700}>{formatCurrency(detailSale.profit || 0)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Shared with Partners</Typography>
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
                <Typography variant="body2" mt={1}>No sharing persons — all profit goes to the owner</Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2, maxWidth: 300, mx: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">Owner receives 100% of profit</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main" mt={1}>
                    {formatCurrency(detailSale.profit || 0)}
                  </Typography>
                </Box>
              </Box>
            )
          )}

          {/* Tab 4: Payment History */}
          {detailTab === 4 && detailSale && <PaymentHistoryTab saleId={detailSale.id} theme={theme} />}
        </DialogContent>
      </Dialog>

      {/* ═══════ RECORD PAYMENT DIALOG ═══════ */}
      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWallet color="success" />
            <Box>
              <Typography variant="h6" fontWeight={700}>Record Payment</Typography>
              <Typography variant="caption" color="text.secondary">
                {paymentSale?.vehicle?.manufacturer} {paymentSale?.vehicle?.model} → {paymentSale?.customer?.fullName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Payment progress */}
          {paymentSale && (
            <Card sx={{ mb: 2.5, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${theme.palette.divider}` }}>
              <Grid container spacing={1.5}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Selling Price</Typography>
                  <Typography variant="body1" fontWeight={700}>{formatCurrency(paymentSale.sellingPrice || 0)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Paid So Far</Typography>
                  <Typography variant="body1" fontWeight={700} color="success.main">
                    {formatCurrency(paymentSale.paidAmount || paymentSale.downPayment || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Remaining</Typography>
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
                    {Math.round(((Number(paymentSale.paidAmount || paymentSale.downPayment || 0)) / Number(paymentSale.sellingPrice || 1)) * 100)}% paid
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          )}

          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            💰 New Installment Payment
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Payment Amount" type="number" value={paymentForm.amount} required
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder={`Max: ${Number(paymentSale?.remainingAmount || 0).toLocaleString()}`}
                InputProps={{ endAdornment: <InputAdornment position="end">؋</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Payment Date" type="date" value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Note (optional)" value={paymentForm.note}
                onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                placeholder="e.g. 2nd installment payment..."
              />
            </Grid>
            {/* Quick amount buttons */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Quick amounts:</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {paymentSale && [
                  { label: 'Pay Full', value: Number(paymentSale.remainingAmount || 0) },
                  { label: '½ Remaining', value: Math.round(Number(paymentSale.remainingAmount || 0) / 2) },
                  { label: '⅓ Remaining', value: Math.round(Number(paymentSale.remainingAmount || 0) / 3) },
                ].filter(b => b.value > 0).map((btn) => (
                  <Chip key={btn.label} label={`${btn.label} (${btn.value.toLocaleString()})`} variant="outlined" size="small"
                    onClick={() => setPaymentForm({ ...paymentForm, amount: btn.value.toString() })}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) } }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Payment History in this dialog */}
          {paymentHistory.length > 0 && (
            <Box mt={3}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                📜 Payment History ({paymentHistory.length} payment{paymentHistory.length > 1 ? 's' : ''})
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '40vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><b>#</b></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><b>Type</b></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><b>Amount</b></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><b>Date</b></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><b>Note</b></TableCell>
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
          <Button onClick={() => setPaymentOpen(false)}>Close</Button>
          <Button variant="contained" color="success" onClick={handleRecordPayment} disabled={paymentLoading}
            startIcon={<CreditScore />}>
            {paymentLoading ? 'Processing...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Payment History Tab Component (for detail dialog) ───
function PaymentHistoryTab({ saleId, theme }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(`/sales/${saleId}/payments`);
        setPayments(res.data.data || []);
        setSummary(res.data.summary || null);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [saleId]);

  if (loading) return <Box textAlign="center" py={4}><Typography color="text.secondary">Loading...</Typography></Box>;

  return (
    <Box>
      {summary && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">Selling Price</Typography>
              <Typography variant="body1" fontWeight={700}>{Number(summary.sellingPrice).toLocaleString()} ؋</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.06), border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">Total Paid</Typography>
              <Typography variant="body1" fontWeight={700} color="success.main">{Number(summary.paidAmount).toLocaleString()} ؋</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.06), border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">Remaining</Typography>
              <Typography variant="body1" fontWeight={700} color="error.main">{Number(summary.remainingAmount).toLocaleString()} ؋</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">Status</Typography>
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}><b>Type</b></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><b>Amount</b></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><b>Date</b></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><b>Note</b></TableCell>
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
          <Typography variant="body2" color="text.secondary" mt={1}>No payments recorded yet</Typography>
        </Box>
      )}
    </Box>
  );
}
