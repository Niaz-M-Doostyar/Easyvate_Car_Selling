// In src/pages/api/attendance/logs.js
import PunchLog from '../../../models/PunchLog';
import Employee from '../../../models/Employee';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: 'month and year required' });

  const startDate = new Date(year, month-1, 1);
  const endDate = new Date(year, month, 0);
  const logs = await PunchLog.findAll({
    where: { date: { [Op.between]: [startDate.toISOString().slice(0,10), endDate.toISOString().slice(0,10)] } },
    include: [{ model: Employee, attributes: ['fullName'] }],
    order: [['punchTime', 'ASC']]
  });
  const data = logs.map(log => ({
    id: log.id,
    employeeName: log.Employee.fullName,
    date: log.date,
    punchTime: log.punchTime
  }));
  res.json({ success: true, data });
}