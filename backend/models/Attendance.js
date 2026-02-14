const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 12 }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 2000, max: 2100 }
  },
  presentDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0, max: 31 }
  },
  absentDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0, max: 31 }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'attendance',
  indexes: [
    {
      unique: true,
      fields: ['employeeId', 'month', 'year']
    }
  ]
});

module.exports = Attendance;
