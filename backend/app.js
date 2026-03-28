const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const { sequelize } = require('./models');
const { requestLogger } = require('./src/middleware/logger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { verifyToken, authorize } = require('./src/middleware/auth');
const authRoutes = require('./routes/auth').router;
const vehicleRoutes = require('./routes/vehicles');
const customerRoutes = require('./routes/customers');
const saleRoutes = require('./routes/sales');
const ledgerRoutes = require('./routes/ledger');
const employeeRoutes = require('./routes/employees');
const currencyRoutes = require('./routes/currency');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const reportsRoutes = require('./routes/reports');
const loansRoutes = require('./routes/loans');
const aboutRoutes = require('./routes/about');
const teamRoutes = require('./routes/team');
const contactRoutes = require('./routes/contact');
const carouselRoutes = require('./routes/carousel');
const testimonialRoutes = require('./routes/testimonial');
const videoRoutes = require('./routes/chooseVideo');

const app = express();

app.use(cors({
  origin: config.CORS.ORIGIN,
  credentials: config.CORS.CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const ROLE_INVENTORY = ['Super Admin', 'Owner', 'Manager', 'Inventory & Sales', 'Sales'];
const ROLE_FINANCIAL = ['Super Admin', 'Owner', 'Manager', 'Accountant', 'Financial'];
const ROLE_EMPLOYEE = ['Super Admin', 'Owner', 'Manager', 'Financial', 'Accountant'];

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', verifyToken, authorize(ROLE_INVENTORY), vehicleRoutes);
app.use('/api/customers', verifyToken, authorize([...ROLE_INVENTORY, ...ROLE_FINANCIAL]), customerRoutes);
app.use('/api/sales', verifyToken, authorize(ROLE_INVENTORY), saleRoutes);
app.use('/api/ledger', verifyToken, authorize(ROLE_FINANCIAL), ledgerRoutes);
app.use('/api/employees', verifyToken, authorize(ROLE_EMPLOYEE), employeeRoutes);
app.use('/api/currency', verifyToken, authorize(ROLE_FINANCIAL), currencyRoutes);
app.use('/api/attendance', verifyToken, authorize(ROLE_EMPLOYEE), attendanceRoutes);
app.use('/api/payroll', verifyToken, authorize(ROLE_FINANCIAL), payrollRoutes);
app.use('/api/reports', verifyToken, authorize([...ROLE_FINANCIAL, ...ROLE_INVENTORY]), reportsRoutes);
app.use('/api/loans', verifyToken, authorize(ROLE_FINANCIAL), loansRoutes);
app.use('/api/about', verifyToken, authorize(ROLE_INVENTORY), aboutRoutes);
app.use('/api/team', verifyToken, authorize(ROLE_INVENTORY), teamRoutes);
app.use('/api/contact', verifyToken, authorize(ROLE_INVENTORY), contactRoutes);
app.use('/api/carousel', verifyToken, authorize(ROLE_INVENTORY), carouselRoutes);
app.use('/api/testimonial', verifyToken, authorize(ROLE_INVENTORY), testimonialRoutes);
app.use('/api/choose-video', verifyToken, authorize(ROLE_INVENTORY), videoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const initializeApp = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection successful');

    if (config.FEATURES.AUTO_SYNC_DB) {
      await sequelize.sync({ force: false });
      console.log('✓ Database models synchronized');
    }

    // Initialize exchange rates
    const { initializeRates } = require('./src/services/exchangeRate');
    await initializeRates();

    if (config.FEATURES.AUTO_CREATE_ADMIN) {
      const User = require('./models/User');
      const adminExists = await User.findOne({ where: { username: 'admin' } });
      if (!adminExists) {
        await User.create({
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@easyvate.com',
          password: 'admin123',
          role: 'Super Admin',
          isActive: true,
        });
        console.log('✓ Default admin user created');
      }
    }

    const server = app.listen(config.PORT, config.HOST, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║        Easyvate Car Selling Management System             ║
║  🚀 Server: http://${config.HOST}:${config.PORT}
║  📊 Database: ${config.DB.DATABASE}
╚════════════════════════════════════════════════════════════╝
      `);
    });

    const gracefulShutdown = () => {
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    };
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Application failed:', error.message);
    process.exit(1);
  }
};

initializeApp();

module.exports = app;
