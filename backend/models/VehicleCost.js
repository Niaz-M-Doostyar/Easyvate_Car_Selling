const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleCost = sequelize.define('VehicleCost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vehicles',
      key: 'id'
    }
  },
  stage: {
    type: DataTypes.ENUM('Base Purchase', 'Transport to Dubai', 'Import to Afghanistan', 'Repair', 'Additional'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  amountInAFN: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount converted to Afghani at the daily exchange rate'
  },
  exchangeRateUsed: {
    type: DataTypes.DECIMAL(15, 6),
    comment: 'The exchange rate used for conversion to AFN'
  },
  description: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  addedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'vehicle_costs'
});

module.exports = VehicleCost;
