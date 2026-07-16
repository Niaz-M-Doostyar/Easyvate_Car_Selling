const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Employee = require('../models/Employee');
const PunchLog = require('../models/PunchLog');
const { verifyToken, authorize } = require('../src/middleware/auth');

// GET /api/attendance/monthly-summary?month=5&year=2026
router.get('/', async (req, res) => {
  try {
    let { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' });
    }
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid month or year' });
    }

    // First and last day of the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    // All employees
    const employees = await Employee.findAll({
      attributes: ['id', 'fullName'],
      order: [['fullName', 'ASC']]
    });

    // All attendance records (punches + leaves) for the month
    const records = await PunchLog.findAll({
      where: {
        date: { [Op.between]: [startStr, endStr] },
        type: { [Op.in]: ['PUNCH', 'LEAVE'] }
      },
      attributes: ['employeeId', 'date', 'type']
    });

    // Group by employee: store sets of dates for all attendance, and separately for leave-only
    const employeePresentDays = {};   // dates with PUNCH or LEAVE
    const employeeLeaveDays = {};     // dates with LEAVE only
    for (const rec of records) {
      const empId = rec.employeeId;
      if (!employeePresentDays[empId]) employeePresentDays[empId] = new Set();
      employeePresentDays[empId].add(rec.date);
      if (rec.type === 'LEAVE') {
        if (!employeeLeaveDays[empId]) employeeLeaveDays[empId] = new Set();
        employeeLeaveDays[empId].add(rec.date);
      }
    }

    const totalDays = new Date(yearNum, monthNum, 0).getDate();

    const result = employees.map(emp => {
      const presentDays = employeePresentDays[emp.id] ? employeePresentDays[emp.id].size : 0;
      const absentDays = totalDays - presentDays;
      const leaveDays = employeeLeaveDays[emp.id] ? employeeLeaveDays[emp.id].size : 0;
      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        presentDays,
        absentDays,
        leaveDays   // optional – can be displayed in the frontend
      };
    });

    res.json({ success: true, data: result, totalDays });
  } catch (error) {
    console.error('Monthly summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;