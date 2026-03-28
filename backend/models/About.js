const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define a function that returns a model for a given language table
const defineAboutModel = (lang) => {
  const tableName = `about_${lang}`; // e.g., about_en, about_ps, about_fa
  return sequelize.define(`About${lang.charAt(0).toUpperCase() + lang.slice(1)}`, {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    subtitle: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    wide_feature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trust_feature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    professional_feature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    about_us: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    choose_trust: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    choose_quality: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    choose_process: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName,
    timestamps: true,
    underscored: false // or true based on your convention
  });
};

// Create models for each language
const AboutEnglish = defineAboutModel('en');
const AboutPashto = defineAboutModel('ps');
const AboutDari = defineAboutModel('fa');

module.exports = {
  AboutEnglish,
  AboutPashto,
  AboutDari
};