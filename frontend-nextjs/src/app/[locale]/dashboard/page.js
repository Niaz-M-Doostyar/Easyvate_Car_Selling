'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
  Button,
  Skeleton,
} from '@mui/material';
import {
  DirectionsCar,
  People,
  PointOfSale,
  MonetizationOn,
  TrendingUp,
  TrendingDown,
  ArrowForward,
  AccountBalance,
  CurrencyExchange,
  Assessment,
  Add,
  Inventory2,
  BuildCircle,
  Schedule,
  Paid,
  PersonAdd,
  ReceiptLong,
  LocalShipping,
} from '@mui/icons-material';
import apiClient from '@/utils/api';
import { formatCurrency } from '@/utils/currency';

const fmtCurrency = (n) => formatCurrency(n);

const EMPTY_STATS = {
  totalVehicles: 0,
  totalCustomers: 0,
  totalSales: 0,
  totalRevenue: 0,
  totalOwnerWithdrawal: 0,
  totalCommission: 0,
  totalEmployees: 0,
  availableVehicles: 0,
  soldVehicles: 0,
  openLoans: 0,
  showroomBalance: 0,
  ownerProfit: 0,
  sharedPersons: [],
  salesTrend: 0,
  revTrend: 0,
  thisMonthSales: 0,
  thisMonthRevenue: 0,
};

const getResponsePayload = (result) => result.status === 'fulfilled' ? result.value.data : null;

// Role-based permission helper (mirror backend logic)
const canAccess = (role, module, action) => {
  const permissions = {
    'Super Admin': {
      vehicles: ['read', 'create', 'update', 'delete'],
      sales: ['read', 'create', 'update', 'delete'],
      customers: ['read', 'create', 'update', 'delete'],
      reports: ['read', 'export'],
    },
    'Owner': {
      vehicles: ['read', 'create', 'update', 'delete'],
      sales: ['read', 'create', 'update'],
      customers: ['read', 'create', 'update'],
      reports: ['read', 'export'],
    },
    'Manager': {
      vehicles: ['read', 'create', 'update'],
      sales: ['read', 'create'],
      customers: ['read', 'create', 'update'],
      reports: ['read'],
    },
    'Accountant': {
      vehicles: ['read'],
      sales: ['read'],
      customers: ['read', 'update'],
      reports: ['read', 'export'],
    },
    'Financial': {
      vehicles: ['read'],
      sales: ['read'],
      customers: ['read'],
      reports: ['read', 'export'],
    },
    'Inventory & Sales': {
      vehicles: ['read', 'create', 'update'],
      sales: ['read', 'create'],
      customers: ['read', 'create', 'update'],
      reports: ['read'],
    },
    'Sales': {
      vehicles: ['read'],
      sales: ['read', 'create'],
      customers: ['read', 'create', 'update'],
      reports: [],
    },
    'Viewer': {
      vehicles: ['read'],
      sales: ['read'],
      customers: ['read'],
      reports: [],
    },
  };
  return permissions[role]?.[module]?.includes(action) || false;
};

export default function DashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations('Dashboard');

  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [vehiclesByStatus, setVehiclesByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({ fullName: 'User', role: 'Viewer' });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.fullName) setCurrentUser(u);
    } catch {}
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehicles, customers, sales, loans, balance, employees] = await Promise.allSettled([
        apiClient.get('/vehicles'),
        apiClient.get('/customers'),
        apiClient.get('/sales'),
        apiClient.get('/loans'),
        apiClient.get('/ledger/showroom/balance'),
        apiClient.get('/employees'),
      ]);

      const vehiclesPayload = getResponsePayload(vehicles) || {};
      const customersPayload = getResponsePayload(customers) || {};
      const salesPayload = getResponsePayload(sales) || {};
      const loansPayload = getResponsePayload(loans) || {};
      const balancePayload = getResponsePayload(balance) || {};
      const employeesPayload = getResponsePayload(employees) || {};

      const v = vehiclesPayload.data || [];
      const s = salesPayload.data || [];
      const l = loansPayload.data || [];
      const c = customersPayload.data || [];
      const e = employeesPayload.data || [];
      const bal = balancePayload;

      const statusMap = {};
      v.forEach((vh) => {
        const st = vh.status || 'Unknown';
        statusMap[st] = (statusMap[st] || 0) + 1;
      });

      const totalRevenue = s.reduce((sum, sale) => sum + parseFloat(sale.sellingPrice || 0), 0);

      const now = new Date();
      const thisMonth = s.filter((sale) => {
        const d = new Date(sale.saleDate || sale.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const lastMonth = s.filter((sale) => {
        const d = new Date(sale.saleDate || sale.createdAt);
        const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === pm.getMonth() && d.getFullYear() === pm.getFullYear();
      });
      const salesTrend = lastMonth.length > 0
        ? (((thisMonth.length - lastMonth.length) / lastMonth.length) * 100).toFixed(1)
        : thisMonth.length > 0 ? 100 : 0;
      const revThisMonth = thisMonth.reduce((sum, sale) => sum + parseFloat(sale.sellingPrice || 0), 0);
      const revLastMonth = lastMonth.reduce((sum, sale) => sum + parseFloat(sale.sellingPrice || 0), 0);
      const revTrend = revLastMonth > 0
        ? (((revThisMonth - revLastMonth) / revLastMonth) * 100).toFixed(1)
        : revThisMonth > 0 ? 100 : 0;

      setStats({
        totalVehicles: v.length,
        totalCustomers: c.length,
        totalSales: s.length,
        totalRevenue,
        totalOwnerWithdrawal: bal.totalOwnerWithdrawal ?? 0,
        totalCommission: bal.totalCommission ?? 0,
        totalEmployees: e.length,
        availableVehicles: statusMap['Available'] || 0,
        soldVehicles: statusMap['Sold'] || 0,
        openLoans: l.filter((lo) => lo.status === 'Open').length,
        showroomBalance: bal.showroomBalance ?? bal.balance ?? 0,
        ownerProfit: bal.ownerProfit ?? 0,
        sharedPersons: bal.sharedPersons || [],
        salesTrend: parseFloat(salesTrend),
        revTrend: parseFloat(revTrend),
        thisMonthSales: thisMonth.length,
        thisMonthRevenue: revThisMonth,
      });

      setVehiclesByStatus(statusMap);
      setRecentSales(s.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(EMPTY_STATS);
      setRecentSales([]);
      setVehiclesByStatus({});
    } finally {
      setLoading(false);
    }
  };

  /* Loading skeleton – no translation needed */
  if (loading) {
    return (
      <Box>
        <Box mb={4}>
          <Skeleton variant="text" width={280} height={40} />
          <Skeleton variant="text" width={340} height={24} />
        </Box>
        <Grid container spacing={2.5} mb={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Skeleton variant="rounded" height={130} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2.5} mb={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={70} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {t('errorTitle')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('errorDesc')}
          </Typography>
          <Button variant="contained" onClick={fetchData}>
            {t('retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const st = stats;
  const userRole = currentUser.role || 'Viewer';
  const isRestrictedRole = ['Viewer', 'Accountant', 'Financial'].includes(userRole);

  /* Dynamic greeting */
  const hour = new Date().getHours();
  let greetingKey = 'greeting_morning';
  if (hour >= 12 && hour < 17) greetingKey = 'greeting_afternoon';
  if (hour >= 17) greetingKey = 'greeting_evening';

  /* Stat cards */
  const mainStats = [
    {
      title: t('totalRevenue'),
      value: fmtCurrency(st.totalRevenue),
      subtitle: t('salesThisMonth', { count: st.thisMonthSales }),
      icon: <MonetizationOn />,
      color: theme.palette.primary.main,
      trend: st.revTrend,
      featured: true,
    },
    {
      title: t('totalSales'),
      value: st.totalSales,
      subtitle: t('revenueThisMonth', { value: fmtCurrency(st.thisMonthRevenue) }),
      icon: <PointOfSale />,
      color: theme.palette.success.main,
      trend: st.salesTrend,
    },
    {
      title: t('totalVehicles'),
      value: st.totalVehicles,
      subtitle: t('availableNow', { count: st.availableVehicles }),
      icon: <DirectionsCar />,
      color: theme.palette.info.main,
    },
    {
      title: t('totalCustomers'),
      value: st.totalCustomers,
      subtitle: t('activeLoans', { count: st.openLoans }),
      icon: <People />,
      color: theme.palette.warning.main,
    },
  ];

  const statusColors = {
    Available: theme.palette.success.main,
    Sold: theme.palette.info.main,
    Reserved: theme.palette.warning.main,
    Coming: theme.palette.secondary.main,
    'Under Repair': theme.palette.error.main,
  };
  const statusIcons = {
    Available: <Inventory2 sx={{ fontSize: 16 }} />,
    Sold: <Paid sx={{ fontSize: 16 }} />,
    Reserved: <Schedule sx={{ fontSize: 16 }} />,
    Coming: <LocalShipping sx={{ fontSize: 16 }} />,
    'Under Repair': <BuildCircle sx={{ fontSize: 16 }} />,
  };

  // Handle navigation with permission check
  const handleNavigate = (path, module, action, e) => {
    if (!canAccess(userRole, module, action)) {
      alert(`You do not have permission to ${action} ${module}`);
      return;
    }
    router.push(path);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            {t(greetingKey)}, {currentUser.fullName?.split(' ')[0]} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('subtitle')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          {canAccess(userRole, 'reports', 'read') && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Assessment />}
              onClick={(e) => handleNavigate('/dashboard/reports', 'reports', 'read', e)}
              sx={{ fontWeight: 600 }}
            >
              {t('reports')}
            </Button>
          )}
          {canAccess(userRole, 'vehicles', 'create') && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={(e) => handleNavigate('/dashboard/vehicles', 'vehicles', 'create', e)}
              sx={{ fontWeight: 600 }}
            >
              {t('addVehicle')}
            </Button>
          )}
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3}>
        {mainStats.map((stat, i) => {
          const hasTrend = stat.trend !== undefined && stat.trend !== null;
          const isUp = stat.trend >= 0;
          return (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  ...(stat.featured && {
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.78)} 100%)`,
                    color: '#fff',
                    '& .MuiTypography-root': { color: 'inherit' },
                  }),
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          opacity: stat.featured ? 0.85 : 0.7,
                          fontSize: '0.68rem',
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          mt: 0.8,
                          mb: 0.8,
                          lineHeight: 1.1,
                          fontSize: { xs: '1.4rem', sm: '1.6rem' },
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
                        {hasTrend && (
                          <Chip
                            size="small"
                            icon={isUp ? <TrendingUp sx={{ fontSize: '14px !important' }} /> : <TrendingDown sx={{ fontSize: '14px !important' }} />}
                            label={`${isUp ? '+' : ''}${stat.trend}%`}
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: stat.featured
                                ? alpha('#fff', 0.2)
                                : alpha(isUp ? theme.palette.success.main : theme.palette.error.main, 0.1),
                              color: stat.featured ? '#fff' : isUp ? theme.palette.success.main : theme.palette.error.main,
                              '& .MuiChip-icon': { color: 'inherit' },
                            }}
                          />
                        )}
                        <Typography variant="caption" sx={{ opacity: stat.featured ? 0.8 : 0.6, fontSize: '0.7rem' }}>
                          {stat.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: stat.featured ? alpha('#fff', 0.15) : alpha(stat.color, 0.1),
                        color: stat.featured ? '#fff' : stat.color,
                        '& svg': { fontSize: 24 },
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: stat.featured ? alpha('#fff', 0.06) : alpha(stat.color, 0.04),
                    pointerEvents: 'none',
                  }}
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Financial Overview */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MiniStat label={t('showroomBalance')} value={fmtCurrency(st.showroomBalance)} icon={<AccountBalance />} color={theme.palette.success.main} theme={theme} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MiniStat label={t('ownerProfit')} value={fmtCurrency(st.ownerProfit)} icon={<CurrencyExchange />} color={theme.palette.info.main} theme={theme} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MiniStat label={t('ownerWithdrawal')} value={fmtCurrency(st.totalOwnerWithdrawal)} icon={<TrendingUp />} color={theme.palette.primary.main} theme={theme} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MiniStat label={t('commissions')} value={fmtCurrency(st.totalCommission)} icon={<Paid />} color={theme.palette.warning.main} theme={theme} />
        </Grid>
      </Grid>

      {/* Recent Sales Table */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>{t('recentSales')}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('latestTransactions', { count: recentSales.length })}</Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForward sx={{ fontSize: '14px !important' }} />} onClick={() => router.push('/dashboard/sales')} sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                  {t('viewAll')}
                </Button>
              </Box>
              <TableContainer sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('tableVehicle')}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('tableCustomer')}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{t('tableAmount')}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('tableDate')}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('tableStatus')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSales.length > 0 ? (
                      recentSales.map((sale) => (
                        <TableRow key={sale.id || sale.saleId} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.2}>
                              <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, fontSize: '0.75rem', fontWeight: 700 }}>
                                <DirectionsCar sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{sale.vehicle?.manufacturer || 'N/A'}</Typography>
                                <Typography variant="caption" color="text.secondary">{sale.vehicle?.model || `#${sale.vehicleId}`}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{sale.customer?.fullName || `Customer #${sale.customerId}`}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color="primary.main">{fmtCurrency(sale.sellingPrice)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sale.paymentStatus || (parseFloat(sale.remainingAmount) > 0 ? 'Partial' : 'Paid')}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: alpha(
                                  (sale.paymentStatus === 'Paid' || parseFloat(sale.remainingAmount || 0) <= 0) ? theme.palette.success.main : sale.paymentStatus === 'Partial' ? theme.palette.warning.main : theme.palette.error.main,
                                  0.1,
                                ),
                                color: (sale.paymentStatus === 'Paid' || parseFloat(sale.remainingAmount || 0) <= 0) ? theme.palette.success.main : sale.paymentStatus === 'Partial' ? theme.palette.warning.main : theme.palette.error.main,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Box>
                            <PointOfSale sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">{t('noSales')}</Typography>
                            <Button size="small" variant="outlined" startIcon={<Add />} sx={{ mt: 1.5, fontWeight: 600 }} onClick={() => router.push('/dashboard/sales')}>
                              {t('createFirstSale')}
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>{t('inventoryStatus')}</Typography>
                    <Chip label={t('totalLabel', { count: st.totalVehicles })} size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {Object.entries(vehiclesByStatus).map(([status, count]) => {
                      const pct = st.totalVehicles > 0 ? (count / st.totalVehicles) * 100 : 0;
                      const color = statusColors[status] || theme.palette.text.secondary;
                      return (
                        <Box key={status}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Box display="flex" alignItems="center" gap={0.8}>
                              <Avatar sx={{ width: 26, height: 26, bgcolor: alpha(color, 0.1), color }}>
                                {statusIcons[status] || <DirectionsCar sx={{ fontSize: 14 }} />}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{status}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>{count}</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, bgcolor: alpha(color, 0.08), '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
                        </Box>
                      );
                    })}
                    {Object.keys(vehiclesByStatus).length === 0 && (
                      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                        {t('noSales')}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions – only show if user has ANY create access */}
            {(canAccess(userRole, 'vehicles', 'create') ||
              canAccess(userRole, 'sales', 'create') ||
              canAccess(userRole, 'customers', 'create') ||
              canAccess(userRole, 'reports', 'read')) && (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', mb: 2 }}>{t('quickActions')}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      {canAccess(userRole, 'vehicles', 'create') && (
                        <Box
                          onClick={(e) => handleNavigate('/dashboard/vehicles', 'vehicles', 'create', e)}
                          sx={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, py: 1.8, borderRadius: 2, cursor: 'pointer',
                            border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s ease',
                            '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.04), transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}` },
                          }}
                        >
                          <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, '& svg': { fontSize: 20 } }}>
                            <DirectionsCar />
                          </Avatar>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{t('newVehicle')}</Typography>
                        </Box>
                      )}
                      {canAccess(userRole, 'sales', 'create') && (
                        <Box
                          onClick={(e) => handleNavigate('/dashboard/sales', 'sales', 'create', e)}
                          sx={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, py: 1.8, borderRadius: 2, cursor: 'pointer',
                            border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s ease',
                            '&:hover': { borderColor: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.04), transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}` },
                          }}
                        >
                          <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, '& svg': { fontSize: 20 } }}>
                            <ReceiptLong />
                          </Avatar>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{t('newSale')}</Typography>
                        </Box>
                      )}
                      {canAccess(userRole, 'customers', 'create') && (
                        <Box
                          onClick={(e) => handleNavigate('/dashboard/customers', 'customers', 'create', e)}
                          sx={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, py: 1.8, borderRadius: 2, cursor: 'pointer',
                            border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s ease',
                            '&:hover': { borderColor: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.04), transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}` },
                          }}
                        >
                          <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, '& svg': { fontSize: 20 } }}>
                            <PersonAdd />
                          </Avatar>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{t('addCustomer')}</Typography>
                        </Box>
                      )}
                      {canAccess(userRole, 'reports', 'read') && (
                        <Box
                          onClick={(e) => handleNavigate('/dashboard/reports', 'reports', 'read', e)}
                          sx={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, py: 1.8, borderRadius: 2, cursor: 'pointer',
                            border: `1px solid ${theme.palette.divider}`, transition: 'all 0.15s ease',
                            '&:hover': { borderColor: theme.palette.warning.main, bgcolor: alpha(theme.palette.warning.main, 0.04), transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.15)}` },
                          }}
                        >
                          <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, '& svg': { fontSize: 20 } }}>
                            <Assessment />
                          </Avatar>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{t('viewReports')}</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Partners */}
      {st.sharedPersons.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>{t('partnersTitle')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('partnersSubtitle')}</Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              {st.sharedPersons.map((person, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5, transition: 'all 0.15s ease', '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                    <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontSize: '0.85rem', fontWeight: 700 }}>
                      {person.personName?.charAt(0) || '?'}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={600} noWrap>{person.personName}</Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">{fmtCurrency(person.total)}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Bottom KPI Row */}
      <Grid container spacing={2.5}>
        <Grid item xs={6} sm={3}>
          <KpiPill label={t('employees')} value={st.totalEmployees} color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiPill label={t('openLoans')} value={st.openLoans} color={theme.palette.error.main} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiPill label={t('soldVehicles')} value={st.soldVehicles} color={theme.palette.success.main} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiPill label={t('available')} value={st.availableVehicles} color={theme.palette.info.main} />
        </Grid>
      </Grid>
    </Box>
  );
}

/* MiniStat – unchanged except using prop labels */
function MiniStat({ label, value, icon, color, theme }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 42, height: 42, bgcolor: alpha(color, 0.1), color, '& svg': { fontSize: 22 } }}>{icon}</Avatar>
        <Box flex={1} minWidth={0}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</Typography>
          <Typography variant="body1" fontWeight={700} noWrap sx={{ fontSize: '0.95rem' }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function KpiPill({ label, value, color }) {
  return (
    <Card>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800} sx={{ color }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.68rem' }}>{label}</Typography>
      </CardContent>
    </Card>
  );
}