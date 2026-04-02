const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OPTIMIZABLE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/tiff',
]);

async function optimizeUploadedImage(file, options = {}) {
  if (!file || !file.path || !OPTIMIZABLE_MIME_TYPES.has(file.mimetype)) {
    return file;
  }

  const maxWidth = options.maxWidth || 1600;
  const quality = options.quality || 72;
  const parsedName = path.parse(file.filename);
  const outputFilename = `${parsedName.name}.webp`;
  const outputPath = path.join(path.dirname(file.path), outputFilename);
  const tempOutputPath = outputPath === file.path
    ? path.join(path.dirname(file.path), `${parsedName.name}.optimized.webp`)
    : outputPath;

  try {
    await sharp(file.path)
      .rotate()
      .resize({
        width: maxWidth,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toFile(tempOutputPath);

    if (tempOutputPath !== outputPath) {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      fs.renameSync(tempOutputPath, outputPath);
    }

    if (fs.existsSync(file.path) && file.path !== outputPath) {
      fs.unlinkSync(file.path);
    }

    const stats = fs.statSync(outputPath);
    return {
      ...file,
      filename: outputFilename,
      path: outputPath,
      mimetype: 'image/webp',
      size: stats.size,
    };
  } catch (error) {
    console.warn(`[uploads] Skipping optimization for ${file.originalname}: ${error.message}`);
    if (tempOutputPath !== outputPath && fs.existsSync(tempOutputPath)) {
      fs.unlinkSync(tempOutputPath);
    }
    return file;
  }
}

async function optimizeUploadedImages(files, options) {
  return Promise.all((files || []).map((file) => optimizeUploadedImage(file, options)));
}

module.exports = {
  optimizeUploadedImage,
  optimizeUploadedImages,
};