// routes/todayAttendance.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Employee = require('../models/Employee');
const PunchLog = require('../models/PunchLog');
const { verifyToken, authorize } = require('../src/middleware/auth');
const TimeSetting = require('../models/TimeSetting');

const getDefaultEndTime = async () => {
  const setting = await TimeSetting.findOne({ where: { key: 'work_end_time' } });
  return setting ? setting.value : '17:00';
};

// Helper: convert "HH:MM" to a Date object on a given day
const parseTimeToDate = (timeStr, baseDate) => {
  const [hours, minutes] = timeStr.split(':');
  const d = new Date(baseDate);
  d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return d;
};

router.get('/', verifyToken, authorize(['Super Admin', 'Manager', 'HR', 'Viewer']), async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const employees = await Employee.findAll({ attributes: ['id', 'fullName'], order: [['fullName', 'ASC']] });
    const punches = await PunchLog.findAll({
      where: { date: today },
      order: [['punchTime', 'ASC']]
    });

    // Group punches by employee
    const employeePunches = {};
    punches.forEach(p => {
      if (!employeePunches[p.employeeId]) employeePunches[p.employeeId] = [];
      employeePunches[p.employeeId].push(p.punchTime);
    });

    const defaultEndTime = await getDefaultEndTime();

    const result = [];
    for (const emp of employees) {
      const times = employeePunches[emp.id] || [];
      const pairs = [];
      // Pair punches: IN (index 0,2,4...) and OUT (index 1,3,5...)
      for (let i = 0; i < times.length; i++) {
        const checkIn = times[i];
        let checkOut = null;
        if ((i + 1) < times.length) {
          // Check if next punch is at least 5 minutes later (to be considered a valid OUT)
          const nextPunch = times[i+1];
          const diffMinutes = (nextPunch - checkIn) / (1000 * 60);
          if (diffMinutes >= 5) {
            checkOut = nextPunch;
            i++; // skip the paired out punch
          } else {
            // If less than 5 minutes, treat as multiple IN? Actually treat as same IN, ignore next? 
            // To avoid infinite loop, just skip this one? Simpler: treat the next as ignored and continue.
            // But we want correct pairing: if second punch within 5 min, it's not a new OUT; so we skip it and continue.
            // So we don't increment i, and checkOut remains null.
            // Then later we'll apply default out if needed.
          }
        }
        if (!checkOut && i === times.length - 1) {
          // Last punch has no following punch – use default end time
          checkOut = parseTimeToDate(defaultEndTime, times[i]);
        }
        pairs.push({ checkIn, checkOut });
      }
      // If there are no punches at all, show empty
      if (pairs.length === 0) {
        pairs.push({ checkIn: null, checkOut: null });
      }
      result.push({
        employeeId: emp.id,
        employeeName: emp.fullName,
        pairs: pairs
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Today attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;