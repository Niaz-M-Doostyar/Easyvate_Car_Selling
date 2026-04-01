const ExchangeRate = require('../../models/ExchangeRate');
const DailyExchangeRate = require('../../models/DailyExchangeRate');
const { Op } = require('sequelize');

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

// Convert any currency to AFN and return both amount and rate used
async function toAFN(amount, currency) {
  if (!amount || isNaN(amount)) return { amountAFN: 0, rate: 1 };
  if (currency === 'AFN') return { amountAFN: Number(amount), rate: 1 };
  
  const rates = await getRates();
  const rate = rates[currency] || 1;
  return { amountAFN: Number(amount) * rate, rate };
}

// Legacy toAFN for backward compatibility (returns just the number)
async function toAFNAmount(amount, currency) {
  const { amountAFN } = await toAFN(amount, currency);
  return amountAFN;
}

// Save today's exchange rates to daily log
async function saveDailyRates(userId) {
  try {
    const rates = await getRates();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    for (const [currency, rate] of Object.entries(rates)) {
      if (currency === 'AFN') continue;
      await DailyExchangeRate.upsert({
        date: today,
        currency,
        rateToAFN: rate,
        createdBy: userId || null
      });
    }
  } catch (error) {
    console.error('Error saving daily rates:', error);
  }
}

// Get the exchange rate for a specific date (for historical lookups)
async function getRateForDate(currency, date) {
  if (currency === 'AFN') return 1;
  
  try {
    const dateStr = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
    
    // First try exact date
    let dailyRate = await DailyExchangeRate.findOne({
      where: { date: dateStr, currency }
    });
    
    if (dailyRate) return parseFloat(dailyRate.rateToAFN);
    
    // Fall back to most recent rate before that date
    dailyRate = await DailyExchangeRate.findOne({
      where: { 
        currency,
        date: { [Op.lte]: dateStr }
      },
      order: [['date', 'DESC']]
    });
    
    if (dailyRate) return parseFloat(dailyRate.rateToAFN);
    
    // Fall back to current rates
    const rates = await getRates();
    return rates[currency] || 1;
  } catch (error) {
    console.error('Error getting rate for date:', error);
    const rates = await getRates();
    return rates[currency] || 1;
  }
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
    // Save today's rates
    await saveDailyRates();
  } catch (error) {
    console.error('Error initializing exchange rates:', error);
  }
}

module.exports = {
  getRates,
  toAFN,
  toAFNAmount,
  saveDailyRates,
  getRateForDate,
  clearCache,
  initializeRates
};
