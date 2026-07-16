export const toAFN = (amount, sourceCurrency = 'AFN', rates = {}) => {
  const value = Number(amount) || 0;
  const source = String(sourceCurrency || 'AFN').toUpperCase();
  if (source === 'AFN') return value;
  const direct = Number(rates[`${source}-AFN`]);
  if (direct > 0) return value * direct;
  const inverse = Number(rates[`AFN-${source}`]);
  return inverse > 0 ? value / inverse : value;
};

export const fromAFN = (amount, targetCurrency = 'AFN', rates = {}) => {
  const value = Number(amount) || 0;
  const target = String(targetCurrency || 'AFN').toUpperCase();
  if (target === 'AFN') return value;
  const direct = Number(rates[`${target}-AFN`]);
  if (direct > 0) return value / direct;
  const inverse = Number(rates[`AFN-${target}`]);
  return inverse > 0 ? value * inverse : value;
};

export const convertCurrency = (amount, source, target, rates = {}) =>
  fromAFN(toAFN(amount, source, rates), target, rates);
