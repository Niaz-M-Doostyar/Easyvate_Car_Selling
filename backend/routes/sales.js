const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const SharingPerson = require('../models/SharingPerson');
const CommissionDistribution = require('../models/CommissionDistribution');
const ShowroomLedger = require('../models/ShowroomLedger');
const CustomerLedger = require('../models/CustomerLedger');
const LedgerTransaction = require('../models/LedgerTransaction');
const path = require('path');
const { generateSaleInvoicePdf } = require('../src/services/pdf');
const { toAFN, saveDailyRates } = require('../src/services/exchangeRate');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        { model: CommissionDistribution, as: 'commissions' }
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
        { model: CommissionDistribution, as: 'commissions' }
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
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
      ],
    });
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const immutableFields = [
      'vehicleId', 'customerId', 'saleType', 'sellingCurrency', 'sellingPrice', 'sellingPriceAFN',
      'downPayment', 'remainingAmount', 'paidAmount', 'paymentStatus', 'totalCost', 'profit',
      'commission', 'ownerShare', 'exchangeRateUsed', 'saleDate', 'exchangeVehicleId',
    ];

    const attemptedImmutableField = immutableFields.find((field) => req.body[field] !== undefined && req.body[field] !== sale[field]);
    if (attemptedImmutableField) {
      return res.status(400).json({ error: `Field ${attemptedImmutableField} cannot be edited after a sale is recorded` });
    }

    const allowedUpdates = [
      'buyerName', 'buyerFatherName', 'buyerPhone', 'buyerAddress', 'buyerIdNumber', 'buyerProvince',
      'buyerDistrict', 'buyerVillage', 'sellerName', 'sellerFatherName', 'sellerProvince', 'sellerDistrict',
      'sellerVillage', 'sellerAddress', 'sellerIdNumber', 'sellerPhone', 'exchVehicleCategory',
      'exchVehicleManufacturer', 'exchVehicleModel', 'exchVehicleYear', 'exchVehicleColor', 'exchVehicleChassis',
      'exchVehicleEngine', 'exchVehicleEngineType', 'exchVehicleFuelType', 'exchVehicleTransmission',
      'exchVehicleMileage', 'exchVehiclePlateNo', 'exchVehicleLicense', 'exchVehicleSteering',
      'exchVehicleMonolithicCut', 'priceDifference', 'priceDifferencePaidBy', 'trafficTransferDate',
      'notes', 'witnessName1',
    ];
    const updatePayload = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key))
    );

    await sale.update(updatePayload);

    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');
    const pdfInfo = await generateSaleInvoicePdf(sale, sale.vehicle, sale.customer, pdfOutputDir);
    await sale.update({ invoicePath: pdfInfo.filePath });
    
    const updatedSale = await Sale.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        { model: CommissionDistribution, as: 'commissions' }
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
      vehicleId, customerId, sellingPrice, sellingCurrency, saleDate, downPayment, remainingAmount, notes,
      saleType,
      // Buyer info (text fields)
      buyerName, buyerFatherName, buyerPhone, buyerAddress, buyerIdNumber,
      buyerProvince, buyerDistrict, buyerVillage,
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
      witnessName1
    } = req.body;
    
    const vehicle = await Vehicle.findByPk(vehicleId, {
      include: [{ model: SharingPerson, as: 'sharingPersons' }]
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found', message: 'Vehicle not found' });
    }
    
    if (vehicle.status === 'Sold') {
      return res.status(400).json({ error: 'Vehicle already sold', message: 'Vehicle already sold' });
    }
    
    // Generate sale ID (use MAX to avoid collision after deletions)
    const lastSale = await Sale.findOne({ order: [['id', 'DESC']], attributes: ['saleId'] });
    let nextSaleNum = 1;
    if (lastSale && lastSale.saleId) {
      const match = lastSale.saleId.match(/S(\d+)/);
      if (match) nextSaleNum = parseInt(match[1], 10) + 1;
    }
    const saleId = `S${String(nextSaleNum).padStart(6, '0')}`;
    
    // Convert selling price to AFN
    const paymentCurr = sellingCurrency || 'AFN';
    const sellingPriceConverted = await toAFN(sellingPrice, paymentCurr);
    const sellingPriceAFN = sellingPriceConverted.amountAFN;
    const sellingPriceNum = Number(sellingPrice) || 0;
    const downPaymentNum = Number(downPayment) || 0;
    const downPaymentConverted = await toAFN(downPaymentNum, paymentCurr);
    const downPaymentAFN = downPaymentConverted.amountAFN;
    const remainingAmountAFN = Math.max(sellingPriceAFN - downPaymentAFN, 0);

    if (downPaymentAFN > sellingPriceAFN) {
      return res.status(400).json({ error: 'Down payment cannot exceed the selling price', message: 'Down payment cannot exceed the selling price' });
    }
    
    // Save daily rates
    await saveDailyRates(req.user?.id);
    
    // Calculate profit in AFN (selling price in AFN - total cost in AFN)
    const profit = sellingPriceAFN - Number(vehicle.totalCostAFN || 0);
    const distributableProfit = Math.max(profit, 0);
    
    // Calculate commission distribution
    let totalSharedAmount = 0;
    if (vehicle.sharingPersons && vehicle.sharingPersons.length > 0) {
      totalSharedAmount = vehicle.sharingPersons.reduce((sum, person) => {
        return sum + ((distributableProfit * person.percentage) / 100);
      }, 0);
    }
    
    const commission = totalSharedAmount; // Total commission is what's shared with partners
    const ownerShare = profit - commission; // Owner gets the remaining profit
    
    // Create sale
    const paymentStatus = remainingAmountAFN <= 0 ? 'Paid' : (downPaymentAFN > 0 ? 'Partial' : 'Pending');

    const sale = await Sale.create({
      saleId,
      saleType: saleType || 'Container One Key',
      vehicleId,
      customerId,
      // Buyer info
      buyerName: buyerName || null,
      buyerFatherName: buyerFatherName || null,
      buyerPhone: buyerPhone || null,
      buyerAddress: buyerAddress || null,
      buyerIdNumber: buyerIdNumber || null,
      buyerProvince: buyerProvince || null,
      buyerDistrict: buyerDistrict || null,
      buyerVillage: buyerVillage || null,
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
      sellingCurrency: paymentCurr,
      sellingPriceAFN,
      totalCost: Number(vehicle.totalCostAFN || 0),
      profit,
      commission,
      ownerShare,
      exchangeRateUsed: sellingPriceConverted.rate,
      saleDate,
      paymentMethod: 'Cash',
      downPayment: downPaymentAFN,
      remainingAmount: remainingAmountAFN,
      paidAmount: downPaymentAFN,
      paymentStatus,
      notes: notes || null,
      witnessName1: witnessName1 || null,
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
        totalCostAFN: Number(priceDifference) || 0,
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
      currency: paymentCurr,
      amountAFN: sellingPriceAFN,
      exchangeRateUsed: sellingPriceConverted.rate,
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
        currency: paymentCurr,
        amountInAFN: downPaymentConverted.amountAFN,
        exchangeRateUsed: downPaymentConverted.rate,
        description: `Down payment for ${vehicle.vehicleId} — ${paymentStatus === 'Paid' ? 'Paid in full' : `${downPaymentNum.toLocaleString()} ${paymentCurr} received`}`,
        date: saleDate,
        referenceId: sale.id,
        referenceType: 'Sale',
        addedBy: req.user.id
      });
    }

    // Customer ledger: only if customerId is provided (sales now use text fields for buyer)
    if (customerId) {
      const lastCustEntry = await CustomerLedger.findOne({
        where: { customerId },
        order: [['id', 'DESC']],
      });
      const prevCustBalance = lastCustEntry ? Number(lastCustEntry.balance || 0) : 0;
      const balanceAfterSale = prevCustBalance - sellingPriceAFN;

      await CustomerLedger.create({
        customerId,
        type: 'Sale',
        amount: sellingPriceNum,
        currency: paymentCurr,
        amountInAFN: sellingPriceAFN,
        exchangeRateUsed: sellingPriceConverted.rate,
        purpose: `Purchase of ${vehicle.vehicleId} — total price`,
        date: saleDate,
        balance: balanceAfterSale,
        saleId: sale.id,
        addedBy: req.user.id
      });

      let finalCustBalance = balanceAfterSale;
      if (downPaymentNum > 0) {
        finalCustBalance = balanceAfterSale + downPaymentAFN;
        await CustomerLedger.create({
          customerId,
          type: 'Received',
          amount: downPaymentNum,
          currency: paymentCurr,
          amountInAFN: downPaymentAFN,
          exchangeRateUsed: downPaymentConverted.rate,
          purpose: `Down payment for ${vehicle.vehicleId}`,
          date: saleDate,
          balance: finalCustBalance,
          saleId: sale.id,
          addedBy: req.user.id
        });
      }
      await Customer.update({ balance: finalCustBalance }, { where: { id: customerId } });
    }
    
    // Distribute commission to sharing persons
    if (distributableProfit > 0 && vehicle.sharingPersons && vehicle.sharingPersons.length > 0) {
      for (const person of vehicle.sharingPersons) {
        const personShare = (distributableProfit * person.percentage) / 100;
        
        await LedgerTransaction.create({
          transactionId: `TR${Date.now()}_${person.id}`,
          transactionType: 'Commission',
          amount: personShare,
          currency: 'AFN',
          amountAFN: personShare,
          relatedEntityType: 'SharingPerson',
          relatedEntityId: person.id,
          description: `Commission for ${person.personName} - ${person.percentage}%`,
          transactionDate: saleDate,
          createdBy: req.user.id
        });

        await CommissionDistribution.create({
          saleId: sale.id,
          sharingPersonId: person.id,
          personName: person.personName,
          sharePercentage: person.percentage,
          amount: personShare,
          status: 'Pending'
        });

        // Create customer ledger entry for sharing person if linked to customer
        if (person.customerId) {
          const lastShareEntry = await CustomerLedger.findOne({
            where: { customerId: person.customerId },
            order: [['id', 'DESC']],
          });
          const prevShareBalance = lastShareEntry ? Number(lastShareEntry.balance || 0) : 0;
          const newShareBalance = prevShareBalance + personShare;
          
          await CustomerLedger.create({
            customerId: person.customerId,
            type: 'Investment',
            amount: personShare,
            currency: 'AFN',
            amountInAFN: personShare,
            purpose: `Commission from sale ${sale.saleId} - ${person.percentage}% share`,
            date: saleDate,
            balance: newShareBalance,
            saleId: sale.id,
            addedBy: req.user.id
          });
          
          await Customer.update({ balance: newShareBalance }, { where: { id: person.customerId } });
        }

        await ShowroomLedger.create({
          type: 'Commission',
          amount: personShare,
          currency: 'AFN',
          amountInAFN: personShare,
          description: `Commission for ${person.personName}`,
          date: saleDate,
          referenceId: sale.id,
          referenceType: 'CommissionDistribution',
          personName: person.personName,
          personId: person.customerId || null,
          addedBy: req.user.id
        });
      }
    }
    
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' }
      ]
    });

    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');
    const pdfInfo = await generateSaleInvoicePdf(completeSale, vehicle, completeSale.customer, pdfOutputDir);
    await sale.update({ invoicePath: pdfInfo.filePath });
    
    res.status(201).json({ ...completeSale.toJSON(), invoicePath: pdfInfo.filePath });
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
    await LedgerTransaction.destroy({ where: { relatedEntityType: 'Sale', relatedEntityId: sale.id } });
    await ShowroomLedger.destroy({ where: { referenceType: 'Sale', referenceId: sale.id } });
    
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
    const customer = sale.customerId ? await Customer.findByPk(sale.customerId) : null;
    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');
    const pdfInfo = await generateSaleInvoicePdf(sale, vehicle, customer, pdfOutputDir);
    await sale.update({ invoicePath: pdfInfo.filePath });

    res.download(pdfInfo.filePath, pdfInfo.fileName);
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

    const paymentEntries = await ShowroomLedger.findAll({
      where: { referenceType: 'Sale', referenceId: sale.id, type: 'Vehicle Sale' },
      order: [['date', 'ASC']],
    });

    const payments = paymentEntries.map((entry) => ({
      id: entry.id,
      type: (entry.description || '').startsWith('Down payment') ? 'Down Payment' : 'Installment',
      amount: entry.amount,
      amountInAFN: entry.amountInAFN,
      currency: entry.currency,
      date: entry.date,
      purpose: entry.description,
      exchangeRateUsed: entry.exchangeRateUsed,
    }));

    res.json({
      success: true,
      data: payments,
      summary: {
        sellingPrice: Number(sale.sellingPriceAFN || sale.sellingPrice),
        downPayment: Number(sale.downPayment),
        paidAmount: Number(sale.paidAmount),
        remainingAmount: Number(sale.remainingAmount),
        paymentStatus: sale.paymentStatus,
        installmentCount: payments.filter((payment) => payment.type === 'Installment').length,
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
    const paymentConverted = await toAFN(paymentAmount, paymentCurrency);
    const paymentAmountAFN = paymentConverted.amountAFN;

    if (paymentAmountAFN > remaining) {
      return res.status(400).json({ error: `Payment amount exceeds remaining balance of ${remaining.toLocaleString()} AFN` });
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
    let ledgerEntry = null;
    if (sale.customerId) {
      const lastEntry = await CustomerLedger.findOne({
        where: { customerId: sale.customerId },
        order: [['id', 'DESC']],
      });
      const prevBalance = lastEntry ? Number(lastEntry.balance || 0) : 0;
      const newBalance = prevBalance + paymentAmountAFN;

      ledgerEntry = await CustomerLedger.create({
        customerId: sale.customerId,
        type: 'Installment',
        amount: paymentAmount,
        currency: paymentCurrency,
        amountInAFN: paymentAmountAFN,
        exchangeRateUsed: paymentConverted.rate,
        purpose: note || `Installment payment for sale ${sale.saleId} — ${sale.vehicle?.vehicleId || ''}`,
        date: paymentDate,
        balance: newBalance,
        saleId: sale.id,
        addedBy: req.user?.id,
      });

      // 3) Update customer overall balance
      await Customer.update({ balance: newBalance }, { where: { id: sale.customerId } });
    }

    // 4) Record actual cash received in showroom ledger
    await ShowroomLedger.create({
      type: 'Vehicle Sale',
      amount: paymentAmount,
      currency: paymentCurrency,
      amountInAFN: paymentAmountAFN,
      exchangeRateUsed: paymentConverted.rate,
      description: `Installment from ${sale.customer?.fullName || sale.buyerName || 'Buyer'} for ${sale.vehicle?.vehicleId || sale.saleId}${newStatus === 'Paid' ? ' (FULLY PAID)' : ` (${newRemaining.toLocaleString()} AFN remaining)`}`,
      date: paymentDate,
      referenceId: sale.id,
      referenceType: 'Sale',
      personName: sale.customer?.fullName || sale.buyerName || null,
      addedBy: req.user?.id,
    });

    // 5) Record in general ledger
    await LedgerTransaction.create({
      transactionId: `TR${Date.now()}`,
      transactionType: 'Credit',
      amount: paymentAmount,
      currency: paymentCurrency,
      amountAFN: paymentAmountAFN,
      exchangeRateUsed: paymentConverted.rate,
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
        ? `Payment of ${paymentAmountAFN.toLocaleString()} AFN recorded — sale is now fully paid`
        : `Payment of ${paymentAmountAFN.toLocaleString()} AFN recorded — ${newRemaining.toLocaleString()} AFN remaining`,
      data: { payment: ledgerEntry, sale: updatedSale },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
