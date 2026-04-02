const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleOption = sequelize.define('VehicleOption', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  field: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'manufacturer, category, engineType, transmission'
  },
  value: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'vehicle_options',
  indexes: [
    { unique: true, fields: ['field', 'value'] }
  ]
});

module.exports = VehicleOption;
