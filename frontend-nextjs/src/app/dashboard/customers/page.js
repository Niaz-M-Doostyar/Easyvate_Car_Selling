'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Tooltip,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, useTheme, alpha, Divider,
} from '@mui/material';
import {
  Add, Search, Person, Phone, Email, Badge, LocationOn, Close,
  AccountBalance, TrendingUp, TrendingDown, Visibility, AttachMoney,
  Receipt, Edit,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import { validateEmail, validatePhone, validateRequired, validateNationalId } from '@/utils/validation';
import { getCurrencySymbol } from '@/utils/currency';
import EnhancedDataTable from '@/components/EnhancedDataTable';

const CUSTOMER_TYPES = [
  { value: 'Buyer', label: '🛒 Buyer', color: 'primary' },
  { value: 'Investor', label: '💰 Investor', color: 'success' },
  { value: 'Borrower', label: '📋 Borrower', color: 'warning' },
];

const CREDIT_LEDGER_TYPES = ['Received', 'Installment', 'Loan Payment', 'Investment', 'Profit Share'];

const LEDGER_TYPES = [
  { value: 'Received', label: '💵 Received (Credit)' },
  { value: 'Paid', label: '💸 Paid (Debit)' },
  { value: 'Investment', label: '💰 Investment' },
  { value: 'Profit Share', label: '🤝 Partner Profit Share' },
  { value: 'Loan', label: '📋 Loan' },
  { value: 'Loan Payment', label: '💳 Loan Payment' },
  { value: 'Installment', label: '📅 Installment Payment' },
];

const AFGHAN_PROVINCES = [
  'Badakhshan', 'Badghis', 'Baghlan', 'Balkh', 'Bamyan', 'Daykundi', 'Farah', 'Faryab',
  'Ghazni', 'Ghor', 'Helmand', 'Herat', 'Jowzjan', 'Kabul', 'Kandahar', 'Kapisa',
  'Khost', 'Kunar', 'Kunduz', 'Laghman', 'Logar', 'Nangarhar', 'Nimruz', 'Nuristan',
  'Paktia', 'Paktika', 'Panjshir', 'Parwan', 'Samangan', 'Sar-e Pol', 'Takhar', 'Urozgan', 'Wardak', 'Zabul'
];

export default function CustomersPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', fatherName: '', phoneNumber: '', currentAddress: '', originalAddress: '',
    province: '', district: '', village: '', nationalIdNumber: '', customerType: 'Buyer',
  });

  // Detail / Ledger
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);

  // Ledger entry form
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({
    type: 'Received', amount: '', currency: 'AFN', purpose: '', date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch customers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const [ledgerRes, historyRes] = await Promise.all([
        apiClient.get(`/customers/${customerId}/ledger`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/customers/${customerId}/history`).catch(() => ({ data: { data: [], sales: [] } })),
      ]);
      setLedgerEntries(ledgerRes.data.data || ledgerRes.data || []);
      setCustomerHistory(historyRes.data.sales || historyRes.data.data || []);
    } catch {
      setLedgerEntries([]);
      setCustomerHistory([]);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!validateRequired(formData.fullName)) newErrors.fullName = 'Full name is required';
    if (!validateRequired(formData.fatherName)) newErrors.fatherName = 'Father name is required';
    if (!validateRequired(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number is required';
    else if (!validatePhone(formData.phoneNumber)) newErrors.phoneNumber = 'Invalid phone format';
    if (!validateRequired(formData.currentAddress)) newErrors.currentAddress = 'Current address is required';
    if (!validateRequired(formData.originalAddress)) newErrors.originalAddress = 'Original address is required';
    if (!validateRequired(formData.province)) newErrors.province = 'Province is required';
    if (!validateRequired(formData.district)) newErrors.district = 'District is required';
    if (!validateRequired(formData.nationalIdNumber)) newErrors.nationalIdNumber = 'National ID number is required';
    else if (!validateNationalId(formData.nationalIdNumber)) newErrors.nationalIdNumber = 'National ID must be 10-15 digits';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      enqueueSnackbar('Please fix validation errors', { variant: 'error' });
      return;
    }

    try {
      if (editingId) {
        await apiClient.put(`/customers/${editingId}`, formData);
        enqueueSnackbar('Customer updated successfully', { variant: 'success' });
      } else {
        await apiClient.post('/customers', formData);
        enqueueSnackbar('Customer added successfully', { variant: 'success' });
      }
      setOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to save customer', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      enqueueSnackbar('Customer deleted successfully', { variant: 'success' });
      fetchCustomers();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete customer', { variant: 'error' });
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      fullName: customer.fullName || '', fatherName: customer.fatherName || '',
      phoneNumber: customer.phoneNumber || '', currentAddress: customer.currentAddress || '',
      originalAddress: customer.originalAddress || '', province: customer.province || '',
      district: customer.district || '', village: customer.village || '',
      nationalIdNumber: customer.nationalIdNumber || '',
      customerType: customer.customerType || 'Buyer',
    });
    setEditingId(customer.id);
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({ fullName: '', fatherName: '', phoneNumber: '', currentAddress: '', originalAddress: '', province: '', district: '', village: '', nationalIdNumber: '', customerType: 'Buyer' });
    setErrors({});
    setEditingId(null);
  };

  const handleViewDetails = (customer) => {
    setDetailCustomer(customer);
    setDetailTab(0);
    fetchCustomerDetails(customer.id);
    setDetailOpen(true);
  };

  const handleAddLedgerEntry = async () => {
    if (!ledgerForm.amount || parseFloat(ledgerForm.amount) <= 0) {
      enqueueSnackbar('Please enter a valid amount', { variant: 'error' });
      return;
    }
    try {
      await apiClient.post(`/customers/${detailCustomer.id}/ledger`, {
        ...ledgerForm,
        amount: parseFloat(ledgerForm.amount),
      });
      enqueueSnackbar('Ledger entry added successfully', { variant: 'success' });
      setLedgerOpen(false);
      setLedgerForm({ type: 'Received', amount: '', currency: 'AFN', purpose: '', date: new Date().toISOString().split('T')[0] });
      fetchCustomerDetails(detailCustomer.id);
      fetchCustomers(); // Refresh balances
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to add ledger entry', { variant: 'error' });
    }
  };

  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (typeFilter) result = result.filter((c) => c.customerType === typeFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) =>
        c.fullName?.toLowerCase().includes(term) ||
        c.fatherName?.toLowerCase().includes(term) ||
        c.phoneNumber?.includes(term) ||
        c.nationalIdNumber?.toLowerCase().includes(term) ||
        c.province?.toLowerCase().includes(term) ||
        c.district?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [customers, searchTerm, typeFilter]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Customer Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage customers, ledger accounts, and relationships
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Add Customer
        </Button>
      </Box>

      {/* Search + Filter */}
      <Card sx={{ mb: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField fullWidth placeholder="Search by name, father name, phone, national ID, province, or district..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select value={typeFilter} label="Customer Type" onChange={(e) => setTypeFilter(e.target.value)}>
                  <MenuItem value="">All Types</MenuItem>
                  {CUSTOMER_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <EnhancedDataTable
        columns={[
          { id: 'fullName', label: 'Full Name', bold: true },
          { id: 'fatherName', label: 'Father Name', hiddenOnMobile: true },
          { id: 'customerType', label: 'Type', format: (val) => {
            const ct = CUSTOMER_TYPES.find((t) => t.value === val);
            return <Chip label={val || 'Buyer'} size="small" color={ct?.color || 'default'} />;
          }},
          { id: 'phoneNumber', label: 'Phone' },
          { id: 'nationalIdNumber', label: 'National ID', hiddenOnMobile: true },
          { id: 'province', label: 'Province', hiddenOnMobile: true },
          { id: 'district', label: 'District', hiddenOnMobile: true },
          { id: 'balance', label: 'Balance', align: 'right', bold: true, format: (val) => {
            const num = parseFloat(val) || 0;
            return (
              <Typography variant="body2" fontWeight={700} color={num > 0 ? 'success.main' : num < 0 ? 'error.main' : 'text.primary'}>
                {num.toLocaleString()} ؋
              </Typography>
            );
          }},
          { id: '_actions', label: '', align: 'center', format: (val, row) => (
            <Tooltip title="View Ledger & Details">
              <IconButton size="small" onClick={() => handleViewDetails(row)}><Visibility fontSize="small" /></IconButton>
            </Tooltip>
          )},
        ]}
        data={filteredCustomers}
        onEdit={handleEdit}
        loading={loading}
        emptyMessage={searchTerm || typeFilter ? 'No customers match your filters.' : 'No customers yet. Add your first customer!'}
      />

      {/* ═══════ ADD / EDIT CUSTOMER DIALOG ═══════ */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Person color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Customer' : 'Add New Customer'}</Typography>
              <Typography variant="caption" color="text.secondary">Enter customer profile information</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" placeholder="Ahmad Khan" value={formData.fullName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\p{L}\s]/gu, ''); // Allow Unicode letters (Pashto/Dari/English) and spaces
                  setFormData({ ...formData, fullName: value });
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                error={!!errors.fullName} helperText={errors.fullName} required
                InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Father Name" placeholder="Mohammad Khan" value={formData.fatherName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\p{L}\s]/gu, ''); // Allow Unicode letters (Pashto/Dari/English) and spaces
                  setFormData({ ...formData, fatherName: value });
                  if (errors.fatherName) setErrors({ ...errors, fatherName: '' });
                }}
                error={!!errors.fatherName} helperText={errors.fatherName} required
                InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" placeholder="+93701234567" value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d+\-\s()]/g, ''); // Only allow digits, +, -, spaces, parentheses
                  if (value.length <= 20) { // Reasonable limit for phone numbers
                    setFormData({ ...formData, phoneNumber: value });
                    if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
                  }
                }}
                error={!!errors.phoneNumber} helperText={errors.phoneNumber || 'Format: +93XXXXXXXXX'} required
                inputProps={{ inputMode: 'tel' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="National ID Number" placeholder="123456789012345" value={formData.nationalIdNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                  if (value.length <= 15) { // Limit to 15 digits
                    setFormData({ ...formData, nationalIdNumber: value });
                    if (errors.nationalIdNumber) setErrors({ ...errors, nationalIdNumber: '' });
                  }
                }}
                error={!!errors.nationalIdNumber} helperText={errors.nationalIdNumber || 'Enter 10-15 digits'} required
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.province}>
                <InputLabel>Province *</InputLabel>
                <Select
                  value={formData.province}
                  label="Province *"
                  onChange={(e) => {
                    setFormData({ ...formData, province: e.target.value });
                    if (errors.province) setErrors({ ...errors, province: '' });
                  }}
                >
                  {AFGHAN_PROVINCES.map((province) => (
                    <MenuItem key={province} value={province}>{province}</MenuItem>
                  ))}
                </Select>
                {errors.province && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{errors.province}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="District" placeholder="District 1" value={formData.district}
                onChange={(e) => { setFormData({ ...formData, district: e.target.value }); if (errors.district) setErrors({ ...errors, district: '' }); }}
                error={!!errors.district} helperText={errors.district} required
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Village" placeholder="Village name (optional)" value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select value={formData.customerType} label="Customer Type" onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}>
                  {CUSTOMER_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Current Address" placeholder="Current residential address" value={formData.currentAddress}
                onChange={(e) => { setFormData({ ...formData, currentAddress: e.target.value }); if (errors.currentAddress) setErrors({ ...errors, currentAddress: '' }); }}
                error={!!errors.currentAddress} helperText={errors.currentAddress} required multiline rows={2}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Original Address" placeholder="Original/permanent address" value={formData.originalAddress}
                onChange={(e) => { setFormData({ ...formData, originalAddress: e.target.value }); if (errors.originalAddress) setErrors({ ...errors, originalAddress: '' }); }}
                error={!!errors.originalAddress} helperText={errors.originalAddress} required multiline rows={2}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? <Edit /> : <Add />}>
            {editingId ? 'Update Customer' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════ CUSTOMER DETAIL + LEDGER DIALOG ═══════ */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Person color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={700}>{detailCustomer?.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {detailCustomer?.customerType || 'Buyer'} • {detailCustomer?.phoneNumber}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1} alignItems="center">
              <Chip
                label={`Balance: ${(parseFloat(detailCustomer?.balance) || 0).toLocaleString()} ؋`}
                color={parseFloat(detailCustomer?.balance) >= 0 ? 'success' : 'error'}
                size="small"
              />
              <IconButton onClick={() => setDetailOpen(false)}><Close /></IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Tabs value={detailTab} onChange={(e, v) => setDetailTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Profile" />
          <Tab label="Ledger (Credit / Debit)" />
          <Tab label="Purchase History" />
        </Tabs>

        <DialogContent sx={{ minHeight: 350, pt: 2 }}>
          {/* Tab 0: Profile */}
          {detailTab === 0 && detailCustomer && (
            <Grid container spacing={2}>
              {[
                ['Full Name', detailCustomer.fullName],
                ['Father Name', detailCustomer.fatherName],
                ['Customer Type', detailCustomer.customerType || 'Buyer'],
                ['Phone', detailCustomer.phoneNumber],
                ['National ID Number', detailCustomer.nationalIdNumber],
                ['Province', detailCustomer.province],
                ['District', detailCustomer.district],
                ['Village', detailCustomer.village],
                ['Current Address', detailCustomer.currentAddress],
                ['Original Address', detailCustomer.originalAddress],
                ['Balance', `${(parseFloat(detailCustomer.balance) || 0).toLocaleString()} ؋`],
                ['Joined', detailCustomer.createdAt ? new Date(detailCustomer.createdAt).toLocaleDateString() : '-'],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value || '-'}</Typography>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 1: Ledger */}
          {detailTab === 1 && (
            <>
              {/* Summary cards */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.08), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                    <Typography variant="caption" color="text.secondary">Total Owed (Sales + Loans)</Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main">
                      {ledgerEntries.filter((e) => ['Sale', 'Loan'].includes(e.type)).reduce((s, e) => s + (parseFloat(e.amountInPKR || e.amount) || 0), 0).toLocaleString()} ؋
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                    <Typography variant="caption" color="text.secondary">Total Credit (Payments + Profit)</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      {ledgerEntries.filter((e) => CREDIT_LEDGER_TYPES.includes(e.type)).reduce((s, e) => s + (parseFloat(e.amountInPKR || e.amount) || 0), 0).toLocaleString()} ؋
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ p: 1.5, bgcolor: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                    <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                    <Typography variant="h6" fontWeight={700} color={(parseFloat(detailCustomer?.balance) || 0) >= 0 ? 'success.main' : 'error.main'}>
                      {(parseFloat(detailCustomer?.balance) || 0).toLocaleString()} ؋
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setLedgerOpen(true)}>
                  Add Ledger Entry
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Date</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Type</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Purpose</strong></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Debit</strong></TableCell>
                      <TableCell align="right"><strong>Credit</strong></TableCell>
                      <TableCell align="right"><strong>Balance</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledgerEntries.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>No ledger entries yet</TableCell></TableRow>
                    ) : ledgerEntries.map((entry) => {
                      const isCredit = CREDIT_LEDGER_TYPES.includes(entry.type);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={entry.type}
                              size="small"
                              color={isCredit ? 'success' : 'error'}
                              variant="outlined"
                              icon={isCredit ? <TrendingUp /> : <TrendingDown />}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.purpose || '-'}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                            {!isCredit ? `${Number(entry.amount).toLocaleString()} ${entry.currency || 'AFN'}` : ''}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {isCredit ? `${Number(entry.amount).toLocaleString()} ${entry.currency || 'AFN'}` : ''}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: (entry.balance != null && Number(entry.balance) < 0) ? 'error.main' : 'success.main' }}>
                            {entry.balance != null ? `${Number(entry.balance).toLocaleString()} ؋` : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Tab 2: Purchase History */}
          {detailTab === 2 && (
            customerHistory.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Sale ID</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Vehicle</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Date</strong></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Price</strong></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Paid</strong></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Remaining</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerHistory.map((sale) => {
                      const remaining = parseFloat(sale.remainingAmount) || 0;
                      const status = sale.paymentStatus || (remaining > 0 ? 'Partial' : 'Paid');
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.saleId || sale.id}</TableCell>
                          <TableCell>{sale.vehicle ? `${sale.vehicle.manufacturer} ${sale.vehicle.model}` : '-'}</TableCell>
                          <TableCell>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{sale.sellingPrice ? Number(sale.sellingPrice).toLocaleString() : '-'} ؋</TableCell>
                          <TableCell align="right" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                            {Number(sale.paidAmount || sale.downPayment || 0).toLocaleString()} ؋
                          </TableCell>
                          <TableCell align="right" sx={{ color: remaining > 0 ? theme.palette.error.main : theme.palette.success.main, fontWeight: 600 }}>
                            {remaining > 0 ? `${remaining.toLocaleString()} ؋` : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip label={status} size="small"
                              color={status === 'Paid' ? 'success' : status === 'Partial' ? 'warning' : 'error'} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={4} color="text.secondary">
                <Receipt sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" mt={1}>No purchase history for this customer</Typography>
              </Box>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════ ADD LEDGER ENTRY DIALOG ═══════ */}
      <Dialog open={ledgerOpen} onClose={() => setLedgerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalance color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>Add Ledger Entry</Typography>
              <Typography variant="caption" color="text.secondary">Record a transaction for {detailCustomer?.fullName}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select value={ledgerForm.type} label="Transaction Type" onChange={(e) => setLedgerForm({ ...ledgerForm, type: e.target.value })}>
                  {LEDGER_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <TextField fullWidth label="Amount" type="number" placeholder="0" value={ledgerForm.amount}
                onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })} required
                InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(ledgerForm.currency)}</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select value={ledgerForm.currency} label="Currency" onChange={(e) => setLedgerForm({ ...ledgerForm, currency: e.target.value })}>
                  <MenuItem value="AFN">🇦🇫 ؋ AFN</MenuItem>
                  <MenuItem value="USD">🇺🇸 $ USD</MenuItem>
                  <MenuItem value="PKR">🇵🇰 ₨ PKR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Purpose / Description" placeholder="e.g. Down payment for Toyota..." value={ledgerForm.purpose}
                onChange={(e) => setLedgerForm({ ...ledgerForm, purpose: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Date" type="date" value={ledgerForm.date}
                onChange={(e) => setLedgerForm({ ...ledgerForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setLedgerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLedgerEntry} startIcon={<Add />}>Add Entry</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
