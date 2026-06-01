const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PunchLog = sequelize.define('PunchLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'employees', key: 'id' } },
  punchTime: { type: DataTypes.DATE, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  source: { type: DataTypes.STRING, defaultValue: 'ZK_SYNC' },
  type: { type: DataTypes.ENUM('PUNCH', 'LEAVE'), defaultValue: 'PUNCH' },
  leaveType: { type: DataTypes.STRING, allowNull: true }   // e.g., 'Casual', 'Sick', 'Annual'
}, {
  timestamps: true,
  tableName: 'punch_logs',
  indexes: [
    { fields: ['employeeId'] },
    { fields: ['date'] },
    { fields: ['type'] }
  ]
});

module.exports = PunchLog;