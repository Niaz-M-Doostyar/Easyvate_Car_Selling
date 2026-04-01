export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!/^\+?\d{7,20}$/.test(cleaned)) return 'Invalid phone number';
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';
  return null;
};

export const validateNationalId = (id) => {
  if (!id) return null;
  if (!/^\d{9,15}$/.test(id)) return 'National ID must be 9-15 digits';
  return null;
};

export const validatePrice = (price) => {
  if (price === '' || price === null || price === undefined) return null;
  const num = Number(price);
  if (isNaN(num) || num < 0) return 'Must be a valid positive number';
  return null;
};

export const validateYear = (year) => {
  if (!year) return null;
  const num = Number(year);
  if (isNaN(num) || num < 1900 || num > new Date().getFullYear() + 2) return 'Invalid year';
  return null;
};

export const validatePassword = (pw) => {
  if (!pw) return 'Password is required';
  if (pw.length < 8) return 'Password must be at least 8 characters';
  return null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const error = validator(data[field], field);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
};
