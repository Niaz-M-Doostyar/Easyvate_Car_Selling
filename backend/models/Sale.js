const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  saleId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  // ── Sale Type ──────────────────────────────────
  saleType: {
    type: DataTypes.ENUM('Exchange Car', 'Container One Key', 'Licensed Car'),
    allowNull: false,
    defaultValue: 'Container One Key'
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true  // Auto-created from buyer fields if not provided
  },

  // ── Buyer Info (پیرودونکي) ─────────────────────
  buyerName: { type: DataTypes.STRING(255) },
  buyerFatherName: { type: DataTypes.STRING(255) },
  buyerProvince: { type: DataTypes.STRING(100) },
  buyerDistrict: { type: DataTypes.STRING(100) },
  buyerVillage: { type: DataTypes.STRING(255) },
  buyerAddress: { type: DataTypes.TEXT },
  buyerIdNumber: { type: DataTypes.STRING(50) },
  buyerPhone: { type: DataTypes.STRING(20) },

  // ── Payment Currency ───────────────────────────
  paymentCurrency: { type: DataTypes.STRING(10), defaultValue: 'AFN' },

  // ── Seller / Exchanger Info (رانبوونکي) ─────────
  sellerName: { type: DataTypes.STRING(255) },
  sellerFatherName: { type: DataTypes.STRING(255) },
  sellerProvince: { type: DataTypes.STRING(100) },
  sellerDistrict: { type: DataTypes.STRING(100) },
  sellerVillage: { type: DataTypes.STRING(255) },
  sellerAddress: { type: DataTypes.TEXT },
  sellerIdNumber: { type: DataTypes.STRING(50) },
  sellerPhone: { type: DataTypes.STRING(20) },

  // ── Exchange Car Fields (تبادله) ───────────────
  exchVehicleCategory: { type: DataTypes.STRING(100) },
  exchVehicleManufacturer: { type: DataTypes.STRING(100) },
  exchVehicleModel: { type: DataTypes.STRING(100) },
  exchVehicleYear: { type: DataTypes.INTEGER },
  exchVehicleColor: { type: DataTypes.STRING(50) },
  exchVehicleChassis: { type: DataTypes.STRING(100) },
  exchVehicleEngine: { type: DataTypes.STRING(100) },
  exchVehicleEngineType: { type: DataTypes.STRING(100) },
  exchVehicleFuelType: { type: DataTypes.STRING(50) },
  exchVehicleTransmission: { type: DataTypes.STRING(50) },
  exchVehicleMileage: { type: DataTypes.INTEGER },
  exchVehiclePlateNo: { type: DataTypes.STRING(50) },
  exchVehicleLicense: { type: DataTypes.STRING(100) },
  exchVehicleSteering: { type: DataTypes.STRING(20), defaultValue: 'Left' },
  exchVehicleMonolithicCut: { type: DataTypes.STRING(50) },
  priceDifference: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  priceDifferencePaidBy: { type: DataTypes.ENUM('Buyer', 'Seller'), defaultValue: 'Buyer' },

  // ── Licensed Car Fields (اسناد دار) ───────────
  trafficTransferDate: { type: DataTypes.DATE },

  // ── Financial Fields ────────────────────────────
  sellingPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  totalCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  profit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  ownerShare: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  saleDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    defaultValue: 'Cash'
  },
  downPayment: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  paymentStatus: {
    type: DataTypes.ENUM('Paid', 'Partial', 'Pending'),
    defaultValue: 'Pending'
  },

  // ── Exchange Vehicle added to inventory ────────
  exchangeVehicleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the new vehicle created in inventory from exchange'
  },

  // ── Notes & Misc ───────────────────────────────
  notes: { type: DataTypes.TEXT },
  note2: { type: DataTypes.TEXT },
  // Traditional bill metadata
  officeNumber: { type: DataTypes.STRING(100) },
  bookVolume: { type: DataTypes.STRING(100) },
  pageNumber: { type: DataTypes.STRING(50) },
  serialNumber: { type: DataTypes.STRING(100) },
  witnessName1: { type: DataTypes.STRING(255) },
  witnessName2: { type: DataTypes.STRING(255) },
  invoicePath: { type: DataTypes.STRING(255) },
  soldBy: { type: DataTypes.INTEGER }
}, {
  timestamps: true,
  tableName: 'sales'
});

module.exports = Sale;
