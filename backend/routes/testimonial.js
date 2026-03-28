const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../src/middleware/auth');
const {
  TestimonialEnglish,
  TestimonialPashto,
  TestimonialDari
} = require('../models');

const getModel = (lang) => {
  switch (lang) {
    case 'en': return TestimonialEnglish;
    case 'ps': return TestimonialPashto;
    case 'fa': return TestimonialDari;
    default: return null;
  }
};

// Public GET all
router.get('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) return res.status(400).json({ error: 'Invalid language' });
    const items = await Model.findAll({ order: [['id', 'DESC']] });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected POST
router.post('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) return res.status(400).json({ error: 'Invalid language' });
    const { name, year, rating, title, message } = req.body;
    const item = await Model.create({ name, year, rating, title, message });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected PUT
router.put('/:lang/:id', async (req, res) => {
  try {
    const { lang, id } = req.params;
    const Model = getModel(lang);
    if (!Model) return res.status(400).json({ error: 'Invalid language' });
    const item = await Model.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const { name, year, rating, title, message } = req.body;
    await item.update({ name, year, rating, title, message });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected DELETE
router.delete('/:lang/:id', async (req, res) => {
  try {
    const { lang, id } = req.params;
    const Model = getModel(lang);
    if (!Model) return res.status(400).json({ error: 'Invalid language' });
    const item = await Model.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;