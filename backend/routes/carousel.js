const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Carousel = require('../models/Carousel');
const { optimizeUploadedImage } = require('../src/services/imageOptimization');

// Setup upload directory
const uploadDir = path.join(__dirname, '..', 'uploads', 'carousel-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `carousel-${uniqueSuffix}${ext}`);
  }
});

// File filter – only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 }, // 500KB
  fileFilter: fileFilter
});

// -------------------- CRUD ROUTES --------------------

// GET all carousel items
router.get('/', async (req, res) => {
  try {
    const items = await Carousel.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single carousel item
router.get('/:id', async (req, res) => {
  try {
    const item = await Carousel.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new carousel item (with optional image)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, model, price, order } = req.body;
    const imageFile = req.file ? await optimizeUploadedImage(req.file, { maxWidth: 1800, quality: 72 }) : null;
    const imagePath = imageFile ? `/uploads/carousel-images/${imageFile.filename}` : null;

    const newItem = await Carousel.create({
      title,
      model,
      price,
      image: imagePath
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update carousel item (optional new image)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const item = await Carousel.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { title, model, price, order } = req.body;

    // Prepare update data
    const updateData = {
      title: title || item.title,
      model: model || item.model,
      price: price || item.price
    };

    // If a new image was uploaded, replace the old one
    if (req.file) {
      const imageFile = await optimizeUploadedImage(req.file, { maxWidth: 1800, quality: 72 });
      // Delete old image file if exists
      if (item.image) {
        const oldPath = path.join(__dirname, '..', item.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = `/uploads/carousel-images/${imageFile.filename}`;
    }

    await item.update(updateData);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE carousel item (and its image)
router.delete('/:id', async (req, res) => {
  try {
    const item = await Carousel.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Delete image file if exists
    if (item.image) {
      const filePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await item.destroy();
    res.json({ message: 'Carousel item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;