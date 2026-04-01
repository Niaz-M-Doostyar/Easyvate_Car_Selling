const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShowroomLedger = sequelize.define('ShowroomLedger', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Income', 'Expense', 'Vehicle Purchase', 'Vehicle Sale', 'Salary', 'Loan Given', 'Loan Received', 'Loan Payment', 'Commission'),
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
  personId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'customers',
      key: 'id'
    },
    comment: 'Reference to customer if applicable'
  },
  description: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  referenceId: {
    type: DataTypes.INTEGER
  },
  referenceType: {
    type: DataTypes.STRING(50)
  },
  personName: {
    type: DataTypes.STRING(255)
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
  tableName: 'showroom_ledger'
});

module.exports = ShowroomLedger;
