const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../src/config');

const BACKUP_DIR = path.join(__dirname, '..', 'uploads', 'backups');

// Ensure backup dir exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const resolveDbClient = (clientName) => {
  const candidates = [
    `/Applications/MAMP/Library/bin/${clientName}`,
    `/opt/homebrew/bin/${clientName}`,
    `/usr/local/bin/${clientName}`,
    `/usr/local/mysql/bin/${clientName}`,
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  return found || clientName;
};

// GET /api/settings/backups - List available backups
router.get('/backups', async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return { name: f, size: stats.size, date: stats.mtime };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ data: files });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// POST /api/settings/backup - Create a database backup
router.post('/backup', async (req, res) => {
  try {
    const db = config.DB;
    const host = db.HOST === 'localhost' ? '127.0.0.1' : db.HOST;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${db.DATABASE}_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);

    const passwordArg = db.PASSWORD ? `-p'${db.PASSWORD}'` : '';
    const mysqldumpBin = resolveDbClient('mysqldump');
    const cmd = `"${mysqldumpBin}" -h ${host} -P ${db.PORT} -u ${db.USER} ${passwordArg} --single-transaction --routines --triggers ${db.DATABASE} > '${filePath}'`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        // Clean up failed backup
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(500).json({ error: { message: 'Backup failed: ' + error.message } });
      }
      const stats = fs.statSync(filePath);
      res.json({
        success: true,
        data: { name: fileName, size: stats.size, date: stats.mtime }
      });
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// POST /api/settings/restore/:fileName - Restore from a backup
router.post('/restore/:fileName', async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName); // sanitize
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: { message: 'Backup file not found' } });
    }

    const db = config.DB;
    const host = db.HOST === 'localhost' ? '127.0.0.1' : db.HOST;
    const passwordArg = db.PASSWORD ? `-p'${db.PASSWORD}'` : '';
    const mysqlBin = resolveDbClient('mysql');
    const cmd = `"${mysqlBin}" -h ${host} -P ${db.PORT} -u ${db.USER} ${passwordArg} ${db.DATABASE} < '${filePath}'`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: { message: 'Restore failed: ' + error.message } });
      }
      res.json({ success: true, message: 'Database restored successfully from ' + fileName });
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// GET /api/settings/backup/download/:fileName - Download a backup file
router.get('/backup/download/:fileName', async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: { message: 'Backup file not found' } });
    }

    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// DELETE /api/settings/backup/:fileName - Delete a backup file
router.delete('/backup/:fileName', async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: { message: 'Backup file not found' } });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Backup deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
