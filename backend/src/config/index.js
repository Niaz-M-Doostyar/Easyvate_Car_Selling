require('dotenv').config();

// ============================================================
// DEPLOYMENT PRESETS
// Change DEPLOY_TARGET in backend/.env to switch environments:
//   local  →  your Mac with MAMP (MySQL on port 8889)
//   vps    →  remote VPS (MySQL on port 3308, no password)
// ============================================================
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || 'local';

const PRESETS = {
  local: {
    HOST: '0.0.0.0',
    PORT: 3002,
    DB: {
      HOST: 'localhost',
      PORT: 8889,
      USER: 'root',
      PASSWORD: 'root',
      DATABASE: 'easyvate_cars',
    },
    CORS_ORIGIN: ['http://localhost:3000', 'http://localhost:3001'],
  },
  vps: {
    HOST: '0.0.0.0',
    PORT: 3002,
    DB: {
      HOST: 'localhost',
      PORT: 3308,
      USER: 'root',
      PASSWORD: '',
      DATABASE: 'easyvate_cars',
    },
    CORS_ORIGIN: 'http://194.163.170.240',
  },
  
};

const preset = PRESETS[DEPLOY_TARGET] || PRESETS.local;

console.log(`[config] DEPLOY_TARGET = ${DEPLOY_TARGET}`);

const config = {
  ENV: DEPLOY_TARGET,
  PORT: preset.PORT,
  HOST: preset.HOST,

  DB: {
    HOST: process.env.DB_HOST || preset.DB.HOST,
    PORT: Number(process.env.DB_PORT || preset.DB.PORT),
    USER: process.env.DB_USER || preset.DB.USER,
    PASSWORD: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : preset.DB.PASSWORD,
    DATABASE: process.env.DB_NAME || preset.DB.DATABASE,
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
    ORIGIN: preset.CORS_ORIGIN,
    CREDENTIALS: false,
  },

  FEATURES: {
    AUTO_SYNC_DB: true,
    AUTO_CREATE_ADMIN: true,
  },
};

module.exports = config;
