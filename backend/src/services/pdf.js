const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// --- Constants ---
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 28;
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

// --- Draw car silhouette as vector art ---
function drawCarSilhouette(doc, x, y, w, h, color) {
  doc.save();
  var scale = Math.min(w / 120, h / 50);
  doc.translate(x + w / 2 - 60 * scale, y + h / 2 - 20 * scale);
  doc.scale(scale);

  // Car body
  doc.path('M10,35 L15,35 L20,20 L45,12 L90,12 L105,20 L115,35 L120,35 L120,42 L110,42 L108,38 L102,38 L100,42 L30,42 L28,38 L22,38 L20,42 L0,42 L0,35 Z')
    .fill(color);

  // Windows
  doc.save();
  doc.opacity(0.3);
  doc.path('M48,14 L25,22 L25,30 L58,30 Z').fill('#ffffff');
  doc.path('M62,14 L62,30 L100,30 L100,22 Z').fill('#ffffff');
  doc.restore();

  // Wheels
  doc.circle(25, 42, 8).fill('#1a1a1a');
  doc.circle(25, 42, 4).fill('#444');
  doc.circle(105, 42, 8).fill('#1a1a1a');
  doc.circle(105, 42, 4).fill('#444');

  doc.restore();
}

// --- Professional Header ---
function drawHeader(doc, type, saleId, saleDate, pageNum) {
  var typeConfig = {
    'Exchange Car': { color: COLORS.exchangeAccent, label: 'EXCHANGE CAR BILL', pashto: '\u062F \u062A\u0628\u0627\u062F\u0644\u06D0 \u0628\u0644', accent: '#e3f2fd' },
    'Container One Key': { color: COLORS.containerAccent, label: 'CONTAINER ONE KEY BILL', pashto: '\u06A9\u0627\u0646\u062A\u06CC\u0646\u0631\u064A \u06CC\u0648\u0647 \u06A9\u06CC\u0644\u064A \u0628\u0644', accent: '#fff3e0' },
    'Licensed Car': { color: COLORS.licensedAccent, label: 'LICENSED VEHICLE BILL', pashto: '\u0627\u0633\u0646\u0627\u062F \u062F\u0627\u0631 \u0647\u0641\u062A\u0631 \u0645\u06A9\u0645\u0644 \u0628\u0644', accent: '#e8f5e9' },
  };
  var cfg = typeConfig[type] || typeConfig['Container One Key'];

  // Dark header band
  doc.rect(0, 0, PAGE_W, 90).fill(COLORS.headerBg);
  // Gold accent stripe
  doc.rect(0, 90, PAGE_W, 3).fill(COLORS.gold);

  // Car silhouettes on both sides
  drawCarSilhouette(doc, 12, 15, 100, 40, COLORS.gold);
  drawCarSilhouette(doc, PAGE_W - 112, 15, 100, 40, COLORS.gold);

  // Business name
  doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.white)
    .text('NIAZI KHPALWAK', M + 90, 14, { width: CW - 180, align: 'center' });

  // Subtitle
  doc.font('Helvetica').fontSize(10).fillColor('#e0e0e0')
    .text('Motor Puranchi  -  Car Showroom & Dealership', M + 90, 37, { width: CW - 180, align: 'center' });

  // Contact info row
  doc.fontSize(8).fillColor(COLORS.gold)
    .text('Phone: 0700008983  |  0700008982  |  Kandahar Bazaar, Purani Road, Kok Nakhja', M + 40, 55, { width: CW - 80, align: 'center' });

  // Type in Pashto
  doc.fontSize(9).fillColor('#ffffff')
    .text(cfg.pashto, M + 40, 72, { width: CW - 80, align: 'center' });

  // Bill type banner
  var bannerY = 100;
  doc.rect(M, bannerY, CW, 28).fill(cfg.accent);
  doc.rect(M, bannerY, 4, 28).fill(cfg.color);
  doc.rect(M + CW - 4, bannerY, 4, 28).fill(cfg.color);

  doc.font('Helvetica-Bold').fontSize(13).fillColor(cfg.color)
    .text(cfg.label, M + 15, bannerY + 7, { width: CW - 30, align: 'center' });

  // Bill info line
  var infoY = bannerY + 34;
  doc.fontSize(8).font('Helvetica').fillColor(COLORS.grayText)
    .text('Bill No: ' + saleId, M, infoY)
    .text('Date: ' + new Date(saleDate).toLocaleDateString('en-GB'), M + CW / 3, infoY, { width: CW / 3, align: 'center' })
    .text('Page: ' + pageNum, M + 2 * CW / 3, infoY, { width: CW / 3, align: 'right' });

  doc.fillColor(COLORS.darkText);
  return infoY + 20;
}

// --- Section Title ---
function drawSectionTitle(doc, y, title, color) {
  doc.rect(M, y, CW, 22).fill(color || COLORS.accent);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#ffffff')
    .text(title, M + 10, y + 6, { width: CW - 20 });
  doc.fillColor(COLORS.darkText);
  return y + 22;
}

// --- Key-Value Row ---
function drawKVRow(doc, y, label, value) {
  var labelWidth = 130;
  var height = 18;
  doc.rect(M, y, CW, height).stroke(COLORS.border);
  doc.rect(M, y, labelWidth, height).fill('#f7f7fc').stroke(COLORS.border);

  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.grayText)
    .text(label, M + 6, y + 4.5, { width: labelWidth - 12 });

  doc.font('Helvetica').fontSize(8)
    .fillColor(COLORS.darkText)
    .text(String(value || '\u2014'), M + labelWidth + 6, y + 4.5, { width: CW - labelWidth - 12, lineBreak: false });

  doc.fillColor(COLORS.darkText);
  return y + height;
}

// --- Price Badge ---
function drawPriceBadge(doc, y, label, amount) {
  var badgeW = CW;
  var badgeH = 32;

  doc.roundedRect(M, y, badgeW, badgeH, 4).fill(COLORS.lightGold);
  doc.roundedRect(M, y, badgeW, badgeH, 4).stroke(COLORS.gold);
  doc.rect(M, y, 5, badgeH).fill(COLORS.gold);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.grayText)
    .text(label, M + 15, y + 5, { width: badgeW / 2 - 20 });

  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLORS.primary)
    .text(Number(amount || 0).toLocaleString() + ' AFN', M + badgeW / 2, y + 6, { width: badgeW / 2 - 15, align: 'right' });

  return y + badgeH + 8;
}

// --- Terms & Conditions ---
function drawTerms(doc, y, terms, color) {
  y = drawSectionTitle(doc, y, 'Terms & Conditions / Sharait aw Zamanat', color);
  y += 3;
  doc.font('Helvetica').fontSize(7);
  for (var i = 0; i < terms.length; i++) {
    var bg = i % 2 === 0 ? '#fafafa' : '#ffffff';
    doc.rect(M, y, CW, 13).fill(bg).stroke('#eee');
    doc.fillColor(COLORS.darkText)
      .text(terms[i], M + 8, y + 3, { width: CW - 16, lineBreak: false });
    y += 13;
  }
  doc.fillColor(COLORS.darkText);
  return y + 5;
}

// --- Notes Section ---
function drawNotes(doc, y, note1, note2) {
  if (!note1 && !note2) return y;
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.grayText)
    .text('Notes:', M, y);
  y += 12;
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.darkText);
  if (note1) { doc.text('1. ' + note1, M + 5, y, { width: CW - 10 }); y += 12; }
  if (note2) { doc.text('2. ' + note2, M + 5, y, { width: CW - 10 }); y += 12; }
  return y + 3;
}

// --- Signatures ---
function drawSignatures(doc, y, witness1, witness2) {
  doc.save();
  doc.moveTo(M, y).lineTo(M + CW, y).dash(2, { space: 2 }).stroke(COLORS.border);
  doc.restore();
  y += 10;

  var colW = CW / 3;
  var sigs = [
    { x: M, label: 'Buyer Thumbprint / Sign' },
    { x: M + colW, label: 'Showroom Stamp' },
    { x: M + 2 * colW, label: 'Seller Thumbprint / Sign' }
  ];
  for (var s = 0; s < sigs.length; s++) {
    doc.roundedRect(sigs[s].x + 5, y, colW - 10, 50, 3).stroke(COLORS.border);
    doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.grayText)
      .text(sigs[s].label, sigs[s].x + 8, y + 36, { width: colW - 16, align: 'center' });
  }

  y += 58;

  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.darkText);
  doc.text('Witness 1: ' + (witness1 || '________________________'), M, y, { width: CW / 2 - 10 });
  doc.text('Witness 2: ' + (witness2 || '________________________'), M + CW / 2, y, { width: CW / 2, align: 'right' });

  return y + 18;
}

// --- Footer ---
function drawFooter(doc) {
  doc.rect(0, PAGE_H - 30, PAGE_W, 30).fill(COLORS.headerBg);
  doc.rect(0, PAGE_H - 33, PAGE_W, 3).fill(COLORS.gold);
  doc.font('Helvetica').fontSize(6.5).fillColor('#aaa')
    .text('This document is an official sale record of Niazi Khpalwak Motor Puranchi.',
      M, PAGE_H - 22, { width: CW, align: 'center' });
}

// --- Side-by-side row helper ---
function drawSideBySideRow(doc, y, lbl, buyerVal, sellerVal, colW, bg) {
  var rowH = 18;
  doc.rect(M, y, colW, rowH).fill(bg).stroke('#ddd');
  doc.rect(M + colW + 8, y, colW, rowH).fill(bg).stroke('#ddd');

  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLORS.grayText)
    .text(lbl, M + 3, y + 2, { width: 62, lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.darkText)
    .text(String(buyerVal || '\u2014'), M + 66, y + 4, { width: colW - 70, lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLORS.grayText)
    .text(lbl, M + colW + 11, y + 2, { width: 62, lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.darkText)
    .text(String(sellerVal || '\u2014'), M + colW + 74, y + 4, { width: colW - 78, lineBreak: false });

  return y + rowH;
}

// --- Vehicle spec row (4 cols) ---
function drawVehicleSpecRow(doc, y, label1, val1, label2, val2, colW, bg) {
  var rowH = 18;
  doc.rect(M, y, colW, rowH).fill(bg).stroke('#ddd');
  doc.rect(M + colW + 8, y, colW, rowH).fill(bg).stroke('#ddd');

  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLORS.grayText)
    .text(label1, M + 3, y + 2, { width: 80, lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.darkText)
    .text(String(val1 || '\u2014'), M + 84, y + 4, { width: colW - 88, lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLORS.grayText)
    .text(label2, M + colW + 11, y + 2, { width: 80, lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.darkText)
    .text(String(val2 || '\u2014'), M + colW + 92, y + 4, { width: colW - 96, lineBreak: false });

  return y + rowH;
}


// =================================================================
//  1. EXCHANGE CAR BILL
// =================================================================
function generateExchangeCarPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'exchange_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawHeader(doc, 'Exchange Car', sale.saleId, sale.saleDate, sale.id);

    // Buyer Info
    y = drawSectionTitle(doc, y, '  BUYER INFORMATION / D Kharidar Maloomat', COLORS.exchangeAccent);
    var buyerFields = [
      ['Full Name / Nom', customer.fullName],
      ['Father Name / D Plar Nom', customer.fatherName],
      ['Province / Welayat', customer.province],
      ['District / Woluswali', customer.district],
      ['Village / Kali', customer.village],
      ['Address / Pata', customer.currentAddress],
      ['ID / Tazkira Number', customer.nationalIdNumber],
      ['Phone / Telephone', customer.phoneNumber]
    ];
    for (var i = 0; i < buyerFields.length; i++) {
      y = drawKVRow(doc, y, buyerFields[i][0], buyerFields[i][1]);
    }

    y += 5;

    // Sold Vehicle
    y = drawSectionTitle(doc, y, '  SOLD VEHICLE / Khartsshaway Motor', '#37474f');
    var vehFields = [
      ['Manufacturer / Sherkat', vehicle.manufacturer],
      ['Model / Model', vehicle.model],
      ['Year / Kal', vehicle.year],
      ['Category / Dawl', vehicle.category],
      ['Color / Rang', vehicle.color],
      ['Chassis / Chasi', vehicle.chassisNumber],
      ['Engine / Engine Number', vehicle.engineNumber],
      ['Fuel / Tel Dawl', vehicle.fuelType],
      ['Plate / Number Plate', vehicle.plateNo],
      ['Transmission / Gearbaks', vehicle.transmission],
      ['Steering / Steering', vehicle.steering],
      ['Monolithic/Cut / Monolet', vehicle.monolithicCut]
    ];
    for (var j = 0; j < vehFields.length; j++) {
      y = drawKVRow(doc, y, vehFields[j][0], vehFields[j][1]);
    }

    y += 5;

    // Exchanger Info
    y = drawSectionTitle(doc, y, '  EXCHANGER (SELLER) / Tabadla Koonki', '#5d4037');
    var sellerFields = [
      ['Full Name / Nom', sale.sellerName],
      ['Father Name / D Plar Nom', sale.sellerFatherName],
      ['Province / Welayat', sale.sellerProvince],
      ['District / Woluswali', sale.sellerDistrict],
      ['Village / Kali', sale.sellerVillage],
      ['Address / Pata', sale.sellerAddress],
      ['ID / Tazkira Number', sale.sellerIdNumber],
      ['Phone / Telephone', sale.sellerPhone]
    ];
    for (var k = 0; k < sellerFields.length; k++) {
      y = drawKVRow(doc, y, sellerFields[k][0], sellerFields[k][1]);
    }

    y += 5;

    // Exchange Vehicle
    y = drawSectionTitle(doc, y, '  EXCHANGE VEHICLE / Tabadla Shaway Motor', COLORS.exchangeAccent);
    var exchFields = [
      ['Manufacturer / Sherkat', sale.exchVehicleManufacturer],
      ['Model / Model', sale.exchVehicleModel],
      ['Year / Kal', sale.exchVehicleYear],
      ['Category / Dawl', sale.exchVehicleCategory],
      ['Color / Rang', sale.exchVehicleColor],
      ['Chassis / Chasi', sale.exchVehicleChassis],
      ['Engine / Engine Number', sale.exchVehicleEngine],
      ['Fuel / Tel Dawl', sale.exchVehicleFuelType],
      ['Plate / Number Plate', sale.exchVehiclePlateNo],
      ['Transmission / Gearbaks', sale.exchVehicleTransmission],
      ['Steering / Steering', sale.exchVehicleSteering],
      ['Monolithic/Cut / Monolet', sale.exchVehicleMonolithicCut]
    ];
    for (var e = 0; e < exchFields.length; e++) {
      y = drawKVRow(doc, y, exchFields[e][0], exchFields[e][1]);
    }

    y += 8;

    // Price
    y = drawPriceBadge(doc, y, 'SELLING PRICE / Qeemat', sale.sellingPrice);
    y = drawPriceBadge(doc, y, 'PRICE DIFFERENCE / D Qeemat Farq', sale.priceDifference);

    doc.font('Helvetica').fontSize(8).fillColor(COLORS.grayText)
      .text('Price difference paid by: ' + (sale.priceDifferencePaidBy || 'Buyer'), M + 10, y);
    y += 16;

    // Terms
    var terms = [
      '1: Both vehicles are exchanged with traffic responsibility from this date onward to the new owner.',
      '2: The exchange is done with mutual consent and agreement of both parties.',
      '3: Vehicles delivered after full checking - both parties satisfied with condition.',
      '4: Both parties must take warranty from each other. Showroom has no responsibility.',
      '5: Showroom commission of trade law: 2% from buyer, 1% from seller.',
      '6: Buying and selling of Bait-ul-Maal vehicles is strictly prohibited.'
    ];
    y = drawTerms(doc, y, terms, COLORS.exchangeAccent);
    y = drawNotes(doc, y, sale.notes, sale.note2);
    y = drawSignatures(doc, y, sale.witnessName1, sale.witnessName2);

    drawFooter(doc);
    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
}

// =================================================================
//  2. CONTAINER ONE KEY BILL
// =================================================================
function generateContainerOneKeyPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'container_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawHeader(doc, 'Container One Key', sale.saleId, sale.saleDate, sale.id);

    var colW = CW / 2 - 4;

    // Buyer & Seller side by side
    y = drawSectionTitle(doc, y, '  BUYER / Kharidar                                                                SELLER / Ploronki', COLORS.containerAccent);
    var labels = ['Full Name', 'Father Name', 'Province', 'District', 'Village', 'Address', 'ID Number', 'Phone'];
    var buyerVals = [customer.fullName, customer.fatherName, customer.province, customer.district, customer.village, customer.currentAddress, customer.nationalIdNumber, customer.phoneNumber];
    var sellerVals = [sale.sellerName, sale.sellerFatherName, sale.sellerProvince, sale.sellerDistrict, sale.sellerVillage, sale.sellerAddress, sale.sellerIdNumber, sale.sellerPhone];

    for (var i = 0; i < labels.length; i++) {
      var bg = i % 2 === 0 ? COLORS.lightGray : '#ffffff';
      y = drawSideBySideRow(doc, y, labels[i], buyerVals[i], sellerVals[i], colW, bg);
    }

    y += 8;

    // Vehicle Specs
    y = drawSectionTitle(doc, y, '  VEHICLE SPECIFICATIONS / D Motor Mushakhisat', '#37474f');

    var vehData = [
      ['Category', vehicle.category, 'Color', vehicle.color],
      ['Manufacturer', vehicle.manufacturer, 'Model', (vehicle.model || '') + ' (' + (vehicle.year || '') + ')'],
      ['Engine No.', vehicle.engineNumber, 'Chassis', vehicle.chassisNumber],
      ['Fuel Type', vehicle.fuelType, 'Engine Type', vehicle.engineType],
      ['Plate', vehicle.plateNo, 'Transmission', vehicle.transmission],
      ['Steering', vehicle.steering, 'Monolithic/Cut', vehicle.monolithicCut],
      ['Vehicle ID', vehicle.vehicleId, 'Mileage', vehicle.mileage ? (vehicle.mileage + ' km') : '\u2014']
    ];

    for (var v = 0; v < vehData.length; v++) {
      var vbg = v % 2 === 0 ? COLORS.lightBlue : '#ffffff';
      y = drawVehicleSpecRow(doc, y, vehData[v][0], vehData[v][1], vehData[v][2], vehData[v][3], colW, vbg);
    }

    y += 8;

    // Price
    y = drawPriceBadge(doc, y, 'SELLING PRICE / Qeemat', sale.sellingPrice);

    if (Number(sale.downPayment) > 0) {
      doc.font('Helvetica').fontSize(8).fillColor(COLORS.grayText);
      doc.text('Down Payment: ' + Number(sale.downPayment).toLocaleString() + ' AFN', M + 10, y);
      doc.text('Remaining: ' + Number(sale.remainingAmount || 0).toLocaleString() + ' AFN', M + CW / 2, y);
      y += 14;
    }

    // Terms
    var terms = [
      '1: The vehicle price is (' + Number(sale.sellingPrice || 0).toLocaleString() + ') AFN as shown above.',
      '2: Traffic responsibility from (' + new Date(sale.saleDate).toLocaleDateString('en-GB') + ') onward is with the buyer.',
      '3: The vehicle has no legal documents - only one key.',
      '4: Vehicle fully checked and approved. Seller has no complaint right.',
      '5: Theft responsibility is on the buyer.',
      '6: Buyer and seller must take warranty from each other. Showroom has no guarantee.',
      '7: The showroom is only a witness for the record.',
      '8: Commission dispute handled by showroom rules.',
      '9: Commission: 2% from buyer, 1% from seller.'
    ];
    y = drawTerms(doc, y, terms, COLORS.containerAccent);
    y = drawNotes(doc, y, sale.notes, sale.note2);
    y = drawSignatures(doc, y, sale.witnessName1, sale.witnessName2);

    drawFooter(doc);
    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
}

// =================================================================
//  3. LICENSED CAR BILL
// =================================================================
function generateLicensedCarPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'licensed_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawHeader(doc, 'Licensed Car', sale.saleId, sale.saleDate, sale.id);

    var colW = CW / 2 - 4;

    // Buyer & Seller
    y = drawSectionTitle(doc, y, '  BUYER / Kharidar                                                                SELLER / Ploronki', COLORS.licensedAccent);
    var labels = ['Full Name', 'Father Name', 'Province', 'District', 'Village', 'Address', 'ID Number', 'Phone'];
    var buyerVals = [customer.fullName, customer.fatherName, customer.province, customer.district, customer.village, customer.currentAddress, customer.nationalIdNumber, customer.phoneNumber];
    var sellerVals = [sale.sellerName, sale.sellerFatherName, sale.sellerProvince, sale.sellerDistrict, sale.sellerVillage, sale.sellerAddress, sale.sellerIdNumber, sale.sellerPhone];

    for (var i = 0; i < labels.length; i++) {
      var bg = i % 2 === 0 ? COLORS.lightGreen : '#ffffff';
      y = drawSideBySideRow(doc, y, labels[i], buyerVals[i], sellerVals[i], colW, bg);
    }

    y += 8;

    // Vehicle Specs
    y = drawSectionTitle(doc, y, '  VEHICLE SPECIFICATIONS / D Motor Mushakhisat', '#37474f');

    var vehData = [
      ['Category', vehicle.category, 'Color', vehicle.color],
      ['Manufacturer', vehicle.manufacturer, 'Model', (vehicle.model || '') + ' (' + (vehicle.year || '') + ')'],
      ['Engine No.', vehicle.engineNumber, 'Chassis', vehicle.chassisNumber],
      ['Fuel Type', vehicle.fuelType, 'Engine Type', vehicle.engineType],
      ['Plate', vehicle.plateNo, 'Transmission', vehicle.transmission],
      ['Steering', vehicle.steering, 'Monolithic/Cut', vehicle.monolithicCut],
      ['Vehicle License', vehicle.vehicleLicense || vehicle.vehicleId, 'Mileage', vehicle.mileage ? (vehicle.mileage + ' km') : '\u2014']
    ];

    for (var v = 0; v < vehData.length; v++) {
      var vbg = v % 2 === 0 ? COLORS.lightGreen : '#ffffff';
      y = drawVehicleSpecRow(doc, y, vehData[v][0], vehData[v][1], vehData[v][2], vehData[v][3], colW, vbg);
    }

    y += 8;

    // Price
    y = drawPriceBadge(doc, y, 'SELLING PRICE / Qeemat', sale.sellingPrice);

    // Traffic transfer date
    if (sale.trafficTransferDate) {
      doc.roundedRect(M, y, CW, 22, 3).fill('#e8f5e9').stroke(COLORS.licensedAccent);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.licensedAccent)
        .text('Traffic Transfer Date: ' + new Date(sale.trafficTransferDate).toLocaleDateString('en-GB'), M + 10, y + 5, { width: CW - 20 });
      y += 28;
    }

    if (Number(sale.downPayment) > 0) {
      doc.font('Helvetica').fontSize(8).fillColor(COLORS.grayText);
      doc.text('Down Payment: ' + Number(sale.downPayment).toLocaleString() + ' AFN', M + 10, y);
      doc.text('Remaining: ' + Number(sale.remainingAmount || 0).toLocaleString() + ' AFN', M + CW / 2, y);
      y += 14;
    }

    // Terms
    var transferDateStr = sale.trafficTransferDate ? new Date(sale.trafficTransferDate).toLocaleDateString('en-GB') : '___';
    var saleDateStr = new Date(sale.saleDate).toLocaleDateString('en-GB');
    var terms = [
      '1: The vehicle price is (' + Number(sale.sellingPrice || 0).toLocaleString() + ') AFN.',
      '2: Traffic responsibility until (' + transferDateStr + ') is with the seller. After (' + saleDateStr + '), responsibility is with buyer.',
      '3: Vehicle has complete legal documents and title.',
      '4: Vehicle fully checked and approved. Seller has no complaint right.',
      '5: Theft responsibility is on the buyer.',
      '6: Buyer and seller must take warranty from each other.',
      '7: The showroom is only a witness for this record.',
      '8: Commission dispute handled by showroom rules.',
      '9: Commission: 2% from buyer, 1% from seller.'
    ];
    y = drawTerms(doc, y, terms, COLORS.licensedAccent);
    y = drawNotes(doc, y, sale.notes, sale.note2);
    y = drawSignatures(doc, y, sale.witnessName1, sale.witnessName2);

    drawFooter(doc);
    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
}

// =================================================================
//  Main dispatcher
// =================================================================
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

// =================================================================
//  Financial Report PDF
// =================================================================
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

    if (reportData.monthlyData && reportData.monthlyData.length > 0) {
      y += 10;
      doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.accent).text('Monthly Summary', 40, y);
      y += 22;
      doc.fillColor(COLORS.darkText);
      var monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (var mi = 0; mi < reportData.monthlyData.length; mi++) {
        var m = reportData.monthlyData[mi];
        doc.fontSize(11).text(
          monthNames[m.month] + ' ' + m.year + ': Income AFN ' + m.income.toLocaleString() + ' | Expenses AFN ' + m.expenses.toLocaleString() + ' | Net AFN ' + (m.income - m.expenses).toLocaleString(),
          40, y
        );
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

// =================================================================
//  Vehicle PDF
// =================================================================
var generateVehiclePdf = function(vehicle, outputDir) {
  ensureDir(outputDir);
  var fileName = 'vehicle_' + vehicle.vehicleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margin: 40 });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.rect(0, 0, PAGE_W, 60).fill(COLORS.headerBg);
    doc.rect(0, 60, PAGE_W, 3).fill(COLORS.gold);
    drawCarSilhouette(doc, PAGE_W / 2 - 50, 5, 100, 40, COLORS.gold);
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#fff')
      .text('Vehicle Information Card', 40, 42, { width: PAGE_W - 80, align: 'center' });

    var y = 80;

    var rows = [
      ['Vehicle ID', vehicle.vehicleId], ['Category', vehicle.category],
      ['Manufacturer', vehicle.manufacturer], ['Model', vehicle.model],
      ['Year', vehicle.year], ['Color', vehicle.color],
      ['Chassis/VIN', vehicle.chassisNumber], ['Engine Number', vehicle.engineNumber],
      ['Engine Type', vehicle.engineType], ['Fuel Type', vehicle.fuelType],
      ['Transmission', vehicle.transmission], ['Mileage', vehicle.mileage],
      ['Plate No.', vehicle.plateNo], ['Vehicle License', vehicle.vehicleLicense],
      ['Steering', vehicle.steering], ['Monolithic/Cut', vehicle.monolithicCut],
      ['Status', vehicle.status],
      ['Selling Price (AFN)', vehicle.sellingPrice],
      ['Total Cost (AFN)', vehicle.totalCostPKR]
    ];

    for (var ri = 0; ri < rows.length; ri++) {
      var rbg = ri % 2 === 0 ? COLORS.lightGray : '#fff';
      doc.rect(40, y, PAGE_W - 80, 18).fill(rbg).stroke('#e0e0e0');
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.grayText)
        .text(rows[ri][0], 46, y + 4, { width: 130 });
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.darkText)
        .text(String(rows[ri][1] != null ? rows[ri][1] : '\u2014'), 180, y + 4, { width: PAGE_W - 230 });
      y += 18;
    }

    doc.rect(0, PAGE_H - 25, PAGE_W, 25).fill(COLORS.headerBg);
    doc.font('Helvetica').fontSize(7).fillColor('#aaa')
      .text('Niazi Khpalwak Motor Puranchi  -  Vehicle Record', 40, PAGE_H - 18, { width: PAGE_W - 80, align: 'center' });

    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
};

module.exports = {
  generateVehiclePdf: generateVehiclePdf,
  generateSaleInvoicePdf: generateSaleInvoicePdf,
  generateFinancialReportPdf: generateFinancialReportPdf
};
