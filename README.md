# 🚗 Easyvate Car Selling Platform

> A comprehensive full-stack car dealership management system with multi-platform support

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)](https://github.com/Niaz-M-Doostyar/Easyvate_Car_Selling)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-Mobile-blue)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)

## 📋 Overview

Easyvate Car Selling Platform is an enterprise-grade dealership management system built with modern technologies. It provides comprehensive tools for managing vehicles, sales, customers, employees, financial transactions, and generates professional PDF invoices.

### ✨ Key Features

- 🚘 **Vehicle Management** - Complete inventory tracking with cost analysis
- 💰 **Sales & Transactions** - Multi-type invoice generation (Exchange, Container, Licensed)
- 👥 **Customer Management** - CRM with ledger and reference person tracking
- 👨‍💼 **Employee Management** - Payroll, attendance, and commission distribution
- 💵 **Currency Exchange** - Multi-currency support with real-time exchange rates
- 📊 **Financial Reports** - Comprehensive reporting and analytics
- 📄 **Professional PDF Invoices** - Single-page A4 invoices with vector graphics
- 🔐 **Role-Based Access Control** - Secure authentication and permissions
- 📱 **Mobile Application** - React Native app for on-the-go management
- 🌓 **Dark/Light Theme** - Modern UI with theme switching

## 🏗️ Architecture

### Tech Stack

**Frontend (Next.js)**
- Next.js 14 with App Router
- Material-UI (MUI) v6
- Context API for state management
- Responsive design with theme support

**Backend (Node.js)**
- Express.js REST API
- MySQL with Sequelize ORM
- JWT authentication
- PDFKit for invoice generation

**Mobile (React Native)**
- React Navigation
- Context API
- Cross-platform iOS/Android support

**Database**
- MySQL 8.0+
- Relational schema with foreign keys
- Transaction support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Niaz-M-Doostyar/Easyvate_Car_Selling.git
cd Easyvate_Car_Selling
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=easyvate_car_db
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EOF

# Start backend server
npm start
```

3. **Frontend Setup**
```bash
cd ../frontend-nextjs
npm install

# Start Next.js development server
npm run dev
```

4. **Mobile App Setup** (Optional)
```bash
cd ../mobile-app
npm install

# For iOS
npx react-native run-ios

# For Android
npx react-native run-android
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Default Login**: admin / admin123

## 📁 Project Structure

```
Easyvate_Car_Selling/
├── backend/                 # Node.js Express API
│   ├── config/             # Database configuration
│   ├── models/             # Sequelize models
│   ├── routes/             # API endpoints
│   ├── src/
│   │   ├── middleware/     # Auth, permissions, error handling
│   │   └── services/       # PDF generation, payroll
│   └── app.js              # Express application
│
├── frontend-nextjs/        # Next.js web application
│   └── src/
│       ├── app/            # Next.js pages (App Router)
│       │   ├── dashboard/  # Protected dashboard pages
│       │   └── login/      # Authentication
│       ├── components/     # Reusable components
│       ├── contexts/       # React contexts
│       └── utils/          # API client, validation
│
├── mobile-app/             # React Native mobile app
│   └── src/
│       ├── screens/        # Mobile screens
│       ├── components/     # Mobile components
│       ├── navigation/     # Navigation configuration
│       └── contexts/       # Mobile contexts
│
└── frontend/               # Legacy HTML/CSS frontend
```

## 🎯 Core Modules

### 1. Vehicle Management
- Add/Edit/Delete vehicles
- Track vehicle costs and pricing
- Inventory status management
- Vehicle history tracking

### 2. Sales Management
- Create sales with multiple invoice types:
  - **Exchange Car Invoice**
  - **Container One Key Invoice**
  - **Licensed Car Invoice**
- Commission distribution
- Payment tracking
- Professional PDF generation

### 3. Customer Management
- Customer profiles with full details
- Customer ledger (transactions)
- Reference person tracking
- Credit/debit management

### 4. Employee Management
- Employee profiles and attendance
- Payroll processing
- Commission calculations
- Attendance tracking

### 5. Financial Management
- Currency exchange rates
- Showroom ledger
- Loan management
- Financial reporting

### 6. PDF Invoice System
All invoices are designed as single-page A4 documents with:
- Professional vector car graphics
- Detailed transaction information
- Multi-currency support
- Company branding
- Digital signatures

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)

## 📊 Database Schema

The system includes 15+ interconnected tables:
- Users & Authentication
- Vehicles & Costs
- Customers & Ledgers
- Sales & Commissions
- Employees & Payroll
- Financial Transactions
- Currency Exchange

## 🎨 UI/UX Features

- Modern Material Design
- Responsive layout (mobile/tablet/desktop)
- Dark/Light theme support
- Enhanced data tables with sorting/filtering
- Real-time validation
- Loading states and error handling
- Toast notifications

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Vehicles
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Sales
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale with invoice
- `GET /api/sales/:id/pdf` - Download PDF invoice

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

*[See full API documentation in backend/routes/]*

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend-nextjs
npm test

# Mobile tests
cd mobile-app
npm test
```

## 📱 Mobile App Features

- Dashboard overview
- Vehicle management on-the-go
- Sales creation with photo capture
- Customer lookup
- Real-time synchronization
- Offline support (coming soon)

## 🌍 Internationalization

- Multi-language support
- RTL/LTR layout support
- Localized currency formatting
- Date/time localization

## 🚀 Deployment

### Backend (Node.js)
- Deploy to AWS, Heroku, or DigitalOcean
- Use PM2 for process management
- Configure environment variables
- Set up MySQL database

### Frontend (Next.js)
- Deploy to Vercel, Netlify, or AWS
- Configure production build
- Set API endpoint URLs

### Mobile App
- Build for iOS: `npx react-native build-ios`
- Build for Android: `npx react-native build-android`
- Submit to App Store / Play Store

## 📝 Environment Variables

**Backend (.env)**
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=easyvate_car_db
JWT_SECRET=your_secret_key
NODE_ENV=production
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 👨‍💻 Author

**Niaz Mohammad Doostyar**
- GitHub: [@Niaz-M-Doostyar](https://github.com/Niaz-M-Doostyar)

## 🙏 Acknowledgments

- Built with modern MERN stack technologies
- Inspired by real-world car dealership requirements
- Community-driven best practices

## 📞 Support

For support, email support@easyvate.com or open an issue in the repository.

---

**⭐ Star this repository if you find it helpful!**

*Last Updated: February 2026*
