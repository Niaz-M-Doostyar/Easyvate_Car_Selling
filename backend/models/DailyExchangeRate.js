const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyExchangeRate = sequelize.define('DailyExchangeRate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'The date this rate was effective'
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Currency code (USD, PKR, etc.)'
  },
  rateToAFN: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false,
    comment: 'How many AFN for 1 unit of this currency on this date'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'daily_exchange_rates',
  indexes: [
    {
      unique: true,
      fields: ['date', 'currency']
    }
  ]
});

module.exports = DailyExchangeRate;
