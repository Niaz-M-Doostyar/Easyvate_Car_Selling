const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const CurrencyExchange = require('../models/CurrencyExchange');
const ShowroomLedger = require('../models/ShowroomLedger');
const LedgerTransaction = require('../models/LedgerTransaction');
const ExchangeRate = require('../models/ExchangeRate');
const { toAFN, getRates, clearCache } = require('../src/services/exchangeRate');

router.post('/exchange', async (req, res) => {
  try {
    const { fromCurrency, toCurrency, fromAmount, exchangeRate, notes } = req.body;
    
    if (!fromCurrency || !toCurrency || !fromAmount || !exchangeRate) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    if (fromCurrency === toCurrency) {
      return res.status(400).json({ error: { message: 'Cannot exchange same currency' } });
    }

    const toAmount = parseFloat(fromAmount) * parseFloat(exchangeRate);
    
    // Create exchange record
    const exchange = await CurrencyExchange.create({
      fromCurrency,
      toCurrency,
      fromAmount: parseFloat(fromAmount),
      toAmount,
      exchangeRate: parseFloat(exchangeRate),
      date: new Date(),
      notes,
      addedBy: req.user.id
    });

    // Create ledger transaction for outgoing currency (debit)
    const transactionIdOut = `TR${Date.now()}_EX_OUT`;
    await LedgerTransaction.create({
      transactionId: transactionIdOut,
      transactionType: 'Currency Exchange',
      amount: parseFloat(fromAmount),
      currency: fromCurrency,
      amountPKR: toAFN(parseFloat(fromAmount), fromCurrency),
      relatedEntityType: 'CurrencyExchange',
      relatedEntityId: exchange.id,
      description: `Exchange out: ${fromAmount} ${fromCurrency}`,
      transactionDate: new Date(),
      createdBy: req.user.id
    });

    // Create ledger transaction for incoming currency (credit)
    const transactionIdIn = `TR${Date.now()}_EX_IN`;
    await LedgerTransaction.create({
      transactionId: transactionIdIn,
      transactionType: 'Currency Exchange',
      amount: toAmount,
      currency: toCurrency,
      amountPKR: toAFN(toAmount, toCurrency),
      relatedEntityType: 'CurrencyExchange',
      relatedEntityId: exchange.id,
      description: `Exchange in: ${toAmount} ${toCurrency}`,
      transactionDate: new Date(),
      createdBy: req.user.id
    });

    // Create showroom ledger entries (debit from currency, credit to currency)
    await ShowroomLedger.create({
      type: 'Currency Exchange',
      amount: parseFloat(fromAmount),
      currency: fromCurrency,
      amountInPKR: -toAFN(parseFloat(fromAmount), fromCurrency), // Negative for outgoing
      description: `Exchange: ${fromAmount} ${fromCurrency} → ${toAmount} ${toCurrency}`,
      date: new Date(),
      referenceId: exchange.id,
      referenceType: 'CurrencyExchange',
      addedBy: req.user.id
    });

    await ShowroomLedger.create({
      type: 'Currency Exchange',
      amount: toAmount,
      currency: toCurrency,
      amountInPKR: toAFN(toAmount, toCurrency), // Positive for incoming
      description: `Exchange: ${fromAmount} ${fromCurrency} → ${toAmount} ${toCurrency}`,
      date: new Date(),
      referenceId: exchange.id,
      referenceType: 'CurrencyExchange',
      addedBy: req.user.id
    });

    res.json({ success: true, data: exchange, message: 'Currency exchange completed successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/exchanges', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    const exchanges = await CurrencyExchange.findAll({ where, order: [['date', 'DESC']] });
    res.json({ data: exchanges });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/rates', async (req, res) => {
  try {
    const baseRates = await getRates();
    
    // Build all currency pairs
    const rates = {};
    const currencies = Object.keys(baseRates);
    
    currencies.forEach(from => {
      currencies.forEach(to => {
        if (from !== to) {
          const key = `${from}-${to}`;
          if (from === 'AFN') {
            rates[key] = 1 / baseRates[to];
          } else if (to === 'AFN') {
            rates[key] = baseRates[from];
          } else {
            rates[key] = baseRates[from] / baseRates[to];
          }
        }
      });
    });
    
    res.json({ data: rates });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Update exchange record
router.put('/exchanges/:id', async (req, res) => {
  try {
    const exchange = await CurrencyExchange.findByPk(req.params.id);
    if (!exchange) {
      return res.status(404).json({ error: { message: 'Exchange record not found' } });
    }
    await exchange.update(req.body);
    res.json({ success: true, data: exchange });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Delete exchange record
router.delete('/exchanges/:id', async (req, res) => {
  try {
    const exchange = await CurrencyExchange.findByPk(req.params.id);
    if (!exchange) {
      return res.status(404).json({ error: { message: 'Exchange record not found' } });
    }
    // Delete related ledger entries
    await LedgerTransaction.destroy({ where: { relatedEntityType: 'CurrencyExchange', relatedEntityId: exchange.id } });
    await ShowroomLedger.destroy({ where: { referenceType: 'CurrencyExchange', referenceId: exchange.id } });
    await exchange.destroy();
    res.json({ message: 'Exchange record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Get current exchange rate settings
router.get('/settings', async (req, res) => {
  try {
    const rates = await ExchangeRate.findAll({
      where: { isActive: true },
      order: [['currency', 'ASC']]
    });
    res.json({ data: rates });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Update exchange rate
router.put('/settings/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const { rateToAFN } = req.body;

    if (!rateToAFN || rateToAFN <= 0) {
      return res.status(400).json({ error: { message: 'Invalid rate value' } });
    }

    let rate = await ExchangeRate.findOne({ where: { currency } });
    
    if (rate) {
      await rate.update({ 
        rateToAFN: parseFloat(rateToAFN),
        effectiveDate: new Date(),
        updatedBy: req.user.id
      });
    } else {
      rate = await ExchangeRate.create({
        currency,
        rateToAFN: parseFloat(rateToAFN),
        isActive: true,
        updatedBy: req.user.id
      });
    }

    clearCache();
    res.json({ success: true, data: rate, message: 'Exchange rate updated successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
