const PARTNER_PROFIT_LEDGER_TYPE = 'Profit Share';
const CREDIT_LEDGER_TYPES = ['Received', 'Installment', 'Loan Payment', 'Investment', PARTNER_PROFIT_LEDGER_TYPE];

const safeNum = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value) => Number(safeNum(value).toFixed(2));
const roundPercentage = (value) => Number(safeNum(value).toFixed(2));

const normalizeCalculationMethod = (value) => {
  if (value === 'Investment' || value === 'Percentage') {
    return value;
  }

  return '';
};

const detectCalculationMethod = (sharingPersons) => {
  const explicitMethod = (sharingPersons || [])
    .map((person) => normalizeCalculationMethod(person.calculationMethod))
    .find(Boolean);

  if (explicitMethod) {
    return explicitMethod;
  }

  return (sharingPersons || []).some((person) => safeNum(person.investmentAmount) > 0)
    ? 'Investment'
    : 'Percentage';
};

const sanitizeSharingPerson = (person) => ({
  id: person.id || null,
  customerId: person.customerId ? Number(person.customerId) : null,
  personName: String(person.personName || '').trim(),
  phoneNumber: String(person.phoneNumber || '').trim(),
  percentage: roundPercentage(person.percentage),
  investmentAmount: roundMoney(person.investmentAmount),
  calculationMethod: normalizeCalculationMethod(person.calculationMethod),
  isActive: person.isActive !== false,
});

const normalizeSharingPersons = (sharingPersons, totalCostAFN) => {
  const totalCost = roundMoney(totalCostAFN);
  const partners = (Array.isArray(sharingPersons) ? sharingPersons : [])
    .map(sanitizeSharingPerson)
    .filter((person) => person.personName || person.customerId || person.percentage > 0 || person.investmentAmount > 0);

  if (partners.length === 0) {
    return {
      partners: [],
      calculationMethod: 'Percentage',
      usesInvestment: false,
      totalPartnerInvestment: 0,
      totalPartnerPercentage: 0,
      ownerInvestment: totalCost,
      ownerPercentage: 100,
      totalCost,
    };
  }

  const calculationMethod = detectCalculationMethod(partners);

  if (calculationMethod === 'Investment') {
    if (totalCost <= 0) {
      throw new Error('Vehicle total cost must be greater than 0 before adding investment-based partners');
    }

    const invalidPartner = partners.find((person) => person.investmentAmount <= 0);
    if (invalidPartner) {
      throw new Error('Each partner must have a positive investment amount when investment-based sharing is used');
    }

    const totalPartnerInvestment = roundMoney(partners.reduce((sum, person) => sum + person.investmentAmount, 0));
    if (totalPartnerInvestment > totalCost + 0.01) {
      throw new Error('Total partner investment cannot exceed the vehicle total cost');
    }

    const normalizedPartners = partners.map((person) => ({
      ...person,
      investmentAmount: roundMoney(person.investmentAmount),
      percentage: roundPercentage((person.investmentAmount / totalCost) * 100),
      calculationMethod: 'Investment',
    }));

    const totalPartnerPercentage = roundPercentage(
      normalizedPartners.reduce((sum, person) => sum + person.percentage, 0)
    );

    return {
      partners: normalizedPartners,
      calculationMethod: 'Investment',
      usesInvestment: true,
      totalPartnerInvestment,
      totalPartnerPercentage,
      ownerInvestment: roundMoney(totalCost - totalPartnerInvestment),
      ownerPercentage: roundPercentage(Math.max(100 - totalPartnerPercentage, 0)),
      totalCost,
    };
  }

  const invalidPartner = partners.find((person) => person.percentage <= 0);
  if (invalidPartner) {
    throw new Error('Each partner must have a positive share percentage when percentage-based sharing is used');
  }

  const totalPartnerPercentage = roundPercentage(partners.reduce((sum, person) => sum + person.percentage, 0));
  if (totalPartnerPercentage > 100.01) {
    throw new Error('Total partner percentage cannot exceed 100%');
  }

  const normalizedPartners = partners.map((person) => ({
    ...person,
    percentage: roundPercentage(person.percentage),
    investmentAmount: totalCost > 0 ? roundMoney((totalCost * person.percentage) / 100) : 0,
    calculationMethod: 'Percentage',
  }));

  const totalPartnerInvestment = roundMoney(
    normalizedPartners.reduce((sum, person) => sum + person.investmentAmount, 0)
  );

  return {
    partners: normalizedPartners,
    calculationMethod: 'Percentage',
    usesInvestment: false,
    totalPartnerInvestment,
    totalPartnerPercentage,
    ownerInvestment: roundMoney(Math.max(totalCost - totalPartnerInvestment, 0)),
    ownerPercentage: roundPercentage(Math.max(100 - totalPartnerPercentage, 0)),
    totalCost,
  };
};

const buildProfitDistribution = (sharingPersons, profit, totalCostAFN) => {
  const partnership = normalizeSharingPersons(sharingPersons, totalCostAFN);
  const distributableProfit = roundMoney(Math.max(safeNum(profit), 0));

  const partnerDistributions = partnership.partners.map((person) => ({
    ...person,
    sharePercentage: roundPercentage(person.percentage),
    amount: roundMoney((distributableProfit * person.percentage) / 100),
  })).filter((person) => person.amount > 0);

  let totalSharedAmount = roundMoney(partnerDistributions.reduce((sum, person) => sum + person.amount, 0));
  const diff = roundMoney(distributableProfit - totalSharedAmount);

  if (partnerDistributions.length > 0 && Math.abs(diff) <= 0.05) {
    const lastPartner = partnerDistributions[partnerDistributions.length - 1];
    lastPartner.amount = roundMoney(lastPartner.amount + diff);
    totalSharedAmount = roundMoney(totalSharedAmount + diff);
  }

  return {
    partnership,
    distributableProfit,
    totalSharedAmount,
    ownerShare: roundMoney(safeNum(profit) - totalSharedAmount),
    partnerDistributions,
  };
};

module.exports = {
  PARTNER_PROFIT_LEDGER_TYPE,
  CREDIT_LEDGER_TYPES,
  safeNum,
  roundMoney,
  roundPercentage,
  normalizeSharingPersons,
  buildProfitDistribution,
};