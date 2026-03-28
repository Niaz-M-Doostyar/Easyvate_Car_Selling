const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const defineTestimonialModel = (lang) => {
  const tableName = `testimonial_${lang}`;
  return sequelize.define(`Testimonial${lang.charAt(0).toUpperCase() + lang.slice(1)}`, {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    year: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName,
    timestamps: true
  });
};

const TestimonialEnglish = defineTestimonialModel('en');
const TestimonialPashto = defineTestimonialModel('ps');
const TestimonialDari = defineTestimonialModel('fa');

module.exports = {
  TestimonialEnglish,
  TestimonialPashto,
  TestimonialDari
};