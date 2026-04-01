-- MySQL dump 10.13  Distrib 8.4.0, for macos13.2 (arm64)
--
-- Host: 127.0.0.1    Database: easyvate_cars
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `about_en`
--

DROP TABLE IF EXISTS `about_en`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_en` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `wide_feature` text COLLATE utf8mb4_general_ci,
  `trust_feature` text COLLATE utf8mb4_general_ci,
  `professional_feature` text COLLATE utf8mb4_general_ci,
  `about_us` text COLLATE utf8mb4_general_ci,
  `experience` text COLLATE utf8mb4_general_ci,
  `choose_trust` text COLLATE utf8mb4_general_ci,
  `choose_quality` text COLLATE utf8mb4_general_ci,
  `choose_process` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_en`
--

LOCK TABLES `about_en` WRITE;
/*!40000 ALTER TABLE `about_en` DISABLE KEYS */;
INSERT INTO `about_en` VALUES (1,'Welcome to Niazay Khpalwak Car Showroom','Your Trusted Platform for Buying and Selling Vehicles','Niazay Khpalwak Car Showroom is a trusted platform for buying and selling high-quality vehicles. We specialize in container imported cars, licensed vehicles, and a wide variety of brands including Toyota, BMW, Mercedes, Luxes, and more. Our goal is to connect buyers and sellers easily while providing transparent pricing, reliable vehicles, and excellent customer service to thousands of satisfied clients.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-28 13:08:25','2026-03-28 13:08:25');
/*!40000 ALTER TABLE `about_en` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `about_fa`
--

DROP TABLE IF EXISTS `about_fa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_fa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `wide_feature` text COLLATE utf8mb4_general_ci,
  `trust_feature` text COLLATE utf8mb4_general_ci,
  `professional_feature` text COLLATE utf8mb4_general_ci,
  `about_us` text COLLATE utf8mb4_general_ci,
  `experience` text COLLATE utf8mb4_general_ci,
  `choose_trust` text COLLATE utf8mb4_general_ci,
  `choose_quality` text COLLATE utf8mb4_general_ci,
  `choose_process` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_fa`
--

LOCK TABLES `about_fa` WRITE;
/*!40000 ALTER TABLE `about_fa` DISABLE KEYS */;
INSERT INTO `about_fa` VALUES (1,'به نمایشگاه موتر نیازی خپلواک خوش آمدید','پلتفرم مطمئن شما برای خرید و فروش موترها','نمایشگاه موتر نیازی خپلواک یک پلتفرم مطمئن برای خرید و فروش موترهای با کیفیت بالا میباشد. ما در موترهای وارداتی کانتینری، موترهای دارای جواز، و انواع مختلف برندها از جمله تویوتا، BMW، مرسدس، لکسس و غیره تخصص داریم. هدف ما این است که خریداران و فروشندگان را به آسانی وصل کنیم، موترهای قابل اعتماد با قیمت شفاف ارائه دهیم و خدمات عالی به مشتریان ارائه کنیم تا هزاران مشتری راضی داشته باشیم.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-28 13:11:52','2026-03-28 13:12:28');
/*!40000 ALTER TABLE `about_fa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `about_logos_en`
--

DROP TABLE IF EXISTS `about_logos_en`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_logos_en` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aboutId` int NOT NULL COMMENT 'ID of the about_en record',
  `filename` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `size` int NOT NULL,
  `order` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_logos_en`
--

LOCK TABLES `about_logos_en` WRITE;
/*!40000 ALTER TABLE `about_logos_en` DISABLE KEYS */;
/*!40000 ALTER TABLE `about_logos_en` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `about_logos_fa`
--

DROP TABLE IF EXISTS `about_logos_fa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_logos_fa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aboutId` int NOT NULL COMMENT 'ID of the about_fa record',
  `filename` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `size` int NOT NULL,
  `order` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_logos_fa`
--

LOCK TABLES `about_logos_fa` WRITE;
/*!40000 ALTER TABLE `about_logos_fa` DISABLE KEYS */;
/*!40000 ALTER TABLE `about_logos_fa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `about_logos_ps`
--

DROP TABLE IF EXISTS `about_logos_ps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_logos_ps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aboutId` int NOT NULL COMMENT 'ID of the about_ps record',
  `filename` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `size` int NOT NULL,
  `order` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_logos_ps`
--

LOCK TABLES `about_logos_ps` WRITE;
/*!40000 ALTER TABLE `about_logos_ps` DISABLE KEYS */;
/*!40000 ALTER TABLE `about_logos_ps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `about_ps`
--

DROP TABLE IF EXISTS `about_ps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_ps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `wide_feature` text COLLATE utf8mb4_general_ci,
  `trust_feature` text COLLATE utf8mb4_general_ci,
  `professional_feature` text COLLATE utf8mb4_general_ci,
  `about_us` text COLLATE utf8mb4_general_ci,
  `experience` text COLLATE utf8mb4_general_ci,
  `choose_trust` text COLLATE utf8mb4_general_ci,
  `choose_quality` text COLLATE utf8mb4_general_ci,
  `choose_process` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_ps`
--

LOCK TABLES `about_ps` WRITE;
/*!40000 ALTER TABLE `about_ps` DISABLE KEYS */;
INSERT INTO `about_ps` VALUES (1,'نیازي خپلواک موټر نندارتون ته ښه راغلاست','ستاسې باوري پلاتفورم د موټرو د پېرلو او پلورلو لپاره','نیازي خپلواک موټر شوروم یو باوري پلاټفورم دی د لوړ کیفیت لرونکو موټرانو د پېرلو او پلورلو لپاره. موږ کانتینری موټران، اسناد داره موټران، او د مختلفو برانډونو لکه ټویوټا، BMW، مرسډیز، لکسس او نورو کې تخصص لرو. زموږ هدف دا دی چې پېرودونکي او پلورونکي په اسانۍ سره وصل کړو، په شفافه بیه موټرونه وړاندې کړو، او غوره مشتریانو خدمتونه وړاندې کړو ترڅو زرګونه رضایتمند مشتریان خوشحال کړو.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-28 13:11:10','2026-03-28 13:11:10');
/*!40000 ALTER TABLE `about_ps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` int NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `presentDays` int NOT NULL DEFAULT '0',
  `absentDays` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendance_employee_id_month_year` (`employeeId`,`month`,`year`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (2,1,'','2026-02-14 20:16:55','2026-02-14 20:16:55',2,2026,23,7),(3,2,'','2026-02-14 20:20:07','2026-02-14 20:20:07',2,2026,20,10);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carousel_items`
--

DROP TABLE IF EXISTS `carousel_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carousel_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Path to uploaded image',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carousel_items`
--

LOCK TABLES `carousel_items` WRITE;
/*!40000 ALTER TABLE `carousel_items` DISABLE KEYS */;
INSERT INTO `carousel_items` VALUES (1,'Audi Q7','2020',600000.00,'/uploads/carousel-images/carousel-1774704999805-554960949.jpg','2026-03-28 13:36:39','2026-03-28 13:36:39'),(2,'BMW','2021',800000.00,'/uploads/carousel-images/carousel-1774705443124-119788713.jpg','2026-03-28 13:44:03','2026-03-28 13:44:03'),(3,'Porsche Cayenne S','2019',550000.00,'/uploads/carousel-images/carousel-1774984106023-868240847.jpg','2026-03-28 17:14:24','2026-03-31 19:08:26');
/*!40000 ALTER TABLE `carousel_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `choose_videos`
--

DROP TABLE IF EXISTS `choose_videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `choose_videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `videoPath` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Path to uploaded video file',
  `order` int DEFAULT '0' COMMENT 'Display order',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `choose_videos`
--

LOCK TABLES `choose_videos` WRITE;
/*!40000 ALTER TABLE `choose_videos` DISABLE KEYS */;
INSERT INTO `choose_videos` VALUES (1,'/uploads/videos/video-1774705491300-591556433.mp4',1,'2026-03-28 13:44:51','2026-03-28 13:44:51');
/*!40000 ALTER TABLE `choose_videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_distributions`
--

DROP TABLE IF EXISTS `commission_distributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commission_distributions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saleId` int NOT NULL,
  `sharingPersonId` int DEFAULT NULL,
  `personName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sharePercentage` decimal(5,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `paidDate` datetime DEFAULT NULL,
  `status` enum('Pending','Paid') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `saleId` (`saleId`),
  KEY `sharingPersonId` (`sharingPersonId`),
  CONSTRAINT `commission_distributions_ibfk_57` FOREIGN KEY (`saleId`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `commission_distributions_ibfk_58` FOREIGN KEY (`sharingPersonId`) REFERENCES `sharing_persons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_distributions`
--

LOCK TABLES `commission_distributions` WRITE;
/*!40000 ALTER TABLE `commission_distributions` DISABLE KEYS */;
INSERT INTO `commission_distributions` VALUES (2,16,4,'Ahmad Khan',50.00,-40000.00,NULL,'Pending','2026-03-29 21:43:39','2026-03-29 21:43:39');
/*!40000 ALTER TABLE `commission_distributions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_en`
--

DROP TABLE IF EXISTS `contact_en`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_en` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `facebook` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `x` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `youtube` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `weekdays` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `friday` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branchName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_en`
--

LOCK TABLES `contact_en` WRITE;
/*!40000 ALTER TABLE `contact_en` DISABLE KEYS */;
INSERT INTO `contact_en` VALUES (1,'info@gmail.com','0700000000','facebook.com','instagram.com','x.com','youtube.com','Sat-Thur 08:00 AM - 05:00 PM','Fri 08:00 AM - 12:00 PM','Niazay Khpalwak Car Showroom (Main Branch)','Spin Boldak Highway, Kandahar, Afghanistan','2026-03-28 13:28:46','2026-03-28 13:28:46');
/*!40000 ALTER TABLE `contact_en` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_fa`
--

DROP TABLE IF EXISTS `contact_fa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_fa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `facebook` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `x` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `youtube` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `weekdays` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `friday` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branchName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_fa`
--

LOCK TABLES `contact_fa` WRITE;
/*!40000 ALTER TABLE `contact_fa` DISABLE KEYS */;
INSERT INTO `contact_fa` VALUES (1,'info@gmail.com','0700000000','facebook.com','instagram.com','x.com','youtube.com','سنبه-پنجشنبه ۰۸:۰۰ صبح - ۰۵:۰۰ شام','جمعه ۰۸:۰۰ صبح - ۱۲:۰۰ ظهر','نماشګاه موتر نیازی خپلواک (بخش مرکزی)','سرک عمومی سپین بولدک، کندهار افغانستان','2026-03-28 13:34:10','2026-03-28 13:34:50');
/*!40000 ALTER TABLE `contact_fa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_ps`
--

DROP TABLE IF EXISTS `contact_ps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_ps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `facebook` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `x` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `youtube` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `weekdays` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `friday` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branchName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_ps`
--

LOCK TABLES `contact_ps` WRITE;
/*!40000 ALTER TABLE `contact_ps` DISABLE KEYS */;
INSERT INTO `contact_ps` VALUES (1,'info@gmail.com','0700000000','facebook.com','instagram.com','x.com','youtube.com','شنبه-پنجشنبه ۰۸:۰۰ سهار - ۰۵:۰۰ ماښام','جمعه ۰۸:۰۰ سهار - ۱۲:۰۰ غرمې','نیازي خپلواک موټرانو شوروم (مرکزي برخه)','سپین بولدک عمومی سړک، کندهار افغانستان','2026-03-28 13:32:01','2026-03-28 13:32:01');
/*!40000 ALTER TABLE `contact_ps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currency_exchanges`
--

DROP TABLE IF EXISTS `currency_exchanges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currency_exchanges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fromCurrency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toCurrency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fromAmount` decimal(15,2) NOT NULL,
  `toAmount` decimal(15,2) NOT NULL,
  `exchangeRate` decimal(10,4) NOT NULL,
  `date` datetime NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `addedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `addedBy` (`addedBy`),
  CONSTRAINT `currency_exchanges_ibfk_1` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currency_exchanges`
--

LOCK TABLES `currency_exchanges` WRITE;
/*!40000 ALTER TABLE `currency_exchanges` DISABLE KEYS */;
INSERT INTO `currency_exchanges` VALUES (6,'USD','AFN',1.00,60.00,60.0000,'2026-03-29 20:58:21','',1,'2026-03-29 20:58:21','2026-03-29 20:58:21'),(7,'USD','PKR',1.00,280.00,280.0000,'2026-03-29 21:00:20','',1,'2026-03-29 21:00:20','2026-03-29 21:00:20');
/*!40000 ALTER TABLE `currency_exchanges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_ledger`
--

DROP TABLE IF EXISTS `customer_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_ledger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customerId` int NOT NULL,
  `type` enum('Received','Paid','Sale','Investment','Loan','Loan Payment','Installment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'AFN',
  `amountInPKR` decimal(15,2) NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `date` datetime NOT NULL,
  `balance` decimal(15,2) DEFAULT '0.00',
  `saleId` int DEFAULT NULL,
  `addedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `amountInAFN` decimal(15,2) NOT NULL DEFAULT '0.00',
  `exchangeRateUsed` decimal(15,6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customerId` (`customerId`),
  KEY `saleId` (`saleId`),
  KEY `addedBy` (`addedBy`),
  CONSTRAINT `customer_ledger_ibfk_85` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `customer_ledger_ibfk_86` FOREIGN KEY (`saleId`) REFERENCES `sales` (`id`),
  CONSTRAINT `customer_ledger_ibfk_87` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_ledger`
--

LOCK TABLES `customer_ledger` WRITE;
/*!40000 ALTER TABLE `customer_ledger` DISABLE KEYS */;
INSERT INTO `customer_ledger` VALUES (20,8,'Sale',8000.00,'AFN',8000.00,'Purchase of V000002 — total price','2026-03-29 00:00:00',-8000.00,15,1,'2026-03-29 21:29:18','2026-03-29 21:29:18',0.00,NULL),(21,8,'Received',8000.00,'AFN',8000.00,'Down payment for V000002','2026-03-29 00:00:00',0.00,15,1,'2026-03-29 21:29:18','2026-03-29 21:29:18',0.00,NULL),(22,9,'Sale',60000.00,'AFN',60000.00,'Purchase of V000001 — total price','2026-03-29 00:00:00',-60000.00,16,1,'2026-03-29 21:43:39','2026-03-29 21:43:39',0.00,NULL),(23,9,'Received',50000.00,'AFN',50000.00,'Down payment for V000001','2026-03-29 00:00:00',-10000.00,16,1,'2026-03-29 21:43:39','2026-03-29 21:43:39',0.00,NULL),(24,9,'Installment',10000.00,'AFN',10000.00,'Installment payment for sale S000002 — V000001','2026-04-01 00:00:00',0.00,16,1,'2026-04-01 13:12:15','2026-04-01 13:12:15',0.00,NULL);
/*!40000 ALTER TABLE `customer_ledger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fatherName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currentAddress` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `originalAddress` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nationalIdNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerType` enum('Buyer','Investor','Capital Provider','Borrower') COLLATE utf8mb4_unicode_ci DEFAULT 'Buyer',
  `balance` decimal(15,2) DEFAULT '0.00',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `village` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (8,'Ahmad Khan','Mohammad Khan','070000000','Kandahar, Afghanistan','Kandahar, Afghanistan','Kandahar','District 1','56788987790','Buyer',0.00,'2026-03-29 21:16:53','2026-03-29 21:29:18',''),(9,'Zahra Noori','Mohammad Noori','0700000000','Kabul, Afghanistan','Kabul, Afghanistan','Kabul','District 5','657560709798','Borrower',0.00,'2026-03-29 21:19:21','2026-04-01 13:12:15',''),(10,'Karim Anwar','Mohammad Anwar','07000000000','Kandahar, Afghanistan','Kandahar, Afghanistan','Kandahar','District 11','7667999889','Investor',0.00,'2026-03-29 21:20:31','2026-03-29 21:20:31',''),(12,'Niaz Mohammad','dsdw','2323','loy wyala','e23','Faryab','23e2','23423232332','Buyer',0.00,'2026-04-01 16:04:29','2026-04-01 16:04:29','2e');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_exchange_rates`
--

DROP TABLE IF EXISTS `daily_exchange_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_exchange_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL COMMENT 'The date this rate was effective',
  `currency` varchar(10) NOT NULL COMMENT 'Currency code (USD, PKR, etc.)',
  `rateToAFN` decimal(15,6) NOT NULL COMMENT 'How many AFN for 1 unit of this currency on this date',
  `createdBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `daily_exchange_rates_date_currency` (`date`,`currency`),
  KEY `createdBy` (`createdBy`),
  CONSTRAINT `daily_exchange_rates_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_exchange_rates`
--

LOCK TABLES `daily_exchange_rates` WRITE;
/*!40000 ALTER TABLE `daily_exchange_rates` DISABLE KEYS */;
INSERT INTO `daily_exchange_rates` VALUES (1,'2026-04-01','USD',70.000000,NULL,'2026-04-01 15:03:17','2026-04-01 16:34:48'),(2,'2026-04-01','PKR',0.250000,NULL,'2026-04-01 15:03:17','2026-04-01 16:34:48');
/*!40000 ALTER TABLE `daily_exchange_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edit_history`
--

DROP TABLE IF EXISTS `edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edit_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entityType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` int NOT NULL,
  `fieldName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `oldValue` text COLLATE utf8mb4_unicode_ci,
  `newValue` text COLLATE utf8mb4_unicode_ci,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `editedBy` int NOT NULL,
  `editedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `entityId` (`entityId`),
  CONSTRAINT `edit_history_ibfk_1` FOREIGN KEY (`entityId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edit_history`
--

LOCK TABLES `edit_history` WRITE;
/*!40000 ALTER TABLE `edit_history` DISABLE KEYS */;
INSERT INTO `edit_history` VALUES (13,'Vehicle',21,'transportCostToDubai','0.00','1000','Shipping cost\n',1,'2026-03-29 20:57:35'),(14,'Vehicle',21,'importCostToAfghanistan','0.00','500','Shipping cost\n',1,'2026-03-29 20:57:35'),(15,'Vehicle',21,'repairCost','0.00','500','Shipping cost\n',1,'2026-03-29 20:57:35'),(16,'Vehicle',21,'basePurchasePrice','2000.00','2000','Shipping cost\n',1,'2026-03-29 20:57:35'),(17,'Vehicle',21,'sellingPrice','60000.00','60000','Shipping cost\n',1,'2026-03-29 20:57:35'),(18,'Vehicle',22,'transportCostToDubai','1000.00','1000','Import\n',1,'2026-03-29 21:10:45'),(19,'Vehicle',22,'importCostToAfghanistan','0.00','500','Import\n',1,'2026-03-29 21:10:45'),(20,'Vehicle',22,'repairCost','0.00','0','Import\n',1,'2026-03-29 21:10:45'),(21,'Vehicle',22,'basePurchasePrice','3000.00','3000','Import\n',1,'2026-03-29 21:10:45'),(22,'Vehicle',22,'sellingPrice','8000.00','8000','Import\n',1,'2026-03-29 21:10:45'),(23,'Vehicle',22,'transportCostToDubai','1000.00','1000','arrived',1,'2026-03-29 21:11:42'),(24,'Vehicle',22,'importCostToAfghanistan','500.00','500','arrived',1,'2026-03-29 21:11:42'),(25,'Vehicle',22,'repairCost','0.00','0','arrived',1,'2026-03-29 21:11:42'),(26,'Vehicle',22,'basePurchasePrice','3000.00','3000','arrived',1,'2026-03-29 21:11:42'),(27,'Vehicle',22,'sellingPrice','8000.00','8000','arrived',1,'2026-03-29 21:11:42'),(28,'Vehicle',22,'status','Coming','Available','arrived',1,'2026-03-29 21:11:42'),(29,'Vehicle',23,'baseCurrency','PKR','USD','changing price',1,'2026-03-29 21:14:55'),(30,'Vehicle',23,'transportCostToDubai','1500.00','1500','changing price',1,'2026-03-29 21:14:55'),(31,'Vehicle',23,'importCostToAfghanistan','500.00','500','changing price',1,'2026-03-29 21:14:55'),(32,'Vehicle',23,'repairCost','1000.00','1000','changing price',1,'2026-03-29 21:14:55'),(33,'Vehicle',23,'basePurchasePrice','4000.00','4000','changing price',1,'2026-03-29 21:14:55'),(34,'Vehicle',23,'sellingPrice','10000.00','10000','changing price',1,'2026-03-29 21:14:55'),(35,'Vehicle',23,'transportCostToDubai','1500.00','1500','ds',1,'2026-04-01 11:58:13'),(36,'Vehicle',23,'importCostToAfghanistan','500.00','500','ds',1,'2026-04-01 11:58:13'),(37,'Vehicle',23,'repairCost','1000.00','1000','ds',1,'2026-04-01 11:58:13'),(38,'Vehicle',23,'basePurchasePrice','4000.00','4000','ds',1,'2026-04-01 11:58:13'),(39,'Vehicle',23,'sellingPrice','10000.00','10000','ds',1,'2026-04-01 11:58:13'),(40,'Vehicle',23,'transportCostToDubai','1500.00','1500','ds',1,'2026-04-01 12:14:44'),(41,'Vehicle',23,'importCostToAfghanistan','500.00','500','ds',1,'2026-04-01 12:14:44'),(42,'Vehicle',23,'repairCost','1000.00','1000','ds',1,'2026-04-01 12:14:44'),(43,'Vehicle',23,'basePurchasePrice','4000.00','4000','ds',1,'2026-04-01 12:14:44'),(44,'Vehicle',23,'sellingPrice','10000.00','10000','ds',1,'2026-04-01 12:14:44'),(45,'Vehicle',23,'transportCostToDubai','1500.00','1500','oi',1,'2026-04-01 12:17:35'),(46,'Vehicle',23,'importCostToAfghanistan','500.00','500','oi',1,'2026-04-01 12:17:35'),(47,'Vehicle',23,'repairCost','1000.00','1000','oi',1,'2026-04-01 12:17:35'),(48,'Vehicle',23,'basePurchasePrice','4000.00','4000','oi',1,'2026-04-01 12:17:35'),(49,'Vehicle',23,'sellingPrice','10000.00','10000','oi',1,'2026-04-01 12:17:35');
/*!40000 ALTER TABLE `edit_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tazkiraNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monthlySalary` decimal(15,2) NOT NULL,
  `joiningDate` datetime NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `biometricId` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employeeId` (`employeeId`),
  UNIQUE KEY `employeeId_2` (`employeeId`),
  UNIQUE KEY `employeeId_3` (`employeeId`),
  UNIQUE KEY `employeeId_4` (`employeeId`),
  UNIQUE KEY `employeeId_5` (`employeeId`),
  UNIQUE KEY `employeeId_6` (`employeeId`),
  UNIQUE KEY `employeeId_7` (`employeeId`),
  UNIQUE KEY `employeeId_8` (`employeeId`),
  UNIQUE KEY `employeeId_9` (`employeeId`),
  UNIQUE KEY `employeeId_10` (`employeeId`),
  UNIQUE KEY `employeeId_11` (`employeeId`),
  UNIQUE KEY `employeeId_12` (`employeeId`),
  UNIQUE KEY `employeeId_13` (`employeeId`),
  UNIQUE KEY `employeeId_14` (`employeeId`),
  UNIQUE KEY `employeeId_15` (`employeeId`),
  UNIQUE KEY `employeeId_16` (`employeeId`),
  UNIQUE KEY `employeeId_17` (`employeeId`),
  UNIQUE KEY `employeeId_18` (`employeeId`),
  UNIQUE KEY `employeeId_19` (`employeeId`),
  UNIQUE KEY `employeeId_20` (`employeeId`),
  UNIQUE KEY `employeeId_21` (`employeeId`),
  UNIQUE KEY `employeeId_22` (`employeeId`),
  UNIQUE KEY `employeeId_23` (`employeeId`),
  UNIQUE KEY `employeeId_24` (`employeeId`),
  UNIQUE KEY `employeeId_25` (`employeeId`),
  UNIQUE KEY `employeeId_26` (`employeeId`),
  UNIQUE KEY `employeeId_27` (`employeeId`),
  UNIQUE KEY `employeeId_28` (`employeeId`),
  UNIQUE KEY `employeeId_29` (`employeeId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'EMP0001','khan','070000000','','12','','HR',30000.00,'2026-02-14 00:00:00','Active','','2026-02-14 19:31:21','2026-04-01 13:38:42'),(2,'EMP0002','jan','+919000183872','','','tarnaka','manager2',30000.00,'2026-02-14 00:00:00','Inactive','','2026-02-14 20:19:38','2026-04-01 15:35:17');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exchange_rates`
--

DROP TABLE IF EXISTS `exchange_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exchange_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rateToAFN` decimal(15,6) NOT NULL COMMENT 'How many AFN for 1 unit of this currency',
  `effectiveDate` datetime NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `updatedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `currency` (`currency`),
  UNIQUE KEY `currency_2` (`currency`),
  UNIQUE KEY `currency_3` (`currency`),
  UNIQUE KEY `currency_4` (`currency`),
  UNIQUE KEY `currency_5` (`currency`),
  UNIQUE KEY `currency_6` (`currency`),
  UNIQUE KEY `currency_7` (`currency`),
  UNIQUE KEY `currency_8` (`currency`),
  UNIQUE KEY `currency_9` (`currency`),
  UNIQUE KEY `currency_10` (`currency`),
  UNIQUE KEY `currency_11` (`currency`),
  UNIQUE KEY `currency_12` (`currency`),
  UNIQUE KEY `currency_13` (`currency`),
  UNIQUE KEY `currency_14` (`currency`),
  UNIQUE KEY `currency_15` (`currency`),
  UNIQUE KEY `currency_16` (`currency`),
  UNIQUE KEY `currency_17` (`currency`),
  UNIQUE KEY `currency_18` (`currency`),
  UNIQUE KEY `currency_19` (`currency`),
  UNIQUE KEY `currency_20` (`currency`),
  UNIQUE KEY `currency_21` (`currency`),
  UNIQUE KEY `currency_22` (`currency`),
  UNIQUE KEY `currency_23` (`currency`),
  UNIQUE KEY `currency_24` (`currency`),
  UNIQUE KEY `currency_25` (`currency`),
  UNIQUE KEY `currency_26` (`currency`),
  UNIQUE KEY `currency_27` (`currency`),
  UNIQUE KEY `currency_28` (`currency`),
  UNIQUE KEY `currency_29` (`currency`),
  KEY `updatedBy` (`updatedBy`),
  CONSTRAINT `exchange_rates_ibfk_1` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exchange_rates`
--

LOCK TABLES `exchange_rates` WRITE;
/*!40000 ALTER TABLE `exchange_rates` DISABLE KEYS */;
INSERT INTO `exchange_rates` VALUES (1,'USD',70.000000,'2026-02-08 09:32:15',1,NULL,'2026-02-08 09:32:15','2026-02-08 09:32:15'),(2,'PKR',0.250000,'2026-02-08 09:32:15',1,NULL,'2026-02-08 09:32:15','2026-02-08 09:32:15');
/*!40000 ALTER TABLE `exchange_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledger_transactions`
--

DROP TABLE IF EXISTS `ledger_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ledger_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transactionId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionType` enum('Credit','Debit','Vehicle Purchase','Vehicle Sale','Salary','Expense','Currency Exchange','Loan','Commission') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'AFN',
  `amountPKR` decimal(15,2) DEFAULT NULL,
  `relatedEntityType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `relatedEntityId` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `transactionDate` datetime NOT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `amountAFN` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Amount in AFN',
  `exchangeRateUsed` decimal(15,6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactionId` (`transactionId`),
  UNIQUE KEY `transactionId_2` (`transactionId`),
  UNIQUE KEY `transactionId_3` (`transactionId`),
  UNIQUE KEY `transactionId_4` (`transactionId`),
  UNIQUE KEY `transactionId_5` (`transactionId`),
  UNIQUE KEY `transactionId_6` (`transactionId`),
  UNIQUE KEY `transactionId_7` (`transactionId`),
  UNIQUE KEY `transactionId_8` (`transactionId`),
  UNIQUE KEY `transactionId_9` (`transactionId`),
  UNIQUE KEY `transactionId_10` (`transactionId`),
  UNIQUE KEY `transactionId_11` (`transactionId`),
  UNIQUE KEY `transactionId_12` (`transactionId`),
  UNIQUE KEY `transactionId_13` (`transactionId`),
  UNIQUE KEY `transactionId_14` (`transactionId`),
  UNIQUE KEY `transactionId_15` (`transactionId`),
  UNIQUE KEY `transactionId_16` (`transactionId`),
  UNIQUE KEY `transactionId_17` (`transactionId`),
  UNIQUE KEY `transactionId_18` (`transactionId`),
  UNIQUE KEY `transactionId_19` (`transactionId`),
  UNIQUE KEY `transactionId_20` (`transactionId`),
  UNIQUE KEY `transactionId_21` (`transactionId`),
  UNIQUE KEY `transactionId_22` (`transactionId`),
  UNIQUE KEY `transactionId_23` (`transactionId`),
  UNIQUE KEY `transactionId_24` (`transactionId`),
  UNIQUE KEY `transactionId_25` (`transactionId`),
  UNIQUE KEY `transactionId_26` (`transactionId`),
  UNIQUE KEY `transactionId_27` (`transactionId`),
  UNIQUE KEY `transactionId_28` (`transactionId`),
  UNIQUE KEY `transactionId_29` (`transactionId`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledger_transactions`
--

LOCK TABLES `ledger_transactions` WRITE;
/*!40000 ALTER TABLE `ledger_transactions` DISABLE KEYS */;
INSERT INTO `ledger_transactions` VALUES (6,'TR1771082419052_2','Commission',-34000.00,'AFN',-34000.00,'SharingPerson',2,'Commission for khan - 50.00%','2026-02-14 00:00:00',1,'2026-02-14 15:20:19','2026-02-14 15:20:19',0.00,NULL),(10,'TR1771100329665_SALARY_1','Salary',410.71,'AFN',410.71,'Payroll',1,'Salary payment for khan - 2/2026','2026-02-14 20:18:49',1,'2026-02-14 20:18:49','2026-02-14 20:18:49',0.00,NULL),(13,'TR1771113610471','Credit',1396887.00,'AFN',1396887.00,'Installment',2,'Installment payment — SALE-2024-002','2026-02-15 00:00:10',1,'2026-02-15 00:00:10','2026-02-15 00:00:10',0.00,NULL),(14,'TR1774817901363_EX_OUT','Currency Exchange',1.00,'USD',70.00,'CurrencyExchange',6,'Exchange out: 1 USD','2026-03-29 20:58:21',1,'2026-03-29 20:58:21','2026-03-29 20:58:21',0.00,NULL),(15,'TR1774817901383_EX_IN','Currency Exchange',60.00,'AFN',60.00,'CurrencyExchange',6,'Exchange in: 60 AFN','2026-03-29 20:58:21',1,'2026-03-29 20:58:21','2026-03-29 20:58:21',0.00,NULL),(16,'TR1774818020076_EX_OUT','Currency Exchange',1.00,'USD',70.00,'CurrencyExchange',7,'Exchange out: 1 USD','2026-03-29 21:00:20',1,'2026-03-29 21:00:20','2026-03-29 21:00:20',0.00,NULL),(17,'TR1774818020094_EX_IN','Currency Exchange',280.00,'PKR',70.00,'CurrencyExchange',7,'Exchange in: 280 PKR','2026-03-29 21:00:20',1,'2026-03-29 21:00:20','2026-03-29 21:00:20',0.00,NULL),(18,'TR1774819758417','Vehicle Sale',8000.00,'AFN',8000.00,'Sale',15,'Vehicle V000002 sold to customer','2026-03-29 00:00:00',1,'2026-03-29 21:29:18','2026-03-29 21:29:18',0.00,NULL),(19,'TR1774820619825','Vehicle Sale',60000.00,'AFN',60000.00,'Sale',16,'Vehicle V000001 sold to customer','2026-03-29 00:00:00',1,'2026-03-29 21:43:39','2026-03-29 21:43:39',0.00,NULL),(20,'TR1774820619861_4','Commission',-40000.00,'AFN',-40000.00,'SharingPerson',4,'Commission for Ahmad Khan - 50.00%','2026-03-29 00:00:00',1,'2026-03-29 21:43:39','2026-03-29 21:43:39',0.00,NULL),(21,'TR1775049135017','Credit',10000.00,'AFN',10000.00,'Installment',16,'Installment payment — S000002','2026-04-01 00:00:00',1,'2026-04-01 13:12:15','2026-04-01 13:12:15',0.00,NULL),(23,'TR1775059707971_6','Commission',166650.00,'AFN',NULL,'SharingPerson',6,'Commission for das - 33.33%','2025-04-20 00:00:00',1,'2026-04-01 16:08:27','2026-04-01 16:08:27',166650.00,NULL);
/*!40000 ALTER TABLE `ledger_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `personName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'AFN',
  `amountInPKR` decimal(15,2) NOT NULL,
  `borrowDate` datetime NOT NULL,
  `type` enum('Borrowed','Lent','Owner Loan') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Open','Paid') COLLATE utf8mb4_unicode_ci DEFAULT 'Open',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `addedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `amountInAFN` decimal(15,2) NOT NULL DEFAULT '0.00',
  `exchangeRateUsed` decimal(15,6) DEFAULT NULL,
  `customerId` int DEFAULT NULL COMMENT 'Reference to customer',
  PRIMARY KEY (`id`),
  KEY `addedBy` (`addedBy`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` int NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `baseSalary` decimal(15,2) NOT NULL,
  `presentDays` int DEFAULT '0',
  `absentDays` int DEFAULT '0',
  `calculatedSalary` decimal(15,2) NOT NULL,
  `commission` decimal(15,2) DEFAULT '0.00',
  `deductions` decimal(15,2) DEFAULT '0.00',
  `totalAmount` decimal(15,2) NOT NULL,
  `paidAmount` decimal(15,2) DEFAULT '0.00',
  `paymentDate` datetime DEFAULT NULL,
  `status` enum('Pending','Paid','Partial') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `paidBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payroll_employee_id_month_year` (`employeeId`,`month`,`year`),
  KEY `paidBy` (`paidBy`),
  CONSTRAINT `payroll_ibfk_57` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payroll_ibfk_58` FOREIGN KEY (`paidBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
INSERT INTO `payroll` VALUES (1,1,2,2026,500.00,23,7,410.71,0.00,0.00,410.71,410.71,'2026-02-14 20:18:49','Paid','',1,'2026-02-14 20:17:08','2026-02-14 20:18:49'),(2,2,2,2026,30000.00,20,10,21428.57,0.00,0.00,21428.57,0.00,NULL,'Pending','Auto-generated',1,'2026-02-14 20:20:10','2026-02-14 20:20:10'),(3,1,3,2026,30000.00,0,0,0.00,0.00,0.00,0.00,0.00,NULL,'Pending','',1,'2026-04-01 13:40:01','2026-04-01 13:40:01');
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reference_persons`
--

DROP TABLE IF EXISTS `reference_persons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reference_persons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicleId` int NOT NULL,
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tazkiraNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photoPath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicleId` (`vehicleId`),
  CONSTRAINT `reference_persons_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reference_persons`
--

LOCK TABLES `reference_persons` WRITE;
/*!40000 ALTER TABLE `reference_persons` DISABLE KEYS */;
INSERT INTO `reference_persons` VALUES (4,22,'Karim Ullah','456788','0700000000',NULL,'Kandahar, Afghanistan','2026-03-29 21:11:42','2026-03-29 21:11:42'),(7,23,'ds','s','',NULL,'sd','2026-04-01 12:17:35','2026-04-01 12:17:35');
/*!40000 ALTER TABLE `reference_persons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saleId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicleId` int NOT NULL,
  `customerId` int DEFAULT NULL,
  `sellingPrice` decimal(15,2) NOT NULL,
  `totalCost` decimal(15,2) NOT NULL,
  `profit` decimal(15,2) NOT NULL,
  `commission` decimal(15,2) DEFAULT '0.00',
  `ownerShare` decimal(15,2) NOT NULL,
  `saleDate` datetime NOT NULL,
  `paymentMethod` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Cash',
  `downPayment` decimal(15,2) DEFAULT '0.00',
  `remainingAmount` decimal(15,2) DEFAULT '0.00',
  `paidAmount` decimal(15,2) DEFAULT '0.00',
  `paymentStatus` enum('Paid','Partial','Pending') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `invoicePath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soldBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `saleType` enum('Exchange Car','Container One Key','Licensed Car') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Container One Key',
  `sellerName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sellerFatherName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sellerProvince` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sellerDistrict` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sellerVillage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sellerAddress` text COLLATE utf8mb4_unicode_ci,
  `sellerIdNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sellerPhone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleColor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleModel` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleEngine` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleChassis` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleFuelType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehiclePlateNo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleMonolithicCut` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priceDifference` decimal(15,2) DEFAULT '0.00',
  `priceDifferencePaidBy` enum('Buyer','Seller') COLLATE utf8mb4_unicode_ci DEFAULT 'Buyer',
  `trafficTransferDate` datetime DEFAULT NULL,
  `note2` text COLLATE utf8mb4_unicode_ci,
  `witnessName1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `witnessName2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchangeVehicleId` int DEFAULT NULL COMMENT 'ID of the new vehicle created in inventory from exchange',
  `exchVehicleCategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleManufacturer` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleYear` int DEFAULT NULL,
  `exchVehicleEngineType` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleTransmission` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleMileage` int DEFAULT NULL,
  `exchVehicleLicense` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exchVehicleSteering` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Left',
  `sellingCurrency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'AFN' COMMENT 'Currency of the selling price',
  `sellingPriceAFN` decimal(15,2) DEFAULT NULL COMMENT 'Selling price in AFN',
  `exchangeRateUsed` decimal(15,6) DEFAULT NULL,
  `buyerName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyerFatherName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyerPhone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyerAddress` text COLLATE utf8mb4_unicode_ci,
  `buyerIdNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyerProvince` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyerDistrict` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyerVillage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saleId` (`saleId`),
  KEY `vehicleId` (`vehicleId`),
  KEY `customerId` (`customerId`),
  CONSTRAINT `sales_ibfk_57` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `sales_ibfk_58` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (15,'S000001',22,8,8000.00,211000.00,-203000.00,0.00,-203000.00,'2026-03-29 00:00:00','Cash',8000.00,0.00,8000.00,'Paid','This car is sold on Omer by Cash','/Users/niazmdoostyar/Desktop/MERN Test/Easyvate_Car_Selling/backend/uploads/pdf/container_bill_S000001.pdf',1,'2026-03-29 21:29:18','2026-04-01 15:30:08','Container One Key','Omer','Haji Gul','Kandahar','Arghandab',NULL,'Kandahar','8790870908','0700000000',NULL,NULL,NULL,NULL,NULL,NULL,'Monolithic',0.00,'Buyer',NULL,NULL,'Ahmad','Mahmood',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Left','AFN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,'S000002',21,9,60000.00,140000.00,-80000.00,-40000.00,-40000.00,'2026-03-29 00:00:00','Cash',50000.00,0.00,60000.00,'Paid','دغه موټر پر محمد خرڅ سو د ۱۰۰۰۰ افغانیو په باقی سره','/Users/niazmdoostyar/Desktop/MERN Test/Easyvate_Car_Selling/backend/uploads/pdf/licensed_bill_S000002.pdf',1,'2026-03-29 21:43:39','2026-04-01 15:30:24','Licensed Car','محمد','خان','کندهار','ښار','چوڼی','کندهار','۹۸۷۹۰۷۹۸','۰۷۰۰۰۰۰۰۰۰۰۰',NULL,NULL,NULL,NULL,NULL,NULL,'Monolithic',0.00,'Buyer','2026-02-28 00:00:00',NULL,'کریم الله','جانان',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Left','AFN',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'S000003',24,NULL,500000.00,147000.00,353000.00,0.00,353000.00,'2025-04-20 00:00:00','Cash',0.00,500000.00,0.00,'Pending',NULL,'/Users/niazmdoostyar/Desktop/MERN Test/Easyvate_Car_Selling/backend/uploads/pdf/container_bill_S000003.pdf',1,'2026-04-01 16:05:59','2026-04-01 16:12:25','Container One Key',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,'Buyer',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Left','AFN',500000.00,1.000000,'Ahmad Khan',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sharing_persons`
--

DROP TABLE IF EXISTS `sharing_persons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sharing_persons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicleId` int NOT NULL,
  `personName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `investmentAmount` decimal(15,2) DEFAULT NULL,
  `phoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `customerId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicleId` (`vehicleId`),
  CONSTRAINT `sharing_persons_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sharing_persons`
--

LOCK TABLES `sharing_persons` WRITE;
/*!40000 ALTER TABLE `sharing_persons` DISABLE KEYS */;
INSERT INTO `sharing_persons` VALUES (4,21,'Ahmad Khan',50.00,50000.00,'0700000000',1,'2026-03-29 20:57:35','2026-03-29 20:57:35',0),(6,23,'das',33.33,2002.00,'212122',1,'2026-04-01 12:17:35','2026-04-01 12:17:35',0);
/*!40000 ALTER TABLE `sharing_persons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `showroom_ledger`
--

DROP TABLE IF EXISTS `showroom_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `showroom_ledger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('Income','Expense','Vehicle Purchase','Vehicle Sale','Salary','Currency Exchange','Loan Given','Loan Received','Loan Payment','Commission') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'AFN',
  `amountInPKR` decimal(15,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date` datetime NOT NULL,
  `referenceId` int DEFAULT NULL,
  `referenceType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `personName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `addedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `amountInAFN` decimal(15,2) NOT NULL DEFAULT '0.00',
  `exchangeRateUsed` decimal(15,6) DEFAULT NULL,
  `personId` int DEFAULT NULL COMMENT 'Reference to customer if applicable',
  PRIMARY KEY (`id`),
  KEY `addedBy` (`addedBy`),
  CONSTRAINT `showroom_ledger_ibfk_1` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showroom_ledger`
--

LOCK TABLES `showroom_ledger` WRITE;
/*!40000 ALTER TABLE `showroom_ledger` DISABLE KEYS */;
INSERT INTO `showroom_ledger` VALUES (28,'Vehicle Purchase',2000.00,'USD',140000.00,'Base Purchase for V000001','2026-03-29 20:56:19',21,'Vehicle',NULL,1,'2026-03-29 20:56:19','2026-03-29 20:56:19',0.00,NULL,NULL),(29,'Currency Exchange',1.00,'USD',-70.00,'Exchange: 1 USD → 60 AFN','2026-03-29 20:58:21',6,'CurrencyExchange',NULL,1,'2026-03-29 20:58:21','2026-03-29 20:58:21',0.00,NULL,NULL),(30,'Currency Exchange',60.00,'AFN',60.00,'Exchange: 1 USD → 60 AFN','2026-03-29 20:58:21',6,'CurrencyExchange',NULL,1,'2026-03-29 20:58:21','2026-03-29 20:58:21',0.00,NULL,NULL),(31,'Currency Exchange',1.00,'USD',-70.00,'Exchange: 1 USD → 280 PKR','2026-03-29 21:00:20',7,'CurrencyExchange',NULL,1,'2026-03-29 21:00:20','2026-03-29 21:00:20',0.00,NULL,NULL),(32,'Currency Exchange',280.00,'PKR',70.00,'Exchange: 1 USD → 280 PKR','2026-03-29 21:00:20',7,'CurrencyExchange',NULL,1,'2026-03-29 21:00:20','2026-03-29 21:00:20',0.00,NULL,NULL),(33,'Vehicle Purchase',3000.00,'USD',210000.00,'Base Purchase for V000002','2026-03-29 21:09:10',22,'Vehicle',NULL,1,'2026-03-29 21:09:10','2026-03-29 21:09:10',0.00,NULL,NULL),(34,'Vehicle Purchase',1000.00,'AFN',1000.00,'Transport to Dubai for V000002','2026-03-29 21:09:10',22,'Vehicle',NULL,1,'2026-03-29 21:09:10','2026-03-29 21:09:10',0.00,NULL,NULL),(35,'Vehicle Purchase',1500.00,'AFN',1500.00,'Transport to Dubai for V000003','2026-03-29 21:14:19',23,'Vehicle',NULL,1,'2026-03-29 21:14:20','2026-03-29 21:14:20',0.00,NULL,NULL),(36,'Vehicle Purchase',1000.00,'AFN',1000.00,'Repair for V000003','2026-03-29 21:14:19',23,'Vehicle',NULL,1,'2026-03-29 21:14:20','2026-03-29 21:14:20',0.00,NULL,NULL),(37,'Vehicle Purchase',500.00,'AFN',500.00,'Import to Afghanistan for V000003','2026-03-29 21:14:19',23,'Vehicle',NULL,1,'2026-03-29 21:14:20','2026-03-29 21:14:20',0.00,NULL,NULL),(38,'Vehicle Purchase',4000.00,'PKR',1000.00,'Base Purchase for V000003','2026-03-29 21:14:19',23,'Vehicle',NULL,1,'2026-03-29 21:14:20','2026-03-29 21:14:20',0.00,NULL,NULL),(39,'Vehicle Sale',8000.00,'AFN',8000.00,'Down payment for V000002 — Paid in full','2026-03-29 00:00:00',15,'Sale',NULL,1,'2026-03-29 21:29:18','2026-03-29 21:29:18',0.00,NULL,NULL),(40,'Vehicle Sale',50000.00,'AFN',50000.00,'Down payment for V000001 — 50,000 of 60,000 AFN','2026-03-29 00:00:00',16,'Sale',NULL,1,'2026-03-29 21:43:39','2026-03-29 21:43:39',0.00,NULL,NULL),(41,'Commission',-40000.00,'AFN',-40000.00,'Commission for Ahmad Khan','2026-03-29 00:00:00',16,'CommissionDistribution','Ahmad Khan',1,'2026-03-29 21:43:39','2026-03-29 21:43:39',0.00,NULL,NULL),(42,'Income',1000000.00,'AFN',1000000.00,'','2026-04-01 00:00:00',NULL,NULL,'ahmad',NULL,'2026-04-01 11:16:47','2026-04-01 11:16:47',0.00,NULL,NULL),(43,'Vehicle Sale',10000.00,'AFN',10000.00,'Installment from Zahra Noori for V000001 (FULLY PAID)','2026-04-01 00:00:00',16,'Sale','Zahra Noori',1,'2026-04-01 13:12:15','2026-04-01 13:12:15',0.00,NULL,NULL),(44,'Commission',166650.00,'AFN',NULL,'Commission for das','2025-04-20 00:00:00',18,'CommissionDistribution','das',1,'2026-04-01 16:08:27','2026-04-01 16:08:27',166650.00,NULL,NULL),(45,'Vehicle Purchase',500.00,'USD',NULL,'Base Purchase for V000006','2026-04-01 16:10:55',27,'Vehicle',NULL,1,'2026-04-01 16:10:55','2026-04-01 16:10:55',35000.00,70.000000,NULL),(46,'Vehicle Purchase',1000.00,'USD',NULL,'Base Purchase for V000005','2026-04-01 16:25:32',28,'Vehicle',NULL,1,'2026-04-01 16:25:32','2026-04-01 16:25:32',70000.00,70.000000,NULL),(47,'Vehicle Purchase',100.00,'USD',NULL,'Transport to Dubai for V000005','2026-04-01 16:25:32',28,'Vehicle',NULL,1,'2026-04-01 16:25:32','2026-04-01 16:25:32',7000.00,70.000000,NULL),(48,'Vehicle Purchase',100.00,'USD',NULL,'Import to Afghanistan for V000005','2026-04-01 16:25:32',28,'Vehicle',NULL,1,'2026-04-01 16:25:32','2026-04-01 16:25:32',7000.00,70.000000,NULL),(49,'Vehicle Purchase',100.00,'USD',NULL,'Repair for V000005','2026-04-01 16:25:32',28,'Vehicle',NULL,1,'2026-04-01 16:25:32','2026-04-01 16:25:32',7000.00,70.000000,NULL),(50,'Vehicle Purchase',1000.00,'USD',NULL,'Base Purchase for V000006','2026-04-01 16:25:32',29,'Vehicle',NULL,1,'2026-04-01 16:25:32','2026-04-01 16:25:32',70000.00,70.000000,NULL),(51,'Vehicle Purchase',100.00,'USD',NULL,'Transport to Dubai for V000006','2026-04-01 16:25:32',29,'Vehicle',NULL,1,'2026-04-01 16:25:32','2026-04-01 16:25:32',7000.00,70.000000,NULL),(52,'Vehicle Purchase',100.00,'USD',NULL,'Import to Afghanistan for V000006','2026-04-01 16:25:32',29,'Vehicle',NULL,1,'2026-04-01 16:25:32','2026-04-01 16:25:32',7000.00,70.000000,NULL),(53,'Vehicle Purchase',100.00,'USD',NULL,'Repair for V000006','2026-04-01 16:25:32',29,'Vehicle',NULL,1,'2026-04-01 16:25:32','2026-04-01 16:25:32',7000.00,70.000000,NULL),(54,'Vehicle Purchase',1000.00,'USD',NULL,'Base Purchase for V000007','2026-04-01 16:25:58',30,'Vehicle',NULL,1,'2026-04-01 16:25:58','2026-04-01 16:25:58',70000.00,70.000000,NULL),(55,'Vehicle Purchase',100.00,'USD',NULL,'Transport to Dubai for V000007','2026-04-01 16:25:58',30,'Vehicle',NULL,1,'2026-04-01 16:25:58','2026-04-01 16:25:58',7000.00,70.000000,NULL),(56,'Vehicle Purchase',100.00,'USD',NULL,'Import to Afghanistan for V000007','2026-04-01 16:25:58',30,'Vehicle',NULL,1,'2026-04-01 16:25:58','2026-04-01 16:25:58',7000.00,70.000000,NULL),(57,'Vehicle Purchase',100.00,'USD',NULL,'Repair for V000007','2026-04-01 16:25:58',30,'Vehicle',NULL,1,'2026-04-01 16:25:58','2026-04-01 16:25:58',7000.00,70.000000,NULL);
/*!40000 ALTER TABLE `showroom_ledger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_en`
--

DROP TABLE IF EXISTS `team_en`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_en` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `position` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `facebook` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `x` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Twitter/X profile URL',
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Path to uploaded team member image',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_en`
--

LOCK TABLES `team_en` WRITE;
/*!40000 ALTER TABLE `team_en` DISABLE KEYS */;
INSERT INTO `team_en` VALUES (1,'Ahmad Khan','Owner','Managing All Staff, and processing all the sales and inventory base contracts.','facebook.com','instagram.com','x.com','/uploads/team/team-1774704108232-5279518.jpg','2026-03-28 13:21:48','2026-03-28 13:21:48');
/*!40000 ALTER TABLE `team_en` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_fa`
--

DROP TABLE IF EXISTS `team_fa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_fa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `position` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `facebook` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `x` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Twitter/X profile URL',
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Path to uploaded team member image',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_fa`
--

LOCK TABLES `team_fa` WRITE;
/*!40000 ALTER TABLE `team_fa` DISABLE KEYS */;
INSERT INTO `team_fa` VALUES (1,'احمد خان','رئیس','مدیریت همه کارکنان و پردازش تمام قراردادهای فروش و موجودی.','faceboo.com','instagram.com',NULL,'/uploads/team/team-1774704275352-120081344.jpg','2026-03-28 13:24:35','2026-03-28 13:24:35');
/*!40000 ALTER TABLE `team_fa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_ps`
--

DROP TABLE IF EXISTS `team_ps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_ps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `position` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `facebook` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `x` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Twitter/X profile URL',
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Path to uploaded team member image',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_ps`
--

LOCK TABLES `team_ps` WRITE;
/*!40000 ALTER TABLE `team_ps` DISABLE KEYS */;
INSERT INTO `team_ps` VALUES (1,'احمد خان','رئیس','د ټولو کارکوونکو مدیریت او د ټولو خرڅلاو او ذخیره تړونونو پروسس کول.','facebook.com','instagram.com',NULL,'/uploads/team/team-1774704188646-298973808.jpg','2026-03-28 13:23:08','2026-03-28 13:23:08');
/*!40000 ALTER TABLE `team_ps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonial_en`
--

DROP TABLE IF EXISTS `testimonial_en`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonial_en` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `year` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonial_en`
--

LOCK TABLES `testimonial_en` WRITE;
/*!40000 ALTER TABLE `testimonial_en` DISABLE KEYS */;
INSERT INTO `testimonial_en` VALUES (1,'Ahmad Khan','Mar, 2025',5,'Excellent Service & Trusted Platform','“I had a great experience buying my car from Niazay Khpalwak Car Showroom. The process was smooth, the pricing was transparent, and the staff was very helpful. Highly recommended!”','2026-03-28 16:20:40','2026-03-28 16:20:40'),(2,'Karim Ullah','Feb 2026',5,'High Quality Vehicles','“The quality of vehicles is outstanding. I purchased a container-imported car and it was exactly as described. Very reliable and well-maintained cars.”','2026-03-28 16:21:19','2026-03-28 16:21:19'),(3,'Rahim','Feb, 2026',4,'Professional & Friendly Team','“The team is very professional and cooperative. They guided me through every step of the purchase and made everything easy. I’m very satisfied with their service.”','2026-03-28 16:22:05','2026-03-28 16:22:05'),(4,'Navid Khan','Mar, 2026',4,'Best Place to Buy and Sell Cars','“This showroom is the perfect place for both buyers and sellers. They handled my car sale quickly and fairly. Truly a trustworthy platform.”','2026-03-28 16:22:45','2026-03-28 16:22:45');
/*!40000 ALTER TABLE `testimonial_en` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonial_fa`
--

DROP TABLE IF EXISTS `testimonial_fa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonial_fa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `year` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonial_fa`
--

LOCK TABLES `testimonial_fa` WRITE;
/*!40000 ALTER TABLE `testimonial_fa` DISABLE KEYS */;
INSERT INTO `testimonial_fa` VALUES (1,'احمد خان','مارچ ۲۰۲۵',5,'خدمات عالی و پلتفرم قابل اعتماد','من تجربه بسیار خوبی از خرید موتر از نمایشگاه نیازی خپلواک داشتم. روند کار بسیار آسان بود، قیمت‌ها شفاف بودند و کارمندان بسیار همکاری می‌کردند. کاملاً توصیه می‌کنم!','2026-03-28 16:27:49','2026-03-28 16:27:49'),(2,'کریم الله','فیبروری ۲۰۲۶',5,'موترهای با کیفیت بالا','کیفیت موترها بسیار عالی است. من یک موتر وارداتی کانتینری خریدم که دقیقاً مطابق توضیحات بود. موترها بسیار قابل اعتماد و به‌خوبی نگهداری شده‌اند.','2026-03-28 16:28:29','2026-03-28 16:28:29'),(3,'رحیم','فیبروری ۲۰۲۶',4,'تیم مسلکی و دوستانه','تیم بسیار مسلکی و همکاری‌کننده است. آن‌ها در هر مرحله خرید مرا راهنمایی کردند و همه چیز را آسان ساختند. من از خدمات‌شان بسیار راضی هستم.','2026-03-28 16:29:17','2026-03-28 16:29:17'),(4,'نوید خان','مارچ ۲۰۲۶',4,'بهترین مکان برای خرید و فروش موتر','این نمایشگاه بهترین مکان برای خریداران و فروشندگان است. آن‌ها فروش موتر مرا به‌سرعت و به‌طور منصفانه انجام دادند. واقعاً یک پلتفرم قابل اعتماد است.','2026-03-28 16:29:49','2026-03-28 16:29:49');
/*!40000 ALTER TABLE `testimonial_fa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonial_ps`
--

DROP TABLE IF EXISTS `testimonial_ps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonial_ps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `year` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonial_ps`
--

LOCK TABLES `testimonial_ps` WRITE;
/*!40000 ALTER TABLE `testimonial_ps` DISABLE KEYS */;
INSERT INTO `testimonial_ps` VALUES (1,'احمد خان','مارچ ۲۰۲۵',5,'غوره خدمت او باوري پلاتفورم','ما د نیازي خپلواک موټر نندارتون څخه د موټر اخیستلو کې ډېر ښه تجربه درلوده. پروسه ډېره اسانه وه، بیې شفافې وې، او کارکوونکي ډېر مرسته کوونکي وو. زه یې کلک سپارښتنه کوم!','2026-03-28 16:24:35','2026-03-28 16:24:35'),(2,'کریم الله','فیبوری ۲۰۲۶',5,'لوړ کیفیت لرونکي موټرونه','د موټرو کیفیت بېخي عالي دی. ما یو کانتینري وارد شوی موټر واخیست او بالکل هماغه شان و لکه څنګه چې تشریح شوی و. ډېر باوري او ښه ساتل شوي موټرونه دي.','2026-03-28 16:25:33','2026-03-28 16:25:33'),(3,'رحیم','فیبروری ۲۰۲۶',4,'مسلکي او دوستانه ټیم','ټیم ډېر مسلکي او همکار دی. هغوی ما ته د اخیستلو په هر پړاو کې لارښوونه وکړه او ټول کار یې اسانه کړ. زه د دوی له خدمت څخه ډېر خوښ یم.','2026-03-28 16:26:30','2026-03-28 16:26:30'),(4,'نوید خان','مارچ ۲۰۲۶',4,'د موټرو د پېرلو او پلورلو لپاره غوره ځای','دا نندارتون د پېرودونکو او پلورونکو دواړو لپاره غوره ځای دی. هغوی زما د موټر پلور ډېر ژر او په عادلانه ډول ترسره کړ. رښتیا هم یو باوري پلاتفورم دی.','2026-03-28 16:27:09','2026-03-28 16:27:09');
/*!40000 ALTER TABLE `testimonial_ps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('Super Admin','Owner','Manager','Accountant','Financial','Inventory & Sales','Sales','Viewer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `username_19` (`username`),
  UNIQUE KEY `username_20` (`username`),
  UNIQUE KEY `username_21` (`username`),
  UNIQUE KEY `username_22` (`username`),
  UNIQUE KEY `username_23` (`username`),
  UNIQUE KEY `username_24` (`username`),
  UNIQUE KEY `username_25` (`username`),
  UNIQUE KEY `username_26` (`username`),
  UNIQUE KEY `username_27` (`username`),
  UNIQUE KEY `username_28` (`username`),
  UNIQUE KEY `username_29` (`username`),
  UNIQUE KEY `username_30` (`username`),
  UNIQUE KEY `username_31` (`username`),
  UNIQUE KEY `username_32` (`username`),
  UNIQUE KEY `username_33` (`username`),
  UNIQUE KEY `username_34` (`username`),
  UNIQUE KEY `username_35` (`username`),
  UNIQUE KEY `username_36` (`username`),
  UNIQUE KEY `username_37` (`username`),
  UNIQUE KEY `username_38` (`username`),
  UNIQUE KEY `username_39` (`username`),
  UNIQUE KEY `username_40` (`username`),
  UNIQUE KEY `username_41` (`username`),
  UNIQUE KEY `username_42` (`username`),
  UNIQUE KEY `username_43` (`username`),
  UNIQUE KEY `username_44` (`username`),
  UNIQUE KEY `username_45` (`username`),
  UNIQUE KEY `username_46` (`username`),
  UNIQUE KEY `username_47` (`username`),
  UNIQUE KEY `username_48` (`username`),
  UNIQUE KEY `username_49` (`username`),
  UNIQUE KEY `username_50` (`username`),
  UNIQUE KEY `username_51` (`username`),
  UNIQUE KEY `username_52` (`username`),
  UNIQUE KEY `username_53` (`username`),
  UNIQUE KEY `username_54` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$aoLgQNnJzNTtf.LAOwId4.5TAv3cdl0wBG7khhROarBE7H9paHm2e','System Administrator','admin@easyvate.com',NULL,'Super Admin',1,'2026-02-08 09:32:15','2026-02-08 09:32:15'),(2,'jan','$2b$10$cF6L9InT30G5Q4gO9SU2.egHCHYr27nSuyLYD1dj13Ytl5MEJdnPO','jan','niaz.doostyar786@gmail.com','+93700330985','Viewer',1,'2026-03-31 19:12:23','2026-03-31 19:13:26'),(3,'temp.viewer','$2b$10$ieXYps90wlvk2WDmdzctC.FHV1k2utmVI.lWuEK8fxgMCVKxOsEgu','Temp Viewer','temp.viewer@example.com',NULL,'Viewer',1,'2026-04-01 16:28:33','2026-04-01 16:28:33');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_costs`
--

DROP TABLE IF EXISTS `vehicle_costs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_costs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicleId` int NOT NULL,
  `stage` enum('Base Purchase','Transport to Dubai','Import to Afghanistan','Repair','Additional') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amountInPKR` decimal(15,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date` datetime DEFAULT NULL,
  `addedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `amountInAFN` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Amount in AFN',
  `exchangeRateUsed` decimal(15,6) DEFAULT NULL COMMENT 'Rate used for conversion',
  PRIMARY KEY (`id`),
  KEY `vehicleId` (`vehicleId`),
  KEY `addedBy` (`addedBy`),
  CONSTRAINT `vehicle_costs_ibfk_57` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vehicle_costs_ibfk_58` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_costs`
--

LOCK TABLES `vehicle_costs` WRITE;
/*!40000 ALTER TABLE `vehicle_costs` DISABLE KEYS */;
INSERT INTO `vehicle_costs` VALUES (13,21,'Base Purchase',2000.00,'USD',140000.00,NULL,'2026-03-29 20:56:19',1,'2026-03-29 20:56:19','2026-03-29 20:56:19',0.00,NULL),(14,22,'Base Purchase',3000.00,'USD',210000.00,NULL,'2026-03-29 21:09:10',1,'2026-03-29 21:09:10','2026-03-29 21:09:10',0.00,NULL),(15,22,'Transport to Dubai',1000.00,'AFN',1000.00,NULL,'2026-03-29 21:09:10',1,'2026-03-29 21:09:10','2026-03-29 21:09:10',0.00,NULL),(16,23,'Base Purchase',4000.00,'PKR',1000.00,NULL,'2026-03-29 21:14:19',1,'2026-03-29 21:14:19','2026-03-29 21:14:19',0.00,NULL),(17,23,'Transport to Dubai',1500.00,'AFN',1500.00,NULL,'2026-03-29 21:14:19',1,'2026-03-29 21:14:19','2026-03-29 21:14:19',0.00,NULL),(18,23,'Repair',1000.00,'AFN',1000.00,NULL,'2026-03-29 21:14:19',1,'2026-03-29 21:14:19','2026-03-29 21:14:19',0.00,NULL),(19,23,'Import to Afghanistan',500.00,'AFN',500.00,NULL,'2026-03-29 21:14:19',1,'2026-03-29 21:14:19','2026-03-29 21:14:19',0.00,NULL);
/*!40000 ALTER TABLE `vehicle_costs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_dropdown_options`
--

DROP TABLE IF EXISTS `vehicle_dropdown_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_dropdown_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fieldName` enum('manufacturer','category','engineType','transmission') NOT NULL COMMENT 'Which dropdown field this option belongs to',
  `value` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `addedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicle_dropdown_options_field_name_value` (`fieldName`,`value`),
  KEY `addedBy` (`addedBy`),
  CONSTRAINT `vehicle_dropdown_options_ibfk_1` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_dropdown_options`
--

LOCK TABLES `vehicle_dropdown_options` WRITE;
/*!40000 ALTER TABLE `vehicle_dropdown_options` DISABLE KEYS */;
INSERT INTO `vehicle_dropdown_options` VALUES (1,'category','TestCatX',0,1,'2026-04-01 16:23:34','2026-04-01 16:23:48');
/*!40000 ALTER TABLE `vehicle_dropdown_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_images`
--

DROP TABLE IF EXISTS `vehicle_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicleId` int NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Original filename',
  `path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Relative URL to access the image (e.g., /uploads/vehicle-images/xyz.jpg)',
  `size` int NOT NULL COMMENT 'File size in bytes',
  `order` int DEFAULT '0' COMMENT 'Display order (ascending)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicleId` (`vehicleId`),
  CONSTRAINT `vehicle_images_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_images`
--

LOCK TABLES `vehicle_images` WRITE;
/*!40000 ALTER TABLE `vehicle_images` DISABLE KEYS */;
INSERT INTO `vehicle_images` VALUES (1,21,'cd-1.jpg','/uploads/vehicle-images/vehicle-21-1774817780157-539878088.jpg',210146,0,'2026-03-29 20:56:20','2026-03-29 20:56:20'),(2,21,'cd-4.jpg','/uploads/vehicle-images/vehicle-21-1774817780203-564798303.jpg',262963,1,'2026-03-29 20:56:20','2026-03-29 20:56:20'),(3,21,'cd-6.jpg','/uploads/vehicle-images/vehicle-21-1774817780206-681780422.jpg',167764,2,'2026-03-29 20:56:20','2026-03-29 20:56:20'),(4,21,'cd-3.jpg','/uploads/vehicle-images/vehicle-21-1774817780208-403683942.jpg',264766,3,'2026-03-29 20:56:20','2026-03-29 20:56:20'),(5,21,'cd-2.jpg','/uploads/vehicle-images/vehicle-21-1774817780211-282052816.jpg',180212,4,'2026-03-29 20:56:20','2026-03-29 20:56:20'),(6,22,'cd-2.jpg','/uploads/vehicle-images/vehicle-22-1774818551433-303118752.jpg',180212,0,'2026-03-29 21:09:11','2026-03-29 21:09:11'),(7,22,'cd-5.jpg','/uploads/vehicle-images/vehicle-22-1774818645565-524725141.jpg',341454,0,'2026-03-29 21:10:45','2026-03-29 21:10:45'),(8,22,'cd-3.jpg','/uploads/vehicle-images/vehicle-22-1774818645573-193925497.jpg',264766,1,'2026-03-29 21:10:45','2026-03-29 21:10:45'),(9,22,'cd-6.jpg','/uploads/vehicle-images/vehicle-22-1774818645577-667184843.jpg',167764,2,'2026-03-29 21:10:45','2026-03-29 21:10:45'),(10,22,'cd-1.jpg','/uploads/vehicle-images/vehicle-22-1774818645855-792127290.jpg',210146,3,'2026-03-29 21:10:45','2026-03-29 21:10:45'),(12,23,'cd-2.jpg','/uploads/vehicle-images/vehicle-23-1774818860070-503575328.jpg',180212,1,'2026-03-29 21:14:20','2026-03-29 21:14:20'),(13,23,'cd-3.jpg','/uploads/vehicle-images/vehicle-23-1774818860090-362212129.jpg',264766,2,'2026-03-29 21:14:20','2026-03-29 21:14:20'),(14,23,'cd-4.jpg','/uploads/vehicle-images/vehicle-23-1774818860092-700038485.jpg',262963,3,'2026-03-29 21:14:20','2026-03-29 21:14:20'),(15,23,'cd-5.jpg','/uploads/vehicle-images/vehicle-23-1774818860094-532882143.jpg',341454,4,'2026-03-29 21:14:20','2026-03-29 21:14:20'),(16,23,'car-1.jpg','/uploads/vehicle-images/vehicle-23-1775045855577-522753526.jpg',38911,0,'2026-04-01 12:17:35','2026-04-01 12:17:35');
/*!40000 ALTER TABLE `vehicle_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicleId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chassisNumber` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `engineNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `engineType` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fuelType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transmission` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mileage` int DEFAULT NULL,
  `status` enum('Available','Reserved','Sold','Coming','Under Repair') COLLATE utf8mb4_unicode_ci DEFAULT 'Available',
  `basePurchasePrice` decimal(15,2) DEFAULT NULL,
  `baseCurrency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'AFN',
  `transportCostToDubai` decimal(15,2) DEFAULT '0.00',
  `importCostToAfghanistan` decimal(15,2) DEFAULT '0.00',
  `repairCost` decimal(15,2) DEFAULT '0.00',
  `totalCostPKR` decimal(15,2) DEFAULT NULL,
  `sellingPrice` decimal(15,2) DEFAULT NULL,
  `isLocked` tinyint(1) DEFAULT '0',
  `pdfPath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `plateNo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicleLicense` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `steering` enum('Left','Right') COLLATE utf8mb4_unicode_ci DEFAULT 'Left',
  `monolithicCut` enum('Monolithic','Cut') COLLATE utf8mb4_unicode_ci DEFAULT 'Monolithic',
  `totalCostAFN` decimal(15,2) DEFAULT NULL COMMENT 'Total cost in Afghani',
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicleId` (`vehicleId`),
  UNIQUE KEY `chassisNumber` (`chassisNumber`),
  UNIQUE KEY `vehicleId_2` (`vehicleId`),
  UNIQUE KEY `chassisNumber_2` (`chassisNumber`),
  UNIQUE KEY `vehicleId_3` (`vehicleId`),
  UNIQUE KEY `chassisNumber_3` (`chassisNumber`),
  UNIQUE KEY `vehicleId_4` (`vehicleId`),
  UNIQUE KEY `chassisNumber_4` (`chassisNumber`),
  UNIQUE KEY `vehicleId_5` (`vehicleId`),
  UNIQUE KEY `chassisNumber_5` (`chassisNumber`),
  UNIQUE KEY `vehicleId_6` (`vehicleId`),
  UNIQUE KEY `chassisNumber_6` (`chassisNumber`),
  UNIQUE KEY `vehicleId_7` (`vehicleId`),
  UNIQUE KEY `chassisNumber_7` (`chassisNumber`),
  UNIQUE KEY `vehicleId_8` (`vehicleId`),
  UNIQUE KEY `chassisNumber_8` (`chassisNumber`),
  UNIQUE KEY `vehicleId_9` (`vehicleId`),
  UNIQUE KEY `chassisNumber_9` (`chassisNumber`),
  UNIQUE KEY `vehicleId_10` (`vehicleId`),
  UNIQUE KEY `chassisNumber_10` (`chassisNumber`),
  UNIQUE KEY `vehicleId_11` (`vehicleId`),
  UNIQUE KEY `chassisNumber_11` (`chassisNumber`),
  UNIQUE KEY `vehicleId_12` (`vehicleId`),
  UNIQUE KEY `chassisNumber_12` (`chassisNumber`),
  UNIQUE KEY `vehicleId_13` (`vehicleId`),
  UNIQUE KEY `chassisNumber_13` (`chassisNumber`),
  UNIQUE KEY `vehicleId_14` (`vehicleId`),
  UNIQUE KEY `chassisNumber_14` (`chassisNumber`),
  UNIQUE KEY `vehicleId_15` (`vehicleId`),
  UNIQUE KEY `chassisNumber_15` (`chassisNumber`),
  UNIQUE KEY `vehicleId_16` (`vehicleId`),
  UNIQUE KEY `chassisNumber_16` (`chassisNumber`),
  UNIQUE KEY `vehicleId_17` (`vehicleId`),
  UNIQUE KEY `chassisNumber_17` (`chassisNumber`),
  UNIQUE KEY `vehicleId_18` (`vehicleId`),
  UNIQUE KEY `chassisNumber_18` (`chassisNumber`),
  UNIQUE KEY `vehicleId_19` (`vehicleId`),
  UNIQUE KEY `chassisNumber_19` (`chassisNumber`),
  UNIQUE KEY `vehicleId_20` (`vehicleId`),
  UNIQUE KEY `chassisNumber_20` (`chassisNumber`),
  UNIQUE KEY `vehicleId_21` (`vehicleId`),
  UNIQUE KEY `chassisNumber_21` (`chassisNumber`),
  UNIQUE KEY `vehicleId_22` (`vehicleId`),
  UNIQUE KEY `chassisNumber_22` (`chassisNumber`),
  UNIQUE KEY `vehicleId_23` (`vehicleId`),
  UNIQUE KEY `chassisNumber_23` (`chassisNumber`),
  UNIQUE KEY `vehicleId_24` (`vehicleId`),
  UNIQUE KEY `chassisNumber_24` (`chassisNumber`),
  UNIQUE KEY `vehicleId_25` (`vehicleId`),
  UNIQUE KEY `chassisNumber_25` (`chassisNumber`),
  UNIQUE KEY `vehicleId_26` (`vehicleId`),
  UNIQUE KEY `chassisNumber_26` (`chassisNumber`),
  UNIQUE KEY `vehicleId_27` (`vehicleId`),
  UNIQUE KEY `chassisNumber_27` (`chassisNumber`),
  UNIQUE KEY `vehicleId_28` (`vehicleId`),
  UNIQUE KEY `chassisNumber_28` (`chassisNumber`),
  UNIQUE KEY `vehicleId_29` (`vehicleId`),
  UNIQUE KEY `chassisNumber_29` (`chassisNumber`),
  UNIQUE KEY `engineNumber` (`engineNumber`),
  UNIQUE KEY `engineNumber_2` (`engineNumber`),
  UNIQUE KEY `engineNumber_3` (`engineNumber`),
  UNIQUE KEY `engineNumber_4` (`engineNumber`),
  UNIQUE KEY `engineNumber_5` (`engineNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (21,'V000001','Sedan','Toyota','Corolla',2020,'white','GH2DK56','1NZ33GH','Turbo','Petrol','Automatic',20000,'Sold',2000.00,'USD',1000.00,500.00,500.00,140000.00,60000.00,1,'/Users/niazmdoostyar/Desktop/MERN Test/Easyvate_Car_Selling/backend/uploads/pdf/vehicle_V000001.pdf','2026-03-29 20:56:19','2026-04-01 16:17:52','KDR-33','dkfj3432','Left','Monolithic',NULL),(22,'V000002','Sedan','Honda','Honda Civic',2024,'Black','KHA12KD','DFJ2L44','V4','Hybrid','Automatic',30000,'Sold',3000.00,'USD',1000.00,500.00,0.00,211000.00,8000.00,1,'D:\\Projects\\Laravel\\Easyvate_Car_Selling\\backend\\uploads\\pdf\\vehicle_V000002.pdf','2026-03-29 21:09:10','2026-03-29 21:29:18','','','Left','Monolithic',NULL),(23,'V000003','SUV','Toyota','Camry',2026,'Red','JFKFALSSD','DFJDS324','V8','Hybrid','Automatic',10000,'Available',4000.00,'USD',1500.00,500.00,1000.00,4000.00,10000.00,0,'/Users/niazmdoostyar/Desktop/MERN Test/Easyvate_Car_Selling/backend/uploads/pdf/vehicle_V000003.pdf','2026-03-29 21:14:19','2026-04-01 16:08:34','KBL-2342','DFJAFK34','Left','Monolithic',NULL),(24,'V000004','SUV','Toyota','d2',2000,'white','i998','98','Inline-4','Petrol','Automatic',10,'Available',1000.00,'USD',500.00,500.00,100.00,NULL,2000.00,0,NULL,'2026-04-01 15:45:47','2026-04-01 16:05:59','','','Left','Monolithic',147000.00);
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'easyvate_cars'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-01 21:04:54
