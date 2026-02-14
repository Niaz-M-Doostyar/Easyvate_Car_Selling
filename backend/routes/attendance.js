const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { Op } = require('sequelize');

// Support both POST /mark and POST / for marking attendance
router.post('/mark', async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    
    const attendance = await Attendance.create({
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      notes
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.post('/', async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    
    const attendance = await Attendance.create({
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      notes
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Update attendance record
router.put('/:id', async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: { message: 'Attendance record not found' } });
    }
    await record.update(req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: { message: 'Attendance record not found' } });
    }
    await record.destroy();
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const where = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Employee }],
      order: [['date', 'DESC']]
    });

    res.json({ data: attendance });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/summary/:employeeId/:month/:year', async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendance = await Attendance.findAll({
      where: {
        employeeId,
        date: { [Op.between]: [startDate, endDate] }
      }
    });

    const summary = {
      present: attendance.filter(a => a.status === 'Present').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      halfDay: attendance.filter(a => a.status === 'Half Day').length,
      leave: attendance.filter(a => a.status === 'Leave').length
    };

    res.json({ data: summary });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.post('/generate-payroll', async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: { message: 'Employee not found' } });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const totalDays = endDate.getDate();
    
    const attendance = await Attendance.findAll({
      where: {
        employeeId,
        date: { [Op.between]: [startDate, endDate] }
      }
    });

    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const halfDays = attendance.filter(a => a.status === 'Half Day').length;
    const absentDays = totalDays - presentDays - halfDays;
    
    const effectiveDays = presentDays + (halfDays * 0.5);
    const calculatedSalary = (employee.monthlySalary / totalDays) * effectiveDays;
    
    const payroll = await Payroll.create({
      employeeId,
      month,
      year,
      baseSalary: employee.monthlySalary,
      presentDays,
      absentDays,
      calculatedSalary,
      commission: 0,
      deductions: 0,
      totalAmount: calculatedSalary,
      status: 'Pending'
    });

    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.get('/payroll', async (req, res) => {
  try {
    const { employeeId, month, year, status } = req.query;
    const where = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (month) where.month = month;
    if (year) where.year = year;
    if (status) where.status = status;
    
    const payroll = await Payroll.findAll({
      where,
      include: [{ model: Employee }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

router.post('/payroll/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      return res.status(404).json({ error: { message: 'Payroll not found' } });
    }

    payroll.paidAmount += amount;
    payroll.paymentDate = new Date();
    payroll.status = payroll.paidAmount >= payroll.totalAmount ? 'Paid' : 'Partial';
    payroll.paidBy = req.user.id;
    await payroll.save();

    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
