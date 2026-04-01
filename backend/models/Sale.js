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
    allowNull: true,
    defaultValue: null
  },

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
  sellingCurrency: {
    type: DataTypes.STRING(10),
    defaultValue: 'AFN',
    comment: 'Currency of the selling price'
  },
  sellingPriceAFN: {
    type: DataTypes.DECIMAL(15, 2),
    comment: 'Selling price converted to AFN'
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
  exchangeRateUsed: {
    type: DataTypes.DECIMAL(15, 6),
    comment: 'Exchange rate used for payment currency conversion'
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
  // Buyer details (text fields instead of customer dropdown)
  buyerName: { type: DataTypes.STRING(255) },
  buyerFatherName: { type: DataTypes.STRING(255) },
  buyerPhone: { type: DataTypes.STRING(20) },
  buyerAddress: { type: DataTypes.TEXT },
  buyerIdNumber: { type: DataTypes.STRING(50) },
  buyerProvince: { type: DataTypes.STRING(100) },
  buyerDistrict: { type: DataTypes.STRING(100) },
  buyerVillage: { type: DataTypes.STRING(255) },
  
  notes: { type: DataTypes.TEXT },
  witnessName1: { type: DataTypes.STRING(255) },
  invoicePath: { type: DataTypes.STRING(255) },
  soldBy: { type: DataTypes.INTEGER }
}, {
  timestamps: true,
  tableName: 'sales'
});

module.exports = Sale;
