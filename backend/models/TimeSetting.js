const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimeSetting = sequelize.define('TimeSetting', {
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'time_setting',
  timestamps: false
});

module.exports = TimeSetting;