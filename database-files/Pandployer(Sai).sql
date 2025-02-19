-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (x86_64)
--
-- Host: 127.0.0.1    Database: pandployer
-- ------------------------------------------------------
-- Server version	9.2.0

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
-- Table structure for table `Notes`
--

DROP TABLE IF EXISTS `Notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` longtext,
  `student` int NOT NULL,
  `last_edited` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_UNIQUE` (`student`),
  UNIQUE KEY `last_edited_UNIQUE` (`last_edited`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notes`
--

LOCK TABLES `Notes` WRITE;
/*!40000 ALTER TABLE `Notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `First_name` varchar(45) NOT NULL,
  `Last_name` varchar(45) NOT NULL,
  `Email` varchar(45) NOT NULL,
  `Affiliation` enum('student','advisor') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `Group` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Email_UNIQUE` (`Email`),
  UNIQUE KEY `group_id` (`Group`),
  KEY `fk_Users_resumepage21_idx` (`Group`),
  CONSTRAINT `fk_Users_homepage1` FOREIGN KEY (`id`) REFERENCES `homepage` (`student`),
  CONSTRAINT `fk_Users_interviewpage1` FOREIGN KEY (`id`) REFERENCES `interviewpage` (`student`),
  CONSTRAINT `fk_Users_jobdes1` FOREIGN KEY (`id`) REFERENCES `jobdes` (`student`),
  CONSTRAINT `fk_Users_Notes` FOREIGN KEY (`id`) REFERENCES `Notes` (`student`),
  CONSTRAINT `fk_Users_resume1` FOREIGN KEY (`id`) REFERENCES `resume` (`id`),
  CONSTRAINT `fk_Users_resumepage1` FOREIGN KEY (`id`) REFERENCES `resumepage` (`student`),
  CONSTRAINT `fk_Users_resumepage21` FOREIGN KEY (`Group`) REFERENCES `resumepage2` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canidates`
--

DROP TABLE IF EXISTS `canidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `canidates` (
  `id` int NOT NULL,
  `resume` int NOT NULL,
  `interview` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_canidates_resume1_idx` (`resume`),
  CONSTRAINT `fk_canidates_resume1` FOREIGN KEY (`resume`) REFERENCES `resume` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canidates`
--

LOCK TABLES `canidates` WRITE;
/*!40000 ALTER TABLE `canidates` DISABLE KEYS */;
/*!40000 ALTER TABLE `canidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `homepage`
--

DROP TABLE IF EXISTS `homepage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `homepage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visited` int DEFAULT '0',
  `student` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_UNIQUE` (`student`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homepage`
--

LOCK TABLES `homepage` WRITE;
/*!40000 ALTER TABLE `homepage` DISABLE KEYS */;
/*!40000 ALTER TABLE `homepage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interviewpage`
--

DROP TABLE IF EXISTS `interviewpage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviewpage` (
  `student` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `question1` int NOT NULL,
  `question2` int NOT NULL,
  `question3` int NOT NULL,
  `question4` int NOT NULL,
  `timespent` int NOT NULL,
  `canidate` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student` (`student`),
  UNIQUE KEY `student_2` (`student`),
  UNIQUE KEY `student_3` (`student`),
  UNIQUE KEY `student_4` (`student`),
  KEY `fk_interviewpage_canidates1_idx` (`canidate`),
  CONSTRAINT `fk_interviewpage_canidates1` FOREIGN KEY (`canidate`) REFERENCES `canidates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interviewpage`
--

LOCK TABLES `interviewpage` WRITE;
/*!40000 ALTER TABLE `interviewpage` DISABLE KEYS */;
/*!40000 ALTER TABLE `interviewpage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobdes`
--

DROP TABLE IF EXISTS `jobdes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobdes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visited` int DEFAULT '0',
  `student` int NOT NULL,
  `timespent` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sttudent_UNIQUE` (`student`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobdes`
--

LOCK TABLES `jobdes` WRITE;
/*!40000 ALTER TABLE `jobdes` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobdes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `makeofferpage`
--

DROP TABLE IF EXISTS `makeofferpage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `makeofferpage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `selected` int NOT NULL,
  `timespent` int NOT NULL,
  `group` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_makeofferpage_canidates1_idx` (`selected`),
  KEY `fk_makeofferpage_Users1_idx` (`group`),
  CONSTRAINT `fk_makeofferpage_canidates1` FOREIGN KEY (`selected`) REFERENCES `canidates` (`id`),
  CONSTRAINT `fk_makeofferpage_Users1` FOREIGN KEY (`group`) REFERENCES `Users` (`Group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `makeofferpage`
--

LOCK TABLES `makeofferpage` WRITE;
/*!40000 ALTER TABLE `makeofferpage` DISABLE KEYS */;
/*!40000 ALTER TABLE `makeofferpage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resume`
--

DROP TABLE IF EXISTS `resume`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vote` enum('yes','no','unanswered') NOT NULL,
  `student` int NOT NULL,
  `timespent` int NOT NULL,
  `resume_id` int NOT NULL,
  PRIMARY KEY (`id`,`resume_id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `student_UNIQUE` (`student`),
  KEY `fk_resume_resumepage` (`resume_id`),
  CONSTRAINT `fk_resume_resumepage` FOREIGN KEY (`resume_id`) REFERENCES `resumepage2` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume`
--

LOCK TABLES `resume` WRITE;
/*!40000 ALTER TABLE `resume` DISABLE KEYS */;
/*!40000 ALTER TABLE `resume` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resumepage`
--

DROP TABLE IF EXISTS `resumepage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resumepage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visited` int DEFAULT '0',
  `student` int NOT NULL,
  `timespent` int DEFAULT '0',
  `yes` int NOT NULL,
  `no` int NOT NULL,
  `unanswered` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_UNIQUE` (`student`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resumepage`
--

LOCK TABLES `resumepage` WRITE;
/*!40000 ALTER TABLE `resumepage` DISABLE KEYS */;
/*!40000 ALTER TABLE `resumepage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resumepage2`
--

DROP TABLE IF EXISTS `resumepage2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resumepage2` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vote1` int NOT NULL,
  `vote2` int NOT NULL,
  `vote3` int NOT NULL,
  `vote4` int NOT NULL,
  `timespent` int NOT NULL,
  `group` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_UNIQUE` (`group`),
  KEY `fk_resumepage2_resume1_idx` (`vote2`),
  CONSTRAINT `fk_resumepage2_resume1` FOREIGN KEY (`vote2`) REFERENCES `resume` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resumepage2`
--

LOCK TABLES `resumepage2` WRITE;
/*!40000 ALTER TABLE `resumepage2` DISABLE KEYS */;
/*!40000 ALTER TABLE `resumepage2` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-19 15:32:10
