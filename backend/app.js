const express = require('express');
const compression = require('compression');
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
const aboutRoutes = require('./routes/about');
const teamRoutes = require('./routes/team');
const contactRoutes = require('./routes/contact');
const carouselRoutes = require('./routes/carousel');
const testimonialRoutes = require('./routes/testimonial');
const videoRoutes = require('./routes/chooseVideo');
const settingsRoutes = require('./routes/settings');
const { ensureSchemaCompatibility } = require('./src/services/schema');
const PunchLog = require('./models/PunchLog');
const Employee = require('./models/Employee');
const todayAttendanceRoutes = require('./routes/todayAttendance');
const monthlySummaryRoutes = require('./routes/monthlySummary');
const timeSettingRoutes = require('./routes/timeSetting');
const leaveRoutes = require('./routes/leaves');
const { withLock } = require('./src/utils/lock');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');

app.disable('x-powered-by');
app.set('etag', 'strong');

app.use(cors({
  origin: '*', // or ['http://localhost:3000', 'https://niazikhpalwak.com']
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/api/attendance/sync', async (req, res) => {
  try {
    const { empName, ID, date, checkInTimes } = req.body;

    if (!empName || !ID || !date || !Array.isArray(checkInTimes)) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid attendance date' });
    }

    const incomingTimes = checkInTimes.map(timestamp => new Date(timestamp));
    if (incomingTimes.some(timestamp => Number.isNaN(timestamp.getTime()))) {
      return res.status(400).json({ success: false, error: 'Invalid punch timestamp' });
    }

    console.log(`✅ VMS received: ${empName} (${ID}) - ${checkInTimes.length} punches`);

    const employee = await Employee.findOne({ where: { biometricId: ID.toString() } });
    if (!employee) {
      console.warn(`⚠️ Employee with biometricId ${ID} not found. Skipping.`);
      return res.status(200).json({ success: false, message: `Employee ${ID} not found` });
    }

    const lockKey = `attendance_${employee.id}_${date}`;
    const storedCount = await withLock(lockKey, 5, async transaction => {
      const existingPunches = await PunchLog.findAll({
        where: {
          employeeId: employee.id,
          date
        },
        attributes: ['punchTime'],
        transaction
      });

      const existingTimestamps = existingPunches
        .filter(punch => punch.punchTime)
        .map(punch => punch.punchTime.getTime());
      const newPunches = [];

      for (const timestamp of incomingTimes) {
        const timeMs = timestamp.getTime();
        const alreadyStored = existingTimestamps.some(
          existingMs => Math.abs(existingMs - timeMs) < 1000
        );
        const alreadyQueued = newPunches.some(
          queued => Math.abs(queued.getTime() - timeMs) < 1000
        );

        if (!alreadyStored && !alreadyQueued) {
          newPunches.push(timestamp);
        }
      }

      if (newPunches.length === 0) {
        return 0;
      }

      const punchRecords = newPunches.map(punchTime => ({
        employeeId: employee.id,
        punchTime,
        date,
        source: 'ZK_SYNC'
      }));

      await PunchLog.bulkCreate(punchRecords, { transaction });
      return punchRecords.length;
    });

    if (storedCount === 0) {
      console.log(`ℹ️ No new punches for ${employee.fullName} (${ID}) on ${date}`);
      return res.status(200).json({ success: true, message: 'No new punches to store' });
    }

    console.log(`✅ Stored ${storedCount} new punches for ${employee.fullName} (${ID}) on ${date}`);
    return res.status(200).json({ success: true, message: `${storedCount} new punches stored` });
  } catch (error) {
    console.error('❌ Sync storage error:', error);
    if (error.code === 'LOCK_TIMEOUT') {
      return res.status(409).json({
        success: false,
        error: 'Another request is already processing this employee’s punches. Please retry.'
      });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Serve uploads at both /uploads (direct) and /api/uploads (when Nginx proxies /api/ to backend)
const uploadsStaticOptions = {
  etag: true,
  lastModified: true,
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    if (/\.pdf$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return;
    }
    if (/\.(?:mp4|webm|mov|avi|mkv)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      return;
    }
    if (/\.(?:jpg|jpeg|png|webp|avif|gif|svg)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  },
};
app.use('/uploads', express.static(uploadsDir, uploadsStaticOptions));
// Also serve at /api/uploads so image URLs work when Nginx routes /api directly to backend
app.use('/api/uploads', express.static(uploadsDir, uploadsStaticOptions));
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const ROLE_INVENTORY = ['Super Admin', 'Owner', 'Manager', 'Inventory & Sales', 'Sales', 'Accountant', 'Viewer'];
const ROLE_FINANCIAL = ['Super Admin', 'Owner', 'Manager', 'Inventory & Sales', 'Sales', 'Accountant', 'Viewer'];
const ROLE_EMPLOYEE = ['Super Admin', 'Owner', 'Manager', 'Financial', 'Accountant'];



// 2. For all other /api routes, require JWT
app.use('/api', (req, res, next) => {
  // Public endpoints – no JWT required
  const publicPaths = [
    '/api/auth/login',
    '/api/attendance/sync',
    '/api/attendance/today',
    '/api/attendance/monthly-summary',
    '/api/time-settings/work-hours',
    '/api/leaves'
  ];
  if (publicPaths.some(path => req.originalUrl.startsWith(path))) {
    return next();
  }
  verifyToken(req, res, next);
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', verifyToken, authorize(ROLE_INVENTORY), vehicleRoutes);
app.use('/api/customers', verifyToken, authorize([...ROLE_INVENTORY, ...ROLE_FINANCIAL]), customerRoutes);
app.use('/api/sales', verifyToken, authorize(ROLE_INVENTORY), saleRoutes);
app.use('/api/ledger', verifyToken, authorize(ROLE_FINANCIAL), ledgerRoutes);
app.use('/api/employees', verifyToken, authorize(ROLE_EMPLOYEE), employeeRoutes);
app.use('/api/currency', verifyToken, authorize(ROLE_FINANCIAL), currencyRoutes);
// Keep specific attendance paths ahead of the generic /:id route in attendanceRoutes.
app.use('/api/attendance/today', verifyToken, authorize(ROLE_INVENTORY), todayAttendanceRoutes);
app.use('/api/attendance/monthly-summary', verifyToken, authorize(ROLE_INVENTORY), monthlySummaryRoutes);
app.use('/api/attendance', verifyToken, authorize(ROLE_EMPLOYEE), attendanceRoutes);
app.use('/api/payroll', verifyToken, authorize(ROLE_FINANCIAL), payrollRoutes);
app.use('/api/reports', verifyToken, authorize([...ROLE_FINANCIAL, ...ROLE_INVENTORY]), reportsRoutes);
app.use('/api/about', verifyToken, authorize(ROLE_INVENTORY), aboutRoutes);
app.use('/api/team', verifyToken, authorize(ROLE_INVENTORY), teamRoutes);
app.use('/api/contact', verifyToken, authorize(ROLE_INVENTORY), contactRoutes);
app.use('/api/carousel', verifyToken, authorize(ROLE_INVENTORY), carouselRoutes);
app.use('/api/testimonial', verifyToken, authorize(ROLE_INVENTORY), testimonialRoutes);
app.use('/api/choose-video', verifyToken, authorize(ROLE_INVENTORY), videoRoutes);
app.use('/api/settings', verifyToken, authorize(['Super Admin', 'Owner']), settingsRoutes);
app.use('/api/attendance/today', todayAttendanceRoutes);
app.use('/api/attendance/monthly-summary', monthlySummaryRoutes);
app.use('/api/time-settings', timeSettingRoutes);
app.use('/api/leaves', leaveRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const initializeApp = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection successful');

    if (config.FEATURES.AUTO_SYNC_DB) {
      await sequelize.sync({ force: false });
      console.log('✓ Database models synchronized');
      await ensureSchemaCompatibility();
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
