const sequelize = require('../../config/database');
const Sale = require('../../models/Sale');
const SharingPerson = require('../../models/SharingPerson');
const CommissionDistribution = require('../../models/CommissionDistribution');
const CustomerLedger = require('../../models/CustomerLedger');

const SALE_COMPAT_COLUMNS = [
  'buyerName',
  'buyerFatherName',
  'buyerProvince',
  'buyerDistrict',
  'buyerVillage',
  'buyerAddress',
  'buyerIdNumber',
  'buyerPhone',
  'paymentCurrency',
  'sellerName',
  'sellerFatherName',
  'sellerProvince',
  'sellerDistrict',
  'sellerVillage',
  'sellerAddress',
  'sellerIdNumber',
  'sellerPhone',
  'exchVehicleCategory',
  'exchVehicleManufacturer',
  'exchVehicleModel',
  'exchVehicleYear',
  'exchVehicleColor',
  'exchVehicleChassis',
  'exchVehicleEngine',
  'exchVehicleEngineType',
  'exchVehicleFuelType',
  'exchVehicleTransmission',
  'exchVehicleMileage',
  'exchVehiclePlateNo',
  'exchVehicleLicense',
  'exchVehicleSteering',
  'exchVehicleMonolithicCut',
  'priceDifference',
  'priceDifferencePaidBy',
  'trafficTransferDate',
  'exchangeVehicleId',
  'note2',
  'witnessName2',
];

const SHARING_PERSON_COMPAT_COLUMNS = ['customerId', 'calculationMethod'];
const COMMISSION_DISTRIBUTION_COMPAT_COLUMNS = ['customerId', 'investmentAmount', 'calculationMethod'];

const CUSTOMER_LEDGER_TYPES = [
  'Received',
  'Paid',
  'Sale',
  'Investment',
  'Loan',
  'Loan Payment',
  'Installment',
  'Profit Share',
];

const buildColumnDefinition = (attribute) => {
  const definition = {
    type: attribute.type,
    allowNull: attribute.allowNull !== undefined ? attribute.allowNull : true,
  };

  if (attribute.defaultValue !== undefined) {
    definition.defaultValue = attribute.defaultValue;
  }

  if (attribute.comment) {
    definition.comment = attribute.comment;
  }

  return definition;
};

const ensureSaleCompatibilityColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const existingColumns = await queryInterface.describeTable(Sale.getTableName());

  for (const columnName of SALE_COMPAT_COLUMNS) {
    if (existingColumns[columnName]) {
      continue;
    }

    const attribute = Sale.rawAttributes[columnName];
    if (!attribute) {
      continue;
    }

    await queryInterface.addColumn(Sale.getTableName(), columnName, buildColumnDefinition(attribute));
    console.log(`✓ Added missing sales.${columnName} column`);
  }
};

const ensureModelColumns = async (Model, columnNames, tableLabel) => {
  const queryInterface = sequelize.getQueryInterface();
  const tableName = Model.getTableName();
  const existingColumns = await queryInterface.describeTable(tableName);

  for (const columnName of columnNames) {
    if (existingColumns[columnName]) {
      continue;
    }

    const attribute = Model.rawAttributes[columnName];
    if (!attribute) {
      continue;
    }

    await queryInterface.addColumn(tableName, columnName, buildColumnDefinition(attribute));
    console.log(`✓ Added missing ${tableLabel}.${columnName} column`);
  }
};

const ensureCustomerLedgerTypes = async () => {
  const tableName = CustomerLedger.getTableName();
  const enumValues = CUSTOMER_LEDGER_TYPES.map((value) => `'${value}'`).join(', ');
  await sequelize.query(`
    ALTER TABLE \`${tableName}\`
    MODIFY COLUMN \`type\` ENUM(${enumValues}) NOT NULL
  `);
};

const ensureSchemaCompatibility = async () => {
  await ensureSaleCompatibilityColumns();
  await ensureModelColumns(SharingPerson, SHARING_PERSON_COMPAT_COLUMNS, 'sharing_persons');
  await ensureModelColumns(CommissionDistribution, COMMISSION_DISTRIBUTION_COMPAT_COLUMNS, 'commission_distributions');
  await ensureCustomerLedgerTypes();
};

module.exports = { ensureSchemaCompatibility };