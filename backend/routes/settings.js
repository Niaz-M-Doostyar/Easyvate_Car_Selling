const express = require('express');
const router = express.Router();
const { execFile, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('../src/config');

const upload = multer({ dest: path.join(__dirname, '..', 'uploads', 'backups') });

// Ensure backups directory exists
const backupsDir = path.join(__dirname, '..', 'uploads', 'backups');
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

const MYSQL_BINARIES = {
  mysqldump: [
    process.env.MYSQLDUMP_PATH,
    '/Applications/MAMP/Library/bin/mysqldump',
    '/opt/homebrew/bin/mysqldump',
    '/usr/local/bin/mysqldump',
    '/usr/local/mysql/bin/mysqldump',
    '/opt/anaconda3/bin/mysqldump',
    'mysqldump',
  ],
  mysql: [
    process.env.MYSQL_PATH,
    '/Applications/MAMP/Library/bin/mysql',
    '/opt/homebrew/bin/mysql',
    '/usr/local/bin/mysql',
    '/usr/local/mysql/bin/mysql',
    '/opt/anaconda3/bin/mysql',
    'mysql',
  ],
};

const resolveMySqlBinary = (name) => {
  for (const candidate of MYSQL_BINARIES[name].filter(Boolean)) {
    if (candidate.includes(path.sep)) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
      continue;
    }

    try {
      const resolved = execFileSync('which', [candidate], { encoding: 'utf8' }).trim();
      if (resolved) {
        return resolved;
      }
    } catch (_) {
      // Try the next candidate.
    }
  }

  return null;
};

const requireMySqlBinary = (name) => {
  const resolved = resolveMySqlBinary(name);
  if (!resolved) {
    throw new Error(`Could not find the ${name} binary. Install the MySQL client tools or set ${name === 'mysql' ? 'MYSQL_PATH' : 'MYSQLDUMP_PATH'}.`);
  }
  return resolved;
};

const resolveCliHost = (host) => (host === 'localhost' ? '127.0.0.1' : host);

// GET /backup — download a SQL dump
router.get('/backup', async (req, res) => {
  try {
    const db = config.DB;
    const cliHost = resolveCliHost(db.HOST);
    const mysqlDumpPath = requireMySqlBinary('mysqldump');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${db.DATABASE}_${timestamp}.sql`;
    const filePath = path.join(backupsDir, filename);

    const args = [
      '--protocol=TCP',
      '-h', cliHost,
      '-P', String(db.PORT),
      '-u', db.USER,
    ];
    if (db.PASSWORD) {
      args.push(`-p${db.PASSWORD}`);
    }
    args.push(
      '--single-transaction',
      '--routines',
      '--triggers',
      db.DATABASE,
    );

    await new Promise((resolve, reject) => {
      const outStream = fs.createWriteStream(filePath);
      const proc = execFile(mysqlDumpPath, args, { maxBuffer: 100 * 1024 * 1024 });
      proc.stdout.pipe(outStream);
      proc.stderr.on('data', (d) => console.error('mysqldump stderr:', d.toString()));
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`mysqldump exited with code ${code}`));
      });
      proc.on('error', reject);
    });

    res.download(filePath, filename, () => {
      // Clean up after download
      fs.unlink(filePath, () => {});
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Failed to create backup: ' + error.message });
  }
});

// POST /restore — upload a SQL file and restore
router.post('/restore', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No backup file uploaded' });

  try {
    const db = config.DB;
    const cliHost = resolveCliHost(db.HOST);
    const filePath = req.file.path;
    const mysqlPath = requireMySqlBinary('mysql');

    const head = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }).slice(0, 512);
    const looksLikeSql = /\.sql$/i.test(req.file.originalname || '')
      || /(--|\/\*|create\s+table|insert\s+into|drop\s+table|mysql dump|lock tables|delimiter)/i.test(head);
    if (!looksLikeSql) {
      fs.unlink(filePath, () => {});
      return res.status(400).json({ error: 'Invalid SQL backup file' });
    }

    const args = [
      '--protocol=TCP',
      '-h', cliHost,
      '-P', String(db.PORT),
      '-u', db.USER,
    ];
    if (db.PASSWORD) {
      args.push(`-p${db.PASSWORD}`);
    }
    args.push(db.DATABASE);

    await new Promise((resolve, reject) => {
      const proc = execFile(mysqlPath, args, { maxBuffer: 100 * 1024 * 1024 });
      const sqlStream = fs.createReadStream(filePath);
      sqlStream.pipe(proc.stdin);
      proc.stderr.on('data', (d) => console.error('mysql restore stderr:', d.toString()));
      proc.on('close', (code) => {
        fs.unlink(filePath, () => {});
        if (code === 0) resolve();
        else reject(new Error(`mysql exited with code ${code}`));
      });
      proc.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });

    res.json({ message: 'Database restored successfully' });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Failed to restore database: ' + error.message });
  }
});

module.exports = router;
