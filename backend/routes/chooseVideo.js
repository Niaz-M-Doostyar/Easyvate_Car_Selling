const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ChooseVideo = require('../models/ChooseVideo');

// Setup upload directory
const uploadDir = path.join(__dirname, '..', 'uploads', 'videos');
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
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

// File filter – only video files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, mov, avi, mkv, webm)'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// -------------------- CRUD ROUTES --------------------

// GET all videos
router.get('/', async (req, res) => {
  try {
    const videos = await ChooseVideo.findAll({ order: [['order', 'ASC'], ['createdAt', 'DESC']] });
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single video
router.get('/:id', async (req, res) => {
  try {
    const video = await ChooseVideo.findByPk(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new video (with upload)
router.post('/', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const videoPath = `/uploads/videos/${req.file.filename}`;
    const { order } = req.body;

    const newVideo = await ChooseVideo.create({
      videoPath,
      order: order || 0
    });

    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update video (replace video file and/or order)
router.put('/:id', upload.single('video'), async (req, res) => {
  try {
    const video = await ChooseVideo.findByPk(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const { order } = req.body;
    const updateData = { order: order !== undefined ? order : video.order };

    // If a new video was uploaded, replace the old one
    if (req.file) {
      // Delete old video file
      if (video.videoPath) {
        const oldPath = path.join(__dirname, '..', video.videoPath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.videoPath = `/uploads/videos/${req.file.filename}`;
    }

    await video.update(updateData);
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE video (and its file)
router.delete('/:id', async (req, res) => {
  try {
    const video = await ChooseVideo.findByPk(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Delete video file
    if (video.videoPath) {
      const filePath = path.join(__dirname, '..', video.videoPath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await video.destroy();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;