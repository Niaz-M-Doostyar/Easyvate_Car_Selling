const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExchangeRate = sequelize.define('ExchangeRate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  rateToAFN: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false,
    comment: 'How many AFN for 1 unit of this currency'
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'exchange_rates'
});

module.exports = ExchangeRate;
