const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CurrencyExchange = sequelize.define('CurrencyExchange', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fromCurrency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  toCurrency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  fromAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  toAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
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
  tableName: 'currency_exchanges'
});

module.exports = CurrencyExchange;
