-- MySQL Script generated by MySQL Workbench
-- Thu Feb 13 16:24:23 2025
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema pandployer
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema pandployer
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `pandployer` DEFAULT CHARACTER SET utf8 ;
USE `pandployer` ;

-- -----------------------------------------------------
-- Table `pandployer`.`Notes`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `pandployer`.`Notes` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES Users(email) ON DELETE CASCADE
)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`homepage`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`homepage` (
  `id` INT AUTO_INCREMENT,
  `visited` INT DEFAULT 0,
  `student` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `student_UNIQUE` (`student` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`jobdes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`jobdes` (
  `id` INT AUTO_INCREMENT,
  `visited` INT DEFAULT 0,
  `student` INT NOT NULL,
  `timespent` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `sttudent_UNIQUE` (`student` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`resumepage`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`resumepage` (
  `id` INT AUTO_INCREMENT,
  `visited` INT DEFAULT 0,
  `student` INT NOT NULL,
  `timespent` INT DEFAULT 0,
  `yes` INT NOT NULL,
  `no` INT NOT NULL,
  `unanswered` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `student_UNIQUE` (`student` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`resumepage2`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`resumepage2` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vote1` INT NOT NULL,
  `vote2` INT NOT NULL,
  `vote3` INT NOT NULL,
  `vote4` INT NOT NULL,
  `timespent` INT NOT NULL,
  `group` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `group_UNIQUE` (`group` ASC) VISIBLE,
  INDEX `fk_resumepage2_resume1_idx` (`vote2` ASC) VISIBLE,
  CONSTRAINT `fk_resumepage2_resume1`
    FOREIGN KEY (`vote2`)
    REFERENCES `pandployer`.`resume` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`resume`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`resume` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vote` ENUM('yes', 'no', 'unanswered') NOT NULL,
  `student` INT NOT NULL,
  `timespent` INT NOT NULL,
  `resume_id` INT NOT NULL,
  PRIMARY KEY (`id`, `resume_id`),
  UNIQUE INDEX `student_UNIQUE` (`student` ASC) VISIBLE,
  CONSTRAINT `fk_resume_resumepage21`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`resumepage2` (`vote1`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_resume_resumepage22`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`resumepage2` (`vote3`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_resume_resumepage23`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`resumepage2` (`vote4`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`canidates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`canidates` (
  `id` INT NOT NULL,
  `resume` INT NOT NULL,
  `interview` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_canidates_resume1_idx` (`resume` ASC) VISIBLE,
  CONSTRAINT `fk_canidates_resume1`
    FOREIGN KEY (`resume`)
    REFERENCES `pandployer`.`resume` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`interviewpage`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`interviewpage` (
  `student` INT NOT NULL,
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question1` INT NOT NULL,
  `question2` INT NOT NULL,
  `question3` INT NOT NULL,
  `question4` INT NOT NULL,
  `timespent` INT NOT NULL,
  `canidate` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_interviewpage_canidates1_idx` (`canidate` ASC) VISIBLE,
  CONSTRAINT `fk_interviewpage_canidates1`
    FOREIGN KEY (`canidate`)
    REFERENCES `pandployer`.`canidates` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `First_name` VARCHAR(45) NOT NULL,
  `Last_name` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Affiliation` ENUM('student', 'advisor') NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `Group` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE,
  INDEX `fk_Users_resumepage21_idx` (`Group` ASC) VISIBLE,
  CONSTRAINT `fk_Users_Notes`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`Notes` (`student`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_homepage1`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`homepage` (`student`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_jobdes1`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`jobdes` (`student`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_resumepage1`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`resumepage` (`student`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_resume1`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`resume` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_resumepage21`
    FOREIGN KEY (`Group`)
    REFERENCES `pandployer`.`resumepage2` (`group`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_interviewpage1`
    FOREIGN KEY (`id`)
    REFERENCES `pandployer`.`interviewpage` (`student`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pandployer`.`makeofferpage`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pandployer`.`makeofferpage` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `selected` INT NOT NULL,
  `timespent` INT NOT NULL,
  `group` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_makeofferpage_canidates1_idx` (`selected` ASC) VISIBLE,
  INDEX `fk_makeofferpage_Users1_idx` (`group` ASC) VISIBLE,
  CONSTRAINT `fk_makeofferpage_canidates1`
    FOREIGN KEY (`selected`)
    REFERENCES `pandployer`.`canidates` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_makeofferpage_Users1`
    FOREIGN KEY (`group`)
    REFERENCES `pandployer`.`Users` (`Group`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE USER 'Sage' IDENTIFIED BY 'password';

GRANT ALL ON `pandployer`.* TO 'Sage';
GRANT SELECT, INSERT, TRIGGER ON TABLE `pandployer`.* TO 'Sage';
GRANT SELECT, INSERT, TRIGGER, UPDATE, DELETE ON TABLE `pandployer`.* TO 'Sage';
GRANT EXECUTE ON `pandployer`.* TO 'Sage'@'%';

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SHOW COLUMNS FROM Users;

