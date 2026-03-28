const { Sequelize } = require('sequelize');
const config = require('../src/config');

console.log("DB CONFIG:", config.DB);

const sequelize = new Sequelize(
  config.DB.DATABASE,
  config.DB.USER,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: config.DB.DIALECT,
    logging: false,
    pool: config.DB.POOL,
  }
);

module.exports = sequelize;
