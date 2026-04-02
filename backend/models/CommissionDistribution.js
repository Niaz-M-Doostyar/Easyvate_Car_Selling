const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommissionDistribution = sequelize.define('CommissionDistribution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sales',
      key: 'id'
    }
  },
  sharingPersonId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'sharing_persons',
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  personName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  investmentAmount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  sharePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  paidDate: {
    type: DataTypes.DATE
  },
  calculationMethod: {
    type: DataTypes.ENUM('Investment', 'Percentage'),
    allowNull: false,
    defaultValue: 'Percentage'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Paid'),
    defaultValue: 'Pending'
  }
}, {
  timestamps: true,
  tableName: 'commission_distributions'
});

module.exports = CommissionDistribution;
