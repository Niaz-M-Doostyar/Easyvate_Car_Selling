const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Vehicle = require('../models/Vehicle');
const Sale = require('../models/Sale');
const ShowroomLedger = require('../models/ShowroomLedger');
const Customer = require('../models/Customer');
const CustomerLedger = require('../models/CustomerLedger');

// Helper: safely parse a numeric value, returning 0 for null/undefined/NaN
const safeNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

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
      include: [{ model: Customer, as: 'customer' }],
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
    const { generateFinancialReportPdf } = require('../src/services/pdf');
    const path = require('path');

    // Get sales data
    const sales = await Sale.findAll();
    const revenue = sales.reduce((sum, s) => sum + safeNum(s.sellingPrice), 0);
    const profit = sales.reduce((sum, s) => sum + safeNum(s.profit), 0);
    const commission = sales.reduce((sum, s) => sum + safeNum(s.commission), 0);

    // Get showroom balance
    const incomeTypes = ['Income', 'Vehicle Sale', 'Loan Received'];
    const expenseTypes = ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given', 'Commission'];
    
    const ledger = await ShowroomLedger.findAll();
    const income = ledger.filter(t => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const expenses = ledger.filter(t => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    
    const showroomBalance = income - expenses;

    // Get shared persons breakdown
    const sharedPersons = await ShowroomLedger.findAll({
      where: { type: 'Commission' },
      attributes: ['personName', [require('sequelize').fn('SUM', require('sequelize').col('amountInPKR')), 'total']],
      group: ['personName'],
      raw: true
    });

    const sharedTotal = sharedPersons.reduce((sum, p) => sum + safeNum(p.total), 0);
    const ownerBalance = showroomBalance - sharedTotal;

    // Prepare report data (values already in AFN base currency)
    const reportData = {
      revenue: Math.round(revenue),
      expenses: Math.round(expenses),
      profit: Math.round(profit),
      vehiclesSold: sales.length,
      commission: Math.round(commission),
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
    const where = {};
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const commissions = await ShowroomLedger.findAll({
      where: {
        type: 'Commission',
        ...where
      },
      order: [['date', 'DESC']]
    });

    // Group by person
    const grouped = {};
    commissions.forEach(c => {
      const name = c.personName || 'Unknown';
      if (!grouped[name]) {
        grouped[name] = {
          personName: name,
          totalCommission: 0,
          count: 0,
          transactions: []
        };
      }
      grouped[name].totalCommission += safeNum(c.amountInPKR);
      grouped[name].count++;
      grouped[name].transactions.push({
        date: c.date,
        amount: c.amountInPKR,
        description: c.description
      });
    });

    const summary = Object.values(grouped);

    res.json({ data: summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Balance breakdown by shared persons
router.get('/balance-breakdown', async (req, res) => {
  try {
    const incomeTypes = ['Income', 'Vehicle Sale', 'Loan Received'];
    const expenseTypes = ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given', 'Commission'];
    
    const ledger = await ShowroomLedger.findAll();
    
    const income = ledger.filter(t => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    const expenses = ledger.filter(t => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + safeNum(t.amountInPKR), 0);
    
    const showroomBalance = income - expenses;

    // Get shared persons breakdown
    const sharedPersons = await ShowroomLedger.findAll({
      where: { type: 'Commission', personName: { [Op.not]: null } },
      attributes: [
        'personName', 
        [require('sequelize').fn('SUM', require('sequelize').col('amountInPKR')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['personName'],
      raw: true
    });

    const sharedTotal = sharedPersons.reduce((sum, p) => sum + safeNum(p.total), 0);
    const ownerBalance = showroomBalance - sharedTotal;

    res.json({
      data: {
        showroomBalance,
        ownerBalance,
        sharedTotal,
        sharedPersons: sharedPersons.map(p => ({
          personName: p.personName,
          balance: safeNum(p.total),
          transactionCount: safeNum(p.count)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
