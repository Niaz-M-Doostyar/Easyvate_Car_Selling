const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerLedger = sequelize.define('CustomerLedger', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('Received', 'Paid', 'Sale', 'Investment', 'Loan', 'Loan Payment', 'Installment'),
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
  amountInPKR: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  purpose: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  saleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'sales',
      key: 'id'
    }
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
  tableName: 'customer_ledger'
});

module.exports = CustomerLedger;
