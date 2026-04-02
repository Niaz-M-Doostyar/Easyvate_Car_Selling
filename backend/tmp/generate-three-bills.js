const path = require('path');
const fs = require('fs');
const { generateSaleInvoicePdf } = require('../src/services/pdf');

const outDir = path.join(__dirname, '..', 'uploads', 'pdf-test');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const today = new Date().toISOString().split('T')[0];

const vehicle = {
  manufacturer: 'Toyota',
  model: 'Corolla',
  year: 2018,
  category: 'Sedan',
  color: 'سپین',
  chassisNumber: 'CH-TEST-0001',
  engineNumber: 'EN-TEST-0001',
  fuelType: 'Petrol',
  plateNo: 'P-TEST-01',
  transmission: 'Manual',
  steering: 'Right',
  monolithicCut: 'Monolithic',
  vehicleId: 'VTEST-001',
  mileage: 42000,
  vehicleLicense: 'VL-TEST-001',
};

const customer = {
  fullName: 'علي خان',
  fatherName: 'محمد',
  province: 'کابل',
  district: '۱',
  village: 'کلي',
  currentAddress: 'زموږ دفتر',
  nationalIdNumber: 'NID-000123',
  phoneNumber: '0700123456',
};

const sales = [
  // Exchange Car
  {
    saleId: 'EX-TEST-001',
    saleType: 'Exchange Car',
    saleDate: today,
    officeNumber: '0700000893',
    bookVolume: 'جلد 1',
    pageNumber: '892',
    serialNumber: 'SYS-892',
    sellerName: 'پلورونکی شریف',
    sellerFatherName: 'والد',
    sellerProvince: 'کابل',
    sellerDistrict: 'شهر',
    sellerVillage: 'کلي',
    sellerAddress: 'د پلور پته',
    sellerIdNumber: 'S-001',
    sellerPhone: '0700000001',
    buyerName: 'پیرودونکی احمد',
    buyerFatherName: 'والد',
    buyerProvince: 'کندهار',
    buyerDistrict: 'ښار',
    buyerVillage: 'کلي',
    buyerAddress: 'پیرودونکی پته',
    buyerIdNumber: 'B-001',
    buyerPhone: '0700000002',
    exchVehicleManufacturer: 'Honda',
    exchVehicleModel: 'Civic',
    exchVehicleYear: 2015,
    exchVehicleCategory: 'Sedan',
    exchVehicleColor: 'تور',
    exchVehicleChassis: 'EXCH-CH-001',
    exchVehicleEngine: 'EX-ENG-001',
    exchVehicleFuelType: 'Petrol',
    exchVehiclePlateNo: 'EX-111',
    exchVehicleTransmission: 'Manual',
    exchVehicleSteering: 'Right',
    exchVehicleMonolithicCut: 'Monolithic',
    sellingPrice: 30000,
    priceDifference: 5000,
    priceDifferencePaidBy: 'Buyer',
    notes: 'تبادله ازمایشی',
    witnessName1: 'شاهد ۱',
    witnessName2: 'شاهد اضافي ۱',
  },

  // Container One Key
  {
    saleId: 'CT-TEST-001',
    saleType: 'Container One Key',
    saleDate: today,
    officeNumber: '0700000893',
    bookVolume: 'جلد 65',
    pageNumber: '65',
    serialNumber: 'SYS-065',
    sellerName: 'پلورونکی یاسین',
    sellerFatherName: 'والد',
    sellerProvince: 'هرات',
    sellerDistrict: 'شهر',
    sellerVillage: 'کلي',
    sellerAddress: 'د پلور پته',
    sellerIdNumber: 'S-002',
    sellerPhone: '0700000003',
    buyerName: 'پیرودونکی خالد',
    buyerFatherName: 'والد',
    buyerProvince: 'هرات',
    buyerDistrict: 'شهر',
    buyerVillage: 'کلي',
    buyerAddress: 'پیرودونکی پته',
    buyerIdNumber: 'B-002',
    buyerPhone: '0700000004',
    sellingPrice: 20000,
    downPayment: 5000,
    remainingAmount: 15000,
    notes: 'کانتینر ازمایشی',
    witnessName1: 'شاهد ۲',
    witnessName2: 'شاهد اضافي ۲',
  },

  // Licensed Car
  {
    saleId: 'LC-TEST-001',
    saleType: 'Licensed Car',
    saleDate: today,
    officeNumber: '0700000893',
    bookVolume: 'جلد 178',
    pageNumber: '178',
    serialNumber: 'SYS-178',
    trafficTransferDate: today,
    sellerName: 'پلورونکی جان',
    sellerFatherName: 'والد',
    sellerProvince: 'کابل',
    sellerDistrict: 'شهر',
    sellerVillage: 'کلي',
    sellerAddress: 'د پلور پته',
    sellerIdNumber: 'S-003',
    sellerPhone: '0700000005',
    buyerName: 'پیرودونکی خان',
    buyerFatherName: 'والد',
    buyerProvince: 'کابل',
    buyerDistrict: 'شهر',
    buyerVillage: 'کلي',
    buyerAddress: 'پیرودونکی پته',
    buyerIdNumber: 'B-003',
    buyerPhone: '0700000006',
    sellingPrice: 45000,
    downPayment: 10000,
    remainingAmount: 35000,
    notes: 'اسناد ازمایشی',
    witnessName1: 'شاهد ۳',
    witnessName2: 'شاهد اضافي ۳',
  }
];

console.log('Generating sample invoices to', outDir);

Promise.all(sales.map((s) => generateSaleInvoicePdf(s, vehicle, customer, outDir)))
  .then((results) => {
    console.log('Generated invoices:');
    results.forEach((r) => console.log('-', r.fileName, '->', r.filePath));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error generating invoices:', err);
    process.exit(2);
  });
