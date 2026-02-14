const http = require('http');

const loginData = JSON.stringify({ username: 'admin', password: 'admin123' });

function httpReq(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
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
  
  // Get vehicles and customers
  const [vRes, cRes] = await Promise.all([
    httpReq({ hostname: 'localhost', port: 3001, path: '/api/vehicles', headers: authHeaders }),
    httpReq({ hostname: 'localhost', port: 3001, path: '/api/customers', headers: authHeaders }),
  ]);
  
  const vehicles = vRes.data.data || [];
  const customers = cRes.data.data || [];
  const avail = vehicles.filter(v => v.status === 'Available');
  
  console.log('Available vehicles:', avail.length, '| Customers:', customers.length);
  
  if (avail.length === 0) { console.log('No available vehicles'); return; }
  if (customers.length === 0) { console.log('No customers'); return; }
  
  console.log('Using Vehicle:', avail[0].id, avail[0].manufacturer, avail[0].model);
  console.log('Using Customer:', customers[0].id, customers[0].fullName);
  
  // Test sale
  const salePayload = {
    saleType: 'Exchange Car',
    vehicleId: avail[0].id,
    customerId: customers[0].id,
    saleDate: '2026-02-14',
    sellingPrice: 50000,
    downPayment: 10000,
    remainingAmount: 40000,
    sellerName: 'Test Seller',
    notes: 'Test exchange sale',
    exchVehicleCategory: 'SUV',
    exchVehicleManufacturer: 'Toyota',
    exchVehicleModel: 'Land Cruiser',
    exchVehicleYear: 2020,
    exchVehicleColor: 'White',
    exchVehicleChassis: 'TEST-CHASSIS-' + Date.now(),
    exchVehicleEngine: 'ENG-123',
    exchVehicleEngineType: 'V6',
    exchVehicleFuelType: 'Petrol',
    exchVehicleTransmission: 'Automatic',
    exchVehicleSteering: 'Left',
    exchVehicleMonolithicCut: 'Monolithic',
    priceDifference: 5000,
    priceDifferencePaidBy: 'Buyer',
  };
  
  console.log('\nCreating sale...');
  const saleRes = await httpReq({
    hostname: 'localhost', port: 3001, path: '/api/sales',
    method: 'POST', headers: authHeaders
  }, JSON.stringify(salePayload));
  
  console.log('Response status:', saleRes.status);
  console.log('Response body:', JSON.stringify(saleRes.data, null, 2).substring(0, 1000));
}

run().catch(e => console.error('Script error:', e));
