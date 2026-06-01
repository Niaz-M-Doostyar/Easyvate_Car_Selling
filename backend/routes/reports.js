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
const { toAFN } = require('../src/services/exchangeRate');
const { normalizeSharingPersons, safeNum } = require('../src/services/partnership');

const buildPartnerKey = (customerId, personName) =>
  customerId ? `customer-${customerId}` : `name-${personName || 'Unknown'}`;

// ─────────────────── Vehicles ───────────────────
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
      underRepair: vehicles.filter(v => v.status === 'Under Repair').length,
    };

    res.json({ data: vehicles, summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Sales (AFN) ───────────────────
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.saleDate = { [Op.between]: [startDate, endDate] };
    }

    // Fetch sales for detailed rows
    const sales = await Sale.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
      ],
    });

    // Calculate totals by converting each sale's amounts from its original currency to AFN
    let totalProfitAFN = 0;

    for (const sale of sales) {
      const currency = sale.paymentCurrency || 'AFN';

      // profit is stored in the sale's currency
      totalProfitAFN += await toAFN(sale.profit || 0, currency);
    }

    // Fetch income from showroom ledger (actual cash received)
    const ledgerWhere = { type: 'Vehicle Sale' };
    if (startDate && endDate) {
      ledgerWhere.date = { [Op.between]: [startDate, endDate] };
    }
    const ledgerEntries = await ShowroomLedger.findAll({
      where: ledgerWhere,
      attributes: ['amountInPKR'],
    });
    const totalIncomeAFN = ledgerEntries.reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    const commissionLedgerEntries = await ShowroomLedger.findAll({
      where: {
        type: 'Commission',
        ...(startDate && endDate ? { date: { [Op.between]: [startDate, endDate] } } : {}),
      },
      attributes: ['amountInPKR'],
    });
    const totalCommissionAFN = commissionLedgerEntries.reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    const summary = {
      totalSales: sales.length,
      totalIncome: Number(totalIncomeAFN.toFixed(2)),   // actual cash received
      totalProfit: Number(totalProfitAFN.toFixed(2)),    // profit from sales
      totalCommission: Number(totalCommissionAFN.toFixed(2)), // partner share
    };

    res.json({ data: sales, summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Financial (AFN) ───────────────────
router.get('/financial', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    if (type) where.type = type;

    const transactions = await ShowroomLedger.findAll({
      where,
      order: [['date', 'DESC']],
    });

    // Existing totals (unchanged)
    const income = transactions
      .filter(t => ['Vehicle Sale'].includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    const expenses = transactions
      .filter(t => ['Expense', 'Salary'].includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    // Additional categories for grossProfit / netProfit formulas
    const totalVehiclePurchases = transactions
      .filter(t => t.type === 'Vehicle Purchase')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    const totalPartnerShares = transactions
      .filter(t => t.type === 'Partner Profit')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    // Apply requested formulas
    const grossProfit = income - totalVehiclePurchases;
    const netProfit = grossProfit - expenses - totalPartnerShares;

    const summary = {
      totalIncome: income,
      totalExpenses: expenses,
      totalGrossProfit: grossProfit,
      totalNetProfit: netProfit,
      totalVehiclePurchases,
      totalPartnerShares,
      transactionCount: transactions.length,
    };

    res.json({ data: transactions, summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Customer Transactions ───────────────────
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
      order: [['date', 'DESC']],
    });

    res.json({ data: transactions });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Profit & Loss (AFN) ───────────────────
router.get('/profit-loss', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateWhere = {};
    if (startDate && endDate) {
      dateWhere.date = { [Op.between]: [startDate, endDate] };
    }

    // Fetch sums directly from ShowroomLedger (mirrors showroom/balance logic)
    const totalIncome = await ShowroomLedger.sum('amountInPKR', {
      where: { type: 'Vehicle Sale', ...dateWhere },
    }) || 0;

    const totalShowroomBalance = await ShowroomLedger.sum('amountInPKR', {
      where: { type: 'Showroom Balance', ...dateWhere },
    }) || 0;

    const totalExpenses = await ShowroomLedger.sum('amountInPKR', {
      where: { type: 'Expense', ...dateWhere },
    }) || 0;

    const totalVehiclePurchases = await ShowroomLedger.sum('amountInPKR', {
      where: { type: 'Vehicle Purchase', ...dateWhere },
    }) || 0;

    const totalOwnerWithdrawal = await ShowroomLedger.sum('amountInPKR', {
      where: { type: 'Owner Withdrawal', ...dateWhere },
    }) || 0;

    const totalCommission = await ShowroomLedger.sum('amountInPKR', {
      where: { type: 'Commission', ...dateWhere },
    }) || 0;

    const totalPartnerProfit = await ShowroomLedger.sum('amountInPKR', {
      where: { type: 'Partner Profit', ...dateWhere },
    }) || 0;

    const totalRevenue = totalIncome;
    const totalCost = totalVehiclePurchases;
    const grossProfit = totalRevenue - totalCost;
    const operatingExpenses = totalExpenses;
    const netProfit = grossProfit - operatingExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    res.json({
      data: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
        totalExpenses: Number(operatingExpenses.toFixed(2)),
        netProfit: Number(netProfit.toFixed(2)),
        profitMargin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Daily Summary (AFN) ───────────────────
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Sales for the day
    const sales = await Sale.findAll({
      where: { saleDate: { [Op.between]: [startOfDay, endOfDay] } },
    });

    // Ledger entries for the day
    const ledger = await ShowroomLedger.findAll({
      where: { date: { [Op.between]: [startOfDay, endOfDay] } },
    });

    // Revenue = sum of commission entries for the day (already AFN via amountInPKR)
    const revenueAFN = ledger
      .filter(t => t.type === 'Commission')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    // Cash In = Vehicle Sale, Loan Received, Commission
    const cashIn = ledger
      .filter(t => ['Vehicle Sale', 'Loan Received', 'Commission'].includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    // Cash Out = Expense, Vehicle Purchase, Salary, Loan Given
    const cashOut = ledger
      .filter(t => ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given'].includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    res.json({
      data: {
        sales: sales.length,
        revenue: Number(revenueAFN.toFixed(2)),
        transactions: ledger.length,
        cashIn: Number(cashIn.toFixed(2)),
        cashOut: Number(cashOut.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Export PDF (unchanged) ───────────────────
router.get('/export-pdf', async (req, res) => {
  try {
    const lang = req.query.lang || 'ps';
    const { generateFinancialReportPdf } = require('../src/services/pdf_puppeteer');
    const path = require('path');

    // Re‑use the existing toAFN helper (no need for separate rate fetching)
    const { toAFN } = require('../src/services/exchangeRate');
    const { safeNum } = require('../src/services/partnership');

    // --- 1. Sales & Ledger data ---
    const sales = await Sale.findAll({
      include: [{ model: Vehicle, as: 'vehicle' }]
    });
    const totalSales = sales.length;

    const totalAvailableVehicles = await Vehicle.count({ where: { status: 'Available' } });

    // Ledger sums (all amounts are already AFN via amountInPKR)
    const ledger = await ShowroomLedger.findAll();
    const income = ledger.filter(t => t.type === 'Vehicle Sale')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const expenses = ledger.filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const purchase = ledger.filter(t => t.type === 'Vehicle Purchase')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const commission = ledger.filter(t => t.type === 'Commission')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const balance = ledger.filter(t => t.type === 'Showroom Balance')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const ownerWithdrawals = ledger.filter(t => t.type === 'Owner Withdrawal')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const partnerProfits = ledger.filter(t => t.type === 'Partner Profit')
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

    // Main balances (AFN)
    const showroomBalanceAFN = (income + balance + commission) - (expenses + purchase + ownerWithdrawals);
    const ownerBalanceAFN = (income + commission) - (expenses + purchase + partnerProfits);
    const grossProfitAFN = income - purchase;
    const netProfitAFN = grossProfitAFN - expenses - partnerProfits;

    // --- 2. Currency conversion helpers (using toAFN) ---
    // Get how many AFN equal 1 unit of the target currency
    const rateUSD = await toAFN(1, 'USD');   // e.g. 86.5 AFN per USD
    const ratePKR = await toAFN(1, 'PKR');
    const rateAED = await toAFN(1, 'AED');

    // Convert an AFN amount to another currency (rounded to 2 decimals)
    const toUSD = (afn) => (afn / (rateUSD || 1)).toFixed(2);
    const toPKR = (afn) => (afn / (ratePKR || 1)).toFixed(2);
    const toAED = (afn) => (afn / (rateAED || 1)).toFixed(2);

    const mapValues = (obj, fn) =>
      Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));

    // --- 3. Multi‑currency summary ---
    const summaryAFN = {
      totalIncome: income,
      expenses: expenses,
      netProfit: netProfitAFN,
      grossProfit: grossProfitAFN,
      commission: commission,
      vehiclesSold: totalSales,
      availableVehicles: totalAvailableVehicles,
    };
    const summaryUSD = mapValues(summaryAFN, toUSD);
    const summaryPKR = mapValues(summaryAFN, toPKR);
    const summaryAED = mapValues(summaryAFN, toAED);

    // --- 4. Partner balances (from Customer records) ---
    const partnerCustomerIds = (
      await SharingPerson.findAll({
        attributes: ['customerId'],
        where: { customerId: { [Op.ne]: null } },
        group: ['customerId'],
      })
    ).map(p => p.customerId).filter(Boolean);

    const partnerCustomers = await Customer.findAll({
      where: { id: { [Op.in]: partnerCustomerIds } },
      attributes: ['fullName', 'balanceAFN', 'balanceUSD', 'balancePKR', 'balanceAED'],
    });

    const partnerBalances = partnerCustomers.map(cust => ({
      personName: cust.fullName,
      totalAFN: Number(cust.balanceAFN) || 0,
      totalUSD: Number(cust.balanceUSD) || 0,
      totalPKR: Number(cust.balancePKR) || 0,
      totalAED: Number(cust.balanceAED) || 0,
    }));

    // --- 5. Build report data ---
    const reportData = {
      lang,
      summary: { AFN: summaryAFN, USD: summaryUSD, PKR: summaryPKR, AED: summaryAED },
      partnerBalances,
      ownerBalance: {
        AFN: ownerBalanceAFN,
        USD: toUSD(ownerBalanceAFN),
        PKR: toPKR(ownerBalanceAFN),
        AED: toAED(ownerBalanceAFN),
      },
      showroomBalance: {
        AFN: showroomBalanceAFN,
        USD: toUSD(showroomBalanceAFN),
        PKR: toPKR(showroomBalanceAFN),
        AED: toAED(showroomBalanceAFN),
      },
    };

    // --- 6. Generate PDF ---
    const outputDir = path.join(__dirname, '../uploads/pdf');
    const { filePath, fileName } = await generateFinancialReportPdf(reportData, outputDir);
    res.download(filePath, fileName);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Monthly (AFN) ───────────────────
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const months = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(targetYear, month - 1, 1);
      const endDate = new Date(targetYear, month, 0);

      // Sales with vehicle include (to get totalCostPKR)
      const sales = await Sale.findAll({
        where: { saleDate: { [Op.between]: [startDate, endDate] } },
        include: [{ model: Vehicle, as: 'vehicle' }],
      });

      const ledger = await ShowroomLedger.findAll({
        where: { date: { [Op.between]: [startDate, endDate] } },
      });

      // Calculate revenue and profit in AFN
      let revenueAFN = 0;
      let profitAFN = 0;
      for (const sale of sales) {
        const currency = sale.paymentCurrency || 'AFN';
        const sellingAFN = await toAFN(sale.sellingPrice, currency);
        revenueAFN += sellingAFN;
        // totalCostPKR is already in AFN
        profitAFN += sellingAFN - safeNum(sale.vehicle?.totalCostPKR);
      }

      // Income = Vehicle Sale (down payments / installments)
      const income = ledger
        .filter(t => t.type === 'Vehicle Sale')
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      // Gross = Vehicle Purchase
      const gross = ledger
        .filter(t => t.type === 'Vehicle Purchase')
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      // Expenses = all operational outflows
      const expenses = ledger
        .filter(t => ['Expense', 'Salary'].includes(t.type))
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      const totalPartnerShares = ledger
        .filter(t => t.type === 'Partner Profit')
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      const grossProfit = income - gross;

      months.push({
        month,
        monthName: new Date(targetYear, month - 1).toLocaleString('default', { month: 'long' }),
        year: targetYear,
        salesCount: sales.length,
        revenue: Number(revenueAFN.toFixed(2)),
        profit: Number(grossProfit.toFixed(2)),
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        netProfit: Number((grossProfit - expenses - totalPartnerShares).toFixed(2)),
      });
    }

    res.json({ data: months });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Yearly (AFN) ───────────────────
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

      const sales = await Sale.findAll({
        where: { saleDate: { [Op.between]: [startDate, endDate] } },
        include: [{ model: Vehicle, as: 'vehicle' }],
      });

      const ledger = await ShowroomLedger.findAll({
        where: { date: { [Op.between]: [startDate, endDate] } },
      });

      let revenueAFN = 0;
      let profitAFN = 0;
      for (const sale of sales) {
        const currency = sale.paymentCurrency || 'AFN';
        const sellingAFN = await toAFN(sale.sellingPrice, currency);
        revenueAFN += sellingAFN;
        profitAFN += sellingAFN - safeNum(sale.vehicle?.totalCostPKR);
      }

      const income = ledger
        .filter(t => t.type === 'Vehicle Sale')
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      const expenses = ledger
        .filter(t => ['Expense', 'Salary'].includes(t.type))
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      const totalPartnerShares = ledger
        .filter(t => t.type === 'Partner Profit')
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      // Gross = Vehicle Purchase
      const gross = ledger
        .filter(t => t.type === 'Vehicle Purchase')
        .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);

      const grossProfit = income - gross;

      years.push({
        year,
        salesCount: sales.length,
        revenue: Number(revenueAFN.toFixed(2)),
        profit: Number(grossProfit.toFixed(2)),
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        netProfit: Number((grossProfit - expenses - totalPartnerShares).toFixed(2)),
      });
    }

    res.json({ data: years });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Commission Tracking (AFN) ───────────────────
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
          attributes: ['id', 'saleId', 'saleDate', 'vehicleId', 'paymentCurrency'],
          required: true,
          where: Object.keys(saleWhere).length ? saleWhere : undefined,
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
      order: [['createdAt', 'DESC']],
    });

    const grouped = {};
    for (const commission of commissions) {
      const currency = commission.sale?.paymentCurrency || 'AFN';
      const amountAFN = await toAFN(commission.amount, currency);

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

      grouped[key].totalCommission += amountAFN;
      grouped[key].totalInvestment += safeNum(commission.investmentAmount || commission.sharingPerson?.investmentAmount);
      grouped[key].totalSharePercentage += safeNum(commission.sharePercentage);
      grouped[key].count += 1;
      grouped[key].sales.add(commission.saleId);
      grouped[key].transactions.push({
        saleId: commission.sale?.saleId || commission.saleId,
        saleDate: commission.sale?.saleDate || commission.paidDate || commission.createdAt,
        amount: Number(amountAFN.toFixed(2)),
        sharePercentage: safeNum(commission.sharePercentage),
        investmentAmount: safeNum(commission.investmentAmount || commission.sharingPerson?.investmentAmount),
        status: commission.status,
      });
    }

    const summary = Object.values(grouped)
      .map(entry => ({
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

// ─────────────────── Partnerships (AFN) ───────────────────
router.get('/partnerships', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const hasDateRange = Boolean(startDate && endDate);

    // 1) All vehicles with sharing persons (absolute counts)
    const allVehicles = await Vehicle.findAll({
      include: [{
        model: SharingPerson,
        as: 'sharingPersons',
        include: [{ model: Customer, as: 'customer', required: false }],
        required: true,
      }],
    });

    // 2) Filtered vehicles for date range
    let filteredVehicles = allVehicles;
    if (hasDateRange) {
      const salesInRange = await Sale.findAll({
        attributes: ['id', 'vehicleId'],
        where: { saleDate: { [Op.between]: [startDate, endDate] } }
      });
      const soldVehicleIds = new Set(salesInRange.map(s => s.vehicleId));
      filteredVehicles = allVehicles.filter(v =>
        v.status !== 'Sold' || soldVehicleIds.has(v.id)
      );
    }

    // 3) Sales data
    const allSales = await Sale.findAll({
      attributes: ['id', 'saleId', 'vehicleId', 'saleDate', 'sellingPrice', 'paymentCurrency', 'profit', 'commission', 'ownerShare'],
      order: [['saleDate', 'DESC']],
    });

    const relevantSales = hasDateRange
      ? allSales.filter(sale => {
          const sd = new Date(sale.saleDate);
          return sd >= new Date(startDate) && sd <= new Date(`${endDate}T23:59:59.999Z`);
        })
      : allSales;

    const relevantSalesByVehicleId = new Map(relevantSales.map(sale => [sale.vehicleId, sale]));

    // 4) Fetch ALL partner profit entries from ShowroomLedger (AFN) for per‑partner total
    const showroomWhere = { type: 'Partner Profit' };
    if (hasDateRange) {
      showroomWhere.date = { [Op.between]: [startDate, endDate] };
    }
    const partnerProfitEntries = await ShowroomLedger.findAll({
      where: showroomWhere,
      attributes: ['personName', 'amountInPKR']
    });

    const realizedProfitMap = new Map();
    for (const entry of partnerProfitEntries) {
      const name = entry.personName;
      if (!name) continue;
      const current = realizedProfitMap.get(name) || 0;
      realizedProfitMap.set(name, current + safeNum(entry.amountInPKR));
    }

    // 5) Fetch CommissionDistribution for vehicle‑level realized profit
    const relevantSaleIds = relevantSales.map(sale => sale.id);
    const distributions = relevantSaleIds.length
      ? await CommissionDistribution.findAll({
          where: { saleId: { [Op.in]: relevantSaleIds } },
          include: [{ model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'], required: false }],
        })
      : [];

    const distributionsBySaleId = distributions.reduce((map, d) => {
      if (!map.has(d.saleId)) map.set(d.saleId, []);
      map.get(d.saleId).push(d);
      return map;
    }, new Map());

    // 6) Build partner summary and vehicle details
    const partnerSummary = {};
    const partnershipVehicles = [];

    for (const vehicle of filteredVehicles) {
      const partnership = normalizeSharingPersons(
        vehicle.sharingPersons.map(p => p.get({ plain: true })),
        vehicle.totalCostPKR
      );
      const sale = relevantSalesByVehicleId.get(vehicle.id) || null;
      const vehicleDistributions = sale ? (distributionsBySaleId.get(sale.id) || []) : [];
      const saleCurrency = sale?.paymentCurrency || 'AFN';

      // Vehicle‑level total realized profit (AFN) from its CommissionDistribution entries
      let vehicleRealizedProfitAFN = 0;
      for (const dist of vehicleDistributions) {
        vehicleRealizedProfitAFN += await toAFN(safeNum(dist.amount), saleCurrency);
      }

      const partners = [];
      for (const partner of partnership.partners) {
        const personName = partner.customer?.fullName || partner.personName;
        const summaryKey = buildPartnerKey(partner.customerId, personName);

        // Per‑partner realized profit from ShowroomLedger total (already AFN)
        const realizedProfit = realizedProfitMap.get(personName) || 0;

        if (!partnerSummary[summaryKey]) {
          partnerSummary[summaryKey] = {
            customerId: partner.customerId || null,
            personName,
            phoneNumber: partner.customer?.phoneNumber || partner.phoneNumber || null,
            activeVehicles: 0,
            soldVehicles: 0,
            totalInvestment: 0,
            averageSharePercentageTotal: 0,
            entries: 0,
          };
        }

        partnerSummary[summaryKey].activeVehicles += sale ? 0 : 1;
        partnerSummary[summaryKey].soldVehicles += sale ? 1 : 0;
        partnerSummary[summaryKey].totalInvestment += safeNum(partner.investmentAmount);
        partnerSummary[summaryKey].averageSharePercentageTotal += safeNum(partner.percentage);
        partnerSummary[summaryKey].entries += 1;

        partners.push({
          sharingPersonId: partner.id || null,
          customerId: partner.customerId || null,
          personName,
          phoneNumber: partner.customer?.phoneNumber || partner.phoneNumber || null,
          investmentAmount: safeNum(partner.investmentAmount),
          sharePercentage: safeNum(partner.percentage),
          calculationMethod: partner.calculationMethod,
          realizedProfit: Number(realizedProfit.toFixed(2)),   // individual total (all vehicles)
          status: sale ? 'Realized' : 'Open',
        });
      }

      const sellingPriceAFN = sale ? await toAFN(sale.sellingPrice, saleCurrency) : null;
      const totalProfitAFN = sale ? await toAFN(sale.profit, saleCurrency) : null;
      const ownerProfitAFN = sale ? await toAFN(sale.ownerShare, saleCurrency) : null;

      partnershipVehicles.push({
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
        sellingPrice: sellingPriceAFN,
        totalProfit: totalProfitAFN,
        realizedPartnerProfit: Number(vehicleRealizedProfitAFN.toFixed(2)), // vehicle total
        ownerProfit: ownerProfitAFN,
        partners,
      });
    }

    // 7) Absolute summary counts (unchanged)
    const absoluteSummary = {
      totalVehicles: allVehicles.length,
      activeVehicles: allVehicles.filter(v => v.status !== 'Sold').length,
      soldVehicles: allVehicles.filter(v => v.status === 'Sold').length,
    };

    // 8) Build partner summary rows (capital from customer balances)
    const partnerSummaryRows = [];
    for (const key of Object.keys(partnerSummary)) {
      const entry = partnerSummary[key];
      let totalCapital = 0;

      if (entry.customerId) {
        const customer = await Customer.findByPk(entry.customerId, {
          attributes: ['balanceAFN', 'balanceUSD', 'balancePKR', 'balanceAED'],
        });
        if (customer) {
          const afn = Number(customer.balanceAFN) || 0;
          const usd = await toAFN(Number(customer.balanceUSD) || 0, 'USD');
          const pkr = await toAFN(Number(customer.balancePKR) || 0, 'PKR');
          const aed = await toAFN(Number(customer.balanceAED) || 0, 'AED');
          totalCapital = afn + usd + pkr + aed;
        }
      } else {
        totalCapital = entry.totalInvestment;
      }

      partnerSummaryRows.push({
        customerId: entry.customerId,
        personName: entry.personName,
        phoneNumber: entry.phoneNumber,
        activeVehicles: entry.activeVehicles,
        soldVehicles: entry.soldVehicles,
        totalInvestment: Number(entry.totalInvestment.toFixed(2)),
        totalRealizedProfit: Number(realizedProfitMap.get(entry.personName) || 0).toFixed(2),
        totalCapital: Number(totalCapital.toFixed(2)),
        averageSharePercentage: entry.entries
          ? Number((entry.averageSharePercentageTotal / entry.entries).toFixed(2))
          : 0,
      });
    }

    partnerSummaryRows.sort((a, b) => b.totalRealizedProfit - a.totalRealizedProfit);

    const totalPartnerCapital = partnerSummaryRows.reduce((sum, p) => sum + p.totalCapital, 0);
    const totalRealizedPartnerProfit = partnerSummaryRows.reduce((sum, p) => sum + parseFloat(p.totalRealizedProfit), 0);

    const summary = {
      ...absoluteSummary,
      totalPartnerInvestment: partnershipVehicles.reduce((sum, v) => sum + v.partnerInvestmentTotal, 0),
      totalRealizedPartnerProfit: Number(totalRealizedPartnerProfit.toFixed(2)),
      totalOwnerProfit: partnershipVehicles.reduce((sum, v) => sum + v.ownerProfit, 0),
      totalPartnerCapital: Number(totalPartnerCapital.toFixed(2)),
      calculationNote: 'Partner Capital = customer balance (investments + profits – withdrawals – losses). Realized Profit per partner = sum of Partner Profit. Vehicle totals are from commission distributions for that sale.',
    };

    res.json({
      data: { vehicles: partnershipVehicles, partners: partnerSummaryRows },
      summary,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// ─────────────────── Balance Breakdown ───────────────────
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
    distributions.forEach(dist => {
      const personName = dist.customer?.fullName || dist.personName || 'Unknown';
      const key = buildPartnerKey(dist.customerId, personName);
      if (!sharedByPartner[key]) {
        sharedByPartner[key] = { personName, balance: 0, transactionCount: 0 };
      }
      sharedByPartner[key].balance += safeNum(dist.amount);
      sharedByPartner[key].transactionCount += 1;
    });

    const sharedPersons = Object.values(sharedByPartner).sort((a, b) => b.balance - a.balance);
    const sharedTotal = sharedPersons.reduce((sum, p) => sum + safeNum(p.balance), 0);
    const ownerBalance = showroomBalance - sharedTotal;

    res.json({
      data: { showroomBalance, ownerBalance, sharedTotal, sharedPersons },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;