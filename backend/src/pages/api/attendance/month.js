// src/pages/api/attendance/monthly.js
import Employee from '../../../models/Employee';
import PunchLog from '../../../models/PunchLog';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: 'month and year are required' });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // last day of month

  try {
    const employees = await Employee.findAll({
      attributes: ['id', 'fullName'],
      order: [['fullName', 'ASC']]
    });

    const punches = await PunchLog.findAll({
      where: {
        date: {
          [Op.between]: [startDate.toISOString().slice(0,10), endDate.toISOString().slice(0,10)]
        }
      },
      order: [['punchTime', 'ASC']]
    });

    const grouped = {};
    punches.forEach(punch => {
      const key = `${punch.employeeId}_${punch.date}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(punch.punchTime);
    });

    const result = [];
    const dayList = [];
    let cur = new Date(startDate);
    while (cur <= endDate) {
      dayList.push(cur.toISOString().slice(0,10));
      cur.setDate(cur.getDate() + 1);
    }

    for (const emp of employees) {
      const days = [];
      for (const dateStr of dayList) {
        const key = `${emp.id}_${dateStr}`;
        const times = grouped[key] || [];
        let checkIn = null, checkOut = null;
        if (times.length > 0) {
          checkIn = times[0];
          const last = times[times.length - 1];
          const diffMinutes = (last - checkIn) / (1000 * 60);
          if (diffMinutes > 5) checkOut = last;
        }
        days.push({ date: dateStr, checkIn, checkOut });
      }
      result.push({ employeeId: emp.id, employeeName: emp.fullName, days });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}