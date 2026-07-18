import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, I18nManager, Platform } from 'react-native';
import adminEn from '../locales/admin/en.json';
import adminPs from '../locales/admin/ps.json';
import adminPrs from '../locales/admin/prs.json';
import publicEn from '../locales/public/en.json';
import publicPs from '../locales/public/ps.json';
import publicPrs from '../locales/public/prs.json';

const nativeAlert = Alert.alert.bind(Alert);

const buildCanonicalCatalog = (englishSources, localizedSources) => {
  const catalog = {};
  const visit = (english, localized, path = []) => {
    if (typeof english === 'string') {
      const translated = typeof localized === 'string' ? localized : english;
      catalog[english] = translated;
      catalog[path.join('.')] = translated;
      return;
    }
    if (!english || typeof english !== 'object') return;
    Object.keys(english).forEach(key => visit(english[key], localized?.[key], [...path, key]));
  };
  englishSources.forEach((source, index) => visit(source, localizedSources[index]));
  return catalog;
};

const canonicalCatalogs = {
  en: buildCanonicalCatalog([adminEn, publicEn], [adminEn, publicEn]),
  ps: buildCanonicalCatalog([adminEn, publicEn], [adminPs, publicPs]),
  prs: buildCanonicalCatalog([adminEn, publicEn], [adminPrs, publicPrs]),
};

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', rtl: false },
  { code: 'ps', label: 'Pashto', nativeLabel: 'پښتو', rtl: true },
  { code: 'prs', label: 'Dari', nativeLabel: 'دری', rtl: true },
];

const translations = {
  en: {
    Home: 'Home', Cars: 'Cars', About: 'About', Contact: 'Contact', Dashboard: 'Dashboard', Vehicles: 'Vehicles', Customers: 'Customers', Sales: 'Sales', Employees: 'Employees', Attendance: 'Attendance', Payroll: 'Payroll', 'Showroom Ledger': 'Showroom Ledger', Currency: 'Currency', Reports: 'Reports', Users: 'Users', Settings: 'Settings',
    'Carousel CMS': 'Carousel CMS', 'About CMS': 'About CMS', 'Team CMS': 'Team CMS', Testimonials: 'Testimonials', 'Contact CMS': 'Contact CMS', 'Choose Video': 'Choose Video',
    'Welcome Back': 'Welcome Back', 'Sign in to your account': 'Sign in to your account', Username: 'Username', Password: 'Password', 'Sign In': 'Sign In', 'Signing In...': 'Signing In...', 'Car Showroom': 'Car Showroom', 'Niazi Khpalwak Car Selling v1.0': 'Niazi Khpalwak Car Selling v1.0',
    'Please enter both username and password': 'Please enter both username and password', 'Cannot connect to server. Please check your internet connection and try again.': 'Cannot connect to server. Please check your internet connection and try again.', 'Invalid username or password. Please try again.': 'Invalid username or password. Please try again.', 'Login failed. Please try again.': 'Login failed. Please try again.',
    Appearance: 'Appearance', 'Dark Mode': 'Dark Mode', 'Switch between light and dark': 'Switch between light and dark', 'Accent Color': 'Accent Color', Database: 'Database', 'App Name': 'App Name', Version: 'Version', Platform: 'Platform', Developer: 'Developer', 'Create Backup': 'Create Backup', 'Export database as SQL file': 'Export database as SQL file', 'Restore Database': 'Restore Database', 'Import from SQL backup file': 'Import from SQL backup file', 'Sign Out': 'Sign Out', User: 'User', Viewer: 'Viewer',
    'Select language': 'Select language', Language: 'Language', Cancel: 'Cancel', Restore: 'Restore', Success: 'Success', Error: 'Error', Loading: 'Loading...', Retry: 'Retry', Search: 'Search', Save: 'Save', Delete: 'Delete', Edit: 'Edit', Add: 'Add', Close: 'Close', 'No data found': 'No data found', 'Customer Details': 'Customer Details', 'Edit Vehicle': 'Edit Vehicle', 'New Vehicle': 'New Vehicle', 'Edit Loan': 'Edit Loan', 'New Loan': 'New Loan', 'Users & Roles': 'Users & Roles', 'Loans & Debts': 'Loans & Debts', 'Carousel Manager': 'Carousel Manager', 'Team Manager': 'Team Manager', 'Sale Detail': 'Sale Detail', 'Currency Exchange': 'Currency Exchange', 'Edit Attendance': 'Edit Attendance', 'New Attendance': 'New Attendance', 'Edit Customer': 'Edit Customer', 'New Customer': 'New Customer', 'Edit Employee': 'Edit Employee', 'New Employee': 'New Employee', 'Edit Entry': 'Edit Entry', 'New Entry': 'New Entry', 'Vehicle Detail': 'Vehicle Detail', 'About Manager': 'About Manager', 'Contact Manager': 'Contact Manager', 'Vehicle Not Found': 'Vehicle Not Found', 'Edit Sale': 'Edit Sale', 'New Sale': 'New Sale', 'Edit Payroll': 'Edit Payroll', 'New Payroll': 'New Payroll', 'Edit User': 'Edit User', 'New User': 'New User',
  },
  ps: {
    Home: 'کور', Cars: 'موټرونه', About: 'زموږ په اړه', Contact: 'اړیکه', Dashboard: 'ډشبورډ', Vehicles: 'موټرونه', Customers: 'پېرودونکي', Sales: 'پلورنې', Employees: 'کارکوونکي', Attendance: 'حاضري', Payroll: 'معاشونه', 'Showroom Ledger': 'د نندارتون حساب', Currency: 'د اسعارو تبادله', Reports: 'راپورونه', Users: 'کاروونکي', Settings: 'تنظیمات', 'Carousel CMS': 'د انځورونو مدیریت', 'About CMS': 'د پېژندنې مدیریت', 'Team CMS': 'د ټیم مدیریت', Testimonials: 'ستاینې', 'Contact CMS': 'د اړیکې مدیریت', 'Choose Video': 'ویډیو وټاکئ',
    'Welcome Back': 'بیا ښه راغلاست', 'Sign in to your account': 'خپل حساب ته ننوتل', Username: 'کارن نوم', Password: 'پټ نوم', 'Sign In': 'ننوتل', 'Signing In...': 'د ننوتلو په حال کې...', 'Car Showroom': 'د موټرو نندارتون', 'Niazi Khpalwak Car Selling v1.0': 'نیازي خلیلواک موټر پلورنه نسخه ۱.۰',
    'Please enter both username and password': 'مهرباني وکړئ کارن نوم او پټ نوم ولیکئ', 'Cannot connect to server. Please check your internet connection and try again.': 'له سرور سره اړیکه نشته. انټرنېټ وګورئ او بیا هڅه وکړئ.', 'Invalid username or password. Please try again.': 'کارن نوم یا پټ نوم ناسم دی. بیا هڅه وکړئ.', 'Login failed. Please try again.': 'ننوتل ناکام شول. بیا هڅه وکړئ.',
    Appearance: 'بڼه', 'Dark Mode': 'تیاره حالت', 'Switch between light and dark': 'د روښانه او تیاره حالت ترمنځ بدلون', 'Accent Color': 'د رنګ انتخاب', Database: 'ډیټابېس', 'App Name': 'د اپ نوم', Version: 'نسخه', Platform: 'پلېټفارم', Developer: 'پراختیاکوونکی', 'Create Backup': 'شاتړ جوړول', 'Export database as SQL file': 'ډیټابېس د SQL فایل په توګه صادرول', 'Restore Database': 'ډیټابېس بېرته راوستل', 'Import from SQL backup file': 'له SQL شاتړ فایل څخه راوستل', 'Sign Out': 'وتل', User: 'کاروونکی', Viewer: 'کتونکی', 'Select language': 'ژبه وټاکئ', Language: 'ژبه', Cancel: 'لغوه', Restore: 'بېرته راوستل', Success: 'بریالی', Error: 'تېروتنه', Loading: 'د لوډېدو په حال کې...', Retry: 'بیا هڅه', Search: 'لټون', Save: 'ساتل', Delete: 'ړنګول', Edit: 'سمول', Add: 'زیاتول', Close: 'بندول', 'No data found': 'هېڅ معلومات ونه موندل شول',
  },
  prs: {
    Home: 'خانه', Cars: 'موترها', About: 'درباره ما', Contact: 'تماس', Dashboard: 'داشبورد', Vehicles: 'موترها', Customers: 'مشتریان', Sales: 'فروشات', Employees: 'کارمندان', Attendance: 'حاضری', Payroll: 'معاشات', 'Showroom Ledger': 'دفتر حساب نمایشگاه', Currency: 'تبدیل اسعار', Reports: 'گزارش‌ها', Users: 'کاربران', Settings: 'تنظیمات', 'Carousel CMS': 'مدیریت تصاویر', 'About CMS': 'مدیریت درباره ما', 'Team CMS': 'مدیریت تیم', Testimonials: 'نظریات مشتریان', 'Contact CMS': 'مدیریت تماس', 'Choose Video': 'انتخاب ویدیو',
    'Welcome Back': 'خوش آمدید', 'Sign in to your account': 'به حساب خود وارد شوید', Username: 'نام کاربری', Password: 'رمز عبور', 'Sign In': 'ورود', 'Signing In...': 'در حال ورود...', 'Car Showroom': 'نمایشگاه موتر', 'Niazi Khpalwak Car Selling v1.0': 'فروش موتر نیازی خلوک نسخه ۱.۰',
    'Please enter both username and password': 'لطفاً نام کاربری و رمز عبور را وارد کنید', 'Cannot connect to server. Please check your internet connection and try again.': 'اتصال به سرور برقرار نشد. اینترنت خود را بررسی و دوباره تلاش کنید.', 'Invalid username or password. Please try again.': 'نام کاربری یا رمز عبور نادرست است. دوباره تلاش کنید.', 'Login failed. Please try again.': 'ورود ناموفق بود. دوباره تلاش کنید.',
    Appearance: 'ظاهر', 'Dark Mode': 'حالت تاریک', 'Switch between light and dark': 'تغییر بین حالت روشن و تاریک', 'Accent Color': 'رنگ تأکیدی', Database: 'دیتابیس', 'App Name': 'نام برنامه', Version: 'نسخه', Platform: 'پلتفرم', Developer: 'توسعه‌دهنده', 'Create Backup': 'ایجاد نسخه پشتیبان', 'Export database as SQL file': 'صدور دیتابیس به‌صورت فایل SQL', 'Restore Database': 'بازیابی دیتابیس', 'Import from SQL backup file': 'وارد کردن از فایل پشتیبان SQL', 'Sign Out': 'خروج', User: 'کاربر', Viewer: 'مشاهده‌کننده', 'Select language': 'زبان را انتخاب کنید', Language: 'زبان', Cancel: 'لغو', Restore: 'بازیابی', Success: 'موفق', Error: 'خطا', Loading: 'در حال بارگذاری...', Retry: 'تلاش دوباره', Search: 'جستجو', Save: 'ذخیره', Delete: 'حذف', Edit: 'ویرایش', Add: 'افزودن', Close: 'بستن', 'No data found': 'معلوماتی یافت نشد',
  },
};

// Shared labels used throughout the public site and back-office forms. Keeping
// these as complete phrases lets existing screens pass their English labels to
// t() without duplicating language logic in each input component.
Object.assign(translations.en, {
  'Search...': 'Search...', 'Pull down to refresh': 'Pull down to refresh', Confirm: 'Confirm', 'Are you sure?': 'Are you sure?',
  'About Us': 'About Us', 'Contact Us': 'Contact Us', 'Our Brands': 'Our Brands', 'Our Team': 'Our Team', 'Why Choose Us?': 'Why Choose Us?',
  'Trusted & Licensed': 'Trusted & Licensed', 'Transparent Pricing': 'Transparent Pricing', 'Car Exchange': 'Car Exchange', 'Easy Financing': 'Easy Financing', 'After-Sale Support': 'After-Sale Support',
  'All vehicles with proper documentation and legal verification.': 'All vehicles with proper documentation and legal verification.', 'Clear pricing in AFN, USD, and PKR — no hidden fees.': 'Clear pricing in AFN, USD, and PKR — no hidden fees.', 'Trade in your vehicle for a better one with fair valuation.': 'Trade in your vehicle for a better one with fair valuation.', 'Flexible installment plans and loan options available.': 'Flexible installment plans and loan options available.', 'Ongoing support and maintenance guidance after purchase.': 'Ongoing support and maintenance guidance after purchase.',
  'We\'re here to help you': 'We\'re here to help you', Phone: 'Phone', WhatsApp: 'WhatsApp', Email: 'Email', Address: 'Address', 'Weekday Hours': 'Weekday Hours', 'Friday Hours': 'Friday Hours', 'Find Us On': 'Find Us On', 'No contact info available': 'No contact info available',
  'Could not load content. Check your connection.': 'Could not load content. Check your connection.', 'Could not load contact information.': 'Could not load contact information.', 'Vehicle not found': 'Vehicle not found', 'Share Vehicle': 'Share Vehicle', 'Call Now': 'Call Now', 'Send Email': 'Send Email', 'Vehicle Specifications': 'Vehicle Specifications', Engine: 'Engine', Fuel: 'Fuel', Mileage: 'Mileage', Plate: 'Plate', Chassis: 'Chassis', License: 'License', Available: 'Available', Sold: 'Sold', Reserved: 'Reserved', 'Under Repair': 'Under Repair', Left: 'Left', Right: 'Right', Auto: 'Auto', Petrol: 'Petrol',
  'Loading Showroom...': 'Loading Showroom...', 'Connection Error': 'Connection Error', 'Could not connect to the server.': 'Could not connect to the server.', 'Please check your internet connection.': 'Please check your internet connection.', 'Premium Car Showroom & Dealership': 'Premium Car Showroom & Dealership', 'Search brand, model, year...': 'Search brand, model, year...', 'No matches': 'No matches', 'Our Vehicles': 'Our Vehicles', 'View All': 'View All', 'No vehicles in this category': 'No vehicles in this category', 'See Our Showroom': 'See Our Showroom', 'Why Choose Us': 'Why Choose Us', 'Our Services': 'Our Services', 'Read More': 'Read More', 'Client Reviews': 'Client Reviews', 'Ready to Find Your Car?': 'Ready to Find Your Car?', 'Contact our experts for the best deal': 'Contact our experts for the best deal', 'Find Us': 'Find Us', 'All Cars': 'All Cars', Container: 'Container', Licensed: 'Licensed', 'Verified Cars': 'Verified Cars', 'Best Prices': 'Best Prices', '24/7 Support': '24/7 Support', 'Easy Docs': 'Easy Docs', Inspection: 'Inspection', Documentation: 'Documentation', Exchange: 'Exchange', Delivery: 'Delivery', Finance: 'Finance', 'After-Sale': 'After-Sale',
  'Personal Information': 'Personal Information', Location: 'Location', 'Initial Balances': 'Initial Balances', 'Full Name': 'Full Name', "Father's Name": "Father's Name", 'Phone Number': 'Phone Number', 'National ID (Tazkira)': 'National ID (Tazkira)', 'Customer Type': 'Customer Type', Province: 'Province', District: 'District', Village: 'Village', 'Current Address': 'Current Address', 'Original Address': 'Original Address', Notes: 'Notes', 'Vehicle Identity': 'Vehicle Identity', Specifications: 'Specifications', Manufacturer: 'Manufacturer', Model: 'Model', Year: 'Year', Category: 'Category', Color: 'Color', 'Chassis / VIN': 'Chassis / VIN', 'Engine Number': 'Engine Number', 'Engine Type': 'Engine Type', 'Fuel Type': 'Fuel Type', Transmission: 'Transmission', 'Mileage (km)': 'Mileage (km)', 'Plate No': 'Plate No', 'Vehicle License': 'Vehicle License', Steering: 'Steering', Status: 'Status', Description: 'Description', Date: 'Date', Amount: 'Amount', Currency: 'Currency', 'Loan Details': 'Loan Details', 'Loan Type': 'Loan Type', 'Person Name': 'Person Name', 'Due Date': 'Due Date', 'Account Details': 'Account Details', 'Role & Permissions': 'Role & Permissions', Role: 'Role', 'Monthly Salary': 'Monthly Salary', 'Joining Date': 'Joining Date', 'Employment Details': 'Employment Details', 'Present Days': 'Present Days', 'Absent Days': 'Absent Days', 'Total Days': 'Total Days', 'Attendance Rate': 'Attendance Rate', 'Ledger Entry': 'Ledger Entry', 'Entry Type': 'Entry Type', 'Payment Amount (AFN) *': 'Payment Amount (AFN) *',
});
Object.assign(translations.ps, {
  'Search...': 'لټون...', 'Pull down to refresh': 'د تازه کولو لپاره ښکته کش کړئ', Confirm: 'تایید', 'Are you sure?': 'ایا ډاډه یاست؟',
  'About Us': 'زموږ په اړه', 'Contact Us': 'موږ سره اړیکه', 'Our Brands': 'زموږ برانډونه', 'Our Team': 'زموږ ټیم', 'Why Choose Us?': 'ولې موږ غوره کړئ؟', 'Trusted & Licensed': 'باوري او جواز لرونکي', 'Transparent Pricing': 'روښانه بیې', 'Car Exchange': 'د موټر تبادله', 'Easy Financing': 'اسانه تمویل', 'After-Sale Support': 'له پلور وروسته ملاتړ',
  'All vehicles with proper documentation and legal verification.': 'ټول موټرونه د بشپړو اسنادو او قانوني تایید سره دي.', 'Clear pricing in AFN, USD, and PKR — no hidden fees.': 'په افغانیو، ډالرو او کلدارو کې روښانه بیې؛ پټ لګښت نشته.', 'Trade in your vehicle for a better one with fair valuation.': 'خپل موټر د عادلانه ارزونې سره په غوره موټر بدل کړئ.', 'Flexible installment plans and loan options available.': 'انعطاف منونکي قسطونه او د پور انتخابونه شته.', 'Ongoing support and maintenance guidance after purchase.': 'له پېرود وروسته دوامداره ملاتړ او د ساتنې لارښوونه.',
  'We\'re here to help you': 'موږ ستاسو د مرستې لپاره یو', Phone: 'تلیفون', WhatsApp: 'واټس‌اپ', Email: 'برېښنالیک', Address: 'پته', 'Weekday Hours': 'د کاري ورځو وخت', 'Friday Hours': 'د جمعې وخت', 'Find Us On': 'موږ دلته ومومئ', 'No contact info available': 'د اړیکې معلومات نشته',
  'Could not load content. Check your connection.': 'محتوا پورته نه شوه. اړیکه وګورئ.', 'Could not load contact information.': 'د اړیکې معلومات پورته نه شول.', 'Vehicle not found': 'موټر ونه موندل شو', 'Share Vehicle': 'موټر شریک کړئ', 'Call Now': 'اوس زنګ ووهئ', 'Send Email': 'برېښنالیک واستوئ', 'Vehicle Specifications': 'د موټر ځانګړنې', Engine: 'انجن', Fuel: 'تیل', Mileage: 'مایلج', Plate: 'پلېټ', Chassis: 'شاسي', License: 'جواز', Available: 'موجود', Sold: 'پلورل شوی', Reserved: 'ساتل شوی', 'Under Repair': 'د ترمیم لاندې', Left: 'چپ', Right: 'راست', Auto: 'اتومات', Petrol: 'پټرول',
  'Loading Showroom...': 'نندارتون لوډېږي...', 'Connection Error': 'د اړیکې تېروتنه', 'Could not connect to the server.': 'له سرور سره اړیکه ونه شوه.', 'Please check your internet connection.': 'مهرباني وکړئ انټرنېټ وګورئ.', 'Premium Car Showroom & Dealership': 'د لوړ کیفیت موټرو نندارتون او پلورنځی', 'Search brand, model, year...': 'برانډ، ماډل، کال ولټوئ...', 'No matches': 'پایله نشته', 'Our Vehicles': 'زموږ موټرونه', 'View All': 'ټول وګورئ', 'No vehicles in this category': 'په دې کټګورۍ کې موټر نشته', 'See Our Showroom': 'زموږ نندارتون وګورئ', 'Why Choose Us': 'ولې موږ غوره کړئ', 'Our Services': 'زموږ خدمتونه', 'Read More': 'نور ولولئ', 'Client Reviews': 'د پېرودونکو نظرونه', 'Ready to Find Your Car?': 'خپل موټر موندلو ته چمتو یاست؟', 'Contact our experts for the best deal': 'د غوره معاملې لپاره زموږ له کارپوهانو سره اړیکه ونیسئ', 'Find Us': 'موږ ومومئ', 'All Cars': 'ټول موټرونه', Container: 'کانټینر', Licensed: 'جواز لرونکي', 'Verified Cars': 'تایید شوي موټرونه', 'Best Prices': 'غوره بیې', '24/7 Support': '۲۴/۷ ملاتړ', 'Easy Docs': 'اسانه اسناد', Inspection: 'کتنه', Documentation: 'اسناد', Exchange: 'تبادله', Delivery: 'رسونه', Finance: 'تمویل', 'After-Sale': 'له پلور وروسته',
  'Personal Information': 'شخصي معلومات', Location: 'ځای', 'Initial Balances': 'لومړنۍ بیلانسونه', 'Full Name': 'بشپړ نوم', "Father's Name": 'د پلار نوم', 'Phone Number': 'د تلیفون شمېره', 'National ID (Tazkira)': 'تذکره', 'Customer Type': 'د پېرودونکي ډول', Province: 'ولایت', District: 'ولسوالي', Village: 'کلی', 'Current Address': 'اوسنۍ پته', 'Original Address': 'اصلي پته', Notes: 'یادښتونه', 'Vehicle Identity': 'د موټر پېژندنه', Specifications: 'ځانګړنې', Manufacturer: 'جوړوونکی', Model: 'ماډل', Year: 'کال', Category: 'کټګوري', Color: 'رنګ', 'Chassis / VIN': 'شاسي / VIN', 'Engine Number': 'د انجن شمېره', 'Engine Type': 'د انجن ډول', 'Fuel Type': 'د تیلو ډول', Transmission: 'ګیر', 'Mileage (km)': 'مایلج (کیلومتر)', 'Plate No': 'د پلېټ شمېره', 'Vehicle License': 'د موټر جواز', Steering: 'سټیرینګ', Status: 'حالت', Description: 'تشریح', Date: 'نېټه', Amount: 'اندازه', Currency: 'اسعار', 'Loan Details': 'د پور معلومات', 'Loan Type': 'د پور ډول', 'Person Name': 'د شخص نوم', 'Due Date': 'د ورکړې نېټه', 'Account Details': 'د حساب معلومات', 'Role & Permissions': 'دنده او صلاحیتونه', Role: 'دنده', 'Monthly Salary': 'میاشتنی معاش', 'Joining Date': 'د پیلېدو نېټه', 'Employment Details': 'د کار معلومات', 'Present Days': 'حاضرې ورځې', 'Absent Days': 'غایبې ورځې', 'Total Days': 'ټولې ورځې', 'Attendance Rate': 'د حاضرۍ کچه', 'Ledger Entry': 'حسابي ثبت', 'Entry Type': 'د ثبت ډول', 'Payment Amount (AFN) *': 'د تادیې اندازه (افغانی) *',
});
Object.assign(translations.prs, {
  'Search...': 'جستجو...', 'Pull down to refresh': 'برای تازه‌سازی به پایین بکشید', Confirm: 'تأیید', 'Are you sure?': 'آیا مطمئن هستید؟',
  'About Us': 'درباره ما', 'Contact Us': 'تماس با ما', 'Our Brands': 'برندهای ما', 'Our Team': 'تیم ما', 'Why Choose Us?': 'چرا ما را انتخاب کنید؟', 'Trusted & Licensed': 'قابل اعتماد و دارای جواز', 'Transparent Pricing': 'قیمت‌گذاری شفاف', 'Car Exchange': 'تبادل موتر', 'Easy Financing': 'تمویل آسان', 'After-Sale Support': 'پشتیبانی پس از فروش',
  'All vehicles with proper documentation and legal verification.': 'تمام موترها دارای اسناد کامل و تأیید قانونی هستند.', 'Clear pricing in AFN, USD, and PKR — no hidden fees.': 'قیمت روشن به افغانی، دالر و کلدار؛ بدون هزینه پنهان.', 'Trade in your vehicle for a better one with fair valuation.': 'موتر خود را با ارزیابی منصفانه با موتر بهتر تبدیل کنید.', 'Flexible installment plans and loan options available.': 'طرح‌های قسطی انعطاف‌پذیر و گزینه‌های قرض موجود است.', 'Ongoing support and maintenance guidance after purchase.': 'پشتیبانی دوامدار و راهنمای نگهداری پس از خرید.',
  'We\'re here to help you': 'ما برای کمک به شما اینجا هستیم', Phone: 'تیلفون', WhatsApp: 'واتس‌اپ', Email: 'ایمیل', Address: 'آدرس', 'Weekday Hours': 'ساعات روزهای کاری', 'Friday Hours': 'ساعات جمعه', 'Find Us On': 'ما را در اینجا بیابید', 'No contact info available': 'معلومات تماس موجود نیست',
  'Could not load content. Check your connection.': 'محتوا بارگذاری نشد. اتصال را بررسی کنید.', 'Could not load contact information.': 'معلومات تماس بارگذاری نشد.', 'Vehicle not found': 'موتر یافت نشد', 'Share Vehicle': 'اشتراک‌گذاری موتر', 'Call Now': 'اکنون تماس بگیرید', 'Send Email': 'ارسال ایمیل', 'Vehicle Specifications': 'مشخصات موتر', Engine: 'انجن', Fuel: 'سوخت', Mileage: 'کارکرد', Plate: 'پلیت', Chassis: 'شاسی', License: 'جواز', Available: 'موجود', Sold: 'فروخته‌شده', Reserved: 'رزرو شده', 'Under Repair': 'در حال ترمیم', Left: 'چپ', Right: 'راست', Auto: 'اتومات', Petrol: 'پترول',
  'Loading Showroom...': 'نمایشگاه در حال بارگذاری...', 'Connection Error': 'خطای اتصال', 'Could not connect to the server.': 'اتصال به سرور برقرار نشد.', 'Please check your internet connection.': 'لطفاً اتصال اینترنت خود را بررسی کنید.', 'Premium Car Showroom & Dealership': 'نمایشگاه و فروشگاه موترهای ممتاز', 'Search brand, model, year...': 'برند، مدل، سال را جستجو کنید...', 'No matches': 'نتیجه‌ای یافت نشد', 'Our Vehicles': 'موترهای ما', 'View All': 'مشاهده همه', 'No vehicles in this category': 'در این دسته موتر موجود نیست', 'See Our Showroom': 'نمایشگاه ما را ببینید', 'Why Choose Us': 'چرا ما را انتخاب کنید', 'Our Services': 'خدمات ما', 'Read More': 'بیشتر بخوانید', 'Client Reviews': 'نظریات مشتریان', 'Ready to Find Your Car?': 'آماده یافتن موتر خود هستید؟', 'Contact our experts for the best deal': 'برای بهترین معامله با کارشناسان ما تماس بگیرید', 'Find Us': 'ما را بیابید', 'All Cars': 'تمام موترها', Container: 'کانتینر', Licensed: 'دارای جواز', 'Verified Cars': 'موترهای تأییدشده', 'Best Prices': 'بهترین قیمت‌ها', '24/7 Support': 'پشتیبانی ۲۴/۷', 'Easy Docs': 'اسناد آسان', Inspection: 'بازرسی', Documentation: 'اسناد', Exchange: 'تبدیل', Delivery: 'تحویل', Finance: 'تمویل', 'After-Sale': 'پس از فروش',
  'Personal Information': 'معلومات شخصی', Location: 'موقعیت', 'Initial Balances': 'بیلانس‌های ابتدایی', 'Full Name': 'نام کامل', "Father's Name": 'نام پدر', 'Phone Number': 'شماره تیلفون', 'National ID (Tazkira)': 'تذکره', 'Customer Type': 'نوع مشتری', Province: 'ولایت', District: 'ولسوالی', Village: 'قریه', 'Current Address': 'آدرس فعلی', 'Original Address': 'آدرس اصلی', Notes: 'یادداشت‌ها', 'Vehicle Identity': 'هویت موتر', Specifications: 'مشخصات', Manufacturer: 'سازنده', Model: 'مدل', Year: 'سال', Category: 'دسته‌بندی', Color: 'رنگ', 'Chassis / VIN': 'شاسی / VIN', 'Engine Number': 'شماره انجن', 'Engine Type': 'نوع انجن', 'Fuel Type': 'نوع سوخت', Transmission: 'گیربکس', 'Mileage (km)': 'کارکرد (کیلومتر)', 'Plate No': 'شماره پلیت', 'Vehicle License': 'جواز موتر', Steering: 'فرمان', Status: 'وضعیت', Description: 'توضیحات', Date: 'تاریخ', Amount: 'مقدار', Currency: 'اسعار', 'Loan Details': 'جزئیات قرض', 'Loan Type': 'نوع قرض', 'Person Name': 'نام شخص', 'Due Date': 'تاریخ پرداخت', 'Account Details': 'جزئیات حساب', 'Role & Permissions': 'نقش و صلاحیت‌ها', Role: 'نقش', 'Monthly Salary': 'معاش ماهانه', 'Joining Date': 'تاریخ شروع', 'Employment Details': 'جزئیات کار', 'Present Days': 'روزهای حاضر', 'Absent Days': 'روزهای غایب', 'Total Days': 'مجموع روزها', 'Attendance Rate': 'نرخ حاضری', 'Ledger Entry': 'ثبت حساب', 'Entry Type': 'نوع ثبت', 'Payment Amount (AFN) *': 'مقدار پرداخت (افغانی) *',
});

Object.assign(translations.ps, {
  All: 'ټول', 'Car Inventory': 'د موټرو لېست', of: 'له', vehicles: 'موټرونه', 'Search brand, model, ID...': 'برانډ، ماډل یا پېژند لټون کړئ...', 'Clear All': 'ټول پاک کړئ', 'Loading vehicles...': 'موټرونه لوډېږي...', 'Could not load vehicles.': 'موټرونه پورته نه شول.', 'No vehicles found': 'هیڅ موټر ونه موندل شو', 'Try adjusting your search or filters': 'لټون یا فلټرونه بدل کړئ', 'Filter Vehicles': 'موټرونه فلټر کړئ', Brand: 'برانډ', 'e.g. Corolla, Civic...': 'لکه Corolla، Civic...', 'Price Range (AFN)': 'د بیې حد (افغانی)', 'Min price': 'لږه بیه', 'Max price': 'لوړه بیه', Reset: 'بیا تنظیم', 'Apply Filters': 'فلټرونه پلي کړئ', 'Sort By': 'ترتیب له مخې', 'Newest First': 'لومړی نوي', 'Price: Low to High': 'بیه: له ټیټې لوړې ته', 'Price: High to Low': 'بیه: له لوړې ټیټې ته', 'Year: Newest': 'کال: نوي', 'Year: Oldest': 'کال: زاړه', Premium: 'لوړ کیفیت', 'In Stock': 'په زېرمه کې', 'Cars Sold': 'پلورل شوي موټرونه', 'Happy Clients': 'راضي پېرودونکي', 'Yrs Experience': 'د تجربې کلونه', 'Take a virtual tour of our premium fleet': 'د زموږ د غوره موټرو مجازي لیدنه وکړئ', 'Tap to Watch': 'د لیدو لپاره ټک وکړئ', 'Your trusted car showroom in Afghanistan, offering premium vehicles at competitive prices.': 'ستاسو باوري د موټرو نندارتون په افغانستان کې، له سیال بیو سره غوره موټرونه وړاندې کوي.', 'About Niazi Khpalwak': 'د نیازي خلیلواک په اړه', 'Your trusted destination for buying, selling, and exchanging quality vehicles in Afghanistan.': 'په افغانستان کې د کیفیت لرونکو موټرو د پېرود، پلور او تبادلې باوري ځای.', 'Vehicle Details': 'د موټر معلومات', Price: 'بیه', Share: 'شریکول', 'Check out our showroom!': 'زموږ نندارتون وګورئ!',
});
Object.assign(translations.prs, {
  All: 'همه', 'Car Inventory': 'فهرست موترها', of: 'از', vehicles: 'موتر', 'Search brand, model, ID...': 'برند، مدل یا شناسه را جستجو کنید...', 'Clear All': 'پاک کردن همه', 'Loading vehicles...': 'موترها در حال بارگذاری...', 'Could not load vehicles.': 'موترها بارگذاری نشدند.', 'No vehicles found': 'هیچ موتری یافت نشد', 'Try adjusting your search or filters': 'جستجو یا فیلترها را تغییر دهید', 'Filter Vehicles': 'فیلتر موترها', Brand: 'برند', 'e.g. Corolla, Civic...': 'مثلاً Corolla، Civic...', 'Price Range (AFN)': 'محدوده قیمت (افغانی)', 'Min price': 'کمترین قیمت', 'Max price': 'بیشترین قیمت', Reset: 'بازنشانی', 'Apply Filters': 'اعمال فیلترها', 'Sort By': 'ترتیب بر اساس', 'Newest First': 'ابتدا جدیدترین', 'Price: Low to High': 'قیمت: کم به زیاد', 'Price: High to Low': 'قیمت: زیاد به کم', 'Year: Newest': 'سال: جدیدترین', 'Year: Oldest': 'سال: قدیمی‌ترین', Premium: 'ممتاز', 'In Stock': 'در موجودی', 'Cars Sold': 'موترهای فروخته‌شده', 'Happy Clients': 'مشتریان راضی', 'Yrs Experience': 'سال تجربه', 'Take a virtual tour of our premium fleet': 'از موترهای ممتاز ما بازدید مجازی کنید', 'Tap to Watch': 'برای تماشا لمس کنید', 'Your trusted car showroom in Afghanistan, offering premium vehicles at competitive prices.': 'نمایشگاه بااعتماد شما در افغانستان با موترهای ممتاز و قیمت‌های رقابتی.', 'About Niazi Khpalwak': 'درباره نیازی خلوک', 'Your trusted destination for buying, selling, and exchanging quality vehicles in Afghanistan.': 'مکان بااعتماد شما برای خرید، فروش و تبادل موترهای باکیفیت در افغانستان.', 'Vehicle Details': 'جزئیات موتر', Price: 'قیمت', Share: 'اشتراک‌گذاری', 'Check out our showroom!': 'از نمایشگاه ما دیدن کنید!',
});

Object.assign(translations.ps, {
  'Good Morning': 'سهار مو پخیر', 'Good Afternoon': 'ماسپښین مو پخیر', 'Good Evening': 'ماښام مو پخیر',
  "Here's your business overview": 'دا ستاسو د سوداګرۍ لنډیز دی', 'This Month Overview': 'د روانې میاشتې لنډیز',
  'Monthly Sales': 'میاشتنۍ پلورنې', 'Monthly Revenue': 'میاشتنی عاید', 'Financial Overview': 'مالي لنډیز',
  'Revenue (AFN)': 'عاید (افغانۍ)', 'Profit (AFN)': 'ګټه (افغانۍ)', 'Showroom Bal': 'د نندارتون بیلانس',
  'Owner Profit': 'د مالک ګټه', Inventory: 'زېرمتون', Commissions: 'کمېشنونه', 'Recent Sales': 'وروستۍ پلورنې',
  'No sales yet': 'تر اوسه پلورنه نشته', 'Inventory Status': 'د زېرمتون حالت', 'Quick Actions': 'چټک کارونه',
  Customer: 'پېرودونکی', 'Open Loans': 'خلاص پورونه', 'Access Preview': 'د لاسرسي مخکتنه',
  'Core Cost': 'اصلي لګښت', 'Core Cost (AFN)': 'اصلي لګښت (افغانۍ)', 'Total Cost (AFN)': 'ټول لګښت (افغانۍ)',
  'Expected Profit': 'اټکلي ګټه', 'Expected Profit (AFN)': 'اټکلي ګټه (افغانۍ)', 'Additional Costs': 'اضافي لګښتونه',
});
Object.assign(translations.prs, {
  'Good Morning': 'صبح بخیر', 'Good Afternoon': 'بعد از ظهر بخیر', 'Good Evening': 'شام بخیر',
  "Here's your business overview": 'این خلاصه تجارت شما است', 'This Month Overview': 'خلاصه ماه جاری',
  'Monthly Sales': 'فروشات ماهانه', 'Monthly Revenue': 'عاید ماهانه', 'Financial Overview': 'خلاصه مالی',
  'Revenue (AFN)': 'عاید (افغانی)', 'Profit (AFN)': 'مفاد (افغانی)', 'Showroom Bal': 'بیلانس نمایشگاه',
  'Owner Profit': 'مفاد مالک', Inventory: 'موجودی', Commissions: 'کمیشن‌ها', 'Recent Sales': 'فروشات اخیر',
  'No sales yet': 'هنوز فروشی ثبت نشده', 'Inventory Status': 'وضعیت موجودی', 'Quick Actions': 'عملیات سریع',
  Customer: 'مشتری', 'Open Loans': 'قرض‌های باز', 'Access Preview': 'پیش‌نمایش دسترسی',
  'Core Cost': 'هزینه اصلی', 'Core Cost (AFN)': 'هزینه اصلی (افغانی)', 'Total Cost (AFN)': 'مجموع هزینه (افغانی)',
  'Expected Profit': 'مفاد پیش‌بینی‌شده', 'Expected Profit (AFN)': 'مفاد پیش‌بینی‌شده (افغانی)', 'Additional Costs': 'هزینه‌های اضافی',
});

const LanguageContext = createContext(null);
const screenTitleTranslations = {
  ps: { 'Customer Details': 'د پېرودونکي معلومات', 'Edit Vehicle': 'موټر سمول', 'New Vehicle': 'نوی موټر', 'Users & Roles': 'کاروونکي او دندې', 'Loans & Debts': 'پورونه او قرضونه', 'Sale Detail': 'د پلورنې معلومات', 'Currency Exchange': 'د اسعارو تبادله', 'Vehicle Detail': 'د موټر معلومات', 'Vehicle Not Found': 'موټر ونه موندل شو', 'About Manager': 'د پېژندنې مدیریت', 'Contact Manager': 'د اړیکې مدیریت', 'Team Manager': 'د ټیم مدیریت' },
  prs: { 'Customer Details': 'معلومات مشتری', 'Edit Vehicle': 'ویرایش موتر', 'New Vehicle': 'موتر جدید', 'Users & Roles': 'کاربران و نقش‌ها', 'Loans & Debts': 'قرض‌ها و بدهی‌ها', 'Sale Detail': 'جزئیات فروش', 'Currency Exchange': 'تبدیل اسعار', 'Vehicle Detail': 'جزئیات موتر', 'Vehicle Not Found': 'موتر یافت نشد', 'About Manager': 'مدیریت درباره ما', 'Contact Manager': 'مدیریت تماس', 'Team Manager': 'مدیریت تیم' },
};
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Native forceRTL is process-wide and only fully applies after an app
    // restart. It caused English to remain mirrored after a live language
    // switch. Layout direction is controlled reactively by App.js and the
    // localized components instead, so every language can switch immediately.
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
    AsyncStorage.getItem('app_language').then(value => {
      if (value && translations[value]) {
        setLanguageState(value);
      }
      setReady(true);
    });
  }, []);
  const setLanguage = async (code) => {
    if (!translations[code]) return;
    setLanguageState(code);
    await AsyncStorage.setItem('app_language', code);
  };
  const value = useMemo(() => ({
    language,
    publicLocale: language === 'prs' ? 'fa' : language,
    languageInfo: LANGUAGES.find(l => l.code === language),
    languages: LANGUAGES,
    ready,
    isRTL: language !== 'en',
    setLanguage,
    t: (key, vars = {}) => {
      let translated = screenTitleTranslations[language]?.[key]
        || translations[language]?.[key]
        || canonicalCatalogs[language]?.[key]
        || translations.en[key]
        || canonicalCatalogs.en[key]
        || key;
      Object.entries(vars).forEach(([name, replacement]) => {
        translated = translated
          .replaceAll(`{{${name}}}`, String(replacement))
          .replaceAll(`{${name}}`, String(replacement));
      });
      return translated;
    },
    fontFamily: language === 'en' ? (Platform.OS === 'ios' ? 'System' : 'sans-serif') : (Platform.OS === 'ios' ? 'Geeza Pro' : 'sans-serif'),
    textStyle: { writingDirection: language === 'en' ? 'ltr' : 'rtl', textAlign: language === 'en' ? 'left' : 'right' },
    rowStyle: { flexDirection: language === 'en' ? 'row' : 'row-reverse' },
  }), [language, ready]);
  useEffect(() => {
    Alert.alert = (title, message, buttons, options) => nativeAlert(
      typeof title === 'string' ? value.t(title) : title,
      typeof message === 'string' ? value.t(message) : message,
      Array.isArray(buttons)
        ? buttons.map(button => ({ ...button, text: typeof button.text === 'string' ? value.t(button.text) : button.text }))
        : buttons,
      options,
    );
    return () => { Alert.alert = nativeAlert; };
  }, [value]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => { const ctx = useContext(LanguageContext); if (!ctx) throw new Error('useLanguage must be inside LanguageProvider'); return ctx; };
