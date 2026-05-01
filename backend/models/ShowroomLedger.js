const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShowroomLedger = sequelize.define('ShowroomLedger', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Showroom Balance', 'Expense', 'Commission', 'Owner Withdrawal', 'Currency Exchange', 'Vehicle Purchase', 'Vehicle Sale', 'Salary', 'Loan Given', 'Loan Received'),
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