const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Loan = require('../models/Loan');
const ShowroomLedger = require('../models/ShowroomLedger');
const Customer = require('../models/Customer');
const { toAFN, saveDailyRates } = require('../src/services/exchangeRate');

router.get('/', async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.borrowDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    const loans = await Loan.findAll({ where, order: [['borrowDate', 'DESC']] });
    res.json({ data: loans });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.post('/', async (req, res) => {
  try {
    const { personName, customerId, amount, currency, borrowDate, type, notes } = req.body;
    const customer = customerId ? await Customer.findByPk(customerId) : null;
    const resolvedPersonName = customer?.fullName || personName;
    if (!resolvedPersonName) {
      return res.status(400).json({ error: { message: 'A customer is required for this loan entry' } });
    }

    await saveDailyRates(req.user?.id);
    const converted = await toAFN(amount, currency || 'AFN');

    const loan = await Loan.create({
      personName: resolvedPersonName,
      amount,
      currency: currency || 'AFN',
      amountInAFN: converted.amountAFN,
      exchangeRateUsed: converted.rate,
      customerId: customer?.id || null,
      borrowDate,
      type,
      status: 'Open',
      notes,
      addedBy: req.user.id
    });

    await ShowroomLedger.create({
      type: type === 'Borrowed' || type === 'Owner Loan' ? 'Loan Received' : 'Loan Given',
      amount,
      currency: currency || 'AFN',
      amountInAFN: converted.amountAFN,
      exchangeRateUsed: converted.rate,
      description: `${type} - ${resolvedPersonName}`,
      date: borrowDate,
      referenceId: loan.id,
      referenceType: 'Loan',
      personName: resolvedPersonName,
      personId: customer?.id || null,
      addedBy: req.user.id
    });

    res.status(201).json({ data: loan });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Update loan
router.put('/:id', async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }
    
    const { personName, customerId, amount, currency, borrowDate, type, status, notes } = req.body;
    const customer = customerId ? await Customer.findByPk(customerId) : null;
    const resolvedPersonName = customer?.fullName || personName || loan.personName;
    const finalCurrency = currency || loan.currency || 'AFN';
    await saveDailyRates(req.user?.id);
    const converted = amount !== undefined ? await toAFN(amount, finalCurrency) : null;
    const nextType = type || loan.type;

    await loan.update({
      personName: resolvedPersonName,
      customerId: customerId !== undefined ? (customer?.id || null) : loan.customerId,
      amount: amount !== undefined ? Number(amount) : loan.amount,
      currency: finalCurrency,
      amountInAFN: converted ? converted.amountAFN : loan.amountInAFN,
      exchangeRateUsed: converted ? converted.rate : loan.exchangeRateUsed,
      borrowDate: borrowDate || loan.borrowDate,
      type: nextType,
      status: status || loan.status,
      notes: notes !== undefined ? notes : loan.notes,
    });

    await ShowroomLedger.update({
      type: nextType === 'Borrowed' || nextType === 'Owner Loan' ? 'Loan Received' : 'Loan Given',
      amount: amount !== undefined ? Number(amount) : loan.amount,
      currency: finalCurrency,
      amountInAFN: converted ? converted.amountAFN : loan.amountInAFN,
      exchangeRateUsed: converted ? converted.rate : loan.exchangeRateUsed,
      description: `${nextType} - ${resolvedPersonName}`,
      date: borrowDate || loan.borrowDate,
      personName: resolvedPersonName,
      personId: customerId !== undefined ? (customer?.id || null) : loan.customerId,
    }, { where: { referenceType: 'Loan', referenceId: loan.id } });

    res.json({ data: loan });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Mark loan as paid (both POST and PATCH for compatibility)
router.post('/:id/mark-paid', async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    loan.status = 'Paid';
    await loan.save();

    res.json({ data: loan });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Also support PATCH method for mark-paid
router.patch('/:id/mark-paid', async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }

    loan.status = 'Paid';
    await loan.save();

    res.json({ data: loan });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Delete loan
router.delete('/:id', async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ error: { message: 'Loan not found' } });
    }
    
    // Delete related ledger entries
    await ShowroomLedger.destroy({ where: { referenceType: 'Loan', referenceId: loan.id } });
    
    // Delete loan
    await loan.destroy();
    
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
