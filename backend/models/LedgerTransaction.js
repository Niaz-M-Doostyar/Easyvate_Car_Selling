const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LedgerTransaction = sequelize.define('LedgerTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  transactionType: {
    type: DataTypes.ENUM('Credit', 'Debit', 'Vehicle Purchase', 'Vehicle Sale', 'Salary', 'Expense', 'Currency Exchange', 'Loan', 'Commission'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'AFN'
  },
  amountAFN: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount converted to Afghani'
  },
  exchangeRateUsed: {
    type: DataTypes.DECIMAL(15, 6),
    comment: 'Exchange rate used for conversion to AFN'
  },
  relatedEntityType: {
    type: DataTypes.STRING(50)
  },
  relatedEntityId: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER
  }
}, {
  timestamps: true,
  tableName: 'ledger_transactions'
});

module.exports = LedgerTransaction;
