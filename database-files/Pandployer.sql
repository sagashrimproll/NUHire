CREATE DATABASE  IF NOT EXISTS `pandployer` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pandployer`;
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
-- Table structure for table `Candidates`
--

DROP TABLE IF EXISTS `Candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Candidates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resume_id` int NOT NULL,
  `interview` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `resume_id` (`resume_id`),
  CONSTRAINT `Candidates_ibfk_1` FOREIGN KEY (`resume_id`) REFERENCES `Resume` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Candidates`
--

LOCK TABLES `Candidates` WRITE;
/*!40000 ALTER TABLE `Candidates` DISABLE KEYS */;
/*!40000 ALTER TABLE `Candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Groups`
--

DROP TABLE IF EXISTS `Groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Groups`
--

LOCK TABLES `Groups` WRITE;
/*!40000 ALTER TABLE `Groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `Groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Homepage`
--

DROP TABLE IF EXISTS `Homepage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Homepage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visited` datetime DEFAULT CURRENT_TIMESTAMP,
  `student_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `Homepage_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Homepage`
--

LOCK TABLES `Homepage` WRITE;
/*!40000 ALTER TABLE `Homepage` DISABLE KEYS */;
/*!40000 ALTER TABLE `Homepage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `InterviewPage`
--

DROP TABLE IF EXISTS `InterviewPage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `InterviewPage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `group_id` int NOT NULL,
  `question1` int NOT NULL,
  `question2` int NOT NULL,
  `question3` int NOT NULL,
  `question4` int NOT NULL,
  `timespent` int NOT NULL,
  `candidate_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `InterviewPage_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `InterviewPage`
--

LOCK TABLES `InterviewPage` WRITE;
/*!40000 ALTER TABLE `InterviewPage` DISABLE KEYS */;
/*!40000 ALTER TABLE `InterviewPage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Jobdes`
--

DROP TABLE IF EXISTS `Jobdes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Jobdes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visited` datetime DEFAULT CURRENT_TIMESTAMP,
  `student_id` int NOT NULL,
  `timespent` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `Jobdes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Jobdes`
--

LOCK TABLES `Jobdes` WRITE;
/*!40000 ALTER TABLE `Jobdes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Jobdes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MakeOfferPage`
--

DROP TABLE IF EXISTS `MakeOfferPage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MakeOfferPage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `selected_candidate` int NOT NULL,
  `timespent` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `selected_candidate` (`selected_candidate`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `MakeOfferPage_ibfk_1` FOREIGN KEY (`selected_candidate`) REFERENCES `Candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `MakeOfferPage_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `Groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MakeOfferPage`
--

LOCK TABLES `MakeOfferPage` WRITE;
/*!40000 ALTER TABLE `MakeOfferPage` DISABLE KEYS */;
/*!40000 ALTER TABLE `MakeOfferPage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notes`
--

DROP TABLE IF EXISTS `Notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `pandployer`.`Notes` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES Users(email) ON DELETE CASCADE
)
ENGINE = InnoDB;

--
-- Dumping data for table `Notes`
--

LOCK TABLES `Notes` WRITE;
/*!40000 ALTER TABLE `Notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Resume`
--

DROP TABLE IF EXISTS `Resume`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Resume` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `group_id` int NOT NULL,
  `timespent` int NOT NULL,
  `resume_number` int NOT NULL,
  `vote` enum('yes','no','unanswered') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  `checked` BOOLEAN DEFAULT FALSE,
  CONSTRAINT `Resume_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Resume`
--

LOCK TABLES `Resume` WRITE;
/*!40000 ALTER TABLE `Resume` DISABLE KEYS */;
/*!40000 ALTER TABLE `Resume` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Resume`
--

DROP TABLE IF EXISTS `Resume_pdfs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Resume_pdfs` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL, 
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Resume_pdfs`
--

LOCK TABLES `Resume_pdfs` WRITE;
/*!40000 ALTER TABLE `Resume_pdfs` DISABLE KEYS */;
/*!40000 ALTER TABLE `Resume_pdfs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Resumepage`
--

DROP TABLE IF EXISTS `Resumepage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Resumepage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visited` datetime DEFAULT CURRENT_TIMESTAMP,
  `student_id` int NOT NULL,
  `timespent` int NOT NULL,
  `vote` enum('yes','no','unanswered') DEFAULT 'unanswered',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `Resumepage_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Resumepage`
--

LOCK TABLES `Resumepage` WRITE;
/*!40000 ALTER TABLE `Resumepage` DISABLE KEYS */;
/*!40000 ALTER TABLE `Resumepage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_descriptions`
--

DROP TABLE IF EXISTS `job_descriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_descriptions` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL, 
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_descriptions`
--

LOCK TABLES `job_descriptions` WRITE;
/*!40000 ALTER TABLE `job_descriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_descriptions` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `Resumepage2`
--

DROP TABLE IF EXISTS `Resumepage2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Resumepage2` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vote1` int NOT NULL,
  `vote2` int NOT NULL,
  `vote3` int NOT NULL,
  `vote4` int NOT NULL,
  `timespent` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `Resumepage2_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `Groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Resumepage2`
--

LOCK TABLES `Resumepage2` WRITE;
/*!40000 ALTER TABLE `Resumepage2` DISABLE KEYS */;
/*!40000 ALTER TABLE `Resumepage2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `f_name` varchar(50) NOT NULL,
  `l_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `affiliation` enum('student','admin') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `group_id` int DEFAULT NULL,
  `job_des` varchar(100) DEFAULT NULL,
  `current_page` enum('dashboard','resumepage','resumepage2','jobdes','interviewpage','makeofferpage') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-04 12:57:26

INSERT INTO `Users` (`f_name`, `l_name`, `email`, `affiliation`) VALUES ('Sai A.', 'Dhanasiri', 'saianirudhsjps@gmail.com', 'student');
INSERT INTO `Users` (`f_name`, `l_name`, `email`, `affiliation`) VALUES ('Sage', 'Batchelor', 'sagebatchelor@gmail.com', 'student');
INSERT INTO `Users` (`f_name`, `l_name`, `email`, `affiliation`) VALUES ('Sag', 'Bat', 'batchelor.sa@husky.neu.edu', 'student');
INSERT INTO `Users` (`f_name`, `l_name`, `email`, `affiliation`) VALUES ('Sage', 'Batchelor', 'sagashrimproll@gmail.com', 'admin');
INSERT INTO `job_descriptions` (`title`, `file_path`) VALUES ('Carbonite', 'uploads/jobdescription/carbonite-jobdes.pdf');
INSERT INTO `job_descriptions` (`title`, `file_path`) VALUES ('Cygilant', 'uploads/jobdescription/Cygilant Security Research Job Description.pdf');
INSERT INTO `job_descriptions` (`title`, `file_path`) VALUES ('Motionlogic', 'uploads/jobdescription/QA Coop Motionlogic (Berlin, Germany).pdf');
INSERT INTO `job_descriptions` (`title`, `file_path`) VALUES ('Sample', 'uploads/jobdescription/sample-job-description.pdf');
INSERT INTO `job_descriptions` (`title`, `file_path`) VALUES ('Source One', 'uploads/jobdescription/SourceOneJobDescription.pdf');
INSERT INTO `job_descriptions` (`title`, `file_path`) VALUES ('Two Six Labs', 'uploads/jobdescription/Two Six Labs Data Visualization Co-op Job Description.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample1', 'uploads/resumes/sample1.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample2', 'uploads/resumes/sample2.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample3', 'uploads/resumes/sample3.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample4', 'uploads/resumes/sample4.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample5', 'uploads/resumes/sample5.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample6', 'uploads/resumes/sample6.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample7', 'uploads/resumes/sample7.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample8', 'uploads/resumes/sample8.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample9', 'uploads/resumes/sample9.pdf');
INSERT INTO `Resume_pdfs` (`title`, `file_path`) VALUES ('sample10', 'uploads/resumes/sample10.pdf');
INSERT INTO `Users` (`f_name`, `l_name`, `email`, `affiliation`) VALUES ('Sai Anirudh', 'Dhanasiri', 'dhanasiri.s@husky.neu.edu', 'admin');
INSERT INTO `Users` (`f_name`, `l_name`, `email`, `affiliation`) VALUES ('Penguin', 'The Last', 'ilovepenguinsandhowtheylook@gmail.com', 'student');

