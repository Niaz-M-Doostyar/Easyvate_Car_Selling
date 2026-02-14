const Employee = require('../../models/Employee');
const Attendance = require('../../models/Attendance');
const Payroll = require('../../models/Payroll');
const { Op } = require('sequelize');

/**
 * Calculate salary based on attendance
 * @param {number} employeeId - Employee ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Object} - Calculated payroll data
 */
const calculatePayroll = async (employeeId, month, year) => {
  // Get employee
  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  if (employee.status !== 'Active') {
    throw new Error('Cannot calculate payroll for inactive employee');
  }

  // Get start and end date of month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const totalDaysInMonth = endDate.getDate();

  // Get attendance records for the month
  const attendanceRecords = await Attendance.findAll({
    where: {
      employeeId,
      date: {
        [Op.between]: [startDate, endDate]
      }
    }
  });

  // Count present days (including half days as 0.5)
  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let leaveDays = 0;
  let holidays = 0;

  attendanceRecords.forEach(record => {
    switch (record.status) {
      case 'Present':
        presentDays++;
        break;
      case 'Absent':
        absentDays++;
        break;
      case 'Half Day':
        halfDays++;
        presentDays += 0.5;
        break;
      case 'Leave':
        leaveDays++;
        presentDays++; // Paid leave counts as present
        break;
      case 'Holiday':
        holidays++;
        presentDays++; // Holidays count as present
        break;
    }
  });

  // Calculate working days (exclude holidays)
  const workingDays = totalDaysInMonth - holidays;
  
  // Calculate per-day salary
  const baseSalary = parseFloat(employee.monthlySalary);
  const perDaySalary = baseSalary / workingDays;
  
  // Calculate salary based on attendance
  const calculatedSalary = perDaySalary * presentDays;

  return {
    employeeId,
    employeeName: employee.fullName,
    month,
    year,
    baseSalary,
    workingDays,
    totalDaysInMonth,
    presentDays,
    absentDays,
    halfDays,
    leaveDays,
    holidays,
    perDaySalary: parseFloat(perDaySalary.toFixed(2)),
    calculatedSalary: parseFloat(calculatedSalary.toFixed(2)),
    attendanceRecords
  };
};

/**
 * Generate payroll for a specific employee and month
 * @param {number} employeeId 
 * @param {number} month 
 * @param {number} year 
 * @param {number} commission - Additional commission
 * @param {number} deductions - Deductions
 * @param {string} notes - Notes
 * @param {number} userId - User creating the payroll
 * @returns {Object} - Created payroll record
 */
const generatePayroll = async (employeeId, month, year, commission = 0, deductions = 0, notes = '', userId = null) => {
  // Check if payroll already exists
  const existing = await Payroll.findOne({
    where: { employeeId, month, year }
  });

  if (existing) {
    throw new Error(`Payroll for ${month}/${year} already exists for this employee`);
  }

  // Calculate attendance-based salary
  const calculation = await calculatePayroll(employeeId, month, year);

  // Calculate total amount
  const totalAmount = calculation.calculatedSalary + parseFloat(commission) - parseFloat(deductions);

  // Create payroll record
  const payroll = await Payroll.create({
    employeeId,
    month,
    year,
    baseSalary: calculation.baseSalary,
    presentDays: calculation.presentDays,
    absentDays: calculation.absentDays,
    calculatedSalary: calculation.calculatedSalary,
    commission: parseFloat(commission),
    deductions: parseFloat(deductions),
    totalAmount,
    paidAmount: 0,
    status: 'Pending',
    notes,
    paidBy: userId
  });

  return {
    payroll,
    calculation
  };
};

/**
 * Generate payroll for all active employees for a specific month
 * @param {number} month 
 * @param {number} year 
 * @param {number} userId - User generating payrolls
 * @returns {Array} - Generated payroll records
 */
const generateBulkPayroll = async (month, year, userId = null) => {
  const employees = await Employee.findAll({
    where: { status: 'Active' }
  });

  const results = [];
  const errors = [];

  for (const employee of employees) {
    try {
      const result = await generatePayroll(employee.id, month, year, 0, 0, 'Auto-generated', userId);
      results.push(result);
    } catch (error) {
      errors.push({
        employeeId: employee.id,
        employeeName: employee.fullName,
        error: error.message
      });
    }
  }

  return {
    success: results.length,
    errors: errors.length,
    results,
    errors
  };
};

/**
 * Mark payroll as paid
 * @param {number} payrollId 
 * @param {number} amount 
 * @param {number} userId 
 * @returns {Object} - Updated payroll
 */
const markPayrollPaid = async (payrollId, amount, userId) => {
  const payroll = await Payroll.findByPk(payrollId);
  if (!payroll) {
    throw new Error('Payroll not found');
  }

  const totalPaid = parseFloat(payroll.paidAmount) + parseFloat(amount);
  const totalAmount = parseFloat(payroll.totalAmount);

  let status = 'Pending';
  if (totalPaid >= totalAmount) {
    status = 'Paid';
  } else if (totalPaid > 0) {
    status = 'Partial';
  }

  await payroll.update({
    paidAmount: totalPaid,
    status,
    paymentDate: new Date(),
    paidBy: userId
  });

  return payroll;
};

module.exports = {
  calculatePayroll,
  generatePayroll,
  generateBulkPayroll,
  markPayrollPaid
};
