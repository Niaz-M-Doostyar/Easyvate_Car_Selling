'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem,
  Chip, useTheme, alpha, TextField, Button, Tabs, Tab, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  Assessment, TrendingUp, TrendingDown, AccountBalance, DirectionsCar, People,
  PictureAsPdf, CalendarMonth, BarChart, PieChart, ShowChart, MonetizationOn,
  AttachMoney, Receipt, Download, Refresh,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

const REPORT_TYPES = [
  { value: 'sales', label: 'Sales Report', icon: <ShowChart />, desc: 'Vehicle sales, revenue, and profit analysis' },
  { value: 'financial', label: 'Financial Report', icon: <AccountBalance />, desc: 'Income, expenses, and showroom ledger' },
  { value: 'vehicles', label: 'Vehicle Inventory', icon: <DirectionsCar />, desc: 'Vehicle stock, status, and pipeline' },
  { value: 'profit-loss', label: 'Profit & Loss', icon: <BarChart />, desc: 'Revenue, costs, and net profit breakdown' },
  { value: 'commission', label: 'Commission Report', icon: <MonetizationOn />, desc: 'Commission distribution by person' },
  { value: 'daily', label: 'Daily Summary', icon: <CalendarMonth />, desc: 'Daily snapshot of operations' },
  { value: 'monthly', label: 'Monthly Trends', icon: <TrendingUp />, desc: 'Monthly aggregated performance' },
];

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

function getDateRange(period) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  switch (period) {
    case 'today': return { startDate: new Date(y, m, d).toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) };
    case 'week': { const w = new Date(y, m, d - now.getDay()); return { startDate: w.toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) }; }
    case 'month': return { startDate: new Date(y, m, 1).toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) };
    case 'quarter': return { startDate: new Date(y, m - (m % 3), 1).toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) };
    case 'year': return { startDate: new Date(y, 0, 1).toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) };
    default: return { startDate: '', endDate: '' };
  }
}

function SummaryCard({ label, value, color, icon, theme }) {
  return (
    <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
      <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color, mt: 0.5 }}>{value}</Typography>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(color, 0.1), color, display: 'flex' }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (period !== 'custom') {
      const range = getDateRange(period);
      setDateFrom(range.startDate);
      setDateTo(range.endDate);
    }
  }, [period]);

  useEffect(() => { fetchReport(); }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    setReportData(null);
    setSummary(null);
    try {
      const params = {};
      if (reportType === 'monthly') {
        params.year = monthlyYear;
      } else if (reportType === 'daily') {
        params.date = dailyDate;
      } else {
        if (dateFrom) params.startDate = dateFrom;
        if (dateTo) params.endDate = dateTo;
      }

      const res = await apiClient.get(`/reports/${reportType}`, { params });
      setReportData(res.data.data || []);
      setSummary(res.data.summary || res.data.data || null);
    } catch (err) {
      enqueueSnackbar(`Failed to load ${reportType} report`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const res = await apiClient.get('/reports/export-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      enqueueSnackbar('Report exported successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to export PDF', { variant: 'error' });
    }
  };

  // ─── SALES REPORT ─────────────────────────────
  const renderSalesReport = () => {
    if (!summary || !reportData) return null;
    const cards = [
      { label: 'Total Sales', value: summary.totalSales, color: theme.palette.primary.main, icon: <Receipt /> },
      { label: 'Revenue', value: formatCurrency(summary.totalRevenue), color: theme.palette.success.main, icon: <TrendingUp /> },
      { label: 'Total Profit', value: formatCurrency(summary.totalProfit), color: theme.palette.info.main, icon: <ShowChart /> },
      { label: 'Commission Paid', value: formatCurrency(summary.totalCommission), color: theme.palette.warning.main, icon: <MonetizationOn /> },
    ];
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((c) => <Grid item xs={6} md={3} key={c.label}><SummaryCard {...c} theme={theme} /></Grid>)}
        </Grid>
        <EnhancedDataTable
          title="Sales Details" data={Array.isArray(reportData) ? reportData : []} loading={false}
          columns={[
            { id: 'vehicle', label: 'Vehicle', format: (_, row) => row.vehicle ? `${row.vehicle.manufacturer} ${row.vehicle.model}` : '-' },
            { id: 'customer', label: 'Customer', format: (_, row) => row.customer?.name || '-' },
            { id: 'sellingPrice', label: 'Selling Price', format: (v) => formatCurrency(v), bold: true },
            { id: 'profit', label: 'Profit', format: (v) => <Typography variant="body2" color="success.main" fontWeight={600}>{formatCurrency(v)}</Typography> },
            { id: 'commission', label: 'Commission', format: (v) => formatCurrency(v) },
            { id: 'saleDate', label: 'Date', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
          ]}
          emptyMessage="No sales in selected period"
        />
      </>
    );
  };

  // ─── FINANCIAL REPORT ──────────────────────────
  const renderFinancialReport = () => {
    if (!summary || !reportData) return null;
    const cards = [
      { label: 'Total Income', value: formatCurrency(summary.totalIncome), color: theme.palette.success.main, icon: <TrendingUp /> },
      { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses), color: theme.palette.error.main, icon: <TrendingDown /> },
      { label: 'Net Profit', value: formatCurrency(summary.netProfit), color: theme.palette.info.main, icon: <AccountBalance /> },
      { label: 'Transactions', value: summary.transactionCount, color: theme.palette.warning.main, icon: <Receipt /> },
    ];
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((c) => <Grid item xs={6} md={3} key={c.label}><SummaryCard {...c} theme={theme} /></Grid>)}
        </Grid>
        <EnhancedDataTable
          title="Financial Transactions" data={Array.isArray(reportData) ? reportData : []} loading={false}
          columns={[
            { id: 'type', label: 'Type', format: (v) => <Chip label={v} size="small" color={['Income', 'Vehicle Sale'].includes(v) ? 'success' : 'error'} variant="outlined" />, exportFormat: (v) => v },
            { id: 'personName', label: 'Person', format: (v) => v || '-' },
            { id: 'amount', label: 'Amount', format: (v, row) => `${Number(v).toLocaleString()} ${row.currency || 'AFN'}`, bold: true },
            { id: 'amountInPKR', label: 'In AFN', format: (v) => `${Number(v).toLocaleString()}` },
            { id: 'description', label: 'Description', format: (v) => v || '-' },
            { id: 'date', label: 'Date', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
          ]}
          emptyMessage="No transactions in selected period"
        />
      </>
    );
  };

  // ─── VEHICLE INVENTORY REPORT ──────────────────
  const renderVehicleReport = () => {
    if (!summary || !reportData) return null;
    const statusColors = { Available: 'success', Sold: 'default', Reserved: 'warning', Coming: 'info', 'Under Repair': 'error' };
    const cards = [
      { label: 'Total Vehicles', value: summary.total, color: theme.palette.primary.main, icon: <DirectionsCar /> },
      { label: 'Available', value: summary.available, color: theme.palette.success.main, icon: <DirectionsCar /> },
      { label: 'Sold', value: summary.sold, color: theme.palette.info.main, icon: <AttachMoney /> },
      { label: 'Coming / Reserved', value: `${summary.coming || 0} / ${summary.reserved || 0}`, color: theme.palette.warning.main, icon: <CalendarMonth /> },
    ];
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((c) => <Grid item xs={6} md={3} key={c.label}><SummaryCard {...c} theme={theme} /></Grid>)}
        </Grid>
        <EnhancedDataTable
          title="Vehicle Inventory" data={Array.isArray(reportData) ? reportData : []} loading={false}
          columns={[
            { id: 'manufacturer', label: 'Manufacturer' },
            { id: 'model', label: 'Model' },
            { id: 'year', label: 'Year' },
            { id: 'color', label: 'Color', hiddenOnMobile: true },
            { id: 'purchasePrice', label: 'Purchase Price', format: (v) => formatCurrency(v), bold: true },
            { id: 'status', label: 'Status', format: (v) => <Chip label={v} size="small" color={statusColors[v] || 'default'} variant="outlined" />, exportFormat: (v) => v },
          ]}
          emptyMessage="No vehicles found"
        />
      </>
    );
  };

  // ─── PROFIT & LOSS ─────────────────────────────
  const renderProfitLoss = () => {
    if (!summary) return null;
    const d = summary;
    const rows = [
      { label: 'Total Revenue (Sales)', amount: d.totalRevenue, type: 'income' },
      { label: 'Total Vehicle Costs', amount: -d.totalCost, type: 'expense' },
      { label: 'Gross Profit', amount: d.grossProfit, type: d.grossProfit >= 0 ? 'profit' : 'loss', bold: true },
      { label: 'Operating Expenses', amount: -d.totalExpenses, type: 'expense' },
      { label: 'Net Profit', amount: d.netProfit, type: d.netProfit >= 0 ? 'profit' : 'loss', bold: true },
    ];
    const colorMap = { income: theme.palette.success.main, expense: theme.palette.error.main, profit: theme.palette.success.main, loss: theme.palette.error.main };
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label="Revenue" value={formatCurrency(d.totalRevenue)} color={theme.palette.success.main} icon={<TrendingUp />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Costs" value={formatCurrency(d.totalCost)} color={theme.palette.error.main} icon={<TrendingDown />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Net Profit" value={formatCurrency(d.netProfit)} color={d.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main} icon={<ShowChart />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Margin" value={`${d.profitMargin}%`} color={theme.palette.info.main} icon={<PieChart />} theme={theme} /></Grid>
        </Grid>
        <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Profit & Loss Breakdown</Typography>
            <TableContainer sx={{ overflow: 'auto', maxHeight: '50vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow><TableCell><b>Item</b></TableCell><TableCell align="right"><b>Amount (AFN)</b></TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.label} sx={r.bold ? { bgcolor: alpha(colorMap[r.type], 0.05) } : {}}>
                      <TableCell sx={r.bold ? { fontWeight: 700, fontSize: '0.95rem' } : {}}>{r.label}</TableCell>
                      <TableCell align="right" sx={{ color: colorMap[r.type], fontWeight: r.bold ? 700 : 500, fontSize: r.bold ? '0.95rem' : undefined }}>
                        {formatCurrency(r.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </>
    );
  };

  // ─── COMMISSION REPORT ─────────────────────────
  const renderCommissionReport = () => {
    if (!reportData) return null;
    const data = Array.isArray(reportData) ? reportData : [];
    const totalCommission = data.reduce((s, d) => s + (d.totalCommission || 0), 0);
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={4}><SummaryCard label="Total Commission" value={formatCurrency(totalCommission)} color={theme.palette.warning.main} icon={<MonetizationOn />} theme={theme} /></Grid>
          <Grid item xs={6} md={4}><SummaryCard label="Recipients" value={data.length} color={theme.palette.info.main} icon={<People />} theme={theme} /></Grid>
          <Grid item xs={6} md={4}><SummaryCard label="Avg per Person" value={data.length > 0 ? formatCurrency(Math.round(totalCommission / data.length)) : '0'} color={theme.palette.primary.main} icon={<BarChart />} theme={theme} /></Grid>
        </Grid>
        <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Commission by Person</Typography>
            <TableContainer sx={{ overflow: 'auto', maxHeight: '50vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Person</b></TableCell>
                    <TableCell align="center"><b>Transactions</b></TableCell>
                    <TableCell align="right"><b>Total Commission (AFN)</b></TableCell>
                    <TableCell align="right"><b>Share %</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center"><Typography color="text.secondary" py={2}>No commission data</Typography></TableCell></TableRow>
                  ) : data.map((d) => (
                    <TableRow key={d.personName}>
                      <TableCell sx={{ fontWeight: 600 }}>{d.personName}</TableCell>
                      <TableCell align="center">{d.count}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>{Number(d.totalCommission).toLocaleString()}</TableCell>
                      <TableCell align="right">{totalCommission > 0 ? ((d.totalCommission / totalCommission) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </>
    );
  };

  // ─── DAILY SUMMARY ─────────────────────────────
  const renderDailySummary = () => {
    if (!summary) return null;
    const d = summary;
    const cards = [
      { label: 'Sales Today', value: d.sales || 0, color: theme.palette.primary.main, icon: <Receipt /> },
      { label: 'Revenue', value: formatCurrency(d.revenue || 0), color: theme.palette.success.main, icon: <TrendingUp /> },
      { label: 'Cash In', value: formatCurrency(d.cashIn || 0), color: theme.palette.info.main, icon: <AttachMoney /> },
      { label: 'Cash Out', value: formatCurrency(d.cashOut || 0), color: theme.palette.error.main, icon: <TrendingDown /> },
    ];
    return (
      <Grid container spacing={2}>
        {cards.map((c) => <Grid item xs={6} md={3} key={c.label}><SummaryCard {...c} theme={theme} /></Grid>)}
        <Grid item xs={12}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mt: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Daily Overview — {new Date(dailyDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Net Cash Flow</Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: (d.cashIn - d.cashOut) >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                    {formatCurrency((d.cashIn || 0) - (d.cashOut || 0))}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
                  <Typography variant="h5" fontWeight={700}>{d.transactions || 0}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // ─── MONTHLY TRENDS ────────────────────────────
  const renderMonthlyReport = () => {
    if (!reportData) return null;
    const data = Array.isArray(reportData) ? reportData : [];
    const totalRevenue = data.reduce((s, m) => s + (m.revenue || 0), 0);
    const totalProfit = data.reduce((s, m) => s + (m.netProfit || 0), 0);
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label="Year" value={monthlyYear} color={theme.palette.primary.main} icon={<CalendarMonth />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Total Sales" value={data.reduce((s, m) => s + m.salesCount, 0)} color={theme.palette.info.main} icon={<Receipt />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Revenue" value={formatCurrency(totalRevenue)} color={theme.palette.success.main} icon={<TrendingUp />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Net Profit" value={formatCurrency(totalProfit)} color={totalProfit >= 0 ? theme.palette.success.main : theme.palette.error.main} icon={<ShowChart />} theme={theme} /></Grid>
        </Grid>
        <EnhancedDataTable
          title={`Monthly Performance — ${monthlyYear}`}
          data={data} loading={false}
          columns={[
            { id: 'monthName', label: 'Month' },
            { id: 'salesCount', label: 'Sales', format: (v) => v || 0 },
            { id: 'revenue', label: 'Revenue', format: (v) => formatCurrency(v), bold: true },
            { id: 'profit', label: 'Profit', format: (v) => <Typography variant="body2" fontWeight={600} color={v >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(v)}</Typography> },
            { id: 'income', label: 'Income', format: (v) => formatCurrency(v), hiddenOnMobile: true },
            { id: 'expenses', label: 'Expenses', format: (v) => formatCurrency(v), hiddenOnMobile: true },
            { id: 'netProfit', label: 'Net', format: (v) => <Typography variant="body2" fontWeight={600} color={v >= 0 ? 'success.main' : 'error.main'}>{Number(v).toLocaleString()}</Typography> },
          ]}
          emptyMessage="No data for selected year"
        />
      </>
    );
  };

  const renderReport = () => {
    if (loading) return (
      <Box display="flex" justifyContent="center" py={8}><CircularProgress size={40} /></Box>
    );
    if (!reportData && !summary) return (
      <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">Click &quot;Generate Report&quot; to view results</Typography>
        </CardContent>
      </Card>
    );
    switch (reportType) {
      case 'sales': return renderSalesReport();
      case 'financial': return renderFinancialReport();
      case 'vehicles': return renderVehicleReport();
      case 'profit-loss': return renderProfitLoss();
      case 'commission': return renderCommissionReport();
      case 'daily': return renderDailySummary();
      case 'monthly': return renderMonthlyReport();
      default: return null;
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Reports</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Generate and analyze business reports</Typography>
        </Box>
        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportPdf}>Export Financial PDF</Button>
      </Box>

      {/* Report Type Selection */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {REPORT_TYPES.map((rt) => (
          <Grid item xs={6} sm={4} md key={rt.value}>
            <Card
              onClick={() => setReportType(rt.value)}
              sx={{
                cursor: 'pointer', border: `1.5px solid ${reportType === rt.value ? theme.palette.primary.main : theme.palette.divider}`,
                boxShadow: 'none', bgcolor: reportType === rt.value ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                transition: 'all 0.2s', '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.03) },
              }}
            >
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                <Box sx={{ color: reportType === rt.value ? theme.palette.primary.main : 'text.secondary', mb: 0.5 }}>{rt.icon}</Box>
                <Typography variant="body2" fontWeight={reportType === rt.value ? 700 : 500} noWrap>{rt.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Period / Date Filters */}
      <Card sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {reportType === 'daily' ? (
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" label="Date" type="date" value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)} InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ) : reportType === 'monthly' ? (
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" label="Year" type="number" value={monthlyYear}
                  onChange={(e) => setMonthlyYear(parseInt(e.target.value) || new Date().getFullYear())}
                  InputProps={{ inputProps: { min: 2020, max: 2099 } }}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Period</InputLabel>
                    <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
                      {PERIOD_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="From" type="date" value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPeriod('custom'); }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="To" type="date" value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPeriod('custom'); }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={3}>
              <Button fullWidth variant="contained" startIcon={<Refresh />} onClick={fetchReport} disabled={loading}>
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReport()}
    </Box>
  );
}
