const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const outDir = path.join(__dirname, '..', 'uploads', 'pdf-test');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const fontsDir = path.join(__dirname, '..', 'fonts');
const bahijPath = path.join(fontsDir, 'BahijNazanin.ttf');
if (!fs.existsSync(bahijPath)) {
  console.error('BahijNazanin.ttf not found at', bahijPath);
  process.exit(2);
}
const fontB64 = fs.readFileSync(bahijPath).toString('base64');

const html = `<!doctype html>
<html lang="ps">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0mm; }
  @font-face{ font-family: 'BahijNazaninLocal'; src: url(data:font/truetype;charset=utf-8;base64,${fontB64}) format('truetype'); }
  body{ font-family:'BahijNazaninLocal', serif; direction:rtl; margin:0; padding:12mm; }
  h1{ text-align:center; color:#0d1b2a }
  .meta{ text-align:right; margin-bottom:12px }
</style>
</head>
<body>
  <h1>نیازي خپلواک - د ازمایښتي بل</h1>
  <div class="meta">دفتر: 0700000893 — جلد: جلد 1 — صفحه: 892</div>
  <div style="text-align:right">مشتري: علي خان — تذکره: NID-000123 — تلیفون: 0700123456</div>
  <p style="margin-top:18px; text-align:right">دا متن د فونټ او راست په ازموینه کې دی. نېټه: ${new Date().toLocaleDateString('fa-AF')}</p>
</body>
</html>`;

async function findChromeExecutable() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

(async function run() {
  console.log('Puppeteer debug: attempting to launch Chromium');

  const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];
  let browser = null;
  const attempts = [
    { headless: 'new', args: launchArgs, dumpio: true },
    { headless: true, args: launchArgs, dumpio: true },
  ];

  for (const opt of attempts) {
    try {
      console.log('Launching with options:', JSON.stringify(opt));
      browser = await puppeteer.launch(opt);
      console.log('Launched successfully');
      break;
    } catch (err) {
      console.error('Launch failed:', err && err.message ? err.message : err);
    }
  }

  if (!browser) {
    const chrome = await findChromeExecutable();
    if (chrome) {
      try {
        console.log('Trying system Chrome at', chrome);
        browser = await puppeteer.launch({ headless: true, executablePath: chrome, args: launchArgs, dumpio: true });
        console.log('Launched system Chrome successfully');
      } catch (err) {
        console.error('System Chrome launch failed:', err && err.message ? err.message : err);
      }
    }
  }

  if (!browser) {
    console.error('Could not launch any Chromium/Chrome instance');
    process.exit(3);
  }

  try {
    const page = await browser.newPage();
    console.log('Created page');
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    console.log('Content set (fonts should be embedded)');
    try { await page.evaluateHandle('document.fonts.ready'); console.log('document.fonts.ready resolved'); } catch (e) { console.warn('fonts.ready did not resolve cleanly', e && e.message ? e.message : e); }

    const outPath = path.join(outDir, 'puppeteer_test_pashto.pdf');
    console.log('Generating PDF to', outPath);
    await page.pdf({ path: outPath, printBackground: true, width: '210mm', height: '297mm', margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' } });
    console.log('PDF created at', outPath);
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during page render/pdf:', err && err.stack ? err.stack : err);
    try { await browser.close(); } catch (e) {}
    process.exit(4);
  }
})();
