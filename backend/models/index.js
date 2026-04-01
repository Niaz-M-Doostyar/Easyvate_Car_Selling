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
const DailyExchangeRate = require('./DailyExchangeRate');
const VehicleImage = require('./VehicleImage');
const VehicleDropdownOption = require('./VehicleDropdownOption');
const { AboutEnglish, AboutPashto, AboutDari } = require('./About');
const { TeamEnglish, TeamPashto, TeamDari } = require('./Team');
const { AboutLogoEnglish, AboutLogoPashto, AboutLogoDari } = require('./AboutLogo');
const { ContactEnglish, ContactPashto, ContactDari } = require('./Contact');
const Carousel = require('./Carousel');
const { TestimonialEnglish, TestimonialPashto, TestimonialDari } = require('./Testimonial');
const Video = require('./ChooseVideo');

Vehicle.hasMany(VehicleImage, { as: 'images', foreignKey: 'vehicleId' });
VehicleImage.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Vehicle.hasMany(VehicleCost, { foreignKey: 'vehicleId', as: 'costs' });
VehicleCost.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Vehicle.hasOne(ReferencePerson, { foreignKey: 'vehicleId', as: 'referencePerson' });
ReferencePerson.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Vehicle.hasMany(SharingPerson, { foreignKey: 'vehicleId', as: 'sharingPersons' });
SharingPerson.belongsTo(Vehicle, { foreignKey: 'vehicleId' });
SharingPerson.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(SharingPerson, { foreignKey: 'customerId', as: 'sharingPersons' });

Vehicle.hasMany(EditHistory, { foreignKey: 'entityId', as: 'editHistory', scope: { entityType: 'Vehicle' } });

Customer.hasMany(CustomerLedger, { foreignKey: 'customerId', as: 'ledger' });
CustomerLedger.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Loan.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Loan, { foreignKey: 'customerId', as: 'loans' });

ShowroomLedger.belongsTo(Customer, { foreignKey: 'personId', as: 'person' });

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
  VehicleImage,
  VehicleCost,
  VehicleDropdownOption,
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
  ExchangeRate,
  DailyExchangeRate,
  AboutEnglish,
  AboutPashto,
  AboutDari,
  AboutLogoEnglish,
  AboutLogoPashto,
  AboutLogoDari,
  TeamEnglish,
  TeamPashto,
  TeamDari,
  ContactEnglish,
  ContactPashto,
  ContactDari,
  Carousel,
  TestimonialEnglish,
  TestimonialPashto,
  TestimonialDari,
  Video
};
