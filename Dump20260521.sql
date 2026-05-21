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
-- Table structure for table `administratori`
--

DROP TABLE IF EXISTS `administratori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administratori` (
  `Korisnik_ID` int NOT NULL,
  PRIMARY KEY (`Korisnik_ID`),
  CONSTRAINT `administratori_ibfk_1` FOREIGN KEY (`Korisnik_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grad`
--

DROP TABLE IF EXISTS `grad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grad` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Ime` varchar(100) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Ime_UNIQUE` (`Ime`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `Datum_Registracije` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Profilna` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `obicni`
--

DROP TABLE IF EXISTS `obicni`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `obicni` (
  `Korisnik_ID` int NOT NULL,
  PRIMARY KEY (`Korisnik_ID`),
  CONSTRAINT `obicni_ibfk_1` FOREIGN KEY (`Korisnik_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `objava`
--

DROP TABLE IF EXISTS `objava`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objava` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Naslov` varchar(255) NOT NULL,
  `Opis` text,
  `Datum` date NOT NULL,
  `Vreme` time NOT NULL,
  `Upvote` int DEFAULT '0',
  `Downvote` int DEFAULT '0',
  `Status` enum('na_cekanju','odobrena','odbijena','arhivirana') DEFAULT 'na_cekanju',
  `Grad` varchar(100) DEFAULT NULL,
  `Organizator_ID` int DEFAULT NULL,
  `Administrator_ID` int DEFAULT NULL,
  `Tip_dogadjaja` varchar(45) DEFAULT NULL,
  `slika_1` varchar(255) DEFAULT NULL,
  `slika_2` varchar(255) DEFAULT NULL,
  `slika_3` varchar(255) DEFAULT NULL,
  `slika_4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `Organizator_ID` (`Organizator_ID`),
  KEY `Administrator_ID` (`Administrator_ID`),
  KEY `objava_ibfk_4_idx` (`Tip_dogadjaja`),
  KEY `obajva_ibfk_4_idx` (`Grad`),
  KEY `objava_grad_idx` (`Grad`),
  CONSTRAINT `objava_grad_fk` FOREIGN KEY (`Grad`) REFERENCES `grad` (`Ime`),
  CONSTRAINT `objava_ibfk_2` FOREIGN KEY (`Organizator_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `objava_ibfk_3` FOREIGN KEY (`Administrator_ID`) REFERENCES `korisnik` (`ID`) ON DELETE SET NULL,
  CONSTRAINT `objava_ibfk_4` FOREIGN KEY (`Tip_dogadjaja`) REFERENCES `tip` (`Naziv`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `organizatori`
--

DROP TABLE IF EXISTS `organizatori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizatori` (
  `Korisnik_ID` int NOT NULL,
  PRIMARY KEY (`Korisnik_ID`),
  CONSTRAINT `organizatori_ibfk_1` FOREIGN KEY (`Korisnik_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `podji_sa_mnom_prijava`
--

DROP TABLE IF EXISTS `podji_sa_mnom_prijava`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `podji_sa_mnom_prijava` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Tekst` text,
  `Status` enum('otvoren','popunjen','otkazan') DEFAULT 'otvoren',
  `Korisnik_ID` int NOT NULL,
  `Objava_ID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `Korisnik_ID` (`Korisnik_ID`),
  KEY `Objava_ID` (`Objava_ID`),
  CONSTRAINT `podji_sa_mnom_prijava_ibfk_1` FOREIGN KEY (`Korisnik_ID`) REFERENCES `korisnik` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `podji_sa_mnom_prijava_ibfk_2` FOREIGN KEY (`Objava_ID`) REFERENCES `objava` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tip`
--

DROP TABLE IF EXISTS `tip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tip` (
  `ID` int NOT NULL,
  `Naziv` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Naziv_UNIQUE` (`Naziv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'tvojgrad'
--

--
-- Dumping routines for database 'tvojgrad'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-21 13:01:38
