const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleDropdownOption = sequelize.define('VehicleDropdownOption', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fieldName: {
    type: DataTypes.ENUM('manufacturer', 'category', 'engineType', 'transmission'),
    allowNull: false,
    comment: 'Which dropdown field this option belongs to'
  },
  value: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'vehicle_dropdown_options',
  indexes: [
    {
      unique: true,
      fields: ['fieldName', 'value']
    }
  ]
});

module.exports = VehicleDropdownOption;
