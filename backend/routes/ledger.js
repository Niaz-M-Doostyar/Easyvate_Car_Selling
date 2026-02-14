const express = require('express');
const router = express.Router();
const LedgerTransaction = require('../models/LedgerTransaction');
const ShowroomLedger = require('../models/ShowroomLedger');
const { Op, Sequelize } = require('sequelize');

const exchangeRates = {
  USD: 70,
  PKR: 0.29,
  AFN: 1
};

const toAFN = (amount, currency) => {
  const rate = exchangeRates[currency] || 1;
  return Number(amount || 0) * rate;
};

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, transactionType } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
      where.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (transactionType) {
      where.transactionType = transactionType;
    }
    
    const transactions = await LedgerTransaction.findAll({
      where,
      order: [['transactionDate', 'DESC']]
    });
    
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get balance summary
router.get('/balance', async (req, res) => {
  try {
    // Total income
    const income = await LedgerTransaction.sum('amountPKR', {
      where: {
        transactionType: {
          [Op.in]: ['Credit', 'Vehicle Sale', 'Currency Exchange']
        }
      }
    }) || 0;
    
    // Total expenses
    const expenses = await LedgerTransaction.sum('amountPKR', {
      where: {
        transactionType: {
          [Op.in]: ['Debit', 'Vehicle Purchase', 'Expense', 'Salary', 'Commission', 'Loan']
        }
      }
    }) || 0;
    
    // Current balance
    const balance = income - expenses;
    
    // Get detailed breakdown
    const breakdown = await LedgerTransaction.findAll({
      attributes: [
        'transactionType',
        [Sequelize.fn('SUM', Sequelize.col('amountPKR')), 'total'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['transactionType']
    });
    
    res.json({
      balance,
      income,
      expenses,
      breakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly summary
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    
    const yearFilter = year ? parseInt(year) : new Date().getFullYear();
    
    const monthlySummary = await LedgerTransaction.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('transactionDate')), 'month'],
        [Sequelize.fn('YEAR', Sequelize.col('transactionDate')), 'year'],
        'transactionType',
        [Sequelize.fn('SUM', Sequelize.col('amountPKR')), 'total']
      ],
      where: Sequelize.where(
        Sequelize.fn('YEAR', Sequelize.col('transactionDate')),
        yearFilter
      ),
      group: ['month', 'year', 'transactionType'],
      order: [[Sequelize.fn('MONTH', Sequelize.col('transactionDate')), 'ASC']]
    });
    
    res.json(monthlySummary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get yearly summary
router.get('/yearly', async (req, res) => {
  try {
    const yearlySummary = await LedgerTransaction.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('transactionDate')), 'year'],
        'transactionType',
        [Sequelize.fn('SUM', Sequelize.col('amountPKR')), 'total']
      ],
      group: ['year', 'transactionType'],
      order: [[Sequelize.fn('YEAR', Sequelize.col('transactionDate')), 'ASC']]
    });
    
    res.json({ data: yearlySummary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/showroom', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (type) {
      where.type = type;
    }
    const ledger = await ShowroomLedger.findAll({ where, order: [['date', 'DESC']] });
    res.json({ success: true, data: ledger });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/showroom/balance', async (req, res) => {
  try {
    const income = await ShowroomLedger.sum('amountInPKR', {
      where: { type: { [Op.in]: ['Income', 'Vehicle Sale', 'Loan Received'] } }
    }) || 0;

    const expenses = await ShowroomLedger.sum('amountInPKR', {
      where: { type: { [Op.in]: ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given', 'Commission'] } }
    }) || 0;

    const balance = income - expenses;

    const sharedPersons = await ShowroomLedger.findAll({
      where: { type: 'Commission' },
      attributes: ['personName', [Sequelize.fn('SUM', Sequelize.col('amountInPKR')), 'total']],
      group: ['personName']
    });

    const sharedTotal = sharedPersons.reduce((sum, p) => sum + Number(p.get('total') || 0), 0);
    const ownerBalance = balance - sharedTotal;

    res.json({ balance, income, expenses, ownerBalance, sharedPersons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const target = date ? new Date(date) : new Date();
    const start = new Date(target.setHours(0, 0, 0, 0));
    const end = new Date(target.setHours(23, 59, 59, 999));

    const ledger = await ShowroomLedger.findAll({
      where: { date: { [Op.between]: [start, end] } }
    });

    const cashIn = ledger
      .filter(t => ['Income', 'Vehicle Sale', 'Loan Received'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amountInPKR || 0), 0);
    const cashOut = ledger
      .filter(t => ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given', 'Commission'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amountInPKR || 0), 0);

    res.json({ date: start, cashIn, cashOut, net: cashIn - cashOut, transactions: ledger.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/showroom/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const yearFilter = year ? parseInt(year, 10) : new Date().getFullYear();

    const summary = await ShowroomLedger.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
        [Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
        'type',
        [Sequelize.fn('SUM', Sequelize.col('amountInPKR')), 'total']
      ],
      where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), yearFilter),
      group: ['month', 'year', 'type'],
      order: [[Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']]
    });

    res.json({ data: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/showroom/yearly', async (req, res) => {
  try {
    const summary = await ShowroomLedger.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
        'type',
        [Sequelize.fn('SUM', Sequelize.col('amountInPKR')), 'total']
      ],
      group: ['year', 'type'],
      order: [[Sequelize.fn('YEAR', Sequelize.col('date')), 'ASC']]
    });

    res.json({ data: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/time-balance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date();

    const ledger = await ShowroomLedger.findAll({
      where: { date: { [Op.between]: [start, end] } }
    });

    const income = ledger
      .filter(t => ['Income', 'Vehicle Sale', 'Loan Received'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amountInPKR || 0), 0);
    const expenses = ledger
      .filter(t => ['Expense', 'Vehicle Purchase', 'Salary', 'Loan Given', 'Commission'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amountInPKR || 0), 0);

    res.json({ startDate: start, endDate: end, income, expenses, balance: income - expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create showroom ledger entry
router.post('/showroom', async (req, res) => {
  try {
    const { type, personName, amount, currency, date, description } = req.body;
    
    const finalCurrency = currency || 'AFN';
    const amountInPKR = toAFN(amount, finalCurrency);
    
    const entry = await ShowroomLedger.create({
      type,
      personName: personName || null,
      amount: Number(amount),
      currency: finalCurrency,
      amountInPKR,
      date: date || new Date(),
      description
    });
    
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update showroom ledger entry
router.put('/showroom/:id', async (req, res) => {
  try {
    const entry = await ShowroomLedger.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Showroom ledger entry not found' });
    }
    
    const { type, personName, amount, currency, date, description } = req.body;
    const finalCurrency = currency || entry.currency || 'AFN';
    const amountInPKR = amount ? toAFN(amount, finalCurrency) : entry.amountInPKR;
    
    await entry.update({
      type: type || entry.type,
      personName: personName !== undefined ? personName : entry.personName,
      amount: amount ? Number(amount) : entry.amount,
      currency: finalCurrency,
      amountInPKR,
      date: date || entry.date,
      description: description !== undefined ? description : entry.description
    });
    
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete showroom ledger entry
router.delete('/showroom/:id', async (req, res) => {
  try {
    const entry = await ShowroomLedger.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Showroom ledger entry not found' });
    }
    await entry.destroy();
    res.json({ message: 'Showroom ledger entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const {
      transactionType,
      amount,
      currency,
      relatedEntityType,
      relatedEntityId,
      description,
      transactionDate
    } = req.body;
    
    const finalCurrency = currency || 'AFN';
    const amountPKR = toAFN(amount, finalCurrency);
    
    const transactionId = `TR${Date.now()}`;
    
    const transaction = await LedgerTransaction.create({
      transactionId,
      transactionType,
      amount,
      currency: finalCurrency,
      amountPKR,
      relatedEntityType,
      relatedEntityId,
      description,
      transactionDate,
      createdBy: req.user.id
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Currency exchange
router.post('/exchange', async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount, exchangeRate, description } = req.body;
    
    const transactionId = `TR${Date.now()}`;
    
    const transaction = await LedgerTransaction.create({
      transactionId,
      transactionType: 'Currency Exchange',
      amount,
      currency: fromCurrency,
      amountPKR: toAFN(amount, fromCurrency || 'AFN'),
      description: `${description} - ${fromCurrency} to ${toCurrency}`,
      transactionDate: new Date(),
      createdBy: req.user.id
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
