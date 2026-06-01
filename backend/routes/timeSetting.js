const express = require('express');
const router = express.Router();
const TimeSetting = require('../models/TimeSetting');
const { verifyToken, authorize } = require('../src/middleware/auth');

// GET work hours
router.get('/work-hours', async (req, res) => {
  const start = await TimeSetting.findOne({ where: { key: 'work_start_time' } });
  const end = await TimeSetting.findOne({ where: { key: 'work_end_time' } });
  res.json({ start: start ? start.value : '08:00', end: end ? end.value : '17:00' });
});

// UPDATE work hours (only Super Admin)
router.put('/work-hours', async (req, res) => {
  const { start, end } = req.body;
  await TimeSetting.upsert({ key: 'work_start_time', value: start });
  await TimeSetting.upsert({ key: 'work_end_time', value: end });
  res.json({ success: true });
});

module.exports = router;