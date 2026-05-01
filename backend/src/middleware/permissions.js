// Role-based access control permissions

const { read } = require("pdfkit");
const { AboutEnglish, AboutPashto, AboutDari, TeamEnglish, TeamPashto, TeamDari, ContactEnglish, ContactPashto, ContactDari, CarouselEnglish, CarouselPashto, CarouselDari, TestimonialEnglish, TestimonialPashto, TestimonialDari, Video } = require("../../models");

const PERMISSIONS = {
  // Role definitions with their capabilities
  'Super Admin': {
    vehicles: ['read', 'create', 'update', 'delete'],
    sales: ['read', 'create', 'update', 'delete'],
    customers: ['read', 'create', 'update', 'delete'],
    employees: ['read', 'create', 'update', 'delete'],
    ledger: ['read', 'create', 'update', 'delete'],
    reports: ['read', 'export'],
    users: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update'],
    payroll: ['read', 'create', 'update'],
    currency: ['read', 'create'],
    AboutEnglish: ['read', 'create', 'update', 'delete'],
    AboutPashto: ['read', 'create', 'update', 'delete'],
    AboutDari: ['read', 'create', 'update', 'delete'],
    TeamEnglish: ['read', 'create', 'update', 'delete'],
    TeamPashto: ['read', 'create', 'update', 'delete'],
    TeamDari: ['read', 'create', 'update', 'delete'],
    ContactEnglish: ['read', 'create', 'update', 'delete'],
    ContactPashto: ['read', 'create', 'update', 'delete'],
    ContactDari: ['read', 'create', 'update', 'delete'],
    Carousel: ['read', 'create', 'update', 'delete'],
    TestimonialEnglish: ['read', 'create', 'update', 'delete'],
    TestimonialPashto: ['read', 'create', 'update', 'delete'],
    TestimonialDari: ['read', 'create', 'update', 'delete'],
    Video: ['read', 'create', 'update', 'delete']
  },
  
  'Owner': {
    vehicles: ['read', 'create', 'update', 'delete'],
    sales: ['read', 'create', 'update'],
    customers: ['read', 'create', 'update'],
    employees: ['read', 'create', 'update'],
    ledger: ['read', 'create'],
    reports: ['read', 'export'],
    users: ['read'],
    attendance: ['read'],
    payroll: ['read', 'create', 'update'],
    currency: ['read', 'create'],
    AboutEnglish: ['read', 'create', 'update', 'delete'],
    AboutPashto: ['read', 'create', 'update', 'delete'],
    AboutDari: ['read', 'create', 'update', 'delete'],
    TeamEnglish: ['read', 'create', 'update', 'delete'],
    TeamPashto: ['read', 'create', 'update', 'delete'],
    TeamDari: ['read', 'create', 'update', 'delete'],
    ContactEnglish: ['read', 'create', 'update', 'delete'],
    ContactPashto: ['read', 'create', 'update', 'delete'],
    ContactDari: ['read', 'create', 'update', 'delete'],
    Carousel: ['read', 'create', 'update', 'delete'],
    TestimonialEnglish: ['read', 'create', 'update', 'delete'],
    TestimonialPashto: ['read', 'create', 'update', 'delete'],
    TestimonialDari: ['read', 'create', 'update', 'delete'],
    Video: ['read', 'create', 'update', 'delete']
  },
  
  'Manager': {
    vehicles: ['read', 'create', 'update'],
    sales: ['read', 'create'],
    customers: ['read', 'create', 'update'],
    employees: ['read'],
    ledger: ['read'],
    reports: ['read'],
    users: ['read'],
    attendance: ['read', 'create'],
    payroll: ['read'],
    currency: ['read'],
    AboutEnglish: ['read', 'create', 'update', 'delete'],
    AboutPashto: ['read', 'create', 'update', 'delete'],
    AboutDari: ['read', 'create', 'update', 'delete'],
    TeamEnglish: ['read', 'create', 'update', 'delete'],
    TeamPashto: ['read', 'create', 'update', 'delete'],
    TeamDari: ['read', 'create', 'update', 'delete'],
    ContactEnglish: ['read', 'create', 'update', 'delete'],
    ContactPashto: ['read', 'create', 'update', 'delete'],
    ContactDari: ['read', 'create', 'update', 'delete'],
    Carousel: ['read', 'create', 'update', 'delete'],
    TestimonialEnglish: ['read', 'create', 'update', 'delete'],
    TestimonialPashto: ['read', 'create', 'update', 'delete'],
    TestimonialDari: ['read', 'create', 'update', 'delete'],
    Video: ['read', 'create', 'update', 'delete']
  },
  
  'Accountant': {
    vehicles: ['read'],
    sales: ['read'],
    customers: ['read', 'update'],
    employees: ['read'],
    ledger: ['read', 'create'],
    reports: ['read', 'export'],
    users: ['read'],
    attendance: ['read'],
    payroll: ['read', 'create'],
    currency: ['read', 'create'],
    loans: ['read', 'create', 'update']
  },
  
  'Financial': {
    vehicles: ['read'],
    sales: ['read'],
    customers: ['read'],
    employees: ['read'],
    ledger: ['read', 'create'],
    reports: ['read', 'export'],
    users: ['read'],
    attendance: ['read'],
    payroll: ['read', 'create'],
    currency: ['read', 'create'],
    loans: ['read', 'create']
  },
  
  'Inventory & Sales': {
    vehicles: ['read', 'create', 'update'],
    sales: ['read', 'create'],
    customers: ['read', 'create', 'update'],
    employees: ['read'],
    ledger: ['read'],
    reports: ['read'],
    users: ['read'],
    attendance: ['read'],
    payroll: [],
    currency: ['read'],
    AboutEnglish: ['read', 'create', 'update', 'delete'],
    AboutPashto: ['read', 'create', 'update', 'delete'],
    AboutDari: ['read', 'create', 'update', 'delete'],
    TeamEnglish: ['read', 'create', 'update', 'delete'],
    TeamPashto: ['read', 'create', 'update', 'delete'],
    TeamDari: ['read', 'create', 'update', 'delete'],
    ContactEnglish: ['read', 'create', 'update', 'delete'],
    ContactPashto: ['read', 'create', 'update', 'delete'],
    ContactDari: ['read', 'create', 'update', 'delete'],
    Carousel: ['read', 'create', 'update', 'delete'],
    TestimonialEnglish: ['read', 'create', 'update', 'delete'],
    TestimonialPashto: ['read', 'create', 'update', 'delete'],
    TestimonialDari: ['read', 'create', 'update', 'delete'],
    Video: ['read', 'create', 'update', 'delete']
  },
  
  'Sales': {
    vehicles: ['read'],
    sales: ['read', 'create'],
    customers: ['read', 'create', 'update'],
    employees: ['read'],
    ledger: [],
    reports: [],
    users: ['read'],
    attendance: ['read'],
    payroll: [],
    currency: [],
    AboutEnglish: ['read', 'create', 'update', 'delete'],
    AboutPashto: ['read', 'create', 'update', 'delete'],
    AboutDari: ['read', 'create', 'update', 'delete'],
    TeamEnglish: ['read', 'create', 'update', 'delete'],
    TeamPashto: ['read', 'create', 'update', 'delete'],
    TeamDari: ['read', 'create', 'update', 'delete'],
    ContactEnglish: ['read', 'create', 'update', 'delete'],
    ContactPashto: ['read', 'create', 'update', 'delete'],
    ContactDari: ['read', 'create', 'update', 'delete'],
    Carousel: ['read', 'create', 'update', 'delete'],
    TestimonialEnglish: ['read', 'create', 'update', 'delete'],
    TestimonialPashto: ['read', 'create', 'update', 'delete'],
    TestimonialDari: ['read', 'create', 'update', 'delete'],
    Video: ['read', 'create', 'update', 'delete']
  },
  
  'Viewer': {
    vehicles: ['read'],
    sales: ['read'],
    customers: ['read'],
    employees: ['read'],
    ledger: [],
    reports: [],
    users: ['read'],
    attendance: ['read'],
    payroll: [],
    currency: [],
  }
};

/**
 * Check if a role has permission for a specific action on a module
 */
const hasPermission = (role, module, action) => {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  
  const modulePermissions = rolePermissions[module];
  if (!modulePermissions) return false;
  
  return modulePermissions.includes(action);
};

/**
 * Middleware to check permissions for a specific module and action
 */
const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required', statusCode: 401 }
      });
    }

    const { role } = req.user;
    
    if (hasPermission(role, module, action)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        message: `Access denied. Your role (${role}) does not have permission to ${action} ${module}`,
        statusCode: 403
      }
    });
  };
};

/**
 * Middleware to check if user has any of multiple permissions (OR logic)
 */
const checkAnyPermission = (checks) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required', statusCode: 401 }
      });
    }

    const { role } = req.user;
    
    const hasAnyPermission = checks.some(({ module, action }) => 
      hasPermission(role, module, action)
    );

    if (hasAnyPermission) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        message: `Access denied. Insufficient permissions for your role (${role})`,
        statusCode: 403
      }
    });
  };
};

/**
 * Get all permissions for a specific role
 */
const getRolePermissions = (role) => {
  return PERMISSIONS[role] || {};
};

/**
 * Middleware to attach user permissions to request object
 */
const attachPermissions = (req, res, next) => {
  if (req.user && req.user.role) {
    req.permissions = getRolePermissions(req.user.role);
  } else {
    req.permissions = {};
  }
  next();
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  checkPermission,
  checkAnyPermission,
  getRolePermissions,
  attachPermissions
};
