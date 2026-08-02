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
const { optimizeUploadedImages } = require('../src/services/imageOptimization');
const multer = require('multer');
const fs = require('fs');
const VehicleImage = require('../models/VehicleImage');
const VehicleOption = require('../models/VehicleOption');
const CustomerLedger = require('../models/CustomerLedger');

// Default options (seeded on first fetch if table is empty)
const DEFAULT_OPTIONS = {
  manufacturer: ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet', 'KIA', 'Hyundai', 'Mazda', 'Nissan', 'Suzuki', 'Daihatsu', 'FAW', 'Changan'],
  category: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck', 'Pickup', 'Bus', 'Other'],
  engineType: ['Inline-3', 'Inline-4', 'Inline-5', 'Inline-6', 'V4', 'V6', 'V8', 'V10', 'V12', 'Rotary', 'Turbo'],
  transmission: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'],
};

// ---------- Helper to convert any amount to AFN ----------
async function convertToAFN(amount, currency) {
  if (!amount || amount === 0) return 0;
  if (currency === 'AFN') return Number(amount);
  return await toAFN(amount, currency);
}

function calculateTotalCostOriginal(basePurchasePrice, transportCostToDubai, importCostToAfghanistan, repairCost) {
  return (basePurchasePrice || 0) + (transportCostToDubai || 0) + (importCostToAfghanistan || 0) + (repairCost || 0);
}

async function calculateTotalCostPKR(basePurchasePrice, transportCostToDubai, importCostToAfghanistan, repairCost, baseCurrency) {
  const totalOriginal = calculateTotalCostOriginal(basePurchasePrice, transportCostToDubai, importCostToAfghanistan, repairCost);
  if (baseCurrency === 'AFN') return totalOriginal;
  return await convertToAFN(totalOriginal, baseCurrency);
}

async function deductCustomerInvestment(customerId, investmentAmount, currency, vehicleId) {
  if (!customerId || !investmentAmount || investmentAmount <= 0) return;

  const customer = await Customer.findByPk(customerId);
  if (!customer) throw new Error('Customer not found');

  const balanceField = {
    USD: 'balanceUSD',
    PKR: 'balancePKR',
    AED: 'balanceAED',
  }[currency] || 'balanceAFN';

  const currentBalance = parseFloat(customer[balanceField]) || 0;
  if (currentBalance < investmentAmount) {
    throw new Error(
      `Insufficient ${currency} balance for ${customer.fullName}. ` +
      `Available: ${currentBalance}, Required: ${investmentAmount}`
    );
  }

  const newBalance = currentBalance - investmentAmount;
  await customer.update({ [balanceField]: newBalance });

  await CustomerLedger.create({
    customerId: customer.id,
    type: 'Investment',
    amount: investmentAmount,
    currency,
    amountInPKR: await toAFN(investmentAmount, currency),
    purpose: `Investment in vehicle ${vehicleId}`,
    date: new Date(),
    balance: newBalance,
  });
}

// ---------- Validate partner investment against customer's currency balance ----------
async function validatePartnerInvestment(customerId, investmentAmount, currency) {
  const customer = await Customer.findByPk(customerId);
  if (!customer) throw new Error('Customer not found');
  let balance;
  switch (currency) {
    case 'USD': balance = customer.balanceUSD; break;
    case 'PKR': balance = customer.balancePKR; break;
    case 'AED': balance = customer.balanceAED; break;
    default: balance = customer.balanceAFN;
  }
  if (balance < investmentAmount) {
    throw new Error(`Customer ${customer.fullName} has insufficient ${currency} balance. Available: ${balance}, Required: ${investmentAmount}`);
  }
  return true;
}

// ---------- Helper to create/update sharing persons ----------
async function persistVehicleSharingPersons(vehicle, rawSharingPersons) {
  // Remove previous sharing records
  await SharingPerson.destroy({ where: { vehicleId: vehicle.id } });

  if (!Array.isArray(rawSharingPersons) || rawSharingPersons.length === 0) return [];

  const sharingRows = [];

  for (const raw of rawSharingPersons) {
    // Use the vehicle's base currency for all partners (consistent with front‑end)
    const currency = vehicle.baseCurrency || 'AFN';
    const percentage = parseFloat(raw.percentage) || 0;

    // Calculate investment amount based on the vehicle’s total cost IN ITS BASE CURRENCY
    const totalCostBase = parseFloat(vehicle.totalCostOriginal) || 0;
    const investmentAmount = (percentage / 100) * totalCostBase;

    const customerId = raw.customerId || null;

    // Deduct from customer's balance (in the base currency)
    if (customerId && investmentAmount > 0) {
      const customer = await Customer.findByPk(customerId);
      if (!customer) throw new Error(`Customer with id ${customerId} not found`);

      const balanceField = {
        USD: 'balanceUSD',
        PKR: 'balancePKR',
        AED: 'balanceAED',
      }[currency] || 'balanceAFN';

      const currentBalance = parseFloat(customer[balanceField]) || 0;
      if (currentBalance < investmentAmount) {
        throw new Error(
          `Insufficient ${currency} balance for ${customer.fullName}. ` +
          `Available: ${currentBalance}, Required: ${investmentAmount}`
        );
      }

      // Deduct balance
      const newBalance = currentBalance - investmentAmount;
      await customer.update({ [balanceField]: newBalance });

      // Record in customer ledger (amountInPKR = AFN equivalent)
      const amountAFN = await toAFN(investmentAmount, currency);
      await CustomerLedger.create({
        customerId: customer.id,
        type: 'Investment',
        amount: investmentAmount,
        currency,
        amountInPKR: amountAFN,
        purpose: `Investment in vehicle ${vehicle.vehicleId}`,
        date: new Date(),
        balance: newBalance,
      });
    }

    // Look up customer for name and phone fallback
    let customer = null;
    if (customerId) customer = await Customer.findByPk(customerId);

    sharingRows.push({
      vehicleId: vehicle.id,
      customerId: customerId || null,
      personName: customer ? customer.fullName : raw.personName,
      percentage,
      investmentAmount,
      investmentCurrency: currency,          // always base currency
      phoneNumber: raw.phoneNumber || (customer ? customer.phoneNumber : ''),
      calculationMethod: raw.calculationMethod || 'Percentage',
      isActive: true,
    });
  }

  await SharingPerson.bulkCreate(sharingRows);
  return sharingRows;
}

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
  if (person.customerId) customer = await Customer.findByPk(person.customerId);
  if (!customer && person.phoneNumber) customer = await Customer.findOne({ where: { phoneNumber: person.phoneNumber } });
  if (!customer && person.personName) customer = await Customer.findOne({ where: { fullName: person.personName } });
  if (customer || !person.personName) return customer;
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

async function refreshVehicleSharingPercentages(vehicleId) {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) return;
  const currentSharing = await SharingPerson.findAll({ where: { vehicleId }, order: [['createdAt', 'ASC']] });
  if (!currentSharing.length) return;
  await persistVehicleSharingPersons(vehicle, currentSharing.map(p => p.get({ plain: true })));
}

async function refreshVehicleTotalCost(vehicleId) {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) return 0;
  const costs = await VehicleCost.findAll({ where: { vehicleId, stage: { [Op.notIn]: ['Base Purchase', 'Transport to Dubai', 'Import to Afghanistan', 'Repair'] } } });
  const extraCosts = costs.reduce((sum, c) => sum + Number(c.amountInPKR || 0), 0);
  const baseCost = await calculateTotalCostPKR(vehicle.basePurchasePrice, vehicle.transportCost, vehicle.importCost, vehicle.repairCost, vehicle.baseCurrency);
  const total = baseCost + extraCosts;
  await Vehicle.update({ totalCostPKR: total }, { where: { id: vehicleId } });
  return total;
}

// Get all vehicles – with reference person search
router.get('/', async (req, res) => {
  try {
    const { status, search, category } = req.query;
    
    let where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    
    // Build search condition including reference person fields
    if (search) {
      const escapedSearch = search.replace(/'/g, "\\'");
      
      // Vehicle fields
      const vehicleSearch = {
        [Op.or]: [
          { vehicleId: { [Op.like]: `%${search}%` } },
          { model: { [Op.like]: `%${search}%` } },
          { manufacturer: { [Op.like]: `%${search}%` } },
          { chassisNumber: { [Op.like]: `%${search}%` } }
        ]
      };
      
      // Reference person subquery
      const referenceSearch = Sequelize.where(
        Sequelize.literal(`EXISTS (SELECT 1 FROM reference_persons WHERE reference_persons.vehicleId = Vehicle.id AND (reference_persons.fullName LIKE '%${escapedSearch}%' OR reference_persons.tazkiraNumber LIKE '%${escapedSearch}%' OR reference_persons.phoneNumber LIKE '%${escapedSearch}%'))`),
        '=',
        true
      );
      
      // Sharing person subquery (partner)
      const sharingSearch = Sequelize.where(
        Sequelize.literal(`EXISTS (SELECT 1 FROM sharing_persons WHERE sharing_persons.vehicleId = Vehicle.id AND (sharing_persons.personName LIKE '%${escapedSearch}%' OR sharing_persons.phoneNumber LIKE '%${escapedSearch}%'))`),
        '=',
        true
      );
      
      where[Op.or] = [vehicleSearch, referenceSearch, sharingSearch];
    }
    
    const vehicles = await Vehicle.findAll({
      where,
      include: [
        { model: ReferencePerson, as: 'referencePerson', required: false },
        getSharingInclude()
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Vehicle search error:', error);
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

// ======================== CREATE VEHICLE (MULTI-CURRENCY) ========================
router.post('/', async (req, res) => {
  try {
    const {
      category, manufacturer, model, year, color, chassisNumber,
      engineNumber, engineType, fuelType, transmission, mileage,
      plateNo, vehicleLicense, steering, monolithicCut, status,
      basePurchasePrice, baseCurrency,
      transportCostToDubai, importCostToAfghanistan, repairCost,
      sellingPrice, sellingPriceCurrency,
      referencePerson, sharingPersons
    } = req.body;

    const lastVeh = await Vehicle.findOne({ order: [['id', 'DESC']], attributes: ['vehicleId'] });
    let nextNum = 1;
    if (lastVeh && lastVeh.vehicleId) {
      const vMatch = lastVeh.vehicleId.match(/V(\d+)/);
      if (vMatch) nextNum = parseInt(vMatch[1], 10) + 1;
    }
    const vehicleId = `V${String(nextNum).padStart(6, '0')}`;

    const baseCurr = baseCurrency || 'AFN';
    const totalCostOriginal = calculateTotalCostOriginal(basePurchasePrice, transportCostToDubai, importCostToAfghanistan, repairCost);
    const totalCostPKR = await calculateTotalCostPKR(basePurchasePrice, transportCostToDubai, importCostToAfghanistan, repairCost, baseCurr);

    const vehicle = await Vehicle.create({
      vehicleId,
      category, manufacturer, model, year, color, chassisNumber,
      engineNumber, engineType, fuelType, transmission, mileage,
      plateNo, vehicleLicense, steering, monolithicCut, status,
      basePurchasePrice, baseCurrency: baseCurr,
      transportCostToDubai, importCostToAfghanistan, repairCost,
      sellingPrice, sellingPriceCurrency: sellingPriceCurrency || 'AFN',
      totalCostOriginal, totalCostPKR,
    });

    // Create cost records for showroom ledger (AFN)
    const costsToCreate = [
      { stage: 'Base Purchase', amount: basePurchasePrice, currency: baseCurr, amountInPKR: await convertToAFN(basePurchasePrice, baseCurr) },
      { stage: 'Transport to Dubai', amount: transportCostToDubai, currency: baseCurr, amountInPKR: await convertToAFN(transportCostToDubai, baseCurr) },
      { stage: 'Import to Afghanistan', amount: importCostToAfghanistan, currency: baseCurr, amountInPKR: await convertToAFN(importCostToAfghanistan, baseCurr) },
      { stage: 'Repair', amount: repairCost, currency: baseCurr, amountInPKR: await convertToAFN(repairCost, baseCurr) },
    ].filter(item => item.amount && Number(item.amount) > 0);

    if (!referencePerson || !referencePerson.fullName) {
      for (const cost of costsToCreate) {
        const created = await VehicleCost.create({ vehicleId: vehicle.id, ...cost, date: new Date(), addedBy: req.user.id });
        await ShowroomLedger.create({
          type: 'Vehicle Purchase', amount: created.amount, currency: created.currency, amountInPKR: created.amountInPKR,
          description: `${created.stage} for ${vehicle.vehicleId}`, date: created.date, referenceId: vehicle.id, referenceType: 'Vehicle', addedBy: req.user.id
        });
      }
    }

    // Reference person
    if (referencePerson && referencePerson.fullName) {
      await ReferencePerson.create({
        vehicleId: vehicle.id,
        fullName: referencePerson.fullName,
        tazkiraNumber: referencePerson.tazkiraNumber,
        phoneNumber: referencePerson.phoneNumber,
        address: referencePerson.address,
        secondFullName: referencePerson.secondFullName,
        secondTazkiraNumber: referencePerson.secondTazkiraNumber,
        secondPhoneNumber: referencePerson.secondPhoneNumber,
        secondAddress: referencePerson.secondAddress,
      });
    }
    if (sharingPersons && sharingPersons.length) {
      await persistVehicleSharingPersons(vehicle, sharingPersons);
    }

    const completeVehicle = await Vehicle.findByPk(vehicle.id, {
      include: [{ model: ReferencePerson, as: 'referencePerson' }, getSharingInclude()]
    });
    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');
    const pdfInfo = await generateVehiclePdf(completeVehicle, pdfOutputDir);
    await vehicle.update({ pdfPath: pdfInfo.filePath });
    res.status(201).json({ ...completeVehicle.toJSON(), pdfPath: pdfInfo.filePath });
  } catch (error) {
    console.error('Vehicle create error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => ({
          message: e.message,
          field: e.path,
          value: e.value
        }))
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// ======================== UPDATE VEHICLE (MULTI-CURRENCY) ========================
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.isLocked) return res.status(403).json({ error: 'Vehicle is locked and cannot be edited' });

    const { reason, referencePerson, sharingPersons, editReason: reqEditReason, ...updates } = req.body;
    const editReason = reqEditReason || reason || 'Updated from dashboard';

    const costFields = ['basePurchasePrice', 'transportCostToDubai', 'importCostToAfghanistan', 'repairCost', 'baseCurrency', 'sellingPrice', 'sellingPriceCurrency'];

    if (costFields.some(field => updates[field] !== undefined)) {
      // 1) Always delete old cost ledger entries
      await ShowroomLedger.destroy({
        where: {
          referenceId: vehicle.id,
          referenceType: 'Vehicle',
          type: 'Vehicle Purchase',
          description: {
            [Op.or]: [
              { [Op.like]: '%Base Purchase%' },
              { [Op.like]: '%Transport to Dubai%' },
              { [Op.like]: '%Import to Afghanistan%' },
              { [Op.like]: '%Repair%' }
            ]
          }
        }
      });

      // Delete old core VehicleCost records
      await VehicleCost.destroy({
        where: {
          vehicleId: vehicle.id,
          stage: { [Op.in]: ['Base Purchase', 'Transport to Dubai', 'Import to Afghanistan', 'Repair'] }
        }
      });

      // 2) Calculate new totals
      const baseCurr = updates.baseCurrency ?? vehicle.baseCurrency;
      const basePrice = updates.basePurchasePrice ?? vehicle.basePurchasePrice;
      const transport = updates.transportCostToDubai ?? vehicle.transportCostToDubai;
      const importCost = updates.importCostToAfghanistan ?? vehicle.importCostToAfghanistan;
      const repair = updates.repairCost ?? vehicle.repairCost;
      const totalOriginal = (basePrice || 0) + (transport || 0) + (importCost || 0) + (repair || 0);
      updates.totalCostOriginal = totalOriginal;
      updates.totalCostPKR = await calculateTotalCostPKR(basePrice, transport, importCost, repair, baseCurr);

      // 3) Recreate core cost records
      const costsToCreate = [
        { stage: 'Base Purchase', amount: basePrice, currency: baseCurr, amountInPKR: await convertToAFN(basePrice, baseCurr) },
        { stage: 'Transport to Dubai', amount: transport, currency: baseCurr, amountInPKR: await convertToAFN(transport, baseCurr) },
        { stage: 'Import to Afghanistan', amount: importCost, currency: baseCurr, amountInPKR: await convertToAFN(importCost, baseCurr) },
        { stage: 'Repair', amount: repair, currency: baseCurr, amountInPKR: await convertToAFN(repair, baseCurr) },
      ].filter(item => item.amount && Number(item.amount) > 0);

      // Only create showroom‑ledger entries if NO reference person exists
      const hasRefPerson = !!(referencePerson?.fullName || await ReferencePerson.findOne({ where: { vehicleId: vehicle.id } }));

      for (const cost of costsToCreate) {
        const created = await VehicleCost.create({
          vehicleId: vehicle.id,
          ...cost,
          date: new Date(),
          addedBy: req.user.id
        });

        if (!hasRefPerson) {
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
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4) Save edit history
    // ─────────────────────────────────────────────────────────────
    for (const [key, newValue] of Object.entries(updates)) {
      if (vehicle[key] != newValue) {
        await EditHistory.create({
          entityType: 'Vehicle', entityId: vehicle.id, fieldName: key,
          oldValue: String(vehicle[key]), newValue: String(newValue), reason: editReason,
          editedBy: req.user.id, editedAt: new Date()
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5) Update vehicle
    // ─────────────────────────────────────────────────────────────
    await vehicle.update(updates);

    // ─────────────────────────────────────────────────────────────
    // 6) Update reference person
    // ─────────────────────────────────────────────────────────────
    if (referencePerson !== undefined) {
      await ReferencePerson.destroy({ where: { vehicleId: vehicle.id } });
      if (referencePerson && referencePerson.fullName) {
        await ReferencePerson.create({
          vehicleId: vehicle.id,
          fullName: referencePerson.fullName,
          tazkiraNumber: referencePerson.tazkiraNumber,
          phoneNumber: referencePerson.phoneNumber,
          address: referencePerson.address,
          secondFullName: referencePerson.secondFullName,
          secondTazkiraNumber: referencePerson.secondTazkiraNumber,
          secondPhoneNumber: referencePerson.secondPhoneNumber,
          secondAddress: referencePerson.secondAddress,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 7) Update sharing persons
    // ─────────────────────────────────────────────────────────────
    //Update sharing persons – ALWAYS reverse old investments when cost or sharing changes
    const costChanged = costFields.some(field => updates[field] !== undefined);
    const sharingChanged = sharingPersons !== undefined;

    if (costChanged || sharingChanged) {
      const oldSharing = await SharingPerson.findAll({
        where: { vehicleId: vehicle.id },
        order: [['createdAt', 'ASC']],
      });

      // --- Step 1: reverse all old investments ---
      for (const oldPartner of oldSharing) {
        if (oldPartner.customerId && Number(oldPartner.investmentAmount) > 0) {
          const customer = await Customer.findByPk(oldPartner.customerId);
          if (customer) {
            const currency = oldPartner.investmentCurrency || vehicle.baseCurrency || 'AFN';
            const balanceField = {
              USD: 'balanceUSD', PKR: 'balancePKR', AED: 'balanceAED',
            }[currency] || 'balanceAFN';

            const investAmount = Number(oldPartner.investmentAmount);
            const currentBalance = parseFloat(customer[balanceField]) || 0;
            const newBalance = currentBalance + investAmount;
            await customer.update({ [balanceField]: newBalance });

            // Record reversal in customer ledger
            const amountAFN = await toAFN(investAmount, currency);
            const lastEntry = await CustomerLedger.findOne({
              where: { customerId: customer.id },
              order: [['id', 'DESC']],
            });
            const prevBal = lastEntry ? Number(lastEntry.balance || 0) : 0;
            const newLegacyBal = prevBal + amountAFN;

            await CustomerLedger.create({
              customerId: customer.id,
              type: 'Investment Return',
              amount: investAmount,
              currency,
              amountInPKR: amountAFN,
              purpose: `Reversal of investment in vehicle ${vehicle.vehicleId} (edit)`,
              date: new Date(),
              balance: newLegacyBal,
              saleId: null,
              addedBy: req.user.id,
            });
            await Customer.update({ balance: newLegacyBal }, { where: { id: customer.id } });
          }
        }
      }

      // --- Step 2: apply the new sharing ---
      if (sharingChanged) {
        // If the array is empty, it will delete all existing and create none → correct removal
        await persistVehicleSharingPersons(vehicle, Array.isArray(sharingPersons) ? sharingPersons : []);
      } else {
        // Only costs changed – recalculate with the same partners
        const currentSharing = await SharingPerson.findAll({
          where: { vehicleId: vehicle.id },
          order: [['createdAt', 'ASC']],
        });
        if (currentSharing.length > 0) {
          await persistVehicleSharingPersons(
            vehicle,
            currentSharing.map(p => p.get({ plain: true }))
          );
        }
      }
    }

    const updatedVehicle = await Vehicle.findByPk(vehicle.id, {
      include: [{ model: ReferencePerson, as: 'referencePerson' }, getSharingInclude()]
    });
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Vehicle update error:', error);
    res.status(500).json({ error: error.message });
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

    const optimizedFiles = await optimizeUploadedImages(files, { maxWidth: 1600, quality: 72 });

    // Save each image record to database
    const imageRecords = await Promise.all(optimizedFiles.map(async (file, index) => {
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
