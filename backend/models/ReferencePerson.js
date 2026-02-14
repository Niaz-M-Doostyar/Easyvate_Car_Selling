const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferencePerson = sequelize.define('ReferencePerson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tazkiraNumber: {
    type: DataTypes.STRING(50)
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  photoPath: {
    type: DataTypes.STRING(255)
  },
  address: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'reference_persons'
});

module.exports = ReferencePerson;
