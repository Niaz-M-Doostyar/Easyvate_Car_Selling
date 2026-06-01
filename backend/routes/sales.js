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
      phoneNumber: buyerPhone || '',
      province: buyerProvince || '',
      district: buyerDistrict || '',
      village: buyerVillage || '',
      currentAddress: buyerAddress || '',
      originalAddress: buyerAddress || '',
      nationalIdNumber: buyerIdNumber || '',
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
    const sellingPriceNum = parseFloat(sellingPrice) || 0;
    const downPaymentNum = parseFloat(downPayment) || 0;
    const sellingPriceOriginal = sellingPriceNum;


    const lastSale = await Sale.findOne({ order: [['id', 'DESC']], attributes: ['saleId'] });
    let nextSaleNum = 1;
    if (lastSale && lastSale.saleId) {
      const match = lastSale.saleId.match(/S(\d+)/);
      if (match) nextSaleNum = parseInt(match[1], 10) + 1;
    }
    const saleId = `S${String(nextSaleNum).padStart(6, '0')}`;
    
    const vehicleTotalCostOriginal = Number(vehicle.totalCostOriginal || 0);
    let sharedProfit = 0;
    let showroomAdjustment = 0;
    let exchCostAFN = 0;
    let exchCostOriginal = 0;      // ← declared outside

    if (saleType === 'Exchange Car') {
      let calculatedExchangeCost = 0;
      const diff = parseFloat(priceDifference) || 0;
      if (priceDifferencePaidBy === 'Buyer') {
        calculatedExchangeCost = sellingPriceNum - diff;
      } else { // Seller
        calculatedExchangeCost = sellingPriceNum + diff;
      }
      calculatedExchangeCost = Math.max(calculatedExchangeCost, 0);
      
      exchCostOriginal = calculatedExchangeCost;
      exchCostAFN = await toAFN(exchCostOriginal, pCurrency);
      sharedProfit = sellingPriceNum - vehicleTotalCostOriginal;
      showroomAdjustment = vehicleTotalCostOriginal - exchCostOriginal;
    } else {
      sharedProfit = sellingPriceNum - vehicleTotalCostOriginal;
    }
    
    const distResult = buildProfitDistribution(
      vehicle.sharingPersons || [],
      sharedProfit,
      vehicle.totalCostPKR
    );
    const commission = distResult.totalSharedAmount;
    const ownerShare = distResult.ownerShare;
    const partnerDistributions = distResult.partnerDistributions;
    
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
      totalCost: vehicleTotalCostOriginal,
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
      basePurchasePrice: exchCostOriginal,           // use the original calculated cost
      baseCurrency: pCurrency,                      // use sale's payment currency
      totalCostOriginal: exchCostOriginal,          // store in original currency
      totalCostPKR: exchCostAFN,                    // converted for ledger
      sellingPrice: null,
      isLocked: false
    });

      await sale.update({ exchangeVehicleId: exchangeVehicle.id });
      // Record the exchange vehicle as a purchase in showroom ledger
      await ShowroomLedger.create({
        type: 'Vehicle Purchase',
        amount: exchCostOriginal,
        currency: pCurrency,
        amountInPKR: exchCostAFN,
        description: `Exchange vehicle acquisition: ${exchVehicleManufacturer} ${exchVehicleModel} (${exchVehicleYear})`,
        date: saleDate,
        referenceId: exchangeVehicle.id,
        referenceType: 'Vehicle',
        addedBy: req.user.id
      });
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
      const sellingPriceAFN = await toAFN(sellingPriceNum, pCurrency);
      const downPaymentAFN = await toAFN(downPaymentNum, pCurrency);
      // 1) Record the full selling price as Total Income (Showroom Balance)
      // await ShowroomLedger.create({
      //   type: 'Showroom Balance',
      //   amount: sellingPriceOriginal,
      //   currency: pCurrency,
      //   amountInPKR: sellingPriceNum,
      //   description: `Sale of ${vehicle.vehicleId} to ${buyerName || 'Customer'} – full price`,
      //   date: saleDate,
      //   referenceId: sale.id,
      //   referenceType: 'Sale',
      //   addedBy: req.user.id
      // });

      // 3) Exchange adjustment (if any)
      if (saleType === 'Exchange Car' && showroomAdjustment !== 0) {
        const adjustmentAFN = await toAFN(Math.abs(showroomAdjustment), pCurrency);
        await ShowroomLedger.create({
          type: showroomAdjustment > 0 ? 'Showroom Balance' : 'Showroom Balance',
          amount: Math.abs(showroomAdjustment),
          currency: 'AFN',
          amountInPKR: adjustmentAFN,
          description: `Exchange adjustment: cost difference between sold vehicle (${vehicleTotalCostOriginal}) and received vehicle (${exchCostAFN})`,
          date: saleDate,
          referenceId: sale.id,
          referenceType: 'Sale',
          addedBy: req.user.id
        });
      }else{
        // 2) Record the actual cash received (down payment) as Vehicle Sale (cash)
        if (downPaymentNum > 0) {
          await ShowroomLedger.create({
            type: 'Vehicle Sale',
            amount: downPaymentNum,
            currency: pCurrency,
            amountInPKR: downPaymentAFN,
            description: `Down payment for ${vehicle.vehicleId} — ${paymentStatus === 'Paid' ? 'Paid in full' : `${downPaymentNum.toLocaleString()} of ${sellingPriceNum.toLocaleString()} AFN`}`,
            date: saleDate,
            referenceId: sale.id,
            referenceType: 'Sale',
            addedBy: req.user.id
          });
        }
      }

      // 4) Partner profit shares – record as ShowroomLedger expense/income
      if (partnerDistributions.length > 0 && sharedProfit !== 0) {
        for (const person of partnerDistributions) {
          const matchedCustomer = await resolveSharingCustomer(person);
          const personName = matchedCustomer?.fullName || person.personName;

          if (person.amount === 0) continue;

          // person.amount is already in the sale's currency (pCurrency)
          const amountInSaleCurrency = Math.abs(person.amount);
          const amountAFN = await toAFN(amountInSaleCurrency, pCurrency);

          await LedgerTransaction.create({
            transactionId: `TR${Date.now()}_${person.id}`,
            transactionType: 'Commission',
            amount: amountInSaleCurrency,
            currency: pCurrency,
            amountPKR: amountAFN,
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
            amount: amountInSaleCurrency,
            paidDate: saleDate,
            calculationMethod: person.calculationMethod,
            status: 'Paid'
          });

          // Record partner share in ShowroomLedger (using original sale currency)
          if (person.amount > 0) {
            await ShowroomLedger.create({
              type: 'Partner Profit',
              amount: amountInSaleCurrency,
              currency: pCurrency,
              amountInPKR: amountAFN,
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
              amount: amountInSaleCurrency,
              currency: pCurrency,
              amountInPKR: amountAFN,
              description: `Loss recovery from partner ${personName} for sale ${sale.saleId} (${person.sharePercentage}%)`,
              date: saleDate,
              referenceId: sale.id,
              referenceType: 'CommissionDistribution',
              personName,
              addedBy: req.user.id
            });
          }

          if (matchedCustomer) {
            // Update partner's per‑currency balance
            let balanceField;
            switch (pCurrency) {
              case 'USD': balanceField = 'balanceUSD'; break;
              case 'PKR': balanceField = 'balancePKR'; break;
              case 'AED': balanceField = 'balanceAED'; break;
              default: balanceField = 'balanceAFN';
            }
            const currentCurrencyBalance = parseFloat(matchedCustomer[balanceField] || 0);
            const newCurrencyBalance = currentCurrencyBalance + (person.amount > 0 ? amountInSaleCurrency : -amountInSaleCurrency);
            await matchedCustomer.update({ [balanceField]: newCurrencyBalance });

            // Update legacy AFN balance (balance field)
            const lastEntry = await CustomerLedger.findOne({
              where: { customerId: matchedCustomer.id },
              order: [['id', 'DESC']],
            });
            const prevBal = lastEntry ? Number(lastEntry.balance || 0) : 0;
            const newBal = prevBal + (person.amount > 0 ? amountAFN : -amountAFN);
            await CustomerLedger.create({
              customerId: matchedCustomer.id,
              type: PARTNER_PROFIT_LEDGER_TYPE,
              amount: amountInSaleCurrency,
              currency: pCurrency,
              amountInPKR: amountAFN,
              purpose: `Partner ${person.amount >= 0 ? 'profit' : 'loss'} from sale ${sale.saleId} (${person.sharePercentage}%)`,
              date: saleDate,
              balance: newBal,
              saleId: sale.id,
              addedBy: req.user.id
            });
            await Customer.update({ balance: newBal }, { where: { id: matchedCustomer.id } });
          }
        }
        for (const sharing of vehicle.sharingPersons) {
          if (
            sharing.customerId &&
            Number(sharing.investmentAmount) > 0 &&
            sharing.investmentCurrency
          ) {
            const partner = await Customer.findByPk(sharing.customerId);
            if (!partner) continue;

            const investCurrency = sharing.investmentCurrency;
            const investAmount = Number(sharing.investmentAmount);
            const amountAFN = await toAFN(investAmount, investCurrency);

            // Update the multi‑currency balance
            const balanceField = {
              USD: 'balanceUSD',
              PKR: 'balancePKR',
              AED: 'balanceAED',
            }[investCurrency] || 'balanceAFN';

            const currentBalance = parseFloat(partner[balanceField] || 0);
            const newBalance = currentBalance + investAmount;
            await partner.update({ [balanceField]: newBalance });

            // Update legacy AFN balance
            const lastEntry = await CustomerLedger.findOne({
              where: { customerId: partner.id },
              order: [['id', 'DESC']],
            });
            const prevLegacyBal = lastEntry ? Number(lastEntry.balance || 0) : 0;
            const newLegacyBal = prevLegacyBal + amountAFN;

            await CustomerLedger.create({
              customerId: partner.id,
              type: 'Investment Return',      // or 'Capital Return'
              amount: investAmount,
              currency: investCurrency,
              amountInPKR: amountAFN,
              purpose: `Return of investment in vehicle ${vehicle.vehicleId} (${sharing.percentage}%)`,
              date: saleDate,
              balance: newLegacyBal,
              saleId: sale.id,
              addedBy: req.user.id,
            });

            await Customer.update(
              { balance: newLegacyBal },
              { where: { id: partner.id } }
            );
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
// Record an installment payment for a sale (multi‑currency)
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

    const paymentAmount = parseFloat(amount);
    const paymentCurrency = currency || sale.paymentCurrency || 'AFN';
    const saleCurrency = sale.paymentCurrency || 'AFN';

    // Convert payment amount to the sale's currency for validation and updating
    let paymentInSaleCurrency = paymentAmount;
    if (paymentCurrency !== saleCurrency) {
      // Convert via AFN: payment -> AFN, then AFN -> saleCurrency
      const paymentAFN = await toAFN(paymentAmount, paymentCurrency);
      // Reverse: from AFN to saleCurrency (using the same rate, but inverted)
      const saleRate = await toAFN(1, saleCurrency); // AFN per 1 unit of saleCurrency
      if (saleRate && saleRate !== 0) {
        paymentInSaleCurrency = paymentAFN / saleRate;
      } else {
        // fallback: assume 1:1 if rate missing (should not happen)
        paymentInSaleCurrency = paymentAmount;
      }
    }

    const remaining = Number(sale.remainingAmount); // already in sale's currency
    if (paymentInSaleCurrency > remaining) {
      return res.status(400).json({
        error: `Payment amount exceeds remaining balance (${remaining.toLocaleString()} ${saleCurrency})`
      });
    }

    // Update sale in sale's currency
    const newPaid = Number(sale.paidAmount) + paymentInSaleCurrency;
    const newRemaining = Math.max(remaining - paymentInSaleCurrency, 0);
    const newStatus = newRemaining <= 0 ? 'Paid' : 'Partial';
    const paymentDate = date || new Date();

    await sale.update({
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      paymentStatus: newStatus,
    });

    // AFN equivalent for ledger
    const paymentAFN = await toAFN(paymentAmount, paymentCurrency);

    // Customer ledger entry
    const lastEntry = await CustomerLedger.findOne({
      where: { customerId: sale.customerId },
      order: [['id', 'DESC']],
    });
    const prevBalance = lastEntry ? Number(lastEntry.balance || 0) : 0;
    const newBalance = prevBalance + paymentAFN;

    const ledgerEntry = await CustomerLedger.create({
      customerId: sale.customerId,
      type: 'Installment',
      amount: paymentAmount,
      currency: paymentCurrency,
      amountInPKR: paymentAFN,
      purpose: note || `Installment payment for sale ${sale.saleId} — ${sale.vehicle?.vehicleId || ''}`,
      date: paymentDate,
      balance: newBalance,
      saleId: sale.id,
      addedBy: req.user?.id,
    });

    // Update customer overall AFN balance
    await Customer.update({ balance: newBalance }, { where: { id: sale.customerId } });

    // Showroom ledger (only if no reference person)
    const vehicle = await Vehicle.findByPk(sale.vehicleId);
    const referencePerson = await ReferencePerson.findOne({ where: { vehicleId: vehicle?.id } });
    const hasReferencePerson = !!referencePerson;

    if (!hasReferencePerson) {
      await ShowroomLedger.create({
        type: 'Vehicle Sale',
        amount: paymentAmount,
        currency: paymentCurrency,
        amountInPKR: paymentAFN,
        description: `Installment from ${sale.buyerName || sale.customer?.fullName || 'Customer'} for ${sale.vehicle?.vehicleId || sale.saleId}${newStatus === 'Paid' ? ' (FULLY PAID)' : ` (${newRemaining.toLocaleString()} ${saleCurrency} remaining)`}`,
        date: paymentDate,
        referenceId: sale.id,
        referenceType: 'Sale',
        personName: sale.buyerName || sale.customer?.fullName,
        addedBy: req.user?.id,
      });
    }

    // Ledger transaction
    await LedgerTransaction.create({
      transactionId: `TR${Date.now()}`,
      transactionType: 'Credit',
      amount: paymentAmount,
      currency: paymentCurrency,
      amountPKR: paymentAFN,
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
        : `Payment of ${paymentAmount.toLocaleString()} ${paymentCurrency} recorded — ${newRemaining.toLocaleString()} ${saleCurrency} remaining`,
      data: { payment: ledgerEntry, sale: updatedSale },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;