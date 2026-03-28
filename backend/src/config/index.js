require('dotenv').config();

const ENV = process.env.NODE_ENV || 'development';

const config = {
  ENV,
  PORT: parseInt(process.env.PORT || '3001', 10),
  HOST: process.env.HOST || '0.0.0.0', // Bind to all interfaces for mobile app access
  
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    DATABASE: process.env.DB_NAME || 'easyvate_cars',
    DIALECT: 'mysql',
    POOL: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  JWT: {
    SECRET: process.env.JWT_SECRET || 'easyvate-super-secret-key-2024',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  },

  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  },

  FEATURES: {
    AUTO_SYNC_DB: ENV === 'development',
    AUTO_CREATE_ADMIN: ENV === 'development',
  },
};

module.exports = config;
