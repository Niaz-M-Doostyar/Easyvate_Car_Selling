const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Loan = require('../models/Loan');
const ShowroomLedger = require('../models/ShowroomLedger');
const { toAFN } = require('../src/services/exchangeRate');

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
    const { personName, amount, currency, borrowDate, type, notes } = req.body;
    const amountInPKR = toAFN(amount, currency || 'AFN');

    const loan = await Loan.create({
      personName,
      amount,
      currency: currency || 'AFN',
      amountInPKR,
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
      amountInPKR,
      description: `${type} - ${personName}`,
      date: borrowDate,
      referenceId: loan.id,
      referenceType: 'Loan',
      personName,
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
    
    await loan.update(req.body);
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
