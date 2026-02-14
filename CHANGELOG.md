# Changelog

All notable changes to the Easyvate Car Selling Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-15

### Added

#### Core Features
- Complete vehicle management system with inventory tracking
- Multi-type sales management with professional PDF invoices
- Customer relationship management with ledger system
- Employee management with payroll and attendance tracking
- Currency exchange rate management with multi-currency support
- Financial reporting and analytics dashboard
- Role-based access control with JWT authentication

#### Invoice System
- **Exchange Car Invoice** - Professional single-page PDF with vector graphics
- **Container One Key Invoice** - Streamlined container vehicle documentation
- **Licensed Car Invoice** - Licensed vehicle invoice with full documentation
- Vector car graphics rendered in PDFs
- Multi-currency support in invoices
- Professional A4 single-page layout

#### Frontend (Next.js)
- Modern Material-UI design system
- Dark/Light theme with system preference detection
- Responsive layout for all screen sizes
- Enhanced data tables with sorting, filtering, and pagination
- Real-time form validation
- Toast notifications for user feedback
- Settings drawer for customization
- Protected routes with authentication

#### Backend (Node.js/Express)
- RESTful API architecture
- MySQL database with Sequelize ORM
- JWT authentication middleware
- Role-based permission system
- Error handling middleware
- Request logging
- PDF generation service with PDFKit
- Payroll calculation service

#### Mobile App (React Native)
- Cross-platform iOS/Android support
- Dashboard overview
- Vehicle management
- Sales creation
- Customer lookup
- Attendance tracking
- Currency exchange rates
- Secure authentication

#### Database
- 15+ interconnected tables
- Proper foreign key relationships
- Transaction support
- Audit trail with edit history
- Optimized indexes

### Security
- Bcrypt password hashing
- JWT token-based authentication
- Protected API routes
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Documentation
- Comprehensive README with setup instructions
- API endpoint documentation
- Component documentation
- Database schema documentation
- Testing guides
- Quick start guides
- Contribution guidelines
- Security policy

### Changed
- Updated from manual currency conversion to centralized utility
- Improved PDF layout for better professional appearance
- Enhanced error handling across all modules
- Optimized database queries for better performance

### Fixed
- PDF generation encoding issues
- Currency formatting consistency
- Date/time timezone handling
- Authentication token refresh
- Mobile app navigation issues

## [0.9.0] - 2026-02-01

### Added
- Initial beta release
- Core CRUD operations
- Basic authentication
- Simple reporting

### Known Issues
- PDF invoices span multiple pages
- Currency conversion inconsistent
- Limited mobile functionality

---

## Release Notes

### Version 1.0.0 Highlights

This is the first stable release of Easyvate Car Selling Platform, featuring:

✅ **Production Ready**: Fully tested and documented for deployment  
✅ **Professional PDFs**: Single-page A4 invoices with vector graphics  
✅ **Multi-Platform**: Web, mobile, and API access  
✅ **Comprehensive**: All dealership operations in one platform  
✅ **Secure**: Industry-standard authentication and authorization  
✅ **Modern Tech Stack**: MERN stack with latest frameworks  

### Upgrade Notes

This is the initial release. No upgrade path required.

### Breaking Changes

None - this is the first major release.

---

For more details on any release, see the [commit history](https://github.com/Niaz-M-Doostyar/Easyvate_Car_Selling/commits/main).
