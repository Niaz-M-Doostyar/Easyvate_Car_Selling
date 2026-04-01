/**
 * Database migrations — adds new / renamed columns to existing tables.
 * Uses a try/catch per column so it is idempotent: safe to run on every
 * server start.  MySQL error ER_DUP_FIELDNAME (1060) is silently ignored
 * because it just means the column already exists.
 */

'use strict';

const { DataTypes } = require('sequelize');

/* ─── helper ─────────────────────────────────────────────────────────────── */

async function addCol(sequelize, table, column, typeDef) {
  try {
    await sequelize.query(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${typeDef}`
    );
    console.log(`  [migration] Added ${table}.${column}`);
  } catch (err) {
    // 1060 = ER_DUP_FIELDNAME — column already exists, nothing to do
    if (err.original && err.original.errno === 1060) return;
    if (err.message && err.message.includes('Duplicate column')) return;
    console.warn(`  [migration] ${table}.${column}: ${err.message}`);
  }
}

/* ─── main ───────────────────────────────────────────────────────────────── */

async function runMigrations(sequelize) {
  console.log('[migrations] Running schema migrations…');

  // ── vehicles ──────────────────────────────────────────────────────────────
  await addCol(sequelize, 'vehicles', 'totalCostAFN',       'DECIMAL(15,2) DEFAULT NULL COMMENT "Total cost in Afghani"');
  await addCol(sequelize, 'vehicles', 'sellingPriceAFN',    'DECIMAL(15,2) DEFAULT NULL COMMENT "Selling price in Afghani"');

  // ── vehicle_costs ─────────────────────────────────────────────────────────
  await addCol(sequelize, 'vehicle_costs', 'amountInAFN',     'DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT "Amount in AFN"');
  await addCol(sequelize, 'vehicle_costs', 'exchangeRateUsed','DECIMAL(15,6) DEFAULT NULL COMMENT "Rate used for conversion"');

  // ── showroom_ledger ───────────────────────────────────────────────────────
  await addCol(sequelize, 'showroom_ledger', 'amountInAFN',     'DECIMAL(15,2) NOT NULL DEFAULT 0');
  await addCol(sequelize, 'showroom_ledger', 'exchangeRateUsed','DECIMAL(15,6) DEFAULT NULL');
  await addCol(sequelize, 'showroom_ledger', 'personId',        'INT DEFAULT NULL COMMENT "Reference to customer if applicable"');
  await addCol(sequelize, 'showroom_ledger', 'personName',      'VARCHAR(255) DEFAULT NULL');
  await addCol(sequelize, 'showroom_ledger', 'referenceId',     'INT DEFAULT NULL');
  await addCol(sequelize, 'showroom_ledger', 'referenceType',   'VARCHAR(50) DEFAULT NULL');

  // ── customer_ledger ───────────────────────────────────────────────────────
  await addCol(sequelize, 'customer_ledger', 'amountInAFN',     'DECIMAL(15,2) NOT NULL DEFAULT 0');
  await addCol(sequelize, 'customer_ledger', 'exchangeRateUsed','DECIMAL(15,6) DEFAULT NULL');

  // ── loans ─────────────────────────────────────────────────────────────────
  await addCol(sequelize, 'loans', 'amountInAFN',     'DECIMAL(15,2) NOT NULL DEFAULT 0');
  await addCol(sequelize, 'loans', 'exchangeRateUsed','DECIMAL(15,6) DEFAULT NULL');
  await addCol(sequelize, 'loans', 'customerId',      'INT DEFAULT NULL COMMENT "Reference to customer"');

  // ── ledger_transactions ───────────────────────────────────────────────────
  await addCol(sequelize, 'ledger_transactions', 'amountAFN',        'DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT "Amount in AFN"');
  await addCol(sequelize, 'ledger_transactions', 'exchangeRateUsed', 'DECIMAL(15,6) DEFAULT NULL');

  // ── sales ─────────────────────────────────────────────────────────────────
  await addCol(sequelize, 'sales', 'sellingCurrency',  'VARCHAR(10) DEFAULT "AFN" COMMENT "Currency of the selling price"');
  await addCol(sequelize, 'sales', 'sellingPriceAFN',  'DECIMAL(15,2) DEFAULT NULL COMMENT "Selling price in AFN"');
  await addCol(sequelize, 'sales', 'exchangeRateUsed', 'DECIMAL(15,6) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchangeVehicleId','INT DEFAULT NULL COMMENT "Vehicle created from exchange"');

  // Buyer detail text fields
  await addCol(sequelize, 'sales', 'buyerName',        'VARCHAR(255) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'buyerFatherName',  'VARCHAR(255) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'buyerPhone',       'VARCHAR(20)  DEFAULT NULL');
  await addCol(sequelize, 'sales', 'buyerAddress',     'TEXT         DEFAULT NULL');
  await addCol(sequelize, 'sales', 'buyerIdNumber',    'VARCHAR(50)  DEFAULT NULL');
  await addCol(sequelize, 'sales', 'buyerProvince',    'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'buyerDistrict',    'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'buyerVillage',     'VARCHAR(255) DEFAULT NULL');

  // Seller/exchanger detail text fields
  await addCol(sequelize, 'sales', 'sellerName',       'VARCHAR(255) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'sellerFatherName', 'VARCHAR(255) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'sellerProvince',   'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'sellerDistrict',   'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'sellerVillage',    'VARCHAR(255) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'sellerAddress',    'TEXT         DEFAULT NULL');
  await addCol(sequelize, 'sales', 'sellerIdNumber',   'VARCHAR(50)  DEFAULT NULL');
  await addCol(sequelize, 'sales', 'sellerPhone',      'VARCHAR(20)  DEFAULT NULL');

  // Exchange vehicle fields
  await addCol(sequelize, 'sales', 'exchVehicleCategory',    'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleManufacturer','VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleModel',       'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleYear',        'INT          DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleColor',       'VARCHAR(50)  DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleChassis',     'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleEngine',      'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleEngineType',  'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleFuelType',    'VARCHAR(50)  DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleTransmission','VARCHAR(50)  DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleMileage',     'INT          DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehiclePlateNo',     'VARCHAR(50)  DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleLicense',     'VARCHAR(100) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'exchVehicleSteering',    'VARCHAR(20)  DEFAULT "Left"');
  await addCol(sequelize, 'sales', 'exchVehicleMonolithicCut','VARCHAR(50) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'priceDifference',        'DECIMAL(15,2) DEFAULT 0');
  await addCol(sequelize, 'sales', 'trafficTransferDate',    'DATETIME DEFAULT NULL');
  await addCol(sequelize, 'sales', 'witnessName1',           'VARCHAR(255) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'invoicePath',            'VARCHAR(255) DEFAULT NULL');
  await addCol(sequelize, 'sales', 'soldBy',                 'INT DEFAULT NULL');

  // ── sharing_persons ───────────────────────────────────────────────────────
  await addCol(sequelize, 'sharing_persons', 'customerId', 'INT DEFAULT NULL COMMENT "Reference to customer"');

  // ── schema fixes ──────────────────────────────────────────────────────────
  // Make sales.customerId nullable (buyer/seller are text fields now)
  try {
    await sequelize.query('ALTER TABLE sales MODIFY customerId INT NULL DEFAULT NULL');
  } catch(e) { /* ignore if already nullable */ }

  // Make sharing_persons.customerId nullable (was NOT NULL DEFAULT 0)
  try {
    await sequelize.query('ALTER TABLE sharing_persons MODIFY customerId INT NULL DEFAULT NULL');
  } catch(e) { /* ignore */ }

  // Clean up deprecated customer types from older schemas/data.
  try {
    await sequelize.query("UPDATE customers SET customerType = 'Investor' WHERE customerType = 'Capital Provider'");
  } catch(e) { /* ignore */ }
  try {
    await sequelize.query("ALTER TABLE customers MODIFY customerType ENUM('Buyer', 'Investor', 'Borrower') DEFAULT 'Buyer'");
  } catch(e) { /* ignore */ }

  // Fix legacy PKR columns — make nullable so inserts without them don't fail
  try {
    await sequelize.query('ALTER TABLE ledger_transactions MODIFY amountPKR DECIMAL(15,2) NULL DEFAULT NULL');
  } catch(e) { /* column may not exist */ }
  try {
    await sequelize.query('ALTER TABLE showroom_ledger MODIFY amountInPKR DECIMAL(15,2) NULL DEFAULT NULL');
  } catch(e) { /* column may not exist */ }
  try {
    await sequelize.query('ALTER TABLE vehicle_costs MODIFY amountInPKR DECIMAL(15,2) NULL DEFAULT NULL');
  } catch(e) { /* column may not exist */ }

  // Clean up duplicate saleId unique indexes on sales table (left from alter:true era)
  try {
    const [rows] = await sequelize.query(
      "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales' AND INDEX_NAME LIKE 'saleId_%' AND NON_UNIQUE=0"
    );
    for (const row of rows) {
      try { await sequelize.query(`ALTER TABLE sales DROP INDEX \`${row.INDEX_NAME}\``); } catch(e) {}
    }
  } catch(e) { /* ignore */ }

  console.log('[migrations] Schema migrations complete.');
}

module.exports = { runMigrations };
