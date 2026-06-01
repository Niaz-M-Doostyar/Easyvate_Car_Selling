const { Op } = require('sequelize');
const PunchLog = require('../../models/PunchLog');
const TimeSetting = require('../../models/TimeSetting');

// Helper: get daily working hours from settings (e.g., 9 hours)
async function getDailyWorkingHours() {
  const startSetting = await TimeSetting.findOne({ where: { key: 'work_start_time' } });
  const endSetting = await TimeSetting.findOne({ where: { key: 'work_end_time' } });
  const startStr = startSetting ? startSetting.value : '08:00';
  const endStr = endSetting ? endSetting.value : '17:00';
  const [startHour, startMin] = startStr.split(':').map(Number);
  const [endHour, endMin] = endStr.split(':').map(Number);
  const startTotal = startHour + startMin / 60;
  const endTotal = endHour + endMin / 60;
  return endTotal - startTotal;
}

// Helper: compute total actual worked hours for an employee in a given month
async function getWorkedHours(employeeId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  // Fetch all PUNCH records with punchTime (ignore LEAVE records)
  const punches = await PunchLog.findAll({
    where: {
      employeeId,
      date: { [Op.between]: [startStr, endStr] },
      type: 'PUNCH',
      punchTime: { [Op.not]: null }
    },
    order: [['punchTime', 'ASC']]
  });

  // Group by date
  const dailyPunches = {};
  for (const p of punches) {
    const date = p.date;
    if (!dailyPunches[date]) dailyPunches[date] = [];
    dailyPunches[date].push(p.punchTime);
  }

  let totalHours = 0;
  for (const [date, times] of Object.entries(dailyPunches)) {
    let i = 0;
    while (i < times.length) {
      const checkIn = times[i];
      let checkOut = null;
      let j = i + 1;
      // Find the first punch that is at least 5 minutes later
      while (j < times.length) {
        const diffMinutes = (times[j] - checkIn) / (1000 * 60);
        if (diffMinutes >= 5) {
          checkOut = times[j];
          i = j + 1;
          break;
        }
        j++;
      }
      if (checkOut) {
        const hours = (checkOut - checkIn) / (1000 * 60 * 60);
        totalHours += hours;
      } else {
        // Incomplete pair – ignore (or could use default end time; we ignore for accuracy)
        i++;
      }
    }
  }
  return totalHours;
}

// Helper: count total leave days for an employee in a month (each LEAVE record = 1 full day)
async function getLeaveDays(employeeId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  const leaves = await PunchLog.findAll({
    where: {
      employeeId,
      date: { [Op.between]: [startStr, endStr] },
      type: 'LEAVE'
    },
    attributes: ['date'],
    group: ['date']
  });
  return leaves.length;
}

module.exports = { getDailyWorkingHours, getWorkedHours, getLeaveDays };