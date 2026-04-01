const http = require('http');

const loginData = JSON.stringify({ username: 'admin', password: 'admin123' });

function httpReq(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function run() {
  // Login
  const login = await httpReq({
    hostname: 'localhost', port: 3001, path: '/api/auth/login',
    method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, loginData);

  const token = login.data.token || login.data.data?.token;
  if (!token) { console.log('Login failed:', JSON.stringify(login.data)); return; }
  console.log('✓ Token obtained');

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  // Get customers first
  const cRes = await httpReq({ hostname: 'localhost', port: 3001, path: '/api/customers', headers: authHeaders });
  const customers = cRes.data.data || [];

  console.log('Customers:', customers.length);

  if (customers.length === 0) { console.log('No customers'); return; }

  console.log('Using Customer:', customers[0].id, customers[0].fullName);

  // Create a test vehicle for container sale
  const vehiclePayload = {
    category: 'Sedan',
    manufacturer: 'Honda',
    model: 'Civic',
    year: 2022,
    color: 'Blue',
    chassisNumber: 'TEST-CHASSIS-' + Date.now(),
    engineNumber: 'ENG-' + Date.now(),
    engineType: 'I4',
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: 5000,
    steering: 'Right',
    monolithicCut: 'Monolithic',
    basePurchasePrice: 25000,
    baseCurrency: 'AFN',
    totalCostAFN: 25000,
    status: 'Available'
  };

  console.log('Creating test vehicle...');
  const vehicleRes = await httpReq({
    hostname: 'localhost', port: 3001, path: '/api/vehicles',
    method: 'POST', headers: authHeaders
  }, JSON.stringify(vehiclePayload));

  console.log('Vehicle creation status:', vehicleRes.status);
  if (vehicleRes.status !== 201) {
    console.log('Vehicle creation failed:', JSON.stringify(vehicleRes.data, null, 2));
    return;
  }

  const newVehicle = vehicleRes.data;
  console.log('✓ Vehicle created:', newVehicle.id, newVehicle.manufacturer, newVehicle.model);

  // Test sale - Licensed Car
  const salePayload = {
    saleType: 'Licensed Car',
    vehicleId: newVehicle.id,
    customerId: customers[0].id,
    saleDate: new Date().toISOString().split('T')[0],
    sellingPrice: 40000,
    downPayment: 20000,
    remainingAmount: 20000,
    trafficTransferDate: '2024-03-15',
    notes: 'Test licensed car sale for PDF generation',
  };

  console.log('\nCreating container sale...');
  const saleRes = await httpReq({
    hostname: 'localhost', port: 3001, path: '/api/sales',
    method: 'POST', headers: authHeaders
  }, JSON.stringify(salePayload));

  console.log('Sale creation status:', saleRes.status);
  if (saleRes.status === 201) {
    console.log('✓ Container sale created successfully with PDF invoice');
    console.log('Invoice path:', saleRes.data.invoicePath);
  } else {
    console.log('Sale creation failed:', JSON.stringify(saleRes.data, null, 2));
  }
}

run().catch(e => console.error('Script error:', e));