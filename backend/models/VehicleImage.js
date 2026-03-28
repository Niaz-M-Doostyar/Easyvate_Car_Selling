const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleImage = sequelize.define('VehicleImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vehicles',
      key: 'id'
    },
    onDelete: 'CASCADE' // delete images if vehicle is deleted
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Original filename'
  },
  path: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Relative URL to access the image (e.g., /uploads/vehicle-images/xyz.jpg)'
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'File size in bytes'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order (ascending)'
  }
}, {
  timestamps: true,
  tableName: 'vehicle_images'
});

module.exports = VehicleImage;