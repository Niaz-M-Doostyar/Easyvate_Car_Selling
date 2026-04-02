const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

(async () => {
  try {
    const backendRoot = path.resolve(__dirname, '..');
    const fontsDir = path.join(backendRoot, 'fonts');
    const fontPath = path.join(fontsDir, 'BahijNazanin.ttf');

    if (!fs.existsSync(fontPath)) {
      console.error('[puppeteer] BahijNazanin.ttf not found in', fontPath);
      process.exit(1);
    }

    const fontB64 = fs.readFileSync(fontPath).toString('base64');
    const sample = 'پیرودونکی';

    const html = `<!doctype html>
    <html lang="ps">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        @font-face {
          font-family: 'BahijNazanin';
          src: url(data:font/truetype;charset=utf-8;base64,${fontB64}) format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        html,body{height:100%;}
        body { font-family: 'BahijNazanin', serif; direction: rtl; unicode-bidi: embed; margin:0; padding:20px; }
        .container { max-width: 794px; margin: 0 auto; }
        .header { text-align:center; margin-bottom:8px; }
        .h1 { font-size:20px; font-weight:700; }
        .sub { font-size:12px; color:#444; }
        .pashto { font-size:18px; text-align:right; line-height:1.4; }
        table { width:100%; border-collapse:collapse; margin-top:12px; }
        td { padding:6px; border:1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="h1">نیازي خپلواک</div>
          <div class="sub">موټر پورانچي — د موټرو شورومه</div>
        </div>
        <div class="pashto">نمونه متن: ${sample}</div>
        <table>
          <tr><td>پیرودونکی</td><td>محمد</td></tr>
          <tr><td>پلورونکی</td><td>علی</td></tr>
          <tr><td>موډل</td><td>Corolla</td></tr>
        </table>
      </div>
    </body>
    </html>`;

    const outDir = path.join(backendRoot, 'uploads', 'pdf-test');
    ensureDir(outDir);
    const outPath = path.join(outDir, 'puppeteer_invoice.pdf');

    console.info('[puppeteer] launching chromium...');
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-extensions'
      ]
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 0 });
    await page.emulateMediaType('screen');
    await page.pdf({ path: outPath, format: 'A4', printBackground: true });
    await browser.close();
    console.info('[puppeteer] PDF written to', outPath);
  } catch (err) {
    console.error('[puppeteer] error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
