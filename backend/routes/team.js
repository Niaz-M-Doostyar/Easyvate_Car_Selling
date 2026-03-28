const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { TeamEnglish, TeamPashto, TeamDari } = require('../models');
const { verifyToken } = require('../src/middleware/auth');
const { checkPermission } = require('../src/middleware/permissions');

// Allowed roles (adjust as needed)
// const ROLE_TEAM = ['Super Admin', 'Owner', 'Manager'];

// Configure multer for team member image uploads
const uploadDir = path.join(__dirname, '..', 'uploads', 'team');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `team-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: fileFilter
});

// Helper to get model based on language
const getModel = (lang) => {
  switch (lang) {
    case 'en': return TeamEnglish;
    case 'ps': return TeamPashto;
    case 'fa': return TeamDari;
    default: return null;
  }
};

// ─────────────────── PUBLIC ENDPOINTS (if you want public GET) ───────────────────
// GET /api/team/:lang – List all team members for a language
router.get('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }
    const members = await Model.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/team/:lang/:id – Get single team member
router.get('/:lang/:id', async (req, res) => {
  try {
    const { lang, id } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }
    const member = await Model.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────── PROTECTED ENDPOINTS (require auth) ───────────────────
// POST /api/team/:lang – Create new team member
router.post('/:lang', upload.single('image'), async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    const { name, position, description, facebook, instagram, x } = req.body;
    const data = { name, position, description, facebook, instagram, x };

    if (req.file) {
      data.image = `/uploads/team/${req.file.filename}`;
    }

    const member = await Model.create(data);
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error('Team create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/team/:lang/:id – Update team member
router.put('/:lang/:id', upload.single('image'), async (req, res) => {
  try {
    const { lang, id } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    const member = await Model.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    if (req.body.remove_image === 'true' && !req.file) {
        if (member.image) {
            const oldFilename = path.basename(member.image);
            const oldPath = path.join(uploadDir, oldFilename);
            if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            }
            data.image = null; // will be updated
        }
    }

    const { name, position, description, facebook, instagram, x } = req.body;
    const data = { name, position, description, facebook, instagram, x };

    // If new image uploaded, replace old one
    if (req.file) {
      // Delete old image if exists
      if (member.image) {
        const oldFilename = path.basename(member.image);
        const oldPath = path.join(uploadDir, oldFilename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      data.image = `/uploads/team/${req.file.filename}`;
    }

    await member.update(data);
    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Team update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/team/:lang/:id – Delete team member
router.delete('/:lang/:id', async (req, res) => {
  try {
    const { lang, id } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    const member = await Model.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Delete associated image file
    if (member.image) {
      const filename = path.basename(member.image);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await member.destroy();
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;