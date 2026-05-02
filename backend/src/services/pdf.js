const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const reshaper = require('arabic-persian-reshaper');
const bidiFactory = require('bidi-js');

const bidi = bidiFactory();

// Prefer Bahij Nazanin (if present) for Pashto, then packaged Noto, then Amiri.
const BAHIJ_FONT_1 = path.join(__dirname, '..', '..', 'fonts', 'BahijNazanin.ttf');
const BAHIJ_FONT_2 = path.join(__dirname, '..', '..', 'fonts', 'Bahij-Nazanin.ttf');
const BAHIJ_FONT_3 = path.join(__dirname, '..', '..', 'fonts', 'BNazanin.ttf');
const BAHIJ_BOLD_CAND = path.join(__dirname, '..', '..', 'fonts', 'BahijNazanin-Bold.ttf');
const AMIRI_FONT = path.join(__dirname, '..', '..', 'fonts', 'Amiri-Regular.ttf');
const NOTO_NASKH_REGULAR = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '@fontsource',
  'noto-naskh-arabic',
  'files',
  'noto-naskh-arabic-arabic-400-normal.woff'
);
const NOTO_NASKH_BOLD = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '@fontsource',
  'noto-naskh-arabic',
  'files',
  'noto-naskh-arabic-arabic-700-normal.woff'
);

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const firstExistingPath = (candidates) => candidates.find((candidate) => fs.existsSync(candidate)) || null;

// --- Page Constants ---
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 20;
const CW = PAGE_W - 2 * M;

const COLORS = {
  primary: '#0d1b2a',
  accent: '#1b4965',
  gold: '#c8963e',
  lightGold: '#f5e6c8',
  lightBlue: '#e8f0fe',
  lightGreen: '#e6f4ea',
  darkText: '#1a1a2e',
  grayText: '#5a5a7a',
  lightGray: '#f0f0f5',
  border: '#c0c0d0',
  white: '#ffffff',
  red: '#b71c1c',
  headerBg: '#0d1b2a',
  exchangeAccent: '#1565c0',
  containerAccent: '#e65100',
  licensedAccent: '#2e7d32',
};

// ================================================================
//  SHARED DRAWING UTILITY
// ================================================================

// Choose the Pashto font: prefer Bahij Nazanin files (several common names), then Noto, then Amiri.
var PASHTO_FONT_REGULAR = firstExistingPath([BAHIJ_FONT_1, BAHIJ_FONT_2, BAHIJ_FONT_3, NOTO_NASKH_REGULAR, AMIRI_FONT]);
var PASHTO_FONT_BOLD = firstExistingPath([BAHIJ_BOLD_CAND, NOTO_NASKH_BOLD, BAHIJ_FONT_1, BAHIJ_FONT_2, BAHIJ_FONT_3, AMIRI_FONT, PASHTO_FONT_REGULAR]);

// Informative logging to help the developer place the font file if missing
if (PASHTO_FONT_REGULAR && [BAHIJ_FONT_1, BAHIJ_FONT_2, BAHIJ_FONT_3].includes(PASHTO_FONT_REGULAR)) {
  console.info(`[pdf] Using Bahij Nazanin font for Pashto: ${PASHTO_FONT_REGULAR}`);
} else {
  console.info('[pdf] Bahij Nazanin not found — using fallback Pashto font.');
  console.info('[pdf] To use Bahij Nazanin, download the TTF and place it at backend/fonts/BahijNazanin.ttf');
  console.info('[pdf] Source: https://fonts2u.com/bahij-nazanin.font');
}
var PASHTO_SCRIPT_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
var VEHICLE_PDF_LABELS = {
  vehicleId: 'Vehicle ID',
  category: 'Category',
  manufacturer: 'Manufacturer',
  model: 'Model',
  year: 'Year',
  color: 'Color',
  chassis: 'Chassis / VIN',
  engineNumber: 'Engine Number',
  engineType: 'Engine Type',
  fuelType: 'Fuel Type',
  transmission: 'Transmission',
  mileage: 'Mileage',
  plateNo: 'Plate No.',
  vehicleLicense: 'Vehicle License',
  steering: 'Steering',
  monolithicCut: 'Monolithic / Cut',
  status: 'Status',
  sellingPrice: 'Selling Price (AFN)',
};

function containsPashtoScript(value) {
  return PASHTO_SCRIPT_REGEX.test(String(value || ''));
}

function toPashtoDigits(value) {
  if (value === undefined || value === null || value === '') {
    return '—';
  }

  return new Intl.NumberFormat('fa-AF').format(Number(value));
}

function toPashtoMoney(value) {
  return `${toPashtoDigits(value)} افغانۍ`;
}

function toPashtoDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('fa-AF');
}

function reshapePashtoText(value) {
  var text = String(value || '').trim();
  if (!text) {
    return text;
  }

  var reshaped = reshaper.PersianShaper.convertArabic(text);
  var levels = bidi.getEmbeddingLevels(reshaped, 'rtl');
  return bidi.getReorderedString(reshaped, levels);
}

function applyPdfFont(doc, options) {
  var config = options || {};
  var fontSize = config.fontSize;
  var fillColor = config.fillColor;
  var bold = Boolean(config.bold);
  var pashto = Boolean(config.pashto);
  var selectedFont = pashto ? (bold ? PASHTO_FONT_BOLD : PASHTO_FONT_REGULAR) : (bold ? 'Helvetica-Bold' : 'Helvetica');

  try {
    doc.font(selectedFont || (bold ? 'Helvetica-Bold' : 'Helvetica'));
  } catch (error) {
    if (pashto) {
      console.warn(`[pdf] Failed to load Pashto font: ${error.message}`);
      PASHTO_FONT_REGULAR = null;
      PASHTO_FONT_BOLD = null;
    }
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
  }

  if (fontSize !== undefined) {
    doc.fontSize(fontSize);
  }
  if (fillColor) {
    doc.fillColor(fillColor);
  }
}

function drawPashtoText(doc, text, x, y, options) {
  var textOptions = { ...(options || {}) };
  var fontSize = textOptions.fontSize;
  var fillColor = textOptions.fillColor;
  var bold = textOptions.bold;
  delete textOptions.fontSize;
  delete textOptions.fillColor;
  delete textOptions.bold;
  delete textOptions.rtl;

  applyPdfFont(doc, { pashto: true, bold: bold, fontSize: fontSize, fillColor: fillColor });
  return doc.text(reshapePashtoText(text), x, y, textOptions);
}

function drawValueText(doc, text, x, y, options) {
  var value = text === undefined || text === null || text === '' ? '—' : String(text);
  var textOptions = { ...(options || {}) };
  var fontSize = textOptions.fontSize;
  var fillColor = textOptions.fillColor;
  var bold = textOptions.bold;
  delete textOptions.fontSize;
  delete textOptions.fillColor;
  delete textOptions.bold;
  delete textOptions.rtl;

  var usePashtoFont = containsPashtoScript(value);
  applyPdfFont(doc, { pashto: usePashtoFont, bold: bold, fontSize: fontSize, fillColor: fillColor });
  return doc.text(usePashtoFont ? reshapePashtoText(value) : value, x, y, textOptions);
}

function drawCarSilhouette(doc, x, y, w, h, color) {
  doc.save();
  var sc = Math.min(w / 120, h / 50);
  doc.translate(x + w / 2 - 60 * sc, y + h / 2 - 20 * sc).scale(sc);
  doc.path('M10,35 L15,35 L20,20 L45,12 L90,12 L105,20 L115,35 L120,35 L120,42 L110,42 L108,38 L102,38 L100,42 L30,42 L28,38 L22,38 L20,42 L0,42 L0,35 Z').fill(color);
  doc.save().opacity(0.3);
  doc.path('M48,14 L25,22 L25,30 L58,30 Z').fill('#fff');
  doc.path('M62,14 L62,30 L100,30 L100,22 Z').fill('#fff');
  doc.restore();
  doc.circle(25, 42, 7).fill('#1a1a1a'); doc.circle(25, 42, 3).fill('#444');
  doc.circle(105, 42, 7).fill('#1a1a1a'); doc.circle(105, 42, 3).fill('#444');
  doc.restore();
}


// ================================================================
//  PASHTO LABEL STRINGS
// ================================================================
var PS = {
  company:      'نیازي خپلواک',
  subtitle:     'موټر پورانچي — د موټرو شورومه',
  address:      'تیلیفون: ۰۷۰۰۰۰۸۹۸۳ | ۰۷۰۰۰۰۸۹۸۲ | کندهار بازار، پوراني سڑک، کوک ناخجا',
  billNo:       'د بل شمیره',
  date:         'نیټه',
  buyer:        'پیرودونکی',
  seller:       'پلورونکی',
  exchanger:    'تبادله کوونکی',
  soldVeh:      'پلورل شوی موټر',
  exchVeh:      'تبادله شوی موټر',
  vehSpecs:     'د موټر مشخصات',
  sellingPrice: 'د پلور قیمت',
  priceDiff:    'د قیمت توپیر',
  priceDiffBy:  'د قیمت توپیر ادا کوونکی',
  downPay:      'پیش پیسه',
  remaining:    'پاتې',
  trafficDate:  'د ټرافیک د لیږد نیټه',
  termsTitle:   'شرطونه او تعهدات',
  notesTitle:   'یادداشتونه',
  buyerSign:    'د پیرودونکي ګوته / لاسلیک',
  stamp:        'د شورومه مهر',
  sellerSign:   'د پلورونکي ګوته / لاسلیک',
  witness1:     'لومړی شاهد',
  witness2:     'دویم شاهد',
  footer:       'دا سند د نیازي خپلواک موټر پورانچي رسمي د پلور ریکارډ دی.',
  billTypes: {
    'Exchange Car':      { label: 'د تبادلې بل',             color: COLORS.exchangeAccent,  accent: '#e3f2fd' },
    'Container One Key': { label: 'کانټینري یوه کیلي بل',    color: COLORS.containerAccent, accent: '#fff3e0' },
    'Licensed Car':      { label: 'اسناد دار هفتر مکمل بل', color: COLORS.licensedAccent,  accent: '#e8f5e9' },
  },
  person: {
    fullName:   'بشپړ نوم',
    fatherName: 'د پلار نوم',
    province:   'ولایت',
    district:   'ولسوالي',
    village:    'کلی',
    address:    'پته',
    idNumber:   'د تذکرې شمیره',
    phone:      'تیلیفون',
  },
  vehicle: {
    category:     'ډول',
    color:        'رنګ',
    manufacturer: 'جوړونکی',
    model:        'ماډل',
    year:         'کال',
    engineNo:     'د انجن شمیره',
    chassis:      'چاسي',
    fuelType:     'د تیلو ډول',
    engineType:   'د انجن ډول',
    plate:        'پلیت شمیره',
    transmission: 'ګیربکس',
    steering:     'سټیرینګ',
    monolithic:   'قطعه / برشي',
    vehicleId:    'د موټر نمبر',
    mileage:      'مسافه',
    license:      'جواز',
  },
};

var BUYER_SELLER_LABELS = {
  Buyer: 'پیرودونکی',
  Seller: 'پلورونکی',
};


// ================================================================
//  PASHTO RTL DRAWING HELPERS
// ================================================================

// Header ~90px tall — fully Pashto, RTL
function drawPashtoHeader(doc, type, saleId, saleDate, meta) {
  var cfg = PS.billTypes[type] || PS.billTypes['Container One Key'];

  doc.rect(0, 0, PAGE_W, 52).fill(COLORS.headerBg);
  doc.rect(0, 52, PAGE_W, 2).fill(COLORS.gold);
  drawCarSilhouette(doc, 8, 6, 70, 30, COLORS.gold);
  drawCarSilhouette(doc, PAGE_W - 78, 6, 70, 30, COLORS.gold);

  // Optional serial number / system id (show at top-left)
  var serialNum = meta && (meta.serialNumber || meta.saleSerial || meta.systemGeneratedNo) ? String(meta.serialNumber || meta.saleSerial || meta.systemGeneratedNo) : '';
  if (serialNum) {
    drawValueText(doc, serialNum, M, 8, { width: 120, lineBreak: false, fontSize: 9, fillColor: COLORS.red, bold: true });
  }

  drawPashtoText(doc, PS.company, 80, 7, { width: PAGE_W - 160, align: 'center', lineBreak: false, fontSize: 13, fillColor: COLORS.white, bold: true });
  drawPashtoText(doc, PS.subtitle, 80, 22, { width: PAGE_W - 160, align: 'center', lineBreak: false, fontSize: 7.5, fillColor: '#ccc' });
  drawPashtoText(doc, PS.address, 60, 34, { width: PAGE_W - 120, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: COLORS.gold });

  // Bill type banner
  var by = 57;
  doc.rect(M, by, CW, 18).fill(cfg.accent);
  doc.rect(M, by, 3, 18).fill(cfg.color);
  doc.rect(M + CW - 3, by, 3, 18).fill(cfg.color);
  drawPashtoText(doc, cfg.label, M + 8, by + 4, { width: CW - 16, align: 'center', lineBreak: false, fontSize: 10, fillColor: cfg.color, bold: true });

  // Bill No & Date
  var iy = by + 22;
  drawPashtoText(doc, `${PS.date}: ${toPashtoDate(saleDate)}`,
    M, iy, { width: CW / 2 - 5, lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });
  drawPashtoText(doc, `${PS.billNo}: ${saleId}`,
    M + CW / 2, iy, { width: CW / 2, align: 'right', lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });

  // Optional traditional bill metadata: office number / book (جلد) / page (صفحه)
  var officeNo = meta && (meta.officeNumber || meta.officeNo || meta.registerNumber) ? String(meta.officeNumber || meta.officeNo || meta.registerNumber) : '';
  var bookVol = meta && (meta.bookVolume || meta.volume || meta.jild) ? String(meta.bookVolume || meta.volume || meta.jild) : '';
  var pageNum = meta && (meta.pageNumber || meta.page || meta.safha) ? String(meta.pageNumber || meta.page || meta.safha) : '';
  iy += 10;
  drawPashtoText(doc, `دفتر: ${officeNo}`, M, iy, { width: CW / 3, lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });
  drawPashtoText(doc, `جلد: ${bookVol}`, M + CW / 3, iy, { width: CW / 3, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });
  drawPashtoText(doc, `صفحه: ${pageNum}`, M + 2 * CW / 3, iy, { width: CW / 3, align: 'right', lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });

  doc.fillColor(COLORS.darkText);
  return iy + 13;
}

// Pashto section title bar 16px
function drawSectionPS(doc, y, titlePS, color) {
  doc.rect(M, y, CW, 16).fill(color || COLORS.accent);
  drawPashtoText(doc, titlePS, M + 6, y + 4, { width: CW - 12, align: 'center', lineBreak: false, fontSize: 7.5, fillColor: '#fff', bold: true });
  doc.fillColor(COLORS.darkText);
  return y + 16;
}

// Two-column person row: label right-aligned in cell, value left — RTL
function drawPersonRowPS(doc, y, labelPS, val1, val2, colW, bg) {
  var h = 14, lblW = 78;
  doc.rect(M, y, colW, h).fill(bg).stroke('#e0e0e0');
  doc.rect(M + colW + 4, y, colW, h).fill(bg).stroke('#e0e0e0');

  drawPashtoText(doc, labelPS, M + colW - lblW - 3, y + 3, { width: lblW, align: 'right', lineBreak: false, fontSize: 5.5, fillColor: COLORS.grayText });
  drawValueText(doc, val1, M + 3, y + 3, { width: colW - lblW - 8, lineBreak: false, fontSize: 6.5, fillColor: COLORS.darkText });

  // RIGHT cell
  var rx = M + colW + 4;
  drawPashtoText(doc, labelPS, rx + colW - lblW - 3, y + 3, { width: lblW, align: 'right', lineBreak: false, fontSize: 5.5, fillColor: COLORS.grayText });
  drawValueText(doc, val2, rx + 3, y + 3, { width: colW - lblW - 8, lineBreak: false, fontSize: 6.5, fillColor: COLORS.darkText });

  return y + h;
}

// Two-column spec row — RTL
function drawSpecRowPS(doc, y, labelL, valL, labelR, valR, colW, bg) {
  var h = 13, lblW = 78;
  doc.rect(M, y, colW, h).fill(bg).stroke('#e0e0e0');
  doc.rect(M + colW + 4, y, colW, h).fill(bg).stroke('#e0e0e0');

  drawPashtoText(doc, labelL, M + colW - lblW - 3, y + 3, { width: lblW, align: 'right', lineBreak: false, fontSize: 5.5, fillColor: COLORS.grayText });
  drawValueText(doc, valL, M + 3, y + 3, { width: colW - lblW - 8, lineBreak: false, fontSize: 6.5, fillColor: COLORS.darkText });

  // RIGHT cell
  var rx = M + colW + 4;
  drawPashtoText(doc, labelR, rx + colW - lblW - 3, y + 3, { width: lblW, align: 'right', lineBreak: false, fontSize: 5.5, fillColor: COLORS.grayText });
  drawValueText(doc, valR, rx + 3, y + 3, { width: colW - lblW - 8, lineBreak: false, fontSize: 6.5, fillColor: COLORS.darkText });

  return y + h;
}

// Price badge — Pashto label right, amount in AFN left
function drawPricePS(doc, y, labelPS, amount) {
  var h = 22;
  doc.roundedRect(M, y, CW, h, 3).fill(COLORS.lightGold).stroke(COLORS.gold);
  doc.rect(M, y, 4, h).fill(COLORS.gold);
  drawPashtoText(doc, toPashtoMoney(amount), M + 8, y + 4, { width: CW / 2, lineBreak: false, fontSize: 11, fillColor: COLORS.primary, bold: true });
  drawPashtoText(doc, labelPS, M + CW / 2, y + 7, { width: CW / 2 - 14, align: 'right', lineBreak: false, fontSize: 7, fillColor: COLORS.grayText });
  return y + h + 4;
}

// Terms section — Pashto RTL
function drawTermsPS(doc, y, terms, color) {
  y = drawSectionPS(doc, y, PS.termsTitle, color);
  for (var i = 0; i < terms.length; i++) {
    doc.rect(M, y, CW, 9).fill(i % 2 === 0 ? '#fafafa' : '#fff').stroke('#eee');
    drawPashtoText(doc, terms[i], M + 5, y + 1.5, { width: CW - 10, align: 'right', lineBreak: false, fontSize: 5.5, fillColor: COLORS.darkText });
    y += 9;
  }
  return y + 2;
}

// Notes — Pashto RTL
function drawNotesPS(doc, y, note1, note2) {
  if (!note1) return y;
  drawPashtoText(doc, PS.notesTitle, M, y, { width: CW, align: 'right', lineBreak: false, fontSize: 6, fillColor: COLORS.grayText });
  y += 9;
  if (note1) {
    drawValueText(doc, note1, M + 4, y, { width: CW - 8, align: 'right', lineBreak: false, fontSize: 6, fillColor: COLORS.darkText });
    y += 9;
  }
  return y + 2;
}

// Signature boxes — RTL order: seller | stamp | buyer (left→right visually)
function drawSignaturesPS(doc, y, witness1, witness2) {
  doc.save();
  doc.moveTo(M, y).lineTo(M + CW, y).dash(2, { space: 2 }).stroke(COLORS.border);
  doc.restore();
  y += 6;

  var colW3 = CW / 3;
  var sigs = [
    { x: M,               label: PS.sellerSign },
    { x: M + colW3,       label: PS.stamp },
    { x: M + 2 * colW3,   label: PS.buyerSign },
  ];

  for (var s = 0; s < sigs.length; s++) {
    doc.roundedRect(sigs[s].x + 3, y, colW3 - 6, 30, 2).stroke(COLORS.border);
    drawPashtoText(doc, sigs[s].label, sigs[s].x + 5, y + 22, { width: colW3 - 10, align: 'center', lineBreak: false, fontSize: 5.5, fillColor: COLORS.grayText });
  }
  y += 34;
  if (witness1) {
    drawPashtoText(doc, `${PS.witness1}:`, M + CW - 120, y, { width: 120, align: 'right', lineBreak: false, fontSize: 6, fillColor: COLORS.darkText });
    drawValueText(doc, witness1, M, y, { width: CW - 126, align: 'right', lineBreak: false, fontSize: 6, fillColor: COLORS.darkText });
    y += 10;
  }
  if (witness2) {
    drawPashtoText(doc, `${PS.witness2}:`, M + CW - 120, y, { width: 120, align: 'right', lineBreak: false, fontSize: 6, fillColor: COLORS.darkText });
    drawValueText(doc, witness2, M, y, { width: CW - 126, align: 'right', lineBreak: false, fontSize: 6, fillColor: COLORS.darkText });
    y += 10;
  }
  return y;
}

// Footer — Pashto
function drawFooterPS(doc) {
  doc.rect(0, PAGE_H - 20, PAGE_W, 20).fill(COLORS.headerBg);
  doc.rect(0, PAGE_H - 22, PAGE_W, 2).fill(COLORS.gold);
  drawPashtoText(doc, PS.footer, M, PAGE_H - 14, { width: CW, align: 'center', lineBreak: false, fontSize: 5.5, fillColor: '#aaa' });
}


// ================================================================
//  1. EXCHANGE CAR BILL — د تبادلې بل
// ================================================================
function generateExchangeCarPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'exchange_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margins: { top: M, bottom: 0, left: M, right: M } });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawPashtoHeader(doc, 'Exchange Car', sale.saleId, sale.saleDate, { officeNumber: sale.officeNumber, bookVolume: sale.bookVolume, pageNumber: sale.pageNumber, serialNumber: sale.serialNumber });
    var colW = (CW - 4) / 2;

    // Column headers: LEFT = پیرودونکی, RIGHT = تبادله کوونکی
    doc.rect(M, y, colW, 14).fill(COLORS.exchangeAccent);
    doc.rect(M + colW + 4, y, colW, 14).fill('#5d4037');
    drawPashtoText(doc, PS.buyer, M, y + 4, { width: colW, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: '#fff', bold: true });
    drawPashtoText(doc, PS.exchanger, M + colW + 4, y + 4, { width: colW, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: '#fff', bold: true });
    y += 14;

    var pLabels = [
      PS.person.fullName, PS.person.fatherName, PS.person.province,
      PS.person.district, PS.person.village, PS.person.address,
      PS.person.idNumber, PS.person.phone,
    ];
    var buyerVals  = [
      sale.buyerName || customer && customer.fullName,
      sale.buyerFatherName || customer && customer.fatherName,
      sale.buyerProvince || customer && customer.province,
      sale.buyerDistrict || customer && customer.district,
      sale.buyerVillage || customer && customer.village,
      sale.buyerAddress || customer && customer.currentAddress,
      sale.buyerIdNumber || customer && customer.nationalIdNumber,
      sale.buyerPhone || customer && customer.phoneNumber,
    ];
    var sellerVals = [sale.sellerName, sale.sellerFatherName, sale.sellerProvince, sale.sellerDistrict, sale.sellerVillage, sale.sellerAddress, sale.sellerIdNumber, sale.sellerPhone];
    for (var i = 0; i < pLabels.length; i++) {
      y = drawPersonRowPS(doc, y, pLabels[i], buyerVals[i], sellerVals[i], colW,
        i % 2 === 0 ? COLORS.lightGray : '#fff');
    }
    y += 4;

    // Column headers: LEFT = پلورل شوی موټر, RIGHT = تبادله شوی موټر
    doc.rect(M, y, colW, 14).fill('#37474f');
    doc.rect(M + colW + 4, y, colW, 14).fill(COLORS.exchangeAccent);
    drawPashtoText(doc, PS.soldVeh, M, y + 4, { width: colW, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: '#fff', bold: true });
    drawPashtoText(doc, PS.exchVeh, M + colW + 4, y + 4, { width: colW, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: '#fff', bold: true });
    y += 14;

    var vLabels = [
      PS.vehicle.manufacturer, PS.vehicle.model, PS.vehicle.year, PS.vehicle.category,
      PS.vehicle.color, PS.vehicle.chassis, PS.vehicle.engineNo, PS.vehicle.fuelType,
      PS.vehicle.plate, PS.vehicle.transmission, PS.vehicle.steering, PS.vehicle.monolithic,
    ];
    var soldVals = [vehicle.manufacturer, vehicle.model, vehicle.year, vehicle.category, vehicle.color, vehicle.chassisNumber, vehicle.engineNumber, vehicle.fuelType, vehicle.plateNo, vehicle.transmission, vehicle.steering, vehicle.monolithicCut];
    var exchVals = [sale.exchVehicleManufacturer, sale.exchVehicleModel, sale.exchVehicleYear, sale.exchVehicleCategory, sale.exchVehicleColor, sale.exchVehicleChassis, sale.exchVehicleEngine, sale.exchVehicleFuelType, sale.exchVehiclePlateNo, sale.exchVehicleTransmission, sale.exchVehicleSteering, sale.exchVehicleMonolithicCut];
    for (var j = 0; j < vLabels.length; j++) {
      y = drawPersonRowPS(doc, y, vLabels[j], soldVals[j], exchVals[j], colW,
        j % 2 === 0 ? COLORS.lightBlue : '#fff');
    }
    y += 5;

    y = drawPricePS(doc, y, PS.sellingPrice, sale.sellingPrice);
    if (Number(sale.priceDifference) > 0) {
      y = drawPricePS(doc, y, PS.priceDiff, sale.priceDifference);
      drawPashtoText(doc, `${PS.priceDiffBy}: ${BUYER_SELLER_LABELS[sale.priceDifferencePaidBy] || '—'}`,
        M + 8, y, { width: CW - 16, align: 'right', lineBreak: false, fontSize: 6, fillColor: COLORS.grayText });
      y += 10;
    }

    var terms = [
      'دواړه موټرونه تبادله شوي — له نن ورځ نه بیا د ټرافيک مسؤلیت نوي مالک سره دی.',
      'تبادله د دواړو خواوو د رضایت او موافقت سره ترسره شوه.',
      'موټرونه له بشپړ معاینې وروسته تسلیم شوي — دواړه خواوې له حالت نه راضي دي.',
      'دواړه خواوې باید له یو بل نه ضمانت واخلي، شورومه هیڅ مسؤلیت نه لري.',
      'کمیسیون: له پیرودونکي ۲٪، له پلورونکي ۱٪. د بیت المال موټرو پیرود/پلور منع دی.',
    ];
    y = drawTermsPS(doc, y, terms, COLORS.exchangeAccent);
    y = drawNotesPS(doc, y, sale.notes, null);
    y = drawSignaturesPS(doc, y, sale.witnessName1, sale.witnessName2);
    drawFooterPS(doc);

    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
}


// ================================================================
//  2. CONTAINER ONE KEY BILL — کانټینري یوه کیلي بل
// ================================================================
function generateContainerOneKeyPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'container_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margins: { top: M, bottom: 0, left: M, right: M } });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawPashtoHeader(doc, 'Container One Key', sale.saleId, sale.saleDate, { officeNumber: sale.officeNumber, bookVolume: sale.bookVolume, pageNumber: sale.pageNumber, serialNumber: sale.serialNumber });
    var colW = (CW - 4) / 2;

    doc.rect(M, y, colW, 14).fill(COLORS.containerAccent);
    doc.rect(M + colW + 4, y, colW, 14).fill('#795548');
    drawPashtoText(doc, PS.buyer, M, y + 4, { width: colW, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: '#fff', bold: true });
    drawPashtoText(doc, PS.seller, M + colW + 4, y + 4, { width: colW, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: '#fff', bold: true });
    y += 14;

    var pLabels = [
      PS.person.fullName, PS.person.fatherName, PS.person.province,
      PS.person.district, PS.person.village, PS.person.address,
      PS.person.idNumber, PS.person.phone,
    ];
    var buyerVals  = [
      sale.buyerName || customer && customer.fullName,
      sale.buyerFatherName || customer && customer.fatherName,
      sale.buyerProvince || customer && customer.province,
      sale.buyerDistrict || customer && customer.district,
      sale.buyerVillage || customer && customer.village,
      sale.buyerAddress || customer && customer.currentAddress,
      sale.buyerIdNumber || customer && customer.nationalIdNumber,
      sale.buyerPhone || customer && customer.phoneNumber,
    ];
    var sellerVals = [sale.sellerName, sale.sellerFatherName, sale.sellerProvince, sale.sellerDistrict, sale.sellerVillage, sale.sellerAddress, sale.sellerIdNumber, sale.sellerPhone];
    for (var i = 0; i < pLabels.length; i++) {
      y = drawPersonRowPS(doc, y, pLabels[i], buyerVals[i], sellerVals[i], colW,
        i % 2 === 0 ? COLORS.lightGray : '#fff');
    }
    y += 4;

    y = drawSectionPS(doc, y, PS.vehSpecs, '#37474f');
    var vehData = [
      [PS.vehicle.category,     vehicle.category,    PS.vehicle.color,        vehicle.color],
      [PS.vehicle.manufacturer, vehicle.manufacturer, PS.vehicle.model,        (vehicle.model||'') + ' (' + (vehicle.year||'') + ')'],
      [PS.vehicle.engineNo,     vehicle.engineNumber, PS.vehicle.chassis,      vehicle.chassisNumber],
      [PS.vehicle.fuelType,     vehicle.fuelType,     PS.vehicle.engineType,   vehicle.engineType],
      [PS.vehicle.plate,        vehicle.plateNo,      PS.vehicle.transmission, vehicle.transmission],
      [PS.vehicle.steering,     vehicle.steering,     PS.vehicle.monolithic,   vehicle.monolithicCut],
      [PS.vehicle.vehicleId,    vehicle.vehicleId,    PS.vehicle.mileage,      vehicle.mileage ? (vehicle.mileage + ' km') : '\u2014'],
    ];
    for (var v = 0; v < vehData.length; v++) {
      y = drawSpecRowPS(doc, y, vehData[v][0], vehData[v][1], vehData[v][2], vehData[v][3], colW,
        v % 2 === 0 ? COLORS.lightBlue : '#fff');
    }
    y += 5;

    y = drawPricePS(doc, y, PS.sellingPrice, sale.sellingPrice);
    if (Number(sale.downPayment) > 0) {
      drawPashtoText(doc, `${PS.downPay}: ${toPashtoMoney(sale.downPayment)}`,
        M, y, { width: CW / 2 - 5, lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });
      drawPashtoText(doc, `${PS.remaining}: ${toPashtoMoney(sale.remainingAmount || 0)}`,
        M + CW / 2, y, { width: CW / 2, align: 'right', lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });
      y += 11;
    }

    var priceStr   = toPashtoDigits(sale.sellingPrice || 0);
    var saleDateStr = toPashtoDate(sale.saleDate);
    var terms = [
      'د موټر قیمت (' + priceStr + ') افغانۍ دی لکه چې پورتنۍ ته ښودل شوی.',
      'د ټرافيک مسؤلیت له (' + saleDateStr + ') نه بیا د پیرودونکي سره دی.',
      'موټر هیڅ قانوني اسناد نه لري — یوازې یوه کیلي. موټر بشپړ وپیژندل شو او تاییده شو.',
      'د غلا مسؤلیت پیرودونکي سره دی، پلورونکی هیڅ حق شکایت نه لري.',
      'پیرودونکی او پلورونکی باید له یو بل نه ضمانت واخلي، شورومه هیڅ ضمانت نه ورکوي.',
      'شورومه یوازې شاهد دی. کمیسیون: ۲٪ پیرودونکی، ۱٪ پلورونکی.',
    ];
    y = drawTermsPS(doc, y, terms, COLORS.containerAccent);
    y = drawNotesPS(doc, y, sale.notes, null);
    y = drawSignaturesPS(doc, y, sale.witnessName1, sale.witnessName2);
    drawFooterPS(doc);

    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
}


// ================================================================
//  3. LICENSED CAR BILL — اسناد دار هفتر مکمل بل
// ================================================================
function generateLicensedCarPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'licensed_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margins: { top: M, bottom: 0, left: M, right: M } });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawPashtoHeader(doc, 'Licensed Car', sale.saleId, sale.saleDate, { officeNumber: sale.officeNumber, bookVolume: sale.bookVolume, pageNumber: sale.pageNumber, serialNumber: sale.serialNumber });
    var colW = (CW - 4) / 2;

    doc.rect(M, y, colW, 14).fill(COLORS.licensedAccent);
    doc.rect(M + colW + 4, y, colW, 14).fill('#4e342e');
    drawPashtoText(doc, PS.buyer, M, y + 4, { width: colW, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: '#fff', bold: true });
    drawPashtoText(doc, PS.seller, M + colW + 4, y + 4, { width: colW, align: 'center', lineBreak: false, fontSize: 6.5, fillColor: '#fff', bold: true });
    y += 14;

    var pLabels = [
      PS.person.fullName, PS.person.fatherName, PS.person.province,
      PS.person.district, PS.person.village, PS.person.address,
      PS.person.idNumber, PS.person.phone,
    ];
    var buyerVals  = [
      sale.buyerName || customer && customer.fullName,
      sale.buyerFatherName || customer && customer.fatherName,
      sale.buyerProvince || customer && customer.province,
      sale.buyerDistrict || customer && customer.district,
      sale.buyerVillage || customer && customer.village,
      sale.buyerAddress || customer && customer.currentAddress,
      sale.buyerIdNumber || customer && customer.nationalIdNumber,
      sale.buyerPhone || customer && customer.phoneNumber,
    ];
    var sellerVals = [sale.sellerName, sale.sellerFatherName, sale.sellerProvince, sale.sellerDistrict, sale.sellerVillage, sale.sellerAddress, sale.sellerIdNumber, sale.sellerPhone];
    for (var i = 0; i < pLabels.length; i++) {
      y = drawPersonRowPS(doc, y, pLabels[i], buyerVals[i], sellerVals[i], colW,
        i % 2 === 0 ? COLORS.lightGreen : '#fff');
    }
    y += 4;

    y = drawSectionPS(doc, y, PS.vehSpecs, '#37474f');
    var vehData = [
      [PS.vehicle.category,     vehicle.category,    PS.vehicle.color,        vehicle.color],
      [PS.vehicle.manufacturer, vehicle.manufacturer, PS.vehicle.model,        (vehicle.model||'') + ' (' + (vehicle.year||'') + ')'],
      [PS.vehicle.engineNo,     vehicle.engineNumber, PS.vehicle.chassis,      vehicle.chassisNumber],
      [PS.vehicle.fuelType,     vehicle.fuelType,     PS.vehicle.engineType,   vehicle.engineType],
      [PS.vehicle.plate,        vehicle.plateNo,      PS.vehicle.transmission, vehicle.transmission],
      [PS.vehicle.steering,     vehicle.steering,     PS.vehicle.monolithic,   vehicle.monolithicCut],
      [PS.vehicle.license,      vehicle.vehicleLicense || vehicle.vehicleId, PS.vehicle.mileage, vehicle.mileage ? (vehicle.mileage + ' km') : '\u2014'],
    ];
    for (var v = 0; v < vehData.length; v++) {
      y = drawSpecRowPS(doc, y, vehData[v][0], vehData[v][1], vehData[v][2], vehData[v][3], colW,
        v % 2 === 0 ? COLORS.lightGreen : '#fff');
    }
    y += 5;

    y = drawPricePS(doc, y, PS.sellingPrice, sale.sellingPrice);

    if (sale.trafficTransferDate) {
      doc.roundedRect(M, y, CW, 15, 2).fill('#e8f5e9').stroke(COLORS.licensedAccent);
      drawPashtoText(doc, `${PS.trafficDate}: ${toPashtoDate(sale.trafficTransferDate)}`,
        M + 8, y + 4, { width: CW - 16, align: 'right', lineBreak: false, fontSize: 6.5, fillColor: COLORS.licensedAccent, bold: true });
      y += 19;
    }

    if (Number(sale.downPayment) > 0) {
      drawPashtoText(doc, `${PS.downPay}: ${toPashtoMoney(sale.downPayment)}`,
        M, y, { width: CW / 2 - 5, lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });
      drawPashtoText(doc, `${PS.remaining}: ${toPashtoMoney(sale.remainingAmount || 0)}`,
        M + CW / 2, y, { width: CW / 2, align: 'right', lineBreak: false, fontSize: 6.5, fillColor: COLORS.grayText });
      y += 11;
    }

    var priceStr       = toPashtoDigits(sale.sellingPrice || 0);
    var transferDateStr = sale.trafficTransferDate ? toPashtoDate(sale.trafficTransferDate) : '___';
    var saleDateStr     = toPashtoDate(sale.saleDate);
    var terms = [
      'د موټر قیمت (' + priceStr + ') افغانۍ دی.',
      'د ټرافيک مسؤلیت تر (' + transferDateStr + ') پورې پلورونکي سره دی، له (' + saleDateStr + ') وروسته پیرودونکي سره دی.',
      'موټر بشپړ قانوني اسناد او سند لري. بشپړ وپیژندل شو او تاییده شو.',
      'د غلا مسؤلیت پیرودونکي سره دی، پلورونکی هیڅ حق شکایت نه لري.',
      'پیرودونکی او پلورونکی باید له یو بل نه ضمانت واخلي.',
      'شورومه یوازې شاهد دی. کمیسیون: ۲٪ پیرودونکی، ۱٪ پلورونکی.',
    ];
    y = drawTermsPS(doc, y, terms, COLORS.licensedAccent);
    y = drawNotesPS(doc, y, sale.notes, null);
    y = drawSignaturesPS(doc, y, sale.witnessName1, sale.witnessName2);
    drawFooterPS(doc);

    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
}


// ================================================================
//  Main dispatcher
// ================================================================
var generateSaleInvoicePdf = function(sale, vehicle, customer, outputDir) {
  var saleType = sale.saleType || 'Container One Key';
  switch (saleType) {
    case 'Exchange Car':
      return generateExchangeCarPdf(sale, vehicle, customer, outputDir);
    case 'Licensed Car':
      return generateLicensedCarPdf(sale, vehicle, customer, outputDir);
    case 'Container One Key':
    default:
      return generateContainerOneKeyPdf(sale, vehicle, customer, outputDir);
  }
};


// ================================================================
//  Financial Report PDF
// ================================================================
var generateFinancialReportPdf = function(reportData, outputDir) {
  ensureDir(outputDir);
  var timestamp = Date.now();
  var fileName = 'financial_report_' + timestamp + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margin: 40 });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.rect(0, 0, PAGE_W, 60).fill(COLORS.headerBg);
    doc.rect(0, 60, PAGE_W, 3).fill(COLORS.gold);
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#fff')
      .text('NIAZI KHPALWAK  -  Financial Report', 40, 15, { width: PAGE_W - 80, align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.gold)
      .text('Generated: ' + new Date().toLocaleString(), 40, 38, { width: PAGE_W - 80, align: 'center' });

    var y = 80;
    doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.accent).text('Financial Summary', 40, y);
    y += 22;
    doc.fillColor(COLORS.darkText);

    var summaryItems = [
      ['Total Revenue', 'AFN ' + (reportData.revenue || 0).toLocaleString()],
      ['Total Expenses', 'AFN ' + (reportData.expenses || 0).toLocaleString()],
      ['Net Profit', 'AFN ' + (reportData.profit || 0).toLocaleString()],
      ['Vehicles Sold', String(reportData.vehiclesSold || 0)],
      ['Total Commission', 'AFN ' + (reportData.commission || 0).toLocaleString()]
    ];
    for (var si = 0; si < summaryItems.length; si++) {
      doc.fontSize(11).text(summaryItems[si][0] + ': ' + summaryItems[si][1], 40, y);
      y += 16;
    }
    y += 10;

    doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.accent).text('Balance Breakdown', 40, y);
    y += 22;
    doc.fillColor(COLORS.darkText);
    var balanceItems = [
      ['Showroom Balance', 'AFN ' + (reportData.showroomBalance || 0).toLocaleString()],
      ['Owner Share', 'AFN ' + (reportData.ownerBalance || 0).toLocaleString()],
      ['Shared Persons Total', 'AFN ' + (reportData.sharedTotal || 0).toLocaleString()]
    ];
    for (var bi = 0; bi < balanceItems.length; bi++) {
      doc.fontSize(11).text(balanceItems[bi][0] + ': ' + balanceItems[bi][1], 40, y);
      y += 16;
    }

    if (reportData.sharedPersons && reportData.sharedPersons.length > 0) {
      y += 10;
      doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.accent).text('Shared Persons Breakdown', 40, y);
      y += 22;
      doc.fillColor(COLORS.darkText);
      for (var pi = 0; pi < reportData.sharedPersons.length; pi++) {
        var person = reportData.sharedPersons[pi];
        doc.fontSize(11).text((person.personName || 'Unknown') + ': AFN ' + Number(person.total || 0).toLocaleString(), 40, y);
        y += 16;
      }
    }

    doc.rect(0, PAGE_H - 25, PAGE_W, 25).fill(COLORS.headerBg);
    doc.font('Helvetica').fontSize(7).fillColor('#aaa')
      .text('Niazi Khpalwak Motor Puranchi  -  Automatic Financial Report', 40, PAGE_H - 18, { width: PAGE_W - 80, align: 'center' });

    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
};


// ================================================================
//  Vehicle PDF
// ================================================================
var generateVehiclePdf = function(vehicle, outputDir) {
  ensureDir(outputDir);
  var fileName = 'vehicle_' + vehicle.vehicleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margins: { top: 24, bottom: 0, left: 24, right: 24 } });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.rect(0, 0, PAGE_W, 58).fill(COLORS.headerBg);
    doc.rect(0, 58, PAGE_W, 2).fill(COLORS.gold);
    drawCarSilhouette(doc, PAGE_W / 2 - 45, 6, 90, 34, COLORS.gold);
    doc.font('Helvetica-Bold').fontSize(15).fillColor('#fff')
      .text('Vehicle Information Card', 24, 36, { width: PAGE_W - 48, align: 'center', lineBreak: false });

    var rows = [
      [VEHICLE_PDF_LABELS.vehicleId, vehicle.vehicleId],
      [VEHICLE_PDF_LABELS.category, vehicle.category],
      [VEHICLE_PDF_LABELS.manufacturer, vehicle.manufacturer],
      [VEHICLE_PDF_LABELS.model, vehicle.model],
      [VEHICLE_PDF_LABELS.year, vehicle.year],
      [VEHICLE_PDF_LABELS.color, vehicle.color],
      [VEHICLE_PDF_LABELS.chassis, vehicle.chassisNumber],
      [VEHICLE_PDF_LABELS.engineNumber, vehicle.engineNumber],
      [VEHICLE_PDF_LABELS.engineType, vehicle.engineType],
      [VEHICLE_PDF_LABELS.fuelType, vehicle.fuelType],
      [VEHICLE_PDF_LABELS.transmission, vehicle.transmission],
      [VEHICLE_PDF_LABELS.mileage, vehicle.mileage != null ? `${vehicle.mileage}` : '—'],
      [VEHICLE_PDF_LABELS.plateNo, vehicle.plateNo],
      [VEHICLE_PDF_LABELS.vehicleLicense, vehicle.vehicleLicense],
      [VEHICLE_PDF_LABELS.steering, vehicle.steering],
      [VEHICLE_PDF_LABELS.monolithicCut, vehicle.monolithicCut],
      [VEHICLE_PDF_LABELS.status, vehicle.status],
      [VEHICLE_PDF_LABELS.sellingPrice, vehicle.sellingPrice],
    ];

    var columnGap = 12;
    var columnWidth = (PAGE_W - 48 - columnGap) / 2;
    var columnStartY = 82;
    var rowHeight = 18;
    var labelWidth = 86;
    var leftColumnCount = Math.ceil(rows.length / 2);
    var columns = [rows.slice(0, leftColumnCount), rows.slice(leftColumnCount)];

    for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      var columnRows = columns[columnIndex];
      var x = 24 + columnIndex * (columnWidth + columnGap);
      var y = columnStartY;

      for (var ri = 0; ri < columnRows.length; ri++) {
        var row = columnRows[ri];
        var rowBackground = ri % 2 === 0 ? COLORS.lightGray : '#fff';
        doc.roundedRect(x, y, columnWidth, rowHeight, 2).fill(rowBackground).stroke('#d7deea');
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.grayText)
          .text(row[0], x + 8, y + 5, { width: labelWidth, lineBreak: false });
        doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.darkText)
          .text(String(row[1] != null && row[1] !== '' ? row[1] : '—'), x + labelWidth + 14, y + 5, { width: columnWidth - labelWidth - 22, lineBreak: false });
        y += rowHeight + 4;
      }
    }

    doc.rect(0, PAGE_H - 28, PAGE_W, 28).fill(COLORS.headerBg);
    doc.font('Helvetica').fontSize(7).fillColor('#aaa')
      .text('Niazi Khpalwak Motor Puranchi - Vehicle Record', 24, PAGE_H - 18, { width: PAGE_W - 48, align: 'center', lineBreak: false });

    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
};

// Try to require the Puppeteer-based HTML->PDF generator at load time, but do
// not replace the pdfkit dispatcher outright. Instead keep a reference to the
// puppeteer generator (if available) and use a runtime wrapper that attempts
// Puppeteer first and falls back to the pdfkit implementation on any failure.
let puppeteerGen = null;
try {
  if (process.env.USE_PUPPETEER !== '0') {
    puppeteerGen = require('./pdf_puppeteer');
    if (puppeteerGen && puppeteerGen.generateSaleInvoicePdf) {
      console.info('[pdf] Puppeteer HTML->PDF generator is available and will be used when possible.');
    } else {
      puppeteerGen = null;
      console.info('[pdf] Puppeteer module loaded but missing expected export — using pdfkit fallback.');
    }
  } else {
    console.info('[pdf] USE_PUPPETEER=0 detected — skipping Puppeteer, using pdfkit fallback for sale invoices');
  }
} catch (e) {
  console.warn('[pdf] Puppeteer-based generator not available at require time, will use pdfkit fallback:', e && e.message ? e.message : e);
}

// Keep a reference to the pdfkit dispatcher defined earlier in this file.
const pdfkitGenerateSaleInvoicePdf = generateSaleInvoicePdf;

// Runtime wrapper used by other modules. Tries Puppeteer (if available) and
// falls back to the pdfkit generator if Puppeteer fails at runtime.
async function generateSaleInvoicePdfWrapper(sale, vehicle, customer, outputDir) {
  // Guard against null vehicle/customer to prevent pdfkit null-pointer errors
  const safeVehicle = vehicle || {};
  const safeCustomer = customer || {};
  if (process.env.USE_PUPPETEER !== '0' && puppeteerGen && puppeteerGen.generateSaleInvoicePdf) {
    try {
      return await puppeteerGen.generateSaleInvoicePdf(sale, safeVehicle, safeCustomer, outputDir);
    } catch (err) {
      console.error('[pdf] Puppeteer generator failed at runtime; falling back to pdfkit:', err && (err.message || err));
      // fall through to pdfkit fallback
    }
  }
  return pdfkitGenerateSaleInvoicePdf(sale, safeVehicle, safeCustomer, outputDir);
}

module.exports = {
  generateVehiclePdf: generateVehiclePdf,
  generateSaleInvoicePdf: generateSaleInvoicePdfWrapper,
  generateFinancialReportPdf: generateFinancialReportPdf
};