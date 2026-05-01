// src/components/AppProviders.js
'use client';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';

export default function AppProviders({ children }) {
  const pathname = usePathname();
  // Extract locale from path (after basePath removed) – e.g., /en/dashboard
  const locale = pathname.split('/')[1];
  const isRTL = locale === 'ps' || locale === 'prs';
  const direction = isRTL ? 'rtl' : 'ltr';

  // MUI theme with dynamic direction
  const baseTheme = useMemo(() => createTheme({ 
    direction,
    typography: {
    fontFamily: 'var(--font-bahij), Inter, Tahoma, Arial, sans-serif',
    },
    components: {
        MuiCssBaseline: {
        styleOverrides: {
            body: {
            fontFamily: 'var(--font-bahij), Inter, Tahoma, Arial, sans-serif',
            },
        },
        },
    },
   }), [direction]);

  // Emotion cache with RTL support
  const cache = useMemo(() => {
    const c = createCache({ key: 'muirtl' });
    // The stylisPlugins array is read-only, so we must set it during creation.
    // We'll create it with prefixer and conditionally add rtlPlugin.
    c.stylisPlugins = isRTL ? [prefixer, rtlPlugin] : [prefixer];
    return c;
  }, [isRTL]);

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={baseTheme}>
        {/* Your custom theme provider (dark/light mode) – it will merge with baseTheme */}
        <ThemeProvider>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={3000}
          >
            <CssBaseline />
            {children}
          </SnackbarProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </CacheProvider>
  );
}