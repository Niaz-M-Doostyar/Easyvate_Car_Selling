'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem,
  Chip, useTheme, alpha, TextField, Button, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Tooltip,
} from '@mui/material';
import {
  Assessment, TrendingUp, TrendingDown, AccountBalance, DirectionsCar, People,
  PictureAsPdf, CalendarMonth, BarChart, PieChart, ShowChart, MonetizationOn,
  AttachMoney, Receipt, Refresh, Timeline, Groups, DateRange,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { formatCurrency } from '@/utils/currency';

const REPORT_TYPES = [
  { value: 'sales', label: 'Sales Report', icon: <ShowChart />, desc: 'Vehicle sales, revenue, and profit analysis' },
  { value: 'financial', label: 'Financial Report', icon: <AccountBalance />, desc: 'Income, expenses, and showroom ledger' },
  { value: 'vehicles', label: 'Vehicle Inventory', icon: <DirectionsCar />, desc: 'Vehicle stock, status, and pipeline' },
  { value: 'profit-loss', label: 'Profit & Loss', icon: <BarChart />, desc: 'Revenue, costs, and net profit breakdown' },
  { value: 'commission', label: 'Partner Profit Report', icon: <MonetizationOn />, desc: 'Realized partner profit by person' },
  { value: 'partnerships', label: 'Partnership Report', icon: <Groups />, desc: 'Active and sold vehicle partnerships' },
  { value: 'daily', label: 'Daily Summary', icon: <CalendarMonth />, desc: 'Daily snapshot of operations' },
  { value: 'monthly', label: 'Monthly Trends', icon: <TrendingUp />, desc: 'Monthly aggregated performance' },
  { value: 'yearly', label: 'Yearly Trends', icon: <Timeline />, desc: 'Year-over-year performance comparison' },
  { value: 'balance-breakdown', label: 'Balance Breakdown', icon: <Groups />, desc: 'Owner & shared persons balance' },
  { value: 'customer-transactions', label: 'Customer Ledger', icon: <People />, desc: 'Customer transaction history' },
];

const CREDIT_LEDGER_TYPES = ['Received', 'Installment', 'Loan Payment', 'Investment', 'Profit Share'];

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
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
    case 'all': return { startDate: '2020-01-01', endDate: new Date(y + 1, 11, 31).toISOString().slice(0, 10) };
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
  const [dateFrom, setDateFrom] = useState(() => getDateRange('month').startDate);
  const [dateTo, setDateTo] = useState(() => getDateRange('month').endDate);
  const [reportData, setReportData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [yearlyStartYear, setYearlyStartYear] = useState(new Date().getFullYear() - 5);
  const [yearlyEndYear, setYearlyEndYear] = useState(new Date().getFullYear());
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().slice(0, 10));
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Load customers for customer-transactions report
  useEffect(() => {
    apiClient.get('/customers').then(res => setCustomers(res.data.data || res.data || [])).catch(() => {});
  }, []);

  // Set date range when period changes
  useEffect(() => {
    if (period !== 'custom') {
      const range = getDateRange(period);
      setDateFrom(range.startDate);
      setDateTo(range.endDate);
    }
  }, [period]);

  // Fetch on reportType change
  useEffect(() => { fetchReport(); }, [reportType]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReport = async () => {
    setLoading(true);
    setReportData(null);
    setSummary(null);
    try {
      const params = {};
      if (reportType === 'monthly') {
        params.year = monthlyYear;
      } else if (reportType === 'yearly') {
        params.startYear = yearlyStartYear;
        params.endYear = yearlyEndYear;
      } else if (reportType === 'daily') {
        params.date = dailyDate;
      } else if (reportType === 'customer-transactions') {
        if (selectedCustomerId) params.customerId = selectedCustomerId;
        const { startDate, endDate } = period !== 'custom' ? getDateRange(period) : { startDate: dateFrom, endDate: dateTo };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      } else if (reportType === 'balance-breakdown') {
        // No date params needed
      } else {
        // Compute dates fresh from period to avoid stale state
        const { startDate, endDate } = period !== 'custom' ? getDateRange(period) : { startDate: dateFrom, endDate: dateTo };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
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
      { label: 'Partner Profit Shared', value: formatCurrency(summary.totalCommission), color: theme.palette.warning.main, icon: <MonetizationOn /> },
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
            { id: 'customer', label: 'Customer', format: (_, row) => row.customer?.fullName || row.customer?.name || '-' },
            { id: 'sellingPrice', label: 'Selling Price', format: (v) => formatCurrency(v), bold: true },
            { id: 'profit', label: 'Profit', format: (v) => <Typography variant="body2" color={Number(v) >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>{formatCurrency(v)}</Typography> },
            { id: 'commission', label: 'Partner Profit', format: (v) => formatCurrency(v) },
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
      { label: 'Net Profit', value: formatCurrency(summary.netProfit), color: summary.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main, icon: <AccountBalance /> },
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
            { id: 'amount', label: 'Amount', format: (v, row) => `${Number(v || 0).toLocaleString()} ${row.currency || 'AFN'}`, bold: true },
            { id: 'amountInPKR', label: 'Amount (AFN)', format: (v) => formatCurrency(v) },
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

  // ─── PARTNER PROFIT REPORT ─────────────────────
  const renderCommissionReport = () => {
    if (!reportData) return null;
    const data = Array.isArray(reportData) ? reportData : [];
    const totalCommission = data.reduce((s, d) => s + (d.totalCommission || 0), 0);
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label="Partner Profit" value={formatCurrency(totalCommission)} color={theme.palette.warning.main} icon={<MonetizationOn />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Partners" value={data.length} color={theme.palette.info.main} icon={<People />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Avg per Partner" value={data.length > 0 ? formatCurrency(Math.round(totalCommission / data.length)) : '0'} color={theme.palette.primary.main} icon={<BarChart />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Total Capital" value={formatCurrency(data.reduce((s, d) => s + (d.totalInvestment || 0), 0))} color={theme.palette.success.main} icon={<AttachMoney />} theme={theme} /></Grid>
        </Grid>
        <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Partner Profit by Person</Typography>
            <TableContainer sx={{ overflow: 'auto', maxHeight: '50vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Partner</b></TableCell>
                    <TableCell align="center"><b>Sold Vehicles</b></TableCell>
                    <TableCell align="right"><b>Invested Capital</b></TableCell>
                    <TableCell align="right"><b>Avg Share %</b></TableCell>
                    <TableCell align="right"><b>Total Partner Profit</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center"><Typography color="text.secondary" py={2}>No partner profit data</Typography></TableCell></TableRow>
                  ) : data.map((d) => (
                    <TableRow key={`${d.customerId || 'name'}-${d.personName}`}>
                      <TableCell sx={{ fontWeight: 600 }}>{d.personName}</TableCell>
                      <TableCell align="center">{d.salesCount || d.count}</TableCell>
                      <TableCell align="right">{formatCurrency(d.totalInvestment || 0)}</TableCell>
                      <TableCell align="right">{Number(d.averageSharePercentage || 0).toFixed(2)}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>{formatCurrency(d.totalCommission)}</TableCell>
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

  const renderPartnershipReport = () => {
    if (!summary || !reportData) return null;
    const vehicles = Array.isArray(reportData.vehicles) ? reportData.vehicles : [];
    const partners = Array.isArray(reportData.partners) ? reportData.partners : [];

    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={4}><SummaryCard label="Partnered Vehicles" value={summary.totalVehicles || 0} color={theme.palette.primary.main} icon={<DirectionsCar />} theme={theme} /></Grid>
          <Grid item xs={6} md={4}><SummaryCard label="Open Vehicles" value={summary.activeVehicles || 0} color={theme.palette.info.main} icon={<Groups />} theme={theme} /></Grid>
          <Grid item xs={6} md={4}><SummaryCard label="Sold Vehicles" value={summary.soldVehicles || 0} color={theme.palette.success.main} icon={<Receipt />} theme={theme} /></Grid>
          <Grid item xs={6} md={6}><SummaryCard label="Partner Capital" value={formatCurrency(summary.totalPartnerInvestment || 0)} color={theme.palette.warning.main} icon={<AttachMoney />} theme={theme} /></Grid>
          <Grid item xs={6} md={6}><SummaryCard label="Realized Partner Profit" value={formatCurrency(summary.totalRealizedPartnerProfit || 0)} color={theme.palette.secondary.main} icon={<MonetizationOn />} theme={theme} /></Grid>
        </Grid>

        <Card sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>How partnership profit is calculated</Typography>
            <Typography variant="body2" color="text.secondary">
              {summary.calculationNote}
            </Typography>
          </CardContent>
        </Card>

        <EnhancedDataTable
          title="Partner Summary"
          data={partners}
          loading={false}
          columns={[
            { id: 'personName', label: 'Partner', bold: true },
            { id: 'activeVehicles', label: 'Open Vehicles', format: (v) => v || 0 },
            { id: 'soldVehicles', label: 'Sold Vehicles', format: (v) => v || 0 },
            { id: 'totalInvestment', label: 'Capital', format: (v) => formatCurrency(v) },
            { id: 'averageSharePercentage', label: 'Avg Share %', format: (v) => `${Number(v || 0).toFixed(2)}%` },
            { id: 'totalRealizedProfit', label: 'Realized Profit', format: (v) => formatCurrency(v), bold: true },
          ]}
          emptyMessage="No partnership data found"
        />

        <Box sx={{ mt: 3 }}>
          <EnhancedDataTable
            title="Vehicle Partnerships"
            data={vehicles}
            loading={false}
            columns={[
              { id: 'vehicleLabel', label: 'Vehicle', bold: true },
              { id: 'status', label: 'Status', format: (v) => <Chip label={v} size="small" color={v === 'Sold' ? 'success' : 'info'} variant="outlined" />, exportFormat: (v) => v },
              { id: 'partnerInvestmentTotal', label: 'Partner Capital', format: (v) => formatCurrency(v) },
              { id: 'ownerInvestment', label: 'Owner Capital', format: (v) => formatCurrency(v) },
              { id: 'partnerPercentageTotal', label: 'Partner %', format: (v) => `${Number(v || 0).toFixed(2)}%` },
              { id: 'ownerPercentage', label: 'Owner %', format: (v) => `${Number(v || 0).toFixed(2)}%` },
              { id: 'totalProfit', label: 'Sale Profit', format: (v) => v ? formatCurrency(v) : '-' },
              { id: 'realizedPartnerProfit', label: 'Partner Profit', format: (v) => v ? formatCurrency(v) : '-' },
              { id: 'partners', label: 'Partners', format: (v) => (Array.isArray(v) && v.length > 0 ? v.map((partner) => `${partner.personName} ${Number(partner.sharePercentage || 0).toFixed(2)}%`).join(', ') : '-') },
            ]}
            emptyMessage="No vehicle partnerships found"
          />
        </Box>
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
              <Typography variant="h6" fontWeight={700} gutterBottom>Daily Overview — {new Date(dailyDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
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
            { id: 'netProfit', label: 'Net', format: (v) => <Typography variant="body2" fontWeight={600} color={Number(v) >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(v)}</Typography> },
          ]}
          emptyMessage="No data for selected year"
        />
      </>
    );
  };

  // ─── YEARLY TRENDS ─────────────────────────────
  const renderYearlyReport = () => {
    if (!reportData) return null;
    const data = Array.isArray(reportData) ? reportData : [];
    const totalRevenue = data.reduce((s, y) => s + (y.revenue || 0), 0);
    const totalProfit = data.reduce((s, y) => s + (y.netProfit || 0), 0);
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label="Years" value={`${yearlyStartYear}–${yearlyEndYear}`} color={theme.palette.primary.main} icon={<DateRange />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Total Sales" value={data.reduce((s, y) => s + y.salesCount, 0)} color={theme.palette.info.main} icon={<Receipt />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Total Revenue" value={formatCurrency(totalRevenue)} color={theme.palette.success.main} icon={<TrendingUp />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Total Net Profit" value={formatCurrency(totalProfit)} color={totalProfit >= 0 ? theme.palette.success.main : theme.palette.error.main} icon={<ShowChart />} theme={theme} /></Grid>
        </Grid>
        <EnhancedDataTable
          title={`Yearly Performance — ${yearlyStartYear} to ${yearlyEndYear}`}
          data={data} loading={false}
          columns={[
            { id: 'year', label: 'Year' },
            { id: 'salesCount', label: 'Sales', format: (v) => v || 0 },
            { id: 'revenue', label: 'Revenue', format: (v) => formatCurrency(v), bold: true },
            { id: 'profit', label: 'Profit', format: (v) => <Typography variant="body2" fontWeight={600} color={Number(v) >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(v)}</Typography> },
            { id: 'income', label: 'Income', format: (v) => formatCurrency(v), hiddenOnMobile: true },
            { id: 'expenses', label: 'Expenses', format: (v) => formatCurrency(v), hiddenOnMobile: true },
            { id: 'netProfit', label: 'Net', format: (v) => <Typography variant="body2" fontWeight={600} color={Number(v) >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(v)}</Typography> },
          ]}
          emptyMessage="No data for selected year range"
        />
      </>
    );
  };

  // ─── BALANCE BREAKDOWN ─────────────────────────
  const renderBalanceBreakdown = () => {
    if (!summary) return null;
    const d = summary;
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label="Gross Showroom Balance" value={formatCurrency(d.showroomBalance)} color={theme.palette.primary.main} icon={<AccountBalance />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Owner Balance" value={formatCurrency(d.ownerBalance)} color={d.ownerBalance >= 0 ? theme.palette.success.main : theme.palette.error.main} icon={<AttachMoney />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Partner Profit Total" value={formatCurrency(d.sharedTotal)} color={theme.palette.warning.main} icon={<Groups />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Partners" value={d.sharedPersons?.length || 0} color={theme.palette.info.main} icon={<People />} theme={theme} /></Grid>
        </Grid>
        <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Partner Profit Breakdown</Typography>
            <TableContainer sx={{ overflow: 'auto', maxHeight: '50vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Person</b></TableCell>
                    <TableCell align="center"><b>Transactions</b></TableCell>
                    <TableCell align="right"><b>Balance (AFN)</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!d.sharedPersons || d.sharedPersons.length === 0) ? (
                    <TableRow><TableCell colSpan={3} align="center"><Typography color="text.secondary" py={2}>No shared persons data</Typography></TableCell></TableRow>
                  ) : d.sharedPersons.map((p) => (
                    <TableRow key={p.personName}>
                      <TableCell sx={{ fontWeight: 600 }}>{p.personName}</TableCell>
                      <TableCell align="center">{p.transactionCount}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>{formatCurrency(p.balance)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Owner (Remaining)</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: 700, color: d.ownerBalance >= 0 ? theme.palette.success.main : theme.palette.error.main }}>{formatCurrency(d.ownerBalance)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </>
    );
  };

  // ─── CUSTOMER TRANSACTIONS ─────────────────────
  const renderCustomerTransactions = () => {
    if (!reportData) return null;
    const data = Array.isArray(reportData) ? reportData : [];
    const totalReceived = data.filter(t => CREDIT_LEDGER_TYPES.includes(t.type)).reduce((s, t) => s + Number(t.amountInPKR || 0), 0);
    const totalPaid = data.filter(t => ['Paid', 'Loan'].includes(t.type)).reduce((s, t) => s + Number(t.amountInPKR || 0), 0);
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label="Transactions" value={data.length} color={theme.palette.primary.main} icon={<Receipt />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Total Credit" value={formatCurrency(totalReceived)} color={theme.palette.success.main} icon={<TrendingUp />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Total Paid" value={formatCurrency(totalPaid)} color={theme.palette.error.main} icon={<TrendingDown />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label="Net" value={formatCurrency(totalReceived - totalPaid)} color={theme.palette.info.main} icon={<AccountBalance />} theme={theme} /></Grid>
        </Grid>
        <EnhancedDataTable
          title="Customer Transactions" data={data} loading={false}
          columns={[
            { id: 'customer', label: 'Customer', format: (v) => v?.fullName || v?.name || '-' },
            { id: 'type', label: 'Type', format: (v) => <Chip label={v} size="small" color={CREDIT_LEDGER_TYPES.includes(v) ? 'success' : 'warning'} variant="outlined" />, exportFormat: (v) => v },
            { id: 'amount', label: 'Amount', format: (v, row) => `${Number(v || 0).toLocaleString()} ${row.currency || 'AFN'}`, bold: true },
            { id: 'amountInPKR', label: 'Amount (AFN)', format: (v) => formatCurrency(v) },
            { id: 'purpose', label: 'Purpose', format: (v) => v || '-' },
            { id: 'date', label: 'Date', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
          ]}
          emptyMessage="No customer transactions found"
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
      case 'partnerships': return renderPartnershipReport();
      case 'daily': return renderDailySummary();
      case 'monthly': return renderMonthlyReport();
      case 'yearly': return renderYearlyReport();
      case 'balance-breakdown': return renderBalanceBreakdown();
      case 'customer-transactions': return renderCustomerTransactions();
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
            ) : reportType === 'yearly' ? (
              <>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="Start Year" type="number" value={yearlyStartYear}
                    onChange={(e) => setYearlyStartYear(parseInt(e.target.value) || new Date().getFullYear() - 5)}
                    InputProps={{ inputProps: { min: 2015, max: 2099 } }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="End Year" type="number" value={yearlyEndYear}
                    onChange={(e) => setYearlyEndYear(parseInt(e.target.value) || new Date().getFullYear())}
                    InputProps={{ inputProps: { min: 2015, max: 2099 } }}
                  />
                </Grid>
              </>
            ) : reportType === 'balance-breakdown' ? (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Balance breakdown shows the current overall balances — no date filter needed.
                </Typography>
              </Grid>
            ) : reportType === 'customer-transactions' ? (
              <>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Customer</InputLabel>
                    <Select value={selectedCustomerId} label="Customer" onChange={(e) => setSelectedCustomerId(e.target.value)}>
                      <MenuItem value="">All Customers</MenuItem>
                      {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.fullName || c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Period</InputLabel>
                    <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
                      {PERIOD_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField fullWidth size="small" label="From" type="date" value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPeriod('custom'); }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField fullWidth size="small" label="To" type="date" value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPeriod('custom'); }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
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
            <Grid item xs={12} sm={reportType === 'balance-breakdown' ? 6 : 3}>
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
