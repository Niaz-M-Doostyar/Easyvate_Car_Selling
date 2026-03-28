const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carousel = sequelize.define('Carousel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Path to uploaded image'
  }
}, {
  timestamps: true,
  tableName: 'carousel_items'
});

module.exports = Carousel;