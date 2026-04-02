const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Vehicle = require('../models/Vehicle');
const VehicleCost = require('../models/VehicleCost');
const ReferencePerson = require('../models/ReferencePerson');
const SharingPerson = require('../models/SharingPerson');
const EditHistory = require('../models/EditHistory');
const ShowroomLedger = require('../models/ShowroomLedger');
const Customer = require('../models/Customer');
const path = require('path');
const { generateVehiclePdf } = require('../src/services/pdf');
const { verifyToken } = require('../src/middleware/auth');
const { checkPermission } = require('../src/middleware/permissions');
const { toAFN } = require('../src/services/exchangeRate');
const { normalizeSharingPersons } = require('../src/services/partnership');
const multer = require('multer');
const fs = require('fs');
const VehicleImage = require('../models/VehicleImage');
const VehicleOption = require('../models/VehicleOption');

// Default options (seeded on first fetch if table is empty)
const DEFAULT_OPTIONS = {
  manufacturer: ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet', 'KIA', 'Hyundai', 'Mazda', 'Nissan', 'Suzuki', 'Daihatsu', 'FAW', 'Changan'],
  category: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck', 'Pickup', 'Bus', 'Other'],
  engineType: ['Inline-3', 'Inline-4', 'Inline-5', 'Inline-6', 'V4', 'V6', 'V8', 'V10', 'V12', 'Rotary', 'Turbo'],
  transmission: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'],
};

// GET dropdown options (seeds defaults on first call)
router.get('/dropdown-options', async (req, res) => {
  try {
    let options = await VehicleOption.findAll({ order: [['field', 'ASC'], ['value', 'ASC']] });
    if (options.length === 0) {
      const rows = [];
      for (const [field, values] of Object.entries(DEFAULT_OPTIONS)) {
        for (const value of values) rows.push({ field, value });
      }
      await VehicleOption.bulkCreate(rows, { ignoreDuplicates: true });
      options = await VehicleOption.findAll({ order: [['field', 'ASC'], ['value', 'ASC']] });
    }
    const grouped = {};
    options.forEach(o => {
      if (!grouped[o.field]) grouped[o.field] = [];
      grouped[o.field].push(o.value);
    });
    res.json({ data: grouped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add a new dropdown option
router.post('/dropdown-options', async (req, res) => {
  try {
    const { field, value } = req.body;
    if (!field || !value) return res.status(400).json({ error: 'Field and value are required' });
    const allowed = ['manufacturer', 'category', 'engineType', 'transmission'];
    if (!allowed.includes(field)) return res.status(400).json({ error: 'Invalid field' });
    const [option, created] = await VehicleOption.findOrCreate({ where: { field, value: value.trim() }, defaults: { field, value: value.trim() } });
    if (!created) return res.status(409).json({ error: 'Option already exists' });
    res.status(201).json({ data: option });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const uploadDir = path.join(__dirname, '..', 'uploads', 'vehicle-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `vehicle-${req.params.id}-${uniqueSuffix}${ext}`);
  }
});

// File filter – only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Multer upload instance with 500KB limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 }, // 500KB
  fileFilter: fileFilter
});

const CORE_COST_STAGES = ['Base Purchase', 'Transport to Dubai', 'Import to Afghanistan', 'Repair'];

const getSharingInclude = () => ({
  model: SharingPerson,
  as: 'sharingPersons',
  include: [{ model: Customer, as: 'customer', required: false }],
});

const buildPartnerToken = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const calculateVehicleBaseCost = async ({
  basePurchasePrice,
  baseCurrency,
  transportCostToDubai,
  importCostToAfghanistan,
  repairCost,
}) => {
  const basePriceAFN = await toAFN(Number(basePurchasePrice) || 0, baseCurrency || 'AFN');
  const transportAFN = await toAFN(Number(transportCostToDubai) || 0, 'AFN');
  const importAFN = await toAFN(Number(importCostToAfghanistan) || 0, 'AFN');
  const repairAFN = await toAFN(Number(repairCost) || 0, 'AFN');

  return basePriceAFN + transportAFN + importAFN + repairAFN;
};

const resolvePartnerCustomer = async (person) => {
  let customer = null;

  if (person.customerId) {
    customer = await Customer.findByPk(person.customerId);
  }

  if (!customer && person.phoneNumber) {
    customer = await Customer.findOne({ where: { phoneNumber: person.phoneNumber } });
  }

  if (!customer && person.personName) {
    customer = await Customer.findOne({ where: { fullName: person.personName } });
  }

  if (customer || !person.personName) {
    return customer;
  }

  return Customer.create({
    fullName: person.personName,
    fatherName: '',
    phoneNumber: person.phoneNumber || buildPartnerToken('partner-phone'),
    province: '',
    district: '',
    village: '',
    currentAddress: '',
    originalAddress: '',
    nationalIdNumber: buildPartnerToken('partner-id'),
    customerType: 'Investor',
    balance: 0,
  });
};

const persistVehicleSharingPersons = async (vehicle, rawSharingPersons) => {
  const normalized = normalizeSharingPersons(rawSharingPersons, vehicle.totalCostPKR);

  await SharingPerson.destroy({ where: { vehicleId: vehicle.id } });

  if (!normalized.partners.length) {
    return normalized;
  }

  const sharingRows = [];
  for (const partner of normalized.partners) {
    const customer = await resolvePartnerCustomer(partner);
    sharingRows.push({
      vehicleId: vehicle.id,
      customerId: customer?.id || partner.customerId || null,
      personName: customer?.fullName || partner.personName,
      percentage: partner.percentage,
      investmentAmount: partner.investmentAmount,
      phoneNumber: customer?.phoneNumber || partner.phoneNumber || '',
      calculationMethod: partner.calculationMethod,
      isActive: true,
    });
  }

  await SharingPerson.bulkCreate(sharingRows);
  return normalized;
};

const refreshVehicleSharingPercentages = async (vehicleId) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    return;
  }

  const currentSharing = await SharingPerson.findAll({
    where: { vehicleId },
    order: [['createdAt', 'ASC']],
  });

  if (!currentSharing.length) {
    return;
  }

  await persistVehicleSharingPersons(
    vehicle,
    currentSharing.map((person) => person.get({ plain: true }))
  );
};

const refreshVehicleTotalCost = async (vehicleId) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    return 0;
  }

  const costs = await VehicleCost.findAll({
    where: {
      vehicleId,
      stage: { [Op.notIn]: CORE_COST_STAGES },
    },
  });
  const extraCosts = costs.reduce((sum, c) => sum + Number(c.amountInPKR || 0), 0);
  const baseCost = await calculateVehicleBaseCost(vehicle);
  const total = baseCost + extraCosts;
  await Vehicle.update({ totalCostPKR: total }, { where: { id: vehicleId } });
  return total;
};

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const { status, search, category } = req.query;
    
    let where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where[Op.or] = [
        { vehicleId: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { manufacturer: { [Op.like]: `%${search}%` } },
        { chassisNumber: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const vehicles = await Vehicle.findAll({
      where,
      include: [
        { model: ReferencePerson, as: 'referencePerson' },
        getSharingInclude()
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: ReferencePerson, as: 'referencePerson' },
        getSharingInclude(),
        { model: VehicleImage, as: 'images', order: [['order', 'ASC']] }
      ]
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create vehicle
router.post('/', async (req, res) => {
  try {
    const {
      category, manufacturer, model, year, color, chassisNumber,
      engineNumber, engineType, fuelType, transmission, mileage,
      plateNo, vehicleLicense, steering, monolithicCut, status,
      basePurchasePrice, baseCurrency, transportCostToDubai,
      importCostToAfghanistan, repairCost, sellingPrice,
      referencePerson, sharingPersons
    } = req.body;
    
    // Generate unique vehicle ID (use MAX to avoid collision after deletions)
    const lastVeh = await Vehicle.findOne({ order: [['id', 'DESC']], attributes: ['vehicleId'] });
    let nextNum = 1;
    if (lastVeh && lastVeh.vehicleId) {
      const vMatch = lastVeh.vehicleId.match(/V(\d+)/);
      if (vMatch) nextNum = parseInt(vMatch[1], 10) + 1;
    }
    const vehicleId = `V${String(nextNum).padStart(6, '0')}`;
    
    const basePriceAFN = await toAFN(basePurchasePrice, baseCurrency);
    const transportAFN = await toAFN(transportCostToDubai, 'AFN');
    const importAFN = await toAFN(importCostToAfghanistan, 'AFN');
    const repairAFN = await toAFN(repairCost, 'AFN');
    const totalCostPKR = basePriceAFN + transportAFN + importAFN + repairAFN;
    
    // Create vehicle
    const vehicle = await Vehicle.create({
      vehicleId,
      category, manufacturer, model, year, color, chassisNumber,
      engineNumber, engineType, fuelType, transmission, mileage,
      plateNo, vehicleLicense, steering, monolithicCut, status,
      basePurchasePrice, baseCurrency, transportCostToDubai,
      importCostToAfghanistan, repairCost, totalCostPKR, sellingPrice
    });

    const costsToCreate = [
      { stage: 'Base Purchase', amount: basePurchasePrice, currency: baseCurrency, amountInPKR: basePriceAFN },
      { stage: 'Transport to Dubai', amount: transportCostToDubai, currency: 'AFN', amountInPKR: transportAFN },
      { stage: 'Import to Afghanistan', amount: importCostToAfghanistan, currency: 'AFN', amountInPKR: importAFN },
      { stage: 'Repair', amount: repairCost, currency: 'AFN', amountInPKR: repairAFN }
    ].filter(item => Number(item.amount || 0) > 0);

    if (costsToCreate.length) {
      await Promise.all(costsToCreate.map(async (cost) => {
        const created = await VehicleCost.create({
        vehicleId: vehicle.id,
        ...cost,
        date: new Date(),
        addedBy: req.user.id
        });

        await ShowroomLedger.create({
          type: 'Vehicle Purchase',
          amount: created.amount,
          currency: created.currency,
          amountInPKR: created.amountInPKR,
          description: `${created.stage} for ${vehicle.vehicleId}`,
          date: created.date,
          referenceId: vehicle.id,
          referenceType: 'Vehicle',
          addedBy: req.user.id
        });
      }));
    }
    
    // Add reference person if provided
    if (referencePerson) {
      await ReferencePerson.create({
        vehicleId: vehicle.id,
        ...referencePerson
      });
    }
    
    // Add sharing persons if provided
    if (sharingPersons && sharingPersons.length > 0) {
      await persistVehicleSharingPersons(vehicle, sharingPersons);
    }
    
    // Fetch complete vehicle with relations
    const completeVehicle = await Vehicle.findByPk(vehicle.id, {
      include: [
        { model: ReferencePerson, as: 'referencePerson' },
        getSharingInclude()
      ]
    });

    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');
    const pdfInfo = await generateVehiclePdf(completeVehicle, pdfOutputDir);
    await vehicle.update({ pdfPath: pdfInfo.filePath });
    
    res.status(201).json({ ...completeVehicle.toJSON(), pdfPath: pdfInfo.filePath });
  } catch (error) {
    console.error('Vehicle create error:', error);
    res.status(500).json({ error: error.message, message: error.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    if (vehicle.isLocked) {
      return res.status(403).json({ error: 'Vehicle is locked and cannot be edited' });
    }
    
    const { reason, referencePerson, sharingPersons, editReason: reqEditReason, ...updates } = req.body;
    const editReason = reqEditReason || reason || 'Updated from dashboard';
    const costFields = ['basePurchasePrice', 'baseCurrency', 'transportCostToDubai', 'importCostToAfghanistan', 'repairCost'];
    const mergedCostData = {
      basePurchasePrice: updates.basePurchasePrice ?? vehicle.basePurchasePrice,
      baseCurrency: updates.baseCurrency ?? vehicle.baseCurrency,
      transportCostToDubai: updates.transportCostToDubai ?? vehicle.transportCostToDubai,
      importCostToAfghanistan: updates.importCostToAfghanistan ?? vehicle.importCostToAfghanistan,
      repairCost: updates.repairCost ?? vehicle.repairCost,
    };

    if (costFields.some((field) => updates[field] !== undefined)) {
      const extraCosts = await VehicleCost.findAll({
        where: {
          vehicleId: vehicle.id,
          stage: { [Op.notIn]: CORE_COST_STAGES },
        },
      });
      const extraTotal = extraCosts.reduce((sum, cost) => sum + Number(cost.amountInPKR || 0), 0);
      updates.totalCostPKR = (await calculateVehicleBaseCost(mergedCostData)) + extraTotal;
    }
    
    // Save edit history for each changed field
    for (const [key, newValue] of Object.entries(updates)) {
      if (vehicle[key] !== newValue) {
        await EditHistory.create({
          entityType: 'Vehicle',
          entityId: vehicle.id,
          fieldName: key,
          oldValue: String(vehicle[key]),
          newValue: String(newValue),
          reason: editReason,
          editedBy: req.user.id,
          editedAt: new Date()
        });
      }
    }
    
    // Update vehicle
    await vehicle.update(updates);
    
    // Update reference person
    if (referencePerson) {
      await ReferencePerson.destroy({ where: { vehicleId: vehicle.id } });
      if (referencePerson.fullName) {
        await ReferencePerson.create({
          vehicleId: vehicle.id,
          ...referencePerson
        });
      }
    }
    
    // Update sharing persons
    if (sharingPersons) {
      await persistVehicleSharingPersons(vehicle, sharingPersons);
    } else if (costFields.some((field) => updates[field] !== undefined)) {
      await refreshVehicleSharingPercentages(vehicle.id);
    }
    
    const updatedVehicle = await Vehicle.findByPk(vehicle.id, {
      include: [
        { model: ReferencePerson, as: 'referencePerson' },
        getSharingInclude()
      ]
    });
    
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Vehicle update error:', error);
    res.status(500).json({ error: error.message, message: error.message });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    if (vehicle.isLocked) {
      return res.status(403).json({ error: 'Vehicle is locked and cannot be deleted' });
    }
    
    // Delete associated records
    await VehicleCost.destroy({ where: { vehicleId: vehicle.id } });
    await ReferencePerson.destroy({ where: { vehicleId: vehicle.id } });
    await SharingPerson.destroy({ where: { vehicleId: vehicle.id } });
    await EditHistory.destroy({ where: { entityType: 'Vehicle', entityId: vehicle.id } });
    
    // Delete vehicle
    await vehicle.destroy();
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/costs', async (req, res) => {
  try {
    const costs = await VehicleCost.findAll({
      where: { vehicleId: req.params.id },
      order: [['date', 'ASC']]
    });
    res.json({ data: costs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/costs', async (req, res) => {
  try {
    const { stage, amount, currency, description, date } = req.body;

    const cost = await VehicleCost.create({
      vehicleId: req.params.id,
      stage,
      amount,
      currency,
      amountInPKR: await toAFN(amount, currency),
      description,
      date: date ? new Date(date) : new Date(),
      addedBy: req.user.id
    });

    await ShowroomLedger.create({
      type: 'Vehicle Purchase',
      amount: cost.amount,
      currency: cost.currency,
      amountInPKR: cost.amountInPKR,
      description: `${cost.stage} for Vehicle ${req.params.id}`,
      date: cost.date,
      referenceId: req.params.id,
      referenceType: 'Vehicle',
      addedBy: req.user.id
    });

    const totalCostPKR = await refreshVehicleTotalCost(req.params.id);
    await refreshVehicleSharingPercentages(req.params.id);

    res.status(201).json({ cost, totalCostPKR });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/sharing', async (req, res) => {
  try {
    const sharing = await SharingPerson.findAll({
      where: { vehicleId: req.params.id },
      include: [{ model: Customer, as: 'customer', required: false }],
      order: [['createdAt', 'ASC']]
    });
    res.json({ data: sharing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/sharing', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.isLocked) {
      return res.status(403).json({ error: 'Vehicle is locked and cannot be updated' });
    }

    const existingSharing = await SharingPerson.findAll({
      where: { vehicleId: req.params.id },
      order: [['createdAt', 'ASC']],
    });

    await persistVehicleSharingPersons(
      vehicle,
      [...existingSharing.map((person) => person.get({ plain: true })), req.body]
    );

    const sharing = await SharingPerson.findAll({
      where: { vehicleId: req.params.id },
      include: [{ model: Customer, as: 'customer', required: false }],
      order: [['createdAt', 'ASC']],
    });

    res.status(201).json({ data: sharing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: ReferencePerson, as: 'referencePerson' },
        getSharingInclude()
      ]
    });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');
    const pdfInfo = await generateVehiclePdf(vehicle, pdfOutputDir);
    await vehicle.update({ pdfPath: pdfInfo.filePath });

    res.download(pdfInfo.filePath, pdfInfo.fileName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get edit history
router.get('/:id/history', async (req, res) => {
  try {
    const history = await EditHistory.findAll({
      where: {
        entityType: 'Vehicle',
        entityId: req.params.id
      },
      order: [['editedAt', 'DESC']]
    });
    
    res.json({ data: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== IMAGE ROUTES ====================

// Upload one or more images for a specific vehicle
router.post('/:id/images', (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 500KB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Save each image record to database
    const imageRecords = await Promise.all(files.map(async (file, index) => {
      // Public URL path (adjust if your static serving is different)
      const imageUrl = `/uploads/vehicle-images/${file.filename}`;
      return VehicleImage.create({
        vehicleId: vehicle.id,
        filename: file.originalname,
        path: imageUrl,
        size: file.size,
        order: index // preserve order from upload
      });
    }));

    res.status(201).json({
      message: `${imageRecords.length} image(s) uploaded successfully`,
      images: imageRecords
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all images for a vehicle
router.get('/:id/images', async (req, res) => {
  try {
    const images = await VehicleImage.findAll({
      where: { vehicleId: req.params.id },
      order: [['order', 'ASC'], ['createdAt', 'ASC']]
    });
    res.json({ data: images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific image
router.delete('/images/:imageId', async (req, res) => {
  try {
    const image = await VehicleImage.findByPk(req.params.imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', 'uploads', 'vehicle-images', path.basename(image.path));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.destroy();
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
