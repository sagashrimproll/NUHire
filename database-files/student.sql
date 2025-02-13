-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (x86_64)
--
-- Host: localhost    Database: test_db
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
-- Table structure for table `Students`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  'id' INTEGER PRIMARY KEY AUTOINCREMENT,
  `email` varchar(45) NOT NULL,
  `f_name` varchar(45) NOT NULL,
  `l_name` varchar(45) NOT NULL,
  `affiliation` enum('student','admin') NOT NULL,
  `created_at` TMIESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` integer PRIMARY KEY,
  `content` varchar(255),
  `student` integer,
  `last_edited` timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `homepage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `homepage` (
  `id` integer PRIMARY KEY,
  `visited` integer,
  `student` integer
);
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `jobdes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobdes` (
  `id` integer PRIMARY KEY,
  `visited` integer,
  `student` integer,
  `timespent` time
);
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `resumepage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resumepage` (
  `id` integer PRIMARY KEY,
  `visited` integer,
  `student` integer,
  `timespent` time,
  `total_yes` integer,
  `total_no` integer,
  `total_unanswered` integer
);
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `resume`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume` (
  `id` integer PRIMARY KEY,
  `vote` varchar(255),
  `student` integer,
  `timespent` time
);
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `resumepage2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resumepage2` (
  `id` integer PRIMARY KEY,
  `vote1` integer,
  `vote2` integer,
  `vote3` integer,
  `vote4` integer,
  `timespent` time,
  `group` integer
);
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `id` integer PRIMARY KEY,
  `student1` integer,
  `student2` integer,
  `student3` integer,
  `student4` integer,
  `student5` integer
);
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `interviewpage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviewpage` (
    `id` INTEGER PRIMARY KEY,
    `question1` INTEGER,
    `question2` INTEGER,
    `question3` INTEGER,
    `question4` INTEGER,
    `timespent` TIME,
    `student` INTEGER
);
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `makeofferpage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `makeofferpage` (
  `id` integer PRIMARY KEY,
  `selected` integer,
  `timespent` time,
  `group` integer
);
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `canidates`;
CREATE TABLE `canidate` (
  `id` integer PRIMARY KEY,
  `resume` varchar(255),
  `interview` varchar(255)
);
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` (`id`, `email`, `f_name`, `l_name`, `affiliation`, `created_at`) VALUES 
(1, 'test@neu.edu', 'Test', 'User', 'student', '2025-02-07 14:11:42'),
(2, 'admin@neu.edu', 'Admin', 'User', 'admin', '2025-02-07 14:11:42');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` (`id`, `content`, `student`, `last_edited`) VALUES 
(1, 'This is a note', 1, '2025-02-07 14:11:42');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

-- Dumping data for table `homepage`
--

LOCK TABLES `homepage` WRITE;
/*!40000 ALTER TABLE `homepage` DISABLE KEYS */;
INSERT INTO `homepage` (`id`, `visited`, `student`) VALUES 
(1, 1, 1);
/*!40000 ALTER TABLE `homepage` ENABLE KEYS */;
UNLOCK TABLES;

-- Dumping data for table `jobdes`
--

LOCK TABLES `jobdes` WRITE;
/*!40000 ALTER TABLE `jobdes` DISABLE KEYS */;
INSERT INTO `jobdes` (`id`, `visited`, `student`, `timespent`) VALUES 
(1, 1, 1, '00:30:00');
/*!40000 ALTER TABLE `jobdes` ENABLE KEYS */;
UNLOCK TABLES;

-- Dumping data for table `resumepage`
--

LOCK TABLES `resumepage` WRITE;
/*!40000 ALTER TABLE `resumepage` DISABLE KEYS */;
INSERT INTO `resumepage` (`id`, `visited`, `student`, `timespent`, `total_yes`, `total_no`, `total_unanswered`) VALUES 
(1, 1, 1, '00:30:00', 5, 2, 3);
/*!40000 ALTER TABLE `resumepage` ENABLE KEYS */;
UNLOCK TABLES;

-- Dumping data for table `resume`
--

LOCK TABLES `resume` WRITE;
/*!40000 ALTER TABLE `resume` DISABLE KEYS */;
-- Dumping data for table `Students`
--

UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-07 14:11:42
