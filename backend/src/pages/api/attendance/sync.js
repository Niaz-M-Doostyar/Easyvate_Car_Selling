const router = express.Router();
const Employee = require('../models/Employee');
const PunchLog = require('../models/PunchLog');
const { withLock } = require('../utils/lock');

router.post('/sync', async (req, res) => {
  try {
    const { empName, ID, date, attendanceCount, checkInTimes } = req.body;
    if (!empName || !ID || !date || !Array.isArray(checkInTimes)) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 1. Find or create employee
    let employee = await Employee.findOne({ where: { biometricId: ID.toString() } });
    if (!employee) {
      employee = await Employee.create({
        employeeId: `ZK_${ID}`,
        fullName: empName,
        phoneNumber: '0000000000',
        monthlySalary: 0,
        joiningDate: new Date(),
        biometricId: ID.toString(),
        status: 'Active',
      });
    }

    const lockKey = `punch_${employee.id}_${date}`;
    let storedCount = 0;

    // 2. Run the critical section under a lock
    await withLock(lockKey, 5, async () => {
      const newPunches = await sequelize.transaction(async (t) => {
        const existingPunches = await PunchLog.findAll({
          where: { employeeId: employee.id, date },
          attributes: ['punchTime'],
          transaction: t,
        });

        const existingMs = existingPunches.map(p => p.punchTime.getTime());

        const incomingTimes = checkInTimes.map(ts => new Date(ts));
        const filtered = incomingTimes.filter(ts => {
          const timeMs = ts.getTime();
          return !existingMs.some(existingMs => Math.abs(existingMs - timeMs) < 1000);
        });

        if (filtered.length === 0) return [];

        const records = filtered.map(punchTime => ({
          employeeId: employee.id,
          punchTime,
          date,
          source: 'ZK_SYNC',
        }));

        await PunchLog.bulkCreate(records, { transaction: t, ignoreDuplicates: true });
        return records;
      });

      storedCount = newPunches.length;
    });

    console.log(`✅ Stored ${storedCount} new punches for ${empName} (${ID}) on ${date}`);
    res.json({
      success: true,
      message: `${storedCount} new punches stored`,
      count: storedCount,
    });
  } catch (error) {
    console.error('❌ Sync storage error:', error);
    if (error.message === 'Could not acquire lock') {
      return res.status(409).json({
        success: false,
        error: 'Another request is already processing this employee’s punches. Please retry.',
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});