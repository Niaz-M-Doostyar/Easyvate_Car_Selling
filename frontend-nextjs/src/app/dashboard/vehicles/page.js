'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, Typography, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Tooltip,
  Stepper, Step, StepLabel, Tabs, Tab, useTheme, alpha, Autocomplete,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  ImageList, ImageListItem, ImageListItemBar, IconButton as MuiIconButton
} from '@mui/material';
import {
  Add, Search, PictureAsPdf, DirectionsCar, Tag, ColorLens,
  Speed, Build, LocalGasStation, AttachMoney, CalendarToday, Sell,
  Person, Phone, Badge, LocationOn, GroupAdd, Delete, History,
  Edit, Visibility, Close, NavigateNext, NavigateBefore, Info,
  Image as ImageIcon, PhotoLibrary, CloudUpload, Delete as DeleteIcon,
  ZoomIn,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiClient from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { validateRequired, validatePrice, validateYear } from '@/utils/validation';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

const STEPS = ['Vehicle Details', 'Reference Person', 'Sharing / Partnership', 'Images'];

// Dropdown defaults (merged with dynamic from DB)
const DEFAULT_CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck', 'Pickup', 'Bus', 'Other'];
const DEFAULT_MANUFACTURERS = [
  'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet',
  'KIA', 'Hyundai', 'Mazda', 'Nissan', 'Suzuki', 'Daihatsu', 'FAW', 'Changan'
];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG'];
const DEFAULT_TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
const DEFAULT_ENGINE_TYPES = ['Inline-3', 'Inline-4', 'Inline-5', 'Inline-6', 'V4', 'V6', 'V8', 'V10', 'V12', 'Rotary', 'Turbo'];

export default function VehiclesPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Detail / History dialogs
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [editHistory, setEditHistory] = useState([]);
  const [vehicleCosts, setVehicleCosts] = useState([]);
  const [sharingPersons, setSharingPersons] = useState([]);

  // Edit reason dialog
  const [editReasonOpen, setEditReasonOpen] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [pendingEditVehicle, setPendingEditVehicle] = useState(null);

  // Image states
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVehicleId, setGalleryVehicleId] = useState(null);

  // Form data – Section 1: Vehicle
  const [formData, setFormData] = useState({
    vehicleId: '', category: '', manufacturer: '', model: '', year: '',
    color: '', chassisNumber: '', engineNumber: '', engineType: '', fuelType: '', transmission: '',
    mileage: '', plateNo: '', vehicleLicense: '', steering: 'Left', monolithicCut: 'Monolithic',
    basePurchasePrice: '', baseCurrency: 'USD',
    transportCostToDubai: '0', importCostToAfghanistan: '0', repairCost: '0',
    sellingPrice: '0', status: 'Available',
  });

  // Form data – Section 2: Reference Person
  const [refPerson, setRefPerson] = useState({
    fullName: '', tazkiraNumber: '', phoneNumber: '', address: '', hasReference: false,
  });

  // Form data – Section 3: Sharing Persons
  const [formSharingPersons, setFormSharingPersons] = useState([]);

  // Dynamic dropdown options & customers for sharing
  const [dropdownOptions, setDropdownOptions] = useState({ manufacturer: [], category: [], engineType: [], transmission: [] });
  const [customers, setCustomers] = useState([]);

  useEffect(() => { fetchVehicles(); fetchDropdownOptions(); fetchCustomers(); }, []);

  const fetchDropdownOptions = async () => {
    try {
      const fields = ['manufacturer', 'category', 'engineType', 'transmission'];
      const results = await Promise.all(fields.map(f => apiClient.get(`/vehicles/dropdown-options/${f}`).catch(() => ({ data: { data: [] } }))));
      const opts = {};
      fields.forEach((f, i) => {
        const values = results[i].data.data || [];
        opts[f] = Array.isArray(values)
          ? values.map((value) => (typeof value === 'string' ? value : value?.value)).filter(Boolean)
          : [];
      });
      setDropdownOptions(opts);
    } catch { /* ignore */ }
  };

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data.data || []);
    } catch { /* ignore */ }
  };

  const addDropdownOption = async (fieldName, value) => {
    try {
      await apiClient.post('/vehicles/dropdown-options', { fieldName, value });
      await fetchDropdownOptions();
      enqueueSnackbar(`Added "${value}" to ${fieldName}`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Failed to add option', { variant: 'error' });
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data.data || []);
    } catch {
      enqueueSnackbar('Failed to fetch vehicles', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleDetails = async (vehicleId) => {
    try {
      const [historyRes, costsRes, sharingRes] = await Promise.all([
        apiClient.get(`/vehicles/${vehicleId}/history`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/vehicles/${vehicleId}/costs`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/vehicles/${vehicleId}/sharing`).catch(() => ({ data: { data: [] } })),
      ]);
      setEditHistory(historyRes.data.data || []);
      setVehicleCosts(costsRes.data.data || []);
      setSharingPersons(sharingRes.data.data || []);
    } catch {
      setEditHistory([]);
      setVehicleCosts([]);
      setSharingPersons([]);
    }
  };

  // Auto-calculate total cost
  const totalCost = useMemo(() => {
    const base = parseFloat(formData.basePurchasePrice) || 0;
    const transport = parseFloat(formData.transportCostToDubai) || 0;
    const importCost = parseFloat(formData.importCostToAfghanistan) || 0;
    const repair = parseFloat(formData.repairCost) || 0;
    return base + transport + importCost + repair;
  }, [formData.basePurchasePrice, formData.transportCostToDubai, formData.importCostToAfghanistan, formData.repairCost]);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!validateRequired(formData.manufacturer)) newErrors.manufacturer = 'Manufacturer is required';
    if (!validateRequired(formData.model)) newErrors.model = 'Model is required';
    if (!validateRequired(formData.year) || !validateYear(formData.year)) newErrors.year = 'Valid year is required';
    if (!validateRequired(formData.chassisNumber)) newErrors.chassisNumber = 'Chassis number is required';
    if (!validateRequired(formData.basePurchasePrice) || !validatePrice(formData.basePurchasePrice)) {
      newErrors.basePurchasePrice = 'Valid base price is required';
    }
    if (formData.status === 'Available') {
      const selling = parseFloat(formData.sellingPrice) || 0;
      if (selling < totalCost) {
        newErrors.sellingPrice = 'Selling price cannot be less than total cost for available vehicles';
      }
    }
    if (refPerson.hasReference && !validateRequired(refPerson.fullName)) {
      newErrors.refFullName = 'Reference person name is required';
    }

    // Validate sharing percentages sum
    if (formSharingPersons.length > 0) {
      const totalPct = formSharingPersons.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0);
      if (totalPct > 100) newErrors.sharingTotal = 'Total sharing percentage cannot exceed 100%';
      formSharingPersons.forEach((p, i) => {
        if (!p.customerId) newErrors[`sharing_${i}_name`] = 'Customer is required';
        if (!p.percentage || parseFloat(p.percentage) <= 0) newErrors[`sharing_${i}_pct`] = 'Valid % required';
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.vehicleId || newErrors.manufacturer || newErrors.model || newErrors.year || newErrors.chassisNumber || newErrors.basePurchasePrice) {
        setActiveStep(0);
      } else if (newErrors.refFullName) {
        setActiveStep(1);
      } else if (newErrors.sharingTotal || Object.keys(newErrors).some(k => k.startsWith('sharing_'))) {
        setActiveStep(2);
      } else {
        setActiveStep(3); // image errors would be handled separately
      }
      enqueueSnackbar('Please fix validation errors', { variant: 'error' });
      return;
    }

    const vehicleData = {
      ...formData,
      year: parseInt(formData.year, 10),
      mileage: parseInt(formData.mileage, 10) || 0,
      basePurchasePrice: parseFloat(formData.basePurchasePrice),
      transportCostToDubai: parseFloat(formData.transportCostToDubai) || 0,
      importCostToAfghanistan: parseFloat(formData.importCostToAfghanistan) || 0,
      repairCost: parseFloat(formData.repairCost) || 0,
      sellingPrice: formData.status === 'Available' ? (parseFloat(formData.sellingPrice) || 0) : 0,
    };

    if (refPerson.hasReference && refPerson.fullName) {
      vehicleData.referencePerson = {
        fullName: refPerson.fullName,
        tazkiraNumber: refPerson.tazkiraNumber,
        phoneNumber: refPerson.phoneNumber,
        address: refPerson.address,
      };
    }

    if (formSharingPersons.length > 0) {
      vehicleData.sharingPersons = formSharingPersons.map((p) => ({
        customerId: p.customerId,
        percentage: parseFloat(p.percentage),
        investmentAmount: parseFloat(p.investmentAmount) || 0,
      }));
    }

    setImageUploading(true);
    try {
      let vehicleId;
      if (editingId) {
        // Update existing vehicle
        vehicleData.editReason = editReason || 'Updated vehicle details';
        await apiClient.put(`/vehicles/${editingId}`, vehicleData);
        vehicleId = editingId;
        enqueueSnackbar('Vehicle updated successfully', { variant: 'success' });
      } else {
        // Create new vehicle
        const response = await apiClient.post('/vehicles', vehicleData);
        vehicleId = response.data.id; // adjust based on your API response structure
        enqueueSnackbar('Vehicle added successfully', { variant: 'success' });
      }

      // Upload new images if any
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach(file => formData.append('images', file));
        await apiClient.post(`/vehicles/${vehicleId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setOpen(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to save vehicle', { variant: 'error' });
    } finally {
      setImageUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '', category: '', manufacturer: '', model: '', year: '',
      color: '', chassisNumber: '', engineNumber: '', engineType: '', fuelType: '', transmission: '',
      mileage: '', plateNo: '', vehicleLicense: '', steering: 'Left', monolithicCut: 'Monolithic',
      basePurchasePrice: '', baseCurrency: 'USD',
      transportCostToDubai: '0', importCostToAfghanistan: '0', repairCost: '0',
      sellingPrice: '0', status: 'Available',
    });
    setRefPerson({ fullName: '', tazkiraNumber: '', phoneNumber: '', address: '', hasReference: false });
    setFormSharingPersons([]);
    setErrors({});
    setEditingId(null);
    setActiveStep(0);
    setEditReason('');
    setSelectedImages([]);
    setExistingImages([]);
    setImageErrors([]);
  };

  const handleEdit = (vehicle) => {
    if (vehicle.isLocked) {
      enqueueSnackbar('This vehicle is sold and locked for editing', { variant: 'warning' });
      return;
    }
    setPendingEditVehicle(vehicle);
    setEditReasonOpen(true);
  };

  const confirmEdit = async () => { 
    if (!editReason.trim()) {
      enqueueSnackbar('Please provide a reason for editing', { variant: 'warning' });
      return;
    }
    const vehicle = pendingEditVehicle;
    setFormData({
      vehicleId: vehicle.vehicleId || '', category: vehicle.category || '',
      manufacturer: vehicle.manufacturer || '', model: vehicle.model || '',
      year: vehicle.year || '', color: vehicle.color || '',
      chassisNumber: vehicle.chassisNumber || '', engineNumber: vehicle.engineNumber || '',
      engineType: vehicle.engineType || '',
      baseCurrency: vehicle.baseCurrency || 'USD',
      transportCostToDubai: vehicle.transportCostToDubai || '0',
      importCostToAfghanistan: vehicle.importCostToAfghanistan || '0',
      repairCost: vehicle.repairCost || '0',
      fuelType: vehicle.fuelType || '', transmission: vehicle.transmission || '',
      mileage: vehicle.mileage || '', plateNo: vehicle.plateNo || '',
      vehicleLicense: vehicle.vehicleLicense || '',
      steering: vehicle.steering || 'Left', monolithicCut: vehicle.monolithicCut || 'Monolithic',
      basePurchasePrice: vehicle.basePurchasePrice || '',
      sellingPrice: vehicle.sellingPrice || '', status: vehicle.status || 'Available',
    });
    if (vehicle.referencePerson) {
      setRefPerson({
        fullName: vehicle.referencePerson.fullName || '',
        tazkiraNumber: vehicle.referencePerson.tazkiraNumber || '',
        phoneNumber: vehicle.referencePerson.phoneNumber || '',
        address: vehicle.referencePerson.address || '',
        hasReference: true,
      });
    }
    if (vehicle.sharingPersons?.length > 0) {
      setFormSharingPersons(vehicle.sharingPersons.map((p) => ({
        customerId: p.customerId || p.customer?.id || null,
        personName: p.customer?.fullName || p.personName || '',
        percentage: p.percentage,
        investmentAmount: p.investmentAmount || '',
        phoneNumber: p.customer?.phoneNumber || p.phoneNumber || '',
      })));
    }

    try {
        const res = await apiClient.get(`/vehicles/${vehicle.id}/images`);
        setExistingImages(res.data.data || []);
      } catch {
        setExistingImages([]);
      }

    setEditingId(vehicle.id);
    setEditReasonOpen(false);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const vehicle = vehicles.find((v) => v.id === id);
    if (vehicle?.isLocked) {
      enqueueSnackbar('Cannot delete a sold/locked vehicle', { variant: 'warning' });
      return;
    }
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) return;
    try {
      await apiClient.delete(`/vehicles/${id}`);
      enqueueSnackbar('Vehicle deleted successfully', { variant: 'success' });
      fetchVehicles();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete vehicle', { variant: 'error' });
    }
  };

  const handleViewDetails = (vehicle) => {
    setDetailVehicle(vehicle);
    setDetailTab(0);
    fetchVehicleDetails(vehicle.id);
    setDetailOpen(true);
  };

  const generatePDF = async (vehicleId) => {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vehicle-${vehicleId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      enqueueSnackbar('PDF generated successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to generate PDF', { variant: 'error' });
    }
  };

  // Sharing persons helpers
  const addSharingPerson = () => {
    setFormSharingPersons([...formSharingPersons, { customerId: null, personName: '', percentage: '', investmentAmount: '', phoneNumber: '' }]);
  };
  const removeSharingPerson = (index) => {
    setFormSharingPersons(formSharingPersons.filter((_, i) => i !== index));
  };
  const updateSharingPerson = (index, field, value) => {
    const updated = [...formSharingPersons];
    updated[index] = { ...updated[index], [field]: value };
    setFormSharingPersons(updated);
  };

  // Image helpers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (file.size > 500 * 1024) {
        errors.push(`${file.name} exceeds 500KB`);
      } else if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setImageErrors(errors);
      enqueueSnackbar(`${errors.length} file(s) rejected. Max 500KB, images only.`, { variant: 'warning' });
    } else {
      setImageErrors([]);
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await apiClient.delete(`/vehicles/images/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      enqueueSnackbar('Image deleted', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete image', { variant: 'error' });
    }
  };

  const fetchVehicleImages = async (vehicleId) => {
    try {
      const res = await apiClient.get(`/vehicles/${vehicleId}/images`);
      setGalleryImages(res.data.data || []);
    } catch {
      setGalleryImages([]);
    }
  };

  const openGallery = (vehicleId) => {
    setGalleryVehicleId(vehicleId);
    fetchVehicleImages(vehicleId);
    setGalleryOpen(true);
  };

  const filteredVehicles = useMemo(() => {
    let result = vehicles;
    if (statusFilter) result = result.filter((v) => v.status === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((v) =>
        v.manufacturer?.toLowerCase().includes(term) ||
        v.model?.toLowerCase().includes(term) ||
        v.category?.toLowerCase().includes(term) ||
        v.chassisNumber?.toLowerCase().includes(term) ||
        v.vehicleId?.toString().includes(term)
      );
    }
    return result;
  }, [vehicles, searchTerm, statusFilter]);

  // ─── Step content renderer ───
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 1, mb: 2 }}>
              Vehicle Identity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  freeSolo
                  options={[...new Set([...DEFAULT_MANUFACTURERS, ...(dropdownOptions.manufacturer || [])])]}
                  value={formData.manufacturer}
                  onChange={(e, v) => setFormData({ ...formData, manufacturer: v || '' })}
                  onInputChange={(e, v) => setFormData({ ...formData, manufacturer: v || '' })}
                  renderInput={(params) => (
                    <TextField {...params} label="Manufacturer" error={!!errors.manufacturer} helperText={errors.manufacturer} required
                      InputProps={{ ...params.InputProps, endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          {formData.manufacturer && !([...DEFAULT_MANUFACTURERS, ...(dropdownOptions.manufacturer || [])]).includes(formData.manufacturer) && (
                            <Tooltip title="Save as new option">
                              <IconButton size="small" onClick={() => addDropdownOption('manufacturer', formData.manufacturer)}>
                                <Add fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Model" placeholder="e.g. Corolla" value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  error={!!errors.model} helperText={errors.model} required
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label="Year" type="number" placeholder="2024" value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  error={!!errors.year} helperText={errors.year} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday fontSize="small" color="action" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Autocomplete
                  freeSolo
                  options={[...new Set([...DEFAULT_CATEGORIES, ...(dropdownOptions.category || [])])]}
                  value={formData.category}
                  onChange={(e, v) => setFormData({ ...formData, category: v || '' })}
                  onInputChange={(e, v) => setFormData({ ...formData, category: v || '' })}
                  renderInput={(params) => (
                    <TextField {...params} label="Category"
                      InputProps={{ ...params.InputProps, endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          {formData.category && !([...DEFAULT_CATEGORIES, ...(dropdownOptions.category || [])]).includes(formData.category) && (
                            <Tooltip title="Save as new category"><IconButton size="small" onClick={() => addDropdownOption('category', formData.category)}><Add fontSize="small" /></IconButton></Tooltip>
                          )}
                        </>
                      )}}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label="Color" placeholder="White" value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><ColorLens fontSize="small" color="action" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label="Chassis / VIN" placeholder="e.g. JT2BF22K..." value={formData.chassisNumber}
                  onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                  error={!!errors.chassisNumber} helperText={errors.chassisNumber} required
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label="Engine Number" placeholder="e.g. 1NZ1234567" value={formData.engineNumber}
                  onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 3, mb: 2 }}>
              Specifications
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Autocomplete
                  freeSolo
                  options={[...new Set([...DEFAULT_ENGINE_TYPES, ...(dropdownOptions.engineType || [])])]}
                  value={formData.engineType}
                  onChange={(e, v) => setFormData({ ...formData, engineType: v || '' })}
                  onInputChange={(e, v) => setFormData({ ...formData, engineType: v || '' })}
                  renderInput={(params) => (
                    <TextField {...params} label="Engine Type"
                      InputProps={{ ...params.InputProps, endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          {formData.engineType && !([...DEFAULT_ENGINE_TYPES, ...(dropdownOptions.engineType || [])]).includes(formData.engineType) && (
                            <Tooltip title="Save as new engine type"><IconButton size="small" onClick={() => addDropdownOption('engineType', formData.engineType)}><Add fontSize="small" /></IconButton></Tooltip>
                          )}
                        </>
                      )}}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select value={formData.fuelType} label="Fuel Type" onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {FUEL_TYPES.map((fuel) => <MenuItem key={fuel} value={fuel}>{fuel}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Autocomplete
                  freeSolo
                  options={[...new Set([...DEFAULT_TRANSMISSIONS, ...(dropdownOptions.transmission || [])])]}
                  value={formData.transmission}
                  onChange={(e, v) => setFormData({ ...formData, transmission: v || '' })}
                  onInputChange={(e, v) => setFormData({ ...formData, transmission: v || '' })}
                  renderInput={(params) => (
                    <TextField {...params} label="Transmission"
                      InputProps={{ ...params.InputProps, endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          {formData.transmission && !([...DEFAULT_TRANSMISSIONS, ...(dropdownOptions.transmission || [])]).includes(formData.transmission) && (
                            <Tooltip title="Save as new transmission type"><IconButton size="small" onClick={() => addDropdownOption('transmission', formData.transmission)}><Add fontSize="small" /></IconButton></Tooltip>
                          )}
                        </>
                      )}}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Mileage (km)" type="number" placeholder="0" value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Speed fontSize="small" color="action" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Plate No." placeholder="e.g. KBL-1234" value={formData.plateNo}
                  onChange={(e) => setFormData({ ...formData, plateNo: e.target.value })}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Vehicle License" placeholder="License number" value={formData.vehicleLicense}
                  onChange={(e) => setFormData({ ...formData, vehicleLicense: e.target.value })}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Steering</InputLabel>
                  <Select value={formData.steering} label="Steering" onChange={(e) => setFormData({ ...formData, steering: e.target.value })}>
                    <MenuItem value="Left">Left Hand Drive</MenuItem>
                    <MenuItem value="Right">Right Hand Drive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Monolithic / Cut</InputLabel>
                  <Select value={formData.monolithicCut} label="Monolithic / Cut" onChange={(e) => setFormData({ ...formData, monolithicCut: e.target.value })}>
                    <MenuItem value="Monolithic">Monolithic (Original)</MenuItem>
                    <MenuItem value="Cut">Cut</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status" onChange={(e) => {
                    const nextStatus = e.target.value;
                    setFormData({ ...formData, status: nextStatus, sellingPrice: nextStatus === 'Available' ? formData.sellingPrice : '0' });
                  }}>
                    <MenuItem value="Available">🟢 Available</MenuItem>
                    <MenuItem value="Reserved">🟡 Reserved</MenuItem>
                    <MenuItem value="Sold">🔴 Sold</MenuItem>
                    <MenuItem value="Coming">🔵 Coming</MenuItem>
                    <MenuItem value="Under Repair">🟠 Under Repair</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 3, mb: 2 }}>
              Buying Stages &amp; Costs
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Base Purchase Price" type="number" placeholder="0" value={formData.basePurchasePrice}
                  onChange={(e) => setFormData({ ...formData, basePurchasePrice: e.target.value })}
                  error={!!errors.basePurchasePrice} helperText={errors.basePurchasePrice} required
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(formData.baseCurrency)}</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Base Currency</InputLabel>
                  <Select value={formData.baseCurrency} label="Base Currency" onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}>
                    <MenuItem value="USD">🇺🇸 $ USD</MenuItem>
                    <MenuItem value="AFN">🇦🇫 ؋ AFN</MenuItem>
                    <MenuItem value="PKR">🇵🇰 ₨ PKR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Transport to Dubai" type="number" placeholder="0" value={formData.transportCostToDubai}
                  onChange={(e) => setFormData({ ...formData, transportCostToDubai: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(formData.baseCurrency)}</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Import to Afghanistan" type="number" placeholder="0" value={formData.importCostToAfghanistan}
                  onChange={(e) => setFormData({ ...formData, importCostToAfghanistan: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(formData.baseCurrency)}</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Repair Cost" type="number" placeholder="0" value={formData.repairCost}
                  onChange={(e) => setFormData({ ...formData, repairCost: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(formData.baseCurrency)}</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label="Total Cost (Auto)" type="number" value={totalCost.toFixed(2)} disabled
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(formData.baseCurrency)}</InputAdornment> }}
                  sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Selling Price" type="number" placeholder="0" value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  disabled={formData.status !== 'Available'}
                  error={!!errors.sellingPrice}
                  helperText={errors.sellingPrice || (formData.status !== 'Available' ? 'Auto-set to 0 for unavailable vehicles' : '')}
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol(formData.baseCurrency)}</InputAdornment>, endAdornment: <InputAdornment position="end">{formData.baseCurrency}</InputAdornment> }}
                />
              </Grid>
            </Grid>
          </>
        );

      case 1:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 1, mb: 2 }}>
              Reference Person (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              If this vehicle was brought through a reference/contact person, enter their details below.
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Button variant={refPerson.hasReference ? 'contained' : 'outlined'} size="small"
                onClick={() => setRefPerson({ ...refPerson, hasReference: !refPerson.hasReference })} sx={{ mr: 1 }}>
                {refPerson.hasReference ? '✅ Has Reference Person' : 'Add Reference Person'}
              </Button>
            </Box>

            {refPerson.hasReference && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" placeholder="Reference person name" value={refPerson.fullName}
                    onChange={(e) => setRefPerson({ ...refPerson, fullName: e.target.value })}
                    error={!!errors.refFullName} helperText={errors.refFullName} required
                    InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Tazkira Number" placeholder="National ID" value={refPerson.tazkiraNumber}
                    onChange={(e) => setRefPerson({ ...refPerson, tazkiraNumber: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" color="action" /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone Number" placeholder="+93 70 123 4567" value={refPerson.phoneNumber}
                    onChange={(e) => setRefPerson({ ...refPerson, phoneNumber: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Address" placeholder="Full address" value={refPerson.address}
                    onChange={(e) => setRefPerson({ ...refPerson, address: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" color="action" /></InputAdornment> }}
                  />
                </Grid>
              </Grid>
            )}

            {!refPerson.hasReference && (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Person sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>No reference person — click the button above to add one</Typography>
              </Box>
            )}
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 1, mb: 2 }}>
              Sharing / Partnership (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add partners/investors who share in this vehicle. Each person&apos;s percentage and investment amount will be recorded.
            </Typography>

            {errors.sharingTotal && (
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>{errors.sharingTotal}</Typography>
            )}

            {formSharingPersons.map((person, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle2" fontWeight={600}>Partner #{index + 1}</Typography>
                  <IconButton size="small" color="error" onClick={() => removeSharingPerson(index)}><Delete fontSize="small" /></IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={customers}
                      getOptionLabel={(option) => typeof option === 'string' ? option : `${option.fullName} (${option.phoneNumber || 'No phone'})`}
                      value={customers.find(c => c.id === person.customerId) || null}
                      onChange={(e, v) => {
                        updateSharingPerson(index, 'customerId', v?.id || null);
                        updateSharingPerson(index, 'personName', v?.fullName || '');
                        updateSharingPerson(index, 'phoneNumber', v?.phoneNumber || '');
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Customer" size="small"
                          error={!!errors[`sharing_${index}_name`]} helperText={errors[`sharing_${index}_name`]} required
                          InputProps={{ ...params.InputProps, startAdornment: (<><InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment>{params.InputProps.startAdornment}</>) }}
                        />
                      )}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Share %" type="number" size="small" value={person.percentage}
                      onChange={(e) => updateSharingPerson(index, 'percentage', e.target.value)}
                      error={!!errors[`sharing_${index}_pct`]} helperText={errors[`sharing_${index}_pct`]} required
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                    <Box display="flex" gap={0.5} mt={0.5}>
                      {[50, 33.33, 25].map((pct) => (
                        <Chip key={pct} label={pct === 33.33 ? '⅓' : pct === 50 ? '½' : '¼'} size="small" variant="outlined"
                          onClick={() => updateSharingPerson(index, 'percentage', pct.toString())} sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Investment" type="number" size="small" placeholder="0" value={person.investmentAmount}
                      onChange={(e) => updateSharingPerson(index, 'investmentAmount', e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol('AFN')}</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField fullWidth label="Phone" size="small" placeholder="+93..." value={person.phoneNumber}
                      onChange={(e) => updateSharingPerson(index, 'phoneNumber', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}

            <Button variant="outlined" startIcon={<GroupAdd />} onClick={addSharingPerson} sx={{ mt: 1 }}>
              Add Sharing Person
            </Button>

            {formSharingPersons.length > 0 && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${alpha(theme.palette.info.main, 0.15)}` }}>
                <Typography variant="body2" color="text.secondary">
                  Total Share: <strong>{formSharingPersons.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0).toFixed(2)}%</strong>
                  {' '} • Owner&apos;s Share: <strong>{(100 - formSharingPersons.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0)).toFixed(2)}%</strong>
                </Typography>
              </Box>
            )}

            {formSharingPersons.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                <GroupAdd sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>No sharing persons — the vehicle is fully owned by the showroom</Typography>
              </Box>
            )}
          </>
        );

        case 3:
          return (
            <>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 1, mb: 2 }}>
                Vehicle Images
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload up to 10 images (max 500KB each). You can add more later.
              </Typography>

              {/* Existing images (only in edit mode) */}
              {editingId && existingImages.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Existing Images
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {existingImages.map((img) => (
                      <ImageListItem key={img.id}>
                        <img
                          src={`/api${img.path}`}
                          alt={img.filename}
                          loading="lazy"
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <ImageListItemBar
                          position="bottom"
                          actionIcon={
                            <MuiIconButton size="small" onClick={() => deleteExistingImage(img.id)} sx={{ color: 'white' }}>
                              <DeleteIcon fontSize="small" />
                            </MuiIconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {/* New image upload */}
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
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1">Click to upload images</Typography>
                <Typography variant="caption" color="text.secondary">
                  (Max 500KB per file)
                </Typography>
              </Box>

              {/* Selected images preview */}
              {selectedImages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Selected Images ({selectedImages.length})
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {selectedImages.map((file, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          loading="lazy"
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <ImageListItemBar
                          title={file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                          subtitle={`${(file.size / 1024).toFixed(1)} KB`}
                          position="bottom"
                          actionIcon={
                            <MuiIconButton size="small" onClick={() => removeSelectedImage(index)} sx={{ color: 'white' }}>
                              <DeleteIcon fontSize="small" />
                            </MuiIconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </>
          );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Vehicle Inventory</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage vehicle stock, costs, partnerships, and details
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Add Vehicle
        </Button>
      </Box>

      {/* Search + Filter */}
      <Card sx={{ mb: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField fullWidth placeholder="Search by ID, make, model, category, or chassis..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="medium">
                <InputLabel>Filter by Status</InputLabel>
                <Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Available">🟢 Available</MenuItem>
                  <MenuItem value="Reserved">🟡 Reserved</MenuItem>
                  <MenuItem value="Sold">🔴 Sold</MenuItem>
                  <MenuItem value="Coming">🔵 Coming</MenuItem>
                  <MenuItem value="Under Repair">🟠 Under Repair</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <EnhancedDataTable
        columns={[
          { id: 'vehicleId', label: 'Vehicle ID', bold: true },
          { id: 'manufacturer', label: 'Make' },
          { id: 'model', label: 'Model' },
          { id: 'year', label: 'Year', align: 'right' },
          { id: 'category', label: 'Category' },
          { id: 'color', label: 'Color', hiddenOnMobile: true },
          { id: 'status', label: 'Status', format: (val) => {
            const colors = { Available: 'success', Reserved: 'warning', Sold: 'error', Coming: 'info', 'Under Repair': 'secondary' };
            return <Chip label={val || '-'} size="small" color={colors[val] || 'default'} />;
          }},
          { id: 'totalCostAFN', label: 'Total Cost (AFN)', align: 'right', hiddenOnMobile: true, format: (val) => val ? formatCurrency(val, 'AFN') : '-' },
          { id: 'sellingPriceAFN', label: 'Selling Price (AFN)', align: 'right', bold: true, format: (val) => val ? formatCurrency(val, 'AFN') : '0' },
          { id: '_actions', label: '', align: 'center', format: (val, row) => (
            <Box display="flex" gap={0.5}>
              <Tooltip title="View Details"><IconButton size="small" onClick={() => handleViewDetails(row)}><Visibility fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Show Images"><IconButton size="small" onClick={() => openGallery(row.id)}><PhotoLibrary fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Download PDF"><IconButton size="small" onClick={() => generatePDF(row.id)}><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
            </Box>
          )},
        ]}
        data={filteredVehicles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage={searchTerm || statusFilter ? 'No vehicles match your filters.' : 'No vehicles available.'}
      />

      {/* ═══════ ADD / EDIT VEHICLE DIALOG (3-Step Form) ═══════ */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsCar color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Vehicle' : 'Register New Vehicle'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {editingId ? `Editing reason: ${editReason}` : 'Complete all sections to register a vehicle'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Box sx={{ px: 3, pt: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent dividers sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Box>
            <Button disabled={activeStep === 0} onClick={() => setActiveStep(activeStep - 1)} startIcon={<NavigateBefore />}>Back</Button>
          </Box>
          <Box display="flex" gap={1}>
            <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
            {activeStep < STEPS.length - 1 ? (
              <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)} endIcon={<NavigateNext />}>Next</Button>
            ) : (
              <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? <Edit /> : <Add />} disabled={imageUploading}>
                {imageUploading ? 'Saving...' : (editingId ? 'Update Vehicle' : 'Register Vehicle')}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* ═══════ EDIT REASON DIALOG ═══════ */}
      <Dialog open={editReasonOpen} onClose={() => { setEditReasonOpen(false); setEditReason(''); setPendingEditVehicle(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Edit color="warning" />
            <Box>
              <Typography variant="h6" fontWeight={700}>Edit Reason Required</Typography>
              <Typography variant="caption" color="text.secondary">Why are you editing this vehicle?</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All changes are tracked. Please provide a reason for this edit.
          </Typography>
          <TextField fullWidth label="Reason for Editing" placeholder="e.g. Price correction, typo fix..." multiline rows={3}
            value={editReason} onChange={(e) => setEditReason(e.target.value)} required autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setEditReasonOpen(false); setEditReason(''); setPendingEditVehicle(null); }}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={confirmEdit} startIcon={<Edit />}>Continue to Edit</Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog open={galleryOpen} onClose={() => setGalleryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoLibrary color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Vehicle Images
          </Typography>
          <Box flex={1} />
          <IconButton onClick={() => setGalleryOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {galleryImages.length === 0 ? (
            <Box textAlign="center" py={4} color="text.secondary">
              <ImageIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body2" mt={1}>No images for this vehicle</Typography>
            </Box>
          ) : (
            <ImageList cols={3} gap={16}>
              {galleryImages.map((img) => (
                <ImageListItem key={img.id}>
                  <img
                    src={`/api${img.path}`}
                    alt={img.filename}
                    loading="lazy"
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                    onClick={() => window.open(`/api${img.path}`, '_blank')}
                  />
                  <ImageListItemBar
                    title={img.filename}
                    subtitle={`${(img.size / 1024).toFixed(1)} KB`}
                    actionIcon={
                      <Tooltip title="Open full size">
                        <MuiIconButton size="small" onClick={() => window.open(`/api${img.path}`, '_blank')} sx={{ color: 'white' }}>
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

      {/* ═══════ VEHICLE DETAIL DIALOG ═══════ */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Info color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {detailVehicle?.manufacturer} {detailVehicle?.model} ({detailVehicle?.year})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {detailVehicle?.vehicleId} • {detailVehicle?.chassisNumber}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDetailOpen(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>

        <Tabs value={detailTab} onChange={(e, v) => setDetailTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Vehicle Info" />
          <Tab label="Cost Breakdown" />
          <Tab label="Reference Person" />
          <Tab label="Sharing Persons" />
          <Tab label="Edit History" />
        </Tabs>

        <DialogContent sx={{ minHeight: 300, pt: 2 }}>
          {/* Tab 0: Vehicle Info */}
          {detailTab === 0 && detailVehicle && (
            <Grid container spacing={2}>
              {[
                ['Vehicle ID', detailVehicle.vehicleId], ['Manufacturer', detailVehicle.manufacturer],
                ['Model', detailVehicle.model], ['Year', detailVehicle.year],
                ['Category', detailVehicle.category], ['Color', detailVehicle.color],
                ['Chassis/VIN', detailVehicle.chassisNumber], ['Engine Number', detailVehicle.engineNumber],
                ['Engine Type', detailVehicle.engineType],
                ['Fuel Type', detailVehicle.fuelType], ['Transmission', detailVehicle.transmission],
                ['Mileage', detailVehicle.mileage ? `${detailVehicle.mileage} km` : '-'],
                ['Plate No.', detailVehicle.plateNo], ['Vehicle License', detailVehicle.vehicleLicense],
                ['Steering', detailVehicle.steering], ['Monolithic/Cut', detailVehicle.monolithicCut],
                ['Status', detailVehicle.status],
                ['Selling Price (AFN)', detailVehicle.sellingPriceAFN ? formatCurrency(detailVehicle.sellingPriceAFN, 'AFN') : '-'],
                ['Entered Selling Price', detailVehicle.sellingPrice ? formatCurrency(detailVehicle.sellingPrice, detailVehicle.baseCurrency) : '-'],
                ['Total Cost (AFN)', detailVehicle.totalCostAFN ? formatCurrency(detailVehicle.totalCostAFN, 'AFN') : '-'],
                ['Locked', detailVehicle.isLocked ? 'Yes (Sold)' : 'No'],
              ].map(([label, value]) => (
                <Grid item xs={6} sm={4} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value || '-'}</Typography>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 1: Cost Breakdown */}
          {detailTab === 1 && (
            <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Stage</strong></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Amount</strong></TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Currency</strong></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Amount (Converted)</strong></TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Date</strong></TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicleCosts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>No cost records found</TableCell></TableRow>
                  ) : vehicleCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell><Chip label={cost.stage} size="small" variant="outlined" /></TableCell>
                      <TableCell align="right">{Number(cost.amount).toLocaleString()}</TableCell>
                      <TableCell>{cost.currency}</TableCell>
                      <TableCell align="right">{Number(cost.amountInAFN).toLocaleString()}</TableCell>
                      <TableCell>{cost.date ? new Date(cost.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{cost.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 2: Reference Person */}
          {detailTab === 2 && (
            detailVehicle?.referencePerson ? (
              <Grid container spacing={2}>
                {[
                  ['Full Name', detailVehicle.referencePerson.fullName],
                  ['Tazkira Number', detailVehicle.referencePerson.tazkiraNumber],
                  ['Phone', detailVehicle.referencePerson.phoneNumber],
                  ['Address', detailVehicle.referencePerson.address],
                ].map(([label, value]) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{value || '-'}</Typography>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4} color="text.secondary">
                <Person sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" mt={1}>No reference person for this vehicle</Typography>
              </Box>
            )
          )}

          {/* Tab 3: Sharing Persons */}
          {detailTab === 3 && (
            sharingPersons.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Person</strong></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Share %</strong></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>Investment</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Phone</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sharingPersons.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell><strong>{p.personName}</strong></TableCell>
                        <TableCell align="right">{p.percentage}%</TableCell>
                        <TableCell align="right">{p.investmentAmount ? formatCurrency(p.investmentAmount) : '-'}</TableCell>
                        <TableCell>{p.phoneNumber || '-'}</TableCell>
                        <TableCell><Chip label={p.isActive ? 'Active' : 'Inactive'} size="small" color={p.isActive ? 'success' : 'default'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={4} color="text.secondary">
                <GroupAdd sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" mt={1}>No sharing persons — fully owned by showroom</Typography>
              </Box>
            )
          )}

          {/* Tab 4: Edit History */}
          {detailTab === 4 && (
            editHistory.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Field</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Old Value</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>New Value</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Reason</strong></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editHistory.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell><Chip label={h.fieldName} size="small" variant="outlined" /></TableCell>
                        <TableCell sx={{ color: 'error.main' }}>{h.oldValue || '-'}</TableCell>
                        <TableCell sx={{ color: 'success.main' }}>{h.newValue || '-'}</TableCell>
                        <TableCell>{h.reason}</TableCell>
                        <TableCell>{h.editedAt ? new Date(h.editedAt).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={4} color="text.secondary">
                <History sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" mt={1}>No edit history — this vehicle has not been modified</Typography>
              </Box>
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
