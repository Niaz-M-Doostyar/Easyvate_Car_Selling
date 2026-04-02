'use client';
import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Alert, CircularProgress,
  useTheme, alpha
} from '@mui/material';
import { Backup, Restore, Download, Upload, Settings as SettingsIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';

export default function SettingsPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await apiClient.get('/settings/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const disposition = response.headers['content-disposition'];
      const filename = disposition
        ? disposition.split('filename=')[1]?.replace(/"/g, '')
        : `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar('Backup downloaded successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to create backup', { variant: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.sql')) {
      enqueueSnackbar('Please select a .sql backup file', { variant: 'warning' });
      return;
    }
    if (!window.confirm('Are you sure you want to restore the database? This will overwrite all current data.')) {
      event.target.value = '';
      return;
    }
    setRestoreLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiClient.post('/settings/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      enqueueSnackbar('Database restored successfully. Please refresh the page.', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Failed to restore database', { variant: 'error' });
    } finally {
      setRestoreLoading(false);
      event.target.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon fontSize="large" /> Settings
      </Typography>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Database Backup & Restore
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Backup creates a full SQL dump of your database. Restore will overwrite all current data with the uploaded backup file. Only Super Admin and Owner have access to this feature.
      </Alert>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 300px', maxWidth: 450, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Backup sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>Backup Database</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Download a complete backup of your database as a SQL file.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={backupLoading ? <CircularProgress size={20} color="inherit" /> : <Download />}
              onClick={handleBackup}
              disabled={backupLoading}
              sx={{ borderRadius: 2 }}
            >
              {backupLoading ? 'Creating Backup...' : 'Download Backup'}
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 300px', maxWidth: 450, borderRadius: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Restore sx={{ fontSize: 64, color: theme.palette.warning.main, mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>Restore Database</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload a SQL backup file to restore your database. This will overwrite current data.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              color="warning"
              component="label"
              startIcon={restoreLoading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
              disabled={restoreLoading}
              sx={{ borderRadius: 2 }}
            >
              {restoreLoading ? 'Restoring...' : 'Upload & Restore'}
              <input type="file" accept=".sql" hidden onChange={handleRestore} />
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
