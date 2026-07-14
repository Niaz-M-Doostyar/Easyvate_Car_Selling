const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeText(v) {
  return v === undefined || v === null || v === '' ? '' : String(v);
}

function toPashtoNumber(n) {
  try { return new Intl.NumberFormat('fa-AF').format(Number(n)); } catch (e) { return String(n || ''); }
}

function toPashtoDate(d) {
  try { return d ? new Date(d).toLocaleDateString('fa-AF') : ''; } catch (e) { return d || ''; }
}

function buildHtmlForSale(sale, vehicle, customer, fontB64, leftImgB64 = '', rightImgB64 = '') {
  const paymentCurrency = safeText(sale.paymentCurrency || 'افغانۍ');
  const sellingPriceNum = Number(sale.sellingPrice) || 0;
  const price = sale.sellingPrice ? toPashtoNumber(sale.sellingPrice) : '';
  const halfPrice = sellingPriceNum ? toPashtoNumber(sellingPriceNum / 2) : '';
  const downPayment = sale.downPayment ? toPashtoNumber(sale.downPayment) : '';
  const remaining = sale.remainingAmount ? toPashtoNumber(sale.remainingAmount) : '';
  const priceDiff = sale.priceDifference ? toPashtoNumber(sale.priceDifference) : '';
  const priceDiffBy = sale.priceDifferencePaidBy ? safeText(sale.priceDifferencePaidBy) : '';
  const trafficDate = sale.trafficTransferDate ? toPashtoDate(sale.trafficTransferDate) : '';
  const date = toPashtoDate(sale.saleDate);
  const typeKey = sale.saleType || 'Container One Key';
  const licensePersonName = safeText(sale.licensePersonName || '');

   // Exchange car price calculation
  let exchangeCarPriceNum = null;
  let exchangeCarPriceFormatted = '';
  const priceDiffNum = Number(sale.priceDifference) || 0;

  if (typeKey === 'Exchange Car' && sale.sellingPrice && sale.priceDifference) {
    if (sale.priceDifferencePaidBy === 'Seller') {
      exchangeCarPriceNum = Number(sale.sellingPrice) + priceDiffNum;
    } else {
      // Buyer pays the difference (default)
      exchangeCarPriceNum = Number(sale.sellingPrice) - priceDiffNum;
    }
    exchangeCarPriceFormatted = toPashtoNumber(exchangeCarPriceNum);
  }

  let serialNumber = safeText(
    sale.serialNumber ||
    sale.saleSerial ||
    sale.systemGeneratedNo ||
    (sale.saleId ? `S-${sale.saleId}` : `S-${Date.now()}`)
  );
  const bookVolume = safeText(sale.bookVolume || sale.volume || sale.jild);
  const pageNumber = safeText(sale.pageNumber || sale.page || sale.safha);

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
    name: safeText(sale.sellerName),
    father: safeText(sale.sellerFatherName),
    province: safeText(sale.sellerProvince),
    district: safeText(sale.sellerDistrict),
    village: safeText(sale.sellerVillage),
    address: safeText(sale.sellerAddress),
    id: safeText(sale.sellerIdNumber),
    phone: safeText(sale.sellerPhone)
  };

  const veh = {
    manufacturer: safeText(vehicle && vehicle.manufacturer),
    model: safeText(vehicle && vehicle.model),
    year: safeText(vehicle && vehicle.year),
    category: safeText(vehicle && vehicle.category),
    color: safeText(vehicle && vehicle.color),
    chassis: safeText(vehicle && vehicle.chassisNumber),
    engine: safeText(vehicle && vehicle.engineNumber),
    fuelType: safeText(vehicle && vehicle.fuelType),
    transmission: safeText(vehicle && vehicle.transmission),
    plate: safeText(vehicle && vehicle.plateNo),
    steering: safeText(vehicle && vehicle.steering),
    monolithic: safeText(vehicle && vehicle.monolithicCut),
    mileage: vehicle && vehicle.mileage ? toPashtoNumber(vehicle.mileage) : '',
    vehicleId: safeText(vehicle && vehicle.vehicleId),
    license: safeText(vehicle && vehicle.vehicleLicense)
  };

  const exch = {
    manufacturer: safeText(sale.exchVehicleManufacturer),
    model: safeText(sale.exchVehicleModel),
    year: safeText(sale.exchVehicleYear),
    category: safeText(sale.exchVehicleCategory),
    color: safeText(sale.exchVehicleColor),
    chassis: safeText(sale.exchVehicleChassis),
    engine: safeText(sale.exchVehicleEngine),
    fuelType: safeText(sale.exchVehicleFuelType),
    plate: safeText(sale.exchVehiclePlateNo),
    steering: safeText(sale.exchVehicleSteering),
    monolithic: safeText(sale.exchVehicleMonolithicCut),
    mileage: safeText(sale.exchVehicleMileage),
    license: safeText(sale.exchVehicleLicense)
  };

  // Setup Titles based on bill type
  let topSubtitle = 'نثاراحمد خپلواک 0700008982 - 0700008983';
  if (typeKey === 'Container One Key') topSubtitle = 'کانټینري یوه کليد موټر سند<br/>د دفتر شمیره: 0700008982 - 0700008983';
  if (typeKey === 'Licensed Car') topSubtitle = 'اسناد لرونکې موټر سند<br/>د دفتر شمیره: 0700008982 - 0700008983';
  if (typeKey === 'Exchange Car') topSubtitle = 'تبادله موټر سند<br/>د دفتر شمیره: 0700008982 - 0700008983';

  let customTermsHtml = '';
  
  if (typeKey === 'Exchange Car') {
    customTermsHtml = `
      <div class="terms-text">
        شرعي اقرار کوم چې دوي عراده موټران سره تبادله سول په طور سره ( ${price} ) (${paymentCurrency}) نیمایی ( ${halfPrice} ) و ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ) ته ورکړي
      </div>
      <ol class="terms-list">
        <li>د موټر تیر ترافیکي پیښې مسؤلیت د غلا ضمانت او پور له دغه تاریخ سه  ( ${date} ) په متبادله کوونکي اړه لري.</li>
        <li>د متبادله کوونکي په رضایت سودا صورت ونیو.</li>
        <li>موټران بعد له ټرایي څخه یو او بل ته فعال سره تسلیم سوه.</li>
        <li>باید طرفین یو د بله ضمانت سره واخلي ځکه موټر پلورنځی د دوی ضمانت په غاړه نلري.</li>
        <li>د رهنما کمیشن د تجارت د قانون سره سم اخیستل کیږي د معاملی د فسخه کیدلو په صورت کی کمیشن نه مسترد کیږي.</li>
        <li>د بیت المال د موټرانو د خرید او فروش څخه جداً معذرت غواړو.</li>
      </ol>
    `;
  } else if (typeKey === 'Container One Key') {
    customTermsHtml = `
      <div class="terms-text">
        شرعي اقرار کوم چې ذکر سوی موټر قیمت ( ${price} ) (${paymentCurrency}) چې نیمایي یې ( ${halfPrice} ) کیږي په لاندې شرایطو خرڅ سو.
      </div>
      <ol class="terms-list">
        <li>د ذکر سوي موټر د ترافیکي پیښې مسؤلیت تر دغه نیټې ( ${date} ) وروسته د رانیوونکي په غاړه دي.</li>
        <li>ذکر شوي موټر کوم قانوني اسناد نه لري فقط یوه کیلي ده.</li>
        <li>موټر چې مکمل چیک او ټرایي سو تر خط لیکلو وروسته رانیوونکی د شکایت حق نه لري.</li>
        <li>د ذکر سوي موټر د غلا مسؤلیت په خرڅوونکي پورې اړه لري.</li>
        <li>باید طرفین یو د بله ضمانت سره واخلي ځکه موټر پلورنځی د دوی ضمانت په غاړه نلري.</li>
        <li>پلورنځي فقط د شاهد په حیث خط ورته لیکي.</li>
        <li>د رهنما کمیشن د تجارت د قانون سره سم اخیستل کیږي د معاملی د فسخه کیدلو په صورت کی کمیشن نه مسترد کیږي.</li>
      </ol>
    `;
  } else {
    // Licensed Car
    customTermsHtml = `
      <div class="terms-text">
        شرعي اقرار کوم چې ذکر سوی موټر قیمت ( ${price} ) (${paymentCurrency}) چې نیمایي یې ( ${halfPrice} ) کیږي په لاندې شرایطو خرڅ سو.
      </div>
      <ol class="terms-list">
        <li>د موټر د اسنادو او قبالې په نوم کولو مصارف په رانیونکي پورې اړه لري.</li>
        <li>د موټر نمبر ترافیکي مسؤلیت د غلا ضمانت او پور تر دغه تاریخ ( ${date} ) په خرڅوونکي پورې اړه لري تر ذکر سوی تاریخ وروسته په رانیونکي پورې اړه لري.</li>
        <li>رانیوونکي موټر فعال ټرایي کړي او اسنادونه ورته تسلیم سول جانیبینو قناعت کړيدي چې بعداً دعوا یې د اعتبار وړ نده.</li>
        <li>باید طرفین یو د بله ضمانت سره واخلي ځکه موټر پلورنځی د دوی ضمانت په غاړه نلري.</li>
        <li>دا سند درې نقله لیکل کیږي چې یو نقل یې خرڅوونکي ته، بل یې رانیوونکي ته او یو نقل یې په دفتر کې قیدیږي.</li>
        <li>د رهنما کمیشن د تجارت د قانون سره سم اخیستل کیږي. د پښیمانۍ په صورت کې د موټر پلورنځي کمیشن نه مسترد کیږي.</li>
        <li>خرید او فروش د بیت المال د موټرانو څخه معذرت غواړو.</li>
      </ol>
    `;
  }

  // Generate the specific table layout based on sale type
  let tableHtml = '';
  let priceSectionHtml = '';
  
  if (typeKey === 'Exchange Car') {
    tableHtml = `
      <table class="data-table exchange-table">
        <thead>
          <tr>
            <th colspan="2">د متبادله کوونکي شهرت</th>
            <th colspan="2">د موټر شهرت</th>
            <th colspan="2">د متبادله کوونکي شهرت</th>
            <th colspan="2">د موټر شهرت</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="lbl">نوم</td><td class="val">${seller.name}</td><td class="lbl">نوع</td><td class="val">${veh.model}</td><td class="lbl">نوم</td><td class="val">${buyer.name}</td><td class="lbl">نوع</td><td class="val">${exch.manufacturer} ${exch.category}</td></tr>
          <tr><td class="lbl">د پلار نوم</td><td class="val">${seller.father}</td><td class="lbl">رنګ</td><td class="val">${veh.color}</td><td class="lbl">د پلار نوم</td><td class="val">${buyer.father}</td><td class="lbl">رنګ</td><td class="val">${exch.color}</td></tr>
          <tr><td class="lbl">ناحیه</td><td class="val">${seller.village}</td><td class="lbl">ماډل</td><td class="val">${veh.model}</td><td class="lbl">ناحیه</td><td class="val">${buyer.village}</td><td class="lbl">ماډل</td><td class="val">${exch.model}</td></tr>
          <tr><td class="lbl">ولسوالي</td><td class="val">${seller.district}</td><td class="lbl">انجن</td><td class="val">${veh.engine}</td><td class="lbl">ولسوالي</td><td class="val">${buyer.district}</td><td class="lbl">انجن</td><td class="val">${exch.engine}</td></tr>
          <tr><td class="lbl">ولایت</td><td class="val">${seller.province}</td><td class="lbl">کاټ یا روغ</td><td class="val">${veh.monolithic}</td><td class="lbl">ولایت</td><td class="val">${buyer.province}</td><td class="lbl">کاټ یا روغ</td><td class="val">${exch.monolithic}</td></tr>
          <tr><td class="lbl">فعلي سکونت</td><td class="val">${seller.address}</td><td class="lbl">پټرول / ډیزل</td><td class="val">${veh.fuelType}</td><td class="lbl">فعلي سکونت</td><td class="val">${buyer.address}</td><td class="lbl">پټرول / ډیزل</td><td class="val">${exch.fuelType}</td></tr>
          <tr><td class="lbl">د تذکرې نمبر</td><td class="val">${seller.id}</td><td class="lbl">شاسي</td><td class="val">${veh.chassis}</td><td class="lbl">د تذکرې نمبر</td><td class="val">${buyer.id}</td><td class="lbl">شاسي</td><td class="val">${exch.chassis}</td></tr>
          <tr><td class="lbl">د تلیفون شمیره</td><td class="val">${seller.phone}</td><td class="lbl">سند</td><td class="val">${veh.license}</td><td class="lbl">د تلیفون شمیره</td><td class="val">${buyer.phone}</td><td class="lbl">سند</td><td class="val">${exch.license}</td></tr>
        </tbody>
      </table>
    `;
    // Add price section for exchange car
    priceSectionHtml = `
      <div class="price-section">
        <div class="price-items">
          <span class="price-item"><span class="price-label">د پلورل شوي موټر قیمت:</span> <span class="price-value">${price} ${paymentCurrency}</span></span>
          <span class="price-item"><span class="price-label">د تبادلې موټر قیمت:</span> <span class="price-value">${exchangeCarPriceFormatted} ${paymentCurrency}</span></span>
          <span class="price-item"><span class="price-label">د قیمت توپیر:</span> <span class="price-value">${priceDiff} ${paymentCurrency}</span></span>
          <span class="price-item"><span class="price-label">د توپیر ادا کوونکی:</span> <span class="price-value">${priceDiffBy}</span></span>
        </div>
      </div>
    `;
  } else if (typeKey === 'Container One Key') {
    // Container One Key – no plate number
    tableHtml = `
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="2">د خرڅوونکي شهرت</th>
            <th colspan="2">د موټر مشخصات</th>
            <th colspan="2">د رانیوونکي شهرت</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="lbl">نوم</td><td class="val">${seller.name}</td><td class="lbl">نوع</td><td class="val">${veh.model}</td><td class="lbl">نوم</td><td class="val">${buyer.name}</td></tr>
          <tr><td class="lbl">د پلار نوم</td><td class="val">${seller.father}</td><td class="lbl">رنګ</td><td class="val">${veh.color}</td><td class="lbl">د پلار نوم</td><td class="val">${buyer.father}</td></tr>
          <tr><td class="lbl">ولایت</td><td class="val">${seller.province}</td><td class="lbl">ماډل</td><td class="val">${veh.model}</td><td class="lbl">ولایت</td><td class="val">${buyer.province}</td></tr>
          <tr><td class="lbl">ولسوالي</td><td class="val">${seller.district}</td><td class="lbl">انجن</td><td class="val">${veh.engine}</td><td class="lbl">ولسوالي</td><td class="val">${buyer.district}</td></tr>
          <tr><td class="lbl">ناحیه</td><td class="val">${seller.village}</td><td class="lbl">شاسي</td><td class="val">${veh.chassis}</td><td class="lbl">ناحیه</td><td class="val">${buyer.village}</td></tr>
          <tr><td class="lbl">فعلي سکونت</td><td class="val">${seller.address}</td><td class="lbl">پټرول / ډیزل</td><td class="val">${veh.fuelType}</td><td class="lbl">فعلي سکونت</td><td class="val">${buyer.address}</td></tr>
          <tr><td class="lbl">د تذکرې نمبر</td><td class="val">${seller.id}</td><td class="lbl">کټ یا روغ</td><td class="val">${veh.monolithic}</td><td class="lbl">د تذکرې نمبر</td><td class="val">${buyer.id}</td></tr>
          <tr><td class="lbl">د تلیفون شمیره</td><td class="val">${seller.phone}</td><td class="lbl"></td><td class="val"></td><td class="lbl">د تلیفون شمیره</td><td class="val">${buyer.phone}</td></tr>
        </tbody>
      </table>
    `;
  } else {
    // Licensed Car – with plate number
    tableHtml = `
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="2">د خرڅوونکي شهرت</th>
            <th colspan="2">د موټر مشخصات</th>
            <th colspan="2">د رانیوونکي شهرت</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="lbl">نوم</td><td class="val">${seller.name}</td><td class="lbl">جوازسیر په نامه</td><td class="val">${licensePersonName}</td><td class="lbl">نوم</td><td class="val">${buyer.name}</td></tr>
          <tr><td class="lbl">د پلار نوم</td><td class="val">${seller.father}</td><td class="lbl">د پلیټ شمیره</td><td class="val">${veh.plate}</td><td class="lbl">د پلار نوم</td><td class="val">${buyer.father}</td></tr>
          <tr><td class="lbl">ولایت</td><td class="val">${seller.province}</td><td class="lbl">نوع</td><td class="val">${veh.model}</td><td class="lbl">ولایت</td><td class="val">${buyer.province}</td></tr>
          <tr><td class="lbl">ولسوالي</td><td class="val">${seller.district}</td><td class="lbl">رنګ</td><td class="val">${veh.color}</td><td class="lbl">ولسوالي</td><td class="val">${buyer.district}</td></tr>
          <tr><td class="lbl">ناحیه</td><td class="val">${seller.village}</td><td class="lbl">ماډل</td><td class="val">${veh.year}</td><td class="lbl">ناحیه</td><td class="val">${buyer.village}</td></tr>
          <tr><td class="lbl">فعلي سکونت</td><td class="val">${seller.address}</td><td class="lbl">انجن</td><td class="val">${veh.engine} / ${veh.fuelType}</td><td class="lbl">فعلي سکونت</td><td class="val">${buyer.address}</td></tr>
          <tr><td class="lbl">د تذکرې نمبر</td><td class="val">${seller.id}</td><td class="lbl">شاسي</td><td class="val">${veh.chassis}</td><td class="lbl">د تذکرې نمبر</td><td class="val">${buyer.id}</td></tr>
          <tr><td class="lbl">د تلیفون شمیره</td><td class="val">${seller.phone}</td><td class="lbl">اشټرینګ</td><td class="val">${veh.steering}</td><td class="lbl">د تلیفون شمیره</td><td class="val">${buyer.phone}</td></tr>
        </tbody>
      </table>
    `;
  }

  // Add financial info for container/one key and licensed car
  if (typeKey !== 'Exchange Car') {
    priceSectionHtml = `
      <div class="price-section">
        <div class="price-items">
          <span class="price-item"><span class="price-label">د پلور قیمت:</span> <span class="price-value">${price} ${paymentCurrency}</span></span>
          ${downPayment ? `<span class="price-item"><span class="price-label">تحول سوی پیسي:</span> <span class="price-value">${downPayment} ${paymentCurrency}</span></span>` : ''}
          ${remaining ? `<span class="price-item"><span class="price-label">پاتې پیسي:</span> <span class="price-value">${remaining} ${paymentCurrency}</span></span>` : ''}
          ${trafficDate ? `<span class="price-item"><span class="price-label">د ټرافیک د لیږد نیټه:</span> <span class="price-value">${trafficDate}</span></span>` : ''}
        </div>
      </div>
    `;
  }

  const notesText = safeText(sale.notes);

  return `<!doctype html>
  <html lang="ps">
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: A4; margin: 0; }
      @font-face { font-family: 'BahijNazaninLocal'; src: url(data:font/truetype;charset=utf-8;base64,${fontB64}) format('truetype'); }
      
      * { box-sizing: border-box; }
      body { 
        font-family: 'BahijNazaninLocal', sans-serif; 
        direction: rtl; 
        margin: 0; 
        padding: 0;
        background: #fff; 
        color: #1e3a8a;
      }
      
      .page { 
        width: 210mm; 
        height: 297mm;
        padding: 6mm; 
        display: flex; 
        flex-direction: column; 
        overflow: hidden;
      }
      
      .border-wrapper {
        border: 4px solid #2563eb; 
        outline: 2px solid #2563eb;
        outline-offset: -10px;
        padding: 18px 16px;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #fff;
        position: relative;
        border-radius: 2px;
      }
      
      .inner-border {
        border: 1px solid #60a5fa;
        padding: 8px;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
      }

      .header-center { text-align: center; flex-grow: 1; }

      .main-title {
        font-size: 30px; font-weight: bolder; margin: 0;
        color: #1e40af; text-shadow: 1px 1px 0px #bfdbfe;
      }

      .sub-title { font-size: 22px; margin: 3px 0 0 0; font-weight: bold; color: #1e3a8a; }

      .highlight-badge {
        background: #93c5fd; color: #1e3a8a; padding: 2px 15px;
        border-radius: 20px; border: 1px solid #3b82f6;
        display: inline-block; margin-top: 3px;
      }

      .car-img { width: 150px; height: 90px; object-fit: contain; }

      .address-bar {
        background-color: #60a5fa; color: white; text-align: center;
        padding: 4px; font-size: 18px; font-weight: bold; border: 2px solid #3b82f6;
      }

      .meta-row {
        display: flex; justify-content: space-between;
        font-size: 16px; font-weight: bold; margin: 6px 0;
      }

      .red-text { color: #dc2626; font-size: 22px; font-weight: bold; }
      
      .data-table {
        width: 100%; border-collapse: collapse; table-layout: auto;
      }

      .data-table th {
        background-color: #60a5fa; color: white; border: 2px solid #2563eb;
        padding: 4px; font-size: 20px; font-weight: bold;
      }
        
      .data-table td {
        border: 1px solid #3b82f6; padding: 2px 4px; font-size: 16px;
        color: #1e3a8a; height: auto; vertical-align: middle;
        word-break: break-word; overflow-wrap: break-word;
      }
      
      .lbl {
        background-color: #eff6ff; font-weight: bold; white-space: nowrap;
      }
      
      .val { text-align: right; word-break: break-word; }
      
      .exchange-table td { font-size: 15px; padding: 1px 2px; }

      .price-section {
        background: #f0f9ff;
        border: 1px solid #3b82f6;
        border-radius: 6px;
        padding: 4px;
        margin: 4px 0;
      }

      .price-items {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        justify-content: center;
        align-items: center;
      }

      .price-item {
        font-size: 16px;
        font-weight: bold;
        white-space: nowrap;
      }

      .price-label {
        color: #1e40af;
      }

      .price-value {
        color: #1e3a8a;
      }

      .terms-section { flex-grow: 1; margin-top: 10px; }

      .terms-text {
        font-size: 18px; font-weight: bold; line-height: 1.2; margin-bottom: 8px;
      }

      .terms-list { padding-right: 25px; margin: 0; font-size: 18px; line-height: 1.2; }
      .terms-list li { margin-bottom: 4px; }

      .notes-text {
        font-size: 16px;
        line-height: 28px;                     /* space between lines */
        background: repeating-linear-gradient(
          to bottom,
          transparent,
          transparent 27px,
          #3b82f6 27px,
          #3b82f6 28px
        );
        padding: 4px 0;
        min-height: 28px;
        white-space: pre-wrap;                 /* preserve manual line breaks */
      }

      .signatures-container {
        display: flex; justify-content: space-between;
      }
        .footer-contact {
          font-size: 16px;
          text-align: center;
          color: #1e3a8a;
          padding-top: 4px;
          margin-top: 4px;
          border-top: 1px solid #3b82f6;
          direction: ltr;   /* keep contact info left‑to‑right even in RTL page */
        }

      .sig-box { text-align: center; font-size: 16px; font-weight: bold; width: 30%; }
      .sig-line { border-bottom: 1px solid #3b82f6; height: 50px; margin-bottom: 3px; }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="border-wrapper">
        <div class="inner-border">
          
          <div class="header">
            <img class="car-img" src="${rightImgB64 ? `data:image/jpeg;base64,${rightImgB64}` : ''}" alt="" />
            <div class="header-center">
              <h1 class="main-title">نیازي خپلواک موټر پلورنځي</h1>
              <div class="sub-title">${topSubtitle}</div>
            </div>
            <img class="car-img" src="${leftImgB64 ? `data:image/jpeg;base64,${leftImgB64}` : ''}" alt="" />
          </div>
          
          <div class="address-bar">
            ادرس: کندهار ښار احمدشاهی جاده، ګمرک ته مخامخ
          </div>

          <div class="meta-row">
            <div><span class="red-text">${serialNumber}</span></div>
            <div>نیټه: ${date}</div>
          </div>

          ${tableHtml}
          ${priceSectionHtml}

          <div class="terms-section">
            ${customTermsHtml}
            ${notesText ? `<div class="notes-label">نوټ: <span class="notes-text">${notesText}</span></div>` : ''}
          </div>

          <div class="signatures-container">
            <div class="sig-box">
              <div class="sig-line"></div>
              د خرڅوونکي ګوته / لاسلیک
              <div style="margin-top:5px; border-bottom:1px solid #3b82f6; height:20px;"></div>
               (${safeText(sale.witnessName1)})
            </div>
            <div class="sig-box">
              <div class="sig-line" style="border:none;"></div>
              د پلورنځي مهر او لاسلیک
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              د رانیوونکي ګوته / لاسلیک
              <div style="margin-top:5px; border-bottom:1px solid #3b82f6; height:20px;"></div>
               (${safeText(sale.witnessName2)})
            </div>
          </div>

        </div>
      </div>
      <div class="footer-contact">
        Email: info@niazikhpalwak.com | Website: niazikhpalwak.com | iOS App: Niazikhpalwak | Android App: Niazikhpalwak
      </div>
    </div>
  </body>
  </html>`;
}

async function findChromeExecutable() {
  const candidates = [
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser', '/usr/bin/chromium', '/snap/bin/chromium',
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

  // Load two car images from the same directory as this script
  const leftImgPath = path.join(__dirname, 'ford.jpg');  // or whatever filenames you used
  const rightImgPath = path.join(__dirname, 'lx600.jpg'); // rename accordingly

  let leftImgB64 = '';
  let rightImgB64 = '';

  try {
    if (fs.existsSync(leftImgPath)) {
      leftImgB64 = fs.readFileSync(leftImgPath).toString('base64');
    } else {
      console.warn('[pdf] Left car image not found at', leftImgPath);
    }
  } catch (e) {
    console.warn('[pdf] Failed to load left car image', e.message);
  }

  try {
    if (fs.existsSync(rightImgPath)) {
      rightImgB64 = fs.readFileSync(rightImgPath).toString('base64');
    } else {
      console.warn('[pdf] Right car image not found at', rightImgPath);
    }
  } catch (e) {
    console.warn('[pdf] Failed to load right car image', e.message);
  }

  const fontsDir = path.join(__dirname, '..', '..', 'fonts');
  const bahijPath = path.join(fontsDir, 'BahijNazanin.ttf');
  if (!fs.existsSync(bahijPath)) {
    throw new Error('BahijNazanin.ttf not found in backend/fonts');
  }
  const fontB64 = fs.readFileSync(bahijPath).toString('base64');

  const html = buildHtmlForSale(sale, vehicle, customer, fontB64, leftImgB64, rightImgB64);

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
    
    // Increase load timeout and explicitly remove scaling logic to respect the strict 210x297 CSS limit
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    await page.emulateMediaType('screen');

    try {
      await page.evaluate(async () => {
        if (!document.fonts || !document.fonts.ready) return;
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 1200)),
        ]);
      });
    } catch (e) {
      console.warn('[pdf] font load delay');
    }
    await new Promise((r) => setTimeout(r, 200));

    // Notice we removed your custom scaling block here. The rigid flexbox A4 CSS container 
    // now enforces the size natively, which prevents text stretching and pixelation.
    
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

// 2. Financial report PDF – NEW Puppeteer version (Pashto)
// ----------------------------------------------------------------------
function buildFinancialReportHtml(reportData, fontB64) {
  const { lang, summary, partnerBalances, ownerBalance, showroomBalance } = reportData;

  // ======= 1. Translations ========
  const t = {
    en: {
      company: 'Niazai Khpalwak Car Dealership',
      title: 'Financial Report',
      address: 'Kandahar, Spin Boldak General Road, Opposite Customs | Tel: 0700008983',
      income: 'Total Income',
      expenses: 'Total Expenses',
      netProfit: 'Net Profit',
      grossProfit: 'Gross Profit',
      commission: 'Commission',
      soldVehicles: 'Sold Vehicles',
      availableVehicles: 'Available Vehicles',
      showroomBalance: 'Showroom Balance',
      ownerBalance: 'Owner Balance',
      partnerShares: 'Partner Shares',
      currencies: ['AFN', 'USD', 'PKR', 'AED'],
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      direction: 'ltr',
    },
    ps: {
      company: 'نیازي خپلواک موټر پلورنځي',
      title: 'مالي راپور',
      address: 'کندهار، سپین بولدک عمومی سړک، ګمرک ته مخامخ | تلیفون: ۰۷۰۰۰۰۸۹۸۳',
      income: 'ټول عواید',
      expenses: 'ټول لګښتونه',
      netProfit: 'خالص ګټه',
      grossProfit: 'ناخالص ګټه',
      commission: 'کمیشن',
      soldVehicles: 'پلورل شوي موټرې',
      availableVehicles: 'موجود موټرې',
      showroomBalance: 'شوروم موجوده پیسه',
      ownerBalance: 'د خاوند ونډه',
      partnerShares: 'شریکانو برخه',
      currencies: ['افغانۍ', 'ډالر', 'پاکستانۍ کلدارې', 'درهم'],
      date: toPashtoDate(new Date()),
      direction: 'rtl',
    },
    dr: {
      company: 'موتر فروشی نیازی خپلواک',
      title: 'گزارش مالی',
      address: 'کندهار، جاده عمومی اسپین بولدک، مقابل گمرک | تلیفون: ۰۷۰۰۰۰۸۹۸۳',
      income: 'مجموع عواید',
      expenses: 'مجموع مصارف',
      netProfit: 'سود خالص',
      grossProfit: 'سود ناخالص',
      commission: 'کمیسیون',
      soldVehicles: 'موترهای فروخته شده',
      availableVehicles: 'موترهای موجود',
      showroomBalance: 'موجودی شوروم',
      ownerBalance: 'حصه مالک',
      partnerShares: 'حصه شرکا',
      currencies: ['افغانی', 'دالر', 'روپیه پاکستانی', 'درهم'],
      date: toPashtoDate(new Date()),
      direction: 'rtl',
    },
  }[lang] || {
    // Fallback English
    company: 'Niazai Khpalwak Car Dealership',
    title: 'Financial Report',
    address: 'Kandahar, Spin Boldak General Road, Opposite Customs | Tel: 0700008983',
    income: 'Total Income',
    expenses: 'Total Expenses',
    netProfit: 'Net Profit',
    grossProfit: 'Gross Profit',
    commission: 'Commission',
    soldVehicles: 'Sold Vehicles',
    availableVehicles: 'Available Vehicles',
    showroomBalance: 'Showroom Balance',
    ownerBalance: 'Owner Balance',
    partnerShares: 'Partner Shares',
    currencies: ['AFN', 'USD', 'PKR', 'AED'],
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    direction: 'ltr',
  };

  // ======= 2. Number formatting per language ========
  const fmtNumber = (value, currency = false) => {
    if (value === null || value === undefined) return '—';
    const num = Number(value);
    if (lang === 'en') {
      return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } else {
      // Pashto/Dari (use 'fa-AF' for Persian/Arabic digits)
      return toPashtoNumber(num);
    }
  };

  // ======= 3. Render one summary card with 4 currencies ========
  const renderCard = (label, values, icon, showCurrencies = true) => {
    if (!showCurrencies) {
      // For count-only boxes (sold, available)
      return `
      <div class="summary-card">
        <div class="summary-icon">${icon}</div>
        <div class="summary-label">${label}</div>
        <div class="summary-value">${fmtNumber(values.AFN)}</div>
      </div>`;
    }
    return `
    <div class="summary-card">
      <div class="summary-icon">${icon}</div>
      <div class="summary-label">${label}</div>
      <div class="summary-value">${fmtNumber(values.AFN)} <span class="currency">${t.currencies[0]}</span></div>
      <div class="sub-values">
        <span>${t.currencies[1]}: ${fmtNumber(values.USD)}</span> &nbsp;
        <span>${t.currencies[2]}: ${fmtNumber(values.PKR)}</span> &nbsp;
        <span>${t.currencies[3]}: ${fmtNumber(values.AED)}</span>
      </div>
    </div>`;
  };

  // ======= 4. Build all summary cards ========
  const cardData = [
    { key: 'totalIncome', label: t.income, icon: '💰' },
    { key: 'expenses', label: t.expenses, icon: '📉' },
    { key: 'grossProfit', label: t.grossProfit, icon: '📊' },
    { key: 'netProfit', label: t.netProfit, icon: '📈' },
    { key: 'commission', label: t.commission, icon: '🏷️' },
    { key: 'vehiclesSold', label: t.soldVehicles, icon: '🚗', noCurrency: true },
    { key: 'availableVehicles', label: t.availableVehicles, icon: '🚘', noCurrency: true },
  ];

  const summaryCards = cardData.map(card => {
    const values = {
      AFN: summary.AFN[card.key],
      USD: summary.USD[card.key],
      PKR: summary.PKR[card.key],
      AED: summary.AED[card.key],
    };
    return renderCard(card.label, values, card.icon, !card.noCurrency);
  }).join('');

  // ======= 5. Partner list (real balances) ========
  const partnerItems = partnerBalances.map(p => `
    <li>
      <span class="shared-name">${safeText(p.personName)}</span>
      <div class="shared-amounts">
        <span class="shared-amount">${t.currencies[0]}: ${fmtNumber(p.totalAFN)}</span>
        <span class="shared-amount">${t.currencies[1]}: ${fmtNumber(p.totalUSD)}</span>
        <span class="shared-amount">${t.currencies[2]}: ${fmtNumber(p.totalPKR)}</span>
        <span class="shared-amount">${t.currencies[3]}: ${fmtNumber(p.totalAED)}</span>
      </div>
    </li>`).join('');

  // ======= 6. Balance tables ========
  const showroomValues = showroomBalance;
  const ownerValues = ownerBalance;

  // ======= 7. Final HTML ========
  return `<!doctype html>
<html lang="${lang}" dir="${t.direction}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t.title}</title>
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
      direction: ${t.direction};
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
    .report-title { font-size: 18px; font-weight: 800; color: #f6dba9; margin-top: 4px; }
    .address { font-size: 14px; color: #94a3b8; margin-top: 6px; }
    .date-badge {
      position: absolute;
      ${t.direction === 'rtl' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 12px;
      background: rgba(255,255,255,0.15);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
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
    .summary-label { font-size: 16px; color: var(--primary); text-transform: uppercase; margin-bottom: 6px; }
    .summary-value { font-size: 18px; font-weight: 800; color: var(--primary); }
    .currency { font-size: 14px; font-weight: normal; color: var(--gray-text); }
    .sub-values {
      font-size: 14px;
      color: var(--primary);
      margin-top: 4px;
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .section-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--primary);
      margin: 20px 0 12px 0;
      padding-${t.direction === 'rtl' ? 'right' : 'left'}: 12px;
      border-${t.direction === 'rtl' ? 'right' : 'left'}: 4px solid var(--gold);
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
      text-align: ${t.direction === 'rtl' ? 'right' : 'left'};
      font-size: 14px;
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
      font-size: 14px;
    }
    .shared-name { font-weight: 700; }
    .shared-amounts {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .shared-amount { font-weight: 800; color: var(--warning); }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: var(--gray-text);
      border-top: 1px solid var(--border);
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="company">${t.company}</div>
      <div class="report-title">${t.title}</div>
      <div class="address">${t.address}</div>
      <div class="date-badge">${t.date}</div>
    </div>

    <div class="summary-grid">
      ${summaryCards}
    </div>

    <div class="section-title">${t.showroomBalance}</div>
    <table class="balance-table">
      <thead>
        <tr><th>توضیح</th><th>${t.currencies[0]}</th><th>${t.currencies[1]}</th><th>${t.currencies[2]}</th><th>${t.currencies[3]}</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${t.showroomBalance}</td>
          <td>${fmtNumber(showroomValues.AFN)}</td>
          <td>${fmtNumber(showroomValues.USD)}</td>
          <td>${fmtNumber(showroomValues.PKR)}</td>
          <td>${fmtNumber(showroomValues.AED)}</td>
        </tr>
        <tr>
          <td>${t.ownerBalance}</td>
          <td>${fmtNumber(ownerValues.AFN)}</td>
          <td>${fmtNumber(ownerValues.USD)}</td>
          <td>${fmtNumber(ownerValues.PKR)}</td>
          <td>${fmtNumber(ownerValues.AED)}</td>
        </tr>
      </tbody>
    </table>

    ${partnerBalances.length > 0 ? `
      <div class="section-title">${t.partnerShares}</div>
      <ul class="shared-list">
        ${partnerItems}
      </ul>
    ` : `<div style="margin: 12px 0; color: var(--gray-text);">${lang === 'en' ? 'No partners found' : 'هیڅ شریک نشته'}</div>`}

    <div class="footer">
      ${lang === 'en' ? 'This report is automatically generated by the showroom financial system.' : 'دا راپور د شوروم د مالیاتو د ثبت اتوماتیک سیسټم لخوا چاپ شوی دی.'}
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

// ================================================================
//  Vehicle PDF (Pashto) – Puppeteer
// ================================================================

const VEHICLE_FIELDS_PS = [
  { label: 'د موټر نمبر', key: 'vehicleId' },
  { label: 'ډول', key: 'category' },
  { label: 'جوړونکی', key: 'manufacturer' },
  { label: 'ماډل', key: 'model' },
  { label: 'کال', key: 'year' },
  { label: 'رنګ', key: 'color' },
  { label: 'چاسيس / VIN', key: 'chassisNumber' },
  { label: 'د انجن شمیره', key: 'engineNumber' },
  { label: 'د انجن ډول', key: 'engineType' },
  { label: 'د تیلو ډول', key: 'fuelType' },
  { label: 'ګیربکس', key: 'transmission' },
  { label: 'مسافه (km)', key: 'mileage' },
  { label: 'پلیټ شمیره', key: 'plateNo' },
  { label: 'د موټر جواز', key: 'vehicleLicense' },
  { label: 'سټیرینګ', key: 'steering' },
  { label: 'قطعه / برشي', key: 'monolithicCut' },
  { label: 'حالت', key: 'status' },
];

function buildVehicleHtml(vehicle, fontB64) {
  const rows = VEHICLE_FIELDS_PS.map(field => {
    const value = vehicle[field.key] != null ? String(vehicle[field.key]) : '—';
    return `<tr><td>${field.label}</td><td>${safeText(value)}</td></tr>`;
  }).join('');

  // Format selling price as integer with currency symbol
  const currency = vehicle.baseCurrency || 'AFN';
  const symbols = { AFN: '؋', USD: '$', PKR: '₨', AED: 'د.إ' };
  const symbol = symbols[currency] || '؋';
  const priceInt = vehicle.sellingPrice
    ? parseInt(vehicle.sellingPrice, 10).toLocaleString()
    : '—';

  // Add price row
  const priceRow = `<tr><td>د پلور قیمت</td><td>${symbol} ${priceInt}</td></tr>`;

  return `<!doctype html>
<html lang="ps" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>د موټر معلومات</title>
  <style>
    :root {
      --primary: #0f172a;
      --gold: #c8963e;
      --gray-text: #5b6474;
      --border: #e2e8f0;
      --panel: #f8fafc;
      --shadow: 0 10px 30px rgba(15,23,42,0.08);
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
    .report-title { font-size: 18px; color: #f6dba9; margin-top: 4px; }
    .address { font-size: 13px; color: #94a3b8; margin-top: 6px; }
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }
    .specs-table th, .specs-table td {
      border: 1px solid var(--border);
      padding: 5px 6px;
      text-align: right;
      font-size: 20px;
    }
    .specs-table th {
      background: #f1f5f9;
      font-weight: 800;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
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
      <div class="report-title">د موټر معلومات</div>
      <div class="address">کندهار، سپین بولدک عمومی سړک، ګمرک ته مخامخ | تلیفون: ۰۷۰۰۰۰۸۹۸۳</div>
    </div>
    <table class="specs-table">
      <thead>
        <tr><th>توضیح</th><th>مقدار</th></tr>
      </thead>
      <tbody>
        ${rows}
        ${priceRow}
      </tbody>
    </table>
    <div class="footer">
      دا سند د شوروم د مالیاتو د ثبت اتوماتیک سیسټم لخوا چاپ شوی دی.
    </div>
  </div>
</body>
</html>`;
}

async function generateVehiclePdf(vehicle, outputDir) {
  ensureDir(outputDir);
  const fileName = `vehicle_${vehicle.vehicleId || Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const fontsDir = path.join(__dirname, '..', '..', 'fonts');
  const bahijPath = path.join(fontsDir, 'BahijNazanin.ttf');
  if (!fs.existsSync(bahijPath)) {
    throw new Error('BahijNazanin.ttf not found in backend/fonts');
  }
  const fontB64 = fs.readFileSync(bahijPath).toString('base64');

  const html = buildVehicleHtml(vehicle, fontB64);

  let browser = null;
  const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];
  try {
    browser = await puppeteer.launch({ headless: 'new', args: launchArgs });
  } catch (err) {
    const chrome = await findChromeExecutable();
    if (!chrome) throw err;
    browser = await puppeteer.launch({ headless: 'new', executablePath: chrome, args: launchArgs });
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    await page.emulateMediaType('screen');
    await new Promise(r => setTimeout(r, 200));

    // Scale to fit A4 if needed
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
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
    });
    await browser.close();
    return { filePath, fileName };
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    throw err;
  }
}

module.exports = {
  generateSaleInvoicePdf,
  generateFinancialReportPdf,
  generateVehiclePdf,
};
