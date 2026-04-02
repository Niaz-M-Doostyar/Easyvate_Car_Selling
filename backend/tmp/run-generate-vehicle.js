const path = require('path');
const fs = require('fs');
const { generateVehiclePdf } = require('../src/services/pdf');

const outDir = path.join(__dirname, '..', 'uploads', 'pdf-test');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const vehicle = {
  vehicleId: 'VTEST001',
  category: 'Sedan',
  manufacturer: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'سور',
  chassisNumber: 'CHASSIS-12345',
  engineNumber: 'ENG-12345',
  engineType: 'I4',
  fuelType: 'Petrol',
  transmission: 'Manual',
  mileage: 12000,
  plateNo: 'AB-123',
  vehicleLicense: 'VL-987',
  steering: 'Right',
  monolithicCut: 'Monolithic',
  status: 'Available',
  sellingPrice: 25000,
  totalCostPKR: 20000,
};

console.log('Generating vehicle PDF to', outDir);

generateVehiclePdf(vehicle, outDir)
  .then((res) => {
    console.log('Generated PDF:', res);
    process.exit(0);
  })
  .catch((err) => {
    console.error('PDF generation error:', err);
    process.exit(2);
  });
