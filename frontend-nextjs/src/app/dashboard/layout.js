'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  alpha,
  useTheme,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  DirectionsCar,
  People,
  PointOfSale,
  Person,
  CalendarMonth,
  Payments,
  MonetizationOn,
  Assessment,
  Logout,
  CurrencyExchange,
  Payment,
  ManageAccounts,
  Info,
  ContactMail,
  DarkMode,
  LightMode,
  Settings,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useThemeMode } from '@/contexts/ThemeContext';
import SettingsDrawer from '@/components/SettingsDrawer';
// import { text } from 'stream/consumers';

const drawerWidth = 280;

const ALL_MENU_ITEMS = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Vehicles', icon: <DirectionsCar />, path: '/dashboard/vehicles' },
  { text: 'Customers', icon: <People />, path: '/dashboard/customers' },
  { text: 'Sales', icon: <PointOfSale />, path: '/dashboard/sales' },
  { text: 'Employees', icon: <Person />, path: '/dashboard/employees' },
  { text: 'Attendance', icon: <CalendarMonth />, path: '/dashboard/attendance' },
  { text: 'Payroll', icon: <Payment />, path: '/dashboard/payroll' },
  { text: 'Showroom Ledger', icon: <Payments />, path: '/dashboard/showroom-ledger' },
  { text: 'Currency Exchange', icon: <CurrencyExchange />, path: '/dashboard/currency' },
  { text: 'Loans & Debts', icon: <MonetizationOn />, path: '/dashboard/loans' },
  { text: 'Reports', icon: <Assessment />, path: '/dashboard/reports' },
  { text: 'Users & Roles', icon: <ManageAccounts />, path: '/dashboard/users' },
  { text: 'Website About', icon: <Info />, path: '/dashboard/about'},
  { text: 'Website Team', icon: <People />, path: '/dashboard/team'},
  { text: 'Website Contact', icon: <ContactMail />, path: '/dashboard/contact'},
  { text: 'Website Slider', icon: <ContactMail />, path: '/dashboard/carousel'},
  { text: 'Website Review', icon: <ContactMail />, path: '/dashboard/testimonial'},
  { text: 'Website Video', icon: <ContactMail />, path: '/dashboard/choose-video'},
  { text: 'Settings', icon: <Settings />, path: '/dashboard/settings' },
];

// Role-based menu access mapping (must match backend User model ENUM roles)
const ROLE_ACCESS = {
  'Super Admin': null, // null = all items
  'Owner': null,
  'Manager': ['Dashboard', 'Vehicles', 'Customers', 'Sales', 'Employees', 'Attendance', 'Payroll', 'Showroom Ledger', 'Currency Exchange', 'Loans & Debts', 'Reports', 'Website About', 'Website Team', 'Website Slider', 'Website Review', 'Website Video'],
  'Accountant': ['Dashboard', 'Showroom Ledger', 'Currency Exchange', 'Loans & Debts', 'Payroll', 'Reports'],
  'Financial': ['Dashboard', 'Showroom Ledger', 'Currency Exchange', 'Loans & Debts', 'Payroll', 'Reports'],
  'Inventory & Sales': ['Dashboard', 'Vehicles', 'Customers', 'Sales', 'Currency Exchange', 'Reports'],
  'Sales': ['Dashboard', 'Vehicles', 'Customers', 'Sales', 'Currency Exchange'],
  'Viewer': ['Dashboard', 'Reports'],
};

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleMode } = useThemeMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({ fullName: 'Admin User', role: 'Administrator' });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.fullName) {
          setCurrentUser(user);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [router]);

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const role = currentUser.role || 'Viewer';
    const allowed = ROLE_ACCESS[role];
    if (allowed === null || allowed === undefined) return ALL_MENU_ITEMS; // Administrator or unknown = full access
    return ALL_MENU_ITEMS.filter((item) => allowed.includes(item.text));
  }, [currentUser.role]);

  // Group website-prefixed items under a single "Website" parent
  const [openWebsite, setOpenWebsite] = useState(false);
  const groupedMenuItems = useMemo(() => {
    const prefix = 'Website';
    const websites = menuItems.filter((i) => i.text.startsWith(prefix));
    if (websites.length === 0) return menuItems;

    const children = websites.map((child) => ({ ...child, text: child.text.replace(new RegExp('^' + prefix + "\\s+"), '') }));
    const parent = { text: 'Website', icon: <Info />, children };

    // Build a new ordered list, replacing the first sequence of website items with the parent
    const res = [];
    let inserted = false;
    for (const it of menuItems) {
      if (it.text.startsWith(prefix)) {
        if (!inserted) {
          res.push(parent);
          inserted = true;
        }
        // skip individual website items
      } else {
        res.push(it);
      }
    }
    return res;
  }, [menuItems]);

  // auto-expand Website group if a child path is active
  useEffect(() => {
    const active = menuItems.some((i) => i.text.startsWith('Website') && pathname.startsWith(i.path));
    if (active) setOpenWebsite(true);
  }, [pathname, menuItems]);

  // Don't render dashboard until authentication is verified
  if (!isAuthenticated) {
    return null;
  }

  // ─── Read sidebar colours from the theme's appearance config ───
  const cfg = theme.customAppearance?.config || {};
  const sidebarBg        = cfg.sidebarBg        || theme.palette.background.paper;
  const sidebarTextColor = cfg.sidebarText       || theme.palette.text.primary;
  const sidebarTextSecondary = cfg.sidebarTextSecondary || theme.palette.text.secondary;
  const sidebarDivider   = cfg.sidebarDivider    || theme.palette.divider;
  const sidebarHover     = cfg.sidebarHover      || theme.palette.action.hover;
  const sidebarUserBg    = cfg.sidebarUserBg     || (theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.03)');
  const sidebarUserBorder = cfg.sidebarUserBorder || (theme.palette.mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)');
  const sidebarScrollbar = cfg.sidebarScrollbar  || (theme.palette.mode === 'light' ? '#cbd5e1' : '#475569');
  const isDarkSidebar    = sidebarBg !== '#ffffff' && sidebarBg !== theme.palette.background.default;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    router.push(path);
    setMobileOpen(false);
  };

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: sidebarBg,
      color: sidebarTextColor,
      borderRight: `1px solid ${sidebarDivider}`,
    }}>
      {/* Logo Section */}
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
          }}
        >
          <DirectionsCar sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box flex={1}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: sidebarTextColor, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Easyvate
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: sidebarTextSecondary, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Car Management
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: sidebarScrollbar, borderRadius: 2 } }}>
        {groupedMenuItems.map((item) => {
          // If item has children, render a collapsible group
          if (item.children) {
            const childActive = item.children.some((c) => pathname.startsWith(c.path));
            return (
              <Box key={item.text}>
                <ListItem disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    onClick={() => setOpenWebsite((s) => !s)}
                    sx={{
                      borderRadius: '8px',
                      py: 0.9,
                      px: 1.5,
                      transition: 'all 0.15s ease',
                      backgroundColor: childActive
                        ? alpha(theme.palette.primary.main, isDarkSidebar ? 0.15 : 0.08)
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: childActive
                          ? alpha(theme.palette.primary.main, isDarkSidebar ? 0.2 : 0.12)
                          : sidebarHover,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: childActive ? theme.palette.primary.main : sidebarTextSecondary, '& svg': { fontSize: '1.2rem' } }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: '0.835rem', fontWeight: childActive ? 600 : 500, color: childActive ? theme.palette.primary.main : sidebarTextColor }}
                    />
                    {openWebsite ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openWebsite} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 3 }}> 
                    {item.children.map((child) => {
                      const isActive = pathname === child.path || pathname.startsWith(child.path);
                      return (
                        <ListItem key={child.text} disablePadding sx={{ mb: 0.25 }}>
                          <ListItemButton
                            onClick={() => handleMenuClick(child.path)}
                            sx={{
                              borderRadius: '8px',
                              py: 0.7,
                              px: 1.5,
                              transition: 'all 0.12s ease',
                              backgroundColor: isActive
                                ? alpha(theme.palette.primary.main, isDarkSidebar ? 0.12 : 0.06)
                                : 'transparent',
                              '&:hover': { backgroundColor: isActive ? alpha(theme.palette.primary.main, isDarkSidebar ? 0.15 : 0.09) : sidebarHover },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 34, color: isActive ? theme.palette.primary.main : sidebarTextSecondary, '& svg': { fontSize: '1.05rem' } }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText primary={child.text} primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 500, color: isActive ? theme.palette.primary.main : sidebarTextColor }} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }

          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  borderRadius: '8px',
                  py: 0.9,
                  px: 1.5,
                  transition: 'all 0.15s ease',
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, isDarkSidebar ? 0.15 : 0.08)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, isDarkSidebar ? 0.2 : 0.12)
                      : sidebarHover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: isActive ? theme.palette.primary.main : sidebarTextSecondary,
                    '& svg': { fontSize: '1.2rem' },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.835rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? theme.palette.primary.main : sidebarTextColor,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Info Section */}
      <Box
        sx={{
          p: 1.5,
          mx: 1.5,
          mb: 1.5,
          borderRadius: '10px',
          backgroundColor: sidebarUserBg,
          border: `1px solid ${sidebarUserBorder}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {currentUser.fullName?.charAt(0) || 'A'}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: sidebarTextColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.fullName || 'Admin User'}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: sidebarTextSecondary }}>
              {currentUser.role || 'Administrator'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: 'inherit' }}
          >
            <MenuIcon />
          </IconButton>

          <Box flex={1} />

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              onClick={toggleMode}
              size="small"
              sx={{
                mr: 0.5,
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.text.primary },
              }}
            >
              {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Profile Avatar */}
          <Avatar
            onClick={handleProfileMenu}
            sx={{
              width: 34,
              height: 34,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              transition: 'box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            {currentUser.fullName?.charAt(0) || 'A'}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 180,
            borderRadius: '10px',
            boxShadow: theme.palette.mode === 'light' ? '0 10px 40px rgba(0,0,0,0.12)' : '0 10px 40px rgba(0,0,0,0.4)',
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
          <Logout sx={{ mr: 1.5, fontSize: 18 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </Box>

      {/* Floating Settings Button */}
      <SettingsDrawer />
    </Box>
  );
}
