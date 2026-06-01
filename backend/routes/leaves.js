const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const PunchLog = require('../models/PunchLog');
const Employee = require('../models/Employee');
const { verifyToken, authorize } = require('../src/middleware/auth');

// GET all leave records (for reporting)
router.get('/', async (req, res) => {
  const { employeeId, fromDate, toDate } = req.query;
  const where = { type: 'LEAVE' };
  if (employeeId) where.employeeId = employeeId;
  if (fromDate) where.date = { [Op.gte]: fromDate };
  if (toDate) where.date = { [Op.lte]: toDate };
  const leaves = await PunchLog.findAll({
    where,
    include: [{ model: Employee, attributes: ['fullName'] }],
    order: [['date', 'DESC']]
  });
  res.json({ success: true, data: leaves });
});

// POST a leave request (manually add leave days)
router.post('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate, leaveType } = req.body;
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const records = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      records.push({
        employeeId,
        date: dateStr,
        type: 'LEAVE',
        leaveType: leaveType || 'Casual',
        source: 'MANUAL_LEAVE'
      });
    }
    await PunchLog.bulkCreate(records);
    res.json({ success: true, message: `${records.length} leave day(s) added for ${leaveType || 'Casual'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;