const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicleId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(50)
  },
  chassisNumber: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  engineNumber: {
    type: DataTypes.STRING(100),
    unique: false
  },
  engineType: {
    type: DataTypes.STRING(100)
  },
  fuelType: {
    type: DataTypes.STRING(50)
  },
  transmission: {
    type: DataTypes.STRING(50)
  },
  mileage: {
    type: DataTypes.INTEGER
  },
  plateNo: {
    type: DataTypes.STRING(50)
  },
  vehicleLicense: {
    type: DataTypes.STRING(100)
  },
  steering: {
    type: DataTypes.ENUM('Left', 'Right'),
    defaultValue: 'Left'
  },
  monolithicCut: {
    type: DataTypes.ENUM('Monolithic', 'Cut'),
    defaultValue: 'Monolithic'
  },
  status: {
    type: DataTypes.ENUM('Available', 'Reserved', 'Sold', 'Coming', 'Under Repair'),
    defaultValue: 'Available'
  },
  basePurchasePrice: {
    type: DataTypes.DECIMAL(15, 2)
  },
  baseCurrency: {
    type: DataTypes.STRING(10),
    defaultValue: 'AFN'
  },
  transportCostToDubai: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  importCostToAfghanistan: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  repairCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalCostPKR: {
    type: DataTypes.DECIMAL(15, 2)
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(15, 2)
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pdfPath: {
    type: DataTypes.STRING(255)
  }
}, {
  timestamps: true,
  tableName: 'vehicles'
});

module.exports = Vehicle;
