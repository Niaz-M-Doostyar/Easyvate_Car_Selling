const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  personName: {
    type: DataTypes.STRING(255),
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
  amountInAFN: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount converted to Afghani'
  },
  exchangeRateUsed: {
    type: DataTypes.DECIMAL(15, 6),
    comment: 'Exchange rate used for conversion to AFN'
  },
  customerId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'customers',
      key: 'id'
    },
    comment: 'Reference to customer'
  },
  borrowDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Borrowed', 'Lent', 'Owner Loan'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Open', 'Paid'),
    defaultValue: 'Open'
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
  tableName: 'loans'
});

module.exports = Loan;
