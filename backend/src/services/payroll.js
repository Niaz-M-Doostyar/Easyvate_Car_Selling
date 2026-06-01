const Employee = require('../../models/Employee');
const Attendance = require('../../models/Attendance');
const Payroll = require('../../models/Payroll');
const { Op } = require('sequelize');
const { getDailyWorkingHours, getWorkedHours, getLeaveDays } = require('./attendance');

/**
 * Calculate salary based on monthly attendance report
 * @param {number} employeeId - Employee ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Object} - Calculated payroll data
 */
const calculatePayroll = async function calculatePayroll(employeeId, month, year, commission = 0, deductions = 0) {
  const employee = await Employee.findByPk(employeeId);
  if (!employee) throw new Error('Employee not found');

  const monthlySalary = parseFloat(employee.monthlySalary) || 0;
  const totalDays = new Date(year, month, 0).getDate();
  const dailyWorkingHours = await getDailyWorkingHours();

  const totalHoursInMonth = totalDays * dailyWorkingHours;
  const hourlyRate = monthlySalary / totalHoursInMonth;

  const actualWorkedHours = await getWorkedHours(employeeId, month, year);
  const leaveDays = await getLeaveDays(employeeId, month, year);
  const leaveHours = leaveDays * dailyWorkingHours;

  const totalEarnedHours = actualWorkedHours + leaveHours;
  const baseSalary = hourlyRate * totalEarnedHours;

  const presentDays = Math.floor(totalEarnedHours / dailyWorkingHours); // approximation
  const absentDays = totalDays - presentDays;

  const totalAmount = baseSalary + parseFloat(commission) - parseFloat(deductions);

  return {
    employeeId,
    month,
    year,
    monthlySalary,
    hourlyRate,
    dailyWorkingHours,
    totalHoursInMonth,
    actualWorkedHours,
    leaveDays,
    leaveHours,
    totalEarnedHours,
    baseSalary,
    calculatedSalary: baseSalary,
    presentDays,
    absentDays,
    commission: parseFloat(commission),
    deductions: parseFloat(deductions),
    totalAmount
  };
}

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
  // Prevent future-month payroll generation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    throw new Error(`Cannot generate payroll for a future month (${month}/${year})`);
  }

  // Check if payroll already exists
  const existing = await Payroll.findOne({
    where: { employeeId, month, year }
  });
  if (existing) {
    throw new Error(`Payroll for ${month}/${year} already exists for this employee`);
  }

  // Calculate attendance-based salary (pass commission/deductions so preview matches)
  const calculation = await calculatePayroll(employeeId, month, year, commission, deductions);

  // Create payroll record using calculation.totalAmount
  const payroll = await Payroll.create({
    employeeId,
    month,
    year,
    baseSalary: calculation.baseSalary,
    presentDays: calculation.presentDays,
    absentDays: calculation.absentDays,
    calculatedSalary: calculation.calculatedSalary,
    commission: calculation.commission,   // from calculation
    deductions: calculation.deductions,   // from calculation
    totalAmount: calculation.totalAmount,
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
