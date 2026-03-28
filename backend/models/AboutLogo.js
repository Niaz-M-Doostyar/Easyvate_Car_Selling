const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const defineAboutLogoModel = (lang) => {
  const tableName = `about_logos_${lang}`;
  return sequelize.define(`AboutLogo${lang.charAt(0).toUpperCase() + lang.slice(1)}`, {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    aboutId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: `ID of the about_${lang} record`
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName,
    timestamps: true
  });
};

const AboutLogoEnglish = defineAboutLogoModel('en');
const AboutLogoPashto = defineAboutLogoModel('ps');
const AboutLogoDari = defineAboutLogoModel('fa');

module.exports = {
  AboutLogoEnglish,
  AboutLogoPashto,
  AboutLogoDari
};