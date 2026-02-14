const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { Op } = require('sequelize');

// Get all monthly attendance reports
router.get('/', async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    const where = {};

    if (employeeId) where.employeeId = employeeId;
    if (month) where.month = month;
    if (year) where.year = year;

    const reports = await Attendance.findAll({
      where,
      include: [{ model: Employee }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({ data: reports });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Create monthly attendance report
router.post('/', async (req, res) => {
  try {
    const { employeeId, month, year, presentDays, absentDays, notes } = req.body;

    if (!employeeId || !month || !year || presentDays === undefined) {
      return res.status(400).json({ error: { message: 'Employee, month, year, and present days are required' } });
    }

    // Check if report already exists for this employee/month/year
    const existing = await Attendance.findOne({
      where: { employeeId, month, year }
    });
    if (existing) {
      return res.status(409).json({ error: { message: 'Attendance report already exists for this employee in the selected month/year. Please edit the existing record.' } });
    }

    const report = await Attendance.create({
      employeeId,
      month,
      year,
      presentDays: parseInt(presentDays) || 0,
      absentDays: parseInt(absentDays) || 0,
      notes
    });

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Update monthly attendance report
router.put('/:id', async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: { message: 'Attendance report not found' } });
    }

    const { employeeId, month, year, presentDays, absentDays, notes } = req.body;

    // If changing employee/month/year, check for duplicate
    if (employeeId !== record.employeeId || month !== record.month || year !== record.year) {
      const existing = await Attendance.findOne({
        where: {
          employeeId: employeeId || record.employeeId,
          month: month || record.month,
          year: year || record.year,
          id: { [Op.ne]: record.id }
        }
      });
      if (existing) {
        return res.status(409).json({ error: { message: 'Another report already exists for this employee/month/year' } });
      }
    }

    await record.update({
      employeeId: employeeId || record.employeeId,
      month: month || record.month,
      year: year || record.year,
      presentDays: presentDays !== undefined ? parseInt(presentDays) : record.presentDays,
      absentDays: absentDays !== undefined ? parseInt(absentDays) : record.absentDays,
      notes: notes !== undefined ? notes : record.notes,
    });

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Delete attendance report
router.delete('/:id', async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: { message: 'Attendance report not found' } });
    }
    await record.destroy();
    res.json({ message: 'Attendance report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Get attendance summary for a specific employee in a month (used by payroll)
router.get('/summary/:employeeId/:month/:year', async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;

    const report = await Attendance.findOne({
      where: { employeeId, month, year }
    });

    if (!report) {
      return res.json({ data: { presentDays: 0, absentDays: 0 } });
    }

    res.json({ data: { presentDays: report.presentDays, absentDays: report.absentDays } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
