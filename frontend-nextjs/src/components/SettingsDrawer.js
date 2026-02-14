'use client';
import { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Stack,
  Slider,
  Button,
  Divider,
  Fab,
  alpha,
  useTheme,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Settings,
  Close,
  LightMode,
  DarkMode,
  Brightness4,
  Brightness5,
  NightsStay,
  AcUnit,
  WbTwilight,
  AutoAwesome,
  LocalCafe,
  SevereCold,
  Check,
  Refresh,
  FormatSize,
  ViewSidebar,
  ViewSidebarOutlined,
  FilterVintage,
  Spa,
  CropSquare,
  Layers,
  BlurOn,
  DensitySmall,
  DensityMedium,
  DensityLarge,
} from '@mui/icons-material';
import { useThemeMode } from '@/contexts/ThemeContext';

/* ── Mode cards ──────────────────────────────────────────── */
const modes = [
  {
    value: 'light',
    label: 'Light',
    icon: LightMode,
    preview: { bg: '#f8fafc', sidebar: '#ffffff', topbar: '#ffffff', text: '#1e293b' },
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: DarkMode,
    preview: { bg: '#0f172a', sidebar: '#0f172a', topbar: '#1e293b', text: '#f1f5f9' },
  },
  {
    value: 'semi-dark',
    label: 'Semi Dark',
    icon: Brightness4,
    preview: { bg: '#f8fafc', sidebar: '#111827', topbar: '#ffffff', text: '#1e293b' },
  },
  {
    value: 'dim',
    label: 'Dim',
    icon: Brightness5,
    preview: { bg: '#18181b', sidebar: '#18181b', topbar: '#27272a', text: '#fafafa' },
  },
  {
    value: 'midnight',
    label: 'Midnight',
    icon: NightsStay,
    preview: { bg: '#0a0e27', sidebar: '#080b1f', topbar: '#131640', text: '#e2e8f0', accent: '#818cf8' },
    premium: true,
  },
  {
    value: 'nord',
    label: 'Nord',
    icon: AcUnit,
    preview: { bg: '#2e3440', sidebar: '#2e3440', topbar: '#3b4252', text: '#eceff4', accent: '#88c0d0' },
    premium: true,
  },
  {
    value: 'sunset',
    label: 'Sunset',
    icon: WbTwilight,
    preview: { bg: '#fef7ed', sidebar: '#7c2d12', topbar: '#ffffff', text: '#451a03', accent: '#ea580c' },
    premium: true,
  },
  {
    value: 'dracula',
    label: 'Dracula',
    icon: AutoAwesome,
    preview: { bg: '#282a36', sidebar: '#21222c', topbar: '#343746', text: '#f8f8f2', accent: '#bd93f9' },
    premium: true,
  },
  {
    value: 'coffee',
    label: 'Coffee',
    icon: LocalCafe,
    preview: { bg: '#1a1210', sidebar: '#15100e', topbar: '#2a1f1a', text: '#f5e6d3', accent: '#c4a882' },
    premium: true,
  },
  {
    value: 'arctic',
    label: 'Arctic',
    icon: SevereCold,
    preview: { bg: '#f0f4f8', sidebar: '#1a2b3c', topbar: '#ffffff', text: '#1a2b3c', accent: '#0288d1' },
    premium: true,
  },
  {
    value: 'sakura',
    label: 'Sakura',
    icon: FilterVintage,
    preview: { bg: '#fdf2f8', sidebar: '#831843', topbar: '#ffffff', text: '#4a1942', accent: '#ec4899' },
    premium: true,
  },
  {
    value: 'lavender',
    label: 'Lavender',
    icon: Spa,
    preview: { bg: '#f5f3ff', sidebar: '#4c1d95', topbar: '#ffffff', text: '#2e1065', accent: '#8b5cf6' },
    premium: true,
  },
];

export default function SettingsDrawer() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const {
    mode,
    changeAppearanceMode,
    autoMode,
    setAutoThemeMode,
    colorPreset,
    changeColorPreset,
    colorPresets,
    borderRadius,
    changeBorderRadius,
    sidebarMode,
    changeSidebarMode,
    fontSize,
    changeFontSize,
    cardStyle,
    changeCardStyle,
    compactMode,
    changeCompactMode,
  } = useThemeMode();

  const handleReset = () => {
    changeAppearanceMode('light');
    changeColorPreset('default');
    changeBorderRadius(10);
    changeSidebarMode('full');
    changeFontSize('medium');
    changeCardStyle('bordered');
    changeCompactMode('comfortable');
  };

  return (
    <>
      {/* ── FAB Trigger ────────────────────────────────── */}
      <Tooltip title="Theme Settings" placement="left">
        <Fab
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 1200,
            bgcolor: theme.palette.primary.main,
            color: '#fff',
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              transform: 'rotate(45deg)',
            },
            transition: 'all 0.25s ease',
            width: 44,
            height: 44,
          }}
        >
          <Settings fontSize="small" />
        </Fab>
      </Tooltip>

      {/* ── Drawer ─────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            bgcolor: theme.palette.background.paper,
            borderLeft: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                Theme Settings
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customize appearance
              </Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Scrollable Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
            {/* ── Auto Mode ───────────────────────────── */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.5,
                py: 1,
                mb: 2.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>Auto Mode</Typography>
                <Typography variant="caption" color="text.secondary">Match system theme</Typography>
              </Box>
              <Switch
                size="small"
                checked={autoMode}
                onChange={(_, v) => setAutoThemeMode(v)}
              />
            </Box>

            {/* ── Appearance Mode ─────────────────────── */}
            <SectionLabel>Appearance</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
              {modes.filter((m) => !m.premium).map((m) => {
                const active = mode === m.value;
                const Icon = m.icon;
                return (
                  <Box
                    key={m.value}
                    onClick={() => !autoMode && changeAppearanceMode(m.value)}
                    sx={{
                      cursor: autoMode ? 'default' : 'pointer',
                      opacity: autoMode ? 0.5 : 1,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `2px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                      transition: 'all 0.15s ease',
                      '&:hover': !autoMode ? {
                        borderColor: active ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.4),
                        transform: 'translateY(-1px)',
                      } : {},
                    }}
                  >
                    {/* Mini layout preview */}
                    <Box sx={{ p: 1, bgcolor: m.preview.bg, height: 56, display: 'flex', gap: 0.5 }}>
                      <Box sx={{ width: 18, bgcolor: m.preview.sidebar, borderRadius: 0.5, flexShrink: 0 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ height: 8, bgcolor: m.preview.topbar, borderRadius: 0.5, mb: 0.5 }} />
                        <Box sx={{ height: '100%', bgcolor: alpha(m.preview.text, 0.05), borderRadius: 0.5 }} />
                      </Box>
                    </Box>
                    {/* Label */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        py: 0.8,
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                      }}
                    >
                      <Icon sx={{ fontSize: 14, color: active ? theme.palette.primary.main : 'text.secondary' }} />
                      <Typography
                        variant="caption"
                        fontWeight={active ? 700 : 500}
                        color={active ? 'primary.main' : 'text.secondary'}
                      >
                        {m.label}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* ── Premium Themes ──────────────────────── */}
            <SectionLabel>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                ✨ Premium Themes
              </Box>
            </SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.2, mb: 3 }}>
              {modes.filter((m) => m.premium).map((m) => {
                const active = mode === m.value;
                const Icon = m.icon;
                return (
                  <Box
                    key={m.value}
                    onClick={() => !autoMode && changeAppearanceMode(m.value)}
                    sx={{
                      cursor: autoMode ? 'default' : 'pointer',
                      opacity: autoMode ? 0.5 : 1,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `2px solid ${active ? (m.preview.accent || theme.palette.primary.main) : theme.palette.divider}`,
                      transition: 'all 0.2s ease',
                      '&:hover': !autoMode ? {
                        borderColor: active ? (m.preview.accent || theme.palette.primary.main) : alpha(m.preview.accent || theme.palette.primary.main, 0.5),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(m.preview.accent || theme.palette.primary.main, 0.2)}`,
                      } : {},
                    }}
                  >
                    {/* Mini layout preview */}
                    <Box sx={{ p: 0.8, bgcolor: m.preview.bg, height: 44, display: 'flex', gap: 0.4, position: 'relative' }}>
                      <Box sx={{ width: 14, bgcolor: m.preview.sidebar, borderRadius: 0.5, flexShrink: 0 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ height: 6, bgcolor: m.preview.topbar, borderRadius: 0.5, mb: 0.4 }} />
                        <Box sx={{ height: '100%', bgcolor: alpha(m.preview.text, 0.06), borderRadius: 0.5 }} />
                      </Box>
                      {/* Accent color dot */}
                      {m.preview.accent && (
                        <Box sx={{
                          position: 'absolute', top: 4, right: 4, width: 6, height: 6,
                          borderRadius: '50%', bgcolor: m.preview.accent,
                          boxShadow: `0 0 4px ${m.preview.accent}`,
                        }} />
                      )}
                    </Box>
                    {/* Label */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.3,
                        py: 0.6,
                        bgcolor: active ? alpha(m.preview.accent || theme.palette.primary.main, 0.08) : 'transparent',
                      }}
                    >
                      <Icon sx={{ fontSize: 12, color: active ? (m.preview.accent || theme.palette.primary.main) : 'text.secondary' }} />
                      <Typography
                        variant="caption"
                        fontWeight={active ? 700 : 500}
                        sx={{
                          fontSize: '0.6rem',
                          color: active ? (m.preview.accent || theme.palette.primary.main) : 'text.secondary',
                        }}
                      >
                        {m.label}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* ── Color Presets ────────────────────────── */}
            <SectionLabel>Accent Color</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {Object.entries(colorPresets).map(([key, val]) => {
                const active = colorPreset === key;
                return (
                  <Tooltip key={key} title={key.charAt(0).toUpperCase() + key.slice(1)} arrow>
                    <Box
                      onClick={() => changeColorPreset(key)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: val.primary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        outline: active ? `2px solid ${val.primary}` : '2px solid transparent',
                        outlineOffset: 2,
                        transition: 'all 0.15s ease',
                        '&:hover': { transform: 'scale(1.12)' },
                      }}
                    >
                      {active && <Check sx={{ fontSize: 16, color: '#fff' }} />}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* ── Font Size ───────────────────────────── */}
            <SectionLabel>Font Size</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {['small', 'medium', 'large'].map((size) => {
                const active = fontSize === size;
                return (
                  <Box
                    key={size}
                    onClick={() => changeFontSize(size)}
                    sx={{
                      flex: 1,
                      py: 0.8,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      border: `1.5px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                    }}
                  >
                    <FormatSize
                      sx={{
                        fontSize: size === 'small' ? 14 : size === 'large' ? 22 : 18,
                        color: active ? theme.palette.primary.main : 'text.secondary',
                        verticalAlign: 'middle',
                      }}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      fontWeight={active ? 600 : 500}
                      color={active ? 'primary.main' : 'text.secondary'}
                      sx={{ mt: 0.3, fontSize: '0.65rem' }}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* ── Border Radius ───────────────────────── */}
            <SectionLabel>Border Radius</SectionLabel>
            <Box sx={{ px: 0.5, mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                  {borderRadius}
                </Typography>
                <Slider
                  size="small"
                  min={0}
                  max={20}
                  value={borderRadius}
                  onChange={(_, v) => changeBorderRadius(v)}
                  sx={{
                    '& .MuiSlider-thumb': { width: 14, height: 14 },
                    '& .MuiSlider-track': { height: 4 },
                    '& .MuiSlider-rail': { height: 4 },
                  }}
                />
              </Stack>
              {/* Preview shapes */}
              <Stack direction="row" spacing={1} mt={1} justifyContent="center">
                {[0, 6, 10, 16, 20].map((r) => (
                  <Box
                    key={r}
                    onClick={() => changeBorderRadius(r)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: `${r}px`,
                      border: `2px solid ${r === borderRadius ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: r === borderRadius ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.5) },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* ── Card Style ─────────────────────────── */}
            <SectionLabel>Card Style</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {[
                { val: 'bordered', label: 'Bordered', icon: CropSquare, desc: 'Clean border' },
                { val: 'elevated', label: 'Elevated', icon: Layers, desc: 'Soft shadow' },
                { val: 'glass', label: 'Glass', icon: BlurOn, desc: 'Frosted glass' },
              ].map(({ val, label, icon: Ic, desc }) => {
                const active = cardStyle === val;
                return (
                  <Box
                    key={val}
                    onClick={() => changeCardStyle(val)}
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `2px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: active ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.4),
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {/* Mini card preview */}
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 26,
                          borderRadius: 1,
                          bgcolor: theme.palette.background.paper,
                          ...(val === 'bordered' ? {
                            border: `1.5px solid ${theme.palette.divider}`,
                          } : val === 'elevated' ? {
                            boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                          } : {
                            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            backdropFilter: 'blur(4px)',
                          }),
                        }}
                      />
                    </Box>
                    <Box sx={{ py: 0.6, textAlign: 'center', bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'transparent' }}>
                      <Ic sx={{ fontSize: 13, color: active ? theme.palette.primary.main : 'text.secondary', mb: 0.2 }} />
                      <Typography
                        variant="caption"
                        display="block"
                        fontWeight={active ? 700 : 500}
                        color={active ? 'primary.main' : 'text.secondary'}
                        sx={{ fontSize: '0.6rem', lineHeight: 1.2 }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* ── Layout Density ──────────────────────── */}
            <SectionLabel>Layout Density</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {[
                { val: 'compact', label: 'Compact', icon: DensitySmall },
                { val: 'comfortable', label: 'Comfort', icon: DensityMedium },
                { val: 'spacious', label: 'Spacious', icon: DensityLarge },
              ].map(({ val, label, icon: Ic }) => {
                const active = compactMode === val;
                return (
                  <Box
                    key={val}
                    onClick={() => changeCompactMode(val)}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.4,
                      py: 1,
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      border: `1.5px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                    }}
                  >
                    <Ic sx={{ fontSize: 16, color: active ? theme.palette.primary.main : 'text.secondary' }} />
                    <Typography
                      variant="caption"
                      fontWeight={active ? 600 : 500}
                      color={active ? 'primary.main' : 'text.secondary'}
                      sx={{ fontSize: '0.6rem' }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* ── Sidebar Mode ────────────────────────── */}
            <SectionLabel>Sidebar</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              {[
                { val: 'full', label: 'Full', icon: ViewSidebar },
                { val: 'mini', label: 'Mini', icon: ViewSidebarOutlined },
              ].map(({ val, label, icon: Ic }) => {
                const active = sidebarMode === val;
                return (
                  <Box
                    key={val}
                    onClick={() => changeSidebarMode(val)}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.8,
                      py: 1,
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      border: `1.5px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                    }}
                  >
                    <Ic sx={{ fontSize: 16, color: active ? theme.palette.primary.main : 'text.secondary' }} />
                    <Typography
                      variant="caption"
                      fontWeight={active ? 600 : 500}
                      color={active ? 'primary.main' : 'text.secondary'}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              size="small"
              sx={{
                borderColor: theme.palette.divider,
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.04),
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                },
              }}
            >
              Reset to Defaults
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

/* ── Tiny reusable label ────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        fontWeight: 700,
        fontSize: '0.65rem',
        color: 'text.secondary',
        letterSpacing: '0.1em',
        mb: 1.2,
      }}
    >
      {children}
    </Typography>
  );
}
