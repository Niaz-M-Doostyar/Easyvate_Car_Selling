'use client';
import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used within ThemeProvider');
  return context;
};

/* ── Color presets ───────────────────────────────────────── */
const colorPresets = {
  default: { primary: '#4f46e5', secondary: '#6366f1' },
  blue:    { primary: '#2563eb', secondary: '#3b82f6' },
  purple:  { primary: '#7c3aed', secondary: '#8b5cf6' },
  green:   { primary: '#059669', secondary: '#10b981' },
  orange:  { primary: '#ea580c', secondary: '#f97316' },
  pink:    { primary: '#db2777', secondary: '#ec4899' },
  red:     { primary: '#dc2626', secondary: '#ef4444' },
  teal:    { primary: '#0d9488', secondary: '#14b8a6' },
  cyan:    { primary: '#0891b2', secondary: '#06b6d4' },
  amber:   { primary: '#d97706', secondary: '#f59e0b' },
  rose:    { primary: '#e11d48', secondary: '#f43f5e' },
  indigo:  { primary: '#4338ca', secondary: '#6366f1' },
  emerald: { primary: '#047857', secondary: '#10b981' },
  slate:   { primary: '#475569', secondary: '#64748b' },
};

/* ── Appearance mode configs ─────────────────────────────── 
   Every mode now carries full sidebar + accent info so
   layout never needs to hardcode any colours.            */
const appearanceConfigs = {
  light: {
    baseMode: 'light',
    bg: '#f1f5f9',
    paper: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    divider: '#e2e8f0',
    /* sidebar follows paper */
    sidebarBg: '#ffffff',
    sidebarText: '#0f172a',
    sidebarTextSecondary: '#64748b',
    sidebarDivider: '#e2e8f0',
    sidebarHover: 'rgba(0,0,0,0.03)',
    sidebarUserBg: '#f8fafc',
    sidebarUserBorder: '#f1f5f9',
    sidebarScrollbar: '#cbd5e1',
    accent: null,           /* null = use colorPreset */
  },
  dark: {
    baseMode: 'dark',
    bg: '#0f172a',
    paper: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    divider: '#334155',
    sidebarBg: '#0f172a',
    sidebarText: '#f1f5f9',
    sidebarTextSecondary: '#94a3b8',
    sidebarDivider: '#1e293b',
    sidebarHover: 'rgba(255,255,255,0.04)',
    sidebarUserBg: 'rgba(255,255,255,0.03)',
    sidebarUserBorder: 'rgba(255,255,255,0.06)',
    sidebarScrollbar: '#475569',
    accent: null,
  },
  'semi-dark': {
    baseMode: 'light',
    bg: '#f1f5f9',
    paper: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    divider: '#e2e8f0',
    sidebarBg: '#111827',
    sidebarText: '#f9fafb',
    sidebarTextSecondary: '#9ca3af',
    sidebarDivider: 'rgba(255,255,255,0.06)',
    sidebarHover: 'rgba(255,255,255,0.04)',
    sidebarUserBg: 'rgba(255,255,255,0.03)',
    sidebarUserBorder: 'rgba(255,255,255,0.06)',
    sidebarScrollbar: '#4b5563',
    accent: null,
  },
  dim: {
    baseMode: 'dark',
    bg: '#18181b',
    paper: '#27272a',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    divider: '#3f3f46',
    sidebarBg: '#18181b',
    sidebarText: '#fafafa',
    sidebarTextSecondary: '#a1a1aa',
    sidebarDivider: '#27272a',
    sidebarHover: 'rgba(255,255,255,0.04)',
    sidebarUserBg: 'rgba(255,255,255,0.03)',
    sidebarUserBorder: 'rgba(255,255,255,0.06)',
    sidebarScrollbar: '#52525b',
    accent: null,
  },

  /* ── Premium ─────────────────────────────────────────── */
  midnight: {
    baseMode: 'dark',
    bg: '#0a0e27',
    paper: '#131640',
    textPrimary: '#e2e8f0',
    textSecondary: '#8892b0',
    divider: '#1e2456',
    sidebarBg: '#080b1f',
    sidebarText: '#e2e8f0',
    sidebarTextSecondary: '#6b7394',
    sidebarDivider: '#151942',
    sidebarHover: 'rgba(99,102,241,0.06)',
    sidebarUserBg: 'rgba(99,102,241,0.06)',
    sidebarUserBorder: 'rgba(99,102,241,0.1)',
    sidebarScrollbar: '#2a2f62',
    accent: '#818cf8',
  },
  nord: {
    baseMode: 'dark',
    bg: '#2e3440',
    paper: '#3b4252',
    textPrimary: '#eceff4',
    textSecondary: '#d8dee9',
    divider: '#434c5e',
    sidebarBg: '#2e3440',
    sidebarText: '#eceff4',
    sidebarTextSecondary: '#b4bfcc',
    sidebarDivider: '#3b4252',
    sidebarHover: 'rgba(136,192,208,0.06)',
    sidebarUserBg: 'rgba(136,192,208,0.05)',
    sidebarUserBorder: 'rgba(136,192,208,0.1)',
    sidebarScrollbar: '#4c566a',
    accent: '#88c0d0',
  },
  sunset: {
    baseMode: 'light',
    bg: '#fef7ed',
    paper: '#ffffff',
    textPrimary: '#451a03',
    textSecondary: '#92400e',
    divider: '#fed7aa',
    sidebarBg: '#7c2d12',
    sidebarText: '#fff7ed',
    sidebarTextSecondary: '#fdba74',
    sidebarDivider: 'rgba(255,255,255,0.1)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarUserBg: 'rgba(255,255,255,0.06)',
    sidebarUserBorder: 'rgba(255,255,255,0.1)',
    sidebarScrollbar: '#9a3412',
    accent: '#ea580c',
  },
  dracula: {
    baseMode: 'dark',
    bg: '#282a36',
    paper: '#343746',
    textPrimary: '#f8f8f2',
    textSecondary: '#bd93f9',
    divider: '#44475a',
    sidebarBg: '#21222c',
    sidebarText: '#f8f8f2',
    sidebarTextSecondary: '#a580d8',
    sidebarDivider: '#343746',
    sidebarHover: 'rgba(189,147,249,0.06)',
    sidebarUserBg: 'rgba(189,147,249,0.05)',
    sidebarUserBorder: 'rgba(189,147,249,0.1)',
    sidebarScrollbar: '#44475a',
    accent: '#bd93f9',
  },
  coffee: {
    baseMode: 'dark',
    bg: '#1a1210',
    paper: '#2a1f1a',
    textPrimary: '#f5e6d3',
    textSecondary: '#c4a882',
    divider: '#3d2e24',
    sidebarBg: '#15100e',
    sidebarText: '#f5e6d3',
    sidebarTextSecondary: '#a38a6b',
    sidebarDivider: '#2a1f1a',
    sidebarHover: 'rgba(196,168,130,0.06)',
    sidebarUserBg: 'rgba(196,168,130,0.05)',
    sidebarUserBorder: 'rgba(196,168,130,0.1)',
    sidebarScrollbar: '#3d2e24',
    accent: '#c4a882',
  },
  arctic: {
    baseMode: 'light',
    bg: '#f0f4f8',
    paper: '#ffffff',
    textPrimary: '#1a2b3c',
    textSecondary: '#546e7a',
    divider: '#cfd8dc',
    sidebarBg: '#1a2b3c',
    sidebarText: '#eceff1',
    sidebarTextSecondary: '#90a4ae',
    sidebarDivider: 'rgba(255,255,255,0.08)',
    sidebarHover: 'rgba(255,255,255,0.05)',
    sidebarUserBg: 'rgba(255,255,255,0.05)',
    sidebarUserBorder: 'rgba(255,255,255,0.08)',
    sidebarScrollbar: '#37474f',
    accent: '#0288d1',
  },

  sakura: {
    baseMode: 'light',
    bg: '#fdf2f8',
    paper: '#ffffff',
    textPrimary: '#4a1942',
    textSecondary: '#9d4e8f',
    divider: '#fce7f3',
    sidebarBg: '#831843',
    sidebarText: '#fdf2f8',
    sidebarTextSecondary: '#f9a8d4',
    sidebarDivider: 'rgba(255,255,255,0.1)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarUserBg: 'rgba(255,255,255,0.06)',
    sidebarUserBorder: 'rgba(255,255,255,0.1)',
    sidebarScrollbar: '#9d174d',
    accent: '#ec4899',
  },
  lavender: {
    baseMode: 'light',
    bg: '#f5f3ff',
    paper: '#ffffff',
    textPrimary: '#2e1065',
    textSecondary: '#7c3aed',
    divider: '#e9d5ff',
    sidebarBg: '#4c1d95',
    sidebarText: '#f5f3ff',
    sidebarTextSecondary: '#c4b5fd',
    sidebarDivider: 'rgba(255,255,255,0.1)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarUserBg: 'rgba(255,255,255,0.06)',
    sidebarUserBorder: 'rgba(255,255,255,0.1)',
    sidebarScrollbar: '#5b21b6',
    accent: '#8b5cf6',
  },
};

/* ── Provider ────────────────────────────────────────────── */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [colorPreset, setColorPreset] = useState('default');
  const [borderRadius, setBorderRadius] = useState(10);
  const [sidebarMode, setSidebarMode] = useState('full');
  const [fontSize, setFontSize] = useState('medium');
  const [autoMode, setAutoMode] = useState(false);
  const [cardStyle, setCardStyle] = useState('bordered');
  const [compactMode, setCompactMode] = useState('comfortable');

  // Hydrate from localStorage
  useEffect(() => {
    setMode(localStorage.getItem('themeMode') || 'light');
    setColorPreset(localStorage.getItem('colorPreset') || 'default');
    setBorderRadius(parseInt(localStorage.getItem('borderRadius') || '10'));
    setSidebarMode(localStorage.getItem('sidebarMode') || 'full');
    setFontSize(localStorage.getItem('fontSize') || 'medium');
    setCardStyle(localStorage.getItem('cardStyle') || 'bordered');
    setCompactMode(localStorage.getItem('compactMode') || 'comfortable');
    const auto = localStorage.getItem('autoMode') === 'true';
    setAutoMode(auto);
    if (auto) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setMode(mq.matches ? 'dark' : 'light');
      const handler = (e) => setMode(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  /* ── Build theme ───────────────────────────────────────── */
  const theme = useMemo(() => {
    const config = appearanceConfigs[mode] || appearanceConfigs.light;
    const { baseMode } = config;
    const colors = colorPresets[colorPreset] || colorPresets.default;
    const fsMul = fontSize === 'small' ? 0.9 : fontSize === 'large' ? 1.1 : 1;
    const isLight = baseMode === 'light';
    const dPad = compactMode === 'compact' ? 0.75 : compactMode === 'spacious' ? 1.3 : 1;

    return createTheme({
      palette: {
        mode: baseMode,
        primary: {
          main: colors.primary,
          light: alpha(colors.primary, 0.16),
          dark: colors.secondary,
          contrastText: '#ffffff',
        },
        secondary: {
          main: colors.secondary,
          contrastText: '#ffffff',
        },
        background: {
          default: config.bg,
          paper: config.paper,
        },
        text: {
          primary: config.textPrimary,
          secondary: config.textSecondary,
        },
        divider: config.divider,
        success: {
          main: '#10b981',
          light: isLight ? '#ecfdf5' : alpha('#10b981', 0.16),
          dark: '#059669',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#f59e0b',
          light: isLight ? '#fffbeb' : alpha('#f59e0b', 0.16),
          dark: '#d97706',
          contrastText: '#ffffff',
        },
        error: {
          main: '#ef4444',
          light: isLight ? '#fef2f2' : alpha('#ef4444', 0.16),
          dark: '#dc2626',
          contrastText: '#ffffff',
        },
        info: {
          main: '#3b82f6',
          light: isLight ? '#eff6ff' : alpha('#3b82f6', 0.16),
          dark: '#2563eb',
          contrastText: '#ffffff',
        },
        action: {
          hover: alpha(colors.primary, 0.06),
          selected: alpha(colors.primary, 0.1),
          hoverOpacity: 0.06,
        },
      },

      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        fontSize: 14 * fsMul,
        h1: { fontWeight: 800, fontSize: `${2.25 * fsMul}rem`, letterSpacing: '-0.02em', lineHeight: 1.2 },
        h2: { fontWeight: 700, fontSize: `${1.875 * fsMul}rem`, letterSpacing: '-0.01em', lineHeight: 1.25 },
        h3: { fontWeight: 700, fontSize: `${1.5 * fsMul}rem`, letterSpacing: '-0.01em', lineHeight: 1.3 },
        h4: { fontWeight: 700, fontSize: `${1.25 * fsMul}rem`, lineHeight: 1.35 },
        h5: { fontWeight: 600, fontSize: `${1.1 * fsMul}rem`, lineHeight: 1.45 },
        h6: { fontWeight: 600, fontSize: `${1 * fsMul}rem`, lineHeight: 1.5 },
        subtitle1: { fontWeight: 600, fontSize: `${0.95 * fsMul}rem` },
        subtitle2: { fontWeight: 600, fontSize: `${0.875 * fsMul}rem` },
        body1: { fontSize: `${0.9375 * fsMul}rem`, lineHeight: 1.6 },
        body2: { fontSize: `${0.875 * fsMul}rem`, lineHeight: 1.55 },
        caption: { fontSize: `${0.75 * fsMul}rem`, lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
      },

      shape: { borderRadius },

      shadows: [
        'none',
        isLight ? '0 1px 2px rgba(0,0,0,0.05)' : '0 1px 2px rgba(0,0,0,0.3)',
        isLight ? '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.35)',
        isLight ? '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)' : '0 4px 6px rgba(0,0,0,0.4)',
        isLight ? '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)' : '0 10px 15px rgba(0,0,0,0.4)',
        isLight ? '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.03)' : '0 20px 25px rgba(0,0,0,0.45)',
        isLight ? '0 25px 50px -12px rgba(0,0,0,0.15)' : '0 25px 50px rgba(0,0,0,0.5)',
        ...Array(18).fill(isLight ? '0 25px 50px -12px rgba(0,0,0,0.15)' : '0 25px 50px rgba(0,0,0,0.5)'),
      ],

      components: {
        /* ── Global ────────────────────────────────────── */
        MuiCssBaseline: {
          styleOverrides: {
            '*, *::before, *::after': {
              transition: 'background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, color 0.2s ease',
            },
            /* Exclude inputs & animations from blanket transition */
            'input, textarea, select, .MuiCircularProgress-root, .MuiCircularProgress-root *, .MuiLinearProgress-root *, .MuiSkeleton-root': {
              transition: 'none !important',
            },
            body: {
              scrollbarWidth: 'thin',
              scrollbarColor: `${isLight ? '#cbd5e1' : '#475569'} transparent`,
              '&::-webkit-scrollbar': { width: 6, height: 6 },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: isLight ? '#cbd5e1' : '#475569',
                borderRadius: 3,
              },
            },
          },
        },

        /* ── Buttons ───────────────────────────────────── */
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: Math.max(borderRadius - 2, 6),
              padding: `${Math.round(8 * dPad)}px ${Math.round(18 * dPad)}px`,
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease',
            },
            contained: {
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
              },
            },
            outlined: {
              borderWidth: 1.5,
              '&:hover': { borderWidth: 1.5, backgroundColor: alpha(colors.primary, 0.04) },
            },
            text: {
              '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
            },
            sizeSmall: { padding: '5px 12px', fontSize: '0.8125rem' },
            sizeLarge: { padding: '11px 28px', fontSize: '0.9375rem' },
          },
        },
        MuiFab: {
          styleOverrides: {
            root: {
              boxShadow: `0 4px 14px ${alpha(colors.primary, 0.35)}`,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: { transition: 'all 0.15s ease' },
          },
        },

        /* ── Cards & Paper ──────────────────────────────── */
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius,
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
              ...(cardStyle === 'elevated' ? {
                border: 'none',
                boxShadow: isLight
                  ? '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
                  : '0 4px 20px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isLight
                    ? '0 12px 32px rgba(0,0,0,0.12)'
                    : '0 12px 32px rgba(0,0,0,0.5)',
                },
              } : cardStyle === 'glass' ? {
                border: `1px solid ${alpha(config.divider, 0.3)}`,
                backgroundColor: alpha(config.paper, 0.65),
                backdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: isLight
                  ? '0 4px 30px rgba(0,0,0,0.04)'
                  : '0 4px 30px rgba(0,0,0,0.25)',
                '&:hover': {
                  backgroundColor: alpha(config.paper, 0.8),
                  boxShadow: isLight
                    ? '0 8px 32px rgba(0,0,0,0.08)'
                    : '0 8px 32px rgba(0,0,0,0.35)',
                },
              } : {
                /* bordered (default) */
                border: `1px solid ${config.divider}`,
                boxShadow: isLight
                  ? '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'
                  : '0 1px 3px rgba(0,0,0,0.2)',
                '&:hover': {
                  boxShadow: isLight
                    ? '0 8px 24px rgba(0,0,0,0.07)'
                    : '0 8px 24px rgba(0,0,0,0.35)',
                },
              }),
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              padding: Math.round(20 * dPad),
              '&:last-child': { paddingBottom: Math.round(20 * dPad) },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              ...(cardStyle === 'glass' ? {
                backgroundColor: alpha(config.paper, 0.7),
                backdropFilter: 'blur(12px) saturate(180%)',
              } : {}),
            },
          },
        },

        /* ── Forms ──────────────────────────────────────── */
        MuiTextField: {
          defaultProps: { size: 'medium', variant: 'outlined' },
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: Math.max(borderRadius - 2, 6),
                transition: 'box-shadow 0.15s ease',
                '& fieldset': {
                  borderColor: config.divider,
                  transition: 'border-color 0.15s ease',
                },
                '&:hover fieldset': {
                  borderColor: alpha(colors.primary, 0.5),
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
                },
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: Math.max(borderRadius - 2, 6),
              '& fieldset': { borderColor: config.divider },
              '&:hover fieldset': { borderColor: alpha(colors.primary, 0.5) },
              '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: 2 },
              '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}` },
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              fontWeight: 500,
              fontSize: '0.875rem',
              '&.Mui-focused': { color: colors.primary },
            },
          },
        },
        MuiFormControl: {
          styleOverrides: {
            root: { '& .MuiOutlinedInput-root': { borderRadius: Math.max(borderRadius - 2, 6) } },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: { borderRadius: Math.max(borderRadius - 2, 6) },
          },
        },
        MuiAutocomplete: {
          styleOverrides: {
            paper: {
              borderRadius: Math.max(borderRadius - 2, 6),
              border: `1px solid ${config.divider}`,
              boxShadow: isLight
                ? '0 10px 40px rgba(0,0,0,0.1)'
                : '0 10px 40px rgba(0,0,0,0.4)',
            },
          },
        },

        /* ── Tables ─────────────────────────────────────── */
        MuiTableContainer: {
          styleOverrides: {
            root: {
              borderRadius,
              border: `1px solid ${config.divider}`,
              overflow: 'hidden',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: `${Math.round(12 * dPad)}px ${Math.round(16 * dPad)}px`,
              fontSize: '0.875rem',
              borderBottom: `1px solid ${isLight ? '#f1f5f9' : 'rgba(255,255,255,0.04)'}`,
            },
            head: {
              fontWeight: 700,
              fontSize: '0.75rem',
              color: isLight ? '#64748b' : '#94a3b8',
              backgroundColor: isLight ? '#f8fafc' : alpha(colors.primary, 0.04),
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: `2px solid ${config.divider}`,
              whiteSpace: 'nowrap',
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.1s ease',
              '&:hover': {
                backgroundColor: isLight ? '#f8fafc' : alpha(colors.primary, 0.03),
              },
              '&:last-child td': { borderBottom: 0 },
            },
          },
        },

        /* ── Dialogs ────────────────────────────────────── */
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: borderRadius + 4,
              boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
              border: `1px solid ${config.divider}`,
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              fontSize: '1.125rem',
              fontWeight: 700,
              padding: '20px 24px 12px',
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: { padding: '12px 24px 20px' },
          },
        },
        MuiDialogActions: {
          styleOverrides: {
            root: {
              padding: '12px 24px 20px',
              gap: 8,
            },
          },
        },

        /* ── Chips ──────────────────────────────────────── */
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 26,
            },
            colorSuccess: {
              backgroundColor: isLight ? '#ecfdf5' : alpha('#10b981', 0.16),
              color: isLight ? '#059669' : '#34d399',
            },
            colorError: {
              backgroundColor: isLight ? '#fef2f2' : alpha('#ef4444', 0.16),
              color: isLight ? '#dc2626' : '#f87171',
            },
            colorWarning: {
              backgroundColor: isLight ? '#fffbeb' : alpha('#f59e0b', 0.16),
              color: isLight ? '#d97706' : '#fbbf24',
            },
            colorInfo: {
              backgroundColor: isLight ? '#eff6ff' : alpha('#3b82f6', 0.16),
              color: isLight ? '#2563eb' : '#60a5fa',
            },
            colorPrimary: {
              backgroundColor: alpha(colors.primary, isLight ? 0.1 : 0.16),
              color: isLight ? colors.primary : colors.secondary,
            },
          },
        },

        /* ── Menu / Popover ─────────────────────────────── */
        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: Math.max(borderRadius - 2, 6),
              border: `1px solid ${config.divider}`,
              boxShadow: isLight
                ? '0 10px 40px rgba(0,0,0,0.1)'
                : '0 10px 40px rgba(0,0,0,0.4)',
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              fontSize: '0.875rem',
              borderRadius: 4,
              margin: '2px 6px',
              padding: '8px 12px',
              transition: 'background-color 0.1s ease',
            },
          },
        },
        MuiPopover: {
          styleOverrides: {
            paper: {
              borderRadius: Math.max(borderRadius - 2, 6),
              border: `1px solid ${config.divider}`,
              boxShadow: isLight
                ? '0 10px 40px rgba(0,0,0,0.1)'
                : '0 10px 40px rgba(0,0,0,0.4)',
            },
          },
        },

        /* ── Drawer ─────────────────────────────────────── */
        MuiDrawer: {
          styleOverrides: {
            paper: { border: 'none', boxShadow: 'none' },
          },
        },

        /* ── Misc ───────────────────────────────────────── */
        MuiAvatar: {
          styleOverrides: { root: { fontWeight: 700 } },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 500,
              backgroundColor: isLight ? '#1e293b' : '#f1f5f9',
              color: isLight ? '#f8fafc' : '#0f172a',
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: { borderRadius: Math.max(borderRadius - 2, 6) },
          },
        },
        MuiSwitch: {
          styleOverrides: {
            root: { padding: 7 },
            switchBase: {
              '&.Mui-checked': {
                color: '#fff',
                '& + .MuiSwitch-track': { backgroundColor: colors.primary, opacity: 1 },
              },
            },
            track: {
              borderRadius: 11,
              backgroundColor: isLight ? '#cbd5e1' : '#475569',
              opacity: 1,
            },
            thumb: {
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            },
          },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: { borderRadius: 4, height: 6, backgroundColor: alpha(colors.primary, 0.1) },
            bar: { borderRadius: 4 },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: { borderRadius: 2, height: 3 },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 44 },
          },
        },
        MuiBadge: {
          styleOverrides: {
            standard: { fontWeight: 700, fontSize: '0.65rem', minWidth: 18, height: 18 },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: alpha(config.paper, 0.85),
              color: config.textPrimary,
              backdropFilter: 'blur(10px)',
              boxShadow: 'none',
              borderBottom: `1px solid ${config.divider}`,
            },
          },
        },
        MuiSlider: {
          styleOverrides: {
            thumb: {
              width: 16,
              height: 16,
              '&:hover, &.Mui-active': { boxShadow: `0 0 0 6px ${alpha(colors.primary, 0.16)}` },
            },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderColor: config.divider,
              '&.Mui-selected': {
                backgroundColor: alpha(colors.primary, isLight ? 0.08 : 0.16),
                color: colors.primary,
                borderColor: alpha(colors.primary, 0.3),
                '&:hover': { backgroundColor: alpha(colors.primary, isLight ? 0.12 : 0.24) },
              },
            },
          },
        },
      },

      /* Custom data — layout.js reads sidebar colours from here */
      customAppearance: { mode, config, accent: config.accent },
    });
  }, [mode, colorPreset, borderRadius, fontSize, cardStyle, compactMode]);

  /* ── Setters with persistence ──────────────────────────── */
  const save = (key, value) => localStorage.setItem(key, String(value));

  const toggleMode = () => {
    if (autoMode) { setAutoMode(false); save('autoMode', 'false'); }
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    save('themeMode', next);
  };

  const changeAppearanceMode = (m) => {
    if (autoMode) { setAutoMode(false); save('autoMode', 'false'); }
    setMode(m);
    save('themeMode', m);
  };

  const setAutoThemeMode = (enabled) => {
    setAutoMode(enabled);
    save('autoMode', enabled);
    if (enabled) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setMode(mq.matches ? 'dark' : 'light');
    }
  };

  const changeColorPreset = (p) => { setColorPreset(p); save('colorPreset', p); };
  const changeBorderRadius = (r) => { setBorderRadius(r); save('borderRadius', r); };
  const changeSidebarMode = (m) => { setSidebarMode(m); save('sidebarMode', m); };
  const changeFontSize = (s) => { setFontSize(s); save('fontSize', s); };
  const changeCardStyle = (s) => { setCardStyle(s); save('cardStyle', s); };
  const changeCompactMode = (m) => { setCompactMode(m); save('compactMode', m); };

  const value = {
    mode, toggleMode, changeAppearanceMode,
    autoMode, setAutoThemeMode,
    colorPreset, changeColorPreset, colorPresets,
    borderRadius, changeBorderRadius,
    sidebarMode, changeSidebarMode,
    fontSize, changeFontSize,
    cardStyle, changeCardStyle,
    compactMode, changeCompactMode,
    appearanceConfigs,
  };

  const config = appearanceConfigs[mode] || appearanceConfigs.light;

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <style jsx global>{`
          body {
            background: ${config.bg};
            transition: background 0.3s ease;
          }
        `}</style>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
