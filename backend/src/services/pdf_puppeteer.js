const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeText(v) {
  return v === undefined || v === null || v === '' ? '—' : String(v);
}

function toPashtoNumber(n) {
  try { return new Intl.NumberFormat('fa-AF').format(Number(n)); } catch (e) { return String(n || '—'); }
}

function toPashtoDate(d) {
  try { return d ? new Date(d).toLocaleDateString('fa-AF') : '—'; } catch (e) { return d || '—'; }
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

  const buildTermsSection = ({ title, summary, intro, items }) => `
    <div class="terms-card">
      <div class="section-title">شرطونه او تعهدات</div>
      <div class="terms-heading">${title}</div>
      <div class="terms-summary">${summary}</div>
      <p class="terms-intro">${intro}</p>
      <ol class="terms-list">
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </ol>
      <div class="terms-note">نوټ: ${safeText(sale.notes)}</div>
    </div>
  `;

  // Custom Pashto terms/clauses per bill type (user-provided text)
  const customTermsHtml = (() => {
    if (typeKey === 'Exchange Car') {
      return buildTermsSection({
        title: 'د ماچه موټرانو بیل',
        summary: 'موټر مشخصات: نوع، رنګ، ماډل، انجن، کاټ یا روغ، پطرول/ ډیزل، شاسې نمبر، سند، قیمت',
        intro: 'شرعی اقرار کوم چی دوي عراده موثران سره متبدله به طور سره ................................. نمایی افغانی ...................... و(            ) ته ورکړي.',
        items: [
          'موتر تیر ترافيکي پيښي مسؤليت د غلا ضمانت او پور له دغه تاریخ (    /     /      ) په متبادله کوونکی اړه لري.',
          'د متبادله کوونکي په رضایت سودا صورت ونیو.',
          'موتران بعد له ترائي څخه يو او بل ته فعال سره تسلیم شوه.',
          'باید طرفین یو د بله ضمانت سره واخلي ځکه پلورنځې د دوی په پیژند گلوی په هکله مسؤليت نه لري. د موټر پلورنځی دفتر د هیچا ضمانت نه کوی.',
          'د رهنما کمیشن د تجارت د قانون سره سم ۲ فیصده اخیستل کیږی د معاملی د فسخی په صورت کی کمیشن نه مسترد کيږي.',
          'د بیت المال د موترانو د خرید او فروش څخه جداً معذرت غوارو.',
        ],
      });
    }

    if (typeKey === 'Container One Key') {
      return buildTermsSection({
        title: 'د کانټینري موټرانو بیل',
        summary: 'موټر مشخصات: نوع، رنګ، ماډل، انجن، کاټ یا روغ، پطرول/ ډیزل، شاسې نمبر',
        intro: 'شرعی اقرار کوم چې ذکر سوي موټر قیمت ................................. افغاني چې نیمايې يې ...................... افغانی کیږي په لاندي شرايطو خرڅ کړه:',
        items: [
          'د ذكر سوي موټر د ترافیکی پیښي مسؤلیت تر دغه نبتي (    /     /      ) پوری د خرڅوونکي په غاړه دي تر دغه نیتی (    /     /    ) وروسته بي مسولیت درانیوونکي په غاړه دي.',
          'ذکر شوي موټر كوم قانوني اسناد نه لري فقط يوه کيلي ده.',
          'موتر چی مکمل چیک او ترایی سو تر خط ليکلو وروسته رانیوونکی د شکایت حق نه لري.',
          'د ذکر سوي موټر د غلا مسؤليت په خرڅوونکي پوري اړه لري.',
          'رانیوونکي او خرځوونکي دي يو د بله ضمانت سره و اخلي ځکه پلورنځې د هیچا ضمانت حق نه لري. پلورنځي فقط د شاهد په حيث خط ورته ليکي.',
          'د پښیمانی په صورت کې د شورم کمیشن نه مسترد کيږي.',
          'در هنما کمیشن د تجارت د قانون سره سم دوه فیصده اخیستل کیږي چي د يو فیصد د رانیونکی څخه او يو فیصد د خرڅوونکي څخه.',
        ],
      });
    }

    if (typeKey === 'Licensed Car') {
      return buildTermsSection({
        title: 'د اسناد داره موټرانو بیل',
        summary: 'موټر مشخصات: نوع، رنګ، ماډل، انجن، کاټ یا روغ، پطرول/ ډیزل، شاسې نمبر، جواز سیر، نمبر پلیټ',
        intro: 'شرعی اقرار کوم چې ذکر سوي موټر قیمت ................................. افغاني چې نیمايې يې ...................... افغاني کیږي په لاندې شرایطو خرڅ کړه:',
        items: [
          'د موټر د اسنادو او قبالي په نوم کولو مصرف په رانیونکي پورې اړه لري.',
          'د ذکر سوي موټر د ترافیکی پیښي مسؤلیت تر دغه نبتي (    /     /      ) پوری د خرڅوونکي په غاړه دي تر دغه نیتی (    /     /    ) وروسته بي مسولیت درانیوونکي په غاړه دي.',
          'معامله په رضایت د جانیبینو صورت ونیوی او رانیونکي موټر ټول چیک او ټرایی کړی، د اسنادو سره تسلیم سو. جانیبینو قناعت کړي دي چې بعداَ دعوا یې د اعتبار وړ نده.',
          'د موټر پلورنځي سند درې نقله لیکل کیږي چې یو نقل یی خرڅوونکې ته دوم نقل یی رانیوونکې ته او دریم نقل یی خپله همدلته دفتر کی قیدیږي.',
          'رانیوونکي او خرځوونکي دي يو د بله ضمانت سره و اخلي ځکه پلورنځې د هیچا ضمانت حق نه لري. پلورنځي فقط د شاهد په حيث خط ورته ليکي.',
          'درهنما کمیشن د تجارت د قانون سره سم دوه فیصده اخیستل کیږي چي د يو فیصد د رانیونکی څخه او يو فیصد د خرڅوونکي څخه اخیستل کیږي. د پښیمانې په صورت کې د شوروم کمیشن نه مسترد کیږي.',
          'د بیت المال د موټرانو د خرید او فروش څخه معذرت غواړو.',
        ],
      });
    }

    return buildTermsSection({
      title: safeText(sale.saleType || 'بل'),
      summary: 'معامله د دواړو لورو په رضایت ثبت شوه.',
      intro: 'دا سند د پلور د ثبت او تسلیمۍ لپاره ترتیب شوی دی.',
      items: ['ټول معلومات د دواړو لورو د تایید وروسته درج شوي دي.'],
    });
  })();

  // Build HTML with all fields
  return `<!doctype html>
  <html lang="ps">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root{ --primary:#0f172a; --gold:#c8963e; --lightGold:#fbf5ea; --grayText:#5b6474; --border:#e2e8f0; --panel:#f8fafc; --shadow:0 10px 30px rgba(15,23,42,0.08); }
      @page { size: A4; margin: 0mm; }
      @font-face{ font-family: 'BahijNazaninLocal'; src: url(data:font/truetype;charset=utf-8;base64,${fontB64}) format('truetype'); font-weight: normal; font-style: normal; }
      html,body{height:100%; margin:0; padding:0;}
      body{ font-family:'BahijNazaninLocal', 'Noto Naskh Arabic', serif; direction:rtl; unicode-bidi:embed; background:#fff; color:var(--primary); }
      .page{ width:210mm; height:297mm; max-width:210mm; margin:0 auto; padding:8mm 9mm 7mm; box-sizing:border-box; overflow:hidden; display:flex; flex-direction:column; gap:6px; }
      .header{ background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#fff; padding:10px 14px; position:relative; border-radius:14px; box-shadow:var(--shadow); }
      .company{ font-size:17px; font-weight:800; text-align:center; letter-spacing:.2px; }
      .subtitle{ font-size:10px; color:#dbe4f1; text-align:center; margin-top:2px; }
      .address{ font-size:8.5px; color:#f6dba9; text-align:center; margin-top:5px; }
      .sil{ position:absolute; top:12px; width:52px; height:28px; fill:rgba(245, 219, 169, 0.85); }
      .sil.right{ right:12px; transform:scaleX(-1); }
      .sil.left{ left:12px; }
      .bill-banner{ margin:0px auto; display:inline-block; background:${accentBg}; border:1px solid rgba(15,23,42,0.08); border-radius:999px; padding:6px 12px; position:relative; align-self:flex-start; }
      .bill-banner .label{ color:${accentColor}; font-weight:800; font-size:12px; text-align:center; }
      .meta{ display:flex; justify-content:space-between; gap:8px; margin-top:2px; font-size:9px; color:var(--grayText); }
      .meta-pill{ flex:1; background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:6px 10px; }
      .section{ margin-top:2px; }
      .section-title{ font-size:10px; font-weight:800; color:var(--primary); margin-bottom:6px; }
      .cols{ display:flex; gap:8px; }
      .col{ flex:1; }
      .row-card{ border:1px solid var(--border); padding:8px 10px; background:var(--panel); margin-bottom:0; border-radius:12px; box-shadow:0 2px 10px rgba(15,23,42,0.03); }
      .row-card .lbl{ font-size:9px; color:var(--grayText); text-align:right; }
      .row-card .val{ font-size:10.5px; color:var(--primary); font-weight:700; text-align:right; }
      .specs{ border:1px solid var(--border); border-radius:12px; background:#fff; padding:6px 8px; }
      .specs table{ width:100%; border-collapse:separate; border-spacing:0; }
      .specs td{ border-bottom:1px solid var(--border); padding:5px 6px; font-size:9.3px; text-align:right; }
      .specs tr:last-child td{ border-bottom:none; }
      .specs td:nth-child(odd){ color:var(--grayText); font-weight:700; background:rgba(248,250,252,0.9); }
      .price-badge{ margin-top:2px; background:linear-gradient(135deg, var(--lightGold) 0%, #fffaf0 100%); border:1px solid rgba(200,150,62,0.45); padding:9px 10px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; }
      .price-badge .label{ font-size:10.5px; color:var(--grayText); }
      .price-badge .amount{ font-size:15px; font-weight:800; color:var(--primary); }
      .financial-meta{ display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
      .financial-chip{ border:1px dashed var(--border); background:var(--panel); border-radius:999px; padding:4px 8px; font-size:8.7px; color:var(--grayText); }
      .terms-card{ border:1px solid var(--border); border-radius:12px; padding:8px 10px; background:linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); }
      .terms-heading{ font-size:10.8px; font-weight:800; color:var(--primary); margin-bottom:3px; }
      .terms-summary, .terms-intro{ font-size:8.7px; color:var(--grayText); margin:0 0 4px 0; }
      .terms-list{ padding-right:16px; margin:0; font-size:8.7px; line-height:1.3; }
      .terms-list li{ margin-bottom:2px; }
      .terms-note{ margin-top:6px; min-height:24px; border:1px dashed #cfd8e3; border-radius:8px; padding:5px 8px; font-size:8.7px; color:var(--grayText); }
      .signs{ display:flex; gap:6px; margin-top:4px; flex-wrap:wrap; }
      .sig{ flex:1 1 calc(20% - 6px); border:1px dashed #cbd5e1; height:42px; display:flex; align-items:flex-end; justify-content:center; font-size:8.7px; color:var(--grayText); padding:0 4px 6px; border-radius:10px; background:#fff; text-align:center; }
      .footer{ margin-top:2px; color:var(--grayText); padding-top:5px; text-align:center; font-size:8.5px; border-top:1px solid var(--border); }
      .person-table { display:grid; grid-template-columns: 88px 1fr; gap:4px 8px; align-items:start; margin-top:4px; direction:rtl; }
      .pt-label { font-size:8.8px; color:var(--grayText); text-align:right; padding-right:6px; font-weight:700; }
      .pt-value { font-size:10.3px; color:var(--primary); text-align:right; font-weight:700; white-space:pre-wrap; word-break:break-word; }
      .person-header { font-size:10.8px; font-weight:800; color:var(--primary); margin-bottom:6px; text-align:right; }
      .small { font-size:8.7px; color:var(--grayText); }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <svg class="sil left" viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><path d="M10,35 L15,35 L20,20 L45,12 L90,12 L105,20 L115,35 L120,35 L120,42 L110,42 L108,38 L102,38 L100,42 L30,42 L28,38 L22,38 L20,42 L0,42 Z"/></svg>
        <svg class="sil right" viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg"><path d="M10,35 L15,35 L20,20 L45,12 L90,12 L105,20 L115,35 L120,35 L120,42 L110,42 L108,38 L102,38 L100,42 L30,42 L28,38 L22,38 L20,42 L0,42 Z"/></svg>
        <div style="position:absolute; left:12px; top:8px; color:#d32f2f; font-weight:800; font-size:13px;">${serialNumber}</div>
        <div class="company">نیازي خپلواک موټر پلورنځي</div>
        <div style="text-align: center;"><div class="bill-banner"><div class="label">${billLabel}</div></div></div>
        <div class="address">تیلیفون: ۰۷۰۰۰۰8۹۸۳ | ۰7۰۰۰۰8۹۸۲ | سپین بولدک عمومی سړک، ګمرک ته مخامخ. کندهار. افغانستان</div>
      </div>

      <div class="meta small">
        <div class="meta-pill">د بل شمیره: ${safeText(sale.saleId)} — نیټه: ${date}</div>
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
        <div class="section-title">مشخصات موټر</div>
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
        <div class="section specs">
          <div class="section-title">بدیل شوی موټر (تبادله)</div>
          <table>
            <tr><td>جوړونکی</td><td>${exch.manufacturer}</td><td>ماډل</td><td>${exch.model}</td></tr>
            <tr><td>کال</td><td>${exch.year}</td><td>ډول</td><td>${exch.category}</td></tr>
            <tr><td>رنګ</td><td>${exch.color}</td><td>چاسيس</td><td>${exch.chassis}</td></tr>
            <tr><td>انجن</td><td>${exch.engine}</td><td>پلیت</td><td>${exch.plate}</td></tr>
          </table>
        </div>
      ` : ''}

      <div class="price-badge">
        <div class="label">د پلور قیمت / اسعار: ${paymentCurrency}</div>
        <div class="amount">${price}</div>
      </div>

      <div class="financial-meta">
        ${downPayment ? `<div class="financial-chip">پیش پیسه: ${downPayment} — پاتې: ${remaining || '—'}</div>` : ''}
        ${priceDiff ? `<div class="financial-chip">د قیمت توپیر: ${priceDiff} — ادا کوونکی: ${priceDiffBy || '—'}</div>` : ''}
        ${trafficDate ? `<div class="financial-chip">د ټرافیک د لیږد نیټه: ${trafficDate}</div>` : ''}
      </div>

       ${customTermsHtml}

      <div class="signs" style="flex-wrap:wrap;">
        <div class="sig"><span class="small">د پلورونکی لاسلیک  (${safeText(sale.sellerName)})</span></div>
        <div class="sig">مهر</div>
        <div class="sig"><span class="small">د پیرودونکی لاسلیک  (${safeText(sale.buyerName)})</span></div>
      </div>
      <div class="signs" style="flex-wrap:wrap;">
        <div class="sig"><span class="small">شاهد۱  (${safeText(sale.witnessName1)})</span></div>
        <div class="sig"><span class="small">شاهد۲  (${safeText(sale.witnessName2)})</span></div>
      </div>

      <div class="footer">دا سند د نیازي خپلواک موټر پلورنځي رسمي د پلور ثبت او تسلیمۍ ریکارډ دی.</div>
    </div>
  </body>
  </html>`;
}

async function findChromeExecutable() {
  const candidates = [
    // Linux (VPS / server)
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    // macOS
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
    // Use 'load' instead of 'networkidle0' because Chrome may keep
    // background connections open (GCM/updater) which prevents
    // networkidle0 from ever firing and causes a hang.
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    await page.emulateMediaType('screen');

    // Wait briefly for fonts to settle. Prefer document.fonts.ready but
    // don't block indefinitely if it misbehaves on some Chrome builds.
    try {
      await page.evaluate(async () => {
        if (!document.fonts || !document.fonts.ready) {
          return;
        }

        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 1200)),
        ]);
      });
      console.info('[pdf] document.fonts.ready resolved');
    } catch (e) {
      console.warn('[pdf] document.fonts.ready did not resolve quickly, continuing');
    }
    await new Promise((r) => setTimeout(r, 200));

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
      await new Promise((r) => setTimeout(r, 80));
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

// 2. Financial report PDF – NEW Puppeteer version (Pashto)
// ----------------------------------------------------------------------
function buildFinancialReportHtml(reportData, fontB64) {
  const totalRevenue = toPashtoNumber(reportData.revenue);
  const totalExpenses = toPashtoNumber(reportData.expenses);
  const netProfit = toPashtoNumber(reportData.profit);
  const vehiclesSold = toPashtoNumber(reportData.vehiclesSold);
  const totalCommission = toPashtoNumber(reportData.commission);
  const showroomBalance = toPashtoNumber(reportData.showroomBalance);
  const ownerBalance = toPashtoNumber(reportData.ownerBalance);
  const sharedTotal = toPashtoNumber(reportData.sharedTotal);
  const sharedPersons = reportData.sharedPersons || [];
  const dateStr = toPashtoDate(new Date());

  const renderCard = (label, value, icon) => `
    <div class="summary-card">
      <div class="summary-icon">${icon}</div>
      <div class="summary-label">${label}</div>
      <div class="summary-value">${value} <span class="currency">افغانۍ</span></div>
    </div>
  `;

  return `<!doctype html>
  <html lang="ps">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>مالي راپور</title>
    <style>
      :root {
        --primary: #0f172a;
        --gold: #c8963e;
        --gray-text: #5b6474;
        --border: #e2e8f0;
        --panel: #f8fafc;
        --shadow: 0 10px 30px rgba(15,23,42,0.08);
        --warning: #f59e0b;
      }
      @page { size: A4; margin: 0mm; }
      @font-face {
        font-family: 'BahijNazaninLocal';
        src: url(data:font/truetype;charset=utf-8;base64,${fontB64}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { height: 100%; background: #f1f5f9; }
      body {
        font-family: 'BahijNazaninLocal', 'Noto Naskh Arabic', serif;
        direction: rtl;
        unicode-bidi: embed;
        padding: 8mm;
        background: #f1f5f9;
      }
      .page {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        border-radius: 16px;
        box-shadow: var(--shadow);
        overflow: hidden;
        padding: 8mm 9mm;
      }
      .header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 14px;
        margin-bottom: 20px;
        text-align: center;
        position: relative;
      }
      .company { font-size: 22px; font-weight: 800; }
      .report-title { font-size: 14px; color: #f6dba9; margin-top: 6px; }
      .address { font-size: 9px; color: #94a3b8; margin-top: 8px; }
      .date-badge {
        position: absolute;
        left: 20px;
        bottom: 12px;
        background: rgba(255,255,255,0.15);
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 9px;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 14px;
        margin-bottom: 24px;
      }
      .summary-card {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 12px;
        text-align: center;
      }
      .summary-icon { font-size: 28px; margin-bottom: 6px; }
      .summary-label { font-size: 11px; color: var(--gray-text); text-transform: uppercase; margin-bottom: 6px; }
      .summary-value { font-size: 18px; font-weight: 800; color: var(--primary); }
      .currency { font-size: 11px; font-weight: normal; color: var(--gray-text); }
      .section-title {
        font-size: 14px;
        font-weight: 800;
        color: var(--primary);
        margin: 20px 0 12px 0;
        padding-right: 12px;
        border-right: 4px solid var(--gold);
      }
      .balance-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 12px;
        overflow: hidden;
      }
      .balance-table th, .balance-table td {
        border: 1px solid var(--border);
        padding: 10px 12px;
        text-align: right;
        font-size: 11px;
      }
      .balance-table th {
        background: #f1f5f9;
        font-weight: 800;
      }
      .shared-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .shared-list li {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 10px 14px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
      }
      .shared-name { font-weight: 700; }
      .shared-amount { font-weight: 800; color: var(--warning); }
      .footer {
        margin-top: 24px;
        text-align: center;
        font-size: 8px;
        color: var(--gray-text);
        border-top: 1px solid var(--border);
        padding-top: 12px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div class="company">نیازي خپلواک موټر پلورنځي</div>
        <div class="report-title">مالي راپور</div>
        <div class="address">کندهار، سپین بولدک عمومی سړک، ګمرک ته مخامخ | تلیفون: ۰۷۰۰۰۰۸۹۸۳</div>
        <div class="date-badge">نیټه: ${dateStr}</div>
      </div>

      <div class="summary-grid">
        ${renderCard('ټول عواید', totalRevenue, '💰')}
        ${renderCard('ټول لګښتونه', totalExpenses, '📉')}
        ${renderCard('خالص ګټه', netProfit, '📈')}
        ${renderCard('پلورل شوي موټرې', vehiclesSold, '🚗')}
        ${renderCard('ټول کمیشن', totalCommission, '🏷️')}
      </div>

      <div class="section-title">باقي مانده (توازن)</div>
      <table class="balance-table">
        <thead>
          <tr><th>توضیح</th><th>قیمت (افغانۍ)</th></tr>
        </thead>
        <tbody>
          <tr><td>شوروم موجوده پیسه</td><td>${showroomBalance}</td></tr>
          <tr><td>د خاوند ونډه</td><td>${ownerBalance}</td></tr>
          <tr><td>شریکانو ټوله برخه</td><td>${sharedTotal}</td></tr>
        </tbody>
      </table>

      ${sharedPersons.length > 0 ? `
        <div class="section-title">د شریکانو جلا جلا برخه</div>
        <ul class="shared-list">
          ${sharedPersons.map(p => `<li><span class="shared-name">${safeText(p.personName)}</span><span class="shared-amount">${toPashtoNumber(p.total)} افغانۍ</span></li>`).join('')}
        </ul>
      ` : '<div style="margin: 12px 0; color: var(--gray-text);">هیڅ شریک نشته</div>'}

      <div class="footer">
        دا راپور د شوروم د مالیاتو د ثبت اتوماتیک سیسټم لخوا چاپ شوی دی.
      </div>
    </div>
  </body>
  </html>`;
}

async function generateFinancialReportPdf(reportData, outputDir) {
  ensureDir(outputDir);
  const timestamp = Date.now();
  const fileName = `financial_report_${timestamp}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const fontsDir = path.join(__dirname, '..', '..', 'fonts');
  const bahijPath = path.join(fontsDir, 'BahijNazanin.ttf');
  if (!fs.existsSync(bahijPath)) {
    throw new Error('BahijNazanin.ttf not found in backend/fonts');
  }
  const fontB64 = fs.readFileSync(bahijPath).toString('base64');

  const html = buildFinancialReportHtml(reportData, fontB64);

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
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    await page.emulateMediaType('screen');
    await new Promise(r => setTimeout(r, 200));

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
      await new Promise(r => setTimeout(r, 80));
    }

    await page.pdf({
      path: filePath,
      printBackground: true,
      width: '210mm',
      height: '297mm',
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
    });
    await browser.close();
    return { filePath, fileName };
  } catch (err) {
    if (browser && launched) try { await browser.close(); } catch (e) {}
    throw err;
  }
}

module.exports = {
  generateSaleInvoicePdf,
  generateFinancialReportPdf,
};
