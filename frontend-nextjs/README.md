# Easyvate Car Selling Management System

A comprehensive car showroom management system built with Next.js (Material UI frontend) and Express.js backend.

## 🚀 Features

### Inventory Management
- **Vehicle Management**: Complete CRUD operations with cost breakdown stages
  - Base Purchase Price
  - Transport Cost to Dubai
  - Import Cost to Afghanistan
  - Repair Cost
  - Total Cost calculation in PKR and AFN
- **Reference Person**: Store details (Full Name, Tazkira, Phone, Photo, Address)
- **Sharing Persons**: Multiple partners with percentage distribution and investment tracking
- **Vehicle Status**: Available, Reserved, Sold, Coming, Under Repair
- **PDF Generation**: Vehicle details with complete cost breakdown

### Sales & Customer Management
- **Sales Recording**: Link vehicles to customers with pricing details
- **Commission Distribution**: Automatic distribution to sharing persons based on percentages
- **Customer Ledger**: Track customer balances, payments, and transaction history
- **Invoice Generation**: Professional PDF invoices for sales
- **Payment Methods**: Cash, Bank Transfer, Installment, Exchange

### Financial Management
- **Showroom Ledger**: Track owner/partner investments, withdrawals, and profit distribution
- **General Ledger**: All income and expenses with running balance
- **Loans & Debts**: Track loans given and received with due dates
- **Currency Exchange**: Multi-currency support (AFN, USD, EUR, PKR) with exchange rates

### Employee & Payroll
- **Employee Management**: Full employee records with positions and salaries
- **Attendance Tracking**: Daily attendance marking (Present, Absent, Half Day, Leave)
- **Payroll Management**: Salary processing and payment tracking

### Reports & Analytics
- **Sales Reports**: Daily, monthly, yearly sales analysis
- **Financial Reports**: Income, expenses, profit/loss statements
- **PDF Export**: Export reports to PDF format
- **Dashboard**: Real-time statistics and recent transactions

## 🛠️ Tech Stack

### Frontend (Next.js + Material UI)
- **Framework**: Next.js 14.1.0
- **UI Library**: Material UI 5.15.7
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Notifications**: Notistack
- **PDF**: jsPDF
- **Forms**: React Hook Form

### Backend (Express.js)
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **PDF Generation**: PDFKit
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: express-validator

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure database in `config/database.js`:
```javascript
{
  host: 'localhost',
  port: 8889,
  username: 'root',
  password: 'root',
  database: 'easyvate_db'
}
```

4. Start the server:
```bash
npm start
```

Backend will run on: **http://localhost:5000**

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on: **http://localhost:3000**

## 🎨 Material Dashboard Design

The admin panel is built using the Material Dashboard design from [MatDash-Nextjs-free](https://github.com/adminmart/MatDash-Nextjs-free) template with custom modifications:

- **Color Scheme**: 
  - Primary: #5D87FF
  - Secondary: #49BEFF
  - Success: #13DEB9
  - Warning: #FFAE1F
- **Typography**: Plus Jakarta Sans font family
- **Components**: Custom Material UI components with MatDash styling

## 📱 Pages & Routes

### Authentication
- `/login` - User login page

### Dashboard Routes
- `/dashboard` - Main dashboard with statistics
- `/dashboard/vehicles` - Vehicle inventory management
- `/dashboard/customers` - Customer management
- `/dashboard/sales` - Sales recording and tracking
- `/dashboard/employees` - Employee management
- `/dashboard/attendance` - Attendance tracking
- `/dashboard/ledger` - General ledger (income/expenses)
- `/dashboard/showroom-ledger` - Showroom owner/partner ledger
- `/dashboard/loans` - Loans and debts management
- `/dashboard/reports` - Reports and analytics

## 🔐 Default Credentials

**Admin Login:**
- Email: `admin@easyvate.com`
- Password: `admin123`

## 💱 Currency Exchange Rates (Default)

- **USD**: 280 AFN
- **EUR**: 310 AFN
- **PKR**: 1 AFN
- **AFN**: 3.2 PKR

## 📊 Database Models

1. **User** - Admin users and authentication
2. **Vehicle** - Vehicle inventory with costs
3. **VehicleCost** - Cost breakdown by stages
4. **ReferencePerson** - Vehicle reference persons
5. **SharingPerson** - Investment partners
6. **Customer** - Customer details
7. **CustomerLedger** - Customer transactions
8. **Sale** - Sales records
9. **CommissionDistribution** - Partner commissions
10. **ShowroomLedger** - Owner/partner transactions
11. **LedgerTransaction** - General ledger entries
12. **Employee** - Employee records
13. **Attendance** - Attendance tracking
14. **Payroll** - Salary payments
15. **Loan** - Loans and debts
16. **CurrencyExchange** - Exchange rate management
17. **EditHistory** - Vehicle edit history

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/:id/pdf` - Generate vehicle PDF

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record new sale
- `GET /api/sales/:id/invoice` - Generate invoice PDF

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add new customer
- `GET /api/customers/:id/ledger` - Get customer ledger

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance

### Ledger
- `GET /api/ledger` - Get all transactions
- `GET /api/ledger/daily` - Get today's transactions
- `GET /api/ledger/monthly` - Get this month's transactions
- `GET /api/ledger/yearly` - Get this year's transactions
- `GET /api/ledger/showroom` - Get showroom ledger
- `POST /api/ledger/showroom` - Add showroom transaction

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Add new loan
- `PATCH /api/loans/:id/mark-paid` - Mark loan as paid

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/financial` - Get financial report
- `GET /api/reports/export-pdf` - Export report to PDF

## 🎯 Key Features Implemented

✅ **Complete Vehicle Management** with cost tracking and sharing persons
✅ **Commission Distribution** system for profit sharing
✅ **Customer Ledger** with running balance
✅ **Showroom Ledger** for owner/partner tracking
✅ **Attendance System** for employees
✅ **Loans & Debts** management
✅ **Multi-Currency Support** with exchange rates
✅ **PDF Generation** for vehicles, invoices, and reports
✅ **Material UI Dashboard** with responsive design
✅ **JWT Authentication** for secure access
✅ **Real-time Dashboard** statistics

## 📝 Development Status

**Completed:**
- ✅ Backend API (Complete)
- ✅ Database Models & Relationships
- ✅ Next.js Frontend with Material UI
- ✅ All CRUD Operations
- ✅ Authentication System
- ✅ PDF Generation
- ✅ Reports & Analytics
- ✅ Dashboard with Statistics

**Pending:**
- ⏳ React Native Mobile App (per user instruction: complete web admin first)
- ⏳ Advanced Analytics & Charts
- ⏳ Email Notifications
- ⏳ Backup & Restore Features

## 🚧 Future Enhancements

1. **Mobile App**: React Native application for mobile access
2. **Advanced Analytics**: More detailed charts and insights
3. **Notifications**: Email/SMS notifications for important events
4. **Document Upload**: Support for uploading vehicle photos and documents
5. **Multi-language**: Support for Dari/Pashto languages
6. **Advanced Search**: Full-text search across all modules
7. **Export Options**: Excel, CSV export for reports
8. **User Roles**: Advanced role-based access control

## 📄 License

This project is proprietary software developed for Easyvate Car Selling.

## 👥 Support

For support and queries, contact the development team.

---

**Built with ❤️ using Next.js, Material UI, and Express.js**
