const express = require('express');
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const Vehicle = require('../models/Vehicle');
const Sale = require('../models/Sale');
const ShowroomLedger = require('../models/ShowroomLedger');
const Customer = require('../models/Customer');
const CustomerLedger = require('../models/CustomerLedger');
const SharingPerson = require('../models/SharingPerson');
const CommissionDistribution = require('../models/CommissionDistribution');
const { CREDIT_LEDGER_TYPES, normalizeSharingPersons, safeNum } = require('../src/services/partnership');

const buildPartnerKey = (customerId, personName) => customerId ? `customer-${customerId}` : `name-${personName || 'Unknown'}`;

router.get('/vehicles', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }
    
    const vehicles = await Vehicle.findAll({ where });
    const summary = {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'Available').length,
      sold: vehicles.filter(v => v.status === 'Sold').length,
      reserved: vehicles.filter(v => v.status === 'Reserved').length,
      coming: vehicles.filter(v => v.status === 'Coming').length,
      underRepair: vehicles.filter(v => v.status === 'Under Repair').length
    };
    
    res.json({ data: vehicles, summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.saleDate = { [Op.between]: [startDate, endDate] };
    }
    
    const sales = await Sale.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' }
      ]
    });

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + safeNum(s.sellingPrice), 0),
      totalProfit: sales.reduce((sum, s) => sum + safeNum(s.profit), 0),
      totalCommission: sales.reduce((sum, s) => sum + safeNum(s.commission), 0)
    };
    
    res.json({ data: sales, summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/financial', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    if (type) where.type = type;
    
    const transactions = await ShowroomLedger.findAll({ where, order: [['date', 'DESC']] });
    
    const income = transactions
      .filter(t => ['Income', 'Vehicle Sale'].includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
      
    const expenses = transactions
      .filter(t => ['Expense', 'Vehicle Purchase', 'Salary'].includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    
    const summary = {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      transactionCount: transactions.length
    };
    
    res.json({ data: transactions, summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/customer-transactions', async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;
    const where = {};
    
    if (customerId) where.customerId = customerId;
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const transactions = await CustomerLedger.findAll({
      where,
      include: [{ model: Customer }],
      order: [['date', 'DESC']]
    });
    
    res.json({ data: transactions });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/profit-loss', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.saleDate = { [Op.between]: [startDate, endDate] };
    }
    
    const sales = await Sale.findAll({ where });
    const ledger = await ShowroomLedger.findAll({
      where: {
        date: { [Op.between]: [startDate || new Date(0), endDate || new Date()] }
      }
    });
    
    const totalRevenue = sales.reduce((sum, s) => sum + safeNum(s.sellingPrice), 0);
    const totalCost = sales.reduce((sum, s) => sum + safeNum(s.totalCost), 0);
    const totalExpenses = ledger
      .filter(t => ['Expense', 'Salary'].includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    
    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalExpenses;
    
    res.json({
      data: {
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
    const sales = await Sale.findAll({
      where: {
        saleDate: { [Op.between]: [startOfDay, endOfDay] }
      }
    });
    
    const ledger = await ShowroomLedger.findAll({
      where: {
        date: { [Op.between]: [startOfDay, endOfDay] }
      }
    });
    
    res.json({
      data: {
        sales: sales.length,
        revenue: sales.reduce((sum, s) => sum + safeNum(s.sellingPrice), 0),
        transactions: ledger.length,
        cashIn: ledger.filter(t => ['Income', 'Vehicle Sale'].includes(t.type))
          .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0),
        cashOut: ledger.filter(t => ['Expense', 'Vehicle Purchase', 'Salary'].includes(t.type))
          .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Generate Financial Report PDF
router.get('/export-pdf', async (req, res) => {
  try {
    const { generateFinancialReportPdf } = require('../src/services/pdf_puppeteer');
    const path = require('path');

    // Get sales data
    const sales = await Sale.findAll();
    const revenue = sales.reduce((sum, s) => sum + safeNum(s.sellingPrice), 0);
    const profit = sales.reduce((sum, s) => sum + safeNum(s.profit), 0);
    // const commission = sales.reduce((sum, s) => sum + safeNum(s.commission), 0);

    // Get showroom ledger for balance breakdown
    const ledger = await ShowroomLedger.findAll();
    const incomeTypes = ['Income', 'Vehicle Sale', 'Loan Received'];
    const expenseTypes = ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given'];
    
    const income = ledger.filter(t => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const expenses = ledger.filter(t => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    
    // Commission is added (not subtracted)
    const commissionLedger = ledger.filter(t => t.type === 'Commission');
    const sharedTotal = commissionLedger.reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const showroomBalance = income - expenses + sharedTotal;

    // Get shared persons breakdown
    const sharedPersons = await ShowroomLedger.findAll({
      where: { type: 'Commission' },
      attributes: ['personName', [Sequelize.fn('SUM', Sequelize.col('amountInPKR')), 'total']],
      group: ['personName'],
      raw: true
    });

    const ownerBalance = showroomBalance - sharedTotal;
    const commissionFromLedger = sharedTotal;

    // Prepare report data (values already in AFN base currency)
    const reportData = {
      revenue: Math.round(revenue),
      expenses: Math.round(expenses),
      profit: Math.round(profit),
      vehiclesSold: sales.length,
      commission: Math.round(commissionFromLedger),
      showroomBalance: Math.round(showroomBalance),
      ownerBalance: Math.round(ownerBalance),
      sharedTotal: Math.round(sharedTotal),
      sharedPersons: sharedPersons.map(p => ({
        personName: p.personName,
        total: Math.round(Number(p.total || 0))
      }))
    };

    const outputDir = path.join(__dirname, '../uploads/pdf');
    const { filePath, fileName } = await generateFinancialReportPdf(reportData, outputDir);

    res.download(filePath, fileName);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Monthly aggregation report
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const months = [];
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(targetYear, month - 1, 1);
      const endDate = new Date(targetYear, month, 0);

      // Get sales for the month
      const sales = await Sale.findAll({
        where: {
          saleDate: { [Op.between]: [startDate, endDate] }
        }
      });

      // Get ledger for the month
      const ledger = await ShowroomLedger.findAll({
        where: {
          date: { [Op.between]: [startDate, endDate] }
        }
      });

      const incomeTypes = ['Income', 'Vehicle Sale', 'Loan Received'];
      const expenseTypes = ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given', 'Commission'];

      const income = ledger.filter(t => incomeTypes.includes(t.type))
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
      const expenses = ledger.filter(t => expenseTypes.includes(t.type))
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      months.push({
        month,
        monthName: new Date(targetYear, month - 1).toLocaleString('default', { month: 'long' }),
        year: targetYear,
        salesCount: sales.length,
        revenue: sales.reduce((sum, s) => sum + safeNum(s.sellingPrice), 0),
        profit: sales.reduce((sum, s) => sum + safeNum(s.profit), 0),
        income,
        expenses,
        netProfit: income - expenses
      });
    }

    res.json({ data: months });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Yearly aggregation report
router.get('/yearly', async (req, res) => {
  try {
    const { startYear, endYear } = req.query;
    const currentYear = new Date().getFullYear();
    const start = startYear ? parseInt(startYear) : currentYear - 5;
    const end = endYear ? parseInt(endYear) : currentYear;

    const years = [];
    for (let year = start; year <= end; year++) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      // Get sales for the year
      const sales = await Sale.findAll({
        where: {
          saleDate: { [Op.between]: [startDate, endDate] }
        }
      });

      // Get ledger for the year
      const ledger = await ShowroomLedger.findAll({
        where: {
          date: { [Op.between]: [startDate, endDate] }
        }
      });

      const incomeTypes = ['Income', 'Vehicle Sale', 'Loan Received'];
      const expenseTypes = ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given', 'Commission'];

      const income = ledger.filter(t => incomeTypes.includes(t.type))
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
      const expenses = ledger.filter(t => expenseTypes.includes(t.type))
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      years.push({
        year,
        salesCount: sales.length,
        revenue: sales.reduce((sum, s) => sum + safeNum(s.sellingPrice), 0),
        profit: sales.reduce((sum, s) => sum + safeNum(s.profit), 0),
        income,
        expenses,
        netProfit: income - expenses
      });
    }

    res.json({ data: years });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Commission tracking report
router.get('/commission', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const saleWhere = {};
    
    if (startDate && endDate) {
      saleWhere.saleDate = { [Op.between]: [startDate, endDate] };
    }

    const commissions = await CommissionDistribution.findAll({
      include: [
        {
          model: Sale,
          as: 'sale',
          attributes: ['id', 'saleId', 'saleDate', 'vehicleId'],
          ...(Object.keys(saleWhere).length ? { where: saleWhere, required: true } : {}),
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'phoneNumber'],
          required: false,
        },
        {
          model: SharingPerson,
          as: 'sharingPerson',
          attributes: ['id', 'investmentAmount', 'calculationMethod'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']]
    });

    const grouped = {};
    commissions.forEach((commission) => {
      const partnerName = commission.customer?.fullName || commission.personName || 'Unknown';
      const key = buildPartnerKey(commission.customerId, partnerName);

      if (!grouped[key]) {
        grouped[key] = {
          customerId: commission.customerId || null,
          personName: partnerName,
          phoneNumber: commission.customer?.phoneNumber || null,
          totalCommission: 0,
          totalInvestment: 0,
          totalSharePercentage: 0,
          count: 0,
          sales: new Set(),
          transactions: [],
        };
      }

      grouped[key].totalCommission += safeNum(commission.amount);
      grouped[key].totalInvestment += safeNum(commission.investmentAmount || commission.sharingPerson?.investmentAmount);
      grouped[key].totalSharePercentage += safeNum(commission.sharePercentage);
      grouped[key].count += 1;
      grouped[key].sales.add(commission.saleId);
      grouped[key].transactions.push({
        saleId: commission.sale?.saleId || commission.saleId,
        saleDate: commission.sale?.saleDate || commission.paidDate || commission.createdAt,
        amount: safeNum(commission.amount),
        sharePercentage: safeNum(commission.sharePercentage),
        investmentAmount: safeNum(commission.investmentAmount || commission.sharingPerson?.investmentAmount),
        status: commission.status,
      });
    });

    const summary = Object.values(grouped)
      .map((entry) => ({
        customerId: entry.customerId,
        personName: entry.personName,
        phoneNumber: entry.phoneNumber,
        totalCommission: Number(entry.totalCommission.toFixed(2)),
        totalInvestment: Number(entry.totalInvestment.toFixed(2)),
        averageSharePercentage: entry.count ? Number((entry.totalSharePercentage / entry.count).toFixed(2)) : 0,
        count: entry.count,
        salesCount: entry.sales.size,
        transactions: entry.transactions,
      }))
      .sort((a, b) => b.totalCommission - a.totalCommission);

    res.json({ data: summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/partnerships', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const hasDateRange = Boolean(startDate && endDate);

    const vehicles = await Vehicle.findAll({
      include: [{
        model: SharingPerson,
        as: 'sharingPersons',
        include: [{ model: Customer, as: 'customer', required: false }],
        required: true,
      }],
      order: [['createdAt', 'DESC']],
    });

    const allSales = await Sale.findAll({
      attributes: ['id', 'saleId', 'vehicleId', 'saleDate', 'sellingPrice', 'profit', 'commission', 'ownerShare'],
      order: [['saleDate', 'DESC']],
    });

    const filteredSales = hasDateRange
      ? allSales.filter((sale) => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= new Date(startDate) && saleDate <= new Date(`${endDate}T23:59:59.999Z`);
        })
      : allSales;

    const relevantSalesByVehicleId = new Map(filteredSales.map((sale) => [sale.vehicleId, sale]));
    const relevantSaleIds = filteredSales.map((sale) => sale.id);
    const distributions = relevantSaleIds.length
      ? await CommissionDistribution.findAll({
          where: { saleId: { [Op.in]: relevantSaleIds } },
          include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'], required: false }],
        })
      : [];

    const distributionsBySaleId = distributions.reduce((map, distribution) => {
      if (!map.has(distribution.saleId)) {
        map.set(distribution.saleId, []);
      }
      map.get(distribution.saleId).push(distribution);
      return map;
    }, new Map());

    const partnerSummary = {};
    const partnershipVehicles = vehicles
      .filter((vehicle) => !hasDateRange || vehicle.status !== 'Sold' || relevantSalesByVehicleId.has(vehicle.id))
      .map((vehicle) => {
        const partnership = normalizeSharingPersons(
          vehicle.sharingPersons.map((person) => person.get({ plain: true })),
          vehicle.totalCostPKR
        );
        const sale = relevantSalesByVehicleId.get(vehicle.id) || null;
        const vehicleDistributions = sale ? (distributionsBySaleId.get(sale.id) || []) : [];

        const partners = partnership.partners.map((partner) => {
          const partnerDistribution = vehicleDistributions.filter((distribution) => {
            if (partner.id && distribution.sharingPersonId === partner.id) {
              return true;
            }

            if (partner.customerId && distribution.customerId === partner.customerId) {
              return true;
            }

            return distribution.personName === partner.personName;
          });

          const realizedProfit = partnerDistribution.reduce((sum, distribution) => sum + safeNum(distribution.amount), 0);
          const personName = partner.customer?.fullName || partner.personName;
          const summaryKey = buildPartnerKey(partner.customerId, personName);

          if (!partnerSummary[summaryKey]) {
            partnerSummary[summaryKey] = {
              customerId: partner.customerId || null,
              personName,
              phoneNumber: partner.customer?.phoneNumber || partner.phoneNumber || null,
              activeVehicles: 0,
              soldVehicles: 0,
              totalInvestment: 0,
              totalRealizedProfit: 0,
              averageSharePercentageTotal: 0,
              entries: 0,
            };
          }

          partnerSummary[summaryKey].activeVehicles += sale ? 0 : 1;
          partnerSummary[summaryKey].soldVehicles += sale ? 1 : 0;
          partnerSummary[summaryKey].totalInvestment += safeNum(partner.investmentAmount);
          partnerSummary[summaryKey].totalRealizedProfit += realizedProfit;
          partnerSummary[summaryKey].averageSharePercentageTotal += safeNum(partner.percentage);
          partnerSummary[summaryKey].entries += 1;

          return {
            sharingPersonId: partner.id || null,
            customerId: partner.customerId || null,
            personName,
            phoneNumber: partner.customer?.phoneNumber || partner.phoneNumber || null,
            investmentAmount: safeNum(partner.investmentAmount),
            sharePercentage: safeNum(partner.percentage),
            calculationMethod: partner.calculationMethod,
            realizedProfit,
            status: sale ? 'Realized' : 'Open',
          };
        });

        return {
          id: vehicle.id,
          vehicleId: vehicle.vehicleId,
          vehicleLabel: `${vehicle.manufacturer} ${vehicle.model} (${vehicle.year})`,
          status: sale ? 'Sold' : vehicle.status,
          totalCost: safeNum(vehicle.totalCostPKR),
          calculationMethod: partnership.calculationMethod,
          partnerInvestmentTotal: safeNum(partnership.totalPartnerInvestment),
          ownerInvestment: safeNum(partnership.ownerInvestment),
          partnerPercentageTotal: safeNum(partnership.totalPartnerPercentage),
          ownerPercentage: safeNum(partnership.ownerPercentage),
          saleId: sale?.saleId || null,
          saleDate: sale?.saleDate || null,
          sellingPrice: safeNum(sale?.sellingPrice),
          totalProfit: safeNum(sale?.profit),
          realizedPartnerProfit: vehicleDistributions.reduce((sum, distribution) => sum + safeNum(distribution.amount), 0),
          ownerProfit: safeNum(sale?.ownerShare),
          partners,
        };
      });

    const partnerSummaryRows = Object.values(partnerSummary)
      .map((entry) => ({
        customerId: entry.customerId,
        personName: entry.personName,
        phoneNumber: entry.phoneNumber,
        activeVehicles: entry.activeVehicles,
        soldVehicles: entry.soldVehicles,
        totalInvestment: Number(entry.totalInvestment.toFixed(2)),
        totalRealizedProfit: Number(entry.totalRealizedProfit.toFixed(2)),
        averageSharePercentage: entry.entries ? Number((entry.averageSharePercentageTotal / entry.entries).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.totalRealizedProfit - a.totalRealizedProfit);

    const summary = {
      totalVehicles: partnershipVehicles.length,
      activeVehicles: partnershipVehicles.filter((vehicle) => !vehicle.saleId).length,
      soldVehicles: partnershipVehicles.filter((vehicle) => vehicle.saleId).length,
      totalPartnerInvestment: partnershipVehicles.reduce((sum, vehicle) => sum + vehicle.partnerInvestmentTotal, 0),
      totalRealizedPartnerProfit: partnershipVehicles.reduce((sum, vehicle) => sum + vehicle.realizedPartnerProfit, 0),
      totalOwnerProfit: partnershipVehicles.reduce((sum, vehicle) => sum + vehicle.ownerProfit, 0),
      calculationNote: 'When investment amounts are entered, partner share percentage is calculated as partner investment divided by total vehicle cost. If only percentages are entered, investment amounts are derived from the vehicle total cost.'
    };

    res.json({
      data: {
        vehicles: partnershipVehicles,
        partners: partnerSummaryRows,
      },
      summary,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Balance breakdown by shared persons
router.get('/balance-breakdown', async (req, res) => {
  try {
    const incomeTypes = ['Income', 'Vehicle Sale', 'Loan Received'];
    const expenseTypes = ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given'];
    
    const ledger = await ShowroomLedger.findAll();
    
    const income = ledger.filter(t => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const expenses = ledger.filter(t => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    
    const showroomBalance = income - expenses;

    const distributions = await CommissionDistribution.findAll({
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName'], required: false }],
    });

    const sharedByPartner = {};
    distributions.forEach((distribution) => {
      const personName = distribution.customer?.fullName || distribution.personName || 'Unknown';
      const key = buildPartnerKey(distribution.customerId, personName);

      if (!sharedByPartner[key]) {
        sharedByPartner[key] = {
          personName,
          balance: 0,
          transactionCount: 0,
        };
      }

      sharedByPartner[key].balance += safeNum(distribution.amount);
      sharedByPartner[key].transactionCount += 1;
    });

    const sharedPersons = Object.values(sharedByPartner).sort((a, b) => b.balance - a.balance);
    const sharedTotal = sharedPersons.reduce((sum, person) => sum + safeNum(person.balance), 0);
    const ownerBalance = showroomBalance - sharedTotal;

    res.json({
      data: {
        showroomBalance,
        ownerBalance,
        sharedTotal,
        sharedPersons,
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
