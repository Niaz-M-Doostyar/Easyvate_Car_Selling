const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { Op } = require('sequelize');

// Helper to get total days in month
const getTotalDays = (year, month) => new Date(year, month, 0).getDate();

// Get all monthly attendance reports (original, kept for compatibility)
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
    console.error('GET /attendance error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// BULK GET: all employees with their attendance for a given month/year
router.get('/bulk', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ error: { message: 'month and year are required' } });
    }

    const employees = await Employee.findAll({
      order: [['fullName', 'ASC']]
    });

    const attendances = await Attendance.findAll({
      where: { month: parseInt(month), year: parseInt(year) }
    });

    const result = employees.map(emp => {
      const att = attendances.find(a => a.employeeId === emp.id);
      return {
        id: att ? att.id : null,
        employeeId: emp.id,
        employeeName: emp.fullName,
        month: parseInt(month),
        year: parseInt(year),
        presentDays: att ? att.presentDays : 0,
        absentDays: att ? att.absentDays : 0,
        notes: att ? att.notes : '',
      };
    });

    res.json({ data: result });
  } catch (error) {
    console.error('GET /attendance/bulk error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// BULK UPSERT: create or update multiple attendance records
router.post('/bulk', async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: { message: 'records array required' } });
    }

    const results = [];
    const errors = [];

    for (const rec of records) {
      let { employeeId, month, year, presentDays, absentDays, notes } = rec;

      if (!employeeId || !month || !year) {
        errors.push({ rec, error: 'Missing employeeId, month, or year' });
        continue;
      }

      // 🔥 Force integers (VERY IMPORTANT)
      month = parseInt(month);
      year = parseInt(year);

      const present = parseInt(presentDays) || 0;
      const totalDays = getTotalDays(year, month);

      // Auto adjust absent days
      let finalPresent = present;
      let finalAbsent = totalDays - present;

      try {
        const [attendance, created] = await Attendance.upsert({
          employeeId,
          month,
          year,
          presentDays: finalPresent,
          absentDays: finalAbsent,
          notes: notes || null,
        });

        results.push(attendance);
      } catch (err) {
        console.error(`Failed for employee ${employeeId}:`, err);
        errors.push({ rec, error: err.message });
      }
    }

    if (errors.length > 0) {
      return res.status(207).json({
        success: false,
        partial: results.length,
        errors,
        message: `${results.length} saved, ${errors.length} failed`
      });
    }

    res.json({ success: true, data: results, count: results.length });

  } catch (error) {
    console.error('POST /attendance/bulk error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Create monthly attendance report (single)
router.post('/', async (req, res) => {
  try {
    const { employeeId, month, year, presentDays, absentDays, notes } = req.body;

    if (!employeeId || !month || !year || presentDays === undefined) {
      return res.status(400).json({ error: { message: 'Employee, month, year, and present days are required' } });
    }

    const existing = await Attendance.findOne({ where: { employeeId, month, year } });
    if (existing) {
      return res.status(409).json({ error: { message: 'Attendance report already exists for this employee/month/year.' } });
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
    console.error('POST /attendance error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Update single attendance report
router.put('/:id', async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: { message: 'Attendance report not found' } });
    }

    const { presentDays, absentDays, notes } = req.body;
    await record.update({
      presentDays: presentDays !== undefined ? parseInt(presentDays) : record.presentDays,
      absentDays: absentDays !== undefined ? parseInt(absentDays) : record.absentDays,
      notes: notes !== undefined ? notes : record.notes,
    });

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('PUT /attendance/:id error:', error);
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
    console.error('DELETE /attendance/:id error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Get attendance summary for a specific employee in a month (used by payroll)
router.get('/summary/:employeeId/:month/:year', async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const report = await Attendance.findOne({ where: { employeeId, month, year } });
    if (!report) {
      return res.json({ data: { presentDays: 0, absentDays: 0 } });
    }
    res.json({ data: { presentDays: report.presentDays, absentDays: report.absentDays } });
  } catch (error) {
    console.error('GET /attendance/summary error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;