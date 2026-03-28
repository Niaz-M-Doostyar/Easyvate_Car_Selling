const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Factory to define a model for a given language table
const defineTeamModel = (lang) => {
  const tableName = `team_${lang}`; // team_en, team_ps, team_da
  return sequelize.define(`Team${lang.charAt(0).toUpperCase() + lang.slice(1)}`, {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    position: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    instagram: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    x: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Twitter/X profile URL'
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Path to uploaded team member image'
    }
  }, {
    tableName,
    timestamps: true
  });
};

const TeamEnglish = defineTeamModel('en');
const TeamPashto = defineTeamModel('ps');
const TeamDari = defineTeamModel('fa');

module.exports = {
  TeamEnglish,
  TeamPashto,
  TeamDari
};