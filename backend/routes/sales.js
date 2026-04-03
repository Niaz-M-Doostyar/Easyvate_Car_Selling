const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Sale = require('../models/Sale');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const SharingPerson = require('../models/SharingPerson');
const CommissionDistribution = require('../models/CommissionDistribution');
const ShowroomLedger = require('../models/ShowroomLedger');
const CustomerLedger = require('../models/CustomerLedger');
const LedgerTransaction = require('../models/LedgerTransaction');
const path = require('path');
const fs = require('fs');
const { generateSaleInvoicePdf } = require('../src/services/pdf');
const { toAFN } = require('../src/services/exchangeRate');
const {
  PARTNER_PROFIT_LEDGER_TYPE,
  buildProfitDistribution,
} = require('../src/services/partnership');

const getVehicleSharingInclude = () => ({
  model: SharingPerson,
  as: 'sharingPersons',
  include: [{ model: Customer, as: 'customer', required: false }],
});

const getCommissionInclude = () => ({
  model: CommissionDistribution,
  as: 'commissions',
  include: [{ model: Customer, as: 'customer', required: false }],
});

const resolveBuyerCustomerId = async ({
  rawCustomerId,
  buyerName,
  buyerFatherName,
  buyerProvince,
  buyerDistrict,
  buyerVillage,
  buyerAddress,
  buyerIdNumber,
  buyerPhone,
}) => {
  let customerId = rawCustomerId;

  if (!customerId && buyerPhone) {
    const existingCustomer = await Customer.findOne({ where: { phoneNumber: buyerPhone } });
    if (existingCustomer) {
      customerId = existingCustomer.id;
    }
  }

  if (!customerId && buyerName) {
    const createdCustomer = await Customer.create({
      fullName: buyerName,
      fatherName: buyerFatherName || '',
      phoneNumber: buyerPhone || `buyer-${Date.now()}`,
      province: buyerProvince || '',
      district: buyerDistrict || '',
      village: buyerVillage || '',
      currentAddress: buyerAddress || '',
      originalAddress: buyerAddress || '',
      nationalIdNumber: buyerIdNumber || String(Date.now()),
      customerType: 'Buyer',
      balance: 0,
    });
    customerId = createdCustomer.id;
  }

  return customerId;
};

const resolveSharingCustomer = async (person) => {
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
    phoneNumber: person.phoneNumber || `partner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    province: '',
    district: '',
    village: '',
    currentAddress: '',
    originalAddress: '',
    nationalIdNumber: `partner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customerType: 'Investor',
    balance: 0,
  });
};

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        getCommissionInclude()
      ],
      order: [['saleDate', 'DESC']]
    });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sale by ID
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        getCommissionInclude()
      ]
    });
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update sale
router.put('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    await sale.update(req.body);
    
    const updatedSale = await Sale.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        getCommissionInclude()
      ]
    });
    
    res.json({ success: true, data: updatedSale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sale
router.post('/', async (req, res) => {
  try {
    const {
      vehicleId, customerId: rawCustomerId, sellingPrice, saleDate, downPayment, remainingAmount, notes,
      saleType,
      // Buyer info (new)
      buyerName, buyerFatherName, buyerProvince, buyerDistrict, buyerVillage,
      buyerAddress, buyerIdNumber, buyerPhone,
      paymentCurrency,
      // Seller info
      sellerName, sellerFatherName, sellerProvince, sellerDistrict, sellerVillage,
      sellerAddress, sellerIdNumber, sellerPhone,
      // Exchange fields
      exchVehicleCategory, exchVehicleManufacturer, exchVehicleModel, exchVehicleYear,
      exchVehicleColor, exchVehicleChassis, exchVehicleEngine, exchVehicleEngineType,
      exchVehicleFuelType, exchVehicleTransmission, exchVehicleMileage,
      exchVehiclePlateNo, exchVehicleLicense, exchVehicleSteering, exchVehicleMonolithicCut,
      priceDifference, priceDifferencePaidBy,
      // Licensed fields
      trafficTransferDate,
      // Common extra
      witnessName1, witnessName2,
      // Bill metadata (دفتر / جلد / صفحه / سریال)
      officeNumber, bookVolume, pageNumber, serialNumber
    } = req.body;
    
    const vehicle = await Vehicle.findByPk(vehicleId, {
      include: [getVehicleSharingInclude()]
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found', message: 'Vehicle not found' });
    }
    
    if (vehicle.status === 'Sold') {
      return res.status(400).json({ error: 'Vehicle already sold', message: 'Vehicle already sold' });
    }

    // ── Resolve/create customer from buyer info ──────────────────────────
    const customerId = await resolveBuyerCustomerId({
      rawCustomerId,
      buyerName,
      buyerFatherName,
      buyerProvince,
      buyerDistrict,
      buyerVillage,
      buyerAddress,
      buyerIdNumber,
      buyerPhone,
    });
    if (!customerId) {
      return res.status(400).json({ error: 'Customer information is required', message: 'Please provide buyer details or select a customer' });
    }

    // ── Currency conversion for selling price ──────────────────────────
    const pCurrency = paymentCurrency || 'AFN';
    const sellingPriceAFN = Math.round(await toAFN(Number(sellingPrice), pCurrency));
    const downPaymentAFN = Math.round(await toAFN(Number(downPayment) || 0, pCurrency));

    // Generate sale ID (use MAX to avoid collision after deletions)
    const lastSale = await Sale.findOne({ order: [['id', 'DESC']], attributes: ['saleId'] });
    let nextSaleNum = 1;
    if (lastSale && lastSale.saleId) {
      const match = lastSale.saleId.match(/S(\d+)/);
      if (match) nextSaleNum = parseInt(match[1], 10) + 1;
    }
    const saleId = `S${String(nextSaleNum).padStart(6, '0')}`;
    
    // Calculate profit (all in AFN)
    const profit = sellingPriceAFN - Number(vehicle.totalCostPKR || 0);
    
    // Calculate commission distribution
    const { distributableProfit, totalSharedAmount, ownerShare, partnerDistributions } = buildProfitDistribution(
      vehicle.sharingPersons || [],
      profit,
      vehicle.totalCostPKR
    );
    const commission = totalSharedAmount;
    
    // Create sale — store amounts in AFN
    const sellingPriceNum = sellingPriceAFN;
    const downPaymentNum = downPaymentAFN;
    const remainingAmountNum = Math.max(sellingPriceNum - downPaymentNum, 0);
    const paymentStatus = remainingAmountNum <= 0 ? 'Paid' : (downPaymentNum > 0 ? 'Partial' : 'Pending');

    const sale = await Sale.create({
      saleId,
      saleType: saleType || 'Container One Key',
      vehicleId,
      customerId,
      paymentCurrency: pCurrency,
      // Buyer info
      buyerName: buyerName || null,
      buyerFatherName: buyerFatherName || null,
      buyerProvince: buyerProvince || null,
      buyerDistrict: buyerDistrict || null,
      buyerVillage: buyerVillage || null,
      buyerAddress: buyerAddress || null,
      buyerIdNumber: buyerIdNumber || null,
      buyerPhone: buyerPhone || null,
      // Seller info
      sellerName: sellerName || null,
      sellerFatherName: sellerFatherName || null,
      sellerProvince: sellerProvince || null,
      sellerDistrict: sellerDistrict || null,
      sellerVillage: sellerVillage || null,
      sellerAddress: sellerAddress || null,
      sellerIdNumber: sellerIdNumber || null,
      sellerPhone: sellerPhone || null,
      // Exchange fields
      exchVehicleCategory: exchVehicleCategory || null,
      exchVehicleManufacturer: exchVehicleManufacturer || null,
      exchVehicleModel: exchVehicleModel || null,
      exchVehicleYear: exchVehicleYear ? Number(exchVehicleYear) : null,
      exchVehicleColor: exchVehicleColor || null,
      exchVehicleChassis: exchVehicleChassis || null,
      exchVehicleEngine: exchVehicleEngine || null,
      exchVehicleEngineType: exchVehicleEngineType || null,
      exchVehicleFuelType: exchVehicleFuelType || null,
      exchVehicleTransmission: exchVehicleTransmission || null,
      exchVehicleMileage: exchVehicleMileage ? Number(exchVehicleMileage) : null,
      exchVehiclePlateNo: exchVehiclePlateNo || null,
      exchVehicleLicense: exchVehicleLicense || null,
      exchVehicleSteering: exchVehicleSteering || 'Left',
      exchVehicleMonolithicCut: exchVehicleMonolithicCut || null,
      priceDifference: saleType === 'Exchange Car' ? (Number(priceDifference) || 0) : 0,
      priceDifferencePaidBy: priceDifferencePaidBy || 'Buyer',
      // Licensed fields
      trafficTransferDate: trafficTransferDate || null,
      // Financial
      sellingPrice: sellingPriceNum,
      totalCost: Number(vehicle.totalCostPKR || 0),
      profit,
      commission,
      ownerShare,
      saleDate,
      paymentMethod: 'Cash',
      downPayment: downPaymentNum,
      remainingAmount: remainingAmountNum,
      paidAmount: downPaymentNum,
      paymentStatus,
      notes: notes || null,
      witnessName1: witnessName1 || null,
      witnessName2: witnessName2 || null,
      officeNumber: officeNumber || null,
      bookVolume: bookVolume || null,
      pageNumber: pageNumber || null,
      serialNumber: serialNumber || null,
      soldBy: req.user.id
    });
    
    // Update vehicle status — mark old car as Sold
    await vehicle.update({
      status: 'Sold',
      isLocked: true
    });

    // ── Exchange Car: add the incoming exchange vehicle to inventory ──
    if (saleType === 'Exchange Car' && (exchVehicleCategory || exchVehicleManufacturer)) {
      // Use MAX to avoid collision after deletions
      const lastVehicle = await Vehicle.findOne({ order: [['id', 'DESC']], attributes: ['vehicleId'] });
      let nextVehNum = 1;
      if (lastVehicle && lastVehicle.vehicleId) {
        const vMatch = lastVehicle.vehicleId.match(/V(\d+)/);
        if (vMatch) nextVehNum = parseInt(vMatch[1], 10) + 1;
      }
      const exchVehicleIdStr = `V${String(nextVehNum).padStart(6, '0')}`;

      const exchangeVehicle = await Vehicle.create({
        vehicleId: exchVehicleIdStr,
        category: exchVehicleCategory || 'Unknown',
        manufacturer: exchVehicleManufacturer || exchVehicleCategory || 'Unknown',
        model: exchVehicleModel || 'Unknown',
        year: exchVehicleYear ? Number(exchVehicleYear) : new Date().getFullYear(),
        color: exchVehicleColor || null,
        chassisNumber: exchVehicleChassis || `EXCH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        engineNumber: exchVehicleEngine || null,
        engineType: exchVehicleEngineType || null,
        fuelType: exchVehicleFuelType || null,
        transmission: exchVehicleTransmission || null,
        mileage: exchVehicleMileage ? Number(exchVehicleMileage) : null,
        plateNo: exchVehiclePlateNo || null,
        vehicleLicense: exchVehicleLicense || null,
        steering: exchVehicleSteering || 'Left',
        monolithicCut: exchVehicleMonolithicCut === 'Cut' ? 'Cut' : 'Monolithic',
        status: 'Available',
        basePurchasePrice: Number(priceDifference) || 0,
        baseCurrency: 'AFN',
        totalCostPKR: Number(priceDifference) || 0,
        sellingPrice: null,
        isLocked: false
      });

      // Link the exchange vehicle back to the sale
      await sale.update({ exchangeVehicleId: exchangeVehicle.id });
    }
    
    // Create ledger transaction for sale (records the SALE event — full price as receivable)
    await LedgerTransaction.create({
      transactionId: `TR${Date.now()}`,
      transactionType: 'Vehicle Sale',
      amount: sellingPriceNum,
      currency: 'AFN',
      amountPKR: await toAFN(sellingPriceNum, 'AFN'),
      relatedEntityType: 'Sale',
      relatedEntityId: sale.id,
      description: `Vehicle ${vehicle.vehicleId} sold to customer`,
      transactionDate: saleDate,
      createdBy: req.user.id
    });

    // Showroom ledger: record only actual cash received (down payment), not full price
    if (downPaymentNum > 0) {
      await ShowroomLedger.create({
        type: 'Vehicle Sale',
        amount: downPaymentNum,
        currency: 'AFN',
        amountInPKR: await toAFN(downPaymentNum, 'AFN'),
        description: `Down payment for ${vehicle.vehicleId} — ${paymentStatus === 'Paid' ? 'Paid in full' : `${downPaymentNum.toLocaleString()} of ${sellingPriceNum.toLocaleString()} AFN`}`,
        date: saleDate,
        referenceId: sale.id,
        referenceType: 'Sale',
        addedBy: req.user.id
      });
    }

    // Customer ledger: compute running balance from last entry
    const lastCustEntry = await CustomerLedger.findOne({
      where: { customerId },
      order: [['id', 'DESC']],
    });
    const prevCustBalance = lastCustEntry ? Number(lastCustEntry.balance || 0) : 0;
    const balanceAfterSale = prevCustBalance - sellingPriceNum; // debit: customer owes full price

    // Customer ledger: Sale entry (debit — customer owes full price)
    await CustomerLedger.create({
      customerId,
      type: 'Sale',
      amount: sellingPriceNum,
      currency: 'AFN',
      amountInPKR: await toAFN(sellingPriceNum, 'AFN'),
      purpose: `Purchase of ${vehicle.vehicleId} — total price`,
      date: saleDate,
      balance: balanceAfterSale,
      saleId: sale.id,
      addedBy: req.user.id
    });

    // If down payment received, also create a "Received" ledger entry
    let finalCustBalance = balanceAfterSale;
    if (downPaymentNum > 0) {
      finalCustBalance = balanceAfterSale + downPaymentNum; // credit: customer paid down payment
      await CustomerLedger.create({
        customerId,
        type: 'Received',
        amount: downPaymentNum,
        currency: 'AFN',
        amountInPKR: await toAFN(downPaymentNum, 'AFN'),
        purpose: `Down payment for ${vehicle.vehicleId}`,
        date: saleDate,
        balance: finalCustBalance,
        saleId: sale.id,
        addedBy: req.user.id
      });
    }

    // Update customer overall balance
    await Customer.update({ balance: finalCustBalance }, { where: { id: customerId } });
    
    // Distribute commission to sharing persons
    if (partnerDistributions.length > 0 && distributableProfit > 0) {
      for (const person of partnerDistributions) {
        const matchedCustomer = await resolveSharingCustomer(person);
        const personName = matchedCustomer?.fullName || person.personName;

        if (person.amount <= 0) {
          continue;
        }
        
        await LedgerTransaction.create({
          transactionId: `TR${Date.now()}_${person.id}`,
          transactionType: 'Commission',
          amount: person.amount,
          currency: 'AFN',
          amountPKR: await toAFN(person.amount, 'AFN'),
          relatedEntityType: 'SaleCommission',
          relatedEntityId: sale.id,
          description: `Partner profit share for ${personName} from sale ${sale.saleId} - ${person.sharePercentage}%`,
          transactionDate: saleDate,
          createdBy: req.user.id
        });

        await CommissionDistribution.create({
          saleId: sale.id,
          sharingPersonId: person.id,
          customerId: matchedCustomer?.id || person.customerId || null,
          personName,
          investmentAmount: person.investmentAmount,
          sharePercentage: person.sharePercentage,
          amount: person.amount,
          paidDate: saleDate,
          calculationMethod: person.calculationMethod,
          status: 'Paid'
        });

        await ShowroomLedger.create({
          type: 'Commission',
          amount: person.amount,
          currency: 'AFN',
          amountInPKR: await toAFN(person.amount, 'AFN'),
          description: `Partner profit share for ${personName} from sale ${sale.saleId}`,
          date: saleDate,
          referenceId: sale.id,
          referenceType: 'CommissionDistribution',
          personName,
          addedBy: req.user.id
        });

        if (matchedCustomer) {
          const lastEntry = await CustomerLedger.findOne({
            where: { customerId: matchedCustomer.id },
            order: [['id', 'DESC']],
          });
          const prevBal = lastEntry ? Number(lastEntry.balance || 0) : 0;
          const newBal = prevBal + person.amount;
          await CustomerLedger.create({
            customerId: matchedCustomer.id,
            type: PARTNER_PROFIT_LEDGER_TYPE,
            amount: person.amount,
            currency: 'AFN',
            amountInPKR: person.amount,
            purpose: `Partner profit from sale ${sale.saleId} (${person.sharePercentage}%)`,
            date: saleDate,
            balance: newBal,
            saleId: sale.id,
            addedBy: req.user.id
          });
          await Customer.update({ balance: newBal }, { where: { id: matchedCustomer.id } });
        }
      }
    }
    
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        getCommissionInclude()
      ]
    });

    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');
    let invoicePath = sale.invoicePath || null;
    try {
      const pdfInfo = await generateSaleInvoicePdf(completeSale, vehicle, completeSale.customer, pdfOutputDir);
      if (pdfInfo && pdfInfo.filePath) {
        await sale.update({ invoicePath: pdfInfo.filePath });
        invoicePath = pdfInfo.filePath;
      }
    } catch (pdfErr) {
      console.error('PDF generation failed for sale id', sale.id, pdfErr && (pdfErr.message || pdfErr));
      // don't block the sale creation — return the sale without invoicePath
    }

    res.status(201).json({ ...completeSale.toJSON(), invoicePath });
  } catch (error) {
    console.error('Sale create error:', error);
    res.status(500).json({ error: error.message, message: error.message });
  }
});

// Delete sale
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    // Unlock vehicle
    const vehicle = await Vehicle.findByPk(sale.vehicleId);
    if (vehicle) {
      await vehicle.update({ status: 'Available', isLocked: false });
    }
    
    // If exchange sale, also delete the exchange vehicle from inventory
    if (sale.exchangeVehicleId) {
      const exchVehicle = await Vehicle.findByPk(sale.exchangeVehicleId);
      if (exchVehicle && exchVehicle.status === 'Available') {
        await exchVehicle.destroy();
      }
    }

    // Delete related records
    await CommissionDistribution.destroy({ where: { saleId: sale.id } });
    await CustomerLedger.destroy({ where: { saleId: sale.id } });
    await LedgerTransaction.destroy({
      where: {
        relatedEntityId: sale.id,
        relatedEntityType: { [Op.in]: ['Sale', 'Installment', 'SaleCommission'] },
      },
    });
    await ShowroomLedger.destroy({
      where: {
        referenceId: sale.id,
        referenceType: { [Op.in]: ['Sale', 'CommissionDistribution'] },
      },
    });
    
    // Delete sale
    await sale.destroy();
    
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/invoice', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const vehicle = await Vehicle.findByPk(sale.vehicleId);
    const customer = await Customer.findByPk(sale.customerId);
    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');

    // If an invoice already exists on disk, serve it immediately.
    if (sale.invoicePath && fs.existsSync(sale.invoicePath)) {
      return res.download(sale.invoicePath, path.basename(sale.invoicePath));
    }

    // Otherwise attempt to (re)generate the invoice. If Puppeteer fails or any
    // error occurs, try to fallback to an existing invoicePath if available,
    // otherwise return a 500 with a friendly message.
    try {
      const pdfInfo = await generateSaleInvoicePdf(sale, vehicle, customer, pdfOutputDir);
      if (pdfInfo && pdfInfo.filePath) {
        await sale.update({ invoicePath: pdfInfo.filePath });
        return res.download(pdfInfo.filePath, pdfInfo.fileName);
      }
      // If generator returned nothing useful, try previous path
      if (sale.invoicePath && fs.existsSync(sale.invoicePath)) {
        return res.download(sale.invoicePath, path.basename(sale.invoicePath));
      }
      return res.status(500).json({ error: 'Failed to generate invoice: generator returned no file' });
    } catch (err) {
      const detail = (err && (err.stack || err.message)) || String(err);
      console.error('Invoice generation failed:', detail);
      if (sale.invoicePath && fs.existsSync(sale.invoicePath)) {
        return res.download(sale.invoicePath, path.basename(sale.invoicePath));
      }
      return res.status(500).json({ error: `Failed to generate invoice: ${err && err.message ? err.message : 'unknown error'}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════ INSTALLMENT / PAYMENT ENDPOINTS ═══════

// Get payment history for a sale
router.get('/:id/payments', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const payments = await CustomerLedger.findAll({
      where: { saleId: sale.id, type: ['Received', 'Installment'] },
      order: [['date', 'ASC']],
    });

    res.json({
      success: true,
      data: payments,
      summary: {
        sellingPrice: Number(sale.sellingPrice),
        downPayment: Number(sale.downPayment),
        paidAmount: Number(sale.paidAmount),
        remainingAmount: Number(sale.remainingAmount),
        paymentStatus: sale.paymentStatus,
        installmentCount: payments.filter(p => p.type === 'Installment').length,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record an installment payment for a sale
router.post('/:id/payments', async (req, res) => {
  try {
    const { amount, currency, date, note } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
      ],
    });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    if (sale.paymentStatus === 'Paid') {
      return res.status(400).json({ error: 'This sale is already fully paid' });
    }

    const paymentAmount = Number(amount);
    const paymentCurrency = currency || 'AFN';
    const remaining = Number(sale.remainingAmount);
    const paymentAmountAFN = await toAFN(paymentAmount, paymentCurrency);

    if (paymentAmountAFN > remaining) {
      return res.status(400).json({ error: `Payment amount exceeds the remaining balance after currency conversion` });
    }

    const newPaid = Number(sale.paidAmount) + paymentAmountAFN;
    const newRemaining = Math.max(remaining - paymentAmountAFN, 0);
    const newStatus = newRemaining <= 0 ? 'Paid' : 'Partial';
    const paymentDate = date || new Date();

    // 1) Update the sale record
    await sale.update({
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      paymentStatus: newStatus,
    });

    // 2) Create customer ledger entry linked to this sale
    const lastEntry = await CustomerLedger.findOne({
      where: { customerId: sale.customerId },
      order: [['id', 'DESC']],
    });
    const prevBalance = lastEntry ? Number(lastEntry.balance || 0) : 0;
    const newBalance = prevBalance + paymentAmountAFN; // credit: customer paid us

    const ledgerEntry = await CustomerLedger.create({
      customerId: sale.customerId,
      type: 'Installment',
      amount: paymentAmount,
      currency: paymentCurrency,
      amountInPKR: paymentAmountAFN,
      purpose: note || `Installment payment for sale ${sale.saleId} — ${sale.vehicle?.vehicleId || ''}`,
      date: paymentDate,
      balance: newBalance,
      saleId: sale.id,
      addedBy: req.user?.id,
    });

    // 3) Update customer overall balance
    await Customer.update({ balance: newBalance }, { where: { id: sale.customerId } });

    // 4) Record actual cash received in showroom ledger
    await ShowroomLedger.create({
      type: 'Vehicle Sale',
      amount: paymentAmount,
      currency: paymentCurrency,
      amountInPKR: paymentAmountAFN,
      description: `Installment from ${sale.buyerName || sale.customer?.fullName || 'Customer'} for ${sale.vehicle?.vehicleId || sale.saleId}${newStatus === 'Paid' ? ' (FULLY PAID)' : ` (${newRemaining.toLocaleString()} AFN remaining)`}`,
      date: paymentDate,
      referenceId: sale.id,
      referenceType: 'Sale',
      personName: sale.buyerName || sale.customer?.fullName,
      addedBy: req.user?.id,
    });

    // 5) Record in general ledger
    await LedgerTransaction.create({
      transactionId: `TR${Date.now()}`,
      transactionType: 'Credit',
      amount: paymentAmount,
      currency: paymentCurrency,
      amountPKR: paymentAmountAFN,
      relatedEntityType: 'Installment',
      relatedEntityId: sale.id,
      description: `Installment payment — ${sale.saleId}`,
      transactionDate: paymentDate,
      createdBy: req.user?.id,
    });

    const updatedSale = await Sale.findByPk(sale.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
      ],
    });

    res.status(201).json({
      success: true,
      message: newStatus === 'Paid'
        ? `Payment of ${paymentAmount.toLocaleString()} ${paymentCurrency} recorded — sale is now FULLY PAID!`
        : `Payment of ${paymentAmount.toLocaleString()} ${paymentCurrency} recorded — ${newRemaining.toLocaleString()} AFN remaining`,
      data: { payment: ledgerEntry, sale: updatedSale },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
