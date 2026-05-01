// src/app/[locale]/dashboard/reports/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
  { value: 'sales', label: 'Sales Report', icon: <ShowChart />, labelKey: 'reportTypeSales', descKey: 'reportTypeSalesDesc' },
  { value: 'financial', label: 'Financial Report', icon: <AccountBalance />, labelKey: 'reportTypeFinancial', descKey: 'reportTypeFinancialDesc' },
  { value: 'vehicles', label: 'Vehicle Inventory', icon: <DirectionsCar />, labelKey: 'reportTypeVehicles', descKey: 'reportTypeVehiclesDesc' },
  { value: 'profit-loss', label: 'Profit & Loss', icon: <BarChart />, labelKey: 'reportTypeProfitLoss', descKey: 'reportTypeProfitLossDesc' },
  { value: 'partnerships', label: 'Partnership Report', icon: <Groups />, labelKey: 'reportTypePartnerships', descKey: 'reportTypePartnershipsDesc' },
  { value: 'daily', label: 'Daily Summary', icon: <CalendarMonth />, labelKey: 'reportTypeDaily', descKey: 'reportTypeDailyDesc' },
  { value: 'monthly', label: 'Monthly Trends', icon: <TrendingUp />, labelKey: 'reportTypeMonthly', descKey: 'reportTypeMonthlyDesc' },
  { value: 'yearly', label: 'Yearly Trends', icon: <Timeline />, labelKey: 'reportTypeYearly', descKey: 'reportTypeYearlyDesc' },
];

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today', labelKey: 'periodToday' },
  { value: 'week', label: 'This Week', labelKey: 'periodWeek' },
  { value: 'month', label: 'This Month', labelKey: 'periodMonth' },
  { value: 'quarter', label: 'This Quarter', labelKey: 'periodQuarter' },
  { value: 'year', label: 'This Year', labelKey: 'periodYear' },
  { value: 'all', label: 'All Time', labelKey: 'periodAll' },
  { value: 'custom', label: 'Custom Range', labelKey: 'periodCustom' },
];

function getDateRange(period) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  switch (period) {
    case 'today':
      return {
        startDate: new Date(y, m, d).toLocaleDateString('en-CA'),
        endDate: new Date(y, m, d).toLocaleDateString('en-CA')
      };
    case 'week': {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(y, m, d - dayOfWeek);
      const endOfWeek = new Date(y, m, d + (6 - dayOfWeek));
      return {
        startDate: startOfWeek.toLocaleDateString('en-CA'),
        endDate: endOfWeek.toLocaleDateString('en-CA')
      };
    }
    case 'month':
      return {
        startDate: new Date(y, m, 1).toLocaleDateString('en-CA'),
        endDate: new Date(y, m + 1, 0).toLocaleDateString('en-CA')
      };
    case 'quarter': {
      const quarterStart = Math.floor(m / 3) * 3;
      return {
        startDate: new Date(y, quarterStart, 1).toLocaleDateString('en-CA'),
        endDate: new Date(y, quarterStart + 3, 0).toLocaleDateString('en-CA')
      };
    }
    case 'year':
      return {
        startDate: new Date(y, 0, 1).toLocaleDateString('en-CA'),
        endDate: new Date(y, 11, 31).toLocaleDateString('en-CA')
      };
    case 'all':
      return {
        startDate: '2020-01-01',
        endDate: new Date(y + 1, 11, 31).toLocaleDateString('en-CA')
      };
    default:
      return { startDate: '', endDate: '' };
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
  const t = useTranslations('Reports');

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

  // Sync dateFrom/dateTo with selected period (except custom)
  useEffect(() => {
    if (period !== 'custom') {
      const { startDate, endDate } = getDateRange(period);
      setDateFrom(startDate);
      setDateTo(endDate);
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
      } else if (reportType === 'yearly') {
        params.startYear = yearlyStartYear;
        params.endYear = yearlyEndYear;
      } else if (reportType === 'daily') {
        params.date = dailyDate;
      } else {
        const { startDate, endDate } = period !== 'custom' ? getDateRange(period) : { startDate: dateFrom, endDate: dateTo };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const res = await apiClient.get(`/reports/${reportType}`, { params });
      setReportData(res.data.data || []);
      setSummary(res.data.summary || res.data.data || null);
    } catch (err) {
      enqueueSnackbar(t('fetchError', { reportType: t(REPORT_TYPES.find(r => r.value === reportType)?.labelKey || 'reportTypeSales') }), { variant: 'error' });
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
      enqueueSnackbar(t('exportSuccess'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('exportError'), { variant: 'error' });
    }
  };

  // Sales Report
  const renderSalesReport = () => {
    if (!summary || !reportData) return null;
    const cards = [
      { label: t('summaryTotalSales'), value: summary.totalSales, color: theme.palette.primary.main, icon: <Receipt /> },
      { label: t('summaryRevenue'), value: formatCurrency(summary.totalRevenue), color: theme.palette.success.main, icon: <TrendingUp /> },
      { label: t('summaryTotalProfit'), value: formatCurrency(summary.totalProfit), color: theme.palette.info.main, icon: <ShowChart /> },
      { label: t('summaryPartnerProfitShared'), value: formatCurrency(summary.totalCommission), color: theme.palette.warning.main, icon: <MonetizationOn /> },
    ];
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((c) => <Grid item xs={6} md={3} key={c.label}><SummaryCard {...c} theme={theme} /></Grid>)}
        </Grid>
        <EnhancedDataTable
          title={t('salesDetailsTitle')} data={Array.isArray(reportData) ? reportData : []} loading={false}
          columns={[
            { id: 'vehicle', label: t('columnVehicle'), format: (_, row) => row.vehicle ? `${row.vehicle.manufacturer} ${row.vehicle.model}` : '-' },
            { id: 'customer', label: t('columnCustomer'), format: (_, row) => row.customer?.fullName || row.customer?.name || '-' },
            { id: 'sellingPrice', label: t('columnSellingPrice'), format: (v) => formatCurrency(v), bold: true },
            { id: 'profit', label: t('columnProfit'), format: (v) => <Typography variant="body2" color={Number(v) >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>{formatCurrency(v)}</Typography> },
            { id: 'commission', label: t('columnPartnerProfit'), format: (v) => formatCurrency(v) },
            { id: 'saleDate', label: t('columnDate'), format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
          ]}
          emptyMessage={t('noSalesInPeriod')}
        />
      </>
    );
  };

  // Financial Report
  const renderFinancialReport = () => {
    if (!summary || !reportData) return null;
    const cards = [
      { label: t('summaryTotalIncome'), value: formatCurrency(summary.totalIncome), color: theme.palette.success.main, icon: <TrendingUp /> },
      { label: t('summaryTotalExpenses'), value: formatCurrency(summary.totalExpenses), color: theme.palette.error.main, icon: <TrendingDown /> },
      { label: t('summaryNetProfit'), value: formatCurrency(summary.netProfit), color: summary.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main, icon: <AccountBalance /> },
      { label: t('summaryTransactionCount'), value: summary.transactionCount, color: theme.palette.warning.main, icon: <Receipt /> },
    ];
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((c) => <Grid item xs={6} md={3} key={c.label}><SummaryCard {...c} theme={theme} /></Grid>)}
        </Grid>
        <EnhancedDataTable
          title={t('financialTransactionsTitle')} data={Array.isArray(reportData) ? reportData : []} loading={false}
          columns={[
            { id: 'type', label: t('columnType'), format: (v) => <Chip label={v} size="small" color={['Income', 'Vehicle Sale'].includes(v) ? 'success' : 'error'} variant="outlined" />, exportFormat: (v) => v },
            { id: 'personName', label: t('columnPerson'), format: (v) => v || '-' },
            { id: 'amount', label: t('columnAmount'), format: (v, row) => `${Number(v || 0).toLocaleString()} ${row.currency || 'AFN'}`, bold: true },
            { id: 'amountInPKR', label: t('columnAmountAFN'), format: (v) => formatCurrency(v) },
            { id: 'description', label: t('columnDescription'), format: (v) => v || '-' },
            { id: 'date', label: t('columnDate'), format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
          ]}
          emptyMessage={t('noTransactionsInPeriod')}
        />
      </>
    );
  };

  // Vehicle Inventory Report
  const renderVehicleReport = () => {
    if (!summary || !reportData) return null;
    const statusColors = { Available: 'success', Sold: 'default', Reserved: 'warning', Coming: 'info', 'Under Repair': 'error' };
    const cards = [
      { label: t('summaryTotalVehicles'), value: summary.total, color: theme.palette.primary.main, icon: <DirectionsCar /> },
      { label: t('summaryAvailable'), value: summary.available, color: theme.palette.success.main, icon: <DirectionsCar /> },
      { label: t('summarySold'), value: summary.sold, color: theme.palette.info.main, icon: <AttachMoney /> },
      { label: t('summaryComingReserved'), value: `${summary.coming || 0} / ${summary.reserved || 0}`, color: theme.palette.warning.main, icon: <CalendarMonth /> },
    ];
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((c) => <Grid item xs={6} md={3} key={c.label}><SummaryCard {...c} theme={theme} /></Grid>)}
        </Grid>
        <EnhancedDataTable
          title={t('vehicleInventoryTitle')} data={Array.isArray(reportData) ? reportData : []} loading={false}
          columns={[
            { id: 'manufacturer', label: t('columnManufacturer') },
            { id: 'model', label: t('columnModel') },
            { id: 'year', label: t('columnYear') },
            { id: 'color', label: t('columnColor'), hiddenOnMobile: true },
            { id: 'purchasePrice', label: t('columnPurchasePrice'), format: (v) => formatCurrency(v), bold: true },
            { id: 'status', label: t('columnStatus'), format: (v) => <Chip label={v} size="small" color={statusColors[v] || 'default'} variant="outlined" />, exportFormat: (v) => v },
          ]}
          emptyMessage={t('noVehiclesFound')}
        />
      </>
    );
  };

  // Profit & Loss
  const renderProfitLoss = () => {
    if (!summary) return null;
    const d = summary;
    const rows = [
      { label: t('plTotalRevenue'), amount: d.totalRevenue, type: 'income' },
      { label: t('plTotalVehicleCosts'), amount: -d.totalCost, type: 'expense' },
      { label: t('plGrossProfit'), amount: d.grossProfit, type: d.grossProfit >= 0 ? 'profit' : 'loss', bold: true },
      { label: t('plOperatingExpenses'), amount: -d.totalExpenses, type: 'expense' },
      { label: t('plNetProfit'), amount: d.netProfit, type: d.netProfit >= 0 ? 'profit' : 'loss', bold: true },
    ];
    const colorMap = { income: theme.palette.success.main, expense: theme.palette.error.main, profit: theme.palette.success.main, loss: theme.palette.error.main };
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryRevenue')} value={formatCurrency(d.totalRevenue)} color={theme.palette.success.main} icon={<TrendingUp />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryCosts')} value={formatCurrency(d.totalCost)} color={theme.palette.error.main} icon={<TrendingDown />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryNetProfit')} value={formatCurrency(d.netProfit)} color={d.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main} icon={<ShowChart />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryProfitMargin')} value={`${d.profitMargin}%`} color={theme.palette.info.main} icon={<PieChart />} theme={theme} /></Grid>
        </Grid>
        <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>{t('plBreakdownTitle')}</Typography>
            <TableContainer sx={{ overflow: 'auto', maxHeight: '50vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow><TableCell><b>{t('columnItem')}</b></TableCell><TableCell align="right"><b>{t('columnAmountAFN')}</b></TableCell></TableRow>
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

  // Partnership Report
  const renderPartnershipReport = () => {
    if (!summary || !reportData) return null;
    const vehicles = Array.isArray(reportData.vehicles) ? reportData.vehicles : [];
    const partners = Array.isArray(reportData.partners) ? reportData.partners : [];

    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={4}><SummaryCard label={t('summaryPartneredVehicles')} value={summary.totalVehicles || 0} color={theme.palette.primary.main} icon={<DirectionsCar />} theme={theme} /></Grid>
          <Grid item xs={6} md={4}><SummaryCard label={t('summaryOpenVehicles')} value={summary.activeVehicles || 0} color={theme.palette.info.main} icon={<Groups />} theme={theme} /></Grid>
          <Grid item xs={6} md={4}><SummaryCard label={t('summarySoldVehicles')} value={summary.soldVehicles || 0} color={theme.palette.success.main} icon={<Receipt />} theme={theme} /></Grid>
          <Grid item xs={6} md={6}><SummaryCard label={t('summaryPartnerCapital')} value={formatCurrency(summary.totalPartnerInvestment || 0)} color={theme.palette.warning.main} icon={<AttachMoney />} theme={theme} /></Grid>
          <Grid item xs={6} md={6}><SummaryCard label={t('summaryRealizedPartnerProfit')} value={formatCurrency(summary.totalRealizedPartnerProfit || 0)} color={theme.palette.secondary.main} icon={<MonetizationOn />} theme={theme} /></Grid>
        </Grid>

        <Card sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('partnershipCalculationTitle')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {summary.calculationNote || t('partnershipCalculationDefault')}
            </Typography>
          </CardContent>
        </Card>

        <EnhancedDataTable
          title={t('partnerSummaryTitle')}
          data={partners}
          loading={false}
          columns={[
            { id: 'personName', label: t('columnPartner'), bold: true },
            { id: 'activeVehicles', label: t('columnOpenVehicles'), format: (v) => v || 0 },
            { id: 'soldVehicles', label: t('columnSoldVehicles'), format: (v) => v || 0 },
            { id: 'totalInvestment', label: t('columnCapital'), format: (v) => formatCurrency(v) },
            { id: 'averageSharePercentage', label: t('columnAvgSharePercentage'), format: (v) => `${Number(v || 0).toFixed(2)}%` },
            { id: 'totalRealizedProfit', label: t('columnRealizedProfit'), format: (v) => formatCurrency(v), bold: true },
          ]}
          emptyMessage={t('noPartnershipData')}
        />

        <Box sx={{ mt: 3 }}>
          <EnhancedDataTable
            title={t('vehiclePartnershipsTitle')}
            data={vehicles}
            loading={false}
            columns={[
              { id: 'vehicleLabel', label: t('columnVehicle'), bold: true },
              { id: 'status', label: t('columnStatus'), format: (v) => <Chip label={v} size="small" color={v === 'Sold' ? 'success' : 'info'} variant="outlined" />, exportFormat: (v) => v },
              { id: 'partnerInvestmentTotal', label: t('columnPartnerCapital'), format: (v) => formatCurrency(v) },
              { id: 'ownerInvestment', label: t('columnOwnerCapital'), format: (v) => formatCurrency(v) },
              { id: 'partnerPercentageTotal', label: t('columnPartnerPercentage'), format: (v) => `${Number(v || 0).toFixed(2)}%` },
              { id: 'ownerPercentage', label: t('columnOwnerPercentage'), format: (v) => `${Number(v || 0).toFixed(2)}%` },
              { id: 'totalProfit', label: t('columnSaleProfit'), format: (v) => v ? formatCurrency(v) : '-' },
              { id: 'realizedPartnerProfit', label: t('columnPartnerProfit'), format: (v) => v ? formatCurrency(v) : '-' },
              { id: 'partners', label: t('columnPartners'), format: (v) => (Array.isArray(v) && v.length > 0 ? v.map((partner) => `${partner.personName} ${Number(partner.sharePercentage || 0).toFixed(2)}%`).join(', ') : '-') },
            ]}
            emptyMessage={t('noVehiclePartnerships')}
          />
        </Box>
      </>
    );
  };

  // Daily Summary
  const renderDailySummary = () => {
    if (!summary) return null;
    const d = summary;
    const cards = [
      { label: t('summarySalesToday'), value: d.sales || 0, color: theme.palette.primary.main, icon: <Receipt /> },
      { label: t('summaryRevenue'), value: formatCurrency(d.revenue || 0), color: theme.palette.success.main, icon: <TrendingUp /> },
      { label: t('summaryCashIn'), value: formatCurrency(d.cashIn || 0), color: theme.palette.info.main, icon: <AttachMoney /> },
      { label: t('summaryCashOut'), value: formatCurrency(d.cashOut || 0), color: theme.palette.error.main, icon: <TrendingDown /> },
    ];
    return (
      <Grid container spacing={2}>
        {cards.map((c) => <Grid item xs={6} md={3} key={c.label}><SummaryCard {...c} theme={theme} /></Grid>)}
        <Grid item xs={12}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mt: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('dailyOverviewTitle', { date: new Date(dailyDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) })}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">{t('summaryNetCashFlow')}</Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: (d.cashIn - d.cashOut) >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                    {formatCurrency((d.cashIn || 0) - (d.cashOut || 0))}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">{t('summaryTotalTransactions')}</Typography>
                  <Typography variant="h5" fontWeight={700}>{d.transactions || 0}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Monthly Trends
  const renderMonthlyReport = () => {
    if (!reportData) return null;
    const data = Array.isArray(reportData) ? reportData : [];
    const totalRevenue = data.reduce((s, m) => s + (m.revenue || 0), 0);
    const totalProfit = data.reduce((s, m) => s + (m.netProfit || 0), 0);
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryYear')} value={monthlyYear} color={theme.palette.primary.main} icon={<CalendarMonth />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryTotalSales')} value={data.reduce((s, m) => s + m.salesCount, 0)} color={theme.palette.info.main} icon={<Receipt />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryRevenue')} value={formatCurrency(totalRevenue)} color={theme.palette.success.main} icon={<TrendingUp />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryNetProfit')} value={formatCurrency(totalProfit)} color={totalProfit >= 0 ? theme.palette.success.main : theme.palette.error.main} icon={<ShowChart />} theme={theme} /></Grid>
        </Grid>
        <EnhancedDataTable
          title={t('monthlyPerformance', { year: monthlyYear })}
          data={data} loading={false}
          columns={[
            { id: 'monthName', label: t('columnMonth') },
            { id: 'salesCount', label: t('columnSalesCount'), format: (v) => v || 0 },
            { id: 'revenue', label: t('columnRevenue'), format: (v) => formatCurrency(v), bold: true },
            { id: 'profit', label: t('columnProfit'), format: (v) => <Typography variant="body2" fontWeight={600} color={v >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(v)}</Typography> },
            { id: 'income', label: t('columnIncome'), format: (v) => formatCurrency(v), hiddenOnMobile: true },
            { id: 'expenses', label: t('columnExpenses'), format: (v) => formatCurrency(v), hiddenOnMobile: true },
            { id: 'netProfit', label: t('columnNet'), format: (v) => <Typography variant="body2" fontWeight={600} color={Number(v) >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(v)}</Typography> },
          ]}
          emptyMessage={t('noDataForYear')}
        />
      </>
    );
  };

  // Yearly Trends
  const renderYearlyReport = () => {
    if (!reportData) return null;
    const data = Array.isArray(reportData) ? reportData : [];
    const totalRevenue = data.reduce((s, y) => s + (y.revenue || 0), 0);
    const totalProfit = data.reduce((s, y) => s + (y.netProfit || 0), 0);
    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryYears')} value={`${yearlyStartYear}–${yearlyEndYear}`} color={theme.palette.primary.main} icon={<DateRange />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryTotalSales')} value={data.reduce((s, y) => s + y.salesCount, 0)} color={theme.palette.info.main} icon={<Receipt />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryTotalRevenue')} value={formatCurrency(totalRevenue)} color={theme.palette.success.main} icon={<TrendingUp />} theme={theme} /></Grid>
          <Grid item xs={6} md={3}><SummaryCard label={t('summaryTotalNetProfit')} value={formatCurrency(totalProfit)} color={totalProfit >= 0 ? theme.palette.success.main : theme.palette.error.main} icon={<ShowChart />} theme={theme} /></Grid>
        </Grid>
        <EnhancedDataTable
          title={t('yearlyPerformance', { startYear: yearlyStartYear, endYear: yearlyEndYear })}
          data={data} loading={false}
          columns={[
            { id: 'year', label: t('columnYear') },
            { id: 'salesCount', label: t('columnSalesCount'), format: (v) => v || 0 },
            { id: 'revenue', label: t('columnRevenue'), format: (v) => formatCurrency(v), bold: true },
            { id: 'profit', label: t('columnProfit'), format: (v) => <Typography variant="body2" fontWeight={600} color={Number(v) >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(v)}</Typography> },
            { id: 'income', label: t('columnIncome'), format: (v) => formatCurrency(v), hiddenOnMobile: true },
            { id: 'expenses', label: t('columnExpenses'), format: (v) => formatCurrency(v), hiddenOnMobile: true },
            { id: 'netProfit', label: t('columnNet'), format: (v) => <Typography variant="body2" fontWeight={600} color={Number(v) >= 0 ? 'success.main' : 'error.main'}>{formatCurrency(v)}</Typography> },
          ]}
          emptyMessage={t('noDataForYearRange')}
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
          <Typography color="text.secondary">{t('generateReportPrompt')}</Typography>
        </CardContent>
      </Card>
    );
    switch (reportType) {
      case 'sales': return renderSalesReport();
      case 'financial': return renderFinancialReport();
      case 'vehicles': return renderVehicleReport();
      case 'profit-loss': return renderProfitLoss();
      case 'partnerships': return renderPartnershipReport();
      case 'daily': return renderDailySummary();
      case 'monthly': return renderMonthlyReport();
      case 'yearly': return renderYearlyReport();
      default: return null;
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('pageTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{t('pageSubtitle')}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportPdf}>{t('exportPdf')}</Button>
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
                <Typography variant="body2" fontWeight={reportType === rt.value ? 700 : 500} noWrap>
                  {t(rt.labelKey)}
                </Typography>
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
                <TextField fullWidth size="small" label={t('labelDate')} type="date" value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)} InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ) : reportType === 'monthly' ? (
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" label={t('labelYear')} type="number" value={monthlyYear}
                  onChange={(e) => setMonthlyYear(parseInt(e.target.value) || new Date().getFullYear())}
                  InputProps={{ inputProps: { min: 2020, max: 2099 } }}
                />
              </Grid>
            ) : reportType === 'yearly' ? (
              <>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label={t('labelStartYear')} type="number" value={yearlyStartYear}
                    onChange={(e) => setYearlyStartYear(parseInt(e.target.value) || new Date().getFullYear() - 5)}
                    InputProps={{ inputProps: { min: 2015, max: 2099 } }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label={t('labelEndYear')} type="number" value={yearlyEndYear}
                    onChange={(e) => setYearlyEndYear(parseInt(e.target.value) || new Date().getFullYear())}
                    InputProps={{ inputProps: { min: 2015, max: 2099 } }}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('labelPeriod')}</InputLabel>
                    <Select value={period} label={t('labelPeriod')} onChange={(e) => setPeriod(e.target.value)}>
                      {PERIOD_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value}>{t(p.labelKey)}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label={t('labelFrom')} type="date" value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPeriod('custom'); }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label={t('labelTo')} type="date" value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPeriod('custom'); }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={3}>
              <Button fullWidth variant="contained" startIcon={<Refresh />} onClick={fetchReport} disabled={loading}>
                {t('generateReport')}
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