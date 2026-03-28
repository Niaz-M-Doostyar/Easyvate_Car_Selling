const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChooseVideo = sequelize.define('ChooseVideo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  videoPath: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Path to uploaded video file'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order'
  }
}, {
  timestamps: true,
  tableName: 'choose_videos'
});

module.exports = ChooseVideo;