'use client';
import { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, Divider, CircularProgress,
  ImageList, ImageListItem, ImageListItemBar, IconButton as MuiIconButton,
  Tabs, Tab, Alert
} from '@mui/material';
import {
  Add, Edit, Delete, Close, Language, Image as ImageIcon,
  CloudUpload, Delete as DeleteIcon, PhotoLibrary, ZoomIn
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient, { getUploadUrl } from '@/utils/api';
import { validateRequired } from '@/utils/validation';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
  { code: 'fa', name: 'Dari', flag: '🇦🇫' },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AboutPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [aboutData, setAboutData] = useState({ en: null, ps: null, fa: null });
  const [loading, setLoading] = useState({ en: false, ps: false, fa: false, global: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    wide_feature: '',
    trust_feature: '',
    professional_feature: '',
    about_us: '',
    experience: '',
    choose_trust: '',
    choose_quality: '',
    choose_process: '',
  });
  // Logos state
  const [existingLogos, setExistingLogos] = useState([]);
  const [selectedLogos, setSelectedLogos] = useState([]);
  const [logoErrors, setLogoErrors] = useState([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryLogos, setGalleryLogos] = useState([]);
  const [galleryLang, setGalleryLang] = useState(null);

  useEffect(() => {
    fetchAllAbout();
  }, []);

  const fetchAllAbout = async () => {
    setLoading(prev => ({ ...prev, global: true }));
    const promises = LANGUAGES.map(lang =>
      apiClient.get(`/about/${lang.code}`)
        .then(res => ({ lang: lang.code, data: res.data.data }))
        .catch(() => ({ lang: lang.code, data: null }))
    );
    const results = await Promise.all(promises);
    const newData = {};
    results.forEach(({ lang, data }) => {
      newData[lang] = data || null;
    });
    setAboutData(newData);
    setLoading(prev => ({ ...prev, global: false }));
  };

  const fetchLogos = async (lang) => {
    try {
      const res = await apiClient.get(`/about/${lang}/logos`);
      return res.data.data || [];
    } catch {
      return [];
    }
  };

  const handleAdd = async (langCode) => {
    setCurrentLang(langCode);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      wide_feature: '',
      trust_feature: '',
      professional_feature: '',
      about_us: '',
      experience: '',
      choose_trust: '',
      choose_quality: '',
      choose_process: '',
    });
    setSelectedLogos([]);
    setExistingLogos([]);
    setLogoErrors([]);
    setDialogOpen(true);
  };

  const handleEdit = async (langCode) => {
    const data = aboutData[langCode];
    if (!data) return;
    setCurrentLang(langCode);
    setFormData({
      title: data.title || '',
      subtitle: data.subtitle || '',
      description: data.description || '',
      wide_feature: data.wide_feature || '',
      trust_feature: data.trust_feature || '',
      professional_feature: data.professional_feature || '',
      about_us: data.about_us || '',
      experience: data.experience || '',
      choose_trust: data.choose_trust || '',
      choose_quality: data.choose_quality || '',
      choose_process: data.choose_process || '',
    });
    // Fetch existing logos
    const logos = await fetchLogos(langCode);
    setExistingLogos(logos);
    setSelectedLogos([]);
    setLogoErrors([]);
    setDialogOpen(true);
  };

  const handleDelete = async (langCode) => {
    if (!window.confirm(`Are you sure you want to delete the ${LANGUAGES.find(l => l.code === langCode).name} about content?`)) return;
    try {
      await apiClient.delete(`/about/${langCode}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      fetchAllAbout();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  const handleLogoSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (file.size > 1024 * 1024) {
        errors.push(`${file.name} exceeds 1MB`);
      } else if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setLogoErrors(errors);
      enqueueSnackbar(`${errors.length} file(s) rejected. Max 1MB each.`, { variant: 'warning' });
    } else {
      setLogoErrors([]);
    }

    setSelectedLogos(prev => [...prev, ...validFiles]);
  };

  const removeSelectedLogo = (index) => {
    setSelectedLogos(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingLogo = async (logoId) => {
    if (!window.confirm('Delete this logo?')) return;
    try {
      await apiClient.delete(`/about/logos/${logoId}`);
      setExistingLogos(prev => prev.filter(l => l.id !== logoId));
      enqueueSnackbar('Logo deleted', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete logo', { variant: 'error' });
    }
  };

  const openGallery = async (langCode) => {
    setGalleryLang(langCode);
    const logos = await fetchLogos(langCode);
    setGalleryLogos(logos);
    setGalleryOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentLang) return;

    if (!formData.title.trim()) {
      enqueueSnackbar('Title is required', { variant: 'warning' });
      return;
    }

    setLogoUploading(true);
    try {
      let aboutId;
      const textData = { ...formData };
      // Convert empty strings to null (optional)
      Object.keys(textData).forEach(key => {
        if (textData[key] === '') textData[key] = null;
      });

      if (aboutData[currentLang]) {
        // Update text using JSON
        await apiClient.put(`/about/${currentLang}`, textData);
        aboutId = aboutData[currentLang].id;
        enqueueSnackbar('Updated successfully', { variant: 'success' });
      } else {
        // Create text using JSON
        const response = await apiClient.post(`/about/${currentLang}`, textData);
        aboutId = response.data.data.id;
        enqueueSnackbar('Created successfully', { variant: 'success' });
      }

      // Upload new logos if any (they will be associated with the about entry)
      if (selectedLogos.length > 0) {
        const logoFormData = new FormData();
        selectedLogos.forEach(file => logoFormData.append('logos', file));
        await apiClient.post(`/about/${currentLang}/logos`, logoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setDialogOpen(false);
      fetchAllAbout();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Save failed', { variant: 'error' });
    } finally {
      setLogoUploading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return getUploadUrl(path.startsWith('/uploads') ? path : `/uploads${path}`);
  };

  const renderContentSummary = (data) => {
    if (!data) return <Typography color="text.secondary">No content yet</Typography>;
    return (
      <Box>
        <Typography variant="body2" fontWeight="bold">Title: {data.title}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {data.subtitle ? data.subtitle : 'No subtitle'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Description: {data.description?.substring(0, 50)}...
        </Typography>
      </Box>
    );
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>About Management</Typography>
      </Box>

      {loading.global ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {LANGUAGES.map(lang => (
            <Grid item xs={12} md={4} key={lang.code}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{lang.flag} {lang.name}</Typography>
                      <Chip label={lang.code.toUpperCase()} size="small" />
                    </Box>
                    <Box>
                      {aboutData[lang.code] ? (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(lang.code)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(lang.code)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Logos">
                            <IconButton size="small" onClick={() => openGallery(lang.code)}>
                              <PhotoLibrary fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Add">
                          <IconButton size="small" onClick={() => handleAdd(lang.code)}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {renderContentSummary(aboutData[lang.code])}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Language color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {aboutData[currentLang] ? 'Edit' : 'Add'} {LANGUAGES.find(l => l.code === currentLang)?.name} About Content
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Grid container spacing={2}>
            {/* All text fields as before */}
            <Grid item xs={12}><TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Wide Feature" multiline rows={2} value={formData.wide_feature} onChange={(e) => setFormData({...formData, wide_feature: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Trust Feature" multiline rows={2} value={formData.trust_feature} onChange={(e) => setFormData({...formData, trust_feature: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Professional Feature" multiline rows={2} value={formData.professional_feature} onChange={(e) => setFormData({...formData, professional_feature: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="About Us" multiline rows={3} value={formData.about_us} onChange={(e) => setFormData({...formData, about_us: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Experience" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 10+ Years" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Choose Trust" multiline rows={2} value={formData.choose_trust} onChange={(e) => setFormData({...formData, choose_trust: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Choose Quality" multiline rows={2} value={formData.choose_quality} onChange={(e) => setFormData({...formData, choose_quality: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Choose Process" multiline rows={2} value={formData.choose_process} onChange={(e) => setFormData({...formData, choose_process: e.target.value})} /></Grid>

            {/* Logos Section */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 2 }}>
                Partner Logos (Max 20)
              </Typography>

              {/* Existing logos */}
              {existingLogos.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Existing Logos
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {existingLogos.map((logo) => (
                      <ImageListItem key={logo.id}>
                        <img
                          src={getImageUrl(logo.path)}
                          alt={logo.filename}
                          loading="lazy"
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <ImageListItemBar
                          position="bottom"
                          actionIcon={
                            <MuiIconButton size="small" onClick={() => deleteExistingLogo(logo.id)} sx={{ color: 'white' }}>
                              <DeleteIcon fontSize="small" />
                            </MuiIconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {/* Upload area */}
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => document.getElementById('logo-upload').click()}
              >
                <input
                  id="logo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLogoSelect}
                />
                <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1">Click to upload logos</Typography>
                <Typography variant="caption" color="text.secondary">
                  (Max 1MB per file, up to 20 files)
                </Typography>
              </Box>

              {/* Selected logos preview */}
              {selectedLogos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Selected Logos ({selectedLogos.length})
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {selectedLogos.map((file, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          loading="lazy"
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <ImageListItemBar
                          title={file.name.length > 15 ? file.name.substring(0,12)+'...' : file.name}
                          subtitle={`${(file.size / 1024).toFixed(1)} KB`}
                          position="bottom"
                          actionIcon={
                            <MuiIconButton size="small" onClick={() => removeSelectedLogo(index)} sx={{ color: 'white' }}>
                              <DeleteIcon fontSize="small" />
                            </MuiIconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={logoUploading}
            startIcon={aboutData[currentLang] ? <Edit /> : <Add />}
          >
            {logoUploading ? 'Saving...' : (aboutData[currentLang] ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logo Gallery Dialog */}
      <Dialog open={galleryOpen} onClose={() => setGalleryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoLibrary color="primary" />
          <Typography variant="h6" fontWeight={700}>
            {LANGUAGES.find(l => l.code === galleryLang)?.name} Logos
          </Typography>
          <Box flex={1} />
          <IconButton onClick={() => setGalleryOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {galleryLogos.length === 0 ? (
            <Box textAlign="center" py={4} color="text.secondary">
              <ImageIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body2" mt={1}>No logos for this language</Typography>
            </Box>
          ) : (
            <ImageList cols={3} gap={16}>
              {galleryLogos.map((logo) => (
                <ImageListItem key={logo.id}>
                  <img
                    src={getImageUrl(logo.path)}
                    alt={logo.filename}
                    loading="lazy"
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                    onClick={() => window.open(getImageUrl(logo.path), '_blank')}
                  />
                  <ImageListItemBar
                    title={logo.filename}
                    subtitle={`${(logo.size / 1024).toFixed(1)} KB`}
                    actionIcon={
                      <Tooltip title="Open full size">
                        <MuiIconButton size="small" onClick={() => window.open(getImageUrl(logo.path), '_blank')} sx={{ color: 'white' }}>
                          <ZoomIn fontSize="small" />
                        </MuiIconButton>
                      </Tooltip>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}