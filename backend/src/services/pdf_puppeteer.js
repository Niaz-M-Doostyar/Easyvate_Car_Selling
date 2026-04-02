const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeText(v) {
  return v === undefined || v === null || v === '' ? '—' : String(v);
}

function buildHtmlForSale(sale, vehicle, customer, fontB64) {
  const toPashtoNumber = (n) => {
    try { return new Intl.NumberFormat('fa-AF').format(Number(n)); } catch (e) { return String(n || '—'); }
  };
  const toPashtoDate = (d) => { try { return d ? new Date(d).toLocaleDateString('fa-AF') : '—'; } catch (e) { return d || '—'; } };

  // Basic fields
  const price = sale.sellingPrice ? toPashtoNumber(sale.sellingPrice) + ' افغانۍ' : '—';
  const downPayment = sale.downPayment ? toPashtoNumber(sale.downPayment) + ' افغانۍ' : null;
  const remaining = sale.remainingAmount ? toPashtoNumber(sale.remainingAmount) + ' افغانۍ' : null;
  const priceDiff = sale.priceDifference ? toPashtoNumber(sale.priceDifference) + ' افغانۍ' : null;
  const priceDiffBy = sale.priceDifferencePaidBy ? safeText(sale.priceDifferencePaidBy) : null;
  const date = toPashtoDate(sale.saleDate);
  const trafficDate = sale.trafficTransferDate ? toPashtoDate(sale.trafficTransferDate) : null;
  const paymentCurrency = safeText(sale.paymentCurrency || 'AFN');

  // Document metadata seen on traditional bill forms (دفتر / جلد / صفحه / سریال)
  const officeNumber = safeText(sale.officeNumber || sale.officeNo || sale.registerNumber);
  const bookVolume = safeText(sale.bookVolume || sale.volume || sale.jild);
  const pageNumber = safeText(sale.pageNumber || sale.page || sale.safha);
  const serialNumber = safeText(sale.serialNumber || sale.saleSerial || sale.systemGeneratedNo);

  // Buyer and seller full details
  const buyer = {
    name: safeText(sale.buyerName || (customer && customer.fullName)),
    father: safeText(sale.buyerFatherName || (customer && customer.fatherName)),
    province: safeText(sale.buyerProvince || (customer && customer.province)),
    district: safeText(sale.buyerDistrict || (customer && customer.district)),
    village: safeText(sale.buyerVillage || (customer && customer.village)),
    address: safeText(sale.buyerAddress || (customer && customer.currentAddress)),
    id: safeText(sale.buyerIdNumber || (customer && customer.nationalIdNumber)),
    phone: safeText(sale.buyerPhone || (customer && customer.phoneNumber)),
  };
  const seller = {
    name: safeText(sale.sellerName), father: safeText(sale.sellerFatherName), province: safeText(sale.sellerProvince), district: safeText(sale.sellerDistrict), village: safeText(sale.sellerVillage), address: safeText(sale.sellerAddress), id: safeText(sale.sellerIdNumber), phone: safeText(sale.sellerPhone)
  };

  // Vehicle fields
  const veh = {
    manufacturer: safeText(vehicle && vehicle.manufacturer), model: safeText(vehicle && vehicle.model), year: safeText(vehicle && vehicle.year), category: safeText(vehicle && vehicle.category), color: safeText(vehicle && vehicle.color), chassis: safeText(vehicle && vehicle.chassisNumber), engine: safeText(vehicle && vehicle.engineNumber), fuelType: safeText(vehicle && vehicle.fuelType), transmission: safeText(vehicle && vehicle.transmission), plate: safeText(vehicle && vehicle.plateNo), steering: safeText(vehicle && vehicle.steering), monolithic: safeText(vehicle && vehicle.monolithicCut), mileage: vehicle && vehicle.mileage ? toPashtoNumber(vehicle.mileage) + ' km' : '—', vehicleId: safeText(vehicle && vehicle.vehicleId), license: safeText(vehicle && vehicle.vehicleLicense)
  };

  // Exchange vehicle (if any)
  const exch = {
    manufacturer: safeText(sale.exchVehicleManufacturer), model: safeText(sale.exchVehicleModel), year: safeText(sale.exchVehicleYear), category: safeText(sale.exchVehicleCategory), color: safeText(sale.exchVehicleColor), chassis: safeText(sale.exchVehicleChassis), engine: safeText(sale.exchVehicleEngine), engineType: safeText(sale.exchVehicleEngineType), fuelType: safeText(sale.exchVehicleFuelType), transmission: safeText(sale.exchVehicleTransmission), plate: safeText(sale.exchVehiclePlateNo), steering: safeText(sale.exchVehicleSteering), monolithic: safeText(sale.exchVehicleMonolithicCut), mileage: safeText(sale.exchVehicleMileage), license: safeText(sale.exchVehicleLicense)
  };

  const typeKey = sale.saleType || 'Container One Key';
  const types = {
    'Exchange Car': { label: 'د تبادلې بل', color: '#1565c0', accent: '#e3f2fd' },
    'Container One Key': { label: 'کانټینري یوه کیلي بل', color: '#e65100', accent: '#fff3e0' },
    'Licensed Car': { label: 'اسناد دار هفتر مکمل بل', color: '#2e7d32', accent: '#e8f5e9' }
  };
  const billLabel = types[typeKey] ? types[typeKey].label : (sale.saleType || 'بل');
  const accentBg = types[typeKey] ? types[typeKey].accent : '#f5f5f5';
  const accentColor = types[typeKey] ? types[typeKey].color : '#1565c0';

  // Build HTML with all fields
  return `<!doctype html>
  <html lang="ps">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root{ --primary:#0d1b2a; --gold:#c8963e; --lightGold:#f5e6c8; --grayText:#5a5a7a; }
      @page { size: A4; margin: 0mm; }
      @font-face{ font-family: 'BahijNazaninLocal'; src: url(data:font/truetype;charset=utf-8;base64,${fontB64}) format('truetype'); font-weight: normal; font-style: normal; }
      html,body{height:100%; margin:0; padding:0;}
      body{ font-family:'BahijNazaninLocal', 'Noto Naskh Arabic', serif; direction:rtl; unicode-bidi:embed; background:#fff; color:var(--primary); padding:0; }
      .page{ width:210mm; height:297mm; max-width:210mm; margin:0 auto; padding:0mm; box-sizing:border-box; overflow:hidden; }
      .header{ background:var(--primary); color:#fff; padding:10px 14px; position:relative; border-radius:4px; }
      .company{ font-size:15px; font-weight:800; text-align:center; }
      .subtitle{ font-size:10px; color:#ddd; text-align:center; margin-top:4px; }
      .address{ font-size:9px; color:var(--gold); text-align:center; margin-top:6px; }
      .sil{ position:absolute; top:12px; width:70px; height:38px; fill:var(--gold); }
      .sil.right{ right:12px; transform:scaleX(-1); }
      .sil.left{ left:12px; }
      .bill-banner{ margin-top:12px; display:block; background:${accentBg}; border-radius:6px; padding:8px 10px; position:relative; }
      .bill-banner .label{ color:${accentColor}; font-weight:800; font-size:13px; text-align:center; }
      .meta{ display:flex; justify-content:space-between; margin-top:10px; font-size:10px; color:var(--grayText); }
      .section{ margin-top:12px; }
      .cols{ display:flex; gap:10px; }
      .col{ flex:1; }
      .row-card{ border:1px solid #eee; padding:8px; background:#fff; margin-bottom:8px; border-radius:4px; }
      .row-card .lbl{ font-size:9px; color:var(--grayText); text-align:right; }
      .row-card .val{ font-size:11px; color:var(--primary); font-weight:700; text-align:right; }
      .specs table{ width:100%; border-collapse:collapse; }
      .specs td{ border:1px solid #f0f0f0; padding:8px; font-size:10px; text-align:right; }
      .price-badge{ margin-top:10px; background:var(--lightGold); border:1px solid var(--gold); padding:10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; }
      .price-badge .label{ font-size:12px; color:var(--grayText); }
      .price-badge .amount{ font-size:16px; font-weight:800; color:var(--primary); }
      .terms{ margin-top:12px; font-size:10px; color:var(--primary); }
      .signs{ display:flex; gap:10px; margin-top:14px; }
      .sig{ flex:1; border:1px dashed #ddd; height:66px; display:flex; align-items:flex-end; justify-content:center; font-size:10px; color:var(--grayText); padding-bottom:6px; border-radius:4px; }
      .footer{ margin-top:14px; background:var(--primary); color:#fff; padding:8px; text-align:center; font-size:10px; border-radius:4px; }
      .person-table { display:grid; grid-template-columns: 110px 1fr; gap:8px 12px; align-items:start; margin-top:6px; direction:rtl; }
      .pt-label { font-size:9px; color:var(--grayText); text-align:right; padding-right:8px; font-weight:600; }
      .pt-value { font-size:11px; color:var(--primary); text-align:right; font-weight:600; white-space:pre-wrap; word-break:break-word; }
      .row-card{ border:1px solid #eee; padding:10px; background:#fff; margin-bottom:8px; border-radius:6px; border-left:4px solid rgba(13,27,42,0.06); }
      .person-header { font-size:11px; font-weight:800; color:var(--primary); margin-bottom:8px; text-align:right; }
      .small { font-size:9px; color:var(--grayText); }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <svg class="sil left" viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><path d="M10,35 L15,35 L20,20 L45,12 L90,12 L105,20 L115,35 L120,35 L120,42 L110,42 L108,38 L102,38 L100,42 L30,42 L28,38 L22,38 L20,42 L0,42 Z"/></svg>
        <svg class="sil right" viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><path d="M10,35 L15,35 L20,20 L45,12 L90,12 L105,20 L115,35 L120,35 L120,42 L110,42 L108,38 L102,38 L100,42 L30,42 L28,38 L22,38 L20,42 L0,42 Z"/></svg>
        <div style="position:absolute; left:12px; top:8px; color:#d32f2f; font-weight:800; font-size:13px;">${serialNumber}</div>
        <div class="company">نیازي خپلواک</div>
        <div class="subtitle">موټر پورانچي — د موټرو شورومه</div>
        <div class="address">تیلیفون: ۰۷۰۰۰۰۸۹۸۳ | ۰۷۰۰۰۰۸۹۸۲ | کندهار بازار، پوراني سڑک، کوک ناخجا</div>
      </div>

      <div class="bill-banner"><div class="label">${billLabel}</div></div>

      <div class="meta small">
        <div>دفتر: ${officeNumber} — جلد: ${bookVolume} — صفحه: ${pageNumber}</div>
        <div>د بل شمیره: ${safeText(sale.saleId)} — نیټه: ${date}</div>
      </div>

      <div class="section cols">
        <div class="col">
          <div class="row-card">
            <div class="person-header">پېرودونکی</div>
            <div class="person-table">
              <div class="pt-label">بشپړ نوم</div><div class="pt-value">${buyer.name}</div>
              <div class="pt-label">د پلار نوم</div><div class="pt-value">${buyer.father}</div>
              <div class="pt-label">ولایت</div><div class="pt-value">${buyer.province}</div>
              <div class="pt-label">ولسوالي</div><div class="pt-value">${buyer.district}</div>
              <div class="pt-label">کلی</div><div class="pt-value">${buyer.village}</div>
              <div class="pt-label">پته</div><div class="pt-value">${buyer.address}</div>
              <div class="pt-label">د تذکرې شمیره</div><div class="pt-value">${buyer.id}</div>
              <div class="pt-label">تیلیفون</div><div class="pt-value">${buyer.phone}</div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="row-card">
            <div class="person-header">پلورونکی</div>
            <div class="person-table">
              <div class="pt-label">بشپړ نوم</div><div class="pt-value">${seller.name}</div>
              <div class="pt-label">د پلار نوم</div><div class="pt-value">${seller.father}</div>
              <div class="pt-label">ولایت</div><div class="pt-value">${seller.province}</div>
              <div class="pt-label">ولسوالي</div><div class="pt-value">${seller.district}</div>
              <div class="pt-label">کلی</div><div class="pt-value">${seller.village}</div>
              <div class="pt-label">پته</div><div class="pt-value">${seller.address}</div>
              <div class="pt-label">د تذکرې شمیره</div><div class="pt-value">${seller.id}</div>
              <div class="pt-label">تیلیفون</div><div class="pt-value">${seller.phone}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section specs">
        <table>
          <tr><td>جوړونکی</td><td>${veh.manufacturer}</td><td>ماډل</td><td>${veh.model}</td></tr>
          <tr><td>کال</td><td>${veh.year}</td><td>ډول</td><td>${veh.category}</td></tr>
          <tr><td>رنګ</td><td>${veh.color}</td><td>چاسيس</td><td>${veh.chassis}</td></tr>
          <tr><td>انجن شمیره</td><td>${veh.engine}</td><td>د تیلو ډول</td><td>${veh.fuelType}</td></tr>
          <tr><td>ګیربکس</td><td>${veh.transmission}</td><td>سټیرینګ</td><td>${veh.steering}</td></tr>
          <tr><td>پلیت</td><td>${veh.plate}</td><td>موټر نمبر / جواز</td><td>${veh.vehicleId} / ${veh.license}</td></tr>
          <tr><td>موجوده مسافه</td><td>${veh.mileage}</td><td>قطعه / برشي</td><td>${veh.monolithic}</td></tr>
        </table>
      </div>

      ${typeKey === 'Exchange Car' ? `
        <div class="section">
          <div class="small" style="font-weight:700; margin-bottom:6px;">بدیل شوی موټر (تبادله)</div>
          <div class="specs">
            <table>
              <tr><td>جوړونکی</td><td>${exch.manufacturer}</td><td>ماډل</td><td>${exch.model}</td></tr>
              <tr><td>کال</td><td>${exch.year}</td><td>ډول</td><td>${exch.category}</td></tr>
              <tr><td>رنګ</td><td>${exch.color}</td><td>چاسيس</td><td>${exch.chassis}</td></tr>
              <tr><td>انجن</td><td>${exch.engine}</td><td>پلیت</td><td>${exch.plate}</td></tr>
            </table>
          </div>
        </div>
      ` : ''}

      <div class="price-badge">
        <div class="label">د پلور قیمت / اسعار: ${paymentCurrency}</div>
        <div class="amount">${price}</div>
      </div>

      ${downPayment ? `<div class="small" style="margin-top:6px;">پیش پیسه: ${downPayment} — پاتې: ${remaining || '—'}</div>` : ''}
      ${priceDiff ? `<div class="small" style="margin-top:6px;">د قیمت توپیر: ${priceDiff} — ادا کوونکی: ${priceDiffBy || '—'}</div>` : ''}
      ${trafficDate ? `<div class="small" style="margin-top:6px;">د ټرافیک د لیږد نیټه: ${trafficDate}</div>` : ''}

      <div class="terms">
        <div style="font-weight:800; margin-bottom:6px;">شرطونه او تعهدات</div>
        <ol style="padding-right:18px; margin:0;">
          <li>دواړه موټرونه تبادله شوي — له نن ورځ نه بیا د ټرافيک مسؤلیت نوي مالک سره دی.</li>
          <li>تبادله/پلور د دواړو خواوو د رضایت او موافقت سره ترسره شوه.</li>
          <li>موټرونه له بشپړ معاینې وروسته تسلیم شوي — دواړه خواوې له حالت نه راضي دي.</li>
          <li>کمیسیون: ${safeText(sale.commission || '—')}</li>
        </ol>
      </div>

      <div class="signs" style="flex-wrap:wrap;">
        <div class="sig">د پلورونکی لاسلیک<br/><span class="small">${safeText(sale.sellerName)}</span></div>
        <div class="sig">مهر</div>
        <div class="sig">د پیرودونکی لاسلیک<br/><span class="small">${safeText(sale.buyerName)}</span></div>
        <div class="sig">شاهد ۱<br/><span class="small">${safeText(sale.witnessName1)}</span></div>
        <div class="sig">شاهد ۲<br/><span class="small">${safeText(sale.witnessName2)}</span></div>
      </div>

      <div class="footer">دا سند د نیازي خپلواک موټر پورانچي رسمي د پلور ریکارډ دی.</div>
    </div>
  </body>
  </html>`;
}

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

async function generateSaleInvoicePdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  const fileName = `${(sale.saleType || 'invoice').replace(/\s+/g, '_')}_${sale.saleId || Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const fontsDir = path.join(__dirname, '..', '..', 'fonts');
  const bahijPath = path.join(fontsDir, 'BahijNazanin.ttf');
  if (!fs.existsSync(bahijPath)) {
    throw new Error('BahijNazanin.ttf not found in backend/fonts');
  }
  const fontB64 = fs.readFileSync(bahijPath).toString('base64');

  const html = buildHtmlForSale(sale, vehicle, customer, fontB64);

  let browser = null;
  let launched = false;
  const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];
  try {
    browser = await puppeteer.launch({ headless: 'new', args: launchArgs });
    launched = true;
  } catch (err) {
    const chrome = await findChromeExecutable();
    if (!chrome) throw err;
    browser = await puppeteer.launch({ headless: 'new', executablePath: chrome, args: launchArgs });
    launched = true;
  }

    try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 0 });
    await page.emulateMediaType('screen');

    // wait for fonts to be ready so measurements are accurate
    try { await page.evaluateHandle('document.fonts.ready'); } catch (e) { /* ignore */ }

    // Measure content (.page) and compute scale to fit single A4
    const contentSize = await page.evaluate(() => {
      const el = document.querySelector('.page') || document.body;
      const rect = el.getBoundingClientRect();
      return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
    });

    const mmToPx = (mm) => (mm * 96) / 25.4;
    const a4WidthPx = Math.round(mmToPx(210));
    const a4HeightPx = Math.round(mmToPx(297));

    const scaleX = a4WidthPx / Math.max(contentSize.width, 1);
    const scaleY = a4HeightPx / Math.max(contentSize.height, 1);
    const scale = Math.min(scaleX, scaleY, 1);

    if (scale < 1) {
      await page.$eval('.page', (el, s) => {
        el.style.transformOrigin = 'top left';
        el.style.transform = `scale(${s})`;
      }, scale);
      // allow reflow after scaling
      await page.waitForTimeout(80);
    }

    // Produce a single A4 page (no margins) — content has been scaled to fit
    await page.pdf({ path: filePath, printBackground: true, width: '210mm', height: '297mm', margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' } });
    await browser.close();
    return { filePath, fileName };
  } catch (err) {
    if (browser && launched) try { await browser.close(); } catch (e) {}
    throw err;
  }
}

module.exports = { generateSaleInvoicePdf };
