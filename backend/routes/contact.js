const express = require('express');
const router = express.Router();
const { ContactEnglish, ContactPashto, ContactDari } = require('../models');
const { verifyToken } = require('../src/middleware/auth');
const { checkPermission } = require('../src/middleware/permissions');

// Allowed roles (adjust as needed)
// const ROLE_CONTACT = ['Super Admin', 'Owner', 'Manager'];

// Helper to get model based on language
const getModel = (lang) => {
  switch (lang) {
    case 'en': return ContactEnglish;
    case 'ps': return ContactPashto;
    case 'fa': return ContactDari;
    default: return null;
  }
};

// ─────────────────── PUBLIC ENDPOINTS (if you want public GET) ───────────────────
// GET /api/contact/:lang – List all contact entries for a language (multiple branches)
router.get('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or da.' });
    }
    const contacts = await Model.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/contact/:lang/:id – Get single contact entry
router.get('/:lang/:id', async (req, res) => {
  try {
    const { lang, id } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }
    const contact = await Model.findByPk(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact entry not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────── PROTECTED ENDPOINTS (require auth) ───────────────────
// POST /api/contact/:lang – Create new contact entry
router.post('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    const {
      email, phone, facebook, instagram, x, youtube,
      weekdays, friday, branchName, address
    } = req.body;

    const contact = await Model.create({
      email, phone, facebook, instagram, x, youtube,
      weekdays, friday, branchName, address
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Contact create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/contact/:lang/:id – Update contact entry
router.put('/:lang/:id', async (req, res) => {
  try {
    const { lang, id } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    const contact = await Model.findByPk(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact entry not found' });
    }

    const {
      email, phone, facebook, instagram, x, youtube,
      weekdays, friday, branchName, address
    } = req.body;

    await contact.update({
      email, phone, facebook, instagram, x, youtube,
      weekdays, friday, branchName, address
    });

    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Contact update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/contact/:lang/:id – Delete contact entry
router.delete('/:lang/:id', async (req, res) => {
  try {
    const { lang, id } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    const contact = await Model.findByPk(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact entry not found' });
    }

    await contact.destroy();
    res.json({ success: true, message: 'Contact entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;