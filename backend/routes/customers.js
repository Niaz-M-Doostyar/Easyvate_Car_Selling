const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const CustomerLedger = require('../models/CustomerLedger');
const Sale = require('../models/Sale');
const Vehicle = require('../models/Vehicle');
const CommissionDistribution = require('../models/CommissionDistribution');
const ShowroomLedger = require('../models/ShowroomLedger');
const { toAFN } = require('../src/services/exchangeRate');
const { CREDIT_LEDGER_TYPES } = require('../src/services/partnership');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer ledger
router.get('/:id/ledger', async (req, res) => {
  try {
    const transactions = await CustomerLedger.findAll({
      where: { customerId: req.params.id },
      order: [['date', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /customers/:id/ledger - Add ledger entry and update showroom balance
router.post('/:id/ledger', async (req, res) => {
  try {
    const { type, amount, currency, purpose, date, saleId } = req.body;

    const lastEntry = await CustomerLedger.findOne({
      where: { customerId: req.params.id },
      order: [['id', 'DESC']]
    });

    const prevBalance = lastEntry ? Number(lastEntry.balance || 0) : 0;
    const amountAFN = await toAFN(amount, currency || 'AFN');
    const signedAmount = CREDIT_LEDGER_TYPES.includes(type) ? Number(amountAFN) : -Number(amountAFN);
    const newBalance = prevBalance + signedAmount;

    const entry = await CustomerLedger.create({
      customerId: req.params.id,
      type,
      amount,
      currency: currency || 'AFN',
      amountInPKR: amountAFN,
      purpose,
      date: date || new Date(),
      balance: newBalance,
      saleId: saleId || null,
      addedBy: req.user.id
    });

    await Customer.update({ balance: newBalance }, { where: { id: req.params.id } });

    // ─────────────────────────────────────────────────────────────
    // Update sale payment status and showroom balance for Installment/Received linked to a sale
    // ─────────────────────────────────────────────────────────────
    let updatedSale = null;
    if (saleId && (type === 'Installment' || type === 'Received')) {
      const sale = await Sale.findByPk(saleId);
      if (sale && sale.paymentStatus !== 'Paid') {
        const payAmt = Number(amountAFN);
        const newPaid = Number(sale.paidAmount || 0) + payAmt;
        const newRemaining = Math.max(Number(sale.remainingAmount || 0) - payAmt, 0);
        const newStatus = newRemaining <= 0 ? 'Paid' : 'Partial';
        await sale.update({
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          paymentStatus: newStatus,
        });
        updatedSale = sale;

        // Also record the cash received in showroom ledger (only if vehicle has no reference person)
        const vehicle = await Vehicle.findByPk(sale.vehicleId);
        const referencePerson = await require('../models/ReferencePerson').findOne({ where: { vehicleId: vehicle?.id } });
        const hasReferencePerson = !!referencePerson;
        if (!hasReferencePerson) {
          await ShowroomLedger.create({
            type: 'Vehicle Sale',
            amount: amount,
            currency: currency || 'AFN',
            amountInPKR: amountAFN,
            description: `Installment payment from customer for sale ${sale.saleId || sale.id}`,
            date: date || new Date(),
            referenceId: sale.id,
            referenceType: 'Sale',
            personName: (await Customer.findByPk(req.params.id)).fullName,
            addedBy: req.user.id
          });
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Update showroom balance for other transaction types
    // ─────────────────────────────────────────────────────────────
    const customer = await Customer.findByPk(req.params.id);
    const customerName = customer ? customer.fullName : 'Customer';

    switch (type) {
      case 'Loan':
        // Money given to customer (loan) – outflow from showroom
        await ShowroomLedger.create({
          type: 'Expense',
          amount: amount,
          currency: currency || 'AFN',
          amountInPKR: amountAFN,
          description: `Loan given to ${customerName} – ${purpose || ''}`,
          date: date || new Date(),
          personName: customerName,
          addedBy: req.user.id
        });
        break;

      case 'Loan Payment':
        // Customer repays loan – inflow to showroom
        await ShowroomLedger.create({
          type: 'Vehicle Sale', // using Vehicle Sale to represent cash inflow
          amount: amount,
          currency: currency || 'AFN',
          amountInPKR: amountAFN,
          description: `Loan repayment from ${customerName} – ${purpose || ''}`,
          date: date || new Date(),
          personName: customerName,
          addedBy: req.user.id
        });
        break;

      case 'Investment':
        // Customer invests money – inflow to showroom
        await ShowroomLedger.create({
          type: 'Vehicle Sale',
          amount: amount,
          currency: currency || 'AFN',
          amountInPKR: amountAFN,
          description: `Investment received from ${customerName} – ${purpose || ''}`,
          date: date || new Date(),
          personName: customerName,
          addedBy: req.user.id
        });
        break;

      case 'Profit Share':
        // Profit paid to customer – outflow from showroom
        await ShowroomLedger.create({
          type: 'Expense',
          amount: amount,
          currency: currency || 'AFN',
          amountInPKR: amountAFN,
          description: `Profit share paid to ${customerName} – ${purpose || ''}`,
          date: date || new Date(),
          personName: customerName,
          addedBy: req.user.id
        });
        break;

      case 'Received':
        // General cash received (not linked to sale) – inflow
        if (!saleId) {
          await ShowroomLedger.create({
            type: 'Vehicle Sale',
            amount: amount,
            currency: currency || 'AFN',
            amountInPKR: amountAFN,
            description: `Payment received from ${customerName} – ${purpose || ''}`,
            date: date || new Date(),
            personName: customerName,
            addedBy: req.user.id
          });
        }
        break;

      case 'Paid':
        // Cash paid to customer (general) – outflow
        await ShowroomLedger.create({
          type: 'Expense',
          amount: amount,
          currency: currency || 'AFN',
          amountInPKR: amountAFN,
          description: `Payment made to ${customerName} – ${purpose || ''}`,
          date: date || new Date(),
          personName: customerName,
          addedBy: req.user.id
        });
        break;

      // For 'Sale' type, the showroom entry is already created by the sales route.
      // For 'Installment' and 'Received' with saleId, handled above.
      default:
        break;
    }

    res.status(201).json(entry);
  } catch (error) {
    console.error('Ledger entry error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if customer has sales
    const salesCount = await Sale.count({ where: { customerId: customer.id } });
    if (salesCount > 0) {
      return res.status(400).json({ error: 'Cannot delete customer with existing sales' });
    }
    
    // Delete ledger entries
    await CustomerLedger.destroy({ where: { customerId: customer.id } });
    
    // Delete customer
    await customer.destroy();
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch direct sales where this customer is the buyer
    const directSales = await Sale.findAll({
      where: { customerId: customer.id },
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        { model: CommissionDistribution, as: 'commissions', include: [{ model: Customer, as: 'customer', required: false }] }
      ],
      order: [['saleDate', 'DESC']]
    });

    // Also include sales where this customer received commission (partner/ investor)
    const commissionRows = await CommissionDistribution.findAll({ where: { customerId: customer.id }, attributes: ['saleId'] });
    const partnerSaleIds = commissionRows.map(r => r.saleId).filter(Boolean);
    let partnerSales = [];
    if (partnerSaleIds.length > 0) {
      partnerSales = await Sale.findAll({
        where: { id: partnerSaleIds },
        include: [
          { model: Vehicle, as: 'vehicle' },
          { model: Customer, as: 'customer' },
          { model: CommissionDistribution, as: 'commissions', include: [{ model: Customer, as: 'customer', required: false }] }
        ],
        order: [['saleDate', 'DESC']]
      });
    }

    // Merge and dedupe sales (direct buyer sales first)
    const allMap = new Map();
    directSales.forEach(s => allMap.set(String(s.id), s));
    partnerSales.forEach(s => allMap.set(String(s.id), s));
    const allSales = Array.from(allMap.values()).sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));

    const ledger = await CustomerLedger.findAll({ where: { customerId: customer.id }, order: [['date', 'DESC']] });

    res.json({ customer, sales: allSales, ledger });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;