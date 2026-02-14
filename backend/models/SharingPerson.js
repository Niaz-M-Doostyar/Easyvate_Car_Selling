const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SharingPerson = sequelize.define('SharingPerson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  personName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  investmentAmount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  phoneNumber: {
    type: DataTypes.STRING(20)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'sharing_persons'
});

module.exports = SharingPerson;
