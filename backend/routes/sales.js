const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Sale = require('../models/Sale');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const ReferencePerson = require('../models/ReferencePerson');
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

// Update sale – only notes and note2 allowed
router.put('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    const allowedUpdates = {};
    if (req.body.notes !== undefined) allowedUpdates.notes = req.body.notes;
    if (req.body.note2 !== undefined) allowedUpdates.note2 = req.body.note2;
    
    await sale.update(allowedUpdates);
    
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
      buyerName, buyerFatherName, buyerProvince, buyerDistrict, buyerVillage,
      buyerAddress, buyerIdNumber, buyerPhone,
      paymentCurrency,
      sellerName, sellerFatherName, sellerProvince, sellerDistrict, sellerVillage,
      sellerAddress, sellerIdNumber, sellerPhone,
      exchVehicleCategory, exchVehicleManufacturer, exchVehicleModel, exchVehicleYear,
      exchVehicleColor, exchVehicleChassis, exchVehicleEngine, exchVehicleEngineType,
      exchVehicleFuelType, exchVehicleTransmission, exchVehicleMileage,
      exchVehiclePlateNo, exchVehicleLicense, exchVehicleSteering, exchVehicleMonolithicCut,
      priceDifference, priceDifferencePaidBy,
      exchangeVehicleCost,
      trafficTransferDate,
      witnessName1, witnessName2,
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

    const referencePerson = await ReferencePerson.findOne({ where: { vehicleId: vehicle.id } });
    const hasReferencePerson = !!referencePerson;
    
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

    const pCurrency = paymentCurrency || 'AFN';
    const sellingPriceAFN = Math.round(await toAFN(Number(sellingPrice), pCurrency));
    const downPaymentAFN = Math.round(await toAFN(Number(downPayment) || 0, pCurrency));

    const lastSale = await Sale.findOne({ order: [['id', 'DESC']], attributes: ['saleId'] });
    let nextSaleNum = 1;
    if (lastSale && lastSale.saleId) {
      const match = lastSale.saleId.match(/S(\d+)/);
      if (match) nextSaleNum = parseInt(match[1], 10) + 1;
    }
    const saleId = `S${String(nextSaleNum).padStart(6, '0')}`;
    
    const vehicleTotalCost = Number(vehicle.totalCostPKR || 0);
    let sharedProfit = 0;
    let showroomAdjustment = 0;
    let exchCostAFN = 0;

    if (saleType === 'Exchange Car') {
      exchCostAFN = await toAFN(Number(exchangeVehicleCost) || Number(priceDifference) || 0, 'AFN');
      sharedProfit = sellingPriceAFN - vehicleTotalCost;
      showroomAdjustment = vehicleTotalCost - exchCostAFN;
    } else {
      sharedProfit = sellingPriceAFN - vehicleTotalCost;
    }
    
    const distResult = buildProfitDistribution(
      vehicle.sharingPersons || [],
      sharedProfit,
      vehicle.totalCostPKR
    );
    const commission = distResult.totalSharedAmount;
    const ownerShare = distResult.ownerShare;
    const partnerDistributions = distResult.partnerDistributions;
    
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
      buyerName: buyerName || null,
      buyerFatherName: buyerFatherName || null,
      buyerProvince: buyerProvince || null,
      buyerDistrict: buyerDistrict || null,
      buyerVillage: buyerVillage || null,
      buyerAddress: buyerAddress || null,
      buyerIdNumber: buyerIdNumber || null,
      buyerPhone: buyerPhone || null,
      sellerName: sellerName || null,
      sellerFatherName: sellerFatherName || null,
      sellerProvince: sellerProvince || null,
      sellerDistrict: sellerDistrict || null,
      sellerVillage: sellerVillage || null,
      sellerAddress: sellerAddress || null,
      sellerIdNumber: sellerIdNumber || null,
      sellerPhone: sellerPhone || null,
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
      trafficTransferDate: trafficTransferDate || null,
      sellingPrice: sellingPriceNum,
      totalCost: vehicleTotalCost,
      profit: sharedProfit,
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
      soldBy: req.user.id
    });
    
    await vehicle.update({
      status: 'Sold',
      isLocked: true
    });

    if (saleType === 'Exchange Car' && (exchVehicleCategory || exchVehicleManufacturer)) {
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
        basePurchasePrice: exchCostAFN,
        baseCurrency: 'AFN',
        totalCostPKR: exchCostAFN,
        sellingPrice: null,
        isLocked: false
      });

      await sale.update({ exchangeVehicleId: exchangeVehicle.id });
    }
    
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

    // ─── Showroom ledger entries (only if no reference person) ───
    if (!hasReferencePerson) {
      // 1) Record the full selling price as Total Income (Showroom Balance)
      await ShowroomLedger.create({
        type: 'Showroom Balance',
        amount: sellingPriceNum,
        currency: 'AFN',
        amountInPKR: sellingPriceNum,
        description: `Sale of ${vehicle.vehicleId} to ${buyerName || 'Customer'} – full price`,
        date: saleDate,
        referenceId: sale.id,
        referenceType: 'Sale',
        addedBy: req.user.id
      });

      // 2) Record the actual cash received (down payment) as Vehicle Sale (cash)
      if (downPaymentNum > 0) {
        await ShowroomLedger.create({
          type: 'Vehicle Sale',
          amount: downPaymentNum,
          currency: 'AFN',
          amountInPKR: downPaymentNum,
          description: `Down payment for ${vehicle.vehicleId} — ${paymentStatus === 'Paid' ? 'Paid in full' : `${downPaymentNum.toLocaleString()} of ${sellingPriceNum.toLocaleString()} AFN`}`,
          date: saleDate,
          referenceId: sale.id,
          referenceType: 'Sale',
          addedBy: req.user.id
        });
      }

      // 3) Exchange adjustment (if any)
      if (saleType === 'Exchange Car' && showroomAdjustment !== 0) {
        await ShowroomLedger.create({
          type: showroomAdjustment > 0 ? 'Expense' : 'Income',
          amount: Math.abs(showroomAdjustment),
          currency: 'AFN',
          amountInPKR: Math.abs(showroomAdjustment),
          description: `Exchange adjustment: cost difference between sold vehicle (${vehicleTotalCost}) and received vehicle (${exchCostAFN})`,
          date: saleDate,
          referenceId: sale.id,
          referenceType: 'Sale',
          addedBy: req.user.id
        });
      }

      // 4) Partner profit shares – record as ShowroomLedger expense/income
      if (partnerDistributions.length > 0 && sharedProfit !== 0) {
        for (const person of partnerDistributions) {
          const matchedCustomer = await resolveSharingCustomer(person);
          const personName = matchedCustomer?.fullName || person.personName;

          if (person.amount === 0) continue;
          
          await LedgerTransaction.create({
            transactionId: `TR${Date.now()}_${person.id}`,
            transactionType: 'Commission',
            amount: Math.abs(person.amount),
            currency: 'AFN',
            amountPKR: await toAFN(Math.abs(person.amount), 'AFN'),
            relatedEntityType: 'SaleCommission',
            relatedEntityId: sale.id,
            description: `Partner profit share for ${personName} from sale ${sale.saleId} - ${person.sharePercentage}% (${person.amount >= 0 ? 'profit' : 'loss'})`,
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
            amount: Math.abs(person.amount),
            paidDate: saleDate,
            calculationMethod: person.calculationMethod,
            status: 'Paid'
          });

          // Record partner share as ShowroomLedger entry
          if (person.amount > 0) {
            await ShowroomLedger.create({
              type: 'Expense',
              amount: Math.abs(person.amount),
              currency: 'AFN',
              amountInPKR: Math.abs(person.amount),
              description: `Partner profit share for ${personName} from sale ${sale.saleId} (${person.sharePercentage}%)`,
              date: saleDate,
              referenceId: sale.id,
              referenceType: 'CommissionDistribution',
              personName,
              addedBy: req.user.id
            });
          } else if (person.amount < 0) {
            await ShowroomLedger.create({
              type: 'Income',
              amount: Math.abs(person.amount),
              currency: 'AFN',
              amountInPKR: Math.abs(person.amount),
              description: `Loss recovery from partner ${personName} for sale ${sale.saleId} (${person.sharePercentage}%)`,
              date: saleDate,
              referenceId: sale.id,
              referenceType: 'CommissionDistribution',
              personName,
              addedBy: req.user.id
            });
          }

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
              amount: Math.abs(person.amount),
              currency: 'AFN',
              amountInPKR: Math.abs(person.amount),
              purpose: `Partner ${person.amount >= 0 ? 'profit' : 'loss'} from sale ${sale.saleId} (${person.sharePercentage}%)`,
              date: saleDate,
              balance: newBal,
              saleId: sale.id,
              addedBy: req.user.id
            });
            await Customer.update({ balance: newBal }, { where: { id: matchedCustomer.id } });
          }
        }
      }
    } // end if (!hasReferencePerson)

    // ─── Customer ledger entries (always) ───
    const lastCustEntry = await CustomerLedger.findOne({
      where: { customerId },
      order: [['id', 'DESC']],
    });
    const prevCustBalance = lastCustEntry ? Number(lastCustEntry.balance || 0) : 0;
    const balanceAfterSale = prevCustBalance - sellingPriceNum;

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

    let finalCustBalance = balanceAfterSale;
    if (downPaymentNum > 0) {
      finalCustBalance = balanceAfterSale + downPaymentNum;
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

    await Customer.update({ balance: finalCustBalance }, { where: { id: customerId } });
    
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
    
    const vehicle = await Vehicle.findByPk(sale.vehicleId);
    if (vehicle) {
      await vehicle.update({ status: 'Available', isLocked: false });
    }
    
    if (sale.exchangeVehicleId) {
      const exchVehicle = await Vehicle.findByPk(sale.exchangeVehicleId);
      if (exchVehicle && exchVehicle.status === 'Available') {
        await exchVehicle.destroy();
      }
    }

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
    
    await sale.destroy();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate invoice PDF
router.get('/:id/invoice', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const vehicle = await Vehicle.findByPk(sale.vehicleId);
    const customer = await Customer.findByPk(sale.customerId);
    const pdfOutputDir = path.join(__dirname, '..', 'uploads', 'pdf');

    if (sale.invoicePath && fs.existsSync(sale.invoicePath)) {
      try { fs.unlinkSync(sale.invoicePath); } catch (_) {}
    }

    try {
      const pdfInfo = await generateSaleInvoicePdf(sale, vehicle, customer, pdfOutputDir);
      if (pdfInfo && pdfInfo.filePath) {
        await sale.update({ invoicePath: pdfInfo.filePath });
        return res.download(pdfInfo.filePath, pdfInfo.fileName);
      }
      return res.status(500).json({ error: 'Failed to generate invoice: generator returned no file' });
    } catch (err) {
      const detail = (err && (err.stack || err.message)) || String(err);
      console.error('Invoice generation failed:', detail);
      return res.status(500).json({ error: `Failed to generate invoice: ${err && err.message ? err.message : 'unknown error'}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

    // 2) Create customer ledger entry
    const lastEntry = await CustomerLedger.findOne({
      where: { customerId: sale.customerId },
      order: [['id', 'DESC']],
    });
    const prevBalance = lastEntry ? Number(lastEntry.balance || 0) : 0;
    const newBalance = prevBalance + paymentAmountAFN;

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

    // 4) Check reference person
    const vehicle = await Vehicle.findByPk(sale.vehicleId);
    const referencePerson = await ReferencePerson.findOne({ where: { vehicleId: vehicle?.id } });
    const hasReferencePerson = !!referencePerson;

    if (!hasReferencePerson) {
      // Record cash received (Vehicle Sale) – never create Showroom Balance here
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
    }

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