const sequelize = require('../config/database');

const User = require('./User');
const Vehicle = require('./Vehicle');
const VehicleCost = require('./VehicleCost');
const ReferencePerson = require('./ReferencePerson');
const SharingPerson = require('./SharingPerson');
const EditHistory = require('./EditHistory');
const Customer = require('./Customer');
const CustomerLedger = require('./CustomerLedger');
const ShowroomLedger = require('./ShowroomLedger');
const CurrencyExchange = require('./CurrencyExchange');
const Loan = require('./Loan');
const Employee = require('./Employee');
const Attendance = require('./Attendance');
const Payroll = require('./Payroll');
const Sale = require('./Sale');
const CommissionDistribution = require('./CommissionDistribution');
const LedgerTransaction = require('./LedgerTransaction');
const ExchangeRate = require('./ExchangeRate');

Vehicle.hasMany(VehicleCost, { foreignKey: 'vehicleId', as: 'costs' });
VehicleCost.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Vehicle.hasOne(ReferencePerson, { foreignKey: 'vehicleId', as: 'referencePerson' });
ReferencePerson.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Vehicle.hasMany(SharingPerson, { foreignKey: 'vehicleId', as: 'sharingPersons' });
SharingPerson.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Vehicle.hasMany(EditHistory, { foreignKey: 'entityId', as: 'editHistory', scope: { entityType: 'Vehicle' } });

Customer.hasMany(CustomerLedger, { foreignKey: 'customerId', as: 'ledger' });
CustomerLedger.belongsTo(Customer, { foreignKey: 'customerId' });

Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendance' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasMany(Payroll, { foreignKey: 'employeeId', as: 'payroll' });
Payroll.belongsTo(Employee, { foreignKey: 'employeeId' });

Sale.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Sale.hasMany(CommissionDistribution, { foreignKey: 'saleId', as: 'commissions' });
CommissionDistribution.belongsTo(Sale, { foreignKey: 'saleId' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  VehicleCost,
  ReferencePerson,
  SharingPerson,
  EditHistory,
  Customer,
  CustomerLedger,
  ShowroomLedger,
  CurrencyExchange,
  Loan,
  Employee,
  Attendance,
  Payroll,
  Sale,
  CommissionDistribution,
  LedgerTransaction,
  ExchangeRate
};
