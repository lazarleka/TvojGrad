-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: tvojgrad
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `downvote`
--

DROP TABLE IF EXISTS `downvote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `downvote` (
  `ID` int NOT NULL,
  `ID_Dogadjaja` int DEFAULT NULL,
  `ID_Korisnika` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk1_idx` (`ID_Dogadjaja`),
  KEY `fk2_idx` (`ID_Korisnika`),
  CONSTRAINT `fk11` FOREIGN KEY (`ID_Dogadjaja`) REFERENCES `objava` (`ID`),
  CONSTRAINT `fk22` FOREIGN KEY (`ID_Korisnika`) REFERENCES `korisnik` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `downvote`
--

LOCK TABLES `downvote` WRITE;
/*!40000 ALTER TABLE `downvote` DISABLE KEYS */;
INSERT INTO `downvote` VALUES (2,7,1),(5,5,2),(6,4,3),(9,6,2),(10,8,2),(11,9,2),(12,11,2),(13,3,2),(17,11,1),(22,4,1),(23,7,6);
/*!40000 ALTER TABLE `downvote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grad`
--

DROP TABLE IF EXISTS `grad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grad` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Ime` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Ime_UNIQUE` (`Ime`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grad`
--

LOCK TABLES `grad` WRITE;
/*!40000 ALTER TABLE `grad` DISABLE KEYS */;
INSERT INTO `grad` VALUES (1,'Bar'),(3,'Niksic'),(2,'Podgorica');
/*!40000 ALTER TABLE `grad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `korisnik`
--

DROP TABLE IF EXISTS `korisnik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `korisnik` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Ime` varchar(50) NOT NULL,
  `Prezime` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Tip` enum('obicni','administrator','organizator') NOT NULL DEFAULT 'obicni',
  `Lozinka` varchar(255) NOT NULL,
  `Profilna` text,
  `Status` enum('aktivan','na_cekanju_organizator','odbijen_organizator') NOT NULL DEFAULT 'aktivan',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `korisnik`
--

LOCK TABLES `korisnik` WRITE;
/*!40000 ALTER TABLE `korisnik` DISABLE KEYS */;
INSERT INTO `korisnik` VALUES (1,'Lazar','k','leka','obicni','leka',NULL,'aktivan'),(2,'Nikola','v','veso','administrator','veso',NULL,'aktivan'),(3,'Gule','g','gule','organizator','gule','/uploads/profili/korisnik-3-1780066071060.jpeg','aktivan'),(4,'Lazar','','llekic31@gmail.com','obicni','lazar','','aktivan'),(5,'Lazar','Lekic','a','obicni','a','','aktivan'),(6,'Sabo','','sabo','obicni','sabo','','aktivan'),(7,'Petar','','petar.milic03@gmail.com','obicni','676767','','aktivan'),(8,'ljuma','','ljuma','organizator','ljuma','','aktivan'),(9,'vitapero','','vitapero','organizator','vitapero','','aktivan');
/*!40000 ALTER TABLE `korisnik` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `objava`
--

DROP TABLE IF EXISTS `objava`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objava` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Naslov` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Opis` text COLLATE utf8mb4_unicode_ci,
  `Datum` date NOT NULL,
  `Vreme` time NOT NULL,
  `Upvote` int DEFAULT '0',
  `Downvote` int DEFAULT '0',
  `Status` enum('na_cekanju','odobrena','odbijena','arhivirana','promovisana','na_cekanju_promovisana') COLLATE utf8mb4_unicode_ci DEFAULT 'na_cekanju',
  `Grad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Organizator_ID` int DEFAULT NULL,
  `Administrator_ID` int DEFAULT NULL,
  `Tip_dogadjaja` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `slika_1` text COLLATE utf8mb4_unicode_ci,
  `Emoji` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Cijena` double DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `Organizator_ID` (`Organizator_ID`),
  KEY `Administrator_ID` (`Administrator_ID`),
  KEY `objava_ibfk_4_idx` (`Tip_dogadjaja`),
  KEY `obajva_ibfk_4_idx` (`Grad`),
  KEY `objava_grad_idx` (`Grad`),
  CONSTRAINT `objava_grad_fk` FOREIGN KEY (`Grad`) REFERENCES `grad` (`Ime`),
  CONSTRAINT `objava_ibfk_2` FOREIGN KEY (`Organizator_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `objava_ibfk_3` FOREIGN KEY (`Administrator_ID`) REFERENCES `korisnik` (`ID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objava`
--

LOCK TABLES `objava` WRITE;
/*!40000 ALTER TABLE `objava` DISABLE KEYS */;
INSERT INTO `objava` VALUES (2,'Koncert u parku','Ljetnji koncert','2026-06-15','20:00:00',4,0,'promovisana','Podgorica',3,2,'Koncert',NULL,NULL,2),(3,'Jazz večer u Tivtu','Opustite se uz živi jazz program na otvorenom. Nastupaju lokalni i gostujući muzičari u čarobnom ambijentu marine.','2026-05-25','20:00:00',3,1,'odobrena','Tivat',1,2,'Muzika',NULL,'?',2.5),(4,'Koncert u parku','Ljetnji koncert','2026-06-15','20:00:00',1,2,'odobrena','Podgorica',3,2,'Koncert',NULL,'?',2),(5,'Maraton zdrave hrane','Pridružite se trčanju za zdravlje i upoznajte fitnes zajednicu Podgorice.','2026-05-28','09:00:00',2,1,'odobrena','Podgorica',4,2,'Sport',NULL,'?',4),(6,'Izložba savremene umjetnosti','Grupna izložba mladih crnogorskih umjetnika. Djela koja istražuju identitet, prirodu i urbani prostor.','2026-05-30','18:00:00',2,1,'odobrena','Podgorica',5,2,'Kultura',NULL,'?',5),(7,'Tech Meetup Podgorica','Predavanja o AI, startap ekosistemu i karijerama u tehnologiji. Networking sa programerima i preduzetnicima.','2026-06-01','17:30:00',2,2,'odobrena','Podgorica',6,2,'Edukacija',NULL,'?',6),(8,'Stand-up komedija veče','Smijte se do suza uz nastupe vodećih stand-up komičara regiona.','2026-06-03','21:00:00',2,0,'odobrena','Bar',7,2,'Zabava',NULL,'?',8),(9,'Književna večer','Čitanje ulomaka iz novih romana crnogorskih autora uz razgovor i potpisivanje knjiga.','2026-06-05','19:00:00',3,1,'odobrena','Budva',8,2,'Kultura',NULL,'?',213),(10,'Večer flamenka','Strastveni plesači i gitaristi iz Španije donose autentični flamenco na pozornicu Budve.','2026-06-08','20:30:00',22,1,'na_cekanju','Budva',9,2,'Muzika',NULL,'?',31),(11,'Startup vikend','48 sati intenzivnog rada na startup idejama uz mentorstvo iskusnih preduzetnika.','2026-06-10','10:00:00',0,2,'odobrena','Podgorica',6,2,'Edukacija',NULL,'?',312);
/*!40000 ALTER TABLE `objava` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `omiljeni_dogadjaji`
--

DROP TABLE IF EXISTS `omiljeni_dogadjaji`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `omiljeni_dogadjaji` (
  `Korisnik_ID` int NOT NULL,
  `Objava_ID` int NOT NULL,
  PRIMARY KEY (`Korisnik_ID`,`Objava_ID`),
  KEY `Objava_ID` (`Objava_ID`),
  CONSTRAINT `omiljeni_dogadjaji_ibfk_1` FOREIGN KEY (`Korisnik_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `omiljeni_dogadjaji_ibfk_2` FOREIGN KEY (`Objava_ID`) REFERENCES `objava` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `omiljeni_dogadjaji`
--

LOCK TABLES `omiljeni_dogadjaji` WRITE;
/*!40000 ALTER TABLE `omiljeni_dogadjaji` DISABLE KEYS */;
INSERT INTO `omiljeni_dogadjaji` VALUES (1,2),(2,2),(3,2),(6,6),(2,7),(3,11);
/*!40000 ALTER TABLE `omiljeni_dogadjaji` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `podji_sa_mnom_cet`
--

DROP TABLE IF EXISTS `podji_sa_mnom_cet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `podji_sa_mnom_cet` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Prijava_ID` int NOT NULL,
  `Posiljalac_ID` int NOT NULL,
  `Primalac_ID` int NOT NULL,
  `Rejting_!` double DEFAULT NULL,
  `Rejting_2` double DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `Prijava_ID` (`Prijava_ID`),
  KEY `Posiljalac_ID` (`Posiljalac_ID`),
  KEY `Primalac_ID` (`Primalac_ID`),
  CONSTRAINT `podji_sa_mnom_cet_ibfk_1` FOREIGN KEY (`Prijava_ID`) REFERENCES `podji_sa_mnom_prijava` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `podji_sa_mnom_cet_ibfk_2` FOREIGN KEY (`Posiljalac_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `podji_sa_mnom_cet_ibfk_3` FOREIGN KEY (`Primalac_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `podji_sa_mnom_cet`
--

LOCK TABLES `podji_sa_mnom_cet` WRITE;
/*!40000 ALTER TABLE `podji_sa_mnom_cet` DISABLE KEYS */;
INSERT INTO `podji_sa_mnom_cet` VALUES (1,1,2,1,NULL,NULL),(2,1,3,1,NULL,NULL),(3,7,1,3,NULL,NULL),(4,3,1,3,NULL,NULL),(5,7,2,3,NULL,NULL),(6,3,2,3,NULL,NULL),(7,1,6,1,NULL,NULL),(8,1,7,1,NULL,NULL),(9,14,9,2,NULL,NULL);
/*!40000 ALTER TABLE `podji_sa_mnom_cet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `podji_sa_mnom_prijava`
--

DROP TABLE IF EXISTS `podji_sa_mnom_prijava`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `podji_sa_mnom_prijava` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Tekst` text,
  `Status` enum('Otvoren','Zatvoren','Otkazan') DEFAULT 'Otvoren',
  `Korisnik_ID` int NOT NULL,
  `Objava_ID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `Korisnik_ID` (`Korisnik_ID`),
  KEY `Objava_ID` (`Objava_ID`),
  CONSTRAINT `podji_sa_mnom_prijava_ibfk_1` FOREIGN KEY (`Korisnik_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `podji_sa_mnom_prijava_ibfk_2` FOREIGN KEY (`Objava_ID`) REFERENCES `objava` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `podji_sa_mnom_prijava`
--

LOCK TABLES `podji_sa_mnom_prijava` WRITE;
/*!40000 ALTER TABLE `podji_sa_mnom_prijava` DISABLE KEYS */;
INSERT INTO `podji_sa_mnom_prijava` VALUES (1,'POdjite sa mnom ljudi','Otvoren',1,2),(2,'Idemo','Otvoren',1,3),(3,'Ja setam','Otvoren',3,5),(4,'a','Otvoren',3,4),(5,'a','Otvoren',3,7),(6,'a','Otvoren',3,8),(7,'aaaaa','Otvoren',3,3),(8,'AaAAAAAA','Otvoren',3,11),(9,'AAAaAAAAAAAAAAAA','Otvoren',1,11),(10,'LEKAS','Otvoren',1,4),(11,'aaa','Otvoren',1,9),(12,'Dodaj me','Otvoren',6,5),(13,'IDemo nis','Otvoren',3,6),(14,'Imam dvije karte','Otvoren',2,3);
/*!40000 ALTER TABLE `podji_sa_mnom_prijava` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `podji_sa_mnom_zahtev`
--

DROP TABLE IF EXISTS `podji_sa_mnom_zahtev`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `podji_sa_mnom_zahtev` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `status` varchar(45) DEFAULT NULL,
  `PosloZahtev` int DEFAULT NULL,
  `PrimioZahtev` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `Primalac_idx` (`PrimioZahtev`),
  KEY `Posiljalac` (`PosloZahtev`),
  CONSTRAINT `Posiljalac` FOREIGN KEY (`PosloZahtev`) REFERENCES `korisnik` (`ID`),
  CONSTRAINT `Primalac` FOREIGN KEY (`PrimioZahtev`) REFERENCES `korisnik` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `podji_sa_mnom_zahtev`
--

LOCK TABLES `podji_sa_mnom_zahtev` WRITE;
/*!40000 ALTER TABLE `podji_sa_mnom_zahtev` DISABLE KEYS */;
INSERT INTO `podji_sa_mnom_zahtev` VALUES (1,'prihvacen',1,2),(2,'prihvacen',2,1),(3,'prihvacen',3,1),(4,'prihvacen',3,1),(5,'prihvacen',1,3),(6,'prihvacen',2,3),(7,'prihvacen',6,1),(8,'prihvacen',7,1),(9,'na cekanju',6,3),(10,'prihvacen',9,2);
/*!40000 ALTER TABLE `podji_sa_mnom_zahtev` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poruka_ceta`
--

DROP TABLE IF EXISTS `poruka_ceta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poruka_ceta` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Cet_ID` int NOT NULL,
  `Posiljalac_ID` int NOT NULL,
  `Tekst` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Vrijeme` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `Cet_ID` (`Cet_ID`),
  KEY `Posiljalac_ID` (`Posiljalac_ID`),
  CONSTRAINT `poruka_ceta_ibfk_1` FOREIGN KEY (`Cet_ID`) REFERENCES `podji_sa_mnom_cet` (`ID`),
  CONSTRAINT `poruka_ceta_ibfk_2` FOREIGN KEY (`Posiljalac_ID`) REFERENCES `korisnik` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poruka_ceta`
--

LOCK TABLES `poruka_ceta` WRITE;
/*!40000 ALTER TABLE `poruka_ceta` DISABLE KEYS */;
INSERT INTO `poruka_ceta` VALUES (1,2,1,'Dje si gule magijo','2026-05-27 14:41:52'),(2,2,3,'idemooo','2026-05-27 14:42:42'),(3,2,3,'dje si','2026-05-27 14:45:18'),(4,1,2,'a','2026-05-27 14:47:11'),(5,1,1,'dje si','2026-05-27 14:50:42'),(6,2,3,'Srbadijooo barska','2026-05-27 14:58:13'),(7,4,3,'djes ba','2026-05-27 22:02:15'),(8,4,3,'evo ti','2026-05-27 22:02:46'),(9,4,1,'sta cinis','2026-05-27 22:03:51'),(10,6,3,'MRs','2026-05-27 22:07:43'),(11,6,2,'IDemo','2026-05-27 22:08:01'),(12,6,3,'incae','2026-05-27 22:08:06'),(13,6,2,'evo','2026-05-27 22:08:09'),(14,7,1,'Radi','2026-05-27 22:26:35'),(15,7,6,'Brao','2026-05-27 22:26:45'),(16,7,1,'r','2026-05-27 22:26:47'),(17,8,1,'ALOOOOOO','2026-05-28 11:45:07'),(18,4,3,'a','2026-05-29 15:02:07'),(19,9,2,'DJE SI GADE','2026-05-29 17:27:39');
/*!40000 ALTER TABLE `poruka_ceta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tip`
--

DROP TABLE IF EXISTS `tip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tip` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Naziv` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Naziv_UNIQUE` (`Naziv`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tip`
--

LOCK TABLES `tip` WRITE;
/*!40000 ALTER TABLE `tip` DISABLE KEYS */;
INSERT INTO `tip` VALUES (7,'Edukacija'),(2,'Festival'),(6,'Humanitarna akcija'),(4,'Izlozba'),(1,'Koncert'),(10,'Ostalo'),(5,'Pozoriste'),(9,'Proslava'),(8,'Sajam'),(3,'Sportski dogadjaj');
/*!40000 ALTER TABLE `tip` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tip_korisnika`
--

DROP TABLE IF EXISTS `tip_korisnika`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tip_korisnika` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `naziv` varchar(45) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tip_korisnika`
--

LOCK TABLES `tip_korisnika` WRITE;
/*!40000 ALTER TABLE `tip_korisnika` DISABLE KEYS */;
INSERT INTO `tip_korisnika` VALUES (1,'Administrator'),(2,'Organizator'),(3,'Korisnik'),(4,'Administrator'),(5,'Organizator'),(6,'Korisnik');
/*!40000 ALTER TABLE `tip_korisnika` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `upvote`
--

DROP TABLE IF EXISTS `upvote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `upvote` (
  `ID` int NOT NULL,
  `ID_Dogadjaja` int DEFAULT NULL,
  `ID_Korisnika` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk1_idx` (`ID_Dogadjaja`),
  KEY `fk2_idx` (`ID_Korisnika`),
  CONSTRAINT `fk1` FOREIGN KEY (`ID_Dogadjaja`) REFERENCES `objava` (`ID`),
  CONSTRAINT `fk2` FOREIGN KEY (`ID_Korisnika`) REFERENCES `korisnik` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `upvote`
--

LOCK TABLES `upvote` WRITE;
/*!40000 ALTER TABLE `upvote` DISABLE KEYS */;
INSERT INTO `upvote` VALUES (3,9,1),(7,4,2),(9,7,2),(17,7,3),(18,11,3),(19,9,3),(20,8,3),(21,5,3),(22,6,3),(27,3,3),(28,2,3),(29,2,2),(32,8,1),(34,2,1),(35,3,1),(36,5,1),(37,3,6),(38,6,1),(39,2,6),(40,9,6);
/*!40000 ALTER TABLE `upvote` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-29 21:35:31
