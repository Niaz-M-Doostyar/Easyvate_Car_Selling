const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255)
  },
  tazkiraNumber: {
    type: DataTypes.STRING(50)
  },
  address: {
    type: DataTypes.TEXT
  },
  role: {
    type: DataTypes.STRING(100)
  },
  monthlySalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  joiningDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  },
  biometricId: {
    type: DataTypes.STRING(50)
  }
}, {
  timestamps: true,
  tableName: 'employees'
});

module.exports = Employee;
