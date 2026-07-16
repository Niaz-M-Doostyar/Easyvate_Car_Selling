export const CURRENCY_SYMBOLS = { AFN: '؋', USD: '$', PKR: '₨', AED: 'د.إ' };

export const getCurrencySymbol = (currency = 'AFN') => {
  const code = String(currency || 'AFN').trim().toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
};

export const formatCurrency = (amount, currency = 'AFN') => {
  const num = Number(amount) || 0;
  return `${num.toLocaleString()} ${getCurrencySymbol(currency)}`;
};
