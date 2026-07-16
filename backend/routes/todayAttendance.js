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

router.get('/', async (req, res) => {
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

      let i = 0;
      while (i < times.length) {
        const checkIn = times[i];
        let checkOut = null;
        let j = i + 1;

        // Find the first punch that is >= 3 minutes after checkIn
        while (j < times.length) {
          const diffMinutes = (times[j] - checkIn) / (1000 * 60);
          if (diffMinutes >= 3) {
            checkOut = times[j];
            i = j + 1; // skip past the OUT punch
            break;
          }
          j++; // ignore this punch (less than 3 min)
        }

        // If no valid OUT found, use default end time
        if (!checkOut) {
          checkOut = parseTimeToDate(defaultEndTime, checkIn);
          i = times.length; // we're done for this employee
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