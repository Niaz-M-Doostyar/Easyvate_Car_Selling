const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AboutEnglish, AboutPashto, AboutDari } = require('../models');
const { AboutLogoEnglish, AboutLogoPashto, AboutLogoDari } = require('../models');
const { optimizeUploadedImages } = require('../src/services/imageOptimization');

// Create upload directories if they don't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'about');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const aboutLogoUploadDir = path.join(__dirname, '..', 'uploads', 'about-logos');
if (!fs.existsSync(aboutLogoUploadDir)) {
  fs.mkdirSync(aboutLogoUploadDir, { recursive: true });
}

// Storage for main about content (if any future file uploads)
const aboutStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `about-${uniqueSuffix}${ext}`);
  }
});

// Storage for logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, aboutLogoUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Upload middleware for logos (multiple files, max 20)
const uploadLogos = multer({
  storage: logoStorage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: fileFilter
}).array('logos', 20);

// Helper to get model based on language
const getModel = (lang) => {
  switch (lang) {
    case 'en': return AboutEnglish;
    case 'ps': return AboutPashto;
    case 'fa': return AboutDari;
    default: return null;
  }
};

const getLogoModel = (lang) => {
  switch (lang) {
    case 'en': return AboutLogoEnglish;
    case 'ps': return AboutLogoPashto;
    case 'fa': return AboutLogoDari;
    default: return null;
  }
};

// GET /api/about/:lang - Fetch about content for a language
router.get('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    // Assuming only one record per language, we can get the first (or handle logic)
    let about = await Model.findOne();
    if (!about) {
      // Return empty object with default structure
      about = {};
    }
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/about/:lang/logos – Get all logos for a language's about entry
router.get('/:lang/logos', async (req, res) => {
  try {
    const { lang } = req.params;
    const LogoModel = getLogoModel(lang);
    if (!LogoModel) {
      return res.status(400).json({ error: 'Invalid language code' });
    }
    const AboutModel = getModel(lang);
    const about = await AboutModel.findOne();
    if (!about) {
      return res.json({ data: [] });
    }
    const logos = await LogoModel.findAll({
      where: { aboutId: about.id },
      order: [['order', 'ASC']]
    });
    res.json({ success: true, data: logos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/about/:lang/logos – Upload multiple logos
router.post('/:lang/logos', (req, res) => {
  uploadLogos(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      const { lang } = req.params;
      const LogoModel = getLogoModel(lang);
      const AboutModel = getModel(lang);
      if (!LogoModel || !AboutModel) {
        return res.status(400).json({ error: 'Invalid language code' });
      }

      let about = await AboutModel.findOne();
      if (!about) {
        // Create a minimal about entry if it doesn't exist (optional)
        about = await AboutModel.create({});
      }

      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const optimizedFiles = await optimizeUploadedImages(files, { maxWidth: 1600, quality: 72 });

      const logoRecords = await Promise.all(optimizedFiles.map(async (file, index) => {
        const imageUrl = `/uploads/about-logos/${file.filename}`;
        return LogoModel.create({
          aboutId: about.id,
          filename: file.originalname,
          path: imageUrl,
          size: file.size,
          order: index
        });
      }));

      res.status(201).json({ success: true, data: logoRecords });
    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// DELETE /api/about/logos/:logoId – Delete a specific logo
router.delete('/logos/:logoId', async (req, res) => {
  try {
    const { logoId } = req.params;
    // Need to find which language model it belongs to – we'll search all three
    const logoModels = [AboutLogoEnglish, AboutLogoPashto, AboutLogoDari];
    let found = null;
    for (const Model of logoModels) {
      found = await Model.findByPk(logoId);
      if (found) break;
    }
    if (!found) {
      return res.status(404).json({ error: 'Logo not found' });
    }

    // Delete file
    const filename = path.basename(found.path);
    const filePath = path.join(__dirname, '..', 'uploads', 'about-logos', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await found.destroy();
    res.json({ success: true, message: 'Logo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/about/:lang - Create or update about content
router.post('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    // Extract fields from request body
    const {
      title, subtitle, description, wide_feature, trust_feature,
      professional_feature, about_us, experience, choose_trust,
      choose_quality, choose_process
    } = req.body;

    // Prepare data object
    const data = {
      title,
      subtitle,
      description,
      wide_feature,
      trust_feature,
      professional_feature,
      about_us,
      experience,
      choose_trust,
      choose_quality,
      choose_process
    };

    // Check if record exists (we'll assume at most one record per language)
    let about = await Model.findOne();
    if (about) {
      // Update existing
      await about.update(data);
    } else {
      // Create new
      about = await Model.create(data);
    }

    res.status(201).json({ success: true, data: about });
  } catch (error) {
    console.error('About save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/about/:lang - Update (alternative to POST, same logic)
router.put('/:lang', async (req, res) => {
  // Reuse the same logic as POST
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    const {
      title, subtitle, description, wide_feature, trust_feature,
      professional_feature, about_us, experience, choose_trust,
      choose_quality, choose_process
    } = req.body;

    const data = {
      title,
      subtitle,
      description,
      wide_feature,
      trust_feature,
      professional_feature,
      about_us,
      experience,
      choose_trust,
      choose_quality,
      choose_process
    };

    let about = await Model.findOne();
    if (about) {
      await about.update(data);
    } else {
      about = await Model.create(data);
    }

    res.json({ success: true, data: about });
  } catch (error) {
    console.error('About update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/about/:lang - Delete about record
router.delete('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const Model = getModel(lang);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid language code. Use en, ps, or fa.' });
    }

    const about = await Model.findOne();
    if (!about) {
      return res.status(404).json({ error: 'About content not found' });
    }

    // Optionally delete all associated logos here
    const LogoModel = getLogoModel(lang);
    const logos = await LogoModel.findAll({ where: { aboutId: about.id } });
    for (const logo of logos) {
      const filePath = path.join(aboutLogoUploadDir, path.basename(logo.path));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await logo.destroy();
    }

    await about.destroy();
    res.json({ success: true, message: 'About content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;