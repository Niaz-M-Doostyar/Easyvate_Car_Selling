const ExchangeRate = require('../../models/ExchangeRate');

// In-memory cache to avoid database hits on every request
let rateCache = null;
let lastCacheUpdate = null;
const CACHE_TTL = 60000; // 1 minute

// Default fallback rates
const DEFAULT_RATES = { USD: 70, PKR: 0.25, AFN: 1 };

// Get current exchange rates (with caching)
async function getRates() {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (rateCache && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_TTL) {
    return rateCache;
  }

  try {
    const rates = await ExchangeRate.findAll({
      where: { isActive: true }
    });

    if (rates.length === 0) {
      // No rates in database, use defaults
      rateCache = DEFAULT_RATES;
    } else {
      // Build rates object from database
      rateCache = { AFN: 1 };
      rates.forEach(rate => {
        rateCache[rate.currency] = parseFloat(rate.rateToAFN);
      });
    }

    lastCacheUpdate = now;
    return rateCache;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return DEFAULT_RATES;
  }
}

// Convert any currency to AFN
async function toAFN(amount, currency) {
  const rates = await getRates();
  const rate = rates[currency] || 1;
  return Number(amount || 0) * rate;
}

// Clear cache (call this when rates are updated)
function clearCache() {
  rateCache = null;
  lastCacheUpdate = null;
}

// Initialize database with default rates if empty
async function initializeRates() {
  try {
    const count = await ExchangeRate.count();
    if (count === 0) {
      await ExchangeRate.bulkCreate([
        { currency: 'USD', rateToAFN: 70, isActive: true },
        { currency: 'PKR', rateToAFN: 0.25, isActive: true }
      ]);
      console.log('✓ Default exchange rates initialized');
    }
  } catch (error) {
    console.error('Error initializing exchange rates:', error);
  }
}

module.exports = {
  getRates,
  toAFN,
  clearCache,
  initializeRates
};
