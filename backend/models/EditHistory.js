const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EditHistory = sequelize.define('EditHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fieldName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  oldValue: {
    type: DataTypes.TEXT
  },
  newValue: {
    type: DataTypes.TEXT
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  editedBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'edit_history'
});

module.exports = EditHistory;
