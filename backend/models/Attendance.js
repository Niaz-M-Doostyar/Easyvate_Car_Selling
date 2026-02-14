const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  checkIn: {
    type: DataTypes.TIME
  },
  checkOut: {
    type: DataTypes.TIME
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Half Day', 'Leave', 'Holiday'),
    allowNull: false
  },
  biometricId: {
    type: DataTypes.STRING(100)
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'attendance',
  indexes: [
    {
      unique: true,
      fields: ['employeeId', 'date']
    }
  ]
});

module.exports = Attendance;
