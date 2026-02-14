/**
 * Currency formatting utilities
 * Provides dynamic currency symbols and formatting throughout the app.
 */

// Symbol map for all supported currencies
export const CURRENCY_SYMBOLS = {
  AFN: '؋',
  USD: '$',
  PKR: '₨',
};

// Flag + symbol for dropdowns
export const CURRENCY_FLAGS = {
  AFN: '🇦🇫',
  USD: '🇺🇸',
  PKR: '🇵🇰',
};

/**
 * Get the symbol for a given currency code.
 * @param {string} currency - e.g. 'AFN', 'USD', 'PKR'
 * @returns {string} symbol like ؋, $, €, ₨
 */
export const getCurrencySymbol = (currency) =>
  CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.AFN;

/**
 * Format a number with the correct currency symbol.
 * @param {number|string} amount
 * @param {string} currency - e.g. 'AFN' (default)
 * @returns {string} formatted string, e.g. "1,234,567 ؋"
 */
export const formatCurrency = (amount, currency = 'AFN') => {
  const num = parseFloat(amount || 0);
  const symbol = getCurrencySymbol(currency);
  return `${num.toLocaleString()} ${symbol}`;
};

/**
 * Get flag + code label for a currency (for dropdowns).
 * @param {string} currency
 * @returns {string} e.g. "🇦🇫 ؋ AFN"
 */
export const getCurrencyLabel = (currency) => {
  const flag = CURRENCY_FLAGS[currency] || '';
  const symbol = getCurrencySymbol(currency);
  return `${flag} ${symbol} ${currency}`;
};

export default { CURRENCY_SYMBOLS, CURRENCY_FLAGS, getCurrencySymbol, formatCurrency, getCurrencyLabel };
