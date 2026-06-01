// src/pages/api/attendance/sync.js
import PunchLog from '../../../models/PunchLog';
import Employee from '../../../models/Employee';

export default async function handler(req, res) {
  // 1. Only POST allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log("🔥 SYNC ENDPOINT HIT with body:", req.body);
    // 2. Authenticate (optional – uncomment if needed)
    // const apiKey = req.headers['x-api-key'];
    // if (apiKey !== process.env.ZK_SYNC_API_KEY) {
    //   return res.status(401).json({ success: false, error: 'Unauthorized' });
    // }

    const { empName, ID, date, attendanceCount, checkInTimes } = req.body;

    // 3. Validate payload
    if (!empName || !ID || !date || !Array.isArray(checkInTimes)) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 4. Find or create employee by biometricId
    let employee = await Employee.findOne({ where: { biometricId: ID.toString() } });
    if (!employee) {
      // Create minimal employee record (adjust fields to match your model)
      employee = await Employee.create({
        employeeId: `ZK_${ID}`,
        fullName: empName,
        phoneNumber: '0000000000',
        monthlySalary: 0,
        joiningDate: new Date(),
        biometricId: ID.toString(),
        status: 'Active'
      });
      console.log(`Created new employee: ${employee.fullName} with ID ${employee.id}`);
    }

    // 5. Prepare punch records
    const punchRecords = checkInTimes.map(isoString => ({
      employeeId: employee.id,
      punchTime: new Date(isoString),
      date: date,
      source: 'ZK_SYNC'
    }));

    // 6. Bulk insert into punch_logs
    await PunchLog.bulkCreate(punchRecords);

    console.log(`✅ Stored ${punchRecords.length} punches for ${empName} (${ID}) on ${date}`);
    return res.status(200).json({ success: true, message: `${punchRecords.length} punches stored` });

  }
   catch (error) {
    console.log("🔥 SYNC ENDPOINT HIT with catch:", req.body);
    console.error('❌ Sync storage error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}