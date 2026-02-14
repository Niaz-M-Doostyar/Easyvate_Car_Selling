const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payroll = sequelize.define('Payroll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  baseSalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  presentDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  absentDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  calculatedSalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  deductions: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  paymentDate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Partial'),
    defaultValue: 'Pending'
  },
  notes: {
    type: DataTypes.TEXT
  },
  paidBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'payroll',
  indexes: [
    {
      unique: true,
      fields: ['employeeId', 'month', 'year']
    }
  ]
});

module.exports = Payroll;
