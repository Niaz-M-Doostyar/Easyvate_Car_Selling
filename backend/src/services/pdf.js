const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

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
//  COMPACT DRAWING HELPERS (fit everything on 1 page)
// ================================================================

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

// Compact header ~72px
function drawCompactHeader(doc, type, saleId, saleDate) {
  var cfgMap = {
    'Exchange Car':      { color: COLORS.exchangeAccent, label: 'EXCHANGE CAR BILL',      pashto: '\u062F \u062A\u0628\u0627\u062F\u0644\u06D0 \u0628\u0644',   accent: '#e3f2fd' },
    'Container One Key': { color: COLORS.containerAccent, label: 'CONTAINER ONE KEY BILL', pashto: '\u06A9\u0627\u0646\u062A\u06CC\u0646\u0631\u064A \u06CC\u0648\u0647 \u06A9\u06CC\u0644\u064A \u0628\u0644', accent: '#fff3e0' },
    'Licensed Car':      { color: COLORS.licensedAccent,  label: 'LICENSED VEHICLE BILL',  pashto: '\u0627\u0633\u0646\u0627\u062F \u062F\u0627\u0631 \u0647\u0641\u062A\u0631 \u0645\u06A9\u0645\u0644 \u0628\u0644', accent: '#e8f5e9' },
  };
  var cfg = cfgMap[type] || { color: COLORS.containerAccent, label: 'SALE BILL', pashto: '', accent: '#fff3e0' };

  doc.rect(0, 0, PAGE_W, 52).fill(COLORS.headerBg);
  doc.rect(0, 52, PAGE_W, 2).fill(COLORS.gold);
  drawCarSilhouette(doc, 8, 6, 70, 30, COLORS.gold);
  drawCarSilhouette(doc, PAGE_W - 78, 6, 70, 30, COLORS.gold);

  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.white)
    .text('NIAZI KHPALWAK', 80, 6, { width: PAGE_W - 160, align: 'center' });
  doc.font('Helvetica').fontSize(7.5).fillColor('#ddd')
    .text('Motor Puranchi \u2014 Car Showroom & Dealership', 80, 22, { width: PAGE_W - 160, align: 'center' });
  doc.fontSize(6.5).fillColor(COLORS.gold)
    .text('Phone: 0700008983 | 0700008982 | Kandahar Bazaar, Purani Road, Kok Nakhja', 60, 34, { width: PAGE_W - 120, align: 'center' });
  doc.fontSize(7).fillColor('#fff')
    .text(cfg.pashto, 60, 44, { width: PAGE_W - 120, align: 'center' });

  var by = 57;
  doc.rect(M, by, CW, 18).fill(cfg.accent);
  doc.rect(M, by, 3, 18).fill(cfg.color);
  doc.rect(M + CW - 3, by, 3, 18).fill(cfg.color);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(cfg.color)
    .text(cfg.label, M + 8, by + 4, { width: CW - 16, align: 'center' });

  var iy = by + 20;
  doc.fontSize(6.5).font('Helvetica').fillColor(COLORS.grayText)
    .text('Bill No: ' + saleId, M, iy)
    .text('Date: ' + new Date(saleDate).toLocaleDateString('en-GB'), M + CW / 3, iy, { width: CW / 3, align: 'center' });
  doc.fillColor(COLORS.darkText);
  return iy + 12;
}

// Section title 16px
function drawSection(doc, y, title, color) {
  doc.rect(M, y, CW, 16).fill(color || COLORS.accent);
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#fff')
    .text(title, M + 6, y + 4, { width: CW - 12 });
  doc.fillColor(COLORS.darkText);
  return y + 16;
}

// Side-by-side person row 13px
function drawPersonRow(doc, y, label, buyerVal, sellerVal, colW, bg) {
  var h = 13, lblW = 52;
  doc.rect(M, y, colW, h).fill(bg).stroke('#e0e0e0');
  doc.rect(M + colW + 4, y, colW, h).fill(bg).stroke('#e0e0e0');
  doc.font('Helvetica-Bold').fontSize(5.5).fillColor(COLORS.grayText)
    .text(label, M + 3, y + 3, { width: lblW, lineBreak: false });
  doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.darkText)
    .text(String(buyerVal || '\u2014'), M + lblW + 2, y + 3, { width: colW - lblW - 6, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(5.5).fillColor(COLORS.grayText)
    .text(label, M + colW + 7, y + 3, { width: lblW, lineBreak: false });
  doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.darkText)
    .text(String(sellerVal || '\u2014'), M + colW + lblW + 9, y + 3, { width: colW - lblW - 13, lineBreak: false });
  return y + h;
}

// Side-by-side spec row 13px
function drawSpecRow(doc, y, l1, v1, l2, v2, colW, bg) {
  var h = 13, lblW = 58;
  doc.rect(M, y, colW, h).fill(bg).stroke('#e0e0e0');
  doc.rect(M + colW + 4, y, colW, h).fill(bg).stroke('#e0e0e0');
  doc.font('Helvetica-Bold').fontSize(5.5).fillColor(COLORS.grayText)
    .text(l1, M + 3, y + 3, { width: lblW, lineBreak: false });
  doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.darkText)
    .text(String(v1 || '\u2014'), M + lblW + 2, y + 3, { width: colW - lblW - 6, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(5.5).fillColor(COLORS.grayText)
    .text(l2, M + colW + 7, y + 3, { width: lblW, lineBreak: false });
  doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.darkText)
    .text(String(v2 || '\u2014'), M + colW + lblW + 9, y + 3, { width: colW - lblW - 13, lineBreak: false });
  return y + h;
}

// Compact price badge 22px
function drawPrice(doc, y, label, amount) {
  var h = 22;
  doc.roundedRect(M, y, CW, h, 3).fill(COLORS.lightGold).stroke(COLORS.gold);
  doc.rect(M, y, 4, h).fill(COLORS.gold);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.grayText).text(label, M + 10, y + 5);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary)
    .text(Number(amount || 0).toLocaleString() + ' AFN', M + CW / 2, y + 4, { width: CW / 2 - 10, align: 'right' });
  return y + h + 4;
}

// Compact terms 9px per line
function drawTermsCompact(doc, y, terms, color) {
  y = drawSection(doc, y, 'Terms & Conditions / Sharait aw Zamanat', color);
  doc.font('Helvetica').fontSize(5.5);
  for (var i = 0; i < terms.length; i++) {
    doc.rect(M, y, CW, 9).fill(i % 2 === 0 ? '#fafafa' : '#fff').stroke('#eee');
    doc.fillColor(COLORS.darkText).text(terms[i], M + 5, y + 2, { width: CW - 10, lineBreak: false });
    y += 9;
  }
  return y + 2;
}

// Compact notes
function drawNotesCompact(doc, y, note1, note2) {
  if (!note1 && !note2) return y;
  doc.font('Helvetica-Bold').fontSize(6).fillColor(COLORS.grayText).text('Notes:', M, y);
  y += 9;
  doc.font('Helvetica').fontSize(6).fillColor(COLORS.darkText);
  if (note1) { doc.text('1. ' + note1, M + 4, y, { width: CW - 8, lineBreak: false }); y += 9; }
  if (note2) { doc.text('2. ' + note2, M + 4, y, { width: CW - 8, lineBreak: false }); y += 9; }
  return y + 2;
}

// Compact signatures ~42px
function drawSignaturesCompact(doc, y, witness1, witness2) {
  doc.save();
  doc.moveTo(M, y).lineTo(M + CW, y).dash(2, { space: 2 }).stroke(COLORS.border);
  doc.restore();
  y += 6;
  var colW = CW / 3;
  var sigs = [
    { x: M, label: 'Buyer Thumbprint / Sign' },
    { x: M + colW, label: 'Showroom Stamp' },
    { x: M + 2 * colW, label: 'Seller Thumbprint / Sign' }
  ];
  for (var s = 0; s < sigs.length; s++) {
    doc.roundedRect(sigs[s].x + 3, y, colW - 6, 30, 2).stroke(COLORS.border);
    doc.font('Helvetica-Bold').fontSize(5.5).fillColor(COLORS.grayText)
      .text(sigs[s].label, sigs[s].x + 5, y + 22, { width: colW - 10, align: 'center' });
  }
  y += 34;
  doc.font('Helvetica').fontSize(6).fillColor(COLORS.darkText);
  doc.text('Witness 1: ' + (witness1 || '________________________'), M, y, { width: CW / 2 - 5 });
  doc.text('Witness 2: ' + (witness2 || '________________________'), M + CW / 2, y, { width: CW / 2, align: 'right' });
  return y + 10;
}

// Footer 20px
function drawFooterCompact(doc) {
  doc.rect(0, PAGE_H - 20, PAGE_W, 20).fill(COLORS.headerBg);
  doc.rect(0, PAGE_H - 22, PAGE_W, 2).fill(COLORS.gold);
  doc.font('Helvetica').fontSize(5.5).fillColor('#aaa')
    .text('This document is an official sale record of Niazi Khpalwak Motor Puranchi.', M, PAGE_H - 14, { width: CW, align: 'center' });
}


// ================================================================
//  1. EXCHANGE CAR BILL (single page)
// ================================================================
function generateExchangeCarPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'exchange_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margins: { top: M, bottom: 0, left: M, right: M } });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawCompactHeader(doc, 'Exchange Car', sale.saleId, sale.saleDate);
    var colW = (CW - 4) / 2;

    // Buyer & Seller side-by-side
    doc.rect(M, y, colW, 14).fill(COLORS.exchangeAccent);
    doc.rect(M + colW + 4, y, colW, 14).fill('#5d4037');
    doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#fff')
      .text('BUYER / Kharidar', M + 6, y + 3, { width: colW - 12 })
      .text('EXCHANGER (SELLER) / Tabadla Koonki', M + colW + 10, y + 3, { width: colW - 16 });
    y += 14;

    var labels = ['Full Name', 'Father Name', 'Province', 'District', 'Village', 'Address', 'ID Number', 'Phone'];
    var buyerVals = [customer.fullName, customer.fatherName, customer.province, customer.district, customer.village, customer.currentAddress, customer.nationalIdNumber, customer.phoneNumber];
    var sellerVals = [sale.sellerName, sale.sellerFatherName, sale.sellerProvince, sale.sellerDistrict, sale.sellerVillage, sale.sellerAddress, sale.sellerIdNumber, sale.sellerPhone];
    for (var i = 0; i < labels.length; i++) {
      y = drawPersonRow(doc, y, labels[i], buyerVals[i], sellerVals[i], colW, i % 2 === 0 ? COLORS.lightGray : '#fff');
    }
    y += 4;

    // Sold Vehicle & Exchange Vehicle side-by-side
    doc.rect(M, y, colW, 14).fill('#37474f');
    doc.rect(M + colW + 4, y, colW, 14).fill(COLORS.exchangeAccent);
    doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#fff')
      .text('SOLD VEHICLE / Khartsshaway Motor', M + 6, y + 3, { width: colW - 12 })
      .text('EXCHANGE VEHICLE / Tabadla Motor', M + colW + 10, y + 3, { width: colW - 16 });
    y += 14;

    var vehLabels = ['Manufacturer', 'Model', 'Year', 'Category', 'Color', 'Chassis', 'Engine No.', 'Fuel Type', 'Plate No.', 'Transmission', 'Steering', 'Monolithic/Cut'];
    var soldVals = [vehicle.manufacturer, vehicle.model, vehicle.year, vehicle.category, vehicle.color, vehicle.chassisNumber, vehicle.engineNumber, vehicle.fuelType, vehicle.plateNo, vehicle.transmission, vehicle.steering, vehicle.monolithicCut];
    var exchVals = [sale.exchVehicleManufacturer, sale.exchVehicleModel, sale.exchVehicleYear, sale.exchVehicleCategory, sale.exchVehicleColor, sale.exchVehicleChassis, sale.exchVehicleEngine, sale.exchVehicleFuelType, sale.exchVehiclePlateNo, sale.exchVehicleTransmission, sale.exchVehicleSteering, sale.exchVehicleMonolithicCut];
    for (var j = 0; j < vehLabels.length; j++) {
      y = drawPersonRow(doc, y, vehLabels[j], soldVals[j], exchVals[j], colW, j % 2 === 0 ? COLORS.lightBlue : '#fff');
    }
    y += 5;

    // Prices
    y = drawPrice(doc, y, 'SELLING PRICE / Qeemat', sale.sellingPrice);
    if (Number(sale.priceDifference) > 0) {
      y = drawPrice(doc, y, 'PRICE DIFFERENCE / D Qeemat Farq', sale.priceDifference);
      doc.font('Helvetica').fontSize(6).fillColor(COLORS.grayText)
        .text('Price difference paid by: ' + (sale.priceDifferencePaidBy || 'Buyer'), M + 8, y);
      y += 10;
    }

    // Terms
    var terms = [
      '1: Both vehicles exchanged \u2014 traffic responsibility from this date onward to the new owner.',
      '2: Exchange done with mutual consent and agreement of both parties.',
      '3: Vehicles delivered after full checking \u2014 both parties satisfied with condition.',
      '4: Both parties must take warranty from each other. Showroom has no responsibility.',
      '5: Commission: 2% from buyer, 1% from seller. Buying/selling Bait-ul-Maal vehicles prohibited.'
    ];
    y = drawTermsCompact(doc, y, terms, COLORS.exchangeAccent);
    y = drawNotesCompact(doc, y, sale.notes, sale.note2);
    y = drawSignaturesCompact(doc, y, sale.witnessName1, sale.witnessName2);

    drawFooterCompact(doc);
    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
}


// ================================================================
//  2. CONTAINER ONE KEY BILL (single page)
// ================================================================
function generateContainerOneKeyPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'container_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margins: { top: M, bottom: 0, left: M, right: M } });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawCompactHeader(doc, 'Container One Key', sale.saleId, sale.saleDate);
    var colW = (CW - 4) / 2;

    // Buyer & Seller side-by-side
    doc.rect(M, y, colW, 14).fill(COLORS.containerAccent);
    doc.rect(M + colW + 4, y, colW, 14).fill('#795548');
    doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#fff')
      .text('BUYER / Kharidar', M + 6, y + 3, { width: colW - 12 })
      .text('SELLER / Ploronki', M + colW + 10, y + 3, { width: colW - 16 });
    y += 14;

    var labels = ['Full Name', 'Father Name', 'Province', 'District', 'Village', 'Address', 'ID Number', 'Phone'];
    var buyerVals = [customer.fullName, customer.fatherName, customer.province, customer.district, customer.village, customer.currentAddress, customer.nationalIdNumber, customer.phoneNumber];
    var sellerVals = [sale.sellerName, sale.sellerFatherName, sale.sellerProvince, sale.sellerDistrict, sale.sellerVillage, sale.sellerAddress, sale.sellerIdNumber, sale.sellerPhone];
    for (var i = 0; i < labels.length; i++) {
      y = drawPersonRow(doc, y, labels[i], buyerVals[i], sellerVals[i], colW, i % 2 === 0 ? COLORS.lightGray : '#fff');
    }
    y += 4;

    // Vehicle Specs (2-col)
    y = drawSection(doc, y, '  VEHICLE SPECIFICATIONS / D Motor Mushakhisat', '#37474f');
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
      y = drawSpecRow(doc, y, vehData[v][0], vehData[v][1], vehData[v][2], vehData[v][3], colW, v % 2 === 0 ? COLORS.lightBlue : '#fff');
    }
    y += 5;

    // Price
    y = drawPrice(doc, y, 'SELLING PRICE / Qeemat', sale.sellingPrice);
    if (Number(sale.downPayment) > 0) {
      doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.grayText);
      doc.text('Down Payment: ' + Number(sale.downPayment).toLocaleString() + ' AFN', M + 8, y);
      doc.text('Remaining: ' + Number(sale.remainingAmount || 0).toLocaleString() + ' AFN', M + CW / 2, y);
      y += 11;
    }

    // Terms
    var terms = [
      '1: The vehicle price is (' + Number(sale.sellingPrice || 0).toLocaleString() + ') AFN as shown above.',
      '2: Traffic responsibility from (' + new Date(sale.saleDate).toLocaleDateString('en-GB') + ') onward is with the buyer.',
      '3: The vehicle has no legal documents \u2014 only one key. Vehicle fully checked and approved.',
      '4: Theft responsibility is on the buyer. Seller has no complaint right.',
      '5: Buyer and seller must take warranty from each other. Showroom has no guarantee.',
      '6: The showroom is only a witness. Commission: 2% buyer, 1% seller.'
    ];
    y = drawTermsCompact(doc, y, terms, COLORS.containerAccent);
    y = drawNotesCompact(doc, y, sale.notes, sale.note2);
    y = drawSignaturesCompact(doc, y, sale.witnessName1, sale.witnessName2);

    drawFooterCompact(doc);
    doc.end();
    stream.on('finish', function() { resolve({ filePath: filePath, fileName: fileName }); });
    stream.on('error', reject);
  });
}


// ================================================================
//  3. LICENSED CAR BILL (single page)
// ================================================================
function generateLicensedCarPdf(sale, vehicle, customer, outputDir) {
  ensureDir(outputDir);
  var fileName = 'licensed_bill_' + sale.saleId + '.pdf';
  var filePath = path.join(outputDir, fileName);

  return new Promise(function(resolve, reject) {
    var doc = new PDFDocument({ size: 'A4', margins: { top: M, bottom: 0, left: M, right: M } });
    var stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    var y = drawCompactHeader(doc, 'Licensed Car', sale.saleId, sale.saleDate);
    var colW = (CW - 4) / 2;

    // Buyer & Seller side-by-side
    doc.rect(M, y, colW, 14).fill(COLORS.licensedAccent);
    doc.rect(M + colW + 4, y, colW, 14).fill('#4e342e');
    doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#fff')
      .text('BUYER / Kharidar', M + 6, y + 3, { width: colW - 12 })
      .text('SELLER / Ploronki', M + colW + 10, y + 3, { width: colW - 16 });
    y += 14;

    var labels = ['Full Name', 'Father Name', 'Province', 'District', 'Village', 'Address', 'ID Number', 'Phone'];
    var buyerVals = [customer.fullName, customer.fatherName, customer.province, customer.district, customer.village, customer.currentAddress, customer.nationalIdNumber, customer.phoneNumber];
    var sellerVals = [sale.sellerName, sale.sellerFatherName, sale.sellerProvince, sale.sellerDistrict, sale.sellerVillage, sale.sellerAddress, sale.sellerIdNumber, sale.sellerPhone];
    for (var i = 0; i < labels.length; i++) {
      y = drawPersonRow(doc, y, labels[i], buyerVals[i], sellerVals[i], colW, i % 2 === 0 ? COLORS.lightGreen : '#fff');
    }
    y += 4;

    // Vehicle Specs (2-col)
    y = drawSection(doc, y, '  VEHICLE SPECIFICATIONS / D Motor Mushakhisat', '#37474f');
    var vehData = [
      ['Category', vehicle.category, 'Color', vehicle.color],
      ['Manufacturer', vehicle.manufacturer, 'Model', (vehicle.model || '') + ' (' + (vehicle.year || '') + ')'],
      ['Engine No.', vehicle.engineNumber, 'Chassis', vehicle.chassisNumber],
      ['Fuel Type', vehicle.fuelType, 'Engine Type', vehicle.engineType],
      ['Plate', vehicle.plateNo, 'Transmission', vehicle.transmission],
      ['Steering', vehicle.steering, 'Monolithic/Cut', vehicle.monolithicCut],
      ['License', vehicle.vehicleLicense || vehicle.vehicleId, 'Mileage', vehicle.mileage ? (vehicle.mileage + ' km') : '\u2014']
    ];
    for (var v = 0; v < vehData.length; v++) {
      y = drawSpecRow(doc, y, vehData[v][0], vehData[v][1], vehData[v][2], vehData[v][3], colW, v % 2 === 0 ? COLORS.lightGreen : '#fff');
    }
    y += 5;

    // Price
    y = drawPrice(doc, y, 'SELLING PRICE / Qeemat', sale.sellingPrice);

    if (sale.trafficTransferDate) {
      doc.roundedRect(M, y, CW, 15, 2).fill('#e8f5e9').stroke(COLORS.licensedAccent);
      doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLORS.licensedAccent)
        .text('Traffic Transfer Date: ' + new Date(sale.trafficTransferDate).toLocaleDateString('en-GB'), M + 8, y + 4, { width: CW - 16 });
      y += 19;
    }

    if (Number(sale.downPayment) > 0) {
      doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.grayText);
      doc.text('Down Payment: ' + Number(sale.downPayment).toLocaleString() + ' AFN', M + 8, y);
      doc.text('Remaining: ' + Number(sale.remainingAmount || 0).toLocaleString() + ' AFN', M + CW / 2, y);
      y += 11;
    }

    // Terms
    var transferDateStr = sale.trafficTransferDate ? new Date(sale.trafficTransferDate).toLocaleDateString('en-GB') : '___';
    var saleDateStr = new Date(sale.saleDate).toLocaleDateString('en-GB');
    var terms = [
      '1: The vehicle price is (' + Number(sale.sellingPrice || 0).toLocaleString() + ') AFN.',
      '2: Traffic responsibility until (' + transferDateStr + ') with seller. After (' + saleDateStr + ') with buyer.',
      '3: Vehicle has complete legal documents and title. Fully checked and approved.',
      '4: Theft responsibility is on the buyer. Seller has no complaint right.',
      '5: Buyer and seller must take warranty from each other.',
      '6: Showroom is only a witness. Commission: 2% buyer, 1% seller.'
    ];
    y = drawTermsCompact(doc, y, terms, COLORS.licensedAccent);
    y = drawNotesCompact(doc, y, sale.notes, sale.note2);
    y = drawSignaturesCompact(doc, y, sale.witnessName1, sale.witnessName2);

    drawFooterCompact(doc);
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