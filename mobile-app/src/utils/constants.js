export const CURRENCY_SYMBOLS = { AFN: '؋', USD: '$', PKR: '₨' };
export const CURRENCIES = ['AFN', 'USD', 'PKR'];

export const formatCurrency = (amount, currency = 'AFN') => {
  const num = Number(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol} ${num.toLocaleString()}`;
};

export const getCurrencySymbol = (currency) => CURRENCY_SYMBOLS[currency] || currency;

export const AFGHAN_PROVINCES = [
  'Kabul', 'Kandahar', 'Herat', 'Balkh', 'Nangarhar', 'Kunduz', 'Baghlan',
  'Takhar', 'Badakhshan', 'Ghazni', 'Paktia', 'Parwan', 'Laghman', 'Kapisa',
  'Bamyan', 'Wardak', 'Logar', 'Panjshir', 'Daykundi', 'Uruzgan', 'Zabul',
  'Nimroz', 'Helmand', 'Farah', 'Badghis', 'Faryab', 'Jawzjan', 'Sar-e Pol',
  'Samangan', 'Ghor', 'Kunar', 'Nuristan', 'Khost', 'Paktika',
];

export const VEHICLE_MANUFACTURERS = [
  'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford',
  'Chevrolet', 'KIA', 'Hyundai', 'Mazda', 'Nissan', 'Suzuki', 'Daihatsu', 'FAW', 'Changan',
];

export const VEHICLE_CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Van', 'Truck', 'Pickup', 'Bus', 'Other'];
export const VEHICLE_STATUSES = ['Available', 'Reserved', 'Sold', 'Coming', 'Under Repair'];
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG'];
export const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
export const ENGINE_TYPES = ['Inline-3', 'Inline-4', 'Inline-5', 'Inline-6', 'V4', 'V6', 'V8', 'V10', 'V12', 'Rotary', 'Turbo'];
export const STEERING_TYPES = ['Left', 'Right'];
export const MONOLITHIC_CUT = ['Monolithic', 'Cut'];

export const CUSTOMER_TYPES = ['Buyer', 'Investor', 'Borrower'];
export const SALE_TYPES = [
  { value: 'Exchange Car', label: 'Exchange Car', color: '#1565c0' },
  { value: 'Container One Key', label: 'Container One Key', color: '#e65100' },
  { value: 'Licensed Car', label: 'Licensed Car', color: '#2e7d32' },
];
export const LOAN_TYPES = ['Given', 'Received', 'Owner Loan'];
export const LOAN_STATUSES = ['Active', 'Paid', 'Overdue'];
export const PAYROLL_STATUSES = ['Pending', 'Partial', 'Paid'];
export const LEDGER_TYPES = ['Income', 'Expense', 'Vehicle Purchase', 'Vehicle Sale', 'Salary', 'Loan Given', 'Loan Received', 'Commission'];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const USER_ROLES = [
  'Super Admin', 'Owner', 'Manager', 'Accountant',
  'Financial', 'Inventory & Sales', 'Sales', 'Viewer',
];

export const ROLE_ACCESS = {
  'Super Admin': ['Dashboard', 'Vehicles', 'Customers', 'Sales', 'Employees', 'Attendance', 'Payroll', 'Showroom Ledger', 'Currency Exchange', 'Loans & Debts', 'Reports', 'Users & Roles'],
  'Owner': ['Dashboard', 'Vehicles', 'Sales', 'Employees', 'Payroll', 'Showroom Ledger', 'Currency Exchange', 'Loans & Debts', 'Reports', 'Users & Roles'],
  'Manager': ['Dashboard', 'Vehicles', 'Customers', 'Sales', 'Employees', 'Attendance', 'Payroll', 'Currency Exchange', 'Loans & Debts', 'Reports'],
  'Accountant': ['Dashboard', 'Vehicles', 'Sales', 'Customers', 'Payroll', 'Showroom Ledger', 'Currency Exchange', 'Reports'],
  'Financial': ['Dashboard', 'Showroom Ledger', 'Currency Exchange', 'Loans & Debts', 'Reports'],
  'Inventory & Sales': ['Dashboard', 'Vehicles', 'Customers', 'Sales', 'Reports'],
  'Sales': ['Dashboard', 'Vehicles', 'Customers', 'Sales'],
  'Viewer': ['Dashboard', 'Vehicles', 'Reports'],
};
