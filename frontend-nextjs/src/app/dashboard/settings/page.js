'use client';
import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Grid, Chip,
  useTheme, alpha, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Tooltip,
} from '@mui/material';
import {
  Backup, Restore, CloudDownload, Delete, Storage, Schedule,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';

export default function SettingsPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/settings/backups');
      setBackups(res.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch backups', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await apiClient.post('/settings/backup');
      enqueueSnackbar('Backup created successfully', { variant: 'success' });
      fetchBackups();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || 'Backup failed', { variant: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (fileName) => {
    setRestoring(fileName);
    try {
      await apiClient.post(`/settings/restore/${encodeURIComponent(fileName)}`);
      enqueueSnackbar('Database restored successfully. Please refresh the page.', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error?.message || 'Restore failed', { variant: 'error' });
    } finally {
      setRestoring(null);
      setConfirmRestore(null);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const res = await apiClient.get(`/settings/backup/download/${encodeURIComponent(fileName)}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      enqueueSnackbar('Failed to download backup', { variant: 'error' });
    }
  };

  const handleDeleteBackup = async (fileName) => {
    if (!window.confirm(`Delete backup "${fileName}"?`)) return;
    try {
      await apiClient.delete(`/settings/backup/${encodeURIComponent(fileName)}`);
      enqueueSnackbar('Backup deleted', { variant: 'success' });
      fetchBackups();
    } catch {
      enqueueSnackbar('Failed to delete backup', { variant: 'error' });
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Settings</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Database backup & restore management</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={creating ? <CircularProgress size={18} color="inherit" /> : <Backup />}
          onClick={handleCreateBackup}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create Backup'}
        </Button>
      </Box>

      {/* Summary Card */}
      <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3 }}>
        <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: 'flex' }}>
              <Storage />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary">Available Backups</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.primary.main }}>{backups.length}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Backup List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : backups.length === 0 ? (
        <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Storage sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 1 }} />
            <Typography color="text.secondary">No backups yet. Create your first backup above.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {backups.map((backup) => (
            <Grid item xs={12} key={backup.name}>
              <Card sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <CardContent sx={{ py: 1.5, px: 2.5, '&:last-child': { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Storage color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{backup.name}</Typography>
                        <Box display="flex" gap={1} mt={0.5}>
                          <Chip icon={<Schedule />} label={new Date(backup.date).toLocaleString()} size="small" variant="outlined" />
                          <Chip label={formatSize(backup.size)} size="small" color="info" variant="outlined" />
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Download">
                        <IconButton size="small" onClick={() => handleDownload(backup.name)} color="primary">
                          <CloudDownload fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Restore from this backup">
                        <IconButton size="small" onClick={() => setConfirmRestore(backup.name)} color="warning">
                          <Restore fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete backup">
                        <IconButton size="small" onClick={() => handleDeleteBackup(backup.name)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!confirmRestore} onClose={() => setConfirmRestore(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Database Restore</DialogTitle>
        <DialogContent>
          <Typography color="error" fontWeight={600} mb={1}>Warning: This will overwrite the current database!</Typography>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to restore the database from <strong>{confirmRestore}</strong>?
            All current data will be replaced with the backup data. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmRestore(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleRestore(confirmRestore)}
            disabled={!!restoring}
            startIcon={restoring ? <CircularProgress size={18} color="inherit" /> : <Restore />}
          >
            {restoring ? 'Restoring...' : 'Restore Database'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
