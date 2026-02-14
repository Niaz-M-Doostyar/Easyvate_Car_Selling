const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const LedgerTransaction = require('../models/LedgerTransaction');
const { toAFN } = require('../src/services/exchangeRate');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    const employees = await Employee.findAll({
      where,
      order: [['joiningDate', 'DESC']]
    });
    
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee
router.post('/', async (req, res) => {
  try {
    // Generate employee ID
    const count = await Employee.count();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
    
    const employee = await Employee.create({
      employeeId,
      ...req.body
    });
    
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee (soft delete by setting status to Inactive)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    await employee.update({ status: 'Inactive' });
    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process payroll
router.post('/payroll', async (req, res) => {
  try {
    const { employeeId, month, year, bonuses, deductions, paymentDate } = req.body;
    
    const employee = await Employee.findOne({ where: { employeeId } });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const totalSalary = employee.monthlySalary + (bonuses || 0) - (deductions || 0);
    
    const transactionId = `TR${Date.now()}`;
    
    const transaction = await LedgerTransaction.create({
      transactionId,
      transactionType: 'Salary',
      amount: totalSalary,
      currency: 'AFN',
      amountPKR: toAFN(totalSalary, 'AFN'),
      relatedEntityType: 'Employee',
      relatedEntityId: employee.id,
      description: `Salary for ${employee.fullName} - ${month}/${year}`,
      transactionDate: paymentDate || new Date(),
      createdBy: req.user.id
    });
    
    res.status(201).json({
      employee,
      transaction,
      payrollDetails: {
        baseSalary: employee.monthlySalary,
        bonuses: bonuses || 0,
        deductions: deductions || 0,
        totalPaid: totalSalary,
        month,
        year
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get salary history for employee
router.get('/:id/salary-history', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const salaryHistory = await LedgerTransaction.findAll({
      where: {
        transactionType: 'Salary',
        relatedEntityType: 'Employee',
        relatedEntityId: employee.id
      },
      order: [['transactionDate', 'DESC']]
    });
    
    res.json(salaryHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
