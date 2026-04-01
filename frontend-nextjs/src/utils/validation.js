// Validation utilities for all forms
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  // Accept formats like +1234567890, 123-456-7890, (123)456-7890, etc.
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateNationalId = (id) => {
  // Afghan National ID (Tazkira): old format 9 digits, new e-Tazkira 14 digits
  const idRegex = /^\d{9,15}$/;
  return idRegex.test(id.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  // At least 8 characters
  return password && password.length >= 8;
};

export const validateYear = (year) => {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  return yearNum >= 1900 && yearNum <= currentYear + 5;
};

export const validatePrice = (price) => {
  const priceNum = parseFloat(price);
  return !isNaN(priceNum) && priceNum > 0;
};

export const validateRequired = (value) => {
  return value && value.toString().trim() !== '';
};

export const validateChassisNumber = (chassis) => {
  // VIN/Chassis number should be 10-20 characters
  return chassis && chassis.length >= 10 && chassis.length <= 20;
};

// Form validation schemas
export const formValidations = {
  customer: {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Full name is required (2-100 characters)',
    },
    phoneNumber: {
      required: true,
      validator: validatePhone,
      message: 'Valid phone number is required',
    },
    email: {
      required: false,
      validator: validateEmail,
      message: 'Email must be valid format (name@domain.com)',
    },
    address: {
      required: false,
      maxLength: 255,
      message: 'Address cannot exceed 255 characters',
    },
    tazkiraNumber: {
      required: false,
      message: 'Tazkira number is optional',
    },
  },

  vehicle: {
    vehicleId: {
      required: true,
      minLength: 3,
      maxLength: 20,
      message: 'Vehicle ID is required (3-20 characters)',
    },
    category: {
      required: true,
      message: 'Vehicle category is required',
    },
    manufacturer: {
      required: true,
      minLength: 2,
      message: 'Manufacturer is required',
    },
    model: {
      required: true,
      minLength: 2,
      message: 'Model is required',
    },
    year: {
      required: true,
      validator: validateYear,
      message: 'Year must be between 1900 and current year + 5',
    },
    chassisNumber: {
      required: true,
      validator: validateChassisNumber,
      message: 'Chassis number must be 10-20 characters',
    },
    basePurchasePrice: {
      required: true,
      validator: validatePrice,
      message: 'Purchase price must be a positive number',
    },
    sellingPrice: {
      required: true,
      validator: validatePrice,
      message: 'Selling price must be a positive number',
    },
  },

  employee: {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Full name is required (2-100 characters)',
    },
    phoneNumber: {
      required: true,
      validator: validatePhone,
      message: 'Valid phone number is required',
    },
    email: {
      required: false,
      validator: validateEmail,
      message: 'Email must be valid format (name@domain.com)',
    },
    position: {
      required: true,
      minLength: 2,
      message: 'Position is required',
    },
    salary: {
      required: true,
      validator: validatePrice,
      message: 'Salary must be a positive number',
    },
  },

  sale: {
    vehicleId: {
      required: true,
      message: 'Vehicle is required',
    },
    customerId: {
      required: true,
      message: 'Customer is required',
    },
    sellingPrice: {
      required: true,
      validator: validatePrice,
      message: 'Selling price must be a positive number',
    },
    totalCost: {
      required: true,
      validator: validatePrice,
      message: 'Total cost must be a positive number',
    },
  },

  loan: {
    personName: {
      required: true,
      minLength: 2,
      message: 'Person name is required',
    },
    amount: {
      required: true,
      validator: validatePrice,
      message: 'Amount must be a positive number',
    },
    type: {
      required: true,
      message: 'Loan type is required',
    },
  },

  user: {
    fullName: {
      required: true,
      minLength: 2,
      message: 'Full name is required',
    },
    email: {
      required: true,
      validator: validateEmail,
      message: 'Valid email is required',
    },
    password: {
      required: true,
      validator: validatePassword,
      message: 'Password must be at least 8 characters',
    },
    role: {
      required: true,
      message: 'Role is required',
    },
  },
};

// Validate a single field
export const validateField = (fieldName, value, schema) => {
  const rules = schema[fieldName];
  if (!rules) return { valid: true, error: '' };

  // Check required
  if (rules.required && !validateRequired(value)) {
    return { valid: false, error: `${fieldName} is required` };
  }

  // Check minLength
  if (rules.minLength && value && value.toString().length < rules.minLength) {
    return { valid: false, error: `${fieldName} must be at least ${rules.minLength} characters` };
  }

  // Check maxLength
  if (rules.maxLength && value && value.toString().length > rules.maxLength) {
    return { valid: false, error: `${fieldName} cannot exceed ${rules.maxLength} characters` };
  }

  // Check custom validator
  if (rules.validator && value && !rules.validator(value)) {
    return { valid: false, error: rules.message };
  }

  return { valid: true, error: '' };
};

// Validate entire form
export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach((field) => {
    const validation = validateField(field, formData[field], schema);
    if (!validation.valid) {
      errors[field] = validation.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};
