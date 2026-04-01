const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Vehicle = require('../models/Vehicle');
const VehicleCost = require('../models/VehicleCost');
const ReferencePerson = require('../models/ReferencePerson');
const SharingPerson = require('../models/SharingPerson');
const EditHistory = require('../models/EditHistory');
const ShowroomLedger = require('../models/ShowroomLedger');
const path = require('path');
const { generateVehiclePdf } = require('../src/services/pdf');
const { verifyToken } = require('../src/middleware/auth');
const { checkPermission } = require('../src/middleware/permissions');
const { toAFN, saveDailyRates } = require('../src/services/exchangeRate');
const multer = require('multer');
const fs = require('fs');
const VehicleImage = require('../models/VehicleImage');
const VehicleDropdownOption = require('../models/VehicleDropdownOption');
const Customer = require('../models/Customer');

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

const refreshVehicleTotalCost = async (vehicleId) => {
  const costs = await VehicleCost.findAll({ where: { vehicleId } });
  const total = costs.reduce((sum, c) => sum + Number(c.amountInAFN || 0), 0);
  await Vehicle.update({ totalCostAFN: total }, { where: { id: vehicleId } });
  return total;
};

const CORE_COST_STAGES = [
  { stage: 'Base Purchase', field: 'basePurchasePrice' },
  { stage: 'Transport to Dubai', field: 'transportCostToDubai' },
  { stage: 'Import to Afghanistan', field: 'importCostToAfghanistan' },
  { stage: 'Repair', field: 'repairCost' },
];

const getVehicleRawTotal = (vehicleLike) => (
  CORE_COST_STAGES.reduce((sum, item) => sum + Number(vehicleLike?.[item.field] || 0), 0)
);

const getVehicleDerivedRate = (vehicleLike) => {
  const rawTotal = getVehicleRawTotal(vehicleLike);
  const totalCostAFN = Number(vehicleLike?.totalCostAFN || 0);
  if (rawTotal <= 0) {
    return vehicleLike?.baseCurrency === 'AFN' ? 1 : 0;
  }
  return totalCostAFN > 0 ? (totalCostAFN / rawTotal) : 0;
};

const getVehicleSellingPriceAFN = (vehicleLike) => {
  const storedSellingPriceAFN = Number(vehicleLike?.sellingPriceAFN || 0);
  if (storedSellingPriceAFN > 0 || Number(vehicleLike?.sellingPrice || 0) === 0) {
    return storedSellingPriceAFN;
  }

  const derivedRate = getVehicleDerivedRate(vehicleLike);
  if (derivedRate > 0) {
    return Number(vehicleLike?.sellingPrice || 0) * derivedRate;
  }

  return Number(vehicleLike?.sellingPrice || 0);
};

const decorateVehicle = (vehicleLike) => {
  const plainVehicle = vehicleLike?.toJSON ? vehicleLike.toJSON() : vehicleLike;
  return {
    ...plainVehicle,
    sellingPriceAFN: getVehicleSellingPriceAFN(plainVehicle),
  };
};

const buildCoreCosts = async ({
  basePurchasePrice,
  baseCurrency,
  transportCostToDubai,
  importCostToAfghanistan,
  repairCost,
}) => {
  const costInputs = [
    { stage: 'Base Purchase', amount: Number(basePurchasePrice || 0) },
    { stage: 'Transport to Dubai', amount: Number(transportCostToDubai || 0) },
    { stage: 'Import to Afghanistan', amount: Number(importCostToAfghanistan || 0) },
    { stage: 'Repair', amount: Number(repairCost || 0) },
  ];

  const coreCosts = [];
  for (const item of costInputs) {
    const converted = await toAFN(item.amount, baseCurrency);
    coreCosts.push({
      stage: item.stage,
      amount: item.amount,
      currency: baseCurrency,
      amountInAFN: converted.amountAFN,
      exchangeRateUsed: converted.rate,
    });
  }

  return coreCosts;
};

const normalizeSharingPersons = async (sharingPersons = []) => {
  if (!Array.isArray(sharingPersons) || sharingPersons.length === 0) {
    return [];
  }

  const totalPercentage = sharingPersons.reduce((sum, person) => sum + Number(person?.percentage || 0), 0);
  if (totalPercentage > 100) {
    throw new Error('Total sharing percentage cannot exceed 100%');
  }

  const normalized = [];
  for (const person of sharingPersons) {
    if (!person?.customerId) {
      throw new Error('Each sharing person must be selected from customers');
    }

    const customer = await Customer.findByPk(person.customerId);
    if (!customer) {
      throw new Error(`Customer ${person.customerId} not found`);
    }

    normalized.push({
      customerId: customer.id,
      personName: customer.fullName,
      phoneNumber: customer.phoneNumber || null,
      percentage: Number(person.percentage || 0),
      investmentAmount: Number(person.investmentAmount || 0),
      isActive: true,
    });
  }

  return normalized;
};

const syncVehicleCoreCosts = async ({ vehicle, coreCosts, userId }) => {
  const existingCoreCosts = await VehicleCost.findAll({
    where: {
      vehicleId: vehicle.id,
      stage: { [Op.in]: CORE_COST_STAGES.map((item) => item.stage) },
    },
  });
  const existingCostsByStage = new Map(existingCoreCosts.map((cost) => [cost.stage, cost]));

  for (const cost of coreCosts) {
    const existingCost = existingCostsByStage.get(cost.stage);
    if (Number(cost.amount || 0) > 0) {
      if (existingCost) {
        await existingCost.update({
          amount: cost.amount,
          currency: cost.currency,
          amountInAFN: cost.amountInAFN,
          exchangeRateUsed: cost.exchangeRateUsed,
          date: new Date(),
          addedBy: userId,
        });
      } else {
        await VehicleCost.create({
          vehicleId: vehicle.id,
          ...cost,
          date: new Date(),
          addedBy: userId,
        });
      }
    } else if (existingCost) {
      await existingCost.destroy();
    }
  }

  await ShowroomLedger.destroy({
    where: {
      referenceId: vehicle.id,
      referenceType: 'Vehicle',
      description: { [Op.in]: CORE_COST_STAGES.map(({ stage }) => `${stage} for ${vehicle.vehicleId}`) },
    },
  });

  for (const cost of coreCosts.filter((item) => Number(item.amount || 0) > 0)) {
    await ShowroomLedger.create({
      type: 'Vehicle Purchase',
      amount: cost.amount,
      currency: cost.currency,
      amountInAFN: cost.amountInAFN,
      exchangeRateUsed: cost.exchangeRateUsed,
      description: `${cost.stage} for ${vehicle.vehicleId}`,
      date: new Date(),
      referenceId: vehicle.id,
      referenceType: 'Vehicle',
      addedBy: userId,
    });
  }

  return refreshVehicleTotalCost(vehicle.id);
};

const getAdditionalCostsAFN = async (vehicleId) => {
  const additionalCosts = await VehicleCost.findAll({
    where: {
      vehicleId,
      stage: { [Op.notIn]: CORE_COST_STAGES.map((item) => item.stage) },
    },
  });

  return additionalCosts.reduce((sum, item) => sum + Number(item.amountInAFN || 0), 0);
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
        { model: SharingPerson, as: 'sharingPersons', include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, data: vehicles.map(decorateVehicle) });
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
        { model: SharingPerson, as: 'sharingPersons', include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'] }] },
        { model: VehicleImage, as: 'images', order: [['order', 'ASC']] }
      ]
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(decorateVehicle(vehicle));
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

    await saveDailyRates(req.user?.id);

    const normalizedSharingPersons = await normalizeSharingPersons(sharingPersons);
    const coreCosts = await buildCoreCosts({
      basePurchasePrice,
      baseCurrency,
      transportCostToDubai,
      importCostToAfghanistan,
      repairCost,
    });
    const totalCostAFN = coreCosts.reduce((sum, item) => sum + Number(item.amountInAFN || 0), 0);
    const sellingPriceAFN = (status || 'Available') === 'Available'
      ? (await toAFN(sellingPrice, baseCurrency)).amountAFN
      : 0;

    // Business rule: available vehicles cannot be listed below total cost
    const sellingPriceNum = Number(sellingPrice) || 0;
    if ((status || 'Available') === 'Available') {
      if (sellingPriceAFN < totalCostAFN) {
        return res.status(400).json({ error: 'Selling price cannot be less than total cost for available vehicles' });
      }
    }

    // Create vehicle
    const vehicle = await Vehicle.create({
      vehicleId,
      category, manufacturer, model, year, color, chassisNumber,
      engineNumber, engineType, fuelType, transmission, mileage,
      plateNo, vehicleLicense, steering, monolithicCut, status,
      basePurchasePrice, baseCurrency, transportCostToDubai,
      importCostToAfghanistan, repairCost, totalCostAFN,
      sellingPrice: (status || 'Available') === 'Available' ? sellingPriceNum : 0,
      sellingPriceAFN,
    });

    await syncVehicleCoreCosts({ vehicle, coreCosts, userId: req.user.id });
    
    // Add reference person if provided
    if (referencePerson) {
      await ReferencePerson.create({
        vehicleId: vehicle.id,
        ...referencePerson
      });
    }
    
    // Add sharing persons if provided
    if (normalizedSharingPersons.length > 0) {
      await Promise.all(
        normalizedSharingPersons.map(person =>
          SharingPerson.create({
            vehicleId: vehicle.id,
            ...person
          })
        )
      );
    }
    
    // Fetch complete vehicle with relations
    const completeVehicle = await Vehicle.findByPk(vehicle.id, {
      include: [
        { model: ReferencePerson, as: 'referencePerson' },
        { model: SharingPerson, as: 'sharingPersons', include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'] }] }
      ]
    });

    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');
    const pdfInfo = await generateVehiclePdf(completeVehicle, pdfOutputDir);
    await vehicle.update({ pdfPath: pdfInfo.filePath });
    
    res.status(201).json({ ...decorateVehicle(completeVehicle), pdfPath: pdfInfo.filePath });
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

    await saveDailyRates(req.user?.id);

    const effectiveStatus = updates.status ?? vehicle.status;
    const effectiveBaseCurrency = updates.baseCurrency ?? vehicle.baseCurrency ?? 'AFN';
    const effectiveBase = Number(updates.basePurchasePrice ?? vehicle.basePurchasePrice ?? 0);
    const effectiveTransport = Number(updates.transportCostToDubai ?? vehicle.transportCostToDubai ?? 0);
    const effectiveImport = Number(updates.importCostToAfghanistan ?? vehicle.importCostToAfghanistan ?? 0);
    const effectiveRepair = Number(updates.repairCost ?? vehicle.repairCost ?? 0);
    const effectiveSelling = Number(updates.sellingPrice ?? vehicle.sellingPrice ?? 0);
    const effectiveTotal = effectiveBase + effectiveTransport + effectiveImport + effectiveRepair;
    const coreCosts = await buildCoreCosts({
      basePurchasePrice: effectiveBase,
      baseCurrency: effectiveBaseCurrency,
      transportCostToDubai: effectiveTransport,
      importCostToAfghanistan: effectiveImport,
      repairCost: effectiveRepair,
    });
    const additionalCostsAFN = await getAdditionalCostsAFN(vehicle.id);
    const recalculatedTotalCostAFN = coreCosts.reduce((sum, item) => sum + Number(item.amountInAFN || 0), 0) + additionalCostsAFN;
    const sellingPriceAFN = effectiveStatus === 'Available'
      ? (await toAFN(effectiveSelling, effectiveBaseCurrency)).amountAFN
      : 0;
    const normalizedSharingPersons = sharingPersons !== undefined ? await normalizeSharingPersons(sharingPersons) : null;

    if (effectiveStatus === 'Available' && (effectiveSelling < effectiveTotal || sellingPriceAFN < recalculatedTotalCostAFN)) {
      return res.status(400).json({ error: 'Selling price cannot be less than total cost for available vehicles' });
    }

    if (effectiveStatus !== 'Available') {
      updates.sellingPrice = 0;
    }

    updates.baseCurrency = effectiveBaseCurrency;
    updates.totalCostAFN = recalculatedTotalCostAFN;
    updates.sellingPriceAFN = sellingPriceAFN;
    
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
    const syncedTotalCostAFN = await syncVehicleCoreCosts({ vehicle, coreCosts, userId: req.user.id });
    await vehicle.update({
      totalCostAFN: syncedTotalCostAFN,
      sellingPriceAFN: effectiveStatus === 'Available' ? sellingPriceAFN : 0,
    });
    
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
      await SharingPerson.destroy({ where: { vehicleId: vehicle.id } });
      if (normalizedSharingPersons && normalizedSharingPersons.length > 0) {
        await Promise.all(
          normalizedSharingPersons.map(person =>
            SharingPerson.create({
              vehicleId: vehicle.id,
              ...person
            })
          )
        );
      }
    }
    
    const updatedVehicle = await Vehicle.findByPk(vehicle.id, {
      include: [
        { model: ReferencePerson, as: 'referencePerson' },
        { model: SharingPerson, as: 'sharingPersons', include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'] }] }
      ]
    });
    
    res.json(decorateVehicle(updatedVehicle));
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

    const converted = await toAFN(amount, currency);
    
    // Save daily rates
    await saveDailyRates(req.user?.id);

    const cost = await VehicleCost.create({
      vehicleId: req.params.id,
      stage,
      amount,
      currency,
      amountInAFN: converted.amountAFN,
      exchangeRateUsed: converted.rate,
      description,
      date: date ? new Date(date) : new Date(),
      addedBy: req.user.id
    });

    await ShowroomLedger.create({
      type: 'Vehicle Purchase',
      amount: cost.amount,
      currency: cost.currency,
      amountInAFN: cost.amountInAFN,
      exchangeRateUsed: cost.exchangeRateUsed,
      description: `${cost.stage} for Vehicle ${req.params.id}`,
      date: cost.date,
      referenceId: req.params.id,
      referenceType: 'Vehicle',
      addedBy: req.user.id
    });

    const totalCostAFN = await refreshVehicleTotalCost(req.params.id);

    res.status(201).json({ cost, totalCostAFN });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/sharing', async (req, res) => {
  try {
    const sharing = await SharingPerson.findAll({
      where: { vehicleId: req.params.id },
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json({ data: sharing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/sharing', async (req, res) => {
  try {
    const { customerId, percentage, investmentAmount } = req.body;
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(400).json({ error: 'A valid customer is required for sharing' });
    }
    const sharing = await SharingPerson.create({
      vehicleId: req.params.id,
      customerId,
      personName: customer.fullName,
      percentage,
      investmentAmount,
      phoneNumber: customer.phoneNumber || null,
      isActive: true
    });
    res.status(201).json(sharing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: ReferencePerson, as: 'referencePerson' },
        { model: SharingPerson, as: 'sharingPersons', include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'] }] }
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

// ==================== DROPDOWN OPTIONS ROUTES ====================

// Get dropdown options for a specific field
router.get('/dropdown-options/:fieldName', async (req, res) => {
  try {
    const { fieldName } = req.params;
    const validFields = ['manufacturer', 'category', 'engineType', 'transmission'];
    if (!validFields.includes(fieldName)) {
      return res.status(400).json({ error: 'Invalid field name' });
    }
    
    const options = await VehicleDropdownOption.findAll({
      where: { fieldName, isActive: true },
      order: [['value', 'ASC']],
      attributes: ['id', 'value']
    });
    
    res.json({ data: options.map(o => o.value) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new dropdown option
router.post('/dropdown-options', async (req, res) => {
  try {
    const { fieldName, value } = req.body;
    
    if (!fieldName || !value) {
      return res.status(400).json({ error: 'fieldName and value are required' });
    }
    
    const option = await VehicleDropdownOption.create({
      fieldName,
      value: value.trim(),
      isActive: true,
      addedBy: req.user?.id
    });
    
    res.status(201).json(option);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'This option already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a dropdown option
router.delete('/dropdown-options/:id', async (req, res) => {
  try {
    const option = await VehicleDropdownOption.findByPk(req.params.id);
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }
    await option.update({ isActive: false });
    res.json({ message: 'Option removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
