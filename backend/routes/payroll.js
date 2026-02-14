const express = require('express');
const router = express.Router();
const { verifyToken } = require('../src/middleware/auth');
const { checkPermission } = require('../src/middleware/permissions');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const ShowroomLedger = require('../models/ShowroomLedger');
const LedgerTransaction = require('../models/LedgerTransaction');
const { toAFN } = require('../src/services/exchangeRate');
const {
  calculatePayroll,
  generatePayroll,
  generateBulkPayroll,
  markPayrollPaid
} = require('../src/services/payroll');

// Get all payroll records
router.get('/', verifyToken, checkPermission('payroll', 'read'), async (req, res) => {
  try {
    const { month, year, employeeId, status } = req.query;
    const where = {};

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (status) where.status = status;

    const payrolls = await Payroll.findAll({
      where,
      include: [{ model: Employee }],
      order: [['year', 'DESC'], ['month', 'DESC'], ['id', 'DESC']]
    });

    res.json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single payroll
router.get('/:id', verifyToken, checkPermission('payroll', 'read'), async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [{ model: Employee }]
    });

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate payroll preview (doesn't save)
router.post('/calculate', verifyToken, checkPermission('payroll', 'read'), async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ error: 'employeeId, month, and year are required' });
    }

    const calculation = await calculatePayroll(
      parseInt(employeeId),
      parseInt(month),
      parseInt(year)
    );

    res.json({ success: true, data: calculation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate payroll for a single employee
router.post('/generate', verifyToken, checkPermission('payroll', 'create'), async (req, res) => {
  try {
    const { employeeId, month, year, commission, deductions, notes } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ error: 'employeeId, month, and year are required' });
    }

    const result = await generatePayroll(
      parseInt(employeeId),
      parseInt(month),
      parseInt(year),
      parseFloat(commission || 0),
      parseFloat(deductions || 0),
      notes || '',
      req.user.id
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate payroll for all employees
router.post('/generate-bulk', verifyToken, checkPermission('payroll', 'create'), async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' });
    }

    const result = await generateBulkPayroll(
      parseInt(month),
      parseInt(year),
      req.user.id
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark payroll as paid
router.post('/:id/pay', verifyToken, checkPermission('payroll', 'update'), async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const payroll = await markPayrollPaid(
      parseInt(req.params.id),
      parseFloat(amount),
      req.user.id
    );

    // Create ledger entries
    const employee = await Employee.findByPk(payroll.employeeId);
    
    const transactionId = `TR${Date.now()}_SALARY_${payroll.id}`;
    
    await LedgerTransaction.create({
      transactionId,
      transactionType: 'Salary',
      amount: parseFloat(amount),
      currency: 'AFN',
      amountPKR: parseFloat(amount) * 3.2,
      relatedEntityType: 'Payroll',
      relatedEntityId: payroll.id,
      description: `Salary payment for ${employee.fullName} - ${payroll.month}/${payroll.year}`,
      transactionDate: new Date(),
      createdBy: req.user.id
    });

    await ShowroomLedger.create({
      type: 'Salary',
      amount: parseFloat(amount),
      currency: 'AFN',
      amountInPKR: parseFloat(amount) * 3.2,
      description: `Salary for ${employee.fullName}`,
      date: new Date(),
      referenceId: payroll.id,
      referenceType: 'Payroll',
      addedBy: req.user.id
    });

    res.json({ success: true, data: payroll, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payroll (adjust commission/deductions)
router.put('/:id', verifyToken, checkPermission('payroll', 'update'), async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    if (payroll.status === 'Paid') {
      return res.status(400).json({ error: 'Cannot update paid payroll' });
    }

    const { commission, deductions, notes } = req.body;

    const totalAmount = parseFloat(payroll.calculatedSalary) + 
                       parseFloat(commission || payroll.commission) - 
                       parseFloat(deductions || payroll.deductions);

    await payroll.update({
      commission: parseFloat(commission !== undefined ? commission : payroll.commission),
      deductions: parseFloat(deductions !== undefined ? deductions : payroll.deductions),
      totalAmount,
      notes: notes !== undefined ? notes : payroll.notes
    });

    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payroll (only if not paid)
router.delete('/:id', verifyToken, checkPermission('payroll', 'delete'), async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    if (payroll.status === 'Paid' || payroll.status === 'Partial') {
      return res.status(400).json({ error: 'Cannot delete paid or partially paid payroll' });
    }

    await payroll.destroy();

    res.json({ success: true, message: 'Payroll deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payroll summary
router.get('/summary/:month/:year', verifyToken, checkPermission('payroll', 'read'), async (req, res) => {
  try {
    const { month, year } = req.params;

    const payrolls = await Payroll.findAll({
      where: {
        month: parseInt(month),
        year: parseInt(year)
      },
      include: [{ model: Employee }]
    });

    const summary = {
      totalEmployees: payrolls.length,
      totalSalary: payrolls.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0),
      totalPaid: payrolls.reduce((sum, p) => sum + parseFloat(p.paidAmount), 0),
      totalPending: payrolls.reduce((sum, p) => {
        return sum + (parseFloat(p.totalAmount) - parseFloat(p.paidAmount));
      }, 0),
      paid: payrolls.filter(p => p.status === 'Paid').length,
      pending: payrolls.filter(p => p.status === 'Pending').length,
      partial: payrolls.filter(p => p.status === 'Partial').length
    };

    res.json({ success: true, data: { summary, payrolls } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
