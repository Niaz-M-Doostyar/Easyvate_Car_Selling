const { sequelize } = require('./models');
const Vehicle = require('./models/Vehicle');
const Sale = require('./models/Sale');
const Customer = require('./models/Customer');

const mockVehicles = [
  {
    vehicleId: 'VHC-2024-001',
    category: 'Sedan',
    manufacturer: 'Toyota',
    model: 'Corolla',
    year: 2023,
    color: 'White',
    chassisNumber: 'JT123456789012345',
    engineNumber: '1NZ1234567',
    engineType: '1.8L Petrol',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: 0,
    status: 'Available',
    basePurchasePrice: 15000.00,
    baseCurrency: 'USD',
    transportCostToDubai: 500.00,
    importCostToAfghanistan: 2000.00,
    repairCost: 300.00,
    totalCostAFN: 1650000.00,
    sellingPrice: 1850000.00
  },
  {
    vehicleId: 'VHC-2024-002',
    category: 'SUV',
    manufacturer: 'Honda',
    model: 'CR-V',
    year: 2023,
    color: 'Black',
    chassisNumber: 'JH456789012345678',
    engineNumber: 'R201234567',
    engineType: '2.0L Petrol',
    fuelType: 'Petrol',
    transmission: 'CVT',
    mileage: 0,
    status: 'Available',
    basePurchasePrice: 25000.00,
    baseCurrency: 'USD',
    transportCostToDubai: 800.00,
    importCostToAfghanistan: 3500.00,
    repairCost: 500.00,
    totalCostAFN: 2750000.00,
    sellingPrice: 3100000.00
  },
  {
    vehicleId: 'VHC-2024-003',
    category: 'Pickup',
    manufacturer: 'Toyota',
    model: 'Hilux',
    year: 2023,
    color: 'Silver',
    chassisNumber: 'MR012345678901234',
    engineNumber: '1GD1234567',
    engineType: '2.8L Diesel',
    fuelType: 'Diesel',
    transmission: 'Manual',
    mileage: 0,
    status: 'Available',
    basePurchasePrice: 30000.00,
    baseCurrency: 'USD',
    transportCostToDubai: 1000.00,
    importCostToAfghanistan: 4000.00,
    repairCost: 700.00,
    totalCostAFN: 3300000.00,
    sellingPrice: 3700000.00
  },
  {
    vehicleId: 'VHC-2024-004',
    category: 'Hatchback',
    manufacturer: 'Suzuki',
    model: 'Swift',
    year: 2023,
    color: 'Red',
    chassisNumber: 'ZS123456789012345',
    engineNumber: 'K121234567',
    engineType: '1.2L Petrol',
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: 0,
    status: 'Sold',
    basePurchasePrice: 12000.00,
    baseCurrency: 'USD',
    transportCostToDubai: 400.00,
    importCostToAfghanistan: 1500.00,
    repairCost: 200.00,
    totalCostAFN: 1320000.00,
    sellingPrice: 1480000.00
  },
  {
    vehicleId: 'VHC-2024-005',
    category: 'Sedan',
    manufacturer: 'Hyundai',
    model: 'Elantra',
    year: 2023,
    color: 'Blue',
    chassisNumber: 'KMH12345678901234',
    engineNumber: 'G1L1234567',
    engineType: '2.0L Petrol',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: 0,
    status: 'Sold',
    basePurchasePrice: 18000.00,
    baseCurrency: 'USD',
    transportCostToDubai: 600.00,
    importCostToAfghanistan: 2500.00,
    repairCost: 400.00,
    totalCostAFN: 1980000.00,
    sellingPrice: 2220000.00
  }
];

const addMockVehiclesAndSales = async () => {
  try {
    console.log('🔄 Adding mock vehicles and sales data...');

    // Check if vehicles already exist
    const existingVehiclesCount = await Vehicle.count();
    if (existingVehiclesCount > 0) {
      console.log(`⚠️  ${existingVehiclesCount} vehicles already exist. Skipping vehicle creation.`);
    } else {
      // Add mock vehicles
      for (const vehicleData of mockVehicles) {
        await Vehicle.create(vehicleData);
        console.log(`✅ Added vehicle: ${vehicleData.vehicleId} - ${vehicleData.manufacturer} ${vehicleData.model}`);
      }
      console.log(`📊 Total vehicles added: ${mockVehicles.length}`);
    }

    // Check if sales already exist
    const existingSalesCount = await Sale.count();
    if (existingSalesCount > 0) {
      console.log(`⚠️  ${existingSalesCount} sales already exist. Skipping sales creation.`);
      return;
    }

    // Get customers and vehicles for sales
    const customers = await Customer.findAll({ limit: 3 });
    const soldVehicles = await Vehicle.findAll({ where: { status: 'Sold' } });

    if (customers.length === 0 || soldVehicles.length === 0) {
      console.log('⚠️  Not enough customers or sold vehicles to create sales records.');
      return;
    }

    // Create sales for sold vehicles
    const salesData = [
      {
        saleId: 'SALE-2024-001',
        vehicleId: soldVehicles[0].id,
        customerId: customers[0].id,
        sellingPrice: 1480000.00,
        totalCost: 1320000.00,
        profit: 160000.00,
        commission: 14800.00,
        ownerShare: 145200.00,
        saleDate: new Date('2024-01-15'),
        paymentMethod: 'Cash',
        downPayment: 500000.00,
        remainingAmount: 980000.00,
        paidAmount: 980000.00,
        paymentStatus: 'Paid',
        notes: 'Full cash payment',
        soldBy: 1
      },
      {
        saleId: 'SALE-2024-002',
        vehicleId: soldVehicles[1].id,
        customerId: customers[1].id,
        sellingPrice: 2220000.00,
        totalCost: 1980000.00,
        profit: 240000.00,
        commission: 22200.00,
        ownerShare: 217800.00,
        saleDate: new Date('2024-02-01'),
        paymentMethod: 'Installment',
        downPayment: 800000.00,
        remainingAmount: 1420000.00,
        paidAmount: 500000.00,
        paymentStatus: 'Partial',
        notes: '3-year installment plan',
        soldBy: 1
      }
    ];

    // Add sales
    for (const saleData of salesData) {
      await Sale.create(saleData);
      console.log(`✅ Added sale: ${saleData.saleId}`);
    }

    console.log(`📊 Total sales added: ${salesData.length}`);
    console.log('🎉 Mock vehicles and sales data added successfully!');

  } catch (error) {
    console.error('❌ Error adding mock data:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run the script
addMockVehiclesAndSales();