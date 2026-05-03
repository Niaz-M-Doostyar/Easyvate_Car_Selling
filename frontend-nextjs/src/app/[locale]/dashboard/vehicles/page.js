// src/app/[locale]/dashboard/vehicles/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
import apiClient, { getUploadUrl } from '@/utils/api';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { validateRequired, validatePrice, validateYear } from '@/utils/validation';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

const STEPS = ['vehicleDetails', 'referencePerson', 'sharingPartnership', 'images']; // keys

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG']; // Values used in API
const SHARING_CALCULATION_LABELS = {
  Investment: 'investmentBased',
  Percentage: 'manualPercentage',
};

export default function VehiclesPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('Vehicles');

  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [editHistory, setEditHistory] = useState([]);
  const [vehicleCosts, setVehicleCosts] = useState([]);
  const [sharingPersons, setSharingPersons] = useState([]);

  const [editReasonOpen, setEditReasonOpen] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [pendingEditVehicle, setPendingEditVehicle] = useState(null);

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVehicleId, setGalleryVehicleId] = useState(null);

  const [formData, setFormData] = useState({
    vehicleId: '', category: '', manufacturer: '', model: '', year: '',
    color: '', chassisNumber: '', engineNumber: '', engineType: '', fuelType: '', transmission: '',
    mileage: '', plateNo: '', vehicleLicense: '', steering: 'Left', monolithicCut: 'Monolithic',
    basePurchasePrice: '', baseCurrency: 'USD',
    transportCostToDubai: '0', importCostToAfghanistan: '0', repairCost: '0',
    sellingPrice: '', status: 'Available',
  });

  const [refPerson, setRefPerson] = useState({
    fullName: '', tazkiraNumber: '', phoneNumber: '', address: '', hasReference: false,
  });

  const [formSharingPersons, setFormSharingPersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rates, setRates] = useState({});
  const [customerBalanceMap, setCustomerBalanceMap] = useState({});

  const [dropdownOptions, setDropdownOptions] = useState({ manufacturer: [], category: [], engineType: [], transmission: [] });
  const [addOptionDialog, setAddOptionDialog] = useState({ open: false, field: '', value: '' });

  // Fetch data
  useEffect(() => { fetchVehicles(); fetchCustomers(); fetchDropdownOptions(); fetchRates(); }, []);

  useEffect(() => {
    if (customers.length) {
      const map = {};
      customers.forEach(c => { map[c.id] = c.balance || 0; });
      setCustomerBalanceMap(map);
    }
  }, [customers]);

  useEffect(() => {
    const urls = selectedImages.map(file => URL.createObjectURL(file));
    setSelectedImagePreviews(urls);
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [selectedImages]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data.data || []);
    } catch {
      enqueueSnackbar(t('fetchError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data.data || []);
    } catch {}
  };

  const fetchRates = async () => {
    try {
      const res = await apiClient.get('/currency/rates');
      setRates(res.data.data || {});
    } catch {}
  };

  const fetchDropdownOptions = async () => {
    try {
      const res = await apiClient.get('/vehicles/dropdown-options');
      setDropdownOptions(res.data.data || { manufacturer: [], category: [], engineType: [], transmission: [] });
    } catch {}
  };

  const handleAddOption = async () => {
    const { field, value } = addOptionDialog;
    if (!value.trim()) return;
    try {
      await apiClient.post('/vehicles/dropdown-options', { field, value: value.trim() });
      await fetchDropdownOptions();
      enqueueSnackbar(t('optionAdded' /* generic, maybe not needed */), { variant: 'success' });
      setAddOptionDialog({ open: false, field: '', value: '' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Failed to add option', { variant: 'error' });
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

  // Cost calculations (unchanged)
  const totalCost = useMemo(() => {
    const base = parseFloat(formData.basePurchasePrice) || 0;
    const baseRate = formData.baseCurrency === 'AFN' ? 1 : (parseFloat(rates[`${formData.baseCurrency}-AFN`]) || 0);
    const baseAFN = formData.baseCurrency === 'AFN' ? base : base * baseRate;
    const transport = parseFloat(formData.transportCostToDubai) || 0;
    const importCost = parseFloat(formData.importCostToAfghanistan) || 0;
    const repair = parseFloat(formData.repairCost) || 0;
    return baseAFN + transport + importCost + repair;
  }, [formData.basePurchasePrice, formData.baseCurrency, formData.transportCostToDubai, formData.importCostToAfghanistan, formData.repairCost, rates]);

  const totalCostReady = formData.baseCurrency === 'AFN' || Boolean(rates[`${formData.baseCurrency}-AFN`]);
  const sharingUsesInvestment = useMemo(() => {
    return formSharingPersons.some((person) => (parseFloat(person.investmentAmount) || 0) > 0);
  }, [formSharingPersons]);

  const partnershipPreview = useMemo(() => {
    const totalInvestment = formSharingPersons.reduce((sum, person) => sum + (parseFloat(person.investmentAmount) || 0), 0);
    const totalPercentage = formSharingPersons.reduce((sum, person) => sum + (parseFloat(person.percentage) || 0), 0);
    const previewPartners = formSharingPersons.map((person) => {
      const investmentAmount = parseFloat(person.investmentAmount) || 0;
      return {
        ...person,
        sharePercentage: sharingUsesInvestment && totalCostReady && totalCost > 0
          ? (investmentAmount / totalCost) * 100
          : parseFloat(person.percentage) || 0,
      };
    });

    return {
      totalInvestment,
      totalPercentage,
      partnerPercentageTotal: previewPartners.reduce((sum, person) => sum + (person.sharePercentage || 0), 0),
      ownerInvestment: Math.max(totalCost - totalInvestment, 0),
      ownerPercentage: Math.max(100 - previewPartners.reduce((sum, person) => sum + (person.sharePercentage || 0), 0), 0),
      partners: previewPartners,
    };
  }, [formSharingPersons, sharingUsesInvestment, totalCost, totalCostReady]);

  const validateSharingBalances = () => {
    const newErrors = {};
    if (!totalCostReady || totalCost <= 0) return {};
    formSharingPersons.forEach((person, idx) => {
      if (person.customerId && person.percentage && parseFloat(person.percentage) > 0) {
        const requiredInvestment = (parseFloat(person.percentage) / 100) * totalCost;
        const customerBalance = customerBalanceMap[person.customerId] || 0;
        if (requiredInvestment > customerBalance) {
          newErrors[`sharing_${idx}_balance`] = t('customerBalanceInsufficient', {
            balance: formatCurrency(customerBalance),
            required: formatCurrency(requiredInvestment),
          });
        }
      }
    });
    return newErrors;
  };

  useEffect(() => {
    const balanceErrors = validateSharingBalances();
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith('sharing_') && key.endsWith('_balance')) {
          delete newErrors[key];
        }
      });
      return { ...newErrors, ...balanceErrors };
    });
  }, [formSharingPersons, totalCost, customerBalanceMap, totalCostReady, t]);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!validateRequired(formData.manufacturer)) newErrors.manufacturer = t('errorManufacturerRequired');
    if (!validateRequired(formData.model)) newErrors.model = t('errorModelRequired');
    if (!validateRequired(formData.year) || !validateYear(formData.year)) newErrors.year = t('errorYearRequired');
    if (!validateRequired(formData.chassisNumber)) newErrors.chassisNumber = t('errorChassisRequired');
    if (!validateRequired(formData.basePurchasePrice) || !validatePrice(formData.basePurchasePrice)) newErrors.basePurchasePrice = t('errorBasePriceRequired');
    if (!validateRequired(formData.sellingPrice) || !validatePrice(formData.sellingPrice)) newErrors.sellingPrice = t('errorSellingPriceRequired');
    if (refPerson.hasReference && !validateRequired(refPerson.fullName)) newErrors.refFullName = t('errorRefNameRequired');

    const balanceErrors = validateSharingBalances();
    if (Object.keys(balanceErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...balanceErrors }));
      setActiveStep(2);
      enqueueSnackbar(t('errorSharingBalanceIssue'), { variant: 'error' });
      return;
    }

    if (formSharingPersons.length > 0) {
      if (sharingUsesInvestment) {
        const totalInvestment = formSharingPersons.reduce((s, p) => s + (parseFloat(p.investmentAmount) || 0), 0);
        if (totalCostReady && totalInvestment > totalCost + 0.01) {
          newErrors.sharingTotal = t('sharingTotalError');
        }
        formSharingPersons.forEach((p, i) => {
          if (!p.personName && !p.customerId) newErrors[`sharing_${i}_name`] = t('errorPartnerRequired');
          if (!p.investmentAmount || parseFloat(p.investmentAmount) <= 0) newErrors[`sharing_${i}_investment`] = t('errorInvestmentRequired');
        });
      } else {
        const totalPct = formSharingPersons.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0);
        if (totalPct > 100) newErrors.sharingTotal = t('sharingTotalPctError');
        formSharingPersons.forEach((p, i) => {
          if (!p.personName && !p.customerId) newErrors[`sharing_${i}_name`] = t('errorPartnerRequired');
          if (!p.percentage || parseFloat(p.percentage) <= 0) newErrors[`sharing_${i}_pct`] = t('errorPercentageRequired');
        });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Jump to relevant step
      if (newErrors.manufacturer || newErrors.model || newErrors.year || newErrors.chassisNumber || newErrors.basePurchasePrice || newErrors.sellingPrice) {
        setActiveStep(0);
      } else if (newErrors.refFullName) {
        setActiveStep(1);
      } else if (newErrors.sharingTotal || Object.keys(newErrors).some(k => k.startsWith('sharing_'))) {
        setActiveStep(2);
      }
      enqueueSnackbar(t('pleaseFixErrors'), { variant: 'error' });
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
      sellingPrice: parseFloat(formData.sellingPrice),
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
        customerId: p.customerId || null,
        personName: p.personName,
        percentage: parseFloat(p.percentage) || 0,
        investmentAmount: parseFloat(p.investmentAmount) || 0,
        phoneNumber: p.phoneNumber || '',
        calculationMethod: sharingUsesInvestment ? 'Investment' : 'Percentage',
      }));
    }

    setImageUploading(true);
    try {
      let vehicleId;
      if (editingId) {
        vehicleData.editReason = editReason || t('updatedVehicleDetails');
        await apiClient.put(`/vehicles/${editingId}`, vehicleData);
        vehicleId = editingId;
        enqueueSnackbar(t('vehicleUpdated'), { variant: 'success' });
      } else {
        const response = await apiClient.post('/vehicles', vehicleData);
        vehicleId = response.data.id;
        enqueueSnackbar(t('vehicleSaved'), { variant: 'success' });
      }

      if (selectedImages.length > 0) {
        const formDataImg = new FormData();
        selectedImages.forEach(file => formDataImg.append('images', file));
        await apiClient.post(`/vehicles/${vehicleId}/images`, formDataImg, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setOpen(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || t('saveError'), { variant: 'error' });
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
      sellingPrice: '', status: 'Available',
    });
    setRefPerson({ fullName: '', tazkiraNumber: '', phoneNumber: '', address: '', hasReference: false });
    setFormSharingPersons([]);
    setErrors({});
    setEditingId(null);
    setActiveStep(0);
    setEditReason('');
    setSelectedImages([]);
    setSelectedImagePreviews([]);
    setExistingImages([]);
    setImageErrors([]);
  };

  const handleEdit = (vehicle) => {
    if (vehicle.isLocked) {
      enqueueSnackbar(t('lockedVehicleWarning'), { variant: 'warning' });
      return;
    }
    setPendingEditVehicle(vehicle);
    setEditReasonOpen(true);
  };

  const confirmEdit = async () => {
    if (!editReason.trim()) {
      enqueueSnackbar(t('editReasonRequiredPrompt') /* maybe separate */, { variant: 'warning' });
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
        customerId: p.customerId || '',
        personName: p.personName,
        percentage: p.percentage,
        investmentAmount: p.investmentAmount || '',
        phoneNumber: p.phoneNumber || '',
        calculationMethod: p.calculationMethod || 'Percentage',
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
      enqueueSnackbar(t('cannotDeleteLocked'), { variant: 'warning' });
      return;
    }
    if (!window.confirm(t('confirmDeleteVehicle'))) return;
    try {
      await apiClient.delete(`/vehicles/${id}`);
      enqueueSnackbar(t('vehicleDeleted'), { variant: 'success' });
      fetchVehicles();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || t('deleteError'), { variant: 'error' });
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
      enqueueSnackbar(t('pdfGenerated'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('pdfError'), { variant: 'error' });
    }
  };

  // Sharing helpers
  const addSharingPerson = () => {
    setFormSharingPersons([...formSharingPersons, { customerId: '', personName: '', percentage: '', investmentAmount: '', phoneNumber: '', calculationMethod: 'Percentage' }]);
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
        errors.push(t('errorImageTooBig', { fileName: file.name }));
      } else if (!file.type.startsWith('image/')) {
        errors.push(t('errorNotImage', { fileName: file.name }));
      } else {
        validFiles.push(file);
      }
    });
    if (errors.length > 0) {
      setImageErrors(errors);
      enqueueSnackbar(t('fileRejected', { count: errors.length }), { variant: 'warning' });
    } else {
      setImageErrors([]);
    }
    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId) => {
    if (!window.confirm(t('confirmDeleteImage'))) return;
    try {
      await apiClient.delete(`/vehicles/images/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      enqueueSnackbar(t('imageDeleted'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('deleteImageError'), { variant: 'error' });
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
    result = result.filter((v) => {
      // Check vehicle fields
      if (
        v.vehicleId?.toLowerCase().includes(term) ||
        v.manufacturer?.toLowerCase().includes(term) ||
        v.model?.toLowerCase().includes(term) ||
        v.category?.toLowerCase().includes(term) ||
        v.chassisNumber?.toLowerCase().includes(term) ||
        v.year?.toString().includes(term)
      ) return true;
      
      // Check reference person fields (if any)
      if (v.referencePerson) {
        if (
          v.referencePerson.fullName?.toLowerCase().includes(term) ||
          v.referencePerson.tazkiraNumber?.toLowerCase().includes(term) ||
          v.referencePerson.phoneNumber?.toLowerCase().includes(term)
        ) return true;
      }
      return false;
    });
  }
  return result;
}, [vehicles, searchTerm, statusFilter]);

  // Step content renderer
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 1, mb: 2 }}>
              {t('sectionVehicleIdentity')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Autocomplete freeSolo options={dropdownOptions.manufacturer || []}
                  value={formData.manufacturer || ''}
                  onChange={(_, val) => setFormData({ ...formData, manufacturer: val || '' })}
                  onInputChange={(_, val, reason) => { if (reason === 'input') setFormData({ ...formData, manufacturer: val }); }}
                  renderInput={(params) => (
                    <TextField {...params} label={t('labelManufacturer')} error={!!errors.manufacturer} helperText={errors.manufacturer} required />
                  )}
                />
                <IconButton color="primary" sx={{ mt: 1 }} onClick={() => setAddOptionDialog({ open: true, field: 'manufacturer', value: '' })}>
                  <Add fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label={t('labelModel')} value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  error={!!errors.model} helperText={errors.model} required />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label={t('labelYear')} size="small" type="number" placeholder="2024" value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  error={!!errors.year} helperText={errors.year} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday fontSize="small" color="action" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Autocomplete freeSolo options={dropdownOptions.category || []}
                  value={formData.category || ''}
                  onChange={(_, val) => setFormData({ ...formData, category: val || '' })}
                  onInputChange={(_, val, reason) => { if (reason === 'input') setFormData({ ...formData, category: val }); }}
                  renderInput={(params) => <TextField {...params} label={t('labelCategory')} />} />
                <IconButton color="primary" sx={{ mt: 1 }} onClick={() => setAddOptionDialog({ open: true, field: 'category', value: '' })}>
                  <Add fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label={t('labelColor')} value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><ColorLens fontSize="small" color="action" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label={t('labelChassisVin')} value={formData.chassisNumber}
                  onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                  error={!!errors.chassisNumber} helperText={errors.chassisNumber} required />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth label={t('labelEngineNumber')} value={formData.engineNumber}
                  onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })} />
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 3, mb: 2 }}>
              {t('sectionSpecifications')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Autocomplete freeSolo options={dropdownOptions.engineType || []}
                  value={formData.engineType || ''}
                  onChange={(_, val) => setFormData({ ...formData, engineType: val || '' })}
                  onInputChange={(_, val, reason) => { if (reason === 'input') setFormData({ ...formData, engineType: val }); }}
                  renderInput={(params) => <TextField {...params} label={t('labelEngineType')} />} />
                <IconButton color="primary" sx={{ mt: 1 }} onClick={() => setAddOptionDialog({ open: true, field: 'engineType', value: '' })}>
                  <Add fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('labelFuelType')}</InputLabel>
                  <Select value={formData.fuelType} label={t('labelFuelType')} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}>
                    <MenuItem value=""><em>{t('none')}</em></MenuItem>
                    {FUEL_TYPES.map((fuel) => (
                      <MenuItem key={fuel} value={fuel}>{t(`fuel${fuel}`)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Autocomplete freeSolo options={dropdownOptions.transmission || []}
                  value={formData.transmission || ''}
                  onChange={(_, val) => setFormData({ ...formData, transmission: val || '' })}
                  onInputChange={(_, val, reason) => { if (reason === 'input') setFormData({ ...formData, transmission: val }); }}
                  renderInput={(params) => <TextField {...params} label={t('labelTransmission')} />} />
                <IconButton color="primary" sx={{ mt: 1 }} onClick={() => setAddOptionDialog({ open: true, field: 'transmission', value: '' })}>
                  <Add fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label={t('labelMileage')} type="text" value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Speed fontSize="small" color="action" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label={t('labelPlateNo')} value={formData.plateNo}
                  onChange={(e) => setFormData({ ...formData, plateNo: e.target.value })} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label={t('labelVehicleLicense')} value={formData.vehicleLicense}
                  onChange={(e) => setFormData({ ...formData, vehicleLicense: e.target.value })} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('labelSteering')}</InputLabel>
                  <Select value={formData.steering} label={t('labelSteering')} onChange={(e) => setFormData({ ...formData, steering: e.target.value })}>
                    <MenuItem value="Left">{t('steeringLeft')}</MenuItem>
                    <MenuItem value="Right">{t('steeringRight')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('labelMonolithicCut')}</InputLabel>
                  <Select value={formData.monolithicCut} label={t('labelMonolithicCut')} onChange={(e) => setFormData({ ...formData, monolithicCut: e.target.value })}>
                    <MenuItem value="Monolithic">{t('monolithic')}</MenuItem>
                    <MenuItem value="Cut">{t('cut')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('labelStatus')}</InputLabel>
                  <Select value={formData.status} label={t('labelStatus')} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <MenuItem value="Available">{t('statusAvailable')}</MenuItem>
                    <MenuItem value="Reserved">{t('statusReserved')}</MenuItem>
                    <MenuItem value="Sold">{t('statusSold')}</MenuItem>
                    <MenuItem value="Coming">{t('statusComing')}</MenuItem>
                    <MenuItem value="Under Repair">{t('statusUnderRepair')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 3, mb: 2 }}>
              {t('sectionBuyingCosts')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label={t('labelBasePurchasePrice')} type="number" value={formData.basePurchasePrice}
                  onChange={(e) => setFormData({ ...formData, basePurchasePrice: e.target.value })}
                  error={!!errors.basePurchasePrice} helperText={errors.basePurchasePrice} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small" color="action" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('labelBaseCurrency')}</InputLabel>
                  <Select value={formData.baseCurrency} label={t('labelBaseCurrency')} onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}>
                    <MenuItem value="USD">{t('currencyUsd')}</MenuItem>
                    <MenuItem value="AFN">{t('currencyAfn')}</MenuItem>
                    <MenuItem value="PKR">{t('currencyPkr')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label={t('labelTransportDubai')} type="number" value={formData.transportCostToDubai}
                  onChange={(e) => setFormData({ ...formData, transportCostToDubai: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol('AFN')}</InputAdornment> }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label={t('labelImportAfghanistan')} type="number" value={formData.importCostToAfghanistan}
                  onChange={(e) => setFormData({ ...formData, importCostToAfghanistan: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol('AFN')}</InputAdornment> }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label={t('labelRepairCost')} type="number" value={formData.repairCost}
                  onChange={(e) => setFormData({ ...formData, repairCost: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol('AFN')}</InputAdornment> }} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth label={t('labelTotalCostAfn')} type="number" value={totalCost.toFixed(2)} disabled
                  helperText={totalCostReady ? t('totalCostHelper') : t('totalCostHelperNoRate', { currency: formData.baseCurrency })}
                  InputProps={{ startAdornment: <InputAdornment position="start">{getCurrencySymbol('AFN')}</InputAdornment> }}
                  sx={{ '& .MuiInputBase-root': { bgcolor: 'action.hover' } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label={t('labelSellingPrice')} type="number" value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  error={!!errors.sellingPrice} helperText={errors.sellingPrice} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><Sell fontSize="small" color="action" /></InputAdornment>, endAdornment: <InputAdornment position="end">{getCurrencySymbol(formData.baseCurrency)}</InputAdornment> }} />
              </Grid>
            </Grid>
          </>
        );

      case 1:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 1, mb: 2 }}>
              {t('sectionReferencePerson')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('referenceDescription')}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button variant={refPerson.hasReference ? 'contained' : 'outlined'} size="small"
                onClick={() => setRefPerson({ ...refPerson, hasReference: !refPerson.hasReference })} sx={{ mr: 1 }}>
                {refPerson.hasReference ? t('hasReferenceActive') : t('hasReferenceButton')}
              </Button>
            </Box>
            {refPerson.hasReference && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label={t('labelFullName')} value={refPerson.fullName}
                    onChange={(e) => setRefPerson({ ...refPerson, fullName: e.target.value })}
                    error={!!errors.refFullName} helperText={errors.refFullName} required
                    InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label={t('labelTazkiraNumber')} value={refPerson.tazkiraNumber}
                    onChange={(e) => setRefPerson({ ...refPerson, tazkiraNumber: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" color="action" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label={t('labelPhoneNumber')} value={refPerson.phoneNumber}
                    onChange={(e) => setRefPerson({ ...refPerson, phoneNumber: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label={t('labelAddress')} value={refPerson.address}
                    onChange={(e) => setRefPerson({ ...refPerson, address: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" color="action" /></InputAdornment> }} />
                </Grid>
              </Grid>
            )}
            {!refPerson.hasReference && (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Person sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>{t('noReferencePerson')}</Typography>
              </Box>
            )}
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 1, mb: 2 }}>
              {t('sectionSharingPartnership')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('sharingDescription')}
            </Typography>
            {errors.sharingTotal && (
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>{errors.sharingTotal}</Typography>
            )}
            {formSharingPersons.map((person, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle2" fontWeight={600}>{t('partner', { number: index + 1 })}</Typography>
                  <IconButton size="small" color="error" onClick={() => removeSharingPerson(index)}><Delete fontSize="small" /></IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      freeSolo
                      options={customers}
                      getOptionLabel={(opt) => typeof opt === 'string' ? opt : (opt.fullName || '')}
                      value={person.customerId ? (customers.find((customer) => customer.id === person.customerId) || person.personName || '') : (person.personName || '')}
                      onChange={(_, val) => {
                        if (typeof val === 'string') {
                          setFormSharingPersons((prev) => prev.map((entry, entryIndex) => entryIndex === index ? {
                            ...entry,
                            customerId: '',
                            personName: val,
                          } : entry));
                          return;
                        }
                        if (!val) {
                          setFormSharingPersons((prev) => prev.map((entry, entryIndex) => entryIndex === index ? {
                            ...entry,
                            customerId: '',
                            personName: '',
                          } : entry));
                          return;
                        }
                        setFormSharingPersons((prev) => prev.map((entry, entryIndex) => entryIndex === index ? {
                          ...entry,
                          customerId: val.id,
                          personName: val.fullName || '',
                          phoneNumber: val.phoneNumber || entry.phoneNumber || '',
                        } : entry));
                      }}
                      onInputChange={(_, val, reason) => {
                        if (reason === 'input') {
                          setFormSharingPersons((prev) => prev.map((entry, entryIndex) => entryIndex === index ? {
                            ...entry,
                            customerId: '',
                            personName: val,
                          } : entry));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth label={t('labelPartnerCustomer')} size="small" required
                          error={!!errors[`sharing_${index}_name`]} helperText={errors[`sharing_${index}_name`]}
                          InputProps={{ ...params.InputProps, startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment> }} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label={t('labelSharePercentage')} type="number" size="small"
                      value={sharingUsesInvestment ? (Number(partnershipPreview.partners[index]?.sharePercentage || 0).toFixed(2)) : person.percentage}
                      onChange={(e) => updateSharingPerson(index, 'percentage', e.target.value)}
                      error={!!errors[`sharing_${index}_pct`]}
                      helperText={sharingUsesInvestment ? (totalCostReady ? t('calculationBasedOnInvestment') : t('calculationAfterSave')) : errors[`sharing_${index}_pct`]}
                      required={!sharingUsesInvestment}
                      disabled={sharingUsesInvestment}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                    {errors[`sharing_${index}_balance`] && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                        {errors[`sharing_${index}_balance`]}
                      </Typography>
                    )}
                    {!sharingUsesInvestment && (
                      <Box display="flex" gap={0.5} mt={0.5}>
                        {[50, 33.33, 25].map((pct) => (
                          <Chip key={pct} label={pct === 33.33 ? '⅓' : pct === 50 ? '½' : '¼'} size="small" variant="outlined"
                            onClick={() => updateSharingPerson(index, 'percentage', pct.toString())} sx={{ cursor: 'pointer', fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label={t('labelPhone')} size="small" value={person.phoneNumber}
                      onChange={(e) => updateSharingPerson(index, 'phoneNumber', e.target.value)} />
                  </Grid>
                </Grid>
              </Card>
            ))}
            <Button variant="outlined" startIcon={<GroupAdd />} onClick={addSharingPerson} sx={{ mt: 1 }}>
              {t('addSharingPerson')}
            </Button>
            {formSharingPersons.length > 0 && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${alpha(theme.palette.info.main, 0.15)}` }}>
                {sharingUsesInvestment ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('partnershipInfoCapital', {
                      totalInvestment: formatCurrency(partnershipPreview.totalInvestment),
                      ownerInvestment: formatCurrency(partnershipPreview.ownerInvestment),
                      partnerShare: partnershipPreview.partnerPercentageTotal.toFixed(2),
                      ownerShare: partnershipPreview.ownerPercentage.toFixed(2),
                    })}
                    {!totalCostReady && ' ' + t('calculationAfterSave')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('partnershipInfoPercentage', {
                      totalPercentage: partnershipPreview.totalPercentage.toFixed(2),
                      ownerShare: (100 - partnershipPreview.totalPercentage).toFixed(2),
                    })}
                  </Typography>
                )}
              </Box>
            )}
            {formSharingPersons.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                <GroupAdd sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>{t('sharingNoPartners')}</Typography>
              </Box>
            )}
          </>
        );

      case 3:
        return (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'block', mt: 1, mb: 2 }}>
              {t('sectionImages')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('imageDescription')}
            </Typography>
            {editingId && existingImages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {t('existingImages')}
                </Typography>
                <ImageList cols={3} gap={8} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {existingImages.map((img) => (
                    <ImageListItem key={img.id}>
                      <img src={getUploadUrl(img.path)} alt={img.filename} loading="lazy"
                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }} />
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
            <Box
              sx={{
                border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center',
                bgcolor: 'action.hover', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }
              }}
              onClick={() => document.getElementById('image-upload').click()}
            >
              <input id="image-upload" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
              <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1">{t('uploadPrompt')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('uploadHint')}</Typography>
            </Box>
            {selectedImages.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {t('selectedImages', { count: selectedImages.length })}
                </Typography>
                <ImageList cols={3} gap={8} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {selectedImages.map((file, index) => (
                    <ImageListItem key={index}>
                      <img src={selectedImagePreviews[index] || ''} alt={file.name} loading="lazy"
                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }} />
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
          <Typography variant="h4" fontWeight={700}>{t('pageTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('pageSubtitle')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          {t('addVehicle')}
        </Button>
      </Box>

      <Card sx={{ mb: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField fullWidth placeholder={t('searchPlaceholder')}
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="medium">
                <InputLabel>{t('filterByStatus')}</InputLabel>
                <Select value={statusFilter} label={t('filterByStatus')} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">{t('allStatuses')}</MenuItem>
                  <MenuItem value="Available">{t('statusAvailable')}</MenuItem>
                  <MenuItem value="Reserved">{t('statusReserved')}</MenuItem>
                  <MenuItem value="Sold">{t('statusSold')}</MenuItem>
                  <MenuItem value="Coming">{t('statusComing')}</MenuItem>
                  <MenuItem value="Under Repair">{t('statusUnderRepair')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <EnhancedDataTable
        columns={[
          { id: 'vehicleId', label: t('columnVehicleId'), bold: true },
          { id: 'manufacturer', label: t('columnMake') },
          { id: 'model', label: t('columnModel') },
          { id: 'year', label: t('columnYear'), align: 'right' },
          { id: 'category', label: t('columnCategory') },
          { id: 'color', label: t('columnColor'), hiddenOnMobile: true },
          { id: 'status', label: t('columnStatus'), format: (val) => {
            const colors = { Available: 'success', Reserved: 'warning', Sold: 'error', Coming: 'info', 'Under Repair': 'secondary' };
            return <Chip label={val || '-'} size="small" color={colors[val] || 'default'} />;
          }},
          { id: 'totalCostPKR', label: t('columnTotalCost'), align: 'right', hiddenOnMobile: true, format: (val) => val ? formatCurrency(val) : '-' },
          { id: 'sellingPrice', label: t('columnSellingPrice'), align: 'right', bold: true, format: (val) => val ? formatCurrency(val) : '0' },
          { id: '_actions', label: t('columnActions'), align: 'center', format: (val, row) => (
            <Box display="flex" gap={0.5}>
              <Tooltip title={t('viewDetails')}><IconButton size="small" onClick={() => handleViewDetails(row)}><Visibility fontSize="small" /></IconButton></Tooltip>
              <Tooltip title={t('showImages')}><IconButton size="small" onClick={() => openGallery(row.id)}><PhotoLibrary fontSize="small" /></IconButton></Tooltip>
              <Tooltip title={t('downloadPdf')}><IconButton size="small" onClick={() => generatePDF(row.id)}><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
            </Box>
          )},
        ]}
        data={filteredVehicles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage={searchTerm || statusFilter ? t('noVehiclesMatchFilters') : t('noVehicles')}
      />
            {/* Vehicle count summary */}
      <Box sx={{ position: 'relative',}}>
        <Box
          sx={{
            position: 'absolute',
            left: 15,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: 'black !important', whiteSpace: 'nowrap', gap: 2 }}>
            {filteredVehicles.filter(v => v.status === 'Available').length} {t('vehiclesAvailable')}, {filteredVehicles.filter(v => v.status === 'Reserved').length} {t('vehiclesReserved')}, {filteredVehicles.filter(v => v.status === 'Sold').length} {t('vehiclesSold')}, {filteredVehicles.filter(v => v.status === 'Coming').length} {t('vehiclesComing')}, {filteredVehicles.filter(v => v.status === 'Under Repair').length} {t('vehiclesUnderRepair')}
          </Typography>
        </Box>
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsCar color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingId ? t('editVehicleDialogTitle') : t('registerVehicleDialogTitle')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingId ? `${t('editingReason')}: ${editReason}` : t('completeSections')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Box sx={{ px: 3, pt: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((step) => (
              <Step key={step}><StepLabel>{t(step)}</StepLabel></Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent dividers sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Box>
            <Button disabled={activeStep === 0} onClick={() => setActiveStep(activeStep - 1)} startIcon={<NavigateBefore />}>
              {t('back')}
            </Button>
          </Box>
          <Box display="flex" gap={1}>
            <Button onClick={() => { setOpen(false); resetForm(); }}>{t('cancel')}</Button>
            {activeStep < STEPS.length - 1 ? (
              <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)} endIcon={<NavigateNext />}>
                {t('next')}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleSubmit} startIcon={editingId ? <Edit /> : <Add />} disabled={imageUploading}>
                {imageUploading ? t('saving') : (editingId ? t('updateVehicle') : t('registerVehicle'))}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Edit Reason Dialog */}
      <Dialog open={editReasonOpen} onClose={() => { setEditReasonOpen(false); setEditReason(''); setPendingEditVehicle(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Edit color="warning" />
            <Box>
              <Typography variant="h6" fontWeight={700}>{t('editReasonRequired')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('editReasonPrompt')}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('editReasonDescription')}
          </Typography>
          <TextField fullWidth label={t('editReasonPlaceholder')} placeholder={t('editReasonPlaceholder')} multiline rows={3}
            value={editReason} onChange={(e) => setEditReason(e.target.value)} required autoFocus />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setEditReasonOpen(false); setEditReason(''); setPendingEditVehicle(null); }}>{t('cancel')}</Button>
          <Button variant="contained" color="warning" onClick={confirmEdit} startIcon={<Edit />}>{t('continueToEdit')}</Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog open={galleryOpen} onClose={() => setGalleryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoLibrary color="primary" />
          <Typography variant="h6" fontWeight={700}>{t('imageGalleryTitle')}</Typography>
          <Box flex={1} />
          <IconButton onClick={() => setGalleryOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {galleryImages.length === 0 ? (
            <Box textAlign="center" py={4} color="text.secondary">
              <ImageIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body2" mt={1}>{t('noImages')}</Typography>
            </Box>
          ) : (
            <ImageList cols={3} gap={16}>
              {galleryImages.map((img) => (
                <ImageListItem key={img.id}>
                  <img src={getUploadUrl(img.path)} alt={img.filename} loading="lazy"
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                    onClick={() => window.open(getUploadUrl(img.path), '_blank')} />
                  <ImageListItemBar
                    title={img.filename}
                    subtitle={`${(img.size / 1024).toFixed(1)} KB`}
                    actionIcon={
                      <Tooltip title={t('zoomIn')}><MuiIconButton size="small" onClick={() => window.open(getUploadUrl(img.path), '_blank')} sx={{ color: 'white' }}><ZoomIn fontSize="small" /></MuiIconButton></Tooltip>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </DialogContent>
      </Dialog>

      {/* Vehicle Detail Dialog */}
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
          <Tab label={t('vehicleDetailInfo')} />
          <Tab label={t('vehicleDetailCosts')} />
          <Tab label={t('vehicleDetailReference')} />
          <Tab label={t('vehicleDetailSharing')} />
          <Tab label={t('vehicleDetailHistory')} />
        </Tabs>

        <DialogContent sx={{ minHeight: 300, pt: 2 }}>
          {detailTab === 0 && detailVehicle && (
            <Grid container spacing={2}>
              {[
                [t('labelVehicleId'), detailVehicle.vehicleId],
                [t('labelManufacturer'), detailVehicle.manufacturer],
                [t('labelModel'), detailVehicle.model],
                [t('labelYear'), detailVehicle.year],
                [t('labelCategory'), detailVehicle.category],
                [t('labelColor'), detailVehicle.color],
                [t('labelChassisVin'), detailVehicle.chassisNumber],
                [t('labelEngineNumber'), detailVehicle.engineNumber],
                [t('labelEngineType'), detailVehicle.engineType],
                [t('labelFuelType'), detailVehicle.fuelType],
                [t('labelTransmission'), detailVehicle.transmission],
                [t('labelMileage'), detailVehicle.mileage ? `${detailVehicle.mileage} km` : '-'],
                [t('labelPlateNo'), detailVehicle.plateNo],
                [t('labelVehicleLicense'), detailVehicle.vehicleLicense],
                [t('labelSteering'), detailVehicle.steering === 'Left' ? t('steeringLeft') : t('steeringRight')],
                [t('labelMonolithicCut'), detailVehicle.monolithicCut === 'Monolithic' ? t('monolithic') : t('cut')],
                [t('labelStatus'), detailVehicle.status],
                [t('labelSellingPrice'), detailVehicle.sellingPrice ? formatCurrency(detailVehicle.sellingPrice, detailVehicle.baseCurrency) : '-'],
                [t('labelTotalCost'), detailVehicle.totalCostPKR ? formatCurrency(detailVehicle.totalCostPKR, detailVehicle.baseCurrency) : '-'],
                [t('lockedLabel'), detailVehicle.isLocked ? t('yes') : t('no')],
              ].map(([label, value]) => (
                <Grid item xs={6} sm={4} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value || '-'}</Typography>
                </Grid>
              ))}
            </Grid>
          )}

          {detailTab === 1 && (
            <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('stageHeader')}</TableCell>
                    <TableCell align="right">{t('amountHeader')}</TableCell>
                    <TableCell>{t('currencyHeader')}</TableCell>
                    <TableCell align="right">{t('amountConvertedHeader')}</TableCell>
                    <TableCell>{t('dateHeader')}</TableCell>
                    <TableCell>{t('descriptionHeader')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicleCosts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>{t('noData')}</TableCell></TableRow>
                  ) : vehicleCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell><Chip label={cost.stage} size="small" variant="outlined" /></TableCell>
                      <TableCell align="right">{Number(cost.amount).toLocaleString()}</TableCell>
                      <TableCell>{cost.currency}</TableCell>
                      <TableCell align="right">{Number(cost.amountInPKR).toLocaleString()}</TableCell>
                      <TableCell>{cost.date ? new Date(cost.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{cost.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {detailTab === 2 && (
            detailVehicle?.referencePerson ? (
              <Grid container spacing={2}>
                {[
                  [t('labelFullName'), detailVehicle.referencePerson.fullName],
                  [t('labelTazkiraNumber'), detailVehicle.referencePerson.tazkiraNumber],
                  [t('labelPhoneNumber'), detailVehicle.referencePerson.phoneNumber],
                  [t('labelAddress'), detailVehicle.referencePerson.address],
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
                <Typography variant="body2" mt={1}>{t('noReferenceForVehicle')}</Typography>
              </Box>
            )
          )}

          {detailTab === 3 && (
            sharingPersons.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('personHeader')}</TableCell>
                      <TableCell>{t('basisHeader')}</TableCell>
                      <TableCell align="right">{t('shareHeader')}</TableCell>
                      <TableCell align="right">{t('investmentHeader')}</TableCell>
                      <TableCell>{t('phoneHeader')}</TableCell>
                      <TableCell>{t('statusHeader')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sharingPersons.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell><strong>{p.personName}</strong></TableCell>
                        <TableCell>{p.calculationMethod === 'Investment' ? t('investmentBased') : t('manualPercentage')}</TableCell>
                        <TableCell align="right">{p.percentage}%</TableCell>
                        <TableCell align="right">{p.investmentAmount ? formatCurrency(p.investmentAmount) : '-'}</TableCell>
                        <TableCell>{p.phoneNumber || '-'}</TableCell>
                        <TableCell><Chip label={p.isActive ? t('active') : t('inactive')} size="small" color={p.isActive ? 'success' : 'default'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={4} color="text.secondary">
                <GroupAdd sx={{ fontSize: 48, opacity: 0.3 }} />
                <Typography variant="body2" mt={1}>{t('noSharingForVehicle')}</Typography>
              </Box>
            )
          )}

          {detailTab === 4 && (
            editHistory.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('fieldNameHeader')}</TableCell>
                      <TableCell>{t('oldValueHeader')}</TableCell>
                      <TableCell>{t('newValueHeader')}</TableCell>
                      <TableCell>{t('reasonHeader')}</TableCell>
                      <TableCell>{t('editedAtHeader')}</TableCell>
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
                <Typography variant="body2" mt={1}>{t('noEditHistory')}</Typography>
              </Box>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Add Option Dialog */}
      <Dialog open={addOptionDialog.open} onClose={() => setAddOptionDialog({ open: false, field: '', value: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>
          {t('addOptionDialogTitle', { field: addOptionDialog.field === 'engineType' ? t('labelEngineType') : t(`label${addOptionDialog.field.charAt(0).toUpperCase() + addOptionDialog.field.slice(1)}`) })}
        </DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label={t('newOptionValue')} value={addOptionDialog.value}
            onChange={(e) => setAddOptionDialog({ ...addOptionDialog, value: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddOption(); }}
            sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOptionDialog({ open: false, field: '', value: '' })}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleAddOption} disabled={!addOptionDialog.value.trim()}>{t('add')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}