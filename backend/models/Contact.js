const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Factory to define a model for a given language table
const defineContactModel = (lang) => {
  const tableName = `contact_${lang}`; // contact_en, contact_ps, contact_da
  return sequelize.define(`Contact${lang.charAt(0).toUpperCase() + lang.slice(1)}`, {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
     email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        // Allow null or empty string; if value present, must be valid email
        isValidEmail(value) {
          if (value && value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error('Invalid email format');
          }
        }
      }
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        // Only digits allowed, max length 10
        is: /^\d*$/, // empty string passes
        len: [0, 10]
      }
    },
    facebook: { type: DataTypes.STRING(255), allowNull: true },
    instagram: { type: DataTypes.STRING(255), allowNull: true },
    x: { type: DataTypes.STRING(255), allowNull: true },
    youtube: { type: DataTypes.STRING(255), allowNull: true },
    weekdays: { type: DataTypes.STRING(255), allowNull: true },
    friday: { type: DataTypes.STRING(255), allowNull: true },
    branchName: { type: DataTypes.STRING(255), allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName,
    timestamps: true
  });
};

const ContactEnglish = defineContactModel('en');
const ContactPashto = defineContactModel('ps');
const ContactDari = defineContactModel('fa');

module.exports = {
  ContactEnglish,
  ContactPashto,
  ContactDari
};