-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 08, 2026 at 01:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `easyvate_cars`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_en`
--

CREATE TABLE `about_en` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `wide_feature` text DEFAULT NULL,
  `trust_feature` text DEFAULT NULL,
  `professional_feature` text DEFAULT NULL,
  `about_us` text DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `choose_trust` text DEFAULT NULL,
  `choose_quality` text DEFAULT NULL,
  `choose_process` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_en`
--

INSERT INTO `about_en` (`id`, `title`, `subtitle`, `description`, `wide_feature`, `trust_feature`, `professional_feature`, `about_us`, `experience`, `choose_trust`, `choose_quality`, `choose_process`, `createdAt`, `updatedAt`) VALUES
(1, 'Welcome to Niazai Khpalwak Car Showroom', 'Your Trusted Platform for Buying and Selling Vehicles', 'Niazai Khpalwak Car Showroom is a trusted platform for buying and selling high-quality vehicles. We specialize in container imported cars, licensed vehicles, and a wide variety of brands including Toyota, BMW, Mercedes, Luxes, and more. Our goal is to connect buyers and sellers easily while providing transparent pricing, reliable vehicles, and excellent customer service to thousands of satisfied clients.', 'We offer a diverse selection of vehicles, from economy cars to luxury models, ensuring every customer can easily find a vehicle that matches their needs and budget.', 'Our platform provides a secure and transparent environment for buyers and sellers, ensuring that vehicle transactions are simple, reliable, and a trusted experience for everyone.', 'We provide professional car import services, managing documentation and logistics efficiently, ensuring vehicles are delivered safely and smoothly from international markets to customers.', 'Our marketplace is designed to simplify car buying and selling by offering verified listings, detailed information, and user-friendly navigation.', 'With years of experience in the automotive industry, we understand customer needs and deliver high quality services with professionalism.', 'We work only with verified and reputable dealers to ensure authenticity, reliability, and customer confidence.', 'Every vehicle listed on our platform meets quality standards, ensuring performance, safety, and value for money.', 'Our streamlined process makes buying a car simple, fast, and hassle free from browsing to final purchase.', '2026-03-28 13:08:25', '2026-05-05 16:31:38');

-- --------------------------------------------------------

--
-- Table structure for table `about_fa`
--

CREATE TABLE `about_fa` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `wide_feature` text DEFAULT NULL,
  `trust_feature` text DEFAULT NULL,
  `professional_feature` text DEFAULT NULL,
  `about_us` text DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `choose_trust` text DEFAULT NULL,
  `choose_quality` text DEFAULT NULL,
  `choose_process` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_fa`
--

INSERT INTO `about_fa` (`id`, `title`, `subtitle`, `description`, `wide_feature`, `trust_feature`, `professional_feature`, `about_us`, `experience`, `choose_trust`, `choose_quality`, `choose_process`, `createdAt`, `updatedAt`) VALUES
(1, 'به فرشګاه موتر نیازی خپلواک خوش آمدید', 'پلتفرم مطمئن شما برای خرید و فروش موترها', 'فروشګاه موتر نیازی خپلواک یک پلتفرم مطمئن برای خرید و فروش موترهای با کیفیت بالا میباشد. ما در موترهای وارداتی کانتینری، موترهای دارای جواز، و انواع مختلف برندها از جمله تویوتا، BMW، مرسدس، لکسس و غیره تخصص داریم. هدف ما این است که خریداران و فروشندگان را به آسانی وصل کنیم، موترهای قابل اعتماد با قیمت شفاف ارائه دهیم و خدمات عالی به مشتریان ارائه کنیم تا هزاران مشتری راضی داشته باشیم.', 'ما مجموعه متنوعی از موترها را ارائه می‌کنیم، از موترهای اقتصادی تا مدل‌ های لوکس، تا هر مشتری بتواند به‌ سادگی موتری مطابق با نیاز و بودجه خود پیدا کند.', 'پلتفورم ما یک محیط امن و شفاف برای خریداران و فروشندگان فراهم می‌کند، تا معاملات موتر به‌صورت ساده، قابل اعتماد و یک تجربه مطمئن برای همه انجام شود.', 'ما خدمات مسلکی واردات موتر را ارائه می‌کنیم، تمامی امور اسناد و لوجستیک را به‌ صورت مؤثر مدیریت می‌کنیم تا موترها به‌گونه‌ای امن و آسان از بازارهای بین‌المللی به مشتریان برسد.', 'بازار ما به‌گونه‌ای طراحی شده است تا خرید و فروش موتر را ساده و مؤثر سازد، با ارائه اعلان‌ های تأیید شده، معلومات دقیق و یک سیستم کار برپسند برای همه استفاده‌ کنندگان.', 'ما با سال‌ ها تجربه در صنعت موتر، نیازهای مشتریان را به‌ خوبی درک می‌کنیم و همواره تلاش داریم خدمات باکیفیت و مسلکی را به‌گونه‌ای قابل اعتماد ارائه نماییم.', 'ما تنها با فروشندگان تأیید شده و معتبر همکاری می‌کنیم تا اصالت، کیفیت و اعتماد در هر معامله حفظ شود و مشتریان با اطمینان کامل خرید نمایند.', 'تمام موترهای موجود در پلتفورم ما مطابق به معیارهای کیفیت بررسی می‌شوند تا از نظر عملکرد، مصونیت و ارزش، بهترین انتخاب برای مشتریان فراهم گردد.', 'روند ساده و منظم ما خرید موتر را سریع و بدون مشکل می‌سازد، از جستجو و انتخاب گرفته تا تکمیل معامله، همه مراحل به‌ صورت آسان انجام می‌شود.', '2026-03-28 13:11:52', '2026-05-05 16:43:13');

-- --------------------------------------------------------

--
-- Table structure for table `about_logos_en`
--

CREATE TABLE `about_logos_en` (
  `id` int(11) NOT NULL,
  `aboutId` int(11) NOT NULL COMMENT 'ID of the about_en record',
  `filename` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `size` int(11) NOT NULL,
  `order` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_logos_en`
--

INSERT INTO `about_logos_en` (`id`, `aboutId`, `filename`, `path`, `size`, `order`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'client-2.png', '/uploads/about-logos/logo-1777998472842-20077198.webp', 1144, 0, '2026-05-05 16:27:53', '2026-05-05 16:27:53'),
(2, 1, 'client-3.png', '/uploads/about-logos/logo-1777998472843-174443383.webp', 1172, 1, '2026-05-05 16:27:53', '2026-05-05 16:27:53');

-- --------------------------------------------------------

--
-- Table structure for table `about_logos_fa`
--

CREATE TABLE `about_logos_fa` (
  `id` int(11) NOT NULL,
  `aboutId` int(11) NOT NULL COMMENT 'ID of the about_fa record',
  `filename` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `size` int(11) NOT NULL,
  `order` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_logos_fa`
--

INSERT INTO `about_logos_fa` (`id`, `aboutId`, `filename`, `path`, `size`, `order`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'client-2.png', '/uploads/about-logos/logo-1777999393364-68814322.webp', 1144, 0, '2026-05-05 16:43:13', '2026-05-05 16:43:13'),
(2, 1, 'client-3.png', '/uploads/about-logos/logo-1777999393365-346945528.webp', 1172, 1, '2026-05-05 16:43:13', '2026-05-05 16:43:13');

-- --------------------------------------------------------

--
-- Table structure for table `about_logos_ps`
--

CREATE TABLE `about_logos_ps` (
  `id` int(11) NOT NULL,
  `aboutId` int(11) NOT NULL COMMENT 'ID of the about_ps record',
  `filename` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `size` int(11) NOT NULL,
  `order` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_logos_ps`
--

INSERT INTO `about_logos_ps` (`id`, `aboutId`, `filename`, `path`, `size`, `order`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'client-2.png', '/uploads/about-logos/logo-1777998941819-6043334.webp', 1144, 0, '2026-05-05 16:35:41', '2026-05-05 16:35:41'),
(2, 1, 'client-3.png', '/uploads/about-logos/logo-1777998941820-306669639.webp', 1172, 1, '2026-05-05 16:35:41', '2026-05-05 16:35:41');

-- --------------------------------------------------------

--
-- Table structure for table `about_ps`
--

CREATE TABLE `about_ps` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `wide_feature` text DEFAULT NULL,
  `trust_feature` text DEFAULT NULL,
  `professional_feature` text DEFAULT NULL,
  `about_us` text DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `choose_trust` text DEFAULT NULL,
  `choose_quality` text DEFAULT NULL,
  `choose_process` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_ps`
--

INSERT INTO `about_ps` (`id`, `title`, `subtitle`, `description`, `wide_feature`, `trust_feature`, `professional_feature`, `about_us`, `experience`, `choose_trust`, `choose_quality`, `choose_process`, `createdAt`, `updatedAt`) VALUES
(1, 'نیازي خپلواک موټر پلورنځي ته ښه راغلاست', 'ستاسې باوري پلاتفورم د موټرانو د پېرلو او پلورلو لپاره', 'نیازي خپلواک موټر پلورنځي یو باوري پلاټفورم دی د لوړ کیفیت لرونکو موټرانو د پېرلو او پلورلو لپاره. موږ کانتینری موټران، اسناد داره موټران، او د مختلفو برانډونو لکه ټویوټا، BMW، مرسډیز، لکسس او نورو کې تخصص لرو. زموږ هدف دا دی چې پېرودونکي او پلورونکي په اسانۍ سره وصل کړو، په شفافه بیه موټرونه وړاندې کړو، او غوره مشتریانو خدمتونه وړاندې کړو ترڅو زرګونه رضایتمند مشتریان خوشحال کړو.', 'موږ د بېلابېلو موټرانو پراخه انتخاب وړاندې کوو، له اقتصادي موټرانو څخه تر لوکس موډلونو پورې، ترڅو هر پیرودونکی د خپل اړتیا او بودیجې سره مناسب موټر په اسانه پیدا کړي.', 'زموږ پلاتفورم د پیرودونکو او پلورونکو ترمنځ یو خوندي او شفاف چاپېریال برابروي، ترڅو د موټرانو راکړه ورکړه اسانه، باوري او د ټولو لپاره ډاډمنه تجربه سي.', 'موږ د موټرانو د وارداتو مسلکي خدمتونه وړاندې کوو، د اسنادو او لوجستیک ټول کارونه سمبالوو، ترڅو موټرونه له نړیوالو بازارونو څخه په اسانه او خوندي توګه راورسو.', 'زموږ بازار داسې طرحه شوی چې د موټرانو اخیستل او پلورل اسانه کړي، د تایید شوو اعلانونو، مفصل معلوماتو او کاروونکي ته اسانه ډیزاین سره.', 'موږ د موټرانو په برخه کې کلونه تجربه لرو او د مشتریانو اړتیاوې په ښه ډول درک کوو، او تل مسلکي او باکیفیته خدمتونه وړاندې کوو.', 'موږ یوازې له تایید سوو او معتبرو پلورونکو سره کار کوو ترڅو باور، اعتبار او د مشتری رضایت یقیني کړو.', 'زموږ پلاتفورم کې ټول موټرونه د کیفیت معیارونه پوره کوي، چې د فعالیت، خوندیتوب او ارزښت تضمین کوي.', 'زموږ ساده او منظم بهیر د موټر اخیستل چټک او بې‌ ستونه کوي، له لټون څخه تر وروستي پېر پورې.', '2026-03-28 13:11:10', '2026-05-05 16:38:43');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employeeId` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `presentDays` int(11) NOT NULL DEFAULT 0,
  `absentDays` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `employeeId`, `notes`, `createdAt`, `updatedAt`, `month`, `year`, `presentDays`, `absentDays`) VALUES
(2, 1, NULL, '2026-02-14 20:16:55', '2026-04-13 07:37:27', 4, 2026, 13, 17),
(3, 2, NULL, '2026-02-14 20:20:07', '2026-04-13 07:37:27', 4, 2026, 13, 17);

-- --------------------------------------------------------

--
-- Table structure for table `carousel_items`
--

CREATE TABLE `carousel_items` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `model` varchar(100) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL COMMENT 'Path to uploaded image',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'AFN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carousel_items`
--

INSERT INTO `carousel_items` (`id`, `title`, `model`, `price`, `image`, `createdAt`, `updatedAt`, `currency`) VALUES
(1, 'Audi Q7', '2020', 600000.00, '/uploads/carousel-images/carousel-1774704999805-554960949.jpg', '2026-03-28 13:36:39', '2026-03-28 13:36:39', 'AFN'),
(2, 'BMW', '2021', 80000.00, '/uploads/carousel-images/carousel-1774705443124-119788713.jpg', '2026-03-28 13:44:03', '2026-07-01 08:34:30', 'USD'),
(3, 'Porsche Cayenne S', '2019', 550000.00, '/uploads/carousel-images/carousel-1774718064754-420712677.jpg', '2026-03-28 17:14:24', '2026-03-28 17:14:46', 'AFN'),
(4, 'Land Cruiser', '2024', 55000.00, '/uploads/carousel-images/carousel-1777984789022-733824780.webp', '2026-05-05 12:39:49', '2026-07-01 08:33:00', 'USD'),
(5, 'Crown', '2025', 300000.00, '/uploads/carousel-images/carousel-1782894945545-141691261.webp', '2026-07-01 08:35:45', '2026-07-01 08:35:45', 'AED');

-- --------------------------------------------------------

--
-- Table structure for table `choose_videos`
--

CREATE TABLE `choose_videos` (
  `id` int(11) NOT NULL,
  `videoPath` varchar(255) NOT NULL COMMENT 'Path to uploaded video file',
  `order` int(11) DEFAULT 0 COMMENT 'Display order',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `choose_videos`
--

INSERT INTO `choose_videos` (`id`, `videoPath`, `order`, `createdAt`, `updatedAt`) VALUES
(1, '/uploads/videos/video-1777712814252-24471264.mp4', 1, '2026-03-28 13:44:51', '2026-05-02 09:06:54');

-- --------------------------------------------------------

--
-- Table structure for table `commission_distributions`
--

CREATE TABLE `commission_distributions` (
  `id` int(11) NOT NULL,
  `saleId` int(11) NOT NULL,
  `sharingPersonId` int(11) DEFAULT NULL,
  `personName` varchar(255) NOT NULL,
  `sharePercentage` decimal(5,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `paidDate` datetime DEFAULT NULL,
  `status` enum('Pending','Paid') DEFAULT 'Pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `customerId` int(11) DEFAULT NULL,
  `investmentAmount` decimal(15,2) DEFAULT NULL,
  `calculationMethod` enum('Investment','Percentage') NOT NULL DEFAULT 'Percentage'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `commission_distributions`
--

INSERT INTO `commission_distributions` (`id`, `saleId`, `sharingPersonId`, `personName`, `sharePercentage`, `amount`, `paidDate`, `status`, `createdAt`, `updatedAt`, `customerId`, `investmentAmount`, `calculationMethod`) VALUES
(7, 65, 9, 'Farid', 50.00, 50.00, '2026-05-21 00:00:00', 'Paid', '2026-05-21 10:16:23', '2026-05-21 10:16:23', 63, 250.00, 'Percentage'),
(8, 66, 10, 'Farid', 50.00, 50.00, '2026-05-21 00:00:00', 'Paid', '2026-05-21 11:17:04', '2026-05-21 11:17:04', 63, 150.00, 'Percentage'),
(9, 69, 11, 'Farid', 50.00, 50.00, '2026-05-21 00:00:00', 'Paid', '2026-05-21 12:15:16', '2026-05-21 12:15:16', 63, 3250.00, 'Percentage'),
(12, 72, 13, 'Farid', 50.00, 50.00, '2026-05-22 00:00:00', 'Paid', '2026-05-22 21:39:45', '2026-05-22 21:39:45', 63, 100.00, 'Percentage'),
(17, 77, 22, 'Bilal Khan', 50.00, 50.00, '2026-05-24 00:00:00', 'Paid', '2026-05-24 19:38:50', '2026-05-24 19:38:50', 76, 50.00, 'Percentage'),
(18, 78, 21, 'Farid', 50.00, 50.00, '2026-05-24 00:00:00', 'Paid', '2026-05-24 19:40:41', '2026-05-24 19:40:41', 63, 3250.00, 'Percentage'),
(19, 79, 18, 'Farid', 50.00, 50.00, '2026-05-24 00:00:00', 'Paid', '2026-05-24 20:01:31', '2026-05-24 20:01:31', 63, 100.00, 'Percentage'),
(20, 80, 23, 'Farid', 50.00, 4950.00, '2026-06-06 00:00:00', 'Paid', '2026-06-06 12:19:43', '2026-06-06 12:19:43', 63, 3250.00, 'Percentage'),
(21, 81, 20, 'Farid', 50.00, 50.00, '2026-07-01 00:00:00', 'Paid', '2026-07-01 08:00:18', '2026-07-01 08:00:18', 63, 3250.00, 'Percentage'),
(22, 83, 12, 'Farid', 50.00, 25.00, '2026-07-06 00:00:00', 'Paid', '2026-07-06 04:55:03', '2026-07-06 04:55:03', 63, 3250.00, 'Percentage'),
(23, 84, 24, 'Farid', 50.00, 50.00, '2026-07-06 00:00:00', 'Paid', '2026-07-06 05:39:49', '2026-07-06 05:39:49', 63, 3175.00, 'Percentage');

-- --------------------------------------------------------

--
-- Table structure for table `contact_en`
--

CREATE TABLE `contact_en` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `x` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `weekdays` varchar(255) DEFAULT NULL,
  `friday` varchar(255) DEFAULT NULL,
  `branchName` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_en`
--

INSERT INTO `contact_en` (`id`, `email`, `phone`, `facebook`, `instagram`, `x`, `youtube`, `weekdays`, `friday`, `branchName`, `address`, `createdAt`, `updatedAt`) VALUES
(1, 'info@gmail.com', '0700000213', 'facebook.com', 'instagram.com', 'x.com', 'youtube.com', 'Sat-Thur 08:00 AM - 05:00 PM', 'Fri 08:00 AM - 12:00 PM', 'Niazay Khpalwak Car Showroom (Main Branch)', 'Spin Boldak Highway, Kandahar, Afghanistan', '2026-03-28 13:28:46', '2026-05-05 12:37:19');

-- --------------------------------------------------------

--
-- Table structure for table `contact_fa`
--

CREATE TABLE `contact_fa` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `x` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `weekdays` varchar(255) DEFAULT NULL,
  `friday` varchar(255) DEFAULT NULL,
  `branchName` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_fa`
--

INSERT INTO `contact_fa` (`id`, `email`, `phone`, `facebook`, `instagram`, `x`, `youtube`, `weekdays`, `friday`, `branchName`, `address`, `createdAt`, `updatedAt`) VALUES
(1, 'info@gmail.com', '0700000000', 'facebook.com', 'instagram.com', 'x.com', 'youtube.com', 'سنبه-پنجشنبه ۰۸:۰۰ صبح - ۰۵:۰۰ شام', 'جمعه ۰۸:۰۰ صبح - ۱۲:۰۰ ظهر', 'نماشګاه موتر نیازی خپلواک (بخش مرکزی)', 'سرک عمومی سپین بولدک، کندهار افغانستان', '2026-03-28 13:34:10', '2026-03-28 13:34:50');

-- --------------------------------------------------------

--
-- Table structure for table `contact_ps`
--

CREATE TABLE `contact_ps` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `x` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `weekdays` varchar(255) DEFAULT NULL,
  `friday` varchar(255) DEFAULT NULL,
  `branchName` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_ps`
--

INSERT INTO `contact_ps` (`id`, `email`, `phone`, `facebook`, `instagram`, `x`, `youtube`, `weekdays`, `friday`, `branchName`, `address`, `createdAt`, `updatedAt`) VALUES
(1, 'info@gmail.com', '0700000000', 'facebook.com', 'instagram.com', 'x.com', 'youtube.com', 'شنبه-پنجشنبه ۰۸:۰۰ سهار - ۰۵:۰۰ ماښام', 'جمعه ۰۸:۰۰ سهار - ۱۲:۰۰ غرمې', 'نیازي خپلواک موټرانو شوروم (مرکزي برخه)', 'سپین بولدک عمومی سړک، کندهار افغانستان', '2026-03-28 13:32:01', '2026-03-28 13:32:01');

-- --------------------------------------------------------

--
-- Table structure for table `currency_exchanges`
--

CREATE TABLE `currency_exchanges` (
  `id` int(11) NOT NULL,
  `fromCurrency` varchar(10) NOT NULL,
  `toCurrency` varchar(10) NOT NULL,
  `fromAmount` decimal(15,2) NOT NULL,
  `toAmount` decimal(15,2) NOT NULL,
  `exchangeRate` decimal(10,4) NOT NULL,
  `date` datetime NOT NULL,
  `notes` text DEFAULT NULL,
  `addedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currency_exchanges`
--

INSERT INTO `currency_exchanges` (`id`, `fromCurrency`, `toCurrency`, `fromAmount`, `toAmount`, `exchangeRate`, `date`, `notes`, `addedBy`, `createdAt`, `updatedAt`) VALUES
(6, 'USD', 'AFN', 1.00, 60.00, 60.0000, '2026-03-29 20:58:21', '', 1, '2026-03-29 20:58:21', '2026-03-29 20:58:21'),
(7, 'USD', 'PKR', 1.00, 280.00, 280.0000, '2026-03-29 21:00:20', '', 1, '2026-03-29 21:00:20', '2026-03-29 21:00:20'),
(8, 'USD', 'AFN', 1.00, 60.00, 60.0000, '2026-05-02 12:48:09', '', 1, '2026-05-02 12:48:09', '2026-05-02 12:48:09'),
(9, 'USD', 'AFN', 100.00, 6500.00, 65.0000, '2026-05-18 08:53:11', '', 1, '2026-05-18 08:53:11', '2026-05-18 08:53:11'),
(10, 'AED', 'AFN', 100.00, 2000.00, 20.0000, '2026-05-21 07:02:46', '', 1, '2026-05-21 07:02:46', '2026-05-21 07:02:46'),
(11, 'AED', 'AFN', 100.00, 2000.00, 20.0000, '2026-05-21 07:19:35', '', 1, '2026-05-21 07:19:35', '2026-05-21 07:19:35'),
(12, 'AED', 'AFN', 100.00, 2000.00, 20.0000, '2026-05-21 07:25:17', '', 1, '2026-05-21 07:25:17', '2026-05-21 07:25:17'),
(13, 'USD', 'AFN', 1000.00, 65000.00, 65.0000, '2026-05-21 07:27:57', '', 1, '2026-05-21 07:27:57', '2026-05-21 07:27:57'),
(14, 'AFN', 'AED', 2000.00, 100.00, 0.0500, '2026-05-21 07:33:40', '', 1, '2026-05-21 07:33:40', '2026-05-21 07:33:40'),
(15, 'USD', 'AFN', 10.00, 650.00, 65.0000, '2026-05-21 12:03:40', '', 1, '2026-05-21 12:03:40', '2026-05-21 12:03:40'),
(16, 'AED', 'USD', 100.00, 34.65, 0.3465, '2026-06-06 12:53:35', '', 1, '2026-06-06 12:53:35', '2026-06-06 12:53:35');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `fatherName` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `currentAddress` text NOT NULL,
  `originalAddress` text NOT NULL,
  `province` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `nationalIdNumber` varchar(50) NOT NULL,
  `customerType` enum('Buyer','Investor','Capital Provider','Borrower') DEFAULT 'Buyer',
  `balance` decimal(15,2) DEFAULT 0.00,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `village` varchar(255) DEFAULT NULL,
  `balanceAFN` decimal(15,2) DEFAULT 0.00,
  `balanceUSD` decimal(15,2) DEFAULT 0.00,
  `balancePKR` decimal(15,2) DEFAULT 0.00,
  `balanceAED` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `fullName`, `fatherName`, `phoneNumber`, `currentAddress`, `originalAddress`, `province`, `district`, `nationalIdNumber`, `customerType`, `balance`, `createdAt`, `updatedAt`, `village`, `balanceAFN`, `balanceUSD`, `balancePKR`, `balanceAED`) VALUES
(59, 'Khan', 'Jan', '0787654321', 'Kandahar, Afghanistan', 'Kandahar, Afghanistan', 'Kandahar', 'Dand', '8979877868687', 'Buyer', 0.00, '2026-05-21 08:50:26', '2026-07-06 05:39:49', '', 0.00, 0.00, 0.00, 0.00),
(60, 'khan', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-21 09:38:21', '2026-05-21 09:38:21', '', 0.00, 0.00, 0.00, 0.00),
(61, 'jan', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-21 09:44:33', '2026-05-21 09:44:33', '', 0.00, 0.00, 0.00, 0.00),
(62, 'Jan', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-21 10:12:15', '2026-05-21 10:12:15', '', 0.00, 0.00, 0.00, 0.00),
(63, 'Farid', 'Khan', '0703654789', 'Kandahar, Afghanistan', 'Kandahar, Afghanistan', 'Kandahar', 'City', '546554578522', 'Investor', 11488.27, '2026-05-21 10:14:16', '2026-07-06 05:39:49', '', 8750.00, 425.77, 0.00, 0.00),
(64, 'Mohammad', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-21 10:16:23', '2026-05-21 10:16:23', '', 0.00, 0.00, 0.00, 0.00),
(65, 'Baz', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-21 11:17:04', '2026-05-21 11:17:04', '', 0.00, 0.00, 0.00, 0.00),
(66, 'khan', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-21 11:34:43', '2026-05-21 11:34:43', '', 0.00, 0.00, 0.00, 0.00),
(67, 'khan', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-21 11:37:44', '2026-05-21 11:37:44', '', 0.00, 0.00, 0.00, 0.00),
(68, 'jan', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-21 12:15:15', '2026-05-21 12:15:16', '', 0.00, 0.00, 0.00, 0.00),
(69, 'test', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-22 20:00:52', '2026-05-22 20:00:52', '', 0.00, 0.00, 0.00, 0.00),
(70, 'test', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-22 20:37:10', '2026-05-22 20:37:10', '', 0.00, 0.00, 0.00, 0.00),
(71, 'test', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-22 21:39:45', '2026-05-22 21:39:45', '', 0.00, 0.00, 0.00, 0.00),
(72, 'test', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-22 21:43:45', '2026-05-22 21:43:46', '', 0.00, 0.00, 0.00, 0.00),
(73, 'test', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-22 22:20:49', '2026-05-22 22:20:49', '', 0.00, 0.00, 0.00, 0.00),
(74, 'test', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-22 22:28:57', '2026-05-22 22:28:57', '', 0.00, 0.00, 0.00, 0.00),
(75, 'test', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-23 11:05:05', '2026-05-23 11:05:05', '', 0.00, 0.00, 0.00, 0.00),
(76, 'Bilal Khan', 'Khan', '07089654123', 'Kandahar, Afghanistan', 'Kandahar, Afghanistan', 'Kandahar', '1', '654534654351351', 'Investor', 3875.00, '2026-05-24 19:35:21', '2026-07-01 07:08:21', '', 550.00, 50.00, 0.00, 0.00),
(77, 'kjh', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-24 19:38:50', '2026-05-24 19:38:50', '', 0.00, 0.00, 0.00, 0.00),
(78, 'Timor', '', '', '', '', '', '', '', 'Buyer', 3200.00, '2026-05-24 19:40:41', '2026-05-24 19:58:15', '', 0.00, 0.00, 0.00, 0.00),
(79, 'thh', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-05-24 20:01:31', '2026-05-24 20:02:53', '', 0.00, 0.00, 0.00, 0.00),
(80, 'Khan', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-06-06 12:19:43', '2026-06-06 12:20:18', '', 0.00, 0.00, 0.00, 0.00),
(81, 'tet=st', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-07-01 08:00:18', '2026-07-01 08:00:18', '', 0.00, 0.00, 0.00, 0.00),
(82, 'محمد', 'حان', '۰۷۱۲۳۴۵۶۷۸', 'کندهار', 'کندهار', 'کندخار', 'ښار', '۲۳۸۷۴۸۹', 'Buyer', 0.00, '2026-07-05 19:24:28', '2026-07-05 19:24:28', '۲ ناحیه', 0.00, 0.00, 0.00, 0.00),
(83, 'جان محمد', 'سردار محمد', '۰۷۰۸۷۶۵۴۳۲', 'شهرنو، کابل', 'شهرنو، کابل', 'کابل', 'ښار', '۸۷۶۰۸۵۶۲', 'Buyer', 0.00, '2026-07-06 04:55:03', '2026-07-06 04:55:03', 'شهر نو', 0.00, 0.00, 0.00, 0.00),
(84, 'جان', '', '', '', '', '', '', '', 'Buyer', 0.00, '2026-07-08 11:03:09', '2026-07-08 11:03:09', '', 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `customer_ledger`
--

CREATE TABLE `customer_ledger` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `type` enum('Received','Paid','Sale','Investment','Loan','Loan Payment','Installment','Profit Share') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'AFN',
  `amountInPKR` decimal(15,2) NOT NULL,
  `purpose` text DEFAULT NULL,
  `date` datetime NOT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `saleId` int(11) DEFAULT NULL,
  `addedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_ledger`
--

INSERT INTO `customer_ledger` (`id`, `customerId`, `type`, `amount`, `currency`, `amountInPKR`, `purpose`, `date`, `balance`, `saleId`, `addedBy`, `createdAt`, `updatedAt`) VALUES
(127, 61, 'Sale', 150.00, 'AFN', 150.00, 'Purchase of V000001 — total price', '2026-05-21 00:00:00', -150.00, 63, 1, '2026-05-21 09:44:33', '2026-05-21 09:44:33'),
(128, 61, 'Received', 150.00, 'AFN', 150.00, 'Down payment for V000001', '2026-05-21 00:00:00', 0.00, 63, 1, '2026-05-21 09:44:33', '2026-05-21 09:44:33'),
(129, 62, 'Sale', 600.00, 'AFN', 600.00, 'Purchase of V000002 — total price', '2026-05-21 00:00:00', -600.00, 64, 1, '2026-05-21 10:12:15', '2026-05-21 10:12:15'),
(130, 62, 'Received', 600.00, 'AFN', 600.00, 'Down payment for V000002', '2026-05-21 00:00:00', 0.00, 64, 1, '2026-05-21 10:12:15', '2026-05-21 10:12:15'),
(131, 63, 'Received', 500.00, 'AFN', 500.00, '', '2026-05-21 00:00:00', 500.00, NULL, 1, '2026-05-21 10:14:32', '2026-05-21 10:14:32'),
(132, 63, 'Profit Share', 50.00, 'AFN', 50.00, 'Partner profit from sale S000003 (50%)', '2026-05-21 00:00:00', 550.00, 65, 1, '2026-05-21 10:16:23', '2026-05-21 10:16:23'),
(133, 64, 'Sale', 600.00, 'AFN', 600.00, 'Purchase of V000003 — total price', '2026-05-21 00:00:00', -600.00, 65, 1, '2026-05-21 10:16:23', '2026-05-21 10:16:23'),
(134, 64, 'Received', 600.00, 'AFN', 600.00, 'Down payment for V000003', '2026-05-21 00:00:00', 0.00, 65, 1, '2026-05-21 10:16:23', '2026-05-21 10:16:23'),
(135, 63, 'Paid', 50.00, 'AFN', 50.00, '', '2026-05-21 00:00:00', 500.00, NULL, 1, '2026-05-21 11:01:02', '2026-05-21 11:01:02'),
(136, 63, 'Received', 50.00, 'AFN', 50.00, '', '2026-05-21 00:00:00', 550.00, NULL, 1, '2026-05-21 11:09:58', '2026-05-21 11:09:58'),
(137, 63, 'Paid', 100.00, 'AFN', 100.00, '', '2026-05-21 00:00:00', 450.00, NULL, 1, '2026-05-21 11:10:56', '2026-05-21 11:10:56'),
(138, 63, 'Profit Share', 50.00, 'AFN', 50.00, 'Partner profit from sale S000004 (50%)', '2026-05-21 00:00:00', 500.00, 66, 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(139, 65, 'Sale', 400.00, 'AFN', 400.00, 'Purchase of V000004 — total price', '2026-05-21 00:00:00', -400.00, 66, 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(140, 65, 'Received', 400.00, 'AFN', 400.00, 'Down payment for V000004', '2026-05-21 00:00:00', 0.00, 66, 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(141, 66, 'Sale', 300.00, 'AFN', 300.00, 'Purchase of V000005 — total price', '2026-05-21 00:00:00', -300.00, 67, 1, '2026-05-21 11:34:43', '2026-05-21 11:34:43'),
(142, 66, 'Received', 300.00, 'AFN', 300.00, 'Down payment for V000005', '2026-05-21 00:00:00', 0.00, 67, 1, '2026-05-21 11:34:43', '2026-05-21 11:34:43'),
(143, 67, 'Sale', 200.00, 'AFN', 200.00, 'Purchase of V000006 — total price', '2026-05-21 00:00:00', -200.00, 68, 1, '2026-05-21 11:37:44', '2026-05-21 11:37:44'),
(144, 67, 'Received', 200.00, 'AFN', 200.00, 'Down payment for V000006', '2026-05-21 00:00:00', 0.00, 68, 1, '2026-05-21 11:37:44', '2026-05-21 11:37:44'),
(145, 63, 'Received', 100.00, 'USD', 6500.00, '', '2026-05-21 00:00:00', 7000.00, NULL, 1, '2026-05-21 12:09:24', '2026-05-21 12:09:24'),
(146, 63, 'Profit Share', 50.00, 'AFN', 50.00, 'Partner profit from sale S000007 (50%)', '2026-05-21 00:00:00', 7050.00, 69, 1, '2026-05-21 12:15:16', '2026-05-21 12:15:16'),
(147, 68, 'Sale', 200.00, 'AFN', 200.00, 'Purchase of V000008 — total price', '2026-05-21 00:00:00', -200.00, 69, 1, '2026-05-21 12:15:16', '2026-05-21 12:15:16'),
(148, 68, 'Received', 200.00, 'AFN', 200.00, 'Down payment for V000008', '2026-05-21 00:00:00', 0.00, 69, 1, '2026-05-21 12:15:16', '2026-05-21 12:15:16'),
(155, 63, 'Profit Share', 50.00, 'AFN', 50.00, 'Partner profit from sale S000009 (50%)', '2026-05-22 00:00:00', 7125.00, 72, 1, '2026-05-22 21:39:45', '2026-05-22 21:39:45'),
(156, 71, 'Sale', 300.00, 'AFN', 300.00, 'Purchase of V000007 — total price', '2026-05-22 00:00:00', -300.00, 72, 1, '2026-05-22 21:39:45', '2026-05-22 21:39:45'),
(157, 71, 'Received', 300.00, 'AFN', 300.00, 'Down payment for V000007', '2026-05-22 00:00:00', 0.00, 72, 1, '2026-05-22 21:39:45', '2026-05-22 21:39:45'),
(167, 63, 'Investment', 50.00, 'USD', 3250.00, 'Investment in vehicle V000016', '2026-05-23 10:53:51', 100.77, NULL, NULL, '2026-05-23 10:53:51', '2026-05-23 10:53:51'),
(172, 63, 'Investment', 50.00, 'USD', 3250.00, 'Investment in vehicle V000015', '2026-05-23 11:09:10', 150.77, NULL, NULL, '2026-05-23 11:09:10', '2026-05-23 11:09:10'),
(173, 76, 'Received', 500.00, 'AFN', 500.00, '', '2026-05-24 00:00:00', 500.00, NULL, 1, '2026-05-24 19:35:35', '2026-05-24 19:35:35'),
(174, 76, 'Investment', 50.00, 'AFN', 50.00, 'Investment in vehicle V000017', '2026-05-24 19:37:01', 450.00, NULL, NULL, '2026-05-24 19:37:01', '2026-05-24 19:37:01'),
(175, 76, 'Profit Share', 50.00, 'AFN', 50.00, 'Partner profit from sale S000014 (50%)', '2026-05-24 00:00:00', 500.00, 77, 1, '2026-05-24 19:38:50', '2026-05-24 19:38:50'),
(176, 76, '', 50.00, 'AFN', 50.00, 'Return of investment in vehicle V000017 (50.00%)', '2026-05-24 00:00:00', 550.00, 77, 1, '2026-05-24 19:38:50', '2026-05-24 19:38:50'),
(177, 77, 'Sale', 200.00, 'AFN', 200.00, 'Purchase of V000017 — total price', '2026-05-24 00:00:00', -200.00, 77, 1, '2026-05-24 19:38:50', '2026-05-24 19:38:50'),
(178, 77, 'Received', 200.00, 'AFN', 200.00, 'Down payment for V000017', '2026-05-24 00:00:00', 0.00, 77, 1, '2026-05-24 19:38:50', '2026-05-24 19:38:50'),
(179, 63, 'Profit Share', 50.00, 'USD', 3250.00, 'Partner profit from sale S000015 (50%)', '2026-05-24 00:00:00', 3400.77, 78, 1, '2026-05-24 19:40:41', '2026-05-24 19:40:41'),
(180, 63, '', 50.00, 'USD', 3250.00, 'Return of investment in vehicle V000015 (50.00%)', '2026-05-24 00:00:00', 6650.77, 78, 1, '2026-05-24 19:40:41', '2026-05-24 19:40:41'),
(181, 78, 'Sale', 200.00, 'AFN', 200.00, 'Purchase of V000015 — total price', '2026-05-24 00:00:00', -200.00, 78, 1, '2026-05-24 19:40:41', '2026-05-24 19:40:41'),
(182, 78, 'Received', 150.00, 'AFN', 150.00, 'Down payment for V000015', '2026-05-24 00:00:00', -50.00, 78, 1, '2026-05-24 19:40:41', '2026-05-24 19:40:41'),
(183, 78, 'Installment', 50.00, 'USD', 3250.00, 'Installment payment for sale S000015 — V000015', '2026-05-24 00:00:00', 3200.00, 78, 1, '2026-05-24 19:58:15', '2026-05-24 19:58:15'),
(184, 63, 'Profit Share', 50.00, 'AFN', 50.00, 'Partner profit from sale S000016 (50%)', '2026-05-24 00:00:00', 6700.77, 79, 1, '2026-05-24 20:01:31', '2026-05-24 20:01:31'),
(185, 63, '', 100.00, 'AFN', 100.00, 'Return of investment in vehicle V000014 (50.00%)', '2026-05-24 00:00:00', 6800.77, 79, 1, '2026-05-24 20:01:31', '2026-05-24 20:01:31'),
(186, 79, 'Sale', 300.00, 'AFN', 300.00, 'Purchase of V000014 — total price', '2026-05-24 00:00:00', -300.00, 79, 1, '2026-05-24 20:01:31', '2026-05-24 20:01:31'),
(187, 79, 'Received', 200.00, 'AFN', 200.00, 'Down payment for V000014', '2026-05-24 00:00:00', -100.00, 79, 1, '2026-05-24 20:01:31', '2026-05-24 20:01:31'),
(188, 79, 'Installment', 100.00, 'AFN', 100.00, 'Installment payment for sale S000016 — V000014', '2026-05-24 00:00:00', 0.00, 79, 1, '2026-05-24 20:02:53', '2026-05-24 20:02:53'),
(189, 63, 'Investment', 50.00, 'USD', 3250.00, 'Investment in vehicle V000013', '2026-06-06 12:18:30', 200.77, NULL, NULL, '2026-06-06 12:18:30', '2026-06-06 12:18:30'),
(190, 63, 'Profit Share', 4950.00, 'AFN', 4950.00, 'Partner profit from sale S000017 (50%)', '2026-06-06 00:00:00', 5150.77, 80, 1, '2026-06-06 12:19:43', '2026-06-06 12:19:43'),
(191, 63, '', 50.00, 'USD', 3250.00, 'Return of investment in vehicle V000013 (50.00%)', '2026-06-06 00:00:00', 8400.77, 80, 1, '2026-06-06 12:19:43', '2026-06-06 12:19:43'),
(192, 80, 'Sale', 10000.00, 'AFN', 10000.00, 'Purchase of V000013 — total price', '2026-06-06 00:00:00', -10000.00, 80, 1, '2026-06-06 12:19:43', '2026-06-06 12:19:43'),
(193, 80, 'Received', 5000.00, 'AFN', 5000.00, 'Down payment for V000013', '2026-06-06 00:00:00', -5000.00, 80, 1, '2026-06-06 12:19:43', '2026-06-06 12:19:43'),
(194, 80, 'Installment', 5000.00, 'AFN', 5000.00, 'Installment payment for sale S000017 — V000013', '2026-06-06 00:00:00', 0.00, 80, 1, '2026-06-06 12:20:18', '2026-06-06 12:20:18'),
(195, 76, 'Paid', 1000.00, 'AFN', 1000.00, '', '2026-06-06 00:00:00', -450.00, NULL, 1, '2026-06-06 12:40:47', '2026-06-06 12:40:47'),
(196, 76, 'Received', 100.00, 'USD', 6500.00, '', '2026-06-06 00:00:00', 6050.00, NULL, 1, '2026-06-06 12:43:09', '2026-06-06 12:43:09'),
(197, 76, 'Paid', 50.00, 'USD', 3175.00, '', '2026-06-06 00:00:00', 2875.00, NULL, 1, '2026-06-06 12:54:24', '2026-06-06 12:54:24'),
(198, 76, '', 1000.00, 'AFN', 1000.00, '', '2026-07-01 00:00:00', 3875.00, NULL, 1, '2026-07-01 07:08:21', '2026-07-01 07:08:21'),
(199, 63, 'Profit Share', 50.00, 'USD', 3175.00, 'Partner profit from sale S000018 (50%)', '2026-07-01 00:00:00', 11575.77, 81, 1, '2026-07-01 08:00:18', '2026-07-01 08:00:18'),
(200, 63, '', 50.00, 'USD', 3175.00, 'Return of investment in vehicle V000016 (50.00%)', '2026-07-01 00:00:00', 14750.77, 81, 1, '2026-07-01 08:00:18', '2026-07-01 08:00:18'),
(201, 81, 'Sale', 200.00, 'AFN', 200.00, 'Purchase of V000016 — total price', '2026-07-01 00:00:00', -200.00, 81, 1, '2026-07-01 08:00:18', '2026-07-01 08:00:18'),
(202, 81, 'Received', 200.00, 'AFN', 200.00, 'Down payment for V000016', '2026-07-01 00:00:00', 0.00, 81, 1, '2026-07-01 08:00:18', '2026-07-01 08:00:18'),
(203, 82, 'Sale', 4000.00, 'AFN', 4000.00, 'Purchase of V000018 — total price', '2026-07-05 00:00:00', -4000.00, 82, 1, '2026-07-05 19:24:28', '2026-07-05 19:24:28'),
(204, 82, 'Received', 4000.00, 'AFN', 4000.00, 'Down payment for V000018', '2026-07-05 00:00:00', 0.00, 82, 1, '2026-07-05 19:24:28', '2026-07-05 19:24:28'),
(205, 63, 'Investment', 50.00, 'USD', 3175.00, 'Investment in vehicle V000012', '2026-07-06 04:42:52', 300.77, NULL, NULL, '2026-07-06 04:42:52', '2026-07-06 04:42:52'),
(206, 63, 'Profit Share', 25.00, 'USD', 1587.50, 'Partner profit from sale S000020 (50%)', '2026-07-06 00:00:00', 1888.27, 83, 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(207, 63, '', 3250.00, 'AFN', 3250.00, 'Return of investment in vehicle V000009 (50.00%)', '2026-07-06 00:00:00', 5138.27, 83, 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(208, 83, 'Sale', 150.00, 'AFN', 150.00, 'Purchase of V000009 — total price', '2026-07-06 00:00:00', -150.00, 83, 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(209, 83, 'Received', 150.00, 'AFN', 150.00, 'Down payment for V000009', '2026-07-06 00:00:00', 0.00, 83, 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(210, 63, 'Profit Share', 50.00, 'USD', 3175.00, 'Partner profit from sale S000021 (50%)', '2026-07-06 00:00:00', 8313.27, 84, 1, '2026-07-06 05:39:49', '2026-07-06 05:39:49'),
(211, 63, '', 50.00, 'USD', 3175.00, 'Return of investment in vehicle V000012 (50.00%)', '2026-07-06 00:00:00', 11488.27, 84, 1, '2026-07-06 05:39:49', '2026-07-06 05:39:49'),
(212, 59, 'Sale', 200.00, 'AFN', 200.00, 'Purchase of V000012 — total price', '2026-07-06 00:00:00', -200.00, 84, 1, '2026-07-06 05:39:49', '2026-07-06 05:39:49'),
(213, 59, 'Received', 200.00, 'AFN', 200.00, 'Down payment for V000012', '2026-07-06 00:00:00', 0.00, 84, 1, '2026-07-06 05:39:49', '2026-07-06 05:39:49'),
(214, 84, 'Sale', 200.00, 'AFN', 200.00, 'Purchase of V000019 — total price', '2026-07-08 00:00:00', -200.00, 85, 1, '2026-07-08 11:03:09', '2026-07-08 11:03:09'),
(215, 84, 'Received', 200.00, 'AFN', 200.00, 'Down payment for V000019', '2026-07-08 00:00:00', 0.00, 85, 1, '2026-07-08 11:03:09', '2026-07-08 11:03:09');

-- --------------------------------------------------------

--
-- Table structure for table `edit_history`
--

CREATE TABLE `edit_history` (
  `id` int(11) NOT NULL,
  `entityType` varchar(50) NOT NULL,
  `entityId` int(11) NOT NULL,
  `fieldName` varchar(100) NOT NULL,
  `oldValue` text DEFAULT NULL,
  `newValue` text DEFAULT NULL,
  `reason` text NOT NULL,
  `editedBy` int(11) NOT NULL,
  `editedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `edit_history`
--

INSERT INTO `edit_history` (`id`, `entityType`, `entityId`, `fieldName`, `oldValue`, `newValue`, `reason`, `editedBy`, `editedAt`) VALUES
(353, 'Vehicle', 70, 'color', 'null', '', '120', 1, '2026-05-21 10:15:41'),
(354, 'Vehicle', 70, 'sellingPrice', 'null', '600', '120', 1, '2026-05-21 10:15:41'),
(355, 'Vehicle', 70, 'transmission', 'null', '', '120', 1, '2026-05-21 10:15:41'),
(356, 'Vehicle', 70, 'mileage', 'null', '0', '120', 1, '2026-05-21 10:15:41'),
(357, 'Vehicle', 70, 'plateNo', 'null', '', '120', 1, '2026-05-21 10:15:41'),
(358, 'Vehicle', 70, 'vehicleLicense', 'null', '', '120', 1, '2026-05-21 10:15:41'),
(359, 'Vehicle', 72, 'color', 'null', '', 'jj', 1, '2026-05-21 11:21:13'),
(360, 'Vehicle', 72, 'sellingPrice', 'null', '300', 'jj', 1, '2026-05-21 11:21:13'),
(361, 'Vehicle', 72, 'fuelType', 'null', '', 'jj', 1, '2026-05-21 11:21:13'),
(362, 'Vehicle', 72, 'transmission', 'null', '', 'jj', 1, '2026-05-21 11:21:13'),
(363, 'Vehicle', 72, 'mileage', 'null', '0', 'jj', 1, '2026-05-21 11:21:13'),
(364, 'Vehicle', 72, 'plateNo', 'null', '', 'jj', 1, '2026-05-21 11:21:13'),
(365, 'Vehicle', 72, 'vehicleLicense', 'null', '', 'jj', 1, '2026-05-21 11:21:13'),
(366, 'Vehicle', 73, 'baseCurrency', 'USD', 'AFN', 'nn', 1, '2026-05-21 11:29:27'),
(367, 'Vehicle', 73, 'totalCostPKR', '6500.00', '100', 'nn', 1, '2026-05-21 11:29:27'),
(368, 'Vehicle', 75, 'baseCurrency', 'USD', 'AFN', '11', 1, '2026-05-21 11:58:44'),
(369, 'Vehicle', 75, 'totalCostPKR', '6500.00', '100', '11', 1, '2026-05-21 11:58:44'),
(370, 'Vehicle', 75, 'baseCurrency', 'AFN', 'USD', '10', 1, '2026-05-21 12:10:31'),
(371, 'Vehicle', 75, 'sellingPrice', '150.00', '200', '10', 1, '2026-05-21 12:10:31'),
(372, 'Vehicle', 75, 'sellingPriceCurrency', 'AFN', 'USD', '10', 1, '2026-05-21 12:10:31'),
(373, 'Vehicle', 75, 'totalCostPKR', '100.00', '6500', '10', 1, '2026-05-21 12:10:31'),
(374, 'Vehicle', 74, 'color', 'null', '', '15', 1, '2026-05-22 21:39:16'),
(375, 'Vehicle', 74, 'sellingPrice', 'null', '300', '15', 1, '2026-05-22 21:39:16'),
(376, 'Vehicle', 74, 'fuelType', 'null', '', '15', 1, '2026-05-22 21:39:16'),
(377, 'Vehicle', 74, 'transmission', 'null', '', '15', 1, '2026-05-22 21:39:16'),
(378, 'Vehicle', 74, 'mileage', 'null', '0', '15', 1, '2026-05-22 21:39:16'),
(379, 'Vehicle', 74, 'plateNo', 'null', '', '15', 1, '2026-05-22 21:39:16'),
(380, 'Vehicle', 74, 'vehicleLicense', 'null', '', '15', 1, '2026-05-22 21:39:16'),
(381, 'Vehicle', 80, 'sellingPrice', '200.00', '10000', '4336\n', 1, '2026-06-06 12:18:30'),
(382, 'Vehicle', 80, 'sellingPriceCurrency', 'USD', 'AFN', '4336\n', 1, '2026-06-06 12:18:30'),
(383, 'Vehicle', 90, 'plateNo', '', 'KDR-34567', '123\n\n', 1, '2026-07-05 19:18:18'),
(384, 'Vehicle', 90, 'vehicleLicense', '', 'hd45678', '123\n\n', 1, '2026-07-05 19:18:18'),
(385, 'Vehicle', 79, 'plateNo', '', 'KDR-123', 'a', 1, '2026-07-06 04:42:52'),
(386, 'Vehicle', 79, 'vehicleLicense', '', '24dslkfj34', 'a', 1, '2026-07-06 04:42:52'),
(387, 'Vehicle', 79, 'totalCostPKR', '6500.00', '6350', 'a', 1, '2026-07-06 04:42:52'),
(388, 'Vehicle', 91, 'sellingPrice', 'null', '200', 'س', 1, '2026-07-08 11:02:06'),
(389, 'Vehicle', 91, 'sellingPriceCurrency', 'AFN', 'USD', 'س', 1, '2026-07-08 11:02:06'),
(390, 'Vehicle', 91, 'transmission', 'null', '', 'س', 1, '2026-07-08 11:02:06');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `employeeId` varchar(50) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `tazkiraNumber` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `monthlySalary` decimal(15,2) NOT NULL,
  `joiningDate` datetime NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `biometricId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employeeId`, `fullName`, `phoneNumber`, `email`, `tazkiraNumber`, `address`, `role`, `monthlySalary`, `joiningDate`, `status`, `biometricId`, `createdAt`, `updatedAt`) VALUES
(1, 'EMP0001', 'khan', '070000000', '', '12', '', 'HR', 30000.00, '2026-02-14 00:00:00', 'Active', '', '2026-02-14 19:31:21', '2026-04-11 14:06:24'),
(2, 'EMP0002', 'jan', '+919000183872', '', '', 'tarnaka', 'manager2', 30000.00, '2026-02-14 00:00:00', 'Active', '', '2026-02-14 20:19:38', '2026-04-11 14:06:30'),
(3, 'EMP0003', 'Karim', '0700012365', 'karim@gmail.com', '12548899621', 'Kandahar', 'Sales Manager', 20000.00, '2026-05-05 00:00:00', 'Active', '3', '2026-05-05 16:56:18', '2026-05-07 15:23:18'),
(4, '', 'Bashir', '0700000000', 'bashir@gmail.com', '6654657435454', '', 'worker', 10000.00, '2026-05-07 00:00:00', 'Active', '', '2026-05-07 13:56:06', '2026-05-07 13:56:06'),
(9, '0005', 'Salim', '07000000000', 'salim@gmail.com', '5454545646546', '', 'accountant', 40000.00, '2026-05-07 00:00:00', 'Active', '', '2026-05-07 14:15:52', '2026-05-07 14:15:52'),
(10, 'ZK_4', 'Z Employee', '0000000000', '', '', '', 'worker', 20000.00, '2026-05-07 00:00:00', 'Active', '4', '2026-05-07 14:50:52', '2026-05-13 21:11:25'),
(11, 'EMP0007', 'Qasam', '07000000000', 'qasam@gmail.com', '654876354985', '', 'sales', 120000.00, '2026-05-07 00:00:00', 'Active', '', '2026-05-07 15:19:44', '2026-05-07 15:19:44');

-- --------------------------------------------------------

--
-- Table structure for table `exchange_rates`
--

CREATE TABLE `exchange_rates` (
  `id` int(11) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `rateToAFN` decimal(15,6) NOT NULL COMMENT 'How many AFN for 1 unit of this currency',
  `effectiveDate` datetime NOT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `updatedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exchange_rates`
--

INSERT INTO `exchange_rates` (`id`, `currency`, `rateToAFN`, `effectiveDate`, `isActive`, `updatedBy`, `createdAt`, `updatedAt`) VALUES
(1, 'USD', 63.500000, '2026-06-06 12:51:32', 1, 1, '2026-02-08 09:32:15', '2026-06-06 12:51:32'),
(2, 'PKR', 0.200000, '2026-06-06 12:52:25', 1, 1, '2026-02-08 09:32:15', '2026-06-06 12:52:25'),
(3, 'AED', 22.000000, '2026-06-06 12:52:35', 1, 1, '2026-05-21 07:01:49', '2026-06-06 12:52:35');

-- --------------------------------------------------------

--
-- Table structure for table `ledger_transactions`
--

CREATE TABLE `ledger_transactions` (
  `id` int(11) NOT NULL,
  `transactionId` varchar(50) NOT NULL,
  `transactionType` enum('Credit','Debit','Vehicle Purchase','Vehicle Sale','Salary','Expense','Currency Exchange','Loan','Commission') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'AFN',
  `amountPKR` decimal(15,2) NOT NULL,
  `relatedEntityType` varchar(50) DEFAULT NULL,
  `relatedEntityId` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `transactionDate` datetime NOT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ledger_transactions`
--

INSERT INTO `ledger_transactions` (`id`, `transactionId`, `transactionType`, `amount`, `currency`, `amountPKR`, `relatedEntityType`, `relatedEntityId`, `description`, `transactionDate`, `createdBy`, `createdAt`, `updatedAt`) VALUES
(82, 'TR1779356673868', 'Vehicle Sale', 150.00, 'AFN', 150.00, 'Sale', 63, 'Vehicle V000001 sold to customer', '2026-05-21 00:00:00', 1, '2026-05-21 09:44:33', '2026-05-21 09:44:33'),
(83, 'TR1779358335148', 'Vehicle Sale', 600.00, 'AFN', 600.00, 'Sale', 64, 'Vehicle V000002 sold to customer', '2026-05-21 00:00:00', 1, '2026-05-21 10:12:15', '2026-05-21 10:12:15'),
(84, 'TR1779358583462', 'Vehicle Sale', 600.00, 'AFN', 600.00, 'Sale', 65, 'Vehicle V000003 sold to customer', '2026-05-21 00:00:00', 1, '2026-05-21 10:16:23', '2026-05-21 10:16:23'),
(85, 'TR1779358583482_9', 'Commission', 50.00, 'AFN', 50.00, 'SaleCommission', 65, 'Partner profit share for Farid from sale S000003 - 50% (profit)', '2026-05-21 00:00:00', 1, '2026-05-21 10:16:23', '2026-05-21 10:16:23'),
(86, 'TR1779362224457', 'Vehicle Sale', 400.00, 'AFN', 400.00, 'Sale', 66, 'Vehicle V000004 sold to customer', '2026-05-21 00:00:00', 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(87, 'TR1779362224483_10', 'Commission', 50.00, 'AFN', 50.00, 'SaleCommission', 66, 'Partner profit share for Farid from sale S000004 - 50% (profit)', '2026-05-21 00:00:00', 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(88, 'TR1779363283574', 'Vehicle Sale', 300.00, 'AFN', 300.00, 'Sale', 67, 'Vehicle V000005 sold to customer', '2026-05-21 00:00:00', 1, '2026-05-21 11:34:43', '2026-05-21 11:34:43'),
(89, 'TR1779363464176', 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Sale', 68, 'Vehicle V000006 sold to customer', '2026-05-21 00:00:00', 1, '2026-05-21 11:37:44', '2026-05-21 11:37:44'),
(90, 'TR1779364794613_SALARY_28', 'Salary', 816.21, 'AFN', 816.21, 'Payroll', 28, 'Salary payment for Z Employee - 5/2026', '2026-05-21 11:59:54', 1, '2026-05-21 11:59:54', '2026-05-21 11:59:54'),
(91, 'TR1779365715996', 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Sale', 69, 'Vehicle V000008 sold to customer', '2026-05-21 00:00:00', 1, '2026-05-21 12:15:15', '2026-05-21 12:15:15'),
(92, 'TR1779365716012_11', 'Commission', 50.00, 'AFN', 50.00, 'SaleCommission', 69, 'Partner profit share for Farid from sale S000007 - 50% (profit)', '2026-05-21 00:00:00', 1, '2026-05-21 12:15:16', '2026-05-21 12:15:16'),
(97, 'TR1779485985116', 'Vehicle Sale', 300.00, 'AFN', 300.00, 'Sale', 72, 'Vehicle V000007 sold to customer', '2026-05-22 00:00:00', 1, '2026-05-22 21:39:45', '2026-05-22 21:39:45'),
(98, 'TR1779485985161_13', 'Commission', 50.00, 'AFN', 50.00, 'SaleCommission', 72, 'Partner profit share for Farid from sale S000009 - 50% (profit)', '2026-05-22 00:00:00', 1, '2026-05-22 21:39:45', '2026-05-22 21:39:45'),
(107, 'TR1779651530722', 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Sale', 77, 'Vehicle V000017 sold to customer', '2026-05-24 00:00:00', 1, '2026-05-24 19:38:50', '2026-05-24 19:38:50'),
(108, 'TR1779651530745_22', 'Commission', 50.00, 'AFN', 50.00, 'SaleCommission', 77, 'Partner profit share for Bilal Khan from sale S000014 - 50% (profit)', '2026-05-24 00:00:00', 1, '2026-05-24 19:38:50', '2026-05-24 19:38:50'),
(109, 'TR1779651641612', 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Sale', 78, 'Vehicle V000015 sold to customer', '2026-05-24 00:00:00', 1, '2026-05-24 19:40:41', '2026-05-24 19:40:41'),
(110, 'TR1779651641628_21', 'Commission', 50.00, 'USD', 3250.00, 'SaleCommission', 78, 'Partner profit share for Farid from sale S000015 - 50% (profit)', '2026-05-24 00:00:00', 1, '2026-05-24 19:40:41', '2026-05-24 19:40:41'),
(111, 'TR1779652695671', 'Credit', 50.00, 'USD', 3250.00, 'Installment', 78, 'Installment payment — S000015', '2026-05-24 00:00:00', 1, '2026-05-24 19:58:15', '2026-05-24 19:58:15'),
(112, 'TR1779652891457', 'Vehicle Sale', 300.00, 'AFN', 300.00, 'Sale', 79, 'Vehicle V000014 sold to customer', '2026-05-24 00:00:00', 1, '2026-05-24 20:01:31', '2026-05-24 20:01:31'),
(113, 'TR1779652891478_18', 'Commission', 50.00, 'AFN', 50.00, 'SaleCommission', 79, 'Partner profit share for Farid from sale S000016 - 50% (profit)', '2026-05-24 00:00:00', 1, '2026-05-24 20:01:31', '2026-05-24 20:01:31'),
(114, 'TR1779652973695', 'Credit', 100.00, 'AFN', 100.00, 'Installment', 79, 'Installment payment — S000016', '2026-05-24 00:00:00', 1, '2026-05-24 20:02:53', '2026-05-24 20:02:53'),
(115, 'TR1780748383433', 'Vehicle Sale', 10000.00, 'AFN', 10000.00, 'Sale', 80, 'Vehicle V000013 sold to customer', '2026-06-06 00:00:00', 1, '2026-06-06 12:19:43', '2026-06-06 12:19:43'),
(116, 'TR1780748383524_23', 'Commission', 4950.00, 'AFN', 4950.00, 'SaleCommission', 80, 'Partner profit share for Farid from sale S000017 - 50% (profit)', '2026-06-06 00:00:00', 1, '2026-06-06 12:19:43', '2026-06-06 12:19:43'),
(117, 'TR1780748419000', 'Credit', 5000.00, 'AFN', 5000.00, 'Installment', 80, 'Installment payment — S000017', '2026-06-06 00:00:00', 1, '2026-06-06 12:20:19', '2026-06-06 12:20:19'),
(118, 'TR1782892818588', 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Sale', 81, 'Vehicle V000016 sold to customer', '2026-07-01 00:00:00', 1, '2026-07-01 08:00:18', '2026-07-01 08:00:18'),
(119, 'TR1782892818602_20', 'Commission', 50.00, 'USD', 3175.00, 'SaleCommission', 81, 'Partner profit share for Farid from sale S000018 - 50% (profit)', '2026-07-01 00:00:00', 1, '2026-07-01 08:00:18', '2026-07-01 08:00:18'),
(120, 'TR1783279468562', 'Vehicle Sale', 4000.00, 'AFN', 4000.00, 'Sale', 82, 'Vehicle V000018 sold to customer', '2026-07-05 00:00:00', 1, '2026-07-05 19:24:28', '2026-07-05 19:24:28'),
(121, 'TR1783313703451', 'Vehicle Sale', 150.00, 'AFN', 150.00, 'Sale', 83, 'Vehicle V000009 sold to customer', '2026-07-06 00:00:00', 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(122, 'TR1783313703466_12', 'Commission', 25.00, 'USD', 1587.50, 'SaleCommission', 83, 'Partner profit share for Farid from sale S000020 - 50% (profit)', '2026-07-06 00:00:00', 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(123, 'TR1783316389529', 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Sale', 84, 'Vehicle V000012 sold to customer', '2026-07-06 00:00:00', 1, '2026-07-06 05:39:49', '2026-07-06 05:39:49'),
(124, 'TR1783316389570_24', 'Commission', 50.00, 'USD', 3175.00, 'SaleCommission', 84, 'Partner profit share for Farid from sale S000021 - 50% (profit)', '2026-07-06 00:00:00', 1, '2026-07-06 05:39:49', '2026-07-06 05:39:49'),
(125, 'TR1783508589163', 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Sale', 85, 'Vehicle V000019 sold to customer', '2026-07-08 00:00:00', 1, '2026-07-08 11:03:09', '2026-07-08 11:03:09');

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` int(11) NOT NULL,
  `personName` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'AFN',
  `amountInPKR` decimal(15,2) NOT NULL,
  `borrowDate` datetime NOT NULL,
  `type` enum('Borrowed','Lent','Owner Loan') NOT NULL,
  `status` enum('Open','Paid') DEFAULT 'Open',
  `notes` text DEFAULT NULL,
  `addedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` int(11) NOT NULL,
  `employeeId` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `baseSalary` decimal(15,2) NOT NULL,
  `presentDays` int(11) DEFAULT 0,
  `absentDays` int(11) DEFAULT 0,
  `calculatedSalary` decimal(15,2) NOT NULL,
  `commission` decimal(15,2) DEFAULT 0.00,
  `deductions` decimal(15,2) DEFAULT 0.00,
  `totalAmount` decimal(15,2) NOT NULL,
  `paidAmount` decimal(15,2) DEFAULT 0.00,
  `paymentDate` datetime DEFAULT NULL,
  `status` enum('Pending','Paid','Partial') DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  `paidBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`id`, `employeeId`, `month`, `year`, `baseSalary`, `presentDays`, `absentDays`, `calculatedSalary`, `commission`, `deductions`, `totalAmount`, `paidAmount`, `paymentDate`, `status`, `notes`, `paidBy`, `createdAt`, `updatedAt`) VALUES
(23, 1, 5, 2026, 0.00, 0, 31, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, 'Pending', 'Auto-generated', 1, '2026-05-21 11:59:10', '2026-05-21 11:59:10'),
(24, 2, 5, 2026, 0.00, 0, 31, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, 'Pending', 'Auto-generated', 1, '2026-05-21 11:59:10', '2026-05-21 11:59:10'),
(25, 3, 5, 2026, 0.00, 0, 31, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, 'Pending', 'Auto-generated', 1, '2026-05-21 11:59:10', '2026-05-21 11:59:10'),
(26, 4, 5, 2026, 1935.48, 6, 25, 1935.48, 0.00, 0.00, 1935.48, 0.00, NULL, 'Pending', 'Auto-generated', 1, '2026-05-21 11:59:10', '2026-05-21 11:59:10'),
(27, 9, 5, 2026, 0.00, 0, 31, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, 'Pending', 'Auto-generated', 1, '2026-05-21 11:59:10', '2026-05-21 11:59:10'),
(28, 10, 5, 2026, 816.21, 1, 30, 816.21, 0.00, 0.00, 816.21, 816.21, '2026-05-21 11:59:54', 'Paid', 'Auto-generated', 1, '2026-05-21 11:59:10', '2026-05-21 11:59:54'),
(29, 11, 5, 2026, 0.00, 0, 31, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, 'Pending', 'Auto-generated', 1, '2026-05-21 11:59:10', '2026-05-21 11:59:10');

-- --------------------------------------------------------

--
-- Table structure for table `punch_logs`
--

CREATE TABLE `punch_logs` (
  `id` int(11) NOT NULL,
  `employeeId` int(11) NOT NULL,
  `punchTime` datetime NOT NULL,
  `date` date NOT NULL,
  `source` varchar(255) DEFAULT 'ZK_SYNC',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `type` enum('PUNCH','LEAVE') DEFAULT 'PUNCH',
  `leaveReason` text DEFAULT NULL,
  `leaveType` varchar(50) DEFAULT NULL,
  `leaveStatus` varchar(20) DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `punch_logs`
--

INSERT INTO `punch_logs` (`id`, `employeeId`, `punchTime`, `date`, `source`, `createdAt`, `updatedAt`, `type`, `leaveReason`, `leaveType`, `leaveStatus`) VALUES
(1, 10, '2026-05-07 06:32:32', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(2, 10, '2026-05-07 06:37:14', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(3, 10, '2026-05-07 11:41:25', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(4, 10, '2026-05-07 11:43:01', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(5, 10, '2026-05-07 11:49:38', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(6, 10, '2026-05-07 12:17:06', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(7, 10, '2026-05-07 12:21:18', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(8, 10, '2026-05-07 12:27:41', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(9, 10, '2026-05-07 12:36:01', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(10, 10, '2026-05-07 12:59:48', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(11, 10, '2026-05-07 14:17:27', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(12, 10, '2026-05-07 14:19:02', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(13, 10, '2026-05-07 14:33:31', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(14, 10, '2026-05-07 14:39:45', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(15, 10, '2026-05-07 14:45:50', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(16, 10, '2026-05-07 14:50:43', '2026-05-07', 'ZK_SYNC', '2026-05-07 14:50:52', '2026-05-07 14:50:52', 'PUNCH', NULL, NULL, 'Pending'),
(17, 10, '2026-05-07 06:32:32', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(18, 10, '2026-05-07 06:37:14', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(19, 10, '2026-05-07 11:41:25', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(20, 10, '2026-05-07 11:43:01', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(21, 10, '2026-05-07 11:49:38', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(22, 10, '2026-05-07 12:17:06', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(23, 10, '2026-05-07 12:21:18', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(24, 10, '2026-05-07 12:27:41', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(25, 10, '2026-05-07 12:36:01', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(26, 10, '2026-05-07 12:59:48', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(27, 10, '2026-05-07 14:17:27', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(28, 10, '2026-05-07 14:19:02', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(29, 10, '2026-05-07 14:33:31', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(30, 10, '2026-05-07 14:39:45', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(31, 10, '2026-05-07 14:45:50', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(32, 10, '2026-05-07 14:50:43', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(33, 10, '2026-05-07 15:15:15', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:15:18', '2026-05-07 15:15:18', 'PUNCH', NULL, NULL, 'Pending'),
(34, 3, '2026-05-07 15:21:21', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:23:42', '2026-05-07 15:23:42', 'PUNCH', NULL, NULL, 'Pending'),
(35, 3, '2026-05-07 15:23:26', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:23:42', '2026-05-07 15:23:42', 'PUNCH', NULL, NULL, 'Pending'),
(36, 10, '2026-05-07 15:24:58', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:25:17', '2026-05-07 15:25:17', 'PUNCH', NULL, NULL, 'Pending'),
(37, 3, '2026-05-07 15:25:53', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:25:58', '2026-05-07 15:25:58', 'PUNCH', NULL, NULL, 'Pending'),
(38, 10, '2026-05-07 15:26:04', '2026-05-07', 'ZK_SYNC', '2026-05-07 15:26:07', '2026-05-07 15:26:07', 'PUNCH', NULL, NULL, 'Pending'),
(39, 10, '2026-05-09 08:16:56', '2026-05-09', 'ZK_SYNC', '2026-05-09 08:17:04', '2026-05-09 08:17:04', 'PUNCH', NULL, NULL, 'Pending'),
(40, 10, '2026-05-09 08:22:23', '2026-05-09', 'ZK_SYNC', '2026-05-09 08:22:27', '2026-05-09 08:22:27', 'PUNCH', NULL, NULL, 'Pending'),
(41, 3, '2026-05-09 08:23:09', '2026-05-09', 'ZK_SYNC', '2026-05-09 08:23:12', '2026-05-09 08:23:12', 'PUNCH', NULL, NULL, 'Pending'),
(42, 3, '2026-05-09 08:26:18', '2026-05-09', 'ZK_SYNC', '2026-05-09 08:26:21', '2026-05-09 08:26:21', 'PUNCH', NULL, NULL, 'Pending'),
(43, 10, '2026-05-09 08:27:32', '2026-05-09', 'ZK_SYNC', '2026-05-09 08:27:34', '2026-05-09 08:27:34', 'PUNCH', NULL, NULL, 'Pending'),
(44, 4, '0000-00-00 00:00:00', '2026-05-10', 'MANUAL_LEAVE', '2026-05-09 11:00:11', '2026-05-09 11:00:11', 'LEAVE', NULL, 'Annual', 'Pending'),
(45, 4, '0000-00-00 00:00:00', '2026-05-11', 'MANUAL_LEAVE', '2026-05-09 11:00:11', '2026-05-09 11:00:11', 'LEAVE', NULL, 'Annual', 'Pending'),
(46, 4, '0000-00-00 00:00:00', '2026-05-12', 'MANUAL_LEAVE', '2026-05-09 11:00:11', '2026-05-09 11:00:11', 'LEAVE', NULL, 'Annual', 'Pending'),
(47, 4, '0000-00-00 00:00:00', '2026-05-13', 'MANUAL_LEAVE', '2026-05-09 11:00:11', '2026-05-09 11:00:11', 'LEAVE', NULL, 'Annual', 'Pending'),
(48, 4, '0000-00-00 00:00:00', '2026-05-14', 'MANUAL_LEAVE', '2026-05-09 11:00:11', '2026-05-09 11:00:11', 'LEAVE', NULL, 'Annual', 'Pending'),
(49, 4, '0000-00-00 00:00:00', '2026-05-15', 'MANUAL_LEAVE', '2026-05-09 11:00:11', '2026-05-09 11:00:11', 'LEAVE', NULL, 'Annual', 'Pending'),
(50, 10, '2026-05-09 11:02:32', '2026-05-09', 'ZK_SYNC', '2026-05-09 11:02:34', '2026-05-09 11:02:34', 'PUNCH', NULL, NULL, 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `reference_persons`
--

CREATE TABLE `reference_persons` (
  `id` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `tazkiraNumber` varchar(50) DEFAULT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `photoPath` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `saleId` varchar(50) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `sellingPrice` decimal(15,2) NOT NULL,
  `totalCost` decimal(15,2) NOT NULL,
  `profit` decimal(15,2) NOT NULL,
  `commission` decimal(15,2) DEFAULT 0.00,
  `ownerShare` decimal(15,2) NOT NULL,
  `saleDate` datetime NOT NULL,
  `paymentMethod` varchar(50) DEFAULT 'Cash',
  `downPayment` decimal(15,2) DEFAULT 0.00,
  `remainingAmount` decimal(15,2) DEFAULT 0.00,
  `paidAmount` decimal(15,2) DEFAULT 0.00,
  `paymentStatus` enum('Paid','Partial','Pending') DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  `invoicePath` varchar(255) DEFAULT NULL,
  `soldBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `saleType` enum('Exchange Car','Container One Key','Licensed Car') NOT NULL DEFAULT 'Container One Key',
  `sellerName` varchar(255) DEFAULT NULL,
  `sellerFatherName` varchar(255) DEFAULT NULL,
  `sellerProvince` varchar(100) DEFAULT NULL,
  `sellerDistrict` varchar(100) DEFAULT NULL,
  `sellerVillage` varchar(255) DEFAULT NULL,
  `sellerAddress` text DEFAULT NULL,
  `sellerIdNumber` varchar(50) DEFAULT NULL,
  `sellerPhone` varchar(20) DEFAULT NULL,
  `exchVehicleColor` varchar(50) DEFAULT NULL,
  `exchVehicleModel` varchar(100) DEFAULT NULL,
  `exchVehicleEngine` varchar(100) DEFAULT NULL,
  `exchVehicleChassis` varchar(100) DEFAULT NULL,
  `exchVehicleFuelType` varchar(50) DEFAULT NULL,
  `exchVehiclePlateNo` varchar(50) DEFAULT NULL,
  `exchVehicleMonolithicCut` varchar(50) DEFAULT NULL,
  `priceDifference` decimal(15,2) DEFAULT 0.00,
  `priceDifferencePaidBy` enum('Buyer','Seller') DEFAULT 'Buyer',
  `trafficTransferDate` datetime DEFAULT NULL,
  `note2` text DEFAULT NULL,
  `witnessName1` varchar(255) DEFAULT NULL,
  `witnessName2` varchar(255) DEFAULT NULL,
  `exchangeVehicleId` int(11) DEFAULT NULL COMMENT 'ID of the new vehicle created in inventory from exchange',
  `exchVehicleCategory` varchar(100) DEFAULT NULL,
  `exchVehicleManufacturer` varchar(100) DEFAULT NULL,
  `exchVehicleYear` int(11) DEFAULT NULL,
  `exchVehicleEngineType` varchar(100) DEFAULT NULL,
  `exchVehicleTransmission` varchar(50) DEFAULT NULL,
  `exchVehicleMileage` int(11) DEFAULT NULL,
  `exchVehicleLicense` varchar(100) DEFAULT NULL,
  `exchVehicleSteering` varchar(20) DEFAULT 'Left',
  `buyerName` varchar(255) DEFAULT NULL,
  `buyerFatherName` varchar(255) DEFAULT NULL,
  `buyerProvince` varchar(100) DEFAULT NULL,
  `buyerDistrict` varchar(100) DEFAULT NULL,
  `buyerVillage` varchar(255) DEFAULT NULL,
  `buyerAddress` text DEFAULT NULL,
  `buyerIdNumber` varchar(50) DEFAULT NULL,
  `buyerPhone` varchar(20) DEFAULT NULL,
  `paymentCurrency` varchar(10) DEFAULT 'AFN',
  `licensePersonName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `saleId`, `vehicleId`, `customerId`, `sellingPrice`, `totalCost`, `profit`, `commission`, `ownerShare`, `saleDate`, `paymentMethod`, `downPayment`, `remainingAmount`, `paidAmount`, `paymentStatus`, `notes`, `invoicePath`, `soldBy`, `createdAt`, `updatedAt`, `saleType`, `sellerName`, `sellerFatherName`, `sellerProvince`, `sellerDistrict`, `sellerVillage`, `sellerAddress`, `sellerIdNumber`, `sellerPhone`, `exchVehicleColor`, `exchVehicleModel`, `exchVehicleEngine`, `exchVehicleChassis`, `exchVehicleFuelType`, `exchVehiclePlateNo`, `exchVehicleMonolithicCut`, `priceDifference`, `priceDifferencePaidBy`, `trafficTransferDate`, `note2`, `witnessName1`, `witnessName2`, `exchangeVehicleId`, `exchVehicleCategory`, `exchVehicleManufacturer`, `exchVehicleYear`, `exchVehicleEngineType`, `exchVehicleTransmission`, `exchVehicleMileage`, `exchVehicleLicense`, `exchVehicleSteering`, `buyerName`, `buyerFatherName`, `buyerProvince`, `buyerDistrict`, `buyerVillage`, `buyerAddress`, `buyerIdNumber`, `buyerPhone`, `paymentCurrency`, `licensePersonName`) VALUES
(63, 'S000001', 68, 61, 150.00, 100.00, 50.00, 0.00, 50.00, '2026-05-21 00:00:00', 'Cash', 150.00, 0.00, 150.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000001.pdf', 1, '2026-05-21 09:44:33', '2026-05-21 09:44:35', 'Container One Key', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'jan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'USD', NULL),
(64, 'S000002', 69, 62, 600.00, 500.00, 100.00, 0.00, 100.00, '2026-05-21 00:00:00', 'Cash', 600.00, 0.00, 600.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Exchange_Car_S000002.pdf', 1, '2026-05-21 10:12:15', '2026-05-21 10:12:16', 'Exchange Car', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'car', 'dsjfklkr3rfk', 'SDAFJDJSFK3443dsfk', 'Petrol', NULL, 'Monolithic', 100.00, 'Buyer', NULL, NULL, NULL, NULL, 70, 'Coupe', 'Audi', 2025, 'V4', NULL, NULL, NULL, 'Left', 'Jan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(65, 'S000003', 70, 64, 600.00, 500.00, 100.00, 50.00, 50.00, '2026-05-21 00:00:00', 'Cash', 600.00, 0.00, 600.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000003.pdf', 1, '2026-05-21 10:16:23', '2026-05-21 10:16:24', 'Container One Key', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'Mohammad', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(66, 'S000004', 71, 65, 400.00, 300.00, 100.00, 50.00, 50.00, '2026-05-21 00:00:00', 'Cash', 400.00, 0.00, 400.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Exchange_Car_S000004.pdf', 1, '2026-05-21 11:17:04', '2026-05-21 11:17:06', 'Exchange Car', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'camery', 'DFGK2342edf', 'SDJFJSDJFK3432', NULL, NULL, 'Monolithic', 200.00, 'Buyer', NULL, NULL, NULL, NULL, 72, 'Van', 'KIA', 2023, 'V4', NULL, NULL, NULL, 'Left', 'Baz', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(67, 'S000005', 72, 66, 300.00, 200.00, 100.00, 0.00, 100.00, '2026-05-21 00:00:00', 'Cash', 300.00, 0.00, 300.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Exchange_Car_S000005.pdf', 1, '2026-05-21 11:34:43', '2026-05-21 11:34:45', 'Exchange Car', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'car', 'DSFDF4334resdf', 'SDAJGKFD343fds', NULL, NULL, 'Monolithic', 100.00, 'Buyer', NULL, NULL, NULL, NULL, 74, 'SUV', 'Audi', 2024, 'Inline-4', NULL, NULL, NULL, 'Left', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(68, 'S000006', 73, 67, 200.00, 100.00, 100.00, 0.00, 100.00, '2026-05-21 00:00:00', 'Cash', 200.00, 0.00, 200.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000006.pdf', 1, '2026-05-21 11:37:44', '2026-05-21 11:37:45', 'Container One Key', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(69, 'S000007', 75, 68, 200.00, 100.00, 100.00, 50.00, 50.00, '2026-05-21 00:00:00', 'Cash', 200.00, 0.00, 200.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000007.pdf', 1, '2026-05-21 12:15:15', '2026-05-21 12:15:17', 'Container One Key', 'khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'jan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'USD', NULL),
(72, 'S000009', 74, 71, 300.00, 200.00, 100.00, 50.00, 50.00, '2026-05-22 00:00:00', 'Cash', 300.00, 0.00, 300.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000009.pdf', 1, '2026-05-22 21:39:45', '2026-05-22 21:39:47', 'Container One Key', 'test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(77, 'S000014', 89, 77, 200.00, 100.00, 100.00, 50.00, 50.00, '2026-05-24 00:00:00', 'Cash', 200.00, 0.00, 200.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000014.pdf', 1, '2026-05-24 19:38:50', '2026-05-24 19:38:56', 'Container One Key', 'teat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'kjh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(78, 'S000015', 82, 78, 200.00, 100.00, 100.00, 50.00, 50.00, '2026-05-24 00:00:00', 'Cash', 150.00, 0.00, 200.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000015.pdf', 1, '2026-05-24 19:40:41', '2026-05-24 19:58:15', 'Container One Key', 'kdjf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'Timor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'USD', NULL),
(79, 'S000016', 81, 79, 300.00, 200.00, 100.00, 50.00, 50.00, '2026-05-24 00:00:00', 'Cash', 200.00, 0.00, 300.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000016.pdf', 1, '2026-05-24 20:01:31', '2026-05-24 20:02:53', 'Container One Key', 'tet', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'thh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(80, 'S000017', 80, 80, 10000.00, 100.00, 9900.00, 4950.00, 4950.00, '2026-06-06 00:00:00', 'Cash', 5000.00, 0.00, 10000.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000017.pdf', 1, '2026-06-06 12:19:43', '2026-07-01 07:27:57', 'Container One Key', 'Khpalwak', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'Khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AFN', NULL),
(81, 'S000018', 83, 81, 200.00, 100.00, 100.00, 50.00, 50.00, '2026-07-01 00:00:00', 'Cash', 200.00, 0.00, 200.00, 'Paid', 'دغه موټر چک او خرڅ سودغه موټر چک او خرڅ سودغه موټر چک او خرڅ سودغه موټر چک او خرڅ سودغه موټر چک او خرڅ سودغه موټر چک او خرڅ سودغه موټر چک او خرڅ سودغه موټر چک او خرڅ سو', 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000018.pdf', 1, '2026-07-01 08:00:18', '2026-07-05 18:13:15', 'Container One Key', 'test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, 'ahmad', 'احمد', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'tet=st', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'USD', NULL),
(82, 'S000019', 90, 82, 4000.00, 2000.00, 2000.00, 0.00, 2000.00, '2026-07-05 00:00:00', 'Cash', 4000.00, 0.00, 4000.00, 'Paid', 'دغه موټر خرڅ سو په ټول چک سره هیڅ ډول مشکل نلری یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول', 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Container_One_Key_S000019.pdf', 1, '2026-07-05 19:24:28', '2026-07-06 06:37:21', 'Container One Key', 'احمد', 'محمد', 'کندهار', 'ښار', 'اوله ناحیه', 'اوله ناحیه، کندهار', '۹۷۸۲۳۴۸۲۳۶۴', '۰۷۸۷۶۵۴۳۲۱', NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, 'کریم الله', 'خان جان', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'محمد', 'حان', 'کندخار', 'ښار', '۲ ناحیه', 'کندهار', '۲۳۸۷۴۸۹', '۰۷۱۲۳۴۵۶۷۸', 'AFN', NULL),
(83, 'S000020', 76, 83, 150.00, 100.00, 50.00, 25.00, 25.00, '2026-07-06 00:00:00', 'Cash', 150.00, 0.00, 150.00, 'Paid', 'یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول یاد موټر پوره ډول سره چک او او خرڅ سو، ټول اپشنونه یی وکتل سول', 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Exchange_Car_S000020.pdf', 1, '2026-07-06 04:55:03', '2026-07-06 07:24:30', 'Exchange Car', 'داد محمد', 'حاجی غلام سرور', 'کندهار', 'ښار', 'اوله ناحیه', 'اوله ناحیه، کندهار', '۴۳۵۶۷۷۸۸۹', '۰۷۰۰۱۲۳۴۵۶', 'Blue', 'Corolla', '798607987', 'DJFAFJFKKF2312', 'Hybrid', 'kdr-567', 'Monolithic', 50.00, 'Buyer', NULL, NULL, 'کریم الله', 'نصیر احمد', 91, 'SUV', 'Honda', 2025, 'Inline-6', NULL, 2000, '724384892', 'Left', 'جان محمد', 'سردار محمد', 'کابل', 'ښار', 'شهر نو', 'شهرنو، کابل', '۸۷۶۰۸۵۶۲', '۰۷۰۸۷۶۵۴۳۲', 'USD', NULL),
(84, 'S000021', 79, 59, 200.00, 100.00, 100.00, 50.00, 50.00, '2026-07-06 00:00:00', 'Cash', 200.00, 0.00, 200.00, 'Paid', 'ذکر سوی موټر پوره ډول سره د مشتري له طرف څخه چک او بیا رانیول سو. ذکر سوی موټر پوره ډول سره د مشتري له طرف څخه چک او بیا رانیول سو. ', 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Licensed_Car_S000021.pdf', 1, '2026-07-06 05:39:49', '2026-07-06 07:50:31', 'Licensed Car', 'نثار احمد خپلواک', 'حاجی صاحب', 'کندهار', 'ښار', 'مرکز', 'کندهار، افغانستان', '۸۹۲۵۳۷۹۲۳۸۷۵', '۰۷۱۲۳۴۵۶۷۸', NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', '2027-12-06 00:00:00', NULL, 'احمد', 'محمد', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'ندا محمد', 'حاجی ګل محمد', 'کندهار', 'ښار', '۱۲ ناحیه', '۱۲ ناحیه، کندهار', '۸۷۵۹۶۷', '۰۷۸۷۶۵۴۳۲۱', 'USD', NULL),
(85, 'S000022', 91, 84, 200.00, 100.00, 100.00, 0.00, 100.00, '2026-07-08 00:00:00', 'Cash', 200.00, 0.00, 200.00, 'Paid', NULL, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\Licensed_Car_S000022.pdf', 1, '2026-07-08 11:03:09', '2026-07-08 11:03:11', 'Licensed Car', 'خان', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Monolithic', 0.00, 'Buyer', NULL, NULL, 'احمد', 'محمد', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Left', 'جان', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'USD', 'نقیب الله');

-- --------------------------------------------------------

--
-- Table structure for table `sharing_persons`
--

CREATE TABLE `sharing_persons` (
  `id` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `personName` varchar(255) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `investmentAmount` decimal(15,2) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `customerId` int(11) DEFAULT NULL,
  `calculationMethod` enum('Investment','Percentage') NOT NULL DEFAULT 'Percentage',
  `investmentCurrency` varchar(10) DEFAULT 'AFN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sharing_persons`
--

INSERT INTO `sharing_persons` (`id`, `vehicleId`, `personName`, `percentage`, `investmentAmount`, `phoneNumber`, `isActive`, `createdAt`, `updatedAt`, `customerId`, `calculationMethod`, `investmentCurrency`) VALUES
(9, 70, 'Farid', 50.00, 250.00, '0703654789', 1, '2026-05-21 10:15:41', '2026-05-21 10:15:41', 63, 'Percentage', 'AFN'),
(10, 71, 'Farid', 50.00, 150.00, '0703654789', 1, '2026-05-21 11:14:26', '2026-05-21 11:14:26', 63, 'Percentage', 'AFN'),
(11, 75, 'Farid', 50.00, 3250.00, '0703654789', 1, '2026-05-21 12:10:31', '2026-05-21 12:10:31', 63, 'Percentage', 'AFN'),
(12, 76, 'Farid', 50.00, 3250.00, '0703654789', 1, '2026-05-22 19:52:12', '2026-05-22 19:52:12', 63, 'Percentage', 'AFN'),
(13, 74, 'Farid', 50.00, 100.00, '0703654789', 1, '2026-05-22 21:39:17', '2026-05-22 21:39:17', 63, 'Percentage', 'AFN'),
(14, 77, 'Farid', 50.00, 3250.00, '0703654789', 1, '2026-05-22 21:43:14', '2026-05-22 21:43:14', 63, 'Percentage', 'AFN'),
(15, 78, 'Farid', 50.00, 3250.00, '0703654789', 1, '2026-05-22 22:20:07', '2026-05-22 22:20:07', 63, 'Percentage', 'AFN'),
(18, 81, 'Farid', 50.00, 100.00, '0703654789', 1, '2026-05-23 10:09:27', '2026-05-23 10:09:27', 63, 'Percentage', 'AFN'),
(20, 83, 'Farid', 50.00, 50.00, '0703654789', 1, '2026-05-23 10:53:51', '2026-05-23 10:53:51', 63, 'Percentage', 'USD'),
(21, 82, 'Farid', 50.00, 50.00, '0703654789', 1, '2026-05-23 11:09:10', '2026-05-23 11:09:10', 63, 'Percentage', 'USD'),
(22, 89, 'Bilal Khan', 50.00, 50.00, '07089654123', 1, '2026-05-24 19:37:01', '2026-05-24 19:37:01', 76, 'Percentage', 'AFN'),
(23, 80, 'Farid', 50.00, 50.00, '0703654789', 1, '2026-06-06 12:18:30', '2026-06-06 12:18:30', 63, 'Percentage', 'USD'),
(24, 79, 'Farid', 50.00, 50.00, '0703654789', 1, '2026-07-06 04:42:52', '2026-07-06 04:42:52', 63, 'Percentage', 'USD');

-- --------------------------------------------------------

--
-- Table structure for table `showroom_ledger`
--

CREATE TABLE `showroom_ledger` (
  `id` int(11) NOT NULL,
  `type` enum('Showroom Balance','Expense','Commission','Owner Withdrawal','Currency Exchange','Vehicle Purchase','Vehicle Sale','Loan Given','Loan Received','Salary','Partner Profit') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'AFN',
  `amountInPKR` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `date` datetime NOT NULL,
  `referenceId` int(11) DEFAULT NULL,
  `referenceType` varchar(50) DEFAULT NULL,
  `personName` varchar(255) DEFAULT NULL,
  `addedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `showroom_ledger`
--

INSERT INTO `showroom_ledger` (`id`, `type`, `amount`, `currency`, `amountInPKR`, `description`, `date`, `referenceId`, `referenceType`, `personName`, `addedBy`, `createdAt`, `updatedAt`) VALUES
(246, 'Showroom Balance', 1000.00, 'AFN', 1000.00, '', '2026-05-21 00:00:00', NULL, NULL, NULL, NULL, '2026-05-21 08:37:04', '2026-05-21 08:37:04'),
(247, 'Showroom Balance', 100.00, 'USD', 6500.00, '', '2026-05-21 00:00:00', NULL, NULL, NULL, NULL, '2026-05-21 08:37:25', '2026-05-21 08:37:25'),
(248, 'Showroom Balance', 100.00, 'AED', 2000.00, '', '2026-05-21 00:00:00', NULL, NULL, NULL, NULL, '2026-05-21 08:38:18', '2026-05-21 08:38:18'),
(249, 'Vehicle Purchase', 80.00, 'USD', 5200.00, 'Base Purchase for V000001', '2026-05-21 08:43:22', 68, 'Vehicle', NULL, 1, '2026-05-21 08:43:22', '2026-05-21 08:43:22'),
(250, 'Vehicle Purchase', 10.00, 'USD', 650.00, 'Transport to Dubai for V000001', '2026-05-21 08:43:22', 68, 'Vehicle', NULL, 1, '2026-05-21 08:43:22', '2026-05-21 08:43:22'),
(251, 'Vehicle Purchase', 5.00, 'USD', 325.00, 'Import to Afghanistan for V000001', '2026-05-21 08:43:22', 68, 'Vehicle', NULL, 1, '2026-05-21 08:43:22', '2026-05-21 08:43:22'),
(252, 'Vehicle Purchase', 5.00, 'USD', 325.00, 'Repair for V000001', '2026-05-21 08:43:22', 68, 'Vehicle', NULL, 1, '2026-05-21 08:43:22', '2026-05-21 08:43:22'),
(253, 'Vehicle Purchase', 500.00, 'AFN', 500.00, 'Base Purchase for V000002', '2026-05-21 08:46:47', 69, 'Vehicle', NULL, 1, '2026-05-21 08:46:47', '2026-05-21 08:46:47'),
(257, 'Vehicle Sale', 150.00, 'USD', 9750.00, 'Down payment for V000001 — Paid in full', '2026-05-21 00:00:00', 63, 'Sale', NULL, 1, '2026-05-21 09:44:33', '2026-05-21 09:44:33'),
(258, 'Vehicle Sale', 600.00, 'AFN', 600.00, 'Down payment for V000002 — Paid in full', '2026-05-21 00:00:00', 64, 'Sale', NULL, 1, '2026-05-21 10:12:15', '2026-05-21 10:12:15'),
(259, 'Vehicle Sale', 500.00, 'AFN', 500.00, 'Payment received from Farid – ', '2026-05-21 00:00:00', NULL, NULL, 'Farid', 1, '2026-05-21 10:14:32', '2026-05-21 10:14:32'),
(260, 'Vehicle Sale', 600.00, 'AFN', 600.00, 'Down payment for V000003 — Paid in full', '2026-05-21 00:00:00', 65, 'Sale', NULL, 1, '2026-05-21 10:16:23', '2026-05-21 10:16:23'),
(261, 'Showroom Balance', 50.00, 'AFN', 50.00, 'Partner profit share for Farid from sale S000003 (50%)', '2026-05-21 00:00:00', 65, 'CommissionDistribution', 'Farid', 1, '2026-05-21 10:16:23', '2026-05-21 10:16:23'),
(262, 'Showroom Balance', -50.00, 'AFN', -50.00, 'Payment made to Farid – ', '2026-05-21 00:00:00', NULL, NULL, 'Farid', 1, '2026-05-21 11:01:02', '2026-05-21 11:01:02'),
(263, 'Showroom Balance', 50.00, 'AFN', 50.00, 'Payment received from Farid – ', '2026-05-21 00:00:00', NULL, NULL, 'Farid', 1, '2026-05-21 11:09:58', '2026-05-21 11:09:58'),
(264, 'Showroom Balance', -100.00, 'AFN', -100.00, 'Payment made to Farid – ', '2026-05-21 00:00:00', NULL, NULL, 'Farid', 1, '2026-05-21 11:10:56', '2026-05-21 11:10:56'),
(265, 'Vehicle Purchase', 300.00, 'AFN', 300.00, 'Base Purchase for V000004', '2026-05-21 11:14:26', 71, 'Vehicle', NULL, 1, '2026-05-21 11:14:26', '2026-05-21 11:14:26'),
(266, 'Vehicle Purchase', 200.00, 'AFN', 200.00, 'Exchange vehicle acquisition: KIA camery (2023)', '2026-05-21 00:00:00', 72, 'Vehicle', NULL, 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(267, 'Vehicle Sale', 400.00, 'AFN', 400.00, 'Down payment for V000004 — Paid in full', '2026-05-21 00:00:00', 66, 'Sale', NULL, 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(268, 'Showroom Balance', 100.00, 'AFN', 100.00, 'Exchange adjustment: cost difference between sold vehicle (300) and received vehicle (200)', '2026-05-21 00:00:00', 66, 'Sale', NULL, 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(269, 'Showroom Balance', 50.00, 'AFN', 50.00, 'Partner profit share for Farid from sale S000004 (50%)', '2026-05-21 00:00:00', 66, 'CommissionDistribution', 'Farid', 1, '2026-05-21 11:17:04', '2026-05-21 11:17:04'),
(270, 'Vehicle Purchase', 100.00, 'AFN', 100.00, 'Base Purchase for V000006', '2026-05-21 11:28:52', 73, 'Vehicle', NULL, 1, '2026-05-21 11:28:52', '2026-05-21 11:28:52'),
(271, 'Vehicle Purchase', 200.00, 'AFN', 200.00, 'Exchange vehicle acquisition: Audi car (2024)', '2026-05-21 00:00:00', 74, 'Vehicle', NULL, 1, '2026-05-21 11:34:43', '2026-05-21 11:34:43'),
(272, 'Vehicle Sale', 300.00, 'AFN', 300.00, 'Down payment for V000005 — Paid in full', '2026-05-21 00:00:00', 67, 'Sale', NULL, 1, '2026-05-21 11:34:43', '2026-05-21 11:34:43'),
(273, 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Down payment for V000006 — Paid in full', '2026-05-21 00:00:00', 68, 'Sale', NULL, 1, '2026-05-21 11:37:44', '2026-05-21 11:37:44'),
(276, 'Expense', 816.21, 'AFN', 816.21, 'Salary payment for Z Employee (5/2026)', '2026-05-21 11:59:54', 28, 'Payroll', 'Z Employee', 1, '2026-05-21 11:59:54', '2026-05-21 11:59:54'),
(277, 'Currency Exchange', -10.00, 'USD', -650.00, 'Exchange out: 10 USD → 650 AFN', '2026-05-21 12:03:40', 15, 'CurrencyExchange', NULL, 1, '2026-05-21 12:03:40', '2026-05-21 12:03:40'),
(278, 'Currency Exchange', 650.00, 'AFN', 650.00, 'Exchange in: 10 USD → 650 AFN', '2026-05-21 12:03:40', 15, 'CurrencyExchange', NULL, 1, '2026-05-21 12:03:40', '2026-05-21 12:03:40'),
(279, 'Showroom Balance', 100.00, 'USD', 6500.00, 'Payment received from Farid – ', '2026-05-21 00:00:00', NULL, NULL, 'Farid', 1, '2026-05-21 12:09:25', '2026-05-21 12:09:25'),
(280, 'Vehicle Purchase', 100.00, 'USD', 6500.00, 'Base Purchase for V000008', '2026-05-21 12:10:31', 75, 'Vehicle', NULL, 1, '2026-05-21 12:10:31', '2026-05-21 12:10:31'),
(281, 'Vehicle Sale', 200.00, 'USD', 13000.00, 'Down payment for V000008 — Paid in full', '2026-05-21 00:00:00', 69, 'Sale', NULL, 1, '2026-05-21 12:15:16', '2026-05-21 12:15:16'),
(282, 'Showroom Balance', 50.00, 'AFN', 50.00, 'Partner profit share for Farid from sale S000007 (50%)', '2026-05-21 00:00:00', 69, 'CommissionDistribution', 'Farid', 1, '2026-05-21 12:15:16', '2026-05-21 12:15:16'),
(283, 'Vehicle Purchase', 100.00, 'USD', 6500.00, 'Base Purchase for V000009', '2026-05-22 19:52:12', 76, 'Vehicle', NULL, 1, '2026-05-22 19:52:12', '2026-05-22 19:52:12'),
(288, 'Commission', 100.00, 'AFN', 100.00, '', '2026-05-22 00:00:00', NULL, NULL, NULL, NULL, '2026-05-22 21:21:38', '2026-05-22 21:21:38'),
(289, 'Commission', 50.00, 'USD', 3250.00, '', '2026-05-22 00:00:00', NULL, NULL, NULL, NULL, '2026-05-22 21:22:20', '2026-05-22 21:22:20'),
(290, 'Vehicle Purchase', 200.00, 'AFN', 200.00, 'Base Purchase for V000007', '2026-05-22 21:39:16', 74, 'Vehicle', NULL, 1, '2026-05-22 21:39:16', '2026-05-22 21:39:16'),
(291, 'Vehicle Sale', 300.00, 'AFN', 300.00, 'Down payment for V000007 — Paid in full', '2026-05-22 00:00:00', 72, 'Sale', NULL, 1, '2026-05-22 21:39:45', '2026-05-22 21:39:45'),
(292, 'Partner Profit', 50.00, 'AFN', 50.00, 'Partner profit share for Farid from sale S000009 (50%)', '2026-05-22 00:00:00', 72, 'CommissionDistribution', 'Farid', 1, '2026-05-22 21:39:45', '2026-05-22 21:39:45'),
(293, 'Vehicle Purchase', 100.00, 'USD', 6500.00, 'Base Purchase for V000010', '2026-05-22 21:43:14', 77, 'Vehicle', NULL, 1, '2026-05-22 21:43:14', '2026-05-22 21:43:14'),
(296, 'Vehicle Purchase', 100.00, 'USD', 6500.00, 'Base Purchase for V000011', '2026-05-22 22:20:07', 78, 'Vehicle', NULL, 1, '2026-05-22 22:20:07', '2026-05-22 22:20:07'),
(303, 'Vehicle Purchase', 200.00, 'AFN', 200.00, 'Base Purchase for V000014', '2026-05-23 10:09:27', 81, 'Vehicle', NULL, 1, '2026-05-23 10:09:27', '2026-05-23 10:09:27'),
(306, 'Vehicle Purchase', 100.00, 'USD', 6500.00, 'Base Purchase for V000017', '2026-05-23 10:45:26', 88, 'Vehicle', NULL, 1, '2026-05-23 10:45:26', '2026-05-23 10:45:26'),
(307, 'Vehicle Purchase', 100.00, 'USD', 6500.00, 'Base Purchase for V000016', '2026-05-23 10:53:51', 83, 'Vehicle', NULL, 1, '2026-05-23 10:53:51', '2026-05-23 10:53:51'),
(310, 'Vehicle Purchase', 100.00, 'USD', 6500.00, 'Base Purchase for V000015', '2026-05-23 11:09:10', 82, 'Vehicle', NULL, 1, '2026-05-23 11:09:10', '2026-05-23 11:09:10'),
(311, 'Owner Withdrawal', 1000.00, 'AFN', 1000.00, '', '2026-05-24 00:00:00', NULL, NULL, NULL, NULL, '2026-05-24 08:45:28', '2026-05-24 08:45:28'),
(312, 'Showroom Balance', 500.00, 'AFN', 500.00, 'Payment received from Bilal Khan – ', '2026-05-24 00:00:00', NULL, NULL, 'Bilal Khan', 1, '2026-05-24 19:35:35', '2026-05-24 19:35:35'),
(313, 'Vehicle Purchase', 100.00, 'AFN', 100.00, 'Base Purchase for V000017', '2026-05-24 19:37:01', 89, 'Vehicle', NULL, 1, '2026-05-24 19:37:01', '2026-05-24 19:37:01'),
(314, 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Down payment for V000017 — Paid in full', '2026-05-24 00:00:00', 77, 'Sale', NULL, 1, '2026-05-24 19:38:50', '2026-05-24 19:38:50'),
(315, 'Partner Profit', 50.00, 'AFN', 50.00, 'Partner profit share for Bilal Khan from sale S000014 (50%)', '2026-05-24 00:00:00', 77, 'CommissionDistribution', 'Bilal Khan', 1, '2026-05-24 19:38:50', '2026-05-24 19:38:50'),
(316, 'Vehicle Sale', 150.00, 'USD', 9750.00, 'Down payment for V000015 — 150 of 200 AFN', '2026-05-24 00:00:00', 78, 'Sale', NULL, 1, '2026-05-24 19:40:41', '2026-05-24 19:40:41'),
(317, 'Partner Profit', 50.00, 'USD', 3250.00, 'Partner profit share for Farid from sale S000015 (50%)', '2026-05-24 00:00:00', 78, 'CommissionDistribution', 'Farid', 1, '2026-05-24 19:40:41', '2026-05-24 19:40:41'),
(318, 'Vehicle Sale', 50.00, 'USD', 3250.00, 'Installment from Timor for V000015 (FULLY PAID)', '2026-05-24 00:00:00', 78, 'Sale', 'Timor', 1, '2026-05-24 19:58:15', '2026-05-24 19:58:15'),
(319, 'Vehicle Sale', 200.00, 'AFN', 200.00, 'Down payment for V000014 — 200 of 300 AFN', '2026-05-24 00:00:00', 79, 'Sale', NULL, 1, '2026-05-24 20:01:31', '2026-05-24 20:01:31'),
(320, 'Partner Profit', 50.00, 'AFN', 50.00, 'Partner profit share for Farid from sale S000016 (50%)', '2026-05-24 00:00:00', 79, 'CommissionDistribution', 'Farid', 1, '2026-05-24 20:01:31', '2026-05-24 20:01:31'),
(321, 'Vehicle Sale', 100.00, 'AFN', 100.00, 'Installment from thh for V000014 (FULLY PAID)', '2026-05-24 00:00:00', 79, 'Sale', 'thh', 1, '2026-05-24 20:02:53', '2026-05-24 20:02:53'),
(322, 'Vehicle Purchase', 100.00, 'USD', 6500.00, 'Base Purchase for V000013', '2026-06-06 12:18:30', 80, 'Vehicle', NULL, 1, '2026-06-06 12:18:30', '2026-06-06 12:18:30'),
(323, 'Vehicle Sale', 5000.00, 'AFN', 5000.00, 'Down payment for V000013 — 5,000 of 10,000 AFN', '2026-06-06 00:00:00', 80, 'Sale', NULL, 1, '2026-06-06 12:19:43', '2026-06-06 12:19:43'),
(324, 'Partner Profit', 4950.00, 'AFN', 4950.00, 'Partner profit share for Farid from sale S000017 (50%)', '2026-06-06 00:00:00', 80, 'CommissionDistribution', 'Farid', 1, '2026-06-06 12:19:43', '2026-06-06 12:19:43'),
(325, 'Vehicle Sale', 5000.00, 'AFN', 5000.00, 'Installment from Khan for V000013 (FULLY PAID)', '2026-06-06 00:00:00', 80, 'Sale', 'Khan', 1, '2026-06-06 12:20:18', '2026-06-06 12:20:18'),
(326, 'Showroom Balance', -1000.00, 'AFN', -1000.00, 'Payment made to Bilal Khan – ', '2026-06-06 00:00:00', NULL, NULL, 'Bilal Khan', 1, '2026-06-06 12:40:47', '2026-06-06 12:40:47'),
(327, 'Showroom Balance', 100.00, 'USD', 6500.00, 'Payment received from Bilal Khan – ', '2026-06-06 00:00:00', NULL, NULL, 'Bilal Khan', 1, '2026-06-06 12:43:09', '2026-06-06 12:43:09'),
(328, 'Currency Exchange', -100.00, 'AED', -2200.00, 'Exchange out: 100 AED → 34.645669291338585 USD', '2026-06-06 12:53:35', 16, 'CurrencyExchange', NULL, 1, '2026-06-06 12:53:35', '2026-06-06 12:53:35'),
(329, 'Currency Exchange', 34.65, 'USD', 2200.00, 'Exchange in: 100 AED → 34.645669291338585 USD', '2026-06-06 12:53:35', 16, 'CurrencyExchange', NULL, 1, '2026-06-06 12:53:35', '2026-06-06 12:53:35'),
(330, 'Showroom Balance', -50.00, 'USD', -3175.00, 'Payment made to Bilal Khan – ', '2026-06-06 00:00:00', NULL, NULL, 'Bilal Khan', 1, '2026-06-06 12:54:24', '2026-06-06 12:54:24'),
(331, 'Vehicle Sale', 200.00, 'USD', 12700.00, 'Down payment for V000016 — Paid in full', '2026-07-01 00:00:00', 81, 'Sale', NULL, 1, '2026-07-01 08:00:18', '2026-07-01 08:00:18'),
(332, 'Partner Profit', 50.00, 'USD', 3175.00, 'Partner profit share for Farid from sale S000018 (50%)', '2026-07-01 00:00:00', 81, 'CommissionDistribution', 'Farid', 1, '2026-07-01 08:00:18', '2026-07-01 08:00:18'),
(334, 'Vehicle Purchase', 2000.00, 'AFN', 2000.00, 'Base Purchase for V000018', '2026-07-05 19:18:18', 90, 'Vehicle', NULL, 1, '2026-07-05 19:18:18', '2026-07-05 19:18:18'),
(335, 'Vehicle Sale', 4000.00, 'AFN', 4000.00, 'Down payment for V000018 — Paid in full', '2026-07-05 00:00:00', 82, 'Sale', NULL, 1, '2026-07-05 19:24:28', '2026-07-05 19:24:28'),
(336, 'Vehicle Purchase', 100.00, 'USD', 6350.00, 'Base Purchase for V000012', '2026-07-06 04:42:52', 79, 'Vehicle', NULL, 1, '2026-07-06 04:42:52', '2026-07-06 04:42:52'),
(337, 'Vehicle Purchase', 100.00, 'USD', 6350.00, 'Exchange vehicle acquisition: Honda Corolla (2025)', '2026-07-06 00:00:00', 91, 'Vehicle', NULL, 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(338, 'Vehicle Sale', 150.00, 'USD', 9525.00, 'Down payment for V000009 — Paid in full', '2026-07-06 00:00:00', 83, 'Sale', NULL, 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(339, 'Partner Profit', 25.00, 'USD', 1587.50, 'Partner profit share for Farid from sale S000020 (50%)', '2026-07-06 00:00:00', 83, 'CommissionDistribution', 'Farid', 1, '2026-07-06 04:55:03', '2026-07-06 04:55:03'),
(340, 'Vehicle Sale', 200.00, 'USD', 12700.00, 'Down payment for V000012 — Paid in full', '2026-07-06 00:00:00', 84, 'Sale', NULL, 1, '2026-07-06 05:39:49', '2026-07-06 05:39:49'),
(341, 'Partner Profit', 50.00, 'USD', 3175.00, 'Partner profit share for Farid from sale S000021 (50%)', '2026-07-06 00:00:00', 84, 'CommissionDistribution', 'Farid', 1, '2026-07-06 05:39:49', '2026-07-06 05:39:49'),
(342, 'Vehicle Purchase', 100.00, 'USD', 6350.00, 'Base Purchase for V000019', '2026-07-08 11:02:06', 91, 'Vehicle', NULL, 1, '2026-07-08 11:02:06', '2026-07-08 11:02:06'),
(343, 'Vehicle Sale', 200.00, 'USD', 12700.00, 'Down payment for V000019 — Paid in full', '2026-07-08 00:00:00', 85, 'Sale', NULL, 1, '2026-07-08 11:03:09', '2026-07-08 11:03:09');

-- --------------------------------------------------------

--
-- Table structure for table `team_en`
--

CREATE TABLE `team_en` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `x` varchar(255) DEFAULT NULL COMMENT 'Twitter/X profile URL',
  `image` varchar(255) DEFAULT NULL COMMENT 'Path to uploaded team member image',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_en`
--

INSERT INTO `team_en` (`id`, `name`, `position`, `description`, `facebook`, `instagram`, `x`, `image`, `createdAt`, `updatedAt`) VALUES
(1, 'Ahmad Khan', 'Owner', 'Managing All Staff, and processing all the sales and inventory base contracts.', 'facebook.com', 'instagram.com', 'x.com', '/uploads/team/team-1774704108232-5279518.jpg', '2026-03-28 13:21:48', '2026-03-28 13:21:48'),
(2, 'Test', 'Sales Manager', 'this is a test', 'facebook.com', 'instagram.com', NULL, '/uploads/team/team-1777985609434-2335654.webp', '2026-05-05 12:53:29', '2026-05-05 12:54:00');

-- --------------------------------------------------------

--
-- Table structure for table `team_fa`
--

CREATE TABLE `team_fa` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `x` varchar(255) DEFAULT NULL COMMENT 'Twitter/X profile URL',
  `image` varchar(255) DEFAULT NULL COMMENT 'Path to uploaded team member image',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_fa`
--

INSERT INTO `team_fa` (`id`, `name`, `position`, `description`, `facebook`, `instagram`, `x`, `image`, `createdAt`, `updatedAt`) VALUES
(1, 'احمد خان', 'رئیس', 'مدیریت همه کارکنان و پردازش تمام قراردادهای فروش و موجودی.', 'faceboo.com', 'instagram.com', NULL, '/uploads/team/team-1774704275352-120081344.jpg', '2026-03-28 13:24:35', '2026-03-28 13:24:35');

-- --------------------------------------------------------

--
-- Table structure for table `team_ps`
--

CREATE TABLE `team_ps` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `x` varchar(255) DEFAULT NULL COMMENT 'Twitter/X profile URL',
  `image` varchar(255) DEFAULT NULL COMMENT 'Path to uploaded team member image',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_ps`
--

INSERT INTO `team_ps` (`id`, `name`, `position`, `description`, `facebook`, `instagram`, `x`, `image`, `createdAt`, `updatedAt`) VALUES
(1, 'احمد خان', 'رئیس', 'د ټولو کارکوونکو مدیریت او د ټولو خرڅلاو او ذخیره تړونونو پروسس کول.', 'facebook.com', 'instagram.com', NULL, '/uploads/team/team-1774704188646-298973808.jpg', '2026-03-28 13:23:08', '2026-03-28 13:23:08');

-- --------------------------------------------------------

--
-- Table structure for table `testimonial_en`
--

CREATE TABLE `testimonial_en` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `year` varchar(255) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `testimonial_en`
--

INSERT INTO `testimonial_en` (`id`, `name`, `year`, `rating`, `title`, `message`, `createdAt`, `updatedAt`) VALUES
(1, 'Ahmad Khan', 'Mar, 2025', 5, 'Excellent Service & Trusted Platform', '“I had a great experience buying my car from Niazay Khpalwak Car Showroom. The process was smooth, the pricing was transparent, and the staff was very helpful. Highly recommended!”', '2026-03-28 16:20:40', '2026-03-28 16:20:40'),
(2, 'Karim Ullah', 'Feb 2026', 5, 'High Quality Vehicles', '“The quality of vehicles is outstanding. I purchased a container-imported car and it was exactly as described. Very reliable and well-maintained cars.”', '2026-03-28 16:21:19', '2026-03-28 16:21:19'),
(3, 'Rahim', 'Feb, 2026', 4, 'Professional & Friendly Team', '“The team is very professional and cooperative. They guided me through every step of the purchase and made everything easy. I’m very satisfied with their service.”', '2026-03-28 16:22:05', '2026-03-28 16:22:05'),
(4, 'Navid Khan', 'Mar, 2026', 4, 'Best Place to Buy and Sell Cars', '“This showroom is the perfect place for both buyers and sellers. They handled my car sale quickly and fairly. Truly a trustworthy platform.”', '2026-03-28 16:22:45', '2026-03-28 16:22:45'),
(5, 'Test', '4, 2026', 3, 'Good Services', 'This is a test', '2026-05-05 12:42:08', '2026-05-05 12:42:08');

-- --------------------------------------------------------

--
-- Table structure for table `testimonial_fa`
--

CREATE TABLE `testimonial_fa` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `year` varchar(255) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `testimonial_fa`
--

INSERT INTO `testimonial_fa` (`id`, `name`, `year`, `rating`, `title`, `message`, `createdAt`, `updatedAt`) VALUES
(1, 'احمد خان', 'مارچ ۲۰۲۵', 5, 'خدمات عالی و پلتفرم قابل اعتماد', 'من تجربه بسیار خوبی از خرید موتر از نمایشگاه نیازی خپلواک داشتم. روند کار بسیار آسان بود، قیمت‌ها شفاف بودند و کارمندان بسیار همکاری می‌کردند. کاملاً توصیه می‌کنم!', '2026-03-28 16:27:49', '2026-03-28 16:27:49'),
(2, 'کریم الله', 'فیبروری ۲۰۲۶', 5, 'موترهای با کیفیت بالا', 'کیفیت موترها بسیار عالی است. من یک موتر وارداتی کانتینری خریدم که دقیقاً مطابق توضیحات بود. موترها بسیار قابل اعتماد و به‌خوبی نگهداری شده‌اند.', '2026-03-28 16:28:29', '2026-03-28 16:28:29'),
(3, 'رحیم', 'فیبروری ۲۰۲۶', 4, 'تیم مسلکی و دوستانه', 'تیم بسیار مسلکی و همکاری‌کننده است. آن‌ها در هر مرحله خرید مرا راهنمایی کردند و همه چیز را آسان ساختند. من از خدمات‌شان بسیار راضی هستم.', '2026-03-28 16:29:17', '2026-03-28 16:29:17'),
(4, 'نوید خان', 'مارچ ۲۰۲۶', 4, 'بهترین مکان برای خرید و فروش موتر', 'این نمایشگاه بهترین مکان برای خریداران و فروشندگان است. آن‌ها فروش موتر مرا به‌سرعت و به‌طور منصفانه انجام دادند. واقعاً یک پلتفرم قابل اعتماد است.', '2026-03-28 16:29:49', '2026-03-28 16:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `testimonial_ps`
--

CREATE TABLE `testimonial_ps` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `year` varchar(255) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `testimonial_ps`
--

INSERT INTO `testimonial_ps` (`id`, `name`, `year`, `rating`, `title`, `message`, `createdAt`, `updatedAt`) VALUES
(1, 'احمد خان', 'مارچ ۲۰۲۵', 5, 'غوره خدمت او باوري پلاتفورم', 'ما د نیازي خپلواک موټر نندارتون څخه د موټر اخیستلو کې ډېر ښه تجربه درلوده. پروسه ډېره اسانه وه، بیې شفافې وې، او کارکوونکي ډېر مرسته کوونکي وو. زه یې کلک سپارښتنه کوم!', '2026-03-28 16:24:35', '2026-03-28 16:24:35'),
(2, 'کریم الله', 'فیبوری ۲۰۲۶', 5, 'لوړ کیفیت لرونکي موټرونه', 'د موټرو کیفیت بېخي عالي دی. ما یو کانتینري وارد شوی موټر واخیست او بالکل هماغه شان و لکه څنګه چې تشریح شوی و. ډېر باوري او ښه ساتل شوي موټرونه دي.', '2026-03-28 16:25:33', '2026-03-28 16:25:33'),
(3, 'رحیم', 'فیبروری ۲۰۲۶', 4, 'مسلکي او دوستانه ټیم', 'ټیم ډېر مسلکي او همکار دی. هغوی ما ته د اخیستلو په هر پړاو کې لارښوونه وکړه او ټول کار یې اسانه کړ. زه د دوی له خدمت څخه ډېر خوښ یم.', '2026-03-28 16:26:30', '2026-03-28 16:26:30'),
(4, 'نوید خان', 'مارچ ۲۰۲۶', 4, 'د موټرو د پېرلو او پلورلو لپاره غوره ځای', 'دا نندارتون د پېرودونکو او پلورونکو دواړو لپاره غوره ځای دی. هغوی زما د موټر پلور ډېر ژر او په عادلانه ډول ترسره کړ. رښتیا هم یو باوري پلاتفورم دی.', '2026-03-28 16:27:09', '2026-03-28 16:27:09');

-- --------------------------------------------------------

--
-- Table structure for table `time_setting`
--

CREATE TABLE `time_setting` (
  `key` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `time_setting`
--

INSERT INTO `time_setting` (`key`, `value`) VALUES
('work_end_time', '17:00'),
('work_start_time', '08:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `role` enum('Super Admin','Owner','Manager','Accountant','Financial','Inventory & Sales','Sales','Viewer') NOT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `fullName`, `email`, `phoneNumber`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', '$2b$10$zLOb64EsmGJLQsyfjdQOvON36HWaYP4/XQ5AinUaT0BODx7eZUpL.', 'System Administrator', 'admin@easyvate.com', '', 'Super Admin', 1, '2026-02-08 09:32:15', '2026-07-01 09:10:43'),
(2, 'khan', '$2b$10$q1EAkbe/GKX.ht0P4L4KjOTSjNvl8cndBXyTHEaNIyFLlRkG0Lj9m', 'Khan', 'khan@gmail.com', '0700000000', 'Viewer', 1, '2026-04-30 08:29:16', '2026-04-30 08:29:16'),
(3, 'gulabshah', '$2b$10$WfK6x/QxVE/5mvnR3XV/Re6OiwAKK/IYXEoGgRV1WuetuAn/HrSdq', 'Gulabshah', 'gulabshah@gmail.com', '0700000000', 'Inventory & Sales', 1, '2026-04-30 08:30:14', '2026-04-30 08:30:14'),
(4, 'enayat', '$2b$10$6e.mPG3AXHUTVbc3zYnEeursQ/6OXB4tfilA0YD.cGojnMHAEmVqq', 'Enayat', 'enayat@gmail.com', '070000000', 'Accountant', 1, '2026-04-30 08:30:48', '2026-07-01 09:12:34');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `vehicleId` varchar(50) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` int(11) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `chassisNumber` varchar(100) NOT NULL,
  `engineNumber` varchar(100) DEFAULT NULL,
  `engineType` varchar(100) DEFAULT NULL,
  `fuelType` varchar(50) DEFAULT NULL,
  `transmission` varchar(50) DEFAULT NULL,
  `mileage` int(11) DEFAULT NULL,
  `status` enum('Available','Reserved','Sold','Coming','Under Repair') DEFAULT 'Available',
  `basePurchasePrice` decimal(15,2) DEFAULT NULL,
  `baseCurrency` varchar(10) DEFAULT 'AFN',
  `transportCostToDubai` decimal(15,2) DEFAULT 0.00,
  `importCostToAfghanistan` decimal(15,2) DEFAULT 0.00,
  `repairCost` decimal(15,2) DEFAULT 0.00,
  `totalCostPKR` decimal(15,2) DEFAULT NULL,
  `sellingPrice` decimal(15,2) DEFAULT NULL,
  `isLocked` tinyint(1) DEFAULT 0,
  `pdfPath` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `plateNo` varchar(50) DEFAULT NULL,
  `vehicleLicense` varchar(100) DEFAULT NULL,
  `steering` enum('Left','Right') DEFAULT 'Left',
  `monolithicCut` enum('Monolithic','Cut') DEFAULT 'Monolithic',
  `basePurchasePriceCurrency` varchar(10) DEFAULT 'AFN',
  `transportCostToDubaiCurrency` varchar(10) DEFAULT 'AFN',
  `importCostToAfghanistanCurrency` varchar(10) DEFAULT 'AFN',
  `repairCostCurrency` varchar(10) DEFAULT 'AFN',
  `vehicleCurrency` varchar(10) DEFAULT 'AFN',
  `totalCostOriginal` decimal(15,2) DEFAULT NULL,
  `sellingPriceCurrency` varchar(10) DEFAULT 'AFN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `vehicleId`, `category`, `manufacturer`, `model`, `year`, `color`, `chassisNumber`, `engineNumber`, `engineType`, `fuelType`, `transmission`, `mileage`, `status`, `basePurchasePrice`, `baseCurrency`, `transportCostToDubai`, `importCostToAfghanistan`, `repairCost`, `totalCostPKR`, `sellingPrice`, `isLocked`, `pdfPath`, `createdAt`, `updatedAt`, `plateNo`, `vehicleLicense`, `steering`, `monolithicCut`, `basePurchasePriceCurrency`, `transportCostToDubaiCurrency`, `importCostToAfghanistanCurrency`, `repairCostCurrency`, `vehicleCurrency`, `totalCostOriginal`, `sellingPriceCurrency`) VALUES
(68, 'V000001', 'Bus', 'BMW', 'Sports', 2024, 'White', 'DFJDAFDSK2324', 'DFS324DFGS', 'Turbo', 'Petrol', 'Automatic', 2000, 'Sold', 80.00, 'USD', 10.00, 5.00, 5.00, 6500.00, 150.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000001.pdf', '2026-05-21 08:43:22', '2026-05-21 09:44:33', '', '', 'Right', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD'),
(69, 'V000002', 'Sedan', 'Chevrolet', 'corolla', 2025, 'Black', 'DFJDSJF34234sdf', 'dgsdf34dsfsd', 'Rotary', 'Petrol', 'Automatic', 0, 'Sold', 500.00, 'AFN', 0.00, 0.00, 0.00, 500.00, 600.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000002.pdf', '2026-05-21 08:46:47', '2026-05-21 10:12:15', 'KBL-232', 'ADFdsf34sdfa', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 500.00, 'AFN'),
(70, 'V000003', 'Coupe', 'Audi', 'car', 2025, '', 'SDAFJDJSFK3443dsfk', 'dsjfklkr3rfk', 'V4', 'Petrol', '', 0, 'Sold', 500.00, 'AFN', 0.00, 0.00, 0.00, 500.00, 600.00, 1, NULL, '2026-05-21 10:12:15', '2026-05-21 10:16:23', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 500.00, 'AFN'),
(71, 'V000004', 'Pickup', 'Ford', 'land cruiser', 2022, '', 'DSHFJDKSKF3434', 'SDJFkdlsjf4rr5j33lfjd', 'V10', 'Petrol', '', 0, 'Sold', 300.00, 'AFN', 0.00, 0.00, 0.00, 300.00, 400.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000004.pdf', '2026-05-21 11:14:26', '2026-05-21 11:17:04', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 300.00, 'AFN'),
(72, 'V000005', 'Van', 'KIA', 'camery', 2023, '', 'SDJFJSDJFK3432', 'DFGK2342edf', 'V4', '', '', 0, 'Sold', 200.00, 'AFN', 0.00, 0.00, 0.00, 200.00, 300.00, 1, NULL, '2026-05-21 11:17:04', '2026-05-21 11:34:43', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 200.00, 'AFN'),
(73, 'V000006', 'Hatchback', 'Audi', 'camery', 2025, '', 'DSFJDAJFJ324234', 'dsafadf4334', 'Rotary', 'Petrol', '', 0, 'Sold', 100.00, 'AFN', 0.00, 0.00, 0.00, 100.00, 200.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000006.pdf', '2026-05-21 11:28:52', '2026-05-21 11:37:44', '', '', 'Right', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'AFN'),
(74, 'V000007', 'SUV', 'Audi', 'car', 2024, '', 'SDAJGKFD343fds', 'DSFDF4334resdf', 'Inline-4', '', '', 0, 'Sold', 200.00, 'AFN', 0.00, 0.00, 0.00, 200.00, 300.00, 1, NULL, '2026-05-21 11:34:43', '2026-05-22 21:39:45', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 200.00, 'AFN'),
(75, 'V000008', 'Other', 'FAW', 'test', 2025, '', 'SDFJGKFDSKg435df', 'dfgdlk;jg4543dlkjf', '', '', '', 0, 'Sold', 100.00, 'USD', 0.00, 0.00, 0.00, 6500.00, 200.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000008.pdf', '2026-05-21 11:57:48', '2026-05-21 12:15:15', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD'),
(76, 'V000009', 'Hatchback', 'Changan', 'test', 2024, '', 'FDGFDGFDSG4534gf', 'DFDSert345345rrdf', 'Inline-5', 'Petrol', '', 0, 'Sold', 100.00, 'USD', 0.00, 0.00, 0.00, 6500.00, 150.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000009.pdf', '2026-05-22 19:52:12', '2026-07-06 04:55:03', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD'),
(77, 'V000010', 'Sedan', 'FAW', 'tets', 2025, '', 'ADSFJDSKFK32423', 'SDAFSDASf324', 'Inline-5', 'Hybrid', '', 0, 'Available', 100.00, 'USD', 0.00, 0.00, 0.00, 6500.00, 200.00, 0, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000010.pdf', '2026-05-22 21:43:13', '2026-07-01 07:47:20', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD'),
(78, 'V000011', 'Coupe', 'Audi', 'car', 2024, '', 'DSFJSDJF324', 'DSFSF3423', 'Inline-4', 'Diesel', '', 0, 'Available', 100.00, 'USD', 0.00, 0.00, 0.00, 6500.00, 200.00, 0, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000011.pdf', '2026-05-22 22:20:07', '2026-07-01 07:47:19', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD'),
(79, 'V000012', 'Coupe', 'Changan', 'jhg', 2025, '', 'KCXVKXCKVserevxcv', 'FGDFGerte', 'Rotary', 'Petrol', '', 0, 'Sold', 100.00, 'USD', 0.00, 0.00, 0.00, 6350.00, 200.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000012.pdf', '2026-05-22 22:27:31', '2026-07-06 05:39:49', 'KDR-123', '24dslkfj34', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD'),
(80, 'V000013', 'Other', 'Chevrolet', 'test', 2024, '', 'DSAFJDAJFJ3243234sdf', 'DSGFFDS3432', 'Inline-4', 'Diesel', '', 0, 'Sold', 100.00, 'USD', 0.00, 0.00, 0.00, 6500.00, 10000.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000013.pdf', '2026-05-23 10:04:04', '2026-06-06 12:19:43', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'AFN'),
(81, 'V000014', 'Hatchback', 'BMW', 'test', 2025, '', 'DSAFJFDSK324sdaf', 'dsaFDSAF32423', 'Inline-4', 'Petrol', '', 0, 'Sold', 200.00, 'AFN', 0.00, 0.00, 0.00, 200.00, 300.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000014.pdf', '2026-05-23 10:09:27', '2026-05-24 20:01:31', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 200.00, 'AFN'),
(82, 'V000015', 'SUV', 'Honda', 'test', 2023, '', 'DSFJDASFK234dsfj', 'DASFDSAF32423fds', 'Inline-5', 'Petrol', '', 0, 'Sold', 100.00, 'USD', 0.00, 0.00, 0.00, 6500.00, 200.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000015.pdf', '2026-05-23 10:19:28', '2026-05-24 19:40:41', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD'),
(83, 'V000016', 'Coupe', 'Daihatsu', 'test', 2020, '', 'DFGDFK332', 'DFDS32432sdfc', '', '', '', 0, 'Sold', 100.00, 'USD', 0.00, 0.00, 0.00, 6500.00, 200.00, 1, NULL, '2026-05-23 10:37:22', '2026-07-01 08:00:18', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD'),
(89, 'V000017', 'Other', 'Ford', 'test', 2024, '', 'DSAFFadsfasdf3w4', 'dsfdsfasdfwersdf3', 'Inline-5', 'Diesel', '', 0, 'Sold', 100.00, 'AFN', 0.00, 0.00, 0.00, 100.00, 200.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000017.pdf', '2026-05-24 19:37:01', '2026-05-24 19:38:50', '', '', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'AFN'),
(90, 'V000018', 'SUV', 'Audi', 'corolla', 2024, 'white', 'DSFJSKFK324sdf', 'daSFJafkjlk3w4324', 'Inline-4', 'Petrol', '', 20000, 'Sold', 2000.00, 'AFN', 0.00, 0.00, 0.00, 2000.00, 4000.00, 1, 'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000018.pdf', '2026-07-01 08:11:51', '2026-07-05 19:24:28', 'KDR-34567', 'hd45678', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 2000.00, 'AFN'),
(91, 'V000019', 'SUV', 'Honda', 'Corolla', 2025, 'Blue', 'DJFAFJFKKF2312', '798607987', 'Inline-6', 'Hybrid', '', 2000, 'Sold', 100.00, 'USD', 0.00, 0.00, 0.00, 6350.00, 200.00, 1, NULL, '2026-07-06 04:55:03', '2026-07-08 11:03:09', 'kdr-567', '724384892', 'Left', 'Monolithic', 'AFN', 'AFN', 'AFN', 'AFN', 'AFN', 100.00, 'USD');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_costs`
--

CREATE TABLE `vehicle_costs` (
  `id` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `stage` enum('Base Purchase','Transport to Dubai','Import to Afghanistan','Repair','Additional') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `amountInPKR` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `addedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_costs`
--

INSERT INTO `vehicle_costs` (`id`, `vehicleId`, `stage`, `amount`, `currency`, `amountInPKR`, `description`, `date`, `addedBy`, `createdAt`, `updatedAt`) VALUES
(49, 68, 'Base Purchase', 80.00, 'USD', 5200.00, NULL, '2026-05-21 08:43:22', 1, '2026-05-21 08:43:22', '2026-05-21 08:43:22'),
(50, 68, 'Transport to Dubai', 10.00, 'USD', 650.00, NULL, '2026-05-21 08:43:22', 1, '2026-05-21 08:43:22', '2026-05-21 08:43:22'),
(51, 68, 'Import to Afghanistan', 5.00, 'USD', 325.00, NULL, '2026-05-21 08:43:22', 1, '2026-05-21 08:43:22', '2026-05-21 08:43:22'),
(52, 68, 'Repair', 5.00, 'USD', 325.00, NULL, '2026-05-21 08:43:22', 1, '2026-05-21 08:43:22', '2026-05-21 08:43:22'),
(53, 69, 'Base Purchase', 500.00, 'AFN', 500.00, NULL, '2026-05-21 08:46:47', 1, '2026-05-21 08:46:47', '2026-05-21 08:46:47'),
(54, 71, 'Base Purchase', 300.00, 'AFN', 300.00, NULL, '2026-05-21 11:14:26', 1, '2026-05-21 11:14:26', '2026-05-21 11:14:26'),
(55, 73, 'Base Purchase', 100.00, 'USD', 6500.00, NULL, '2026-05-21 11:28:52', 1, '2026-05-21 11:28:52', '2026-05-21 11:28:52'),
(58, 75, 'Base Purchase', 100.00, 'USD', 6500.00, NULL, '2026-05-21 12:10:31', 1, '2026-05-21 12:10:31', '2026-05-21 12:10:31'),
(59, 76, 'Base Purchase', 100.00, 'USD', 6500.00, NULL, '2026-05-22 19:52:12', 1, '2026-05-22 19:52:12', '2026-05-22 19:52:12'),
(60, 74, 'Base Purchase', 200.00, 'AFN', 200.00, NULL, '2026-05-22 21:39:16', 1, '2026-05-22 21:39:16', '2026-05-22 21:39:16'),
(61, 77, 'Base Purchase', 100.00, 'USD', 6500.00, NULL, '2026-05-22 21:43:14', 1, '2026-05-22 21:43:14', '2026-05-22 21:43:14'),
(62, 78, 'Base Purchase', 100.00, 'USD', 6500.00, NULL, '2026-05-22 22:20:07', 1, '2026-05-22 22:20:07', '2026-05-22 22:20:07'),
(65, 81, 'Base Purchase', 200.00, 'AFN', 200.00, NULL, '2026-05-23 10:09:27', 1, '2026-05-23 10:09:27', '2026-05-23 10:09:27'),
(69, 83, 'Base Purchase', 100.00, 'USD', 6500.00, NULL, '2026-05-23 10:53:51', 1, '2026-05-23 10:53:51', '2026-05-23 10:53:51'),
(70, 82, 'Base Purchase', 100.00, 'USD', 6500.00, NULL, '2026-05-23 11:09:10', 1, '2026-05-23 11:09:10', '2026-05-23 11:09:10'),
(71, 89, 'Base Purchase', 100.00, 'AFN', 100.00, NULL, '2026-05-24 19:37:01', 1, '2026-05-24 19:37:01', '2026-05-24 19:37:01'),
(72, 80, 'Base Purchase', 100.00, 'USD', 6500.00, NULL, '2026-06-06 12:18:30', 1, '2026-06-06 12:18:30', '2026-06-06 12:18:30'),
(74, 90, 'Base Purchase', 2000.00, 'AFN', 2000.00, NULL, '2026-07-05 19:18:18', 1, '2026-07-05 19:18:18', '2026-07-05 19:18:18'),
(75, 79, 'Base Purchase', 100.00, 'USD', 6350.00, NULL, '2026-07-06 04:42:52', 1, '2026-07-06 04:42:52', '2026-07-06 04:42:52'),
(76, 91, 'Base Purchase', 100.00, 'USD', 6350.00, NULL, '2026-07-08 11:02:06', 1, '2026-07-08 11:02:06', '2026-07-08 11:02:06');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_images`
--

CREATE TABLE `vehicle_images` (
  `id` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL COMMENT 'Original filename',
  `path` varchar(255) NOT NULL COMMENT 'Relative URL to access the image (e.g., /uploads/vehicle-images/xyz.jpg)',
  `size` int(11) NOT NULL COMMENT 'File size in bytes',
  `order` int(11) DEFAULT 0 COMMENT 'Display order (ascending)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle_images`
--

INSERT INTO `vehicle_images` (`id`, `vehicleId`, `filename`, `path`, `size`, `order`, `createdAt`, `updatedAt`) VALUES
(36, 82, 'cd-1.jpg', '/uploads/vehicle-images/vehicle-82-1779534550896-218181373.webp', 21826, 0, '2026-05-23 11:09:11', '2026-05-23 11:09:11'),
(37, 82, 'cd-2.jpg', '/uploads/vehicle-images/vehicle-82-1779534550899-639928632.webp', 20476, 1, '2026-05-23 11:09:11', '2026-05-23 11:09:11'),
(38, 82, 'cd-3.jpg', '/uploads/vehicle-images/vehicle-82-1779534550900-700299281.webp', 36748, 2, '2026-05-23 11:09:11', '2026-05-23 11:09:11'),
(39, 82, 'cd-4.jpg', '/uploads/vehicle-images/vehicle-82-1779534550903-898730750.webp', 27812, 3, '2026-05-23 11:09:11', '2026-05-23 11:09:11'),
(40, 82, 'cd-5.jpg', '/uploads/vehicle-images/vehicle-82-1779534550905-486773391.webp', 66194, 4, '2026-05-23 11:09:11', '2026-05-23 11:09:11'),
(41, 90, 'cd-1.jpg', '/uploads/vehicle-images/vehicle-90-1782893512608-467435848.webp', 21826, 0, '2026-07-01 08:11:52', '2026-07-01 08:11:52'),
(42, 90, 'cd-3.jpg', '/uploads/vehicle-images/vehicle-90-1782893512612-673899263.webp', 36748, 2, '2026-07-01 08:11:52', '2026-07-01 08:11:52'),
(43, 90, 'cd-2.jpg', '/uploads/vehicle-images/vehicle-90-1782893512610-392492763.webp', 20476, 1, '2026-07-01 08:11:52', '2026-07-01 08:11:52'),
(44, 90, 'cd-4.jpg', '/uploads/vehicle-images/vehicle-90-1782893512616-358357856.webp', 27812, 3, '2026-07-01 08:11:52', '2026-07-01 08:11:52');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_options`
--

CREATE TABLE `vehicle_options` (
  `id` int(11) NOT NULL,
  `field` varchar(50) NOT NULL COMMENT 'manufacturer, category, engineType, transmission',
  `value` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle_options`
--

INSERT INTO `vehicle_options` (`id`, `field`, `value`, `createdAt`, `updatedAt`) VALUES
(1, 'manufacturer', 'Toyota', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(2, 'manufacturer', 'Honda', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(3, 'manufacturer', 'BMW', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(4, 'manufacturer', 'Mercedes-Benz', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(5, 'manufacturer', 'Audi', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(6, 'manufacturer', 'Volkswagen', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(7, 'manufacturer', 'Ford', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(8, 'manufacturer', 'Chevrolet', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(9, 'manufacturer', 'KIA', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(10, 'manufacturer', 'Hyundai', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(11, 'manufacturer', 'Mazda', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(12, 'manufacturer', 'Nissan', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(13, 'manufacturer', 'Suzuki', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(14, 'manufacturer', 'Daihatsu', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(15, 'manufacturer', 'FAW', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(16, 'manufacturer', 'Changan', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(17, 'category', 'Sedan', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(18, 'category', 'SUV', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(19, 'category', 'Hatchback', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(20, 'category', 'Coupe', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(21, 'category', 'Van', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(22, 'category', 'Truck', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(23, 'category', 'Pickup', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(24, 'category', 'Bus', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(25, 'category', 'Other', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(26, 'engineType', 'Inline-3', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(27, 'engineType', 'Inline-4', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(28, 'engineType', 'Inline-5', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(29, 'engineType', 'Inline-6', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(30, 'engineType', 'V4', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(31, 'engineType', 'V6', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(32, 'engineType', 'V8', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(33, 'engineType', 'V10', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(34, 'engineType', 'V12', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(35, 'engineType', 'Rotary', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(36, 'engineType', 'Turbo', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(37, 'transmission', 'Manual', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(38, 'transmission', 'Automatic', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(39, 'transmission', 'CVT', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(40, 'transmission', 'Semi-Automatic', '2026-04-04 17:23:30', '2026-04-04 17:23:30'),
(41, 'manufacturer', 'new COmpany', '2026-05-09 12:56:39', '2026-05-09 12:56:39'),
(42, 'manufacturer', 'نوی موټر', '2026-05-09 12:57:19', '2026-05-09 12:57:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `about_en`
--
ALTER TABLE `about_en`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_fa`
--
ALTER TABLE `about_fa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_logos_en`
--
ALTER TABLE `about_logos_en`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_logos_fa`
--
ALTER TABLE `about_logos_fa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_logos_ps`
--
ALTER TABLE `about_logos_ps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_ps`
--
ALTER TABLE `about_ps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `attendance_employee_id_date` (`employeeId`),
  ADD UNIQUE KEY `attendance_employee_id_month_year` (`employeeId`,`month`,`year`);

--
-- Indexes for table `carousel_items`
--
ALTER TABLE `carousel_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `choose_videos`
--
ALTER TABLE `choose_videos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `commission_distributions`
--
ALTER TABLE `commission_distributions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `saleId` (`saleId`),
  ADD KEY `sharingPersonId` (`sharingPersonId`);

--
-- Indexes for table `contact_en`
--
ALTER TABLE `contact_en`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_fa`
--
ALTER TABLE `contact_fa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_ps`
--
ALTER TABLE `contact_ps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `currency_exchanges`
--
ALTER TABLE `currency_exchanges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addedBy` (`addedBy`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_ledger`
--
ALTER TABLE `customer_ledger`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customerId` (`customerId`),
  ADD KEY `saleId` (`saleId`),
  ADD KEY `addedBy` (`addedBy`);

--
-- Indexes for table `edit_history`
--
ALTER TABLE `edit_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entityId` (`entityId`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employeeId` (`employeeId`),
  ADD UNIQUE KEY `employeeId_2` (`employeeId`),
  ADD UNIQUE KEY `employeeId_3` (`employeeId`),
  ADD UNIQUE KEY `employeeId_4` (`employeeId`),
  ADD UNIQUE KEY `employeeId_5` (`employeeId`),
  ADD UNIQUE KEY `employeeId_6` (`employeeId`),
  ADD UNIQUE KEY `employeeId_7` (`employeeId`),
  ADD UNIQUE KEY `employeeId_8` (`employeeId`),
  ADD UNIQUE KEY `employeeId_9` (`employeeId`),
  ADD UNIQUE KEY `employeeId_10` (`employeeId`),
  ADD UNIQUE KEY `employeeId_11` (`employeeId`),
  ADD UNIQUE KEY `employeeId_12` (`employeeId`),
  ADD UNIQUE KEY `employeeId_13` (`employeeId`),
  ADD UNIQUE KEY `employeeId_14` (`employeeId`),
  ADD UNIQUE KEY `employeeId_15` (`employeeId`),
  ADD UNIQUE KEY `employeeId_16` (`employeeId`),
  ADD UNIQUE KEY `employeeId_17` (`employeeId`),
  ADD UNIQUE KEY `employeeId_18` (`employeeId`),
  ADD UNIQUE KEY `employeeId_19` (`employeeId`),
  ADD UNIQUE KEY `employeeId_20` (`employeeId`),
  ADD UNIQUE KEY `employeeId_21` (`employeeId`),
  ADD UNIQUE KEY `employeeId_22` (`employeeId`),
  ADD UNIQUE KEY `employeeId_23` (`employeeId`),
  ADD UNIQUE KEY `employeeId_24` (`employeeId`),
  ADD UNIQUE KEY `employeeId_25` (`employeeId`),
  ADD UNIQUE KEY `employeeId_26` (`employeeId`),
  ADD UNIQUE KEY `employeeId_27` (`employeeId`),
  ADD UNIQUE KEY `employeeId_28` (`employeeId`),
  ADD UNIQUE KEY `employeeId_29` (`employeeId`);

--
-- Indexes for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `currency` (`currency`),
  ADD UNIQUE KEY `currency_2` (`currency`),
  ADD UNIQUE KEY `currency_3` (`currency`),
  ADD UNIQUE KEY `currency_4` (`currency`),
  ADD UNIQUE KEY `currency_5` (`currency`),
  ADD UNIQUE KEY `currency_6` (`currency`),
  ADD UNIQUE KEY `currency_7` (`currency`),
  ADD UNIQUE KEY `currency_8` (`currency`),
  ADD UNIQUE KEY `currency_9` (`currency`),
  ADD UNIQUE KEY `currency_10` (`currency`),
  ADD UNIQUE KEY `currency_11` (`currency`),
  ADD UNIQUE KEY `currency_12` (`currency`),
  ADD UNIQUE KEY `currency_13` (`currency`),
  ADD UNIQUE KEY `currency_14` (`currency`),
  ADD UNIQUE KEY `currency_15` (`currency`),
  ADD UNIQUE KEY `currency_16` (`currency`),
  ADD UNIQUE KEY `currency_17` (`currency`),
  ADD UNIQUE KEY `currency_18` (`currency`),
  ADD UNIQUE KEY `currency_19` (`currency`),
  ADD UNIQUE KEY `currency_20` (`currency`),
  ADD UNIQUE KEY `currency_21` (`currency`),
  ADD UNIQUE KEY `currency_22` (`currency`),
  ADD UNIQUE KEY `currency_23` (`currency`),
  ADD UNIQUE KEY `currency_24` (`currency`),
  ADD UNIQUE KEY `currency_25` (`currency`),
  ADD UNIQUE KEY `currency_26` (`currency`),
  ADD UNIQUE KEY `currency_27` (`currency`),
  ADD UNIQUE KEY `currency_28` (`currency`),
  ADD UNIQUE KEY `currency_29` (`currency`),
  ADD KEY `updatedBy` (`updatedBy`);

--
-- Indexes for table `ledger_transactions`
--
ALTER TABLE `ledger_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactionId` (`transactionId`),
  ADD UNIQUE KEY `transactionId_2` (`transactionId`),
  ADD UNIQUE KEY `transactionId_3` (`transactionId`),
  ADD UNIQUE KEY `transactionId_4` (`transactionId`),
  ADD UNIQUE KEY `transactionId_5` (`transactionId`),
  ADD UNIQUE KEY `transactionId_6` (`transactionId`),
  ADD UNIQUE KEY `transactionId_7` (`transactionId`),
  ADD UNIQUE KEY `transactionId_8` (`transactionId`),
  ADD UNIQUE KEY `transactionId_9` (`transactionId`),
  ADD UNIQUE KEY `transactionId_10` (`transactionId`),
  ADD UNIQUE KEY `transactionId_11` (`transactionId`),
  ADD UNIQUE KEY `transactionId_12` (`transactionId`),
  ADD UNIQUE KEY `transactionId_13` (`transactionId`),
  ADD UNIQUE KEY `transactionId_14` (`transactionId`),
  ADD UNIQUE KEY `transactionId_15` (`transactionId`),
  ADD UNIQUE KEY `transactionId_16` (`transactionId`),
  ADD UNIQUE KEY `transactionId_17` (`transactionId`),
  ADD UNIQUE KEY `transactionId_18` (`transactionId`),
  ADD UNIQUE KEY `transactionId_19` (`transactionId`),
  ADD UNIQUE KEY `transactionId_20` (`transactionId`),
  ADD UNIQUE KEY `transactionId_21` (`transactionId`),
  ADD UNIQUE KEY `transactionId_22` (`transactionId`),
  ADD UNIQUE KEY `transactionId_23` (`transactionId`),
  ADD UNIQUE KEY `transactionId_24` (`transactionId`),
  ADD UNIQUE KEY `transactionId_25` (`transactionId`),
  ADD UNIQUE KEY `transactionId_26` (`transactionId`),
  ADD UNIQUE KEY `transactionId_27` (`transactionId`),
  ADD UNIQUE KEY `transactionId_28` (`transactionId`),
  ADD UNIQUE KEY `transactionId_29` (`transactionId`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addedBy` (`addedBy`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payroll_employee_id_month_year` (`employeeId`,`month`,`year`),
  ADD KEY `paidBy` (`paidBy`);

--
-- Indexes for table `punch_logs`
--
ALTER TABLE `punch_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employeeId_idx` (`employeeId`),
  ADD KEY `punch_logs_employee_id` (`employeeId`),
  ADD KEY `punch_logs_date` (`date`),
  ADD KEY `punch_logs_type` (`type`);

--
-- Indexes for table `reference_persons`
--
ALTER TABLE `reference_persons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicleId` (`vehicleId`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `saleId` (`saleId`),
  ADD UNIQUE KEY `saleId_2` (`saleId`),
  ADD UNIQUE KEY `saleId_3` (`saleId`),
  ADD UNIQUE KEY `saleId_4` (`saleId`),
  ADD UNIQUE KEY `saleId_5` (`saleId`),
  ADD UNIQUE KEY `saleId_6` (`saleId`),
  ADD UNIQUE KEY `saleId_7` (`saleId`),
  ADD UNIQUE KEY `saleId_8` (`saleId`),
  ADD UNIQUE KEY `saleId_9` (`saleId`),
  ADD UNIQUE KEY `saleId_10` (`saleId`),
  ADD UNIQUE KEY `saleId_11` (`saleId`),
  ADD UNIQUE KEY `saleId_12` (`saleId`),
  ADD UNIQUE KEY `saleId_13` (`saleId`),
  ADD UNIQUE KEY `saleId_14` (`saleId`),
  ADD UNIQUE KEY `saleId_15` (`saleId`),
  ADD UNIQUE KEY `saleId_16` (`saleId`),
  ADD UNIQUE KEY `saleId_17` (`saleId`),
  ADD UNIQUE KEY `saleId_18` (`saleId`),
  ADD UNIQUE KEY `saleId_19` (`saleId`),
  ADD UNIQUE KEY `saleId_20` (`saleId`),
  ADD UNIQUE KEY `saleId_21` (`saleId`),
  ADD UNIQUE KEY `saleId_22` (`saleId`),
  ADD UNIQUE KEY `saleId_23` (`saleId`),
  ADD UNIQUE KEY `saleId_24` (`saleId`),
  ADD UNIQUE KEY `saleId_25` (`saleId`),
  ADD UNIQUE KEY `saleId_26` (`saleId`),
  ADD UNIQUE KEY `saleId_27` (`saleId`),
  ADD UNIQUE KEY `saleId_28` (`saleId`),
  ADD UNIQUE KEY `saleId_29` (`saleId`),
  ADD KEY `vehicleId` (`vehicleId`),
  ADD KEY `customerId` (`customerId`);

--
-- Indexes for table `sharing_persons`
--
ALTER TABLE `sharing_persons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicleId` (`vehicleId`);

--
-- Indexes for table `showroom_ledger`
--
ALTER TABLE `showroom_ledger`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addedBy` (`addedBy`);

--
-- Indexes for table `team_en`
--
ALTER TABLE `team_en`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `team_fa`
--
ALTER TABLE `team_fa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `team_ps`
--
ALTER TABLE `team_ps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `testimonial_en`
--
ALTER TABLE `testimonial_en`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `testimonial_fa`
--
ALTER TABLE `testimonial_fa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `testimonial_ps`
--
ALTER TABLE `testimonial_ps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `time_setting`
--
ALTER TABLE `time_setting`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `username_13` (`username`),
  ADD UNIQUE KEY `username_14` (`username`),
  ADD UNIQUE KEY `username_15` (`username`),
  ADD UNIQUE KEY `username_16` (`username`),
  ADD UNIQUE KEY `username_17` (`username`),
  ADD UNIQUE KEY `username_18` (`username`),
  ADD UNIQUE KEY `username_19` (`username`),
  ADD UNIQUE KEY `username_20` (`username`),
  ADD UNIQUE KEY `username_21` (`username`),
  ADD UNIQUE KEY `username_22` (`username`),
  ADD UNIQUE KEY `username_23` (`username`),
  ADD UNIQUE KEY `username_24` (`username`),
  ADD UNIQUE KEY `username_25` (`username`),
  ADD UNIQUE KEY `username_26` (`username`),
  ADD UNIQUE KEY `username_27` (`username`),
  ADD UNIQUE KEY `username_28` (`username`),
  ADD UNIQUE KEY `username_29` (`username`),
  ADD UNIQUE KEY `username_30` (`username`),
  ADD UNIQUE KEY `username_31` (`username`),
  ADD UNIQUE KEY `username_32` (`username`),
  ADD UNIQUE KEY `username_33` (`username`),
  ADD UNIQUE KEY `username_34` (`username`),
  ADD UNIQUE KEY `username_35` (`username`),
  ADD UNIQUE KEY `username_36` (`username`),
  ADD UNIQUE KEY `username_37` (`username`),
  ADD UNIQUE KEY `username_38` (`username`),
  ADD UNIQUE KEY `username_39` (`username`),
  ADD UNIQUE KEY `username_40` (`username`),
  ADD UNIQUE KEY `username_41` (`username`),
  ADD UNIQUE KEY `username_42` (`username`),
  ADD UNIQUE KEY `username_43` (`username`),
  ADD UNIQUE KEY `username_44` (`username`),
  ADD UNIQUE KEY `username_45` (`username`),
  ADD UNIQUE KEY `username_46` (`username`),
  ADD UNIQUE KEY `username_47` (`username`),
  ADD UNIQUE KEY `username_48` (`username`),
  ADD UNIQUE KEY `username_49` (`username`),
  ADD UNIQUE KEY `username_50` (`username`),
  ADD UNIQUE KEY `username_51` (`username`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicleId` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_2` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_2` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_3` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_3` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_4` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_4` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_5` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_5` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_6` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_6` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_7` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_7` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_8` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_8` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_9` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_9` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_10` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_10` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_11` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_11` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_12` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_12` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_13` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_13` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_14` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_14` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_15` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_15` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_16` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_16` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_17` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_17` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_18` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_18` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_19` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_19` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_20` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_20` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_21` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_21` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_22` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_22` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_23` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_23` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_24` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_24` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_25` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_25` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_26` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_26` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_27` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_27` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_28` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_28` (`chassisNumber`),
  ADD UNIQUE KEY `vehicleId_29` (`vehicleId`),
  ADD UNIQUE KEY `chassisNumber_29` (`chassisNumber`),
  ADD UNIQUE KEY `engineNumber` (`engineNumber`),
  ADD UNIQUE KEY `engineNumber_2` (`engineNumber`),
  ADD UNIQUE KEY `engineNumber_3` (`engineNumber`),
  ADD UNIQUE KEY `engineNumber_4` (`engineNumber`),
  ADD UNIQUE KEY `engineNumber_5` (`engineNumber`);

--
-- Indexes for table `vehicle_costs`
--
ALTER TABLE `vehicle_costs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicleId` (`vehicleId`),
  ADD KEY `addedBy` (`addedBy`);

--
-- Indexes for table `vehicle_images`
--
ALTER TABLE `vehicle_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicleId` (`vehicleId`);

--
-- Indexes for table `vehicle_options`
--
ALTER TABLE `vehicle_options`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicle_options_field_value` (`field`,`value`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `about_en`
--
ALTER TABLE `about_en`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `about_fa`
--
ALTER TABLE `about_fa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `about_logos_en`
--
ALTER TABLE `about_logos_en`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `about_logos_fa`
--
ALTER TABLE `about_logos_fa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `about_logos_ps`
--
ALTER TABLE `about_logos_ps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `about_ps`
--
ALTER TABLE `about_ps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `carousel_items`
--
ALTER TABLE `carousel_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `choose_videos`
--
ALTER TABLE `choose_videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `commission_distributions`
--
ALTER TABLE `commission_distributions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `contact_en`
--
ALTER TABLE `contact_en`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_fa`
--
ALTER TABLE `contact_fa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_ps`
--
ALTER TABLE `contact_ps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `currency_exchanges`
--
ALTER TABLE `currency_exchanges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `customer_ledger`
--
ALTER TABLE `customer_ledger`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=216;

--
-- AUTO_INCREMENT for table `edit_history`
--
ALTER TABLE `edit_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=391;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ledger_transactions`
--
ALTER TABLE `ledger_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `punch_logs`
--
ALTER TABLE `punch_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `reference_persons`
--
ALTER TABLE `reference_persons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `sharing_persons`
--
ALTER TABLE `sharing_persons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `showroom_ledger`
--
ALTER TABLE `showroom_ledger`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=344;

--
-- AUTO_INCREMENT for table `team_en`
--
ALTER TABLE `team_en`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `team_fa`
--
ALTER TABLE `team_fa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `team_ps`
--
ALTER TABLE `team_ps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `testimonial_en`
--
ALTER TABLE `testimonial_en`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `testimonial_fa`
--
ALTER TABLE `testimonial_fa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `testimonial_ps`
--
ALTER TABLE `testimonial_ps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `vehicle_costs`
--
ALTER TABLE `vehicle_costs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `vehicle_images`
--
ALTER TABLE `vehicle_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `vehicle_options`
--
ALTER TABLE `vehicle_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `commission_distributions`
--
ALTER TABLE `commission_distributions`
  ADD CONSTRAINT `commission_distributions_ibfk_57` FOREIGN KEY (`saleId`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `commission_distributions_ibfk_58` FOREIGN KEY (`sharingPersonId`) REFERENCES `sharing_persons` (`id`);

--
-- Constraints for table `currency_exchanges`
--
ALTER TABLE `currency_exchanges`
  ADD CONSTRAINT `currency_exchanges_ibfk_1` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`);

--
-- Constraints for table `customer_ledger`
--
ALTER TABLE `customer_ledger`
  ADD CONSTRAINT `customer_ledger_ibfk_85` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_ledger_ibfk_86` FOREIGN KEY (`saleId`) REFERENCES `sales` (`id`),
  ADD CONSTRAINT `customer_ledger_ibfk_87` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`);

--
-- Constraints for table `edit_history`
--
ALTER TABLE `edit_history`
  ADD CONSTRAINT `edit_history_ibfk_1` FOREIGN KEY (`entityId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exchange_rates`
--
ALTER TABLE `exchange_rates`
  ADD CONSTRAINT `exchange_rates_ibfk_1` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`);

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`);

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `payroll_ibfk_57` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payroll_ibfk_58` FOREIGN KEY (`paidBy`) REFERENCES `users` (`id`);

--
-- Constraints for table `punch_logs`
--
ALTER TABLE `punch_logs`
  ADD CONSTRAINT `punch_logs_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reference_persons`
--
ALTER TABLE `reference_persons`
  ADD CONSTRAINT `reference_persons_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_57` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_ibfk_58` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sharing_persons`
--
ALTER TABLE `sharing_persons`
  ADD CONSTRAINT `sharing_persons_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `showroom_ledger`
--
ALTER TABLE `showroom_ledger`
  ADD CONSTRAINT `showroom_ledger_ibfk_1` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`);

--
-- Constraints for table `vehicle_costs`
--
ALTER TABLE `vehicle_costs`
  ADD CONSTRAINT `vehicle_costs_ibfk_57` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `vehicle_costs_ibfk_58` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`);

--
-- Constraints for table `vehicle_images`
--
ALTER TABLE `vehicle_images`
  ADD CONSTRAINT `vehicle_images_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
