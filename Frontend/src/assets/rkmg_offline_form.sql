-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 27, 2024 at 02:06 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rkmg_offline_form`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password`, `user_type`) VALUES
(3, 'admin', '$2b$10$gJBR4eAiwC/jACIi1R6lGOqLJ2rEzwqdecAd6HoVRy2c2cC9WpYiu', 'admin'),
(5, 'Debanjan', '$2b$10$gJBR4eAiwC/jACIi1R6lGOqLJ2rEzwqdecAd6HoVRy2c2cC9WpYiu', 'user');

-- --------------------------------------------------------

--
-- Table structure for table `billingrecords`
--

CREATE TABLE `billingrecords` (
  `id` int(11) NOT NULL,
  `submittedby_user` varchar(20) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `district` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `pinCode` varchar(10) NOT NULL,
  `mobileNo` varchar(20) NOT NULL,
  `altMobileNo` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `idType` enum('Aadhar Card','PAN Card','Driving Licence','Voter Card','Ration Card') NOT NULL,
  `idNo` varchar(50) NOT NULL,
  `purposeOfDonation` text NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `submissionDateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `donationMethod` varchar(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billingrecords`
--

INSERT INTO `billingrecords` (`id`, `submittedby_user`, `name`, `address`, `district`, `city`, `state`, `pinCode`, `mobileNo`, `altMobileNo`, `email`, `idType`, `idNo`, `purposeOfDonation`, `amount`, `submissionDateTime`, `donationMethod`) VALUES
(29, 'admin', 'Debanjan Pan', 'Kolkata', 'sdf', 'Kolkata', 'West Bengal', '700056', '9641866597', '', '', 'Aadhar Card', '1254635', 'Tithi - Swamiji', 110.00, '2024-08-17 17:25:05', 'Cash'),
(30, NULL, 'debanjan pan', '8/14/1 kcc mtra street,belghoria', 'dfgfd', '24 PARAGANAS NORTH', 'West Bengal', '700056', '9641866597', '', '', 'Driving Licence', 'hjfyrdd6556', 'Development Fund (sfsd)', 123.00, '2024-08-26 19:51:05', 'Cash'),
(31, NULL, 'Daddy Baby', 'Daddy 69', '69 parganas', 'Kolkata', 'West Bengal', '700056', '9641866597', '', '', 'Driving Licence', '1254635', 'Shadoshi Puja', 69.00, '2024-08-26 19:54:26', 'Cash'),
(32, NULL, 'Debanjan Pan', 'Kolkata', 'tdfdr', 'Kolkata', 'West Bengal', '700056', '9641866597', '', '', 'Aadhar Card', '4512548854', 'Durga Puja', 112.00, '2024-08-26 19:59:25', 'Cash'),
(33, '', 'Debanjan Pan', 'Kolkata', 'rgdrtg', 'Kolkata', 'West Bengal', '700056', '9641866597', '', '', 'PAN Card', 'dfgdgdrdg', 'Shadoshi Puja', 11114.00, '2024-08-26 20:13:55', 'Cash'),
(34, 'Debanjan', 'dsdsd', 'dsdsds', 'sdsds', 'dsdsd', 'dsdssd', '457845', '4578457845', '', '', 'Aadhar Card', '45485315489', 'Tithi - Swamiji', 6968.00, '2024-08-26 20:47:59', 'Cash'),
(35, 'admin', 'ddfdfdsd', 'gfgfdgfdg', 'dfgfdgfdgf', 'gdfgfdgfd', 'gdfgfdgf', '454545', '4578457845', '', '', 'PAN Card', '4857158', 'Kali Puja', 6969.00, '2024-08-26 20:55:39', 'Cash'),
(36, 'admin', 'admin', 'admin', 'admin', 'admin', 'admin', '145825', '8596741245', '', '', 'PAN Card', '59451248', 'Tithi - Maa', 5689.00, '2024-08-26 21:19:26', 'Bank'),
(37, 'Debanjan', 'debanjan pan', '8/14/1 kcc mtra street,belghoria', 'districtt', '24 PARAGANAS NORTH', 'West Bengal', '700056', '9641866597', '', '', 'Aadhar Card', '45784587845', 'Tithi - Thakur', 695847.00, '2024-08-26 21:28:57', 'Cash'),
(38, 'admin', 'Tirthajyoti Nag', 'Kolkata', 'dfbnm', 'Kolkata', 'West Bengal', '700056', '9641866597', '', '', 'Driving Licence', '45484524', 'Saraswati Puja', 4998.00, '2024-08-26 21:29:00', 'Cash');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `billingrecords`
--
ALTER TABLE `billingrecords`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `billingrecords`
--
ALTER TABLE `billingrecords`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
