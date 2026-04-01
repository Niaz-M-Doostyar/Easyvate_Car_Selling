const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fatherName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  currentAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  originalAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  village: {
    type: DataTypes.STRING(255)
  },
  nationalIdNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  customerType: {
    type: DataTypes.ENUM('Buyer', 'Investor', 'Borrower'),
    defaultValue: 'Buyer'
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'customers'
});

module.exports = Customer;
