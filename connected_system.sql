-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 14, 2026 at 02:05 PM
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
-- Database: `connected_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_due_notices`
--

CREATE TABLE `activity_due_notices` (
  `id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `closes_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_due_notices`
--

INSERT INTO `activity_due_notices` (`id`, `assessment_id`, `student_id`, `parent_id`, `closes_at`, `created_at`) VALUES
(1, 42, 5, 3, '2026-10-11 22:25:41', '2026-10-11 13:25:48'),
(89, 43, 5, 3, '2026-10-12 22:09:00', '2026-10-11 14:09:23'),
(175, 49, 5, 3, '2026-10-12 22:50:00', '2026-10-11 14:50:56'),
(250, 50, 5, 3, '2026-10-12 23:27:00', '2026-10-11 15:27:07'),
(357, 52, 5, 3, '2026-10-12 23:53:00', '2026-10-11 15:53:49');

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_role` varchar(20) DEFAULT NULL,
  `ACTION` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_name` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `user_name`, `user_role`, `ACTION`, `target_type`, `target_name`, `details`, `created_at`) VALUES
(1, 1, 'System Admin', NULL, 'Updated teacher assignments', 'teacher', 'Teacher ID 5', NULL, '2026-08-14 06:26:10'),
(2, 1, 'System Admin', NULL, 'Deactivated account', 'user', 'User ID 5', NULL, '2026-08-14 06:26:26'),
(3, 1, 'System Admin', NULL, 'Deactivated account', 'user', 'User ID 4', NULL, '2026-08-14 07:03:36'),
(4, 1, 'System Admin', NULL, 'Created announcement', 'announcement', 'sgdf', 'Scope: school_wide', '2026-08-14 14:01:43'),
(5, 1, 'System Admin', NULL, 'Created announcement', 'announcement', 'frvrf', 'Scope: school_wide', '2026-08-14 14:04:22'),
(6, 1, 'System Admin', NULL, 'Created announcement', 'announcement', 'Exam Udma', 'Scope: school_wide', '2026-08-14 15:50:20'),
(7, 1, 'System Admin', NULL, 'Created account', 'teacher', 'Jane Doe', 'janedoe@usant.edu.ph', '2026-08-15 03:02:46'),
(8, 1, 'System Admin', NULL, 'Created account', 'teacher', 'John Doe', 'johndoe@usant.edu.ph', '2026-08-15 07:33:36'),
(9, 1, 'System Admin', NULL, 'Deactivated account', 'user', 'User ID 8', NULL, '2026-08-15 11:23:49'),
(10, 1, 'System Admin', NULL, 'Updated announcement', 'announcement', 'Exam Udma', 'Scope: school_wide', '2026-08-16 03:37:35'),
(11, 1, 'System Admin', NULL, 'Updated announcement', 'announcement', 'Exam Udma', 'Scope: school_wide', '2026-08-16 03:37:48'),
(12, 1, 'System Admin', NULL, 'Created announcement', 'announcement', 'dgfdgs', 'Scope: school_wide', '2026-08-16 03:38:02'),
(13, 1, 'System Admin', NULL, 'Deleted announcement', 'announcement', 'dgfdgs', NULL, '2026-08-16 03:45:22'),
(14, 1, 'System Admin', NULL, 'Updated announcement', 'announcement', 'Exam Udma', 'Scope: school_wide', '2026-08-16 03:52:53'),
(15, 1, 'System Admin', NULL, 'Deleted announcement', 'announcement', 'frvrf', NULL, '2026-08-16 08:10:11'),
(16, 1, 'System Admin', NULL, 'Created announcement', 'announcement', 'dd', 'Scope: school_wide', '2026-08-17 05:13:16'),
(17, 1, 'System Admin', NULL, 'Updated announcement', 'announcement', 'dd', 'Scope: school_wide', '2026-08-17 05:13:35'),
(18, 2, 'Agnes Cepe', NULL, 'Generated AI lesson resources', 'lesson_plan', 'activity', 'provider=ollama', '2026-10-01 13:25:35'),
(19, 2, 'Agnes Cepe', NULL, 'Generated AI lesson resources', 'lesson_plan', 'activity', 'provider=ollama', '2026-10-01 13:27:41'),
(20, 2, 'Agnes Cepe', NULL, 'Generated AI lesson resources', 'lesson_plan', 'Plants', 'provider=ollama', '2026-10-01 13:30:17'),
(21, 2, 'Agnes Cepe', NULL, 'Approved AI recommendation', 'assessment', 'File System Administration Quiz', 'Grade 1-A · quiz', '2026-10-01 13:30:43'),
(22, 2, 'Agnes Cepe', NULL, 'Saved AI set to Classwork', 'question_bank', 'Plant Parts Quiz', '11 created, set #2', '2026-10-01 13:31:36'),
(23, 2, 'Agnes Cepe', NULL, 'Created quiz from Classwork', 'assessment', 'Plant Parts Quiz', 'Grade 1-A · 10 items', '2026-10-01 13:35:08'),
(24, 2, 'Agnes Cepe', NULL, 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (AM)', '2026-10-01 13:35:40'),
(25, 2, 'Agnes Cepe', NULL, 'Generated AI lesson resources', 'lesson_plan', 'try', 'provider=ollama', '2026-10-01 13:36:17'),
(26, 2, 'Agnes Cepe', NULL, 'Assigned shared link', 'assessment', 'Plant Parts Quiz', 'token=e3b7abec3956b2fb', '2026-10-01 13:37:02'),
(27, 2, 'Agnes Cepe', NULL, 'Generated AI lesson resources', 'lesson_plan', 'try', 'provider=ollama', '2026-10-01 13:39:08'),
(28, 2, 'Agnes Cepe', 'teacher', 'Approved AI recommendation', 'assessment', 'Plant Parts Quiz', 'Grade 1-A · quiz', '2026-10-01 13:50:00'),
(29, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'try', 'provider=ollama', '2026-10-01 13:52:32'),
(30, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Understanding Participation in Campus Organizations', '11 created, set #3', '2026-10-01 13:56:44'),
(31, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Understanding Participation in Campus Organizations', '0 created, set #3', '2026-10-01 13:57:37'),
(32, 2, 'Agnes Cepe', 'teacher', 'Revoked shared link', 'assessment', 'Plant Parts Quiz', NULL, '2026-10-01 13:59:20'),
(33, 2, 'Agnes Cepe', 'teacher', 'Approved AI recommendation', 'assessment', 'Understanding Participation in Campus Organizations', 'Grade 1-A · quiz', '2026-10-01 13:59:51'),
(34, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'PT3', 'provider=ollama', '2026-10-02 01:37:18'),
(35, 2, 'Agnes Cepe', 'teacher', 'Approved AI recommendation', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'Grade 1-A · quiz', '2026-10-02 02:10:10'),
(36, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — PT3', 'Grade 1-A · 1 items', '2026-10-02 02:14:11'),
(37, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'try', 'provider=ollama', '2026-10-02 02:21:55'),
(38, 2, 'Agnes Cepe', 'teacher', 'Approved AI recommendation', 'assessment', 'Activity: Explore try', 'Grade 1-A · activity', '2026-10-02 02:37:32'),
(39, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — try', 'Grade 1-A · 1 items', '2026-10-02 02:39:13'),
(40, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — try', 'Grade 1-A · 1 items', '2026-10-02 02:39:55'),
(41, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'try', 'provider=ollama', '2026-10-02 02:44:51'),
(42, 2, 'Agnes Cepe', 'teacher', 'Approved AI recommendation', 'assessment', 'Design a Campus Organization for Criminology Students', 'Grade 1-A · activity', '2026-10-02 02:45:57'),
(43, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — try', 'Grade 1-A · 1 items', '2026-10-02 02:46:41'),
(44, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Sample Quiz', 'Grade 1-A · 10 items', '2026-10-02 02:49:55'),
(45, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (AM)', '2026-10-02 02:50:07'),
(46, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Sample Quiz', 'token=080be99cae1aa75e', '2026-10-02 02:50:23'),
(47, 2, 'Agnes Cepe', 'teacher', 'Updated progress scores', 'assessment', 'Sample Quiz', '1 score saved', '2026-10-02 02:52:19'),
(48, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — try', 'token=114162305e2f2665', '2026-10-02 02:56:06'),
(49, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'PT3', 'provider=ollama', '2026-10-02 03:39:37'),
(50, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'File System Administration: Provisioning, Partitioning and Mounting Storage', '20 created, set #7', '2026-10-02 03:40:22'),
(51, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'Grade 1-A · 19 items', '2026-10-02 03:42:41'),
(52, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'token=f4fd848e3fa25afb', '2026-10-02 03:42:49'),
(53, 2, 'Agnes Cepe', 'teacher', 'Updated progress scores', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', '1 score saved', '2026-10-02 03:52:35'),
(54, 2, 'Agnes Cepe', 'teacher', 'Updated progress scores', 'assessment', 'Sample Quiz', '1 score saved', '2026-10-02 03:53:04'),
(55, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — PT3', 'Grade 1-A · 1 items', '2026-10-02 03:59:24'),
(56, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — try', 'Grade 1-A · 1 items', '2026-10-02 04:00:26'),
(57, 2, 'Agnes Cepe', 'teacher', 'Updated progress scores', 'assessment', 'Activity — try', '1 score saved', '2026-10-02 04:05:30'),
(58, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — PT3', 'token=ae66e79baed9bef0', '2026-10-02 05:15:52'),
(59, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (PM)', '2026-10-02 05:16:25'),
(60, 2, 'Agnes Cepe', 'teacher', 'Revoked shared link', 'assessment', 'Activity — PT3', NULL, '2026-10-02 05:17:18'),
(61, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — PT3 Sample', 'Grade 1-A · 1 items', '2026-10-02 05:18:09'),
(62, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — PT3 Sample', 'token=b7774faefa2c73dd', '2026-10-02 05:18:13'),
(63, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'Grade 1-A · 19 items', '2026-10-02 05:20:12'),
(64, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'token=d2bbfb992a16b374', '2026-10-02 05:20:17'),
(65, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Try Your Math Skills!', 'Grade 1-A · 10 items', '2026-10-02 05:32:32'),
(66, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Try Your Math Skills!', 'token=2175e2b2e5d88ec3', '2026-10-02 05:32:39'),
(67, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (PM)', '2026-10-02 05:33:16'),
(68, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Sample', 'Grade 1-A · 1 items', '2026-10-02 05:34:11'),
(69, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Sample', 'token=c56c7e0bd5c92532', '2026-10-02 05:34:15'),
(70, 2, 'Agnes Cepe', 'teacher', 'Granted quiz make-up access', 'assessment', 'Activity — Sample', '1 student(s)', '2026-10-02 05:43:14'),
(71, 2, 'Agnes Cepe', 'teacher', 'Revoked quiz make-up access', 'assessment', 'Activity — Sample', '1 student(s)', '2026-10-02 05:43:25'),
(72, 2, 'Agnes Cepe', 'teacher', 'Granted quiz make-up access', 'assessment', 'Activity — Sample', '1 student(s)', '2026-10-02 05:43:32'),
(73, 2, 'Agnes Cepe', 'teacher', 'Granted quiz make-up access', 'assessment', 'Try Your Math Skills!', '1 student(s)', '2026-10-02 05:44:14'),
(74, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (PM)', '2026-10-02 05:49:21'),
(75, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'Grade 1-A · 10 items', '2026-10-02 05:57:24'),
(76, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'token=bff87a7ccea261c9', '2026-10-02 05:57:56'),
(77, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Understanding Participation in Campus Organizations', 'Grade 1-A · 10 items', '2026-10-02 06:51:28'),
(78, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Understanding Participation in Campus Organizations', 'token=12d0234e71e99f4e', '2026-10-02 06:52:17'),
(79, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Excused (PM)', '2026-10-02 06:52:34'),
(80, 2, 'Agnes Cepe', 'teacher', 'Revoked shared link', 'assessment', 'Sample Quiz', NULL, '2026-10-02 07:26:37'),
(81, 2, 'Agnes Cepe', 'teacher', 'Created period exam from Classwork', 'assessment', 'Q1 Periodical Exam', 'Grade 1-A · 49 items', '2026-10-02 08:00:52'),
(82, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Q1 Periodical Exam', 'token=621fca5df3b6fcd3', '2026-10-02 08:00:56'),
(83, 3, 'Cindy Beralde', 'parent', 'Sent concern', 'concern', 'sdsk', 'Cams Lasr', '2026-10-02 20:15:25'),
(84, 2, 'Agnes Cepe', 'teacher', 'Replied to concern', 'concern', 'sdsk', NULL, '2026-10-02 20:20:19'),
(85, 3, 'Cindy Beralde', 'parent', 'Replied to concern', 'concern', 'sdsk', NULL, '2026-10-02 20:20:42'),
(86, 2, 'Agnes Cepe', 'teacher', 'Resolved concern', 'concern', 'sdsk', NULL, '2026-10-02 20:21:05'),
(87, 1, 'System Admin', 'admin', 'Created announcement', 'announcement', 'hahdk', 'Scope: school_wide · Audience: teachers', '2026-10-02 20:33:12'),
(88, 1, 'System Admin', 'admin', 'Deleted announcement', 'announcement', 'dd', NULL, '2026-10-02 20:33:39'),
(89, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (AM)', '2026-10-02 21:14:22'),
(90, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Sindi Bireldi', 'sindi@usant.edu.ph', '2026-10-03 00:25:40'),
(91, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (AM)', '2026-10-04 08:52:13'),
(92, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=ollama', '2026-10-04 09:00:53'),
(93, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Nouns & Verbs Quiz', '11 created, set #8', '2026-10-04 09:01:36'),
(94, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Nouns & Verbs Quiz', 'Grade 1-A · 10 items', '2026-10-04 09:04:00'),
(95, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Nouns & Verbs Quiz', 'token=a0448bc2717838d9', '2026-10-04 09:05:26'),
(96, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Nouns & Verbs', 'Grade 1-A · 1 items', '2026-10-04 09:09:48'),
(97, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Nouns & Verbs', 'token=89cf0bf9ed066f08', '2026-10-04 09:10:57'),
(98, 2, 'Agnes Cepe', 'teacher', 'Updated progress scores', 'assessment', 'Activity — Nouns & Verbs', '1 score saved', '2026-10-04 09:13:45'),
(99, 2, 'Agnes Cepe', 'teacher', 'Sent class notice', 'announcement', 'Long Quiz', 'Grade 1-A', '2026-10-04 09:14:23'),
(100, 2, 'Agnes Cepe', 'teacher', 'Sent class notice', 'announcement', 'Sample', 'Grade 1-A', '2026-10-04 09:18:31'),
(101, 2, 'Agnes Cepe', 'teacher', 'Created period exam from Classwork', 'assessment', 'Q1 Periodical Exam', 'Grade 1-A · 30 items', '2026-10-04 09:22:03'),
(102, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Q1 Periodical Exam', 'token=13b95ead91ee66da', '2026-10-04 09:22:17'),
(103, 3, 'Cindy Beralde', 'parent', 'Sent concern', 'concern', NULL, NULL, '2026-10-04 09:37:58'),
(104, 2, 'Agnes Cepe', 'teacher', 'Replied to concern', 'concern', NULL, NULL, '2026-10-04 09:38:58'),
(105, 2, 'Agnes Cepe', 'teacher', 'Resolved concern', 'concern', NULL, NULL, '2026-10-04 09:39:11'),
(106, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'alert(\'xss\') Lasr: Present (PM)', '2026-10-06 06:32:04'),
(107, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Nouns & Verbs Quiz', 'Grade 1-A · 10 items', '2026-10-06 06:38:42'),
(108, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Nouns & Verbs Quiz', 'token=9bb2930beb175426', '2026-10-06 06:38:50'),
(109, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'Grade 1-A · 19 items', '2026-10-06 06:41:36'),
(110, 2, 'Agnes Cepe', 'teacher', 'Sent class notice', 'announcement', 'Exam', 'Grade 1-A', '2026-10-06 06:43:11'),
(111, 1, 'System Admin', 'admin', 'Updated current quarter', 'settings', 'Q2', 'School year 2025-2026', '2026-10-06 07:02:34'),
(112, 1, 'System Admin', 'admin', 'Updated current quarter', 'settings', 'Q1', 'School year 2025-2026', '2026-10-06 07:02:48'),
(113, 1, 'System Admin', 'admin', 'Created announcement', 'announcement', 'Exam', 'Scope: school_wide · Audience: everyone', '2026-10-06 07:08:51'),
(114, 1, 'System Admin', 'admin', 'Deactivated account', 'user', 'User ID 7', NULL, '2026-10-06 07:10:00'),
(115, 3, 'Cindy Beralde', 'parent', 'Sent concern', 'concern', NULL, NULL, '2026-10-06 07:11:20'),
(116, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Nouns & Verbs Quiz', 'Grade 1-A · 10 items', '2026-10-06 07:38:37'),
(117, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Nouns & Verbs Quiz', 'token=48f765e76107de9b', '2026-10-06 07:38:43'),
(118, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (AM)', '2026-10-06 07:38:50'),
(119, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Nouns & Verbs Quiz', 'Grade 1-A · 10 items', '2026-10-07 05:29:08'),
(120, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (AM)', '2026-10-07 05:29:20'),
(121, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Nouns & Verbs Quiz', 'token=e65879b6aa139fe1', '2026-10-07 05:29:49'),
(122, 1, 'System Admin', 'admin', 'Deactivated account', 'user', 'User ID 3', NULL, '2026-10-07 05:37:34'),
(123, 1, 'System Admin', 'admin', 'Activated account', 'user', 'User ID 3', NULL, '2026-10-07 05:38:30'),
(124, 13, 'Sindi Bireldi', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Sample', 'provider=ollama', '2026-10-07 06:58:20'),
(125, 13, 'Sindi Bireldi', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Parts of Speech Quiz', '11 created, set #9', '2026-10-07 07:02:01'),
(126, 13, 'Sindi Bireldi', 'teacher', 'Created quiz from Classwork', 'assessment', 'Parts of Speech Quiz', 'Grade 4-SAMPAGUITA · 10 items', '2026-10-07 07:02:37'),
(127, 13, 'Sindi Bireldi', 'teacher', 'Marked attendance', 'class', 'Grade 4-SAMPAGUITA', 'Jenny Talagtag: Present', '2026-10-07 07:02:55'),
(128, 13, 'Sindi Bireldi', 'teacher', 'Assigned shared link', 'assessment', 'Parts of Speech Quiz', 'token=2cc09316d72eb281', '2026-10-07 07:03:08'),
(129, 13, 'Sindi Bireldi', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Sample', 'provider=ollama', '2026-10-09 05:22:05'),
(130, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=ollama', '2026-10-09 05:35:59'),
(131, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'math', 'provider=ollama', '2026-10-09 05:41:46'),
(132, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Math Quiz', '11 created, set #10', '2026-10-09 05:42:10'),
(133, 2, 'Agnes Cepe', 'teacher', 'Replied to concern', 'concern', NULL, NULL, '2026-10-09 05:44:00'),
(134, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'Cams Lasr: Present (AM)', '2026-10-09 05:46:04'),
(135, 2, 'Agnes Cepe', 'teacher', 'Updated progress scores', 'assessment', 'Nouns & Verbs Quiz', '1 score saved', '2026-10-09 16:27:15'),
(136, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Sample Parent', 'sample.parent@usant.edu', '2026-10-09 21:28:16'),
(137, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Sample Parent Two', 'sample.parent2@usant.edu', '2026-10-09 21:28:17'),
(138, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Sample Parent Three', 'sample.parent3@usant.edu', '2026-10-09 21:28:18'),
(139, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Sample Teacher', 'sample.teacher@usant.edu', '2026-10-09 21:28:20'),
(140, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Sample Adviser', 'sample.adviser@usant.edu', '2026-10-09 21:28:22'),
(141, 1, 'System Admin', 'admin', 'Deactivated account', 'user', 'User ID 15', NULL, '2026-10-09 21:29:00'),
(142, 1, 'System Admin', 'admin', 'Deactivated account', 'user', 'User ID 16', NULL, '2026-10-09 21:29:00'),
(143, 1, 'System Admin', 'admin', 'Deactivated account', 'user', 'User ID 14', NULL, '2026-10-09 21:29:00'),
(144, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'John Carter: Present (AM)', '2026-10-09 23:42:34'),
(145, 2, 'Agnes Cepe', 'teacher', 'Sent attendance update', 'class', 'Grade 1-A', '1 parent notice · SMS queued 1 · Present/Late/Absent', '2026-10-09 23:42:39'),
(146, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Jonaly Catangui', 'jonalycatangui@usant.edu.ph', '2026-10-09 23:55:35'),
(147, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Daisy De La Rama', 'daisy@usant.edu.ph', '2026-10-09 23:55:39'),
(148, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Christine Jacob', 'chrisjacob@usant.edu.ph', '2026-10-09 23:55:40'),
(149, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Trazcy Cabaltera', 'trazcy.cabaltera@usant.edu.ph', '2026-10-09 23:55:42'),
(150, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Maria Parce', 'marialuzon@usant.edu.ph', '2026-10-09 23:55:46'),
(151, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Freda Ely', 'fredaely28@usant.edu.ph', '2026-10-09 23:55:47'),
(152, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Jesy Serrano', 'jesyserrano@usant.edu.ph', '2026-10-09 23:55:50'),
(153, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Rechelle Magistrado', 'rechelle.magistrado@usant.edu.ph', '2026-10-09 23:55:50'),
(154, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Vivian Landagan', 'landaganvivian9@usant.edu.ph', '2026-10-09 23:55:53'),
(155, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Judy Iballar', 'judyiballar21@usant.edu.ph', '2026-10-09 23:55:54'),
(156, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Kimbie Iballa', 'kimbie.iballa@usant.edu.ph', '2026-10-09 23:55:57'),
(157, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Janiela Tagum', 'tagumjaniela@usant.edu.ph', '2026-10-09 23:55:58'),
(158, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Ma. Renaflor Glaiza Almonte', 'luv_0814@yahoo.com', '2026-10-09 23:56:00'),
(159, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Gyne Ruth Atanacio', 'gyneruth@gmail.com', '2026-10-09 23:56:04'),
(160, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Marianette Bachiller', 'bachillerarablle@gmail.com', '2026-10-09 23:56:06'),
(161, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Renee Mae Barce', 'maebarce0712@gmail.com', '2026-10-09 23:56:08'),
(162, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Mark Anthony Beloro', 'Beloromark800@gmail.com', '2026-10-09 23:56:08'),
(163, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Loreneil Bermillo', 'loreneilbermillo23@gmail.com', '2026-10-09 23:56:09'),
(164, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Joy CabaÃ±es', 'joy.bayson35@gmail.com', '2026-10-09 23:56:12'),
(165, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Elisalve Cabangon', 'cabangonelisalve@gmail.com', '2026-10-09 23:56:12'),
(166, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Ma. Cristina Conejos', 'macristina.conejos001@gmail.com', '2026-10-09 23:56:15'),
(167, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Jenny Cruz', 'cruzjennyvie28@gmail.com', '2026-10-09 23:56:16'),
(168, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Joy Anne Dapito', 'joyannesalvadora.dapito@gmail.com', '2026-10-09 23:56:17'),
(169, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Joan Dayupay', 'annedayupay7@gmail.com', '2026-10-09 23:56:19'),
(170, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Leora De Villa', 'zimrialeor1234@gmail.com', '2026-10-09 23:56:19'),
(171, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Rosabel Dimaiwat', 'Bing101485@gmail.com', '2026-10-09 23:56:21'),
(172, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Babylene Ibanita', 'asea1013@gmail.com', '2026-10-09 23:56:22'),
(173, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Betsy Ibarrientos', 'betsiful@gmail.com', '2026-10-09 23:56:23'),
(174, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Leslie Ibias', 'christinecedron@gmail.com', '2026-10-09 23:56:24'),
(175, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Roxanne Marie Isaac', 'roxannemarieisaac@gmail.com', '2026-10-09 23:56:26'),
(176, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Mary Grace Jarrett', 'gracetabusao09@gmail.com', '2026-10-09 23:56:26'),
(177, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Shierra May Labios', 'rshierra27@gmail.com', '2026-10-09 23:56:27'),
(178, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Lailanie Lavapie', 'lmarcziajazlaine@gmail.com', '2026-10-09 23:56:30'),
(179, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Ginalyn Llorin', 'ginalynllorin25@gmail.com', '2026-10-09 23:56:30'),
(180, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Alina Manaog', 'ahavechaina@gmail.com', '2026-10-09 23:56:31'),
(181, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Joana Maninang', 'garenezekielm@gmail.com', '2026-10-09 23:56:33'),
(182, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Cherissa Mae Monge', 'cherissamae.pagsaligan@gmail.com', '2026-10-09 23:56:33'),
(183, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Mikee Nagrampa', 'Mikee_Nagrampa@yahoo.com', '2026-10-09 23:56:35'),
(184, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Nestle Ann Negrito', 'nestlegarcia09@gmail.com', '2026-10-09 23:56:36'),
(185, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Sarah Jane Oliveros', 'sarahjane.gabarda@gmail.com', '2026-10-09 23:56:37'),
(186, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Regine Ong', 'regine@gmail.com', '2026-10-09 23:56:39'),
(187, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Mcniel Oronan', 'mcnielbarra@yahoo.com', '2026-10-09 23:56:41'),
(188, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Labyrenth Kay Petalver', 'labyrinya@gmail.com', '2026-10-09 23:56:41'),
(189, 1, 'System Admin', 'admin', 'Created account', 'parent', 'May Louise Pili', 'vyanlanz@gmail.com', '2026-10-09 23:56:43'),
(190, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Monette Protomartir', 'monetteprotomartir@gmail.com', '2026-10-09 23:56:44'),
(191, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Marsha Puso', 'marshanaborpuso1621@gmail.com', '2026-10-09 23:56:45'),
(192, 1, 'System Admin', 'admin', 'Created account', 'parent', 'PeÃ±afrancia Rebulado', 'penafranciarebulado@gmail.com', '2026-10-09 23:56:46'),
(193, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Michelle Serdan', 'michelleserdan212@gmail.com', '2026-10-09 23:56:48'),
(194, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Mailyn Sergio', 'mailyn_oliva@yahoo.com', '2026-10-09 23:56:49'),
(195, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Joanna Jean Solsona', 'joannajsolsona@gmail.com', '2026-10-09 23:56:52'),
(196, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Emerose Tan', 'Tanemerose1@gmail.com', '2026-10-09 23:56:53'),
(197, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Vilma Tangelon', 'vilma.iriga@gmail.com', '2026-10-09 23:56:53'),
(198, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Jinky Tubig', 'jinky.tubig@gmail.com', '2026-10-09 23:56:55'),
(199, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Julie Ann Vargas', 'gablie_jules@yahoo.com', '2026-10-09 23:56:56'),
(200, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Lea Katrine Verona', 'lkverona@cspc.edu.ph', '2026-10-09 23:56:57'),
(201, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Daryleen Villamer', 'daryleen@gmail.com', '2026-10-09 23:57:00'),
(202, 1, 'System Admin', 'admin', 'Created account', 'parent', 'Agnes Zorilla', 'agneszorilla@gmail.com', '2026-10-09 23:57:01'),
(203, 1, 'System Admin', 'admin', 'Transferred classes and deactivated teacher', 'teacher', 'Sample Adviser', '1 class', '2026-10-10 00:06:03'),
(204, 1, 'System Admin', 'admin', 'Deactivated account', 'user', 'User ID 19', NULL, '2026-10-10 00:06:05'),
(205, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=ollama', '2026-10-10 00:10:44'),
(206, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Nouns & Verbs Quiz', '6 created, set #11', '2026-10-10 00:11:23'),
(207, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Nouns & Verbs Quiz', 'Grade 1-A · 5 items', '2026-10-10 00:11:40'),
(208, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Nouns & Verbs Quiz', 'token=7bbb4952e01e4447', '2026-10-10 00:11:49'),
(209, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns and Verbs', 'provider=ollama', '2026-10-10 01:22:00'),
(210, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Nouns and Verbs Quiz', '6 created, set #12', '2026-10-10 01:22:25'),
(211, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Nouns and Verbs Quiz', 'Grade 1-A · 5 items', '2026-10-10 01:23:54'),
(212, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Nouns and Verbs Quiz', 'token=44710296d7be8a25', '2026-10-10 01:24:17'),
(213, 2, 'Agnes Cepe', 'teacher', 'Resolved concern', 'concern', NULL, NULL, '2026-10-10 01:30:13'),
(214, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Argill Bonita', 'agnesjoycepe@usant.edu.ph', '2026-10-10 01:33:48'),
(215, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Nouns and Verbs', 'Grade 1-A · 1 items', '2026-10-10 01:51:11'),
(216, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Nouns and Verbs', 'token=672c1fd694e89534', '2026-10-10 01:51:20'),
(217, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'John Carter: Absent (AM)', '2026-10-10 03:18:05'),
(218, 2, 'Agnes Cepe', 'teacher', 'Sent attendance update', 'class', 'Grade 1-A', '1 parent notice · SMS queued 1 · Late/Absent', '2026-10-10 03:18:09'),
(219, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-10 12:17:40'),
(220, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Munting Pagsusulit: Pangngalan at Pandiwa (Grade 1)', '21 created, set #13', '2026-10-10 12:18:32'),
(221, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-10 12:28:29'),
(222, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Plants', 'provider=gemini', '2026-10-10 12:31:39'),
(223, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-10 12:51:34'),
(224, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-10 14:06:32'),
(225, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-11 05:28:58'),
(226, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Nouns and Verbs Quiz', 'Grade 1-A · 5 items', '2026-10-11 05:45:38'),
(227, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'John Carter: Present (PM)', '2026-10-11 05:45:44'),
(228, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Nouns and Verbs Quiz', 'token=ddbeacf6dcd71e9d', '2026-10-11 05:46:03'),
(229, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Math Quiz', 'Grade 1-A · 10 items', '2026-10-11 06:32:11'),
(230, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Math Quiz', 'token=d899801d4919264d', '2026-10-11 06:32:14'),
(231, 2, 'Agnes Cepe', 'teacher', 'Created progress record', 'assessment', 'Plants', 'Grade 1-A · Q1', '2026-10-11 06:34:45'),
(232, 2, 'Agnes Cepe', 'teacher', 'Created classwork set', 'question_bank', 'Plants', 'Grade 1 · subject #13', '2026-10-11 06:35:15'),
(233, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-11 07:37:38'),
(234, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Munting Pagsusulit: Nouns and Verbs', '31 created, set #15', '2026-10-11 07:38:10'),
(235, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Munting Pagsusulit: Nouns and Verbs', 'Grade 1-A · 30 items', '2026-10-11 07:38:28'),
(236, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Munting Pagsusulit: Nouns and Verbs', 'token=86d4ac60733ec3ae', '2026-10-11 07:38:32'),
(237, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Plants', 'provider=gemini', '2026-10-11 08:15:04'),
(238, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Parts of Plants We Eat Quiz', '11 created, set #16', '2026-10-11 08:15:10'),
(239, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Parts of Plants We Eat Quiz', 'Grade 1-A · 10 items', '2026-10-11 08:15:21'),
(240, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Parts of Plants We Eat Quiz', 'token=fdf57584f9e9af23', '2026-10-11 08:15:25'),
(241, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Plants', 'provider=gemini', '2026-10-11 08:26:18'),
(242, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Parts of Plants We Eat Quiz', '11 created, set #17', '2026-10-11 08:26:26'),
(243, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Parts of Plants We Eat Quiz', 'Grade 1-A · 10 items', '2026-10-11 08:26:41'),
(244, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Parts of Plants We Eat Quiz', 'token=b9a3a1ec2cfec6af', '2026-10-11 08:26:44'),
(245, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Plants', 'provider=gemini', '2026-10-11 08:45:21'),
(246, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Parts of Plants We Eat Quiz', '6 created, set #18', '2026-10-11 08:45:25'),
(247, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Parts of Plants We Eat Quiz', 'Grade 1-A · 5 items', '2026-10-11 08:45:40'),
(248, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Parts of Plants We Eat Quiz', 'token=064b997b94f6138d', '2026-10-11 08:45:42'),
(249, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Parts of Plants We Eat Quiz', 'Grade 1-A · 5 items', '2026-10-11 09:02:52'),
(250, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Parts of Plants We Eat Quiz', 'token=94d70f4fd4d7d969', '2026-10-11 09:02:55'),
(251, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 13:25:14'),
(252, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=aa810c4518e7ba84', '2026-10-11 13:25:35'),
(253, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 14:08:50'),
(254, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=1d4b61ef4dfd6980', '2026-10-11 14:08:55'),
(255, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 14:33:45'),
(256, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=1d503e838fc3a9ac', '2026-10-11 14:35:17'),
(257, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 14:35:55'),
(258, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=aad3bb6407df6d13', '2026-10-11 14:37:23'),
(259, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 14:38:30'),
(260, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=588518694736464e', '2026-10-11 14:38:34'),
(261, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 14:43:10'),
(262, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=003851cd8e44503c', '2026-10-11 14:45:17'),
(263, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 14:46:30'),
(264, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=2e69be2db87747a6', '2026-10-11 14:48:09'),
(265, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 14:48:48'),
(266, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=13891ebbb091a65f', '2026-10-11 14:48:51'),
(267, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 15:24:34'),
(268, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=a80cee4d60dc45ca', '2026-10-11 15:24:38'),
(269, 2, 'Agnes Cepe', 'teacher', 'Revoked shared link', 'assessment', 'Activity — Plants', NULL, '2026-10-11 15:28:13'),
(270, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=a80cee4d60dc45ca', '2026-10-11 15:28:14'),
(271, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 15:29:56'),
(272, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=52937fd85c870974', '2026-10-11 15:29:59'),
(273, 2, 'Agnes Cepe', 'teacher', 'Sent attendance update', 'class', 'Grade 1-A', '1 parent notice · SMS queued 1 · Present/Late/Absent', '2026-10-11 15:33:15'),
(274, 2, 'Agnes Cepe', 'teacher', 'Created activity from Classwork', 'assessment', 'Activity — Plants', 'Grade 1-A · 1 items', '2026-10-11 15:53:16'),
(275, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=7506ba53a147920e', '2026-10-11 15:53:20'),
(276, 2, 'Agnes Cepe', 'teacher', 'Revoked shared link', 'assessment', 'Activity — Plants', NULL, '2026-10-11 16:00:47'),
(277, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'John Carter: Present (AM)', '2026-10-11 16:00:58'),
(278, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Activity — Plants', 'token=7506ba53a147920e', '2026-10-11 16:01:06'),
(279, 2, 'Agnes Cepe', 'teacher', 'Created progress record', 'assessment', 'Noun', 'Grade 1-A · Q1', '2026-10-11 16:03:22'),
(280, 2, 'Agnes Cepe', 'teacher', 'Created classwork set', 'question_bank', 'Noun', 'Grade 1 · subject #18', '2026-10-11 16:54:52'),
(281, 2, 'Agnes Cepe', 'teacher', 'Created period exam from Classwork', 'assessment', 'Noun', 'Grade 1-A · 2 items', '2026-10-11 16:54:52'),
(282, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Noun', 'token=dda716f67e87bbdd', '2026-10-11 16:54:55'),
(283, 2, 'Agnes Cepe', 'teacher', 'Generated AI exam', 'lesson_plan', 'UseofNounsVerbsAdjectives (1)', 'sources=1 provider=gemini', '2026-10-11 18:12:53'),
(284, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Parts of Speech Quiz: Nouns, Verbs, and Adjectives', '30 created, set #20', '2026-10-11 18:13:20'),
(285, 2, 'Agnes Cepe', 'teacher', 'Created period exam from Classwork', 'assessment', 'NounsVerbsAdjectives', 'Grade 1-A · 30 items', '2026-10-11 18:13:20'),
(286, 2, 'Agnes Cepe', 'teacher', 'Generated AI exam', 'lesson_plan', 'Cini_Non-DisclosureAgreementForm', 'sources=1 provider=gemini', '2026-10-11 18:24:54'),
(287, 2, 'Agnes Cepe', 'teacher', 'Generated AI exam', 'lesson_plan', 'UseofNounsVerbsAdjectives (1)', 'sources=1 provider=gemini', '2026-10-11 18:27:41'),
(288, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'NounsVerbsAdjectives', '30 created, set #21', '2026-10-11 18:27:55'),
(289, 2, 'Agnes Cepe', 'teacher', 'Created period exam from Classwork', 'assessment', 'Exam — NounsVerbsAdjectives', 'Grade 1-A · 30 items', '2026-10-11 18:28:03'),
(290, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-11 19:00:35'),
(291, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Grade 1 Nouns and Verbs Quiz', '13 created, set #22', '2026-10-11 19:00:47'),
(292, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-11 19:02:04'),
(293, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-12 05:50:27'),
(294, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'IoT', 'provider=gemini', '2026-10-12 05:59:09'),
(295, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'IoT', 'provider=gemini', '2026-10-12 06:01:16'),
(296, 2, 'Agnes Cepe', 'teacher', 'Created classwork set', 'question_bank', 'Title', 'Grade 1 · subject #21', '2026-10-12 07:38:05'),
(297, 2, 'Agnes Cepe', 'teacher', 'Generated AI exam', 'lesson_plan', 'UseofNounsVerbsAdjectives (1)', 'sources=1 provider=gemini', '2026-10-12 07:40:22'),
(298, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Exam', '15 created, set #24', '2026-10-12 07:40:32'),
(299, 2, 'Agnes Cepe', 'teacher', 'Created classwork set', 'question_bank', 'Try to', 'Grade 1 · subject #24 · exam', '2026-10-12 08:03:15'),
(300, 2, 'Agnes Cepe', 'teacher', 'Created classwork set', 'question_bank', 'Eto na', 'Grade 1 · subject #24 · quizzes', '2026-10-12 08:04:01'),
(301, 2, 'Agnes Cepe', 'teacher', 'Created classwork set', 'question_bank', 'Act', 'Grade 1 · subject #19 · activity', '2026-10-12 08:04:15'),
(302, 2, 'Agnes Cepe', 'teacher', 'Generated AI exam', 'lesson_plan', 'IoT', 'sources=1 provider=gemini', '2026-10-12 08:43:11'),
(303, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Exam — IoT', '40 created, set #28', '2026-10-12 08:43:17'),
(304, 2, 'Agnes Cepe', 'teacher', 'Created progress record', 'assessment', 'Dance', 'Grade 1-A · Q1', '2026-10-12 10:46:52'),
(305, 2, 'Agnes Cepe', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-12 12:46:42'),
(306, 2, 'Agnes Cepe', 'teacher', 'Regenerated AI lesson resources', 'lesson_plan', 'Nouns & Verbs', 'provider=gemini', '2026-10-12 12:47:23'),
(307, 2, 'Agnes Cepe', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Grade 1 Science Quiz: IoT Sensors', '15 created, set #29', '2026-10-12 15:50:54'),
(308, 2, 'Agnes Cepe', 'teacher', 'Created quiz from Classwork', 'assessment', 'Grade 1 Science Quiz: IoT Sensors', 'Grade 1-A · 15 items', '2026-10-12 15:51:20'),
(309, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'John Carter: Present (PM)', '2026-10-12 15:51:28'),
(310, 2, 'Agnes Cepe', 'teacher', 'Assigned shared link', 'assessment', 'Grade 1 Science Quiz: IoT Sensors', 'token=352480c911c7d7b0', '2026-10-12 15:51:50'),
(311, 2, 'Agnes Cepe', 'teacher', 'Marked attendance', 'class', 'Grade 1-A', 'John Carter: Present (AM)', '2026-10-12 18:21:18'),
(312, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Alice Johnson', 'alice@usant.edu.ph', '2026-10-13 04:24:05'),
(313, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Jobert Follero', 'jfolero@usant.edu.ph', '2026-10-13 04:55:44'),
(314, 1, 'System Admin', 'admin', 'Updated account info', 'teacher', 'Jobert Follero', 'jfollero@usant.edu.ph', '2026-10-13 04:56:11'),
(315, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Albert Polly', 'albert@usant.edu.ph', '2026-10-13 04:57:32'),
(316, 1, 'System Admin', 'admin', 'Updated teacher assignments', 'teacher', 'Teacher ID 96', NULL, '2026-10-13 04:59:47'),
(317, 1, 'System Admin', 'admin', 'Created account', 'teacher', 'Kyla Tog', 'kyla@usant.edu.ph', '2026-10-13 05:01:56'),
(318, 97, 'Kyla Tog', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'IoT', 'provider=gemini', '2026-10-13 06:29:39'),
(319, 97, 'Kyla Tog', 'teacher', 'Marked attendance', 'class', 'Grade 5-KALAW', 'Eric Tanya: Present', '2026-10-13 06:30:06'),
(320, 97, 'Kyla Tog', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'Grade 3 Science: Introduction to IoT and Smart Devices', '20 created, set #30', '2026-10-13 06:30:31'),
(321, 97, 'Kyla Tog', 'teacher', 'Generated AI lesson resources', 'lesson_plan', 'IoT', 'provider=groq', '2026-10-13 06:59:20'),
(322, 97, 'Kyla Tog', 'teacher', 'Saved AI set to Classwork', 'question_bank', 'IoT Basics Quiz', '20 created, set #31', '2026-10-13 06:59:27'),
(323, 97, 'Kyla Tog', 'teacher', 'Created quiz from Classwork', 'assessment', 'IoT Basics Quiz', 'Grade 5-KALAW · 20 items', '2026-10-13 06:59:49'),
(324, 97, 'Kyla Tog', 'teacher', 'Assigned shared link', 'assessment', 'IoT Basics Quiz', 'token=be1cb50890c27039', '2026-10-13 06:59:52');

-- --------------------------------------------------------

--
-- Table structure for table `ai_recommendations`
--

CREATE TABLE `ai_recommendations` (
  `id` int(11) NOT NULL,
  `lesson_plan_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `grade_level` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `provider` varchar(32) NOT NULL DEFAULT 'mock',
  `source_excerpt` text DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`)),
  `assessment_id` int(11) DEFAULT NULL,
  `approved_type` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_recommendations`
--

INSERT INTO `ai_recommendations` (`id`, `lesson_plan_id`, `teacher_id`, `subject_id`, `grade_level`, `status`, `provider`, `source_excerpt`, `content`, `assessment_id`, `approved_type`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 13, 1, 'approved', 'ollama', 'Lesson title: activity\n\nLesson plan excerpt:\nIT 4112 — Performance Task 3: File System Administration | Page 1 of 28 Republic of the Philippines CAMARINES SUR POLYTECHNIC COLLEGES Nabua, Camarines Sur COLLEGE OF COMPUTING STUDIES PERFORMANCE TASK 3 File System Administration: Provisioning, Partitioning and Mounting Storage IT 4112 — System Administration and Maintenance • Week 4 • Laboratory Name: Section: Date Performed: Date Submitted: Duration: 2 hours 30 minutes Total Points: 100 1 The Situation ISLA VERDE TRADING CORP. — WORK ORDER #IVT-2026-041 Isla Verde Trading Corp. has 40 employees across Sales, Finance and Warehouse. Its single Ubuntu Server has been running on one 25 GB virtual disk since it was set up by a contractor who has since left. Nobody documented anything. Last Tuesday the server started throwing \"No space left on device\" errors. The Finance team could not save month- end reports. Management approved the purchase of two new disks, and they have now been handed to you — still blank, still unpartitioned, still invisible to the operating system. Your job as junior system administrator: bring both disks into service, give each department a properly formatted and mounted storage area, prove that files can be written to each one, then take the storage back offline cleanly at the end of your shift so the Data Center team can move the physical trays. The two disks you have been given Disk Capacity Partition Plan File System Intended Department Storage 1 20 GB 1 partition — full disk ext4 Company archive Storage 2 30 GB Partition 1 — 15 GB ext4 Finance records Partition 2 — remaining ~15 GB NTFS Windows exchange folder WHY NTFS ON A LINUX SERVER? Finance still runs two Windows accounting workstations. Files placed on the NTFS partition can be read directly if that disk is ever moved to a Windows machine. This is a deliberate design decision, not a mistake — and one of the concept questions will ask you to defend it. IT 4112 — Performance Task 3: File Sys', '{\"quiz\":{\"title\":\"File System Administration Quiz\",\"max_score\":10,\"items\":[{\"type\":\"mcq\",\"question\":\"Why was NTFS chosen on the Linux server?\",\"choices\":[\"It is a faster file system.\",\"It is more secure than ext4.\",\"It allows files to be read directly on a Windows machine.\",\"It is only for Linux users.\"],\"answer\":\"It allows files to be read directly on a Windows machine.\",\"points\":2},{\"type\":\"identification\",\"question\":\"What does /dev/sda represent?\",\"answer\":\"The existing system disk.\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"List the two file systems used on the new disks.\",\"answer\":\"ext4, NTFS\",\"points\":3},{\"type\":\"mcq\",\"question\":\"What is the purpose of taking a snapshot before running destructive commands?\",\"choices\":[\"To create a backup of the disk.\",\"To erase the disk completely.\",\"To undo any changes made to the disk.\",\"To increase the disk size.\"],\"answer\":\"To undo any changes made to the disk.\",\"points\":2},{\"type\":\"identification\",\"question\":\"What is the name of the command used to create a partition table on Storage 1?\",\"answer\":\"fdisk\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"List the two partitions created on Storage 2.\",\"answer\":\"Partition 1 - 15 GB, Partition 2 - remaining 15 GB\",\"points\":3},{\"type\":\"mcq\",\"question\":\"What is the purpose of formatting a file system?\",\"choices\":[\"To increase the disk size.\",\"To erase the disk completely.\",\"To create a new partition.\",\"To make the file system usable by the operating system.\"],\"answer\":\"To make the file system usable by the operating system.\",\"points\":2},{\"type\":\"identification\",\"question\":\"What is the name of the command used to mount a partition?\",\"answer\":\"mount\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"List the three file systems mentioned in the task.\",\"answer\":\"ext4, NTFS, Windows\",\"points\":3},{\"type\":\"mcq\",\"question\":\"What is the recommended way to document your work?\",\"choices\":[\"To write a report.\",\"To create a video.\",\"To insert images into a Word document.\",\"To paste text into a document.\"],\"answer\":\"To insert images into a Word document.\",\"points\":2}],\"notes\":\"Make sure to read the device name out loud before running any commands.\"},\"activity\":{\"title\":\"Activity: Explore activity\",\"max_score\":10,\"description\":\"Students work in pairs on a short Grade 1 task about \\\"activity\\\" (Science). They write or draw examples, share with a partner, then present one idea.\",\"notes\":\"Generated from lesson title/objectives (and file text if available).\",\"rubric\":{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}},\"exam\":null}', 1, 'quiz', '2026-10-01 13:27:41', '2026-10-01 13:30:43'),
(3, 2, 2, 13, 1, 'approved', 'ollama', 'Lesson title: Plants\n\nLearning objectives:\nIdentify and understand the different parts of plants we eat.\n\nLesson plan excerpt:\nLesson Title and Summary Parts of Plants We Eat Children will examine the parts of plants and see vegetables, fruits, and seeds that we eat. They will sample a food from each plant part. Learning Goals/Objectives (measurable outcomes) Learning Goal: The children will know that vegetables and fruits are parts of plants. Objectives: 1.The children will be able to name the six parts of plants. 2.The children will be able to name a food from each plant part. Target Grade(s)/Age(s) and Adaptation for other Grades/Ages Target age range: 1 st to 5 th grade Adapt to different ages: Younger Children: Talk in less detail so lesson is shorter and holds their attention. Older Children: Discuss how the soil affects the growth of plants and our food including the difference between slow release natural fertilizers and chemical fertilizers and how chemicals such as pesticides affect the soil, plants, and animals. Lesson Time 45-60 minutes, if less time available, eliminate the story, the song, or the planting depending on group interest and number of adult helpers. Preparation, Space Requirements and Supply List Supplies: Story Book (Plant a Little Seed by Bonnie Christensen), carrots, celery, spinach, lettuce, broccoli or cauliflower, pepper, zucchini, cucumber, sunflower seeds, peanuts, beans, seed packets of these vegetables, low-calorie ranch dressing, muffin cups for dressing, seed packets, plant parts questions from worksheet. Before the lesson, wash and cut vegetables for snack. Lesson Plan Intro/Engage the Students: (3 minutes) What are some of the parts of a plant? (root, stem, leaf, flower, fruit, seeds) What parts of plants do we eat? 1919 NE 78th St, Vancouver, WA 98665, 360-397-6060 Lesson Steps and Activities: (30-45 minutes) 1.Story: Plant a Little Seed by Bonnie Christensen Show vegetables and fruits and discuss the part of the plant. Show ', '{\"quiz\":{\"title\":\"Plant Parts Quiz\",\"max_score\":10,\"items\":[{\"type\":\"mcq\",\"question\":\"What is the function of the root of a plant?\",\"choices\":[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To grow up from the ground and catch the sun.\"],\"answer\":\"To anchor the plant in the ground.\",\"points\":2},{\"type\":\"identification\",\"question\":\"What is the name of the part of the plant that holds the seeds?\",\"answer\":\"Seed\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"Name the three parts of the plant that we use for food: \",\"answer\":\"Fruit, Leaf, and Root\",\"points\":3},{\"type\":\"mcq\",\"question\":\"What is the function of the leaf of a plant?\",\"choices\":[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To breathe the air and catch the sun.\"],\"answer\":\"To breathe the air and catch the sun.\",\"points\":2},{\"type\":\"identification\",\"question\":\"What is the name of the part of the plant that produces flowers?\",\"answer\":\"Flower\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"Name the two parts of the plant that are fruits: \",\"answer\":\"Peppers, Zucchini\",\"points\":3},{\"type\":\"mcq\",\"question\":\"What is the function of the stem of a plant?\",\"choices\":[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To grow up from the ground and catch the sun.\"],\"answer\":\"To grow up from the ground and catch the sun.\",\"points\":2},{\"type\":\"identification\",\"question\":\"What is the name of the part of the plant that is used for planting?\",\"answer\":\"Seed\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"Name the three parts of the plant that we use for food: \",\"answer\":\"Leaf, Root, Fruit\",\"points\":3},{\"type\":\"mcq\",\"question\":\"What is the function of the fruit of a plant?\",\"choices\":[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To hold the seeds and feed the ground.\"],\"answer\":\"To hold the seeds and feed the ground.\",\"points\":2}],\"notes\":\"Make sure to explain each part of the plant to the children and have them practice identifying them.\"},\"activity\":{\"title\":\"Plant Parts Sorting Activity\",\"max_score\":10,\"description\":\"Sort the plant parts into their correct categories: Root, Stem, Leaf, Flower, Fruit, and Seed. Use the pictures and descriptions provided to help you sort.\",\"notes\":\"This activity will help the children practice identifying and understanding the different parts of plants.\",\"rubric\":{\"categories\":[{\"name\":\"Accuracy\",\"max_points\":10,\"levels\":[{\"label\":\"Excellent\",\"points\":10,\"description\":\"All plant parts were correctly sorted into their categories.\"},{\"label\":\"Good\",\"points\":8,\"description\":\"Most plant parts were correctly sorted, but some were incorrect.\"},{\"label\":\"Fair\",\"points\":5,\"description\":\"Some plant parts were correctly sorted, but many were incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Most plant parts were not correctly sorted.\"}]}]}},\"exam\":null}', 3, 'quiz', '2026-10-01 13:30:17', '2026-10-01 13:50:00'),
(7, 4, 2, 13, 1, 'approved', 'ollama', 'Lesson title: PT3\n\nLesson plan excerpt:\nRepublic of the Philippines CAMARINES SUR POLYTECHNIC COLLEGES Nabua, Camarines Sur COLLEGE OF COMPUTING STUDIES PERFORMANCE TASK 3 File System Administration: Provisioning, Partitioning and Mounting Storage IT 4112 — System Administration and Maintenance • Week 4 • Laboratory Name: Agnes Joy T. Cepe Section: BSIT-4C Date Performed: October 1, 2026 Date Submitted: Duration: 2 hours 30 minutes Total Points: 100 1 The Situation ISLA VERDE TRADING CORP. — WORK ORDER #IVT-2026-041 Isla Verde Trading Corp. has 40 employees across Sales, Finance and Warehouse. Its single Ubuntu Server has been running on one 25 GB virtual disk since it was set up by a contractor who has since left. Nobody documented anything. Last Tuesday the server started throwing \"No space left on device\" errors. The Finance team could not save month-end reports. Management approved the purchase of two new disks, and they have now been handed to you — still blank, still unpartitioned, still invisible to the operating system. Your job as junior system administrator: bring both disks into service, give each department a properly formatted and mounted storage area, prove that files can be written to each one, then take the storage back offline cleanly at the end of your shift so the Data Center team can move the physical trays. The two disks you have been given Disk Capacity Partition Plan File System Intended Department Storage 1 20 GB 1 partition — full disk ext4 Company archive Storage 2 30 GB Partition 1 — 15 GB ext4 Finance records Partition 2 — remaining ~15 GB NTFS Windows exchange folder WHY NTFS ON A LINUX SERVER? Finance still runs two Windows accounting workstations. Files placed on the NTFS partition can be read directly if that disk is ever moved to a Windows machine. This is a deliberate design decision, not a mistake — and one of the concept questions will ask you to defend it. IT 4112 — Performance Task 3: File System Administration | Page 1 of 29 2 ', '{\"quiz\":{\"title\":\"File System Administration: Provisioning, Partitioning and Mounting Storage\",\"max_score\":10,\"items\":[{\"type\":\"mcq\",\"question\":\"Why did Isla Verde Trading Corp. choose to use NTFS on their Linux server?\",\"choices\":[\"Because it\'s a Windows file system\",\"Because it\'s a Linux file system\",\"Because it allows files to be read directly on a Windows machine\",\"Because it\'s more secure\"],\"answer\":\"3\",\"points\":1},{\"type\":\"identification\",\"question\":\"What does /dev/sda refer to?\",\"answer\":\"The existing system disk\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List the two file systems used on the new disks\",\"answer\":\"ext4, NTFS\",\"points\":2},{\"type\":\"mcq\",\"question\":\"What is the purpose of taking a snapshot before running destructive commands?\",\"choices\":[\"To create a backup of the disk\",\"To undo any changes made to the disk\",\"To install new software\",\"To upgrade the operating system\"],\"answer\":\"2\",\"points\":1},{\"type\":\"identification\",\"question\":\"What is the purpose of the \'sudo\' command?\",\"answer\":\"To gain superuser privileges\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List the four required screenshots for this task\",\"answer\":\"SS-01, SS-02, SS-03, SS-04\",\"points\":2},{\"type\":\"mcq\",\"question\":\"What is the correct command to list the block device names?\",\"choices\":[\"lsblk\",\"sudo lsblk\",\"sudo -i lsblk\",\"sudo lsblk -l\"],\"answer\":\"2\",\"points\":1},{\"type\":\"identification\",\"question\":\"What is the purpose of the \'mkfs.ext4\' command?\",\"answer\":\"To format a partition with the ext4 file system\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List the two partitions created on Storage 2\",\"answer\":\"Partition 1 - 15 GB, Partition 2 - remaining 15 GB\",\"points\":2},{\"type\":\"mcq\",\"question\":\"What is the correct command to write data to a partition?\",\"choices\":[\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"sudo echo \'Hello World!\' > /dev/sda1\'\",\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"sudo echo \'Hello World!\' > /dev/sda1\"],\"answer\":\"2\",\"points\":1}],\"notes\":\"Make sure to read the device name out loud before running any commands\"},\"activity\":{\"title\":\"Activity: Explore PT3\",\"max_score\":10,\"description\":\"Students work in pairs on a short Grade 1 task about \\\"PT3\\\" (Science). They write or draw examples, share with a partner, then present one idea.\",\"notes\":\"Generated from lesson title/objectives (and file text if available).\",\"rubric\":{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}},\"exam\":null}', 5, 'quiz', '2026-10-02 01:37:18', '2026-10-02 02:10:10'),
(13, 8, 13, 18, 4, 'pending', 'ollama', 'Lesson title: Sample\n\nLesson plan excerpt:\nUse of Nouns, Verbs, and Adjectives Nouns, verbs, and adjectives are parts of speech, or the building blocks for writing complete sentences. Nouns are people, places, or things. Verbs are action words. Adjectives are descriptive words. Nouns  A noun is a part of speech that signifies a person, place, or thing. Example 1: The rabbit read the book. Example 2: Anna visited France. Both “rabbit” and “book” are nouns because they are “things.” They are general words for people, places, or things, so they are improper nouns. “Anna” is a noun because she is a person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the name of a country, so they are proper nouns.  The previous examples are tangible nouns, or things you can touch or hold, but nouns can also be intangible or abstract. This means that they aren’t things you can touch, like feelings. Example 1: Honesty is important. Example 2: He is searching for happiness. “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but they are both still nouns.  Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, and plural nouns refer to more than one. Example 1: She owns a dog. Example 2: She owns two dogs. There is only one dog in the first example, so the noun “dog” remains unchanged. To show that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. Pronouns  Pronouns are words that replace nouns in a sentence. In the following examples, the first example does not have a pronoun and the second one does. Example 1: Jasmine is a princess. Example 2: She is a princess. “She” is a pronoun used to replace the proper noun “Jasmine.”  Example pronouns: Subject Pronouns Object Pronouns I Me We Us You You She Her He Him It It They Them Adjectives  Adjectives describe nouns. They tell us which, what kind, or how many of a certain noun there is. An adject', '{\"quiz\":{\"title\":\"Parts of Speech Quiz\",\"max_score\":5,\"items\":[{\"type\":\"mcq\",\"question\":\"What is a noun?\",\"choices\":[\"A person\",\"A place\",\"A thing\"],\"answer\":\"A thing\",\"points\":1},{\"type\":\"identification\",\"question\":\"What is the part of speech that modifies a noun?\",\"answer\":\"An adjective\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which of the following is a pronoun?\",\"choices\":[\"She\",\"He\",\"It\",\"They\"],\"answer\":\"She\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List the three types of pronouns.\",\"answer\":\"Subject pronouns, object pronouns, and possessive pronouns\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What is the function of a helping verb?\",\"choices\":[\"To modify a noun\",\"To modify a verb\",\"To extend the meaning of a verb\"],\"answer\":\"To extend the meaning of a verb\",\"points\":1}],\"notes\":\"Remember to identify the parts of speech correctly and understand their functions in sentences.\"},\"activity\":{\"title\":\"Parts of Speech Sorting Game\",\"max_score\":3,\"description\":\"Sort the following words into their correct parts of speech categories: noun, adjective, pronoun, and verb.\",\"notes\":\"Work in pairs and use the definitions provided to sort the words correctly.\",\"rubric\":{\"categories\":[{\"name\":\"Noun\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"Correctly identified as a noun\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Identified as a noun, but with some errors\"},{\"label\":\"Fair\",\"points\":0,\"description\":\"Did not identify as a noun\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Incorrectly identified as a noun\"}]},{\"name\":\"Adjective\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"Correctly identified as an adjective\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Identified as an adjective, but with some errors\"},{\"label\":\"Fair\",\"points\":0,\"description\":\"Did not identify as an adjective\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Incorrectly identified as an adjective\"}]},{\"name\":\"Pronoun\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"Correctly identified as a pronoun\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Identified as a pronoun, but with some errors\"},{\"label\":\"Fair\",\"points\":0,\"description\":\"Did not identify as a pronoun\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Incorrectly identified as a pronoun\"}]},{\"name\":\"Verb\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"Correctly identified as a verb\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Identified as a verb, but with some errors\"},{\"label\":\"Fair\",\"points\":0,\"description\":\"Did not identify as a verb\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Incorrectly identified as a verb\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-09 05:22:05', '2026-10-09 05:22:05'),
(15, 9, 2, 12, 1, 'pending', 'ollama', 'Lesson title: math\n\nLesson plan excerpt:\nVISION CSPC envisions a dynamic, inclusive, resilient and globally competitive polytechnic educational institution committed to achieving excellence and advancing innovation that transcends societies in the Bicol region and beyond. MISSION CSPC is highly committed to delivering quality polytechnic education, providing excellent services, and promoting sustainable development and resilience in alignment with legal and statutory requirements, through cutting-edge technological innovation, impactful extension services, robust research culture, efficient resource management, and mutually beneficial partnerships with local and international stakeholders. QUALITY AND ENVIRONMENTAL POLICY CSPC commits to provide the highest standards in total customer satisfaction in accord with legal and other requirements to satisfy current and future needs of clients and stakeholders; uphold good governance conditions; and sustain the integrity of the environment and its resources through continual improvement of its quality and environmental management system. GOALS AND OBJECTIVES Continued Academic Excellence To produce future-ready graduates with professional and social competencies Strengthened Research and Innovation To prioritize the creation of new knowledge and technology through globally responsive and socially relevant research practices towards measurable social progress Engaged Sustainable Communities To engage with local communities in enhancing standards of living as anchored to the Ambisyon Natin 2040 and the UN Sustainable Development Goals Balanced Finances through Production and Resource Generation To capitalize on innovative and self-sustaining business ventures Optimized Digitalization for Good Governance and Operational Excellence To increase organizational productivity and performance through digital migration, good governance principles, and sound management techniques towards enduring economic prosperity CORE VALUES CSPC s', '{\"quiz\":{\"title\":\"Math Quiz\",\"max_score\":10,\"items\":[{\"type\":\"mcq\",\"question\":\"What is the shape of a square?\",\"choices\":[\"Circle\",\"Rectangle\",\"Square\",\"Triangle\"],\"answer\":\"Square\",\"points\":1},{\"type\":\"identification\",\"question\":\"What is the name of the number that comes after 10?\",\"answer\":\"11\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List 3 shapes that are used in art\",\"answer\":\"Circle, Square, Triangle\",\"points\":2},{\"type\":\"mcq\",\"question\":\"What is the sum of 2 + 2?\",\"choices\":[\"3\",\"4\",\"5\",\"6\"],\"answer\":\"4\",\"points\":1},{\"type\":\"identification\",\"question\":\"What is the name of the operation that means to add two numbers together?\",\"answer\":\"Addition\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List 2 types of numbers that are used in math\",\"answer\":\"Whole numbers, Fractions\",\"points\":2},{\"type\":\"mcq\",\"question\":\"What is the product of 3 x 4?\",\"choices\":[\"10\",\"12\",\"15\",\"18\"],\"answer\":\"12\",\"points\":1},{\"type\":\"identification\",\"question\":\"What is the name of the operation that means to subtract one number from another?\",\"answer\":\"Subtraction\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List 3 types of math problems that can be solved using addition\",\"answer\":\"Counting money, Measuring ingredients, Counting toys\",\"points\":2},{\"type\":\"mcq\",\"question\":\"What is the result of 5 - 2?\",\"choices\":[\"3\",\"4\",\"5\",\"6\"],\"answer\":\"3\",\"points\":1}],\"notes\":\"This quiz assesses the student\'s understanding of basic math concepts such as addition, subtraction, and shapes.\"},\"activity\":{\"title\":\"Math Project\",\"max_score\":10,\"description\":\"Create a simple math project that demonstrates your understanding of basic math concepts such as addition, subtraction, and shapes. You can use paper, pencils, and other materials to create your project.\",\"notes\":\"Make sure to include a title page, introduction, and conclusion in your project.\",\"rubric\":{\"categories\":[{\"name\":\"Creativity\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"The project is highly creative and demonstrates a deep understanding of basic math concepts.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"The project is creative and demonstrates a good understanding of basic math concepts.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"The project is somewhat creative and demonstrates a fair understanding of basic math concepts.\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"The project is not creative and demonstrates a poor understanding of basic math concepts.\"}]},{\"name\":\"Accuracy\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"The project accurately demonstrates an understanding of basic math concepts such as addition, subtraction, and shapes.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"The project accurately demonstrates a good understanding of basic math concepts.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"The project somewhat accurately demonstrates a fair understanding of basic math concepts.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"The project does not accurately demonstrate an understanding of basic math concepts.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"The project demonstrates a high level of effort and creativity.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"The project demonstrates a good level of effort and creativity.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"The project somewhat demonstrates a fair level of effort and creativity.\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"The project does not demonstrate a level of effort and creativity.\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-09 05:41:46', '2026-10-09 05:41:46'),
(17, 11, 2, 24, 1, 'pending', 'ollama', 'Lesson title: Nouns and Verbs\n\nLesson plan excerpt:\nUse of Nouns, Verbs, and Adjectives Nouns, verbs, and adjectives are parts of speech, or the building blocks for writing complete sentences. Nouns are people, places, or things. Verbs are action words. Adjectives are descriptive words. Nouns  A noun is a part of speech that signifies a person, place, or thing. Example 1: The rabbit read the book. Example 2: Anna visited France. Both “rabbit” and “book” are nouns because they are “things.” They are general words for people, places, or things, so they are improper nouns. “Anna” is a noun because she is a person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the name of a country, so they are proper nouns.  The previous examples are tangible nouns, or things you can touch or hold, but nouns can also be intangible or abstract. This means that they aren’t things you can touch, like feelings. Example 1: Honesty is important. Example 2: He is searching for happiness. “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but they are both still nouns.  Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, and plural nouns refer to more than one. Example 1: She owns a dog. Example 2: She owns two dogs. There is only one dog in the first example, so the noun “dog” remains unchanged. To show that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. Pronouns  Pronouns are words that replace nouns in a sentence. In the following examples, the first example does not have a pronoun and the second one does. Example 1: Jasmine is a princess. Example 2: She is a princess. “She” is a pronoun used to replace the proper noun “Jasmine.”  Example pronouns: Subject Pronouns Object Pronouns I Me We Us You You She Her He Him It It They Them Adjectives  Adjectives describe nouns. They tell us which, what kind, or how many of a certain noun there is. ', '{\"quiz\":{\"title\":\"Nouns and Verbs Quiz\",\"max_score\":5,\"items\":[{\"type\":\"mcq\",\"question\":\"What is a noun that refers to a person, place, or thing?\",\"choices\":[\"a person\",\"a place\",\"a thing\",\"an action\"],\"answer\":\"a thing\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What is a verb that describes an action or state of being?\",\"choices\":[\"a person\",\"a place\",\"an action\",\"a thing\"],\"answer\":\"an action\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What is an adjective that describes a noun?\",\"choices\":[\"a person\",\"a place\",\"a thing\",\"a feeling\"],\"answer\":\"a feeling\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What is a pronoun that replaces a noun in a sentence?\",\"choices\":[\"a person\",\"a place\",\"a thing\",\"a word\"],\"answer\":\"a word\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What is a verb tense that shows an action that happened in the past?\",\"choices\":[\"present\",\"past\",\"future\",\"present perfect\"],\"answer\":\"past\",\"points\":1}],\"notes\":\"Remember to identify the parts of speech in sentences!\"},\"activity\":{\"title\":\"Nouns and Verbs Sorting Game\",\"max_score\":3,\"description\":\"Sort the following words into their correct categories: nouns, verbs, adjectives, and pronouns. Work with a partner or in a small group.\",\"notes\":\"Encourage students to use their knowledge of parts of speech to make accurate categorizations.\",\"rubric\":{\"categories\":[{\"name\":\"Nouns\",\"max_points\":2,\"levels\":[{\"label\":\"Excellent\",\"points\":2,\"description\":\"All words are correctly identified as nouns.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"Most words are correctly identified as nouns, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":0,\"description\":\"Few words are correctly identified as nouns, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Most words are incorrectly identified as nouns.\"}]},{\"name\":\"Verbs\",\"max_points\":2,\"levels\":[{\"label\":\"Excellent\",\"points\":2,\"description\":\"All words are correctly identified as verbs.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"Most words are correctly identified as verbs, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":0,\"description\":\"Few words are correctly identified as verbs, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Most words are incorrectly identified as verbs.\"}]},{\"name\":\"Adjectives\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"All words are correctly identified as adjectives.\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Most words are correctly identified as adjectives, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":0,\"description\":\"Few words are correctly identified as adjectives, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Most words are incorrectly identified as adjectives.\"}]},{\"name\":\"Pronouns\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"All words are correctly identified as pronouns.\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Most words are correctly identified as pronouns, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":0,\"description\":\"Few words are correctly identified as pronouns, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":0,\"description\":\"Most words are incorrectly identified as pronouns.\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-10 01:22:00', '2026-10-10 01:22:00'),
(24, 5, 2, 18, 1, 'pending', 'gemini', 'Lesson title: Nouns & Verbs\n\nLesson plan excerpt:\nUse of Nouns, Verbs, and Adjectives Nouns, verbs, and adjectives are parts of speech, or the building blocks for writing complete sentences. Nouns are people, places, or things. Verbs are action words. Adjectives are descriptive words. Nouns  A noun is a part of speech that signifies a person, place, or thing. Example 1: The rabbit read the book. Example 2: Anna visited France. Both “rabbit” and “book” are nouns because they are “things.” They are general words for people, places, or things, so they are improper nouns. “Anna” is a noun because she is a person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the name of a country, so they are proper nouns.  The previous examples are tangible nouns, or things you can touch or hold, but nouns can also be intangible or abstract. This means that they aren’t things you can touch, like feelings. Example 1: Honesty is important. Example 2: He is searching for happiness. “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but they are both still nouns.  Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, and plural nouns refer to more than one. Example 1: She owns a dog. Example 2: She owns two dogs. There is only one dog in the first example, so the noun “dog” remains unchanged. To show that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. Pronouns  Pronouns are words that replace nouns in a sentence. In the following examples, the first example does not have a pronoun and the second one does. Example 1: Jasmine is a princess. Example 2: She is a princess. “She” is a pronoun used to replace the proper noun “Jasmine.”  Example pronouns: Subject Pronouns Object Pronouns I Me We Us You You She Her He Him It It They Them Adjectives  Adjectives describe nouns. They tell us which, what kind, or how many of a certain noun there is. An', '{\"quiz\":{\"title\":\"Munting Pagsusulit: Nouns and Verbs\",\"max_score\":60,\"items\":[{\"type\":\"true_false\",\"question\":\"Nouns are words that name people, places, or things.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Verbs are descriptive words that modify nouns.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"The word \'France\' is a proper noun because it is the name of a place.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Honesty and happiness are tangible nouns that you can hold in your hand.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Singular nouns refer to only one person, place, or thing.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Pronouns are words that replace nouns in a sentence.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Verbs indicate _____ or a state of being in sentences.\",\"choices\":[\"action\",\"place\",\"color\"],\"answer\":\"action\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"To show that there are multiple dogs, an _____ is added to the end of the word.\",\"choices\":[\"s\",\"ed\",\"ing\"],\"answer\":\"s\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Anna is a noun because she is a _____.\",\"choices\":[\"person\",\"thing\",\"place\"],\"answer\":\"person\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"In the sentence \'Batman drives the Batmobile,\' the word \'drives\' is a _____.\",\"choices\":[\"verb\",\"noun\",\"pronoun\"],\"answer\":\"verb\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Words like \'she\' or \'he\' that take the place of a noun are called _____.\",\"choices\":[\"pronouns\",\"adverbs\",\"places\"],\"answer\":\"pronouns\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Words that describe how verbs are done are called _____.\",\"choices\":[\"adverbs\",\"nouns\",\"objects\"],\"answer\":\"adverbs\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the word to its correct part of speech.\",\"choices\":[\"rabbit | noun\",\"drives | verb\",\"loudly | adverb\"],\"answer\":\"rabbit | noun; drives | verb; loudly | adverb\",\"points\":3},{\"type\":\"matching\",\"question\":\"Match each noun to its specific category.\",\"choices\":[\"Anna | person\",\"France | place\",\"book | thing\"],\"answer\":\"Anna | person; France | place; book | thing\",\"points\":3},{\"type\":\"matching\",\"question\":\"Match the noun to its noun form.\",\"choices\":[\"Anna | proper noun\",\"rabbit | improper noun\",\"honesty | abstract noun\"],\"answer\":\"Anna | proper noun; rabbit | improper noun; honesty | abstract noun\",\"points\":3},{\"type\":\"matching\",\"question\":\"Match the noun to whether it is singular or plural.\",\"choices\":[\"dog | singular\",\"dogs | plural\",\"castle | singular\"],\"answer\":\"dog | singular; dogs | plural; castle | singular\",\"points\":3},{\"type\":\"matching\",\"question\":\"Match the pronoun to its pronoun type.\",\"choices\":[\"She | subject pronoun\",\"Him | object pronoun\",\"They | subject pronoun\"],\"answer\":\"She | subject pronoun; Him | object pronoun; They | subject pronoun\",\"points\":3},{\"type\":\"matching\",\"question\":\"Match the verb form to what it indicates in time.\",\"choices\":[\"throws | current action\",\"threw | past action\",\"was throwing | past verb phrase\"],\"answer\":\"throws | current action; threw | past action; was throwing | past verb phrase\",\"points\":3},{\"type\":\"sequencing\",\"question\":\"Arrange the parts of speech in the sentence: \'Batman drives the Batmobile.\'\",\"choices\":[\"Subject noun (Batman)\",\"Action verb (drives)\",\"Object noun (Batmobile)\"],\"answer\":\"Subject noun (Batman) | Action verb (drives) | Object noun (Batmobile)\",\"points\":3},{\"type\":\"sequencing\",\"question\":\"Arrange the steps to make the singular noun \'dog\' into a plural noun.\",\"choices\":[\"Start with the singular noun dog\",\"Add the letter s to the end\",\"Form the plural noun dogs\"],\"answer\":\"Start with the singular noun dog | Add the letter s to the end | Form the plural noun dogs\",\"points\":3},{\"type\":\"sequencing\",\"question\":\"Arrange the steps to replace a proper noun with a pronoun.\",\"choices\":[\"Identify the proper noun Jasmine\",\"Choose the subject pronoun She\",\"Form the sentence She is a princess\"],\"answer\":\"Identify the proper noun Jasmine | Choose the subject pronoun She | Form the sentence She is a princess\",\"points\":3},{\"type\":\"sequencing\",\"question\":\"Arrange the words in order for the phrase: \'big blue castle\'.\",\"choices\":[\"First adjective (big)\",\"Second adjective (blue)\",\"Modified noun (castle)\"],\"answer\":\"First adjective (big) | Second adjective (blue) | Modified noun (castle)\",\"points\":3},{\"type\":\"sequencing\",\"question\":\"Arrange the parts of speech in the sentence: \'The girl hugged the boy.\'\",\"choices\":[\"Subject noun (The girl)\",\"Action verb (hugged)\",\"Object noun (the boy)\"],\"answer\":\"Subject noun (The girl) | Action verb (hugged) | Object noun (the boy)\",\"points\":3},{\"type\":\"sequencing\",\"question\":\"Arrange the components of the verb phrase: \'Thor was throwing the hammer.\'\",\"choices\":[\"Subject (Thor)\",\"Helping verb (was)\",\"Main action verb (throwing)\"],\"answer\":\"Subject (Thor) | Helping verb (was) | Main action verb (throwing)\",\"points\":3},{\"type\":\"short_answer\",\"question\":\"What is a noun according to the lesson?\",\"choices\":null,\"answer\":\"A noun is a part of speech that names a person, place, or thing. It can also name abstract feelings like honesty and happiness.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"What is a verb? Give one example of an action verb from the lesson.\",\"choices\":null,\"answer\":\"A verb indicates an action or a state of being in a sentence. An example from the lesson is \'drives\' in the sentence \'Batman drives the Batmobile.\'\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"What is the difference between a singular noun and a plural noun?\",\"choices\":null,\"answer\":\"A singular noun refers to only one person, place, or thing, such as \'dog\'. A plural noun refers to more than one, such as \'dogs\' with an \'s\' added to the end.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"What is a proper noun? Mention one person or place from the lesson as an example.\",\"choices\":null,\"answer\":\"A proper noun is a specific name of a person or a place. Examples from the lesson are \'Anna\' for a person\'s name and \'France\' for a country\'s name.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"What does a pronoun do in a sentence?\",\"choices\":null,\"answer\":\"A pronoun replaces a noun in a sentence. For example, the pronoun \'she\' can replace the proper noun \'Jasmine.\'\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"What do adverbs do to verbs in a sentence?\",\"choices\":null,\"answer\":\"Adverbs modify verbs by describing how actions were done. For example, in the lesson, \'beautifully\' describes how Beyoncé sang.\",\"points\":2}],\"notes\":\"Read the questions aloud for Grade 1 pupils. Provide visual aids or concrete grammar symbol cards (black triangle for nouns, red circle for verbs) during review.\"},\"activity\":{\"title\":\"Grammar Sorting Baskets: Nouns and Verbs\",\"max_score\":20,\"description\":\"1. Lay out a Montessori work mat with two labeled sorting baskets: \'Nouns (People, Places, Things)\' and \'Verbs (Action Words)\'.\\n2. Distribute word and picture cards taken directly from the lesson (e.g., rabbit, book, France, drives, jumped, caught, sings, castle).\\n3. In pairs or small groups, learners take turns reading a card aloud and placing it into the correct basket.\\n4. When sorting is complete, pupils check their work with a partner by naming whether the item is a person/place/thing or an action.\",\"notes\":\"Prepare Montessori grammar symbol cutouts (black triangle for nouns, red sphere/circle for verbs) to help early readers classify the cards tactilely.\",\"rubric\":{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly classifies all noun and verb cards into the matching baskets without errors.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Classifies most cards correctly with only 1 to 2 minor sorting mistakes.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Classifies half of the cards correctly but requires prompting from peers or teacher.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Struggles to differentiate between nouns and verbs; needs direct teacher guidance.\"}]},{\"name\":\"Participation and Focus\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Actively engages throughout the entire sorting activity and eagerly takes turns.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Participates willingly in most turns with minor reminders to stay on task.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Participates only when directly called upon by the teacher or partner.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Shows little interest in sorting cards and becomes easily distracted.\"}]},{\"name\":\"Montessori Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles cards and baskets gently, keeps the mat neat, and packs away properly.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials with care with only minor reminders to tidy the work mat.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Leaves materials scattered on the mat until prompted to clean up.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Mishandles cards or baskets and leaves the workspace unorganized.\"}]},{\"name\":\"Collaboration and Peer Communication\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Communicates kindly, listens attentively, and helps partner verify card placement.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Shares materials well and communicates respectfully with their partner.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Works alongside partner but does not discuss or verify card choices together.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Has difficulty sharing the baskets or taking turns with partner.\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-11 07:37:38', '2026-10-11 07:37:38');
INSERT INTO `ai_recommendations` (`id`, `lesson_plan_id`, `teacher_id`, `subject_id`, `grade_level`, `status`, `provider`, `source_excerpt`, `content`, `assessment_id`, `approved_type`, `created_at`, `updated_at`) VALUES
(27, 2, 2, 13, 1, 'pending', 'gemini', 'Lesson title: Plants\n\nLearning objectives:\nIdentify and understand the different parts of plants we eat.\n\nLesson plan excerpt:\nLesson Title and Summary Parts of Plants We Eat Children will examine the parts of plants and see vegetables, fruits, and seeds that we eat. They will sample a food from each plant part. Learning Goals/Objectives (measurable outcomes) Learning Goal: The children will know that vegetables and fruits are parts of plants. Objectives: 1.The children will be able to name the six parts of plants. 2.The children will be able to name a food from each plant part. Target Grade(s)/Age(s) and Adaptation for other Grades/Ages Target age range: 1 st to 5 th grade Adapt to different ages: Younger Children: Talk in less detail so lesson is shorter and holds their attention. Older Children: Discuss how the soil affects the growth of plants and our food including the difference between slow release natural fertilizers and chemical fertilizers and how chemicals such as pesticides affect the soil, plants, and animals. Lesson Time 45-60 minutes, if less time available, eliminate the story, the song, or the planting depending on group interest and number of adult helpers. Preparation, Space Requirements and Supply List Supplies: Story Book (Plant a Little Seed by Bonnie Christensen), carrots, celery, spinach, lettuce, broccoli or cauliflower, pepper, zucchini, cucumber, sunflower seeds, peanuts, beans, seed packets of these vegetables, low-calorie ranch dressing, muffin cups for dressing, seed packets, plant parts questions from worksheet. Before the lesson, wash and cut vegetables for snack. Lesson Plan Intro/Engage the Students: (3 minutes) What are some of the parts of a plant? (root, stem, leaf, flower, fruit, seeds) What parts of plants do we eat? 1919 NE 78th St, Vancouver, WA 98665, 360-397-6060 Lesson Steps and Activities: (30-45 minutes) 1.Story: Plant a Little Seed by Bonnie Christensen Show vegetables and fruits and discuss the part of the plant. Show ', '{\"quiz\":{\"title\":\"Parts of Plants We Eat Quiz\",\"max_score\":5,\"items\":[{\"type\":\"identification\",\"question\":\"What plant part is a crunchy orange carrot that grows under the ground?\",\"choices\":[\"water\"],\"answer\":\"root\",\"points\":1},{\"type\":\"identification\",\"question\":\"What plant part is green celery that carries water up like an elevator?\",\"choices\":[\"sun\"],\"answer\":\"stem\",\"points\":1},{\"type\":\"identification\",\"question\":\"What plant part catches the sunlight to make food, like fresh spinach?\",\"choices\":[\"soil\"],\"answer\":\"leaf\",\"points\":1},{\"type\":\"identification\",\"question\":\"What plant part holds the seeds inside, like a cucumber or pepper?\",\"choices\":[\"pollen\"],\"answer\":\"fruit\",\"points\":1},{\"type\":\"identification\",\"question\":\"What tiny plant part is buried in the earth to grow a new plant, like a bean?\",\"choices\":[\"sprout\"],\"answer\":\"seed\",\"points\":1}],\"notes\":\"Read each question aloud for Grade 1 emergent readers and encourage phonetic spelling.\"},\"activity\":{\"title\":\"Parts of Plants Sorting Tray\",\"max_score\":10,\"description\":\"1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.\",\"notes\":\"Remind learners of Grace and Courtesy when handling food and using sorting tongs gently.\",\"rubric\":{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-11 08:45:21', '2026-10-11 08:45:21'),
(28, 12, 2, 23, 1, 'pending', 'gemini', 'Lesson title: UseofNounsVerbsAdjectives (1)\n\nLesson plan excerpt:\nUse of Nouns, Verbs, and Adjectives Nouns, verbs, and adjectives are parts of speech, or the building blocks for writing complete sentences. Nouns are people, places, or things. Verbs are action words. Adjectives are descriptive words. Nouns  A noun is a part of speech that signifies a person, place, or thing. Example 1: The rabbit read the book. Example 2: Anna visited France. Both “rabbit” and “book” are nouns because they are “things.” They are general words for people, places, or things, so they are improper nouns. “Anna” is a noun because she is a person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the name of a country, so they are proper nouns.  The previous examples are tangible nouns, or things you can touch or hold, but nouns can also be intangible or abstract. This means that they aren’t things you can touch, like feelings. Example 1: Honesty is important. Example 2: He is searching for happiness. “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but they are both still nouns.  Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, and plural nouns refer to more than one. Example 1: She owns a dog. Example 2: She owns two dogs. There is only one dog in the first example, so the noun “dog” remains unchanged. To show that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. Pronouns  Pronouns are words that replace nouns in a sentence. In the following examples, the first example does not have a pronoun and the second one does. Example 1: Jasmine is a princess. Example 2: She is a princess. “She” is a pronoun used to replace the proper noun “Jasmine.”  Example pronouns: Subject Pronouns Object Pronouns I Me We Us You You She Her He Him It It They Them Adjectives  Adjectives describe nouns. They tell us which, what kind, or how many of a certain n', '{\"quiz\":{\"title\":\"Parts of Speech Quiz: Nouns, Verbs, and Adjectives\",\"max_score\":30,\"items\":[{\"type\":\"mcq\",\"question\":\"What is a noun?\",\"choices\":[\"A person, place, or thing\",\"An action word\",\"A word that modifies verbs\",\"A connecting word\"],\"answer\":\"A person, place, or thing\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which of these words is an action verb?\",\"choices\":[\"drives\",\"castle\",\"blue\",\"happiness\"],\"answer\":\"drives\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which word is an adjective that describes a noun?\",\"choices\":[\"big\",\"rabbit\",\"France\",\"hugged\"],\"answer\":\"big\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What kind of word replaces a noun in a sentence?\",\"choices\":[\"Pronoun\",\"Verb\",\"Adjective\",\"Adverb\"],\"answer\":\"Pronoun\",\"points\":1},{\"type\":\"true_false\",\"question\":\"A singular noun refers to only one person, place, or thing.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Proper nouns are general words for things like \'rabbit\' and \'book\'.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Adjectives tell us which, what kind, or how many of a noun there is.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Adverbs modify nouns instead of verbs.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Adding an _____ to the end of \'dog\' makes it plural.\",\"choices\":[\"s\",\"ed\",\"ing\",\"ly\"],\"answer\":\"s\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Verbs are _____ words.\",\"choices\":[\"action\",\"naming\",\"feeling\",\"slow\"],\"answer\":\"action\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Adjectives are _____ words that describe nouns.\",\"choices\":[\"descriptive\",\"action\",\"silent\",\"proper\"],\"answer\":\"descriptive\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Pronouns like \'she\' are used to _____ nouns.\",\"choices\":[\"replace\",\"remove\",\"count\",\"spell\"],\"answer\":\"replace\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match each word from the lesson to its part of speech.\",\"choices\":[\"France | Proper noun\",\"jumps | Verb\",\"blonde | Adjective\"],\"answer\":\"France | Proper noun; jumps | Verb; blonde | Adjective\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the pronoun type to its example.\",\"choices\":[\"Subject pronoun | She\",\"Object pronoun | Him\",\"Plural noun | Dogs\"],\"answer\":\"Subject pronoun | She; Object pronoun | Him; Plural noun | Dogs\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the noun to its noun category.\",\"choices\":[\"book | Tangible noun\",\"honesty | Abstract noun\",\"Anna | Proper noun\"],\"answer\":\"book | Tangible noun; honesty | Abstract noun; Anna | Proper noun\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the word to what it does.\",\"choices\":[\"Verb | Shows action\",\"Adjective | Modifies a noun\",\"Adverb | Modifies a verb\"],\"answer\":\"Verb | Shows action; Adjective | Modifies a noun; Adverb | Modifies a verb\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the words in order to form the sentence from the lesson.\",\"choices\":[\"The rabbit\",\"read\",\"the book.\"],\"answer\":\"The rabbit | read | the book.\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the words in order to show how \'Thor\' throws a hammer.\",\"choices\":[\"Thor\",\"throws\",\"the hammer.\"],\"answer\":\"Thor | throws | the hammer.\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the actions in order as Thor did them in the lesson.\",\"choices\":[\"Thor\",\"jumped\",\"and caught\",\"the hammer.\"],\"answer\":\"Thor | jumped | and caught | the hammer.\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the words in order to show a girl\'s description.\",\"choices\":[\"The intelligent girl\",\"is\",\"tall.\"],\"answer\":\"The intelligent girl | is | tall.\",\"points\":1},{\"type\":\"identification\",\"question\":\"What do we call nouns that you can touch or hold?\",\"choices\":[\"tense\",\"phrase\"],\"answer\":\"tangible nouns\",\"points\":1},{\"type\":\"identification\",\"question\":\"What do we call nouns like \'honesty\' and \'happiness\' that are feelings or concepts you cannot touch?\",\"choices\":[\"plural\",\"modifier\"],\"answer\":\"abstract nouns\",\"points\":1},{\"type\":\"identification\",\"question\":\"What part of speech describes how verbs or actions were done?\",\"choices\":[\"object\",\"subject\"],\"answer\":\"adverbs\",\"points\":1},{\"type\":\"identification\",\"question\":\"What kind of verbs help to extend the meaning of verbs already used in a sentence?\",\"choices\":[\"proper\",\"singular\"],\"answer\":\"helping verbs\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"Name three parts of speech mentioned as building blocks for sentences in the lesson.\",\"choices\":null,\"answer\":\"Accept any 3: Nouns, Verbs, Adjectives, Pronouns, Adverbs (Score 1 point if three correct parts of speech are listed).\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"Give two examples of subject pronouns listed in the lesson.\",\"choices\":null,\"answer\":\"Any two of: I, We, You, She, He, It, They (Score 1 point for two correct subject pronouns).\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List two helping verbs from the lesson.\",\"choices\":null,\"answer\":\"Any two of: is, was, am, are, were, been, be, can, has, shall, will, do, does, did, have, should, may, might, would, must, could, had (Score 1 point for two correct helping verbs).\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"What is the difference between a singular noun and a plural noun according to the lesson?\",\"choices\":null,\"answer\":\"A singular noun refers to only one person, place, or thing. A plural noun refers to more than one person, place, or thing.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"Why are adjectives useful in writing?\",\"choices\":null,\"answer\":\"Adjectives describe nouns and tell what kind, which, or how many there are. They help readers visualize and understand what an author has written.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"How does a verb tense show when an action happens?\",\"choices\":null,\"answer\":\"A verb tense shows if an action is currently happening, like \'throws\', or if it already happened in the past, like \'threw\'.\",\"points\":1}],\"notes\":\"Read each question aloud to Grade 1 learners and guide them to identify word functions using familiar classroom objects or Montessori grammar symbols (black triangle for noun, red circle for verb, dark blue triangle for adjective).\"},\"activity\":{\"title\":\"Montessori Grammar Sorting Tray: People, Places, Actions, and Describers\",\"max_score\":10,\"description\":\"1. Provide learners with three labeled sorting boxes or mats: \'Nouns\' (black triangle), \'Verbs\' (red circle), and \'Adjectives\' (dark blue triangle).\\n2. Hand out word-and-picture cards derived from the lesson (e.g., \'rabbit\', \'book\', \'castle\', \'drives\', \'hugged\', \'jumped\', \'big\', \'blue\', \'tall\').\\n3. In pairs, students read the card, say what the word does, and place it into the correct category mat.\\n4. Students choose one noun, one adjective, and one verb to make a simple oral sentence (e.g., \'The big rabbit jumped\').\\n5. Teacher conducts a brief three-period lesson check to confirm understanding of each part of speech.\",\"notes\":\"Use Montessori color-coded symbols to reinforce tactile recognition for early readers.\",\"rubric\":{\"categories\":[{\"name\":\"Sorting Correctness\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly sorts all cards into Nouns, Verbs, and Adjectives with zero or one minor error.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly sorts most cards with two to three minor errors.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Sorts half of the cards correctly with peer or teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs frequent guidance and misidentifies most parts of speech.\"}]},{\"name\":\"Sentence Formation & Collaboration\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Creates a complete oral sentence using a noun, verb, and adjective smoothly while sharing cards nicely.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Forms a simple sentence with slight prompting and works cooperatively.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Attempts a sentence but misses one part of speech; needs reminders to take turns.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Struggles to form a sentence and requires continuous direct supervision.\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-11 18:12:53', '2026-10-11 18:12:53'),
(30, 14, 2, 23, 1, 'pending', 'gemini', 'Lesson title: UseofNounsVerbsAdjectives (1)\n\nLesson plan excerpt:\nUse of Nouns, Verbs, and Adjectives Nouns, verbs, and adjectives are parts of speech, or the building blocks for writing complete sentences. Nouns are people, places, or things. Verbs are action words. Adjectives are descriptive words. Nouns  A noun is a part of speech that signifies a person, place, or thing. Example 1: The rabbit read the book. Example 2: Anna visited France. Both “rabbit” and “book” are nouns because they are “things.” They are general words for people, places, or things, so they are improper nouns. “Anna” is a noun because she is a person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the name of a country, so they are proper nouns.  The previous examples are tangible nouns, or things you can touch or hold, but nouns can also be intangible or abstract. This means that they aren’t things you can touch, like feelings. Example 1: Honesty is important. Example 2: He is searching for happiness. “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but they are both still nouns.  Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, and plural nouns refer to more than one. Example 1: She owns a dog. Example 2: She owns two dogs. There is only one dog in the first example, so the noun “dog” remains unchanged. To show that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. Pronouns  Pronouns are words that replace nouns in a sentence. In the following examples, the first example does not have a pronoun and the second one does. Example 1: Jasmine is a princess. Example 2: She is a princess. “She” is a pronoun used to replace the proper noun “Jasmine.”  Example pronouns: Subject Pronouns Object Pronouns I Me We Us You You She Her He Him It It They Them Adjectives  Adjectives describe nouns. They tell us which, what kind, or how many of a certain n', '{\"quiz\":{\"title\":\"Use of Nouns, Verbs, and Adjectives Quiz\",\"max_score\":30,\"items\":[{\"type\":\"mcq\",\"question\":\"What is a noun?\",\"choices\":[\"A person, place, or thing\",\"An action word\",\"A descriptive word\",\"A helping word\"],\"answer\":\"A person, place, or thing\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which word is a verb that shows action?\",\"choices\":[\"drives\",\"rabbit\",\"castle\",\"blue\"],\"answer\":\"drives\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What do adjectives do in a sentence?\",\"choices\":[\"Describe nouns\",\"Show actions\",\"Replace names\",\"End sentences\"],\"answer\":\"Describe nouns\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which word is a proper noun?\",\"choices\":[\"France\",\"book\",\"dog\",\"girl\"],\"answer\":\"France\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Singular nouns name only one person, place, or thing.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Adverbs modify nouns.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Pronouns are words that replace nouns.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Happiness is a noun you can touch and hold with your hands.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Adding an s to the word dog makes it _____.\",\"choices\":[\"plural\",\"singular\",\"verb\"],\"answer\":\"plural\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"In the sentence \'She is a princess\', the word She is a _____.\",\"choices\":[\"pronoun\",\"adverb\",\"place\"],\"answer\":\"pronoun\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Verbs indicate action or _____ of being.\",\"choices\":[\"state\",\"color\",\"thing\"],\"answer\":\"state\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"In the phrase \'big blue castle\', the words big and blue are _____.\",\"choices\":[\"adjectives\",\"nouns\",\"pronouns\"],\"answer\":\"adjectives\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the part of speech to its job.\",\"choices\":[\"Noun | Person, place, or thing\",\"Verb | Action or state of being\",\"Adjective | Describes a noun\"],\"answer\":\"Noun | Person, place, or thing; Verb | Action or state of being; Adjective | Describes a noun\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the word to its noun category.\",\"choices\":[\"Anna | Person\",\"France | Place\",\"Book | Thing\"],\"answer\":\"Anna | Person; France | Place; Book | Thing\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match each word from the lesson to its correct label.\",\"choices\":[\"Rabbit | Improper noun\",\"Honesty | Abstract noun\",\"Dogs | Plural noun\"],\"answer\":\"Rabbit | Improper noun; Honesty | Abstract noun; Dogs | Plural noun\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match each pronoun type to its example.\",\"choices\":[\"Subject pronoun | She\",\"Object pronoun | Him\",\"Plural subject pronoun | We\"],\"answer\":\"Subject pronoun | She; Object pronoun | Him; Plural subject pronoun | We\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the words in order to make a complete sentence from the lesson.\",\"choices\":[\"The rabbit\",\"read\",\"the book.\"],\"answer\":\"The rabbit | read | the book.\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the words in order to build the sentence about Batman.\",\"choices\":[\"Batman\",\"drives\",\"the Batmobile.\"],\"answer\":\"Batman | drives | the Batmobile.\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Arrange the steps to show how a singular noun becomes plural.\",\"choices\":[\"Start with singular noun dog\",\"Add the letter s\",\"Get plural noun dogs\"],\"answer\":\"Start with singular noun dog | Add the letter s | Get plural noun dogs\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the words in order to describe the castle.\",\"choices\":[\"big\",\"blue\",\"castle\"],\"answer\":\"big | blue | castle\",\"points\":1},{\"type\":\"identification\",\"question\":\"Identify the word from the lesson that means a noun you can touch or hold.\",\"choices\":[\"loudly\",\"jumped\"],\"answer\":\"tangible\",\"points\":1},{\"type\":\"identification\",\"question\":\"Identify the part of speech that describes how actions are done.\",\"choices\":[\"quiet\",\"castle\"],\"answer\":\"adverb\",\"points\":1},{\"type\":\"identification\",\"question\":\"Identify the word that replaces the girl in \'She hugged him\'.\",\"choices\":[\"singing\",\"drives\"],\"answer\":\"She\",\"points\":1},{\"type\":\"identification\",\"question\":\"Identify the specific country name that is used as a proper noun in the lesson.\",\"choices\":[\"rabbit\",\"hammer\"],\"answer\":\"France\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"Name three parts of speech introduced in the title of our lesson.\",\"choices\":null,\"answer\":\"Accept: Nouns, Verbs, Adjectives (1 point for listing all three correctly).\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"Name three things a noun can signify according to the lesson.\",\"choices\":null,\"answer\":\"Accept: Person, Place, Thing (1 point for listing these three).\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"List two helping verbs mentioned in the lesson.\",\"choices\":null,\"answer\":\"Accept any two of: is, are, was, were, am, been, be, can, has, shall, will, do, does, did, have, should, may, might, being, would, must, could, had.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"What is the difference between a singular noun and a plural noun?\",\"choices\":null,\"answer\":\"A singular noun refers to only one person, place, or thing. A plural noun refers to more than one person, place, or thing, often by adding an s.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"Why do writers use adjectives in their sentences?\",\"choices\":null,\"answer\":\"Writers use adjectives to describe nouns. They help readers visualize and understand what an author has written by telling what kind, which, or how many.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"How do helping verbs help an action verb in a sentence?\",\"choices\":null,\"answer\":\"Helping verbs help extend the meaning of action verbs. They give further context, such as showing when the action takes place in the present or past.\",\"points\":1}],\"notes\":\"Read each item clearly to Grade 1 learners and allow ample time to point or circle answers.\"},\"activity\":{\"title\":\"Montessori Parts of Speech Sorting Cards\",\"max_score\":10,\"description\":\"1. The teacher places three labeled Montessori sorting trays or mats on the carpet: \'Noun\' (Black Triangle), \'Verb\' (Red Circle), and \'Adjective\' (Dark Blue Triangle).\\n2. Each small group receives 6 picture-word cards taken directly from the lesson (rabbit, France, drives, threw, big, blue).\\n3. Children take turns selecting a card, reading the word aloud, and placing it into the correct tray.\\n4. Groups present their sorted trays to the class, sharing why each word belongs to that part of speech.\",\"notes\":\"Use tactile Montessori grammar symbols (black triangle for noun, red circle for verb, dark blue triangle for adjective) to reinforce hands-on learning.\",\"rubric\":{\"categories\":[{\"name\":\"Correctness\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly sorts all 6 cards into the appropriate part of speech tray.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly sorts 4 to 5 cards with minimal guidance.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly sorts 2 to 3 cards with teacher assistance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Struggles to sort cards correctly even with guidance.\"}]},{\"name\":\"Participation and Collaboration\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Enthusiastically handles Montessori materials, takes turns gracefully, and speaks clearly.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Cooperates well with peers and handles materials gently most of the time.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Participates with occasional reminders to share and handle materials gently.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Requires continuous supervision to take turns and engage in the activity.\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-11 18:27:41', '2026-10-11 18:27:41'),
(31, 5, 2, 18, 1, 'pending', 'gemini', 'Lesson title: Nouns & Verbs\n\nLesson plan excerpt:\nUse of Nouns, Verbs, and Adjectives Nouns, verbs, and adjectives are parts of speech, or the building blocks for writing complete sentences. Nouns are people, places, or things. Verbs are action words. Adjectives are descriptive words. Nouns  A noun is a part of speech that signifies a person, place, or thing. Example 1: The rabbit read the book. Example 2: Anna visited France. Both “rabbit” and “book” are nouns because they are “things.” They are general words for people, places, or things, so they are improper nouns. “Anna” is a noun because she is a person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the name of a country, so they are proper nouns.  The previous examples are tangible nouns, or things you can touch or hold, but nouns can also be intangible or abstract. This means that they aren’t things you can touch, like feelings. Example 1: Honesty is important. Example 2: He is searching for happiness. “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but they are both still nouns.  Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, and plural nouns refer to more than one. Example 1: She owns a dog. Example 2: She owns two dogs. There is only one dog in the first example, so the noun “dog” remains unchanged. To show that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. Pronouns  Pronouns are words that replace nouns in a sentence. In the following examples, the first example does not have a pronoun and the second one does. Example 1: Jasmine is a princess. Example 2: She is a princess. “She” is a pronoun used to replace the proper noun “Jasmine.”  Example pronouns: Subject Pronouns Object Pronouns I Me We Us You You She Her He Him It It They Them Adjectives  Adjectives describe nouns. They tell us which, what kind, or how many of a certain noun there is. An', '{\"quiz\":{\"title\":\"Grade 1 Nouns and Verbs Quiz\",\"max_score\":15,\"items\":[{\"type\":\"mcq\",\"question\":\"What is a noun?\",\"choices\":[\"A person, place, or thing\",\"An action word\",\"A word that modifies verbs\",\"A describing word\"],\"answer\":\"A person, place, or thing\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What do verbs show in a sentence?\",\"choices\":[\"Action or state of being\",\"Names of countries\",\"Feelings you touch\",\"Which kind of noun\"],\"answer\":\"Action or state of being\",\"points\":1},{\"type\":\"mcq\",\"question\":\"In the sentence \'The rabbit read the book\', what is the word \'rabbit\'?\",\"choices\":[\"Noun\",\"Verb\",\"Pronoun\",\"Adverb\"],\"answer\":\"Noun\",\"points\":1},{\"type\":\"mcq\",\"question\":\"In the sentence \'Batman drives the Batmobile\', which word is the verb?\",\"choices\":[\"drives\",\"Batman\",\"Batmobile\",\"the\"],\"answer\":\"drives\",\"points\":1},{\"type\":\"mcq\",\"question\":\"A singular noun refers to how many people, places, or things?\",\"choices\":[\"Only one\",\"More than one\",\"Three\",\"None\"],\"answer\":\"Only one\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Verbs are _____ words.\",\"choices\":[\"action\",\"place\",\"proper\"],\"answer\":\"action\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A noun names a person, place, or _____.\",\"choices\":[\"thing\",\"jump\",\"read\"],\"answer\":\"thing\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"\'Anna\' is a girl\'s name, so it is a _____ noun.\",\"choices\":[\"proper\",\"plural\",\"verb\"],\"answer\":\"proper\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Plural nouns refer to _____ than one person, place, or thing.\",\"choices\":[\"more\",\"one\",\"less\"],\"answer\":\"more\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"To show more than one dog, we add _____ to the end of the word.\",\"choices\":[\"s\",\"ed\",\"ing\"],\"answer\":\"s\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Words that replace nouns in a sentence are called _____.\",\"choices\":[\"pronouns\",\"verbs\",\"objects\"],\"answer\":\"pronouns\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Nouns you can touch or hold are _____ nouns.\",\"choices\":[\"tangible\",\"abstract\",\"helping\"],\"answer\":\"tangible\",\"points\":1}],\"notes\":\"Read each item aloud to Grade 1 learners and give them enough time to choose or copy the word from the word bank.\"},\"activity\":{\"title\":\"Montessori Grammar Sorting: Noun and Verb Baskets\",\"max_score\":10,\"description\":\"1. Provide pairs of students with two labeled trays or baskets: one marked \'Noun\' (with a black Montessori triangle symbol) and one marked \'Verb\' (with a red Montessori circle symbol).\\n2. Hand each pair a pouch containing 8 picture-and-word cards taken from the lesson (e.g., rabbit, book, France, dog, drives, read, throws, jumped).\\n3. Children take turns drawing a card, saying the word aloud, and deciding if it names a person/place/thing (Noun) or shows an action (Verb).\\n4. Children place the card into the correct basket.\\n5. After sorting, pairs check their answers with the teacher or a prepared control card and return the materials neatly to the shelf.\",\"notes\":\"Use color-coded Montessori grammar symbols (black triangle for noun, red circle for verb) to reinforce concrete visual associations.\",\"rubric\":{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Correctly sorts all 8 noun and verb cards into the proper baskets.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Correctly sorts 6 to 7 cards with minimal guidance.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Correctly sorts 4 to 5 cards; needs teacher prompts to identify actions vs. things.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Sorts fewer than 4 cards correctly; needs full teacher assistance.\"}]},{\"name\":\"Participation and Focus\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Actively participates, reads words aloud, and stays focused throughout the task.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Participates well and takes turns with minor reminders to stay on task.\"},{\"label\":\"Fair\",\"points\":1.5,\"description\":\"Participates only when urged by the partner or teacher.\"},{\"label\":\"Needs Improvement\",\"points\":0.5,\"description\":\"Shows little interest or is frequently distracted during the sorting activity.\"}]},{\"name\":\"Care of Materials\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Handles cards and baskets gently and returns them neatly to the shelf.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Handles materials properly and cleans up with a gentle reminder.\"},{\"label\":\"Fair\",\"points\":1.5,\"description\":\"Leaves materials scattered or requires help putting cards back into the pouch.\"},{\"label\":\"Needs Improvement\",\"points\":0.5,\"description\":\"Mishandles cards or leaves the workspace untidy without packing away.\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-11 19:00:35', '2026-10-11 19:00:35'),
(32, 5, 2, 18, 1, 'pending', 'gemini', 'Lesson title: Nouns & Verbs\n\nLesson plan excerpt:\nUse of Nouns, Verbs, and Adjectives Nouns, verbs, and adjectives are parts of speech, or the building blocks for writing complete sentences. Nouns are people, places, or things. Verbs are action words. Adjectives are descriptive words. Nouns  A noun is a part of speech that signifies a person, place, or thing. Example 1: The rabbit read the book. Example 2: Anna visited France. Both “rabbit” and “book” are nouns because they are “things.” They are general words for people, places, or things, so they are improper nouns. “Anna” is a noun because she is a person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the name of a country, so they are proper nouns.  The previous examples are tangible nouns, or things you can touch or hold, but nouns can also be intangible or abstract. This means that they aren’t things you can touch, like feelings. Example 1: Honesty is important. Example 2: He is searching for happiness. “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but they are both still nouns.  Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, and plural nouns refer to more than one. Example 1: She owns a dog. Example 2: She owns two dogs. There is only one dog in the first example, so the noun “dog” remains unchanged. To show that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. Pronouns  Pronouns are words that replace nouns in a sentence. In the following examples, the first example does not have a pronoun and the second one does. Example 1: Jasmine is a princess. Example 2: She is a princess. “She” is a pronoun used to replace the proper noun “Jasmine.”  Example pronouns: Subject Pronouns Object Pronouns I Me We Us You You She Her He Him It It They Them Adjectives  Adjectives describe nouns. They tell us which, what kind, or how many of a certain noun there is. An', '{\"quiz\":{\"title\":\"Nouns and Verbs Quiz\",\"max_score\":20,\"items\":[{\"type\":\"mcq\",\"question\":\"What is a noun?\",\"choices\":[\"A person, place, or thing\",\"An action word\",\"A describing word\",\"A connecting word\"],\"answer\":\"A person, place, or thing\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What are verbs?\",\"choices\":[\"Action words\",\"Names of places\",\"Descriptive words\",\"Names of people\"],\"answer\":\"Action words\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which word is a noun in the sentence: \'The rabbit read the book\'?\",\"choices\":[\"rabbit\",\"read\",\"quick\",\"soft\"],\"answer\":\"rabbit\",\"points\":1},{\"type\":\"mcq\",\"question\":\"How many things does a singular noun refer to?\",\"choices\":[\"Only one\",\"Two\",\"Many\",\"None\"],\"answer\":\"Only one\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What does an adjective modify or describe?\",\"choices\":[\"A noun\",\"A verb\",\"An action\",\"A sentence\"],\"answer\":\"A noun\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Nouns are people, places, or things.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Verbs indicate action or state of being in sentences.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"A plural noun refers to only one person, place, or thing.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Adverbs modify nouns.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Honesty and happiness are examples of abstract nouns.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Verbs are _____ words.\",\"choices\":[\"action\",\"naming\",\"color\"],\"answer\":\"action\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A _____ noun refers to only one person, place, or thing.\",\"choices\":[\"singular\",\"plural\",\"helping\"],\"answer\":\"singular\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A _____ noun refers to more than one person, place, or thing.\",\"choices\":[\"plural\",\"singular\",\"proper\"],\"answer\":\"plural\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Pronouns are words that replace _____ in a sentence.\",\"choices\":[\"nouns\",\"verbs\",\"adverbs\"],\"answer\":\"nouns\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Things you can touch or hold are _____ nouns.\",\"choices\":[\"tangible\",\"abstract\",\"action\"],\"answer\":\"tangible\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Feelings that you cannot touch are _____ nouns.\",\"choices\":[\"abstract\",\"tangible\",\"plural\"],\"answer\":\"abstract\",\"points\":1}],\"notes\":\"Read each item aloud to Grade 1 learners and allow ample time to select their answers.\"},\"activity\":{\"title\":\"Montessori Grammar Sorting Tray: Noun or Verb?\",\"max_score\":20,\"description\":\"1. Provide pairs of students with a tray containing picture cards depicting people/places/things (nouns) and actions (verbs).\\n2. Place two sorting mats on the table: one with the Montessori Black Triangle (Noun) and one with the Red Circle (Verb).\\n3. Learners pick a card, say the word aloud, decide if it is a naming word (noun) or an action word (verb), and act out verbs or name the object.\\n4. Students place the card on the matching mat.\\n5. Learners check their work with a partner using an answer control card.\",\"notes\":\"Use physical objects or clear picture cards to make abstract definitions concrete for young learners.\",\"rubric\":{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":10,\"levels\":[{\"label\":\"Excellent\",\"points\":10,\"description\":\"Correctly sorts all noun and verb cards onto the proper mats.\"},{\"label\":\"Good\",\"points\":8,\"description\":\"Sorts most cards correctly with only 1 to 2 minor errors.\"},{\"label\":\"Fair\",\"points\":5,\"description\":\"Sorts half of the cards correctly and needs occasional guidance.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Has difficulty distinguishing between nouns and verbs without direct teacher support.\"}]},{\"name\":\"Participation and Independence\",\"max_points\":10,\"levels\":[{\"label\":\"Excellent\",\"points\":10,\"description\":\"Works independently, handles Montessori materials carefully, and cooperates well.\"},{\"label\":\"Good\",\"points\":8,\"description\":\"Participates willingly and uses materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":5,\"description\":\"Participates with frequent prompting and needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Struggles to engage or handle the learning materials appropriately.\"}]}]}},\"exam\":null}', NULL, NULL, '2026-10-11 19:02:04', '2026-10-11 19:02:04'),
(34, 15, 2, 13, 1, 'pending', 'gemini', 'Lesson title: IoT\n\nLesson plan excerpt:\nPage 1\nINTERNET OF THINGS\nNOEL V. PAGUIO JR.\n\n\n\nPage 2\nWHAT IS INTERNET OF THINGS?\n•TheInternet of Things (IoT)refers toa network of physical objects \"things“ embedded \nwith sensors, software, and technologies that enable them to connect, collect, and \nexchange data with other devices and systems over the internet or networks. These \nsmart, interconnected devices range from household appliances to industrial tools, \nautomating tasks and enabling remote monitoring and, in many cases, autonomous \noperation.\nIoT enhances operational efficiency and decision-making by allowing for real-time \ndata analysis and automation without manual intervention.\n\n\n\nPage 3\nKEY ASPECTS OF IOT\n•Components: IoT systems combine physical devices (sensors/actuators), \ninternet/network connectivity, data processing, and user interfaces.\n•Functionality: They collect data from their environment, transmit it, and often act on \nit to improve efficiency, convenience, or automation.\n•Examples: Smart thermostats, connected vehicles, wearable fitness trackers, smart \nhome security systems, and industrial sensors.\n•Applications: Commonly used for smart homes, healthcare, industrial IoT and smart \ncities.\n\n\n\nPage 4\nMICROCONTROLLERS\n•A microcontroller (MCU) isa small, self-contained computer on a single chip, \nintegrating a processor, memory (RAM, ROM/Flash), and programmable \ninput/output (I/O) peripherals, designed to execute specific tasks \ninembedded systemslike home appliances, cars, and IoT devices\n\n\n\nPage 5\nWHAT’S INSIDE A MICROCONTROLLER?\n\n\n\nPage 6\nWHAT’S INSIDE A MICROCONTROLLER?\n•CPU –runs your program\n•Memory –stores code and variables\n•Input/Output pins (GPIO) –talk to the outside world\n•Timers / counters\n•Peripherals –ADC (analog reading), UART, I²C, SPI, PWM, etc.\n\n\n\nPage 7\nWHATITISNOT(MICROCONTROLLERS)\n•Not a PC\n•No keyboard, mouse, monitor, or operating system (usually)\n•Not meant for multitasking heavy apps\nIt runs one dedicated job, usually forev', '{\"quiz\":{\"title\":\"Grade 1 Science Quiz: IoT Sensors\",\"max_score\":20,\"items\":[{\"type\":\"mcq\",\"question\":\"What kind of device is a sensor?\",\"choices\":[\"Input device\",\"Output device\",\"Sound speaker\",\"Display screen\"],\"answer\":\"Input device\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which sensor measures temperature and humidity?\",\"choices\":[\"DHT11 sensor\",\"Push button\",\"Active buzzer\",\"OLED screen\"],\"answer\":\"DHT11 sensor\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What does an IR proximity sensor detect without touching?\",\"choices\":[\"Nearby objects\",\"Music songs\",\"Paint colors\",\"Cold ice\"],\"answer\":\"Nearby objects\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What does a photosensitive resistor (LDR) sensor measure?\",\"choices\":[\"Light and brightness\",\"Loud sound\",\"Water level\",\"Wind speed\"],\"answer\":\"Light and brightness\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What kind of movement does the HC-SR501 PIR sensor detect?\",\"choices\":[\"Human or animal movement\",\"Falling leaves\",\"Running water\",\"Blinking lights\"],\"answer\":\"Human or animal movement\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Sensors are electronic parts that work as _____ devices.\",\"choices\":[\"input\",\"output\",\"battery\",\"screen\"],\"answer\":\"input\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A sensor turns what it finds into an _____ signal.\",\"choices\":[\"electrical\",\"invisible\",\"outdoor\",\"animal\"],\"answer\":\"electrical\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A push button sensor knows if a button is pressed or _____.\",\"choices\":[\"released\",\"broken\",\"painted\",\"erased\"],\"answer\":\"released\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A potentiometer sensor changes its voltage when you turn a _____.\",\"choices\":[\"knob\",\"wheel\",\"screw\",\"key\"],\"answer\":\"knob\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"The NEO-M8N GPS module is used to give positioning _____.\",\"choices\":[\"accuracy\",\"brightness\",\"warmth\",\"sound\"],\"answer\":\"accuracy\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"What is the job of a sensor?\",\"choices\":null,\"answer\":\"A sensor detects or measures physical things around it, like light or heat. It then turns that measurement into an electrical signal that a controller can read.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"How does an IR proximity sensor find nearby objects?\",\"choices\":null,\"answer\":\"An IR proximity sensor emits and receives infrared light. This lets it detect objects close to it without actually touching them.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"What does a DHT11 sensor tell us about the air?\",\"choices\":null,\"answer\":\"The DHT11 sensor tells us about the air\'s temperature and humidity. It is a digital sensor that measures how warm or damp the air is.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"How does the HC-SR501 PIR sensor help protect an area?\",\"choices\":null,\"answer\":\"The HC-SR501 PIR sensor detects movement from people or animals. It can spot this motion up to several meters away to alert a system.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"Where can we see a push button sensor being used at home?\",\"choices\":null,\"answer\":\"A push button sensor can be used on a doorbell at home. When someone presses the button, it connects the circuit so a bell can ring.\",\"points\":2}],\"notes\":\"Read each question aloud for Grade 1 learners and connect sensors to human senses like seeing and feeling to aid comprehension.\"},\"activity\":null,\"exam\":null}', NULL, NULL, '2026-10-12 05:59:09', '2026-10-12 05:59:09');
INSERT INTO `ai_recommendations` (`id`, `lesson_plan_id`, `teacher_id`, `subject_id`, `grade_level`, `status`, `provider`, `source_excerpt`, `content`, `assessment_id`, `approved_type`, `created_at`, `updated_at`) VALUES
(36, 16, 2, 20, 1, 'pending', 'gemini', 'Lesson title: UseofNounsVerbsAdjectives (1)\n\nLesson plan excerpt:\nPage 1\nUse of Nouns, Verbs, and Adjectives \nNouns, verbs, and adjectives are parts of speech, or the \nbuilding blocks for writing complete sentences. Nouns \nare people, places, or things. Verbs are action words. \nAdjectives are descriptive words. \nNouns \n A noun is a part of speech that signifies a person, \nplace, or thing. \n Example 1: The rabbit read the book. \n Example 2: Anna visited France. \n Both “rabbit” and “book” are nouns because they are “things.” They are general words for \n people, places, or things, so they are improper nouns. “Anna” is a noun because she is a \n person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the \n name of a country, so they are proper nouns. \n The previous examples are tangible nouns, or things you can touch or hold, but nouns can also \nbe intangible or abstract. This means that they aren’t things you can touch, like feelings. \n Example 1: Honesty is important. \n Example 2: He is searching for happiness. \n “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but \n they are both still nouns. \n Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, \nand plural nouns refer to more than one. \n Example 1: She owns a dog. \n Example 2: She owns two dogs. \n There is only one dog in the first example, so the noun “dog” remains unchanged. To show \n that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. \nPronouns \n Pronouns are words that replace nouns in a sentence. In the following examples, the first \nexample does not have a pronoun and the second one does. \n Example 1: Jasmine is a princess. \n Example 2: She is a princess. \n “She” is a pronoun used to replace the proper noun “Jasmine.” \n\n\n\nPage 2\n Example pronouns: \nSubject Pronouns Object Pronouns \nI Me \nWe Us \nYou You \nShe Her \nHe Him \nIt It \nThey Them \nAdjectives \n Adjectiv', '{\"quiz\":{\"title\":\"Grade 1 English & Values: Nouns, Verbs, and Adjectives Quiz\",\"max_score\":15,\"items\":[{\"type\":\"mcq\",\"question\":\"What part of speech names a person, place, or thing?\",\"choices\":[\"Noun\",\"Verb\",\"Adjective\",\"Adverb\"],\"answer\":\"Noun\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What are verbs in a sentence?\",\"choices\":[\"Action words\",\"Color words\",\"Name of places\",\"Helping letters\"],\"answer\":\"Action words\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which word is an adjective that describes something?\",\"choices\":[\"Blue\",\"Rabbit\",\"France\",\"Jumped\"],\"answer\":\"Blue\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which of these words is a pronoun?\",\"choices\":[\"She\",\"Castle\",\"Drives\",\"Book\"],\"answer\":\"She\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What letter is added to the word \'dog\' to make it plural?\",\"choices\":[\"s\",\"ed\",\"ing\",\"ly\"],\"answer\":\"s\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A noun that means only one thing is _____.\",\"choices\":[\"singular\",\"plural\",\"verb\",\"adverb\"],\"answer\":\"singular\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A noun that means more than one thing is _____.\",\"choices\":[\"plural\",\"singular\",\"action\",\"pronoun\"],\"answer\":\"plural\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Words that replace nouns in a sentence are called _____.\",\"choices\":[\"pronouns\",\"adjectives\",\"places\",\"actions\"],\"answer\":\"pronouns\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Descriptive words that modify nouns are called _____.\",\"choices\":[\"adjectives\",\"verbs\",\"subjects\",\"objects\"],\"answer\":\"adjectives\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Good values like honesty and happiness are _____ nouns because we cannot touch them.\",\"choices\":[\"abstract\",\"plural\",\"helping\",\"proper\"],\"answer\":\"abstract\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"What is a noun? Give one example from our lesson.\",\"choices\":null,\"answer\":\"A noun is a word for a person, place, or thing. An example of a noun is a dog, Anna, or a book.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"Why are words like honesty and happiness considered nouns even if we cannot touch them?\",\"choices\":null,\"answer\":\"They are intangible or abstract nouns. Even though we cannot touch feelings or ideas, they are still things we can name and talk about.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"What do adjectives do in a sentence?\",\"choices\":null,\"answer\":\"Adjectives are descriptive words that modify or describe nouns. They help us know what kind, which one, or how many things there are.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"What is a verb? Give one action verb example from our lesson.\",\"choices\":null,\"answer\":\"A verb is an action word or a state of being in a sentence. An example of an action verb is drives, read, jumped, or throws.\",\"points\":1},{\"type\":\"short_answer\",\"question\":\"How do pronouns help us when we write sentences about a person like Jasmine?\",\"choices\":null,\"answer\":\"Pronouns replace nouns so we do not have to repeat the same name. For example, we can use the word \'she\' instead of saying \'Jasmine\' again.\",\"points\":1}],\"notes\":\"Guide Grade 1 learners by reading instructions aloud and encouraging phonetic writing for short responses.\"},\"activity\":null,\"exam\":null}', NULL, NULL, '2026-10-12 07:40:22', '2026-10-12 07:40:22'),
(37, 15, 2, 13, 1, 'pending', 'gemini', 'Lesson title: IoT\n\nLesson plan excerpt:\nPage 1\nINTERNET OF THINGS\nNOEL V. PAGUIO JR.\n\n\n\nPage 2\nWHAT IS INTERNET OF THINGS?\n•TheInternet of Things (IoT)refers toa network of physical objects \"things“ embedded \nwith sensors, software, and technologies that enable them to connect, collect, and \nexchange data with other devices and systems over the internet or networks. These \nsmart, interconnected devices range from household appliances to industrial tools, \nautomating tasks and enabling remote monitoring and, in many cases, autonomous \noperation.\nIoT enhances operational efficiency and decision-making by allowing for real-time \ndata analysis and automation without manual intervention.\n\n\n\nPage 3\nKEY ASPECTS OF IOT\n•Components: IoT systems combine physical devices (sensors/actuators), \ninternet/network connectivity, data processing, and user interfaces.\n•Functionality: They collect data from their environment, transmit it, and often act on \nit to improve efficiency, convenience, or automation.\n•Examples: Smart thermostats, connected vehicles, wearable fitness trackers, smart \nhome security systems, and industrial sensors.\n•Applications: Commonly used for smart homes, healthcare, industrial IoT and smart \ncities.\n\n\n\nPage 4\nMICROCONTROLLERS\n•A microcontroller (MCU) isa small, self-contained computer on a single chip, \nintegrating a processor, memory (RAM, ROM/Flash), and programmable \ninput/output (I/O) peripherals, designed to execute specific tasks \ninembedded systemslike home appliances, cars, and IoT devices\n\n\n\nPage 5\nWHAT’S INSIDE A MICROCONTROLLER?\n\n\n\nPage 6\nWHAT’S INSIDE A MICROCONTROLLER?\n•CPU –runs your program\n•Memory –stores code and variables\n•Input/Output pins (GPIO) –talk to the outside world\n•Timers / counters\n•Peripherals –ADC (analog reading), UART, I²C, SPI, PWM, etc.\n\n\n\nPage 7\nWHATITISNOT(MICROCONTROLLERS)\n•Not a PC\n•No keyboard, mouse, monitor, or operating system (usually)\n•Not meant for multitasking heavy apps\nIt runs one dedicated job, usually forev', '{\"quiz\":{\"title\":\"Grade 1 Science: Exploring the Internet of Things (IoT)\",\"max_score\":50,\"items\":[{\"type\":\"mcq\",\"question\":\"What does IoT stand for?\",\"choices\":[\"Internet of Things\",\"Internet of Toys\",\"Inside of Things\",\"Input of Tools\"],\"answer\":\"Internet of Things\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What is the main job of a sensor?\",\"choices\":[\"Detects and measures things\",\"Cooks meals\",\"Washes clothes\",\"Plays video games\"],\"answer\":\"Detects and measures things\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which of these is an actuator that produces sound or action?\",\"choices\":[\"Buzzer\",\"Light sensor\",\"Temperature sensor\",\"Motion sensor\"],\"answer\":\"Buzzer\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Where can we find a microcontroller working inside our home?\",\"choices\":[\"Microwave oven\",\"Wooden chair\",\"Paper book\",\"Pencil case\"],\"answer\":\"Microwave oven\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What does the DHT11 sensor measure in the air?\",\"choices\":[\"Temperature and humidity\",\"Sound and music\",\"Color of light\",\"Weight of objects\"],\"answer\":\"Temperature and humidity\",\"points\":1},{\"type\":\"true_false\",\"question\":\"A sensor is an input device that gathers information.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"A microcontroller is a desktop PC with a large monitor and mouse.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Actuators turn electrical signals into physical actions.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"An active buzzer makes sound as soon as it gets power.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"IoT smart devices cannot connect to the internet.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"IoT stands for Internet of _____.\",\"choices\":[\"Things\",\"Toys\",\"Trees\"],\"answer\":\"Things\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Sensors act as _____ devices that gather data.\",\"choices\":[\"input\",\"broken\",\"heavy\"],\"answer\":\"input\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"An actuator is an _____ device that creates an action.\",\"choices\":[\"output\",\"input\",\"empty\"],\"answer\":\"output\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"Inside a microcontroller, the _____ runs your program.\",\"choices\":[\"CPU\",\"wheel\",\"tire\"],\"answer\":\"CPU\",\"points\":1},{\"type\":\"fill_blank\",\"question\":\"A photosensitive resistor measures the brightness of _____.\",\"choices\":[\"light\",\"sound\",\"water\"],\"answer\":\"light\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match each electronic part to its primary role:\",\"choices\":[\"Sensor | Input device\",\"Actuator | Output device\",\"CPU | Runs programs\"],\"answer\":\"Sensor | Input device; Actuator | Output device; CPU | Runs programs\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match each sensor to what it detects:\",\"choices\":[\"DHT11 | Temperature and humidity\",\"LDR | Light brightness\",\"PIR sensor | Human movement\"],\"answer\":\"DHT11 | Temperature and humidity; LDR | Light brightness; PIR sensor | Human movement\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the appliance to its place or function:\",\"choices\":[\"Microwave oven | Kitchen heating appliance\",\"TV remote | Handheld controller\",\"Washing machine | Laundry appliance\"],\"answer\":\"Microwave oven | Kitchen heating appliance; TV remote | Handheld controller; Washing machine | Laundry appliance\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the microcontroller part to its job:\",\"choices\":[\"Memory | Stores code and variables\",\"CPU | Executes the program\",\"GPIO pins | Talks to outside devices\"],\"answer\":\"Memory | Stores code and variables; CPU | Executes the program; GPIO pins | Talks to outside devices\",\"points\":1},{\"type\":\"matching\",\"question\":\"Match the actuator component to its output:\",\"choices\":[\"Buzzer | Sound tone\",\"OLED screen | Visual display\",\"Relay module | Circuit switch\"],\"answer\":\"Buzzer | Sound tone; OLED screen | Visual display; Relay module | Circuit switch\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the steps of an IoT device action in order:\",\"choices\":[\"Sensor collects data from environment\",\"Device transmits data over network\",\"Actuator performs an action\"],\"answer\":\"Sensor collects data from environment | Device transmits data over network | Actuator performs an action\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the basic electronic signal flow in order:\",\"choices\":[\"Input is detected by sensor\",\"Information is processed by controller\",\"Output is performed by actuator\"],\"answer\":\"Input is detected by sensor | Information is processed by controller | Output is performed by actuator\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the buzzer activation steps in order:\",\"choices\":[\"Controller sends electrical signal\",\"Active buzzer receives power\",\"Buzzer makes sound\"],\"answer\":\"Controller sends electrical signal | Active buzzer receives power | Buzzer makes sound\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the steps of detecting motion in order:\",\"choices\":[\"Person moves within range\",\"PIR sensor detects motion\",\"Sensor sends signal to microcontroller\"],\"answer\":\"Person moves within range | PIR sensor detects motion | Sensor sends signal to microcontroller\",\"points\":1},{\"type\":\"sequencing\",\"question\":\"Put the steps of working with a development board in order:\",\"choices\":[\"Write program code\",\"Power the board\",\"Test code on hardware\"],\"answer\":\"Write program code | Power the board | Test code on hardware\",\"points\":1},{\"type\":\"identification\",\"question\":\"What is the small computer on a single chip designed to run dedicated tasks called?\",\"choices\":[\"toaster\",\"battery\"],\"answer\":\"Microcontroller\",\"points\":1},{\"type\":\"identification\",\"question\":\"What complete computer built on a single circuit board can run a full operating system?\",\"choices\":[\"notebook\",\"cable\"],\"answer\":\"Single Board Computer\",\"points\":1},{\"type\":\"identification\",\"question\":\"Which sensor module uses infrared light to detect nearby objects without touching them?\",\"choices\":[\"thermometer\",\"switch\"],\"answer\":\"IR proximity sensor\",\"points\":1},{\"type\":\"identification\",\"question\":\"Which 3-pin analog sensor provides variable output when you turn its knob?\",\"choices\":[\"resistor\",\"wire\"],\"answer\":\"Potentiometer\",\"points\":1},{\"type\":\"identification\",\"question\":\"Which GNSS module receives satellite signals for positioning and location?\",\"choices\":[\"speaker\",\"lamp\"],\"answer\":\"NEO-M8N GPS\",\"points\":1},{\"type\":\"enumeration\",\"question\":\"Name two household appliances from the lesson that contain microcontrollers.\",\"choices\":null,\"answer\":\"Award 1 point for each valid appliance listed: microwave ovens, washing machines, TV remotes.\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"Name two physical properties that sensors can measure.\",\"choices\":null,\"answer\":\"Award 1 point for each property: temperature, light, distance, water level, sound, motion, magnetic field, touch/pressure.\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"Name two physical actions that actuators can perform.\",\"choices\":null,\"answer\":\"Award 1 point for each action: move, light up, make sound, lock/unlock, heat, open/close, display.\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"Name two internal components found inside a microcontroller chip.\",\"choices\":null,\"answer\":\"Award 1 point for each component: CPU, memory (RAM/Flash), input/output pins (GPIO), timers/counters, peripherals.\",\"points\":2},{\"type\":\"enumeration\",\"question\":\"Name two wireless network features present on an ESP32 development board.\",\"choices\":null,\"answer\":\"Award 1 point each for Wi-Fi and Bluetooth.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"What is the Internet of Things (IoT)?\",\"choices\":null,\"answer\":\"The Internet of Things (IoT) is a network of physical objects embedded with sensors and software. These objects connect and share data with other devices over the internet.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"Why are sensors known as input devices?\",\"choices\":null,\"answer\":\"Sensors are input devices because they collect information from their environment. They measure physical properties like heat or light and send that information into the system.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"What does an actuator do in an electronic system?\",\"choices\":null,\"answer\":\"An actuator receives an electrical signal from the controller and converts it into physical action. It can produce sound, turn on a light, or move a motor.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"How is a microcontroller different from a regular computer?\",\"choices\":null,\"answer\":\"A microcontroller is a single chip made to do one specific job in a loop. Unlike a PC, it usually has no monitor, keyboard, or mouse.\",\"points\":2},{\"type\":\"short_answer\",\"question\":\"How do IoT devices help people in smart homes?\",\"choices\":null,\"answer\":\"IoT devices in smart homes automate everyday tasks like adjusting lights or monitoring safety. They allow people to control and monitor their home appliances remotely.\",\"points\":2}],\"notes\":\"Read aloud questions to Grade 1 learners as needed. Encourage hands-on Montessori sensory connections with physical buttons and real-life appliance examples.\"},\"activity\":null,\"exam\":null}', NULL, NULL, '2026-10-12 08:43:11', '2026-10-12 08:43:11'),
(38, 5, 2, 18, 1, 'pending', 'gemini', 'Lesson title: Nouns & Verbs\n\nLesson plan excerpt:\nPage 1\nUse of Nouns, Verbs, and Adjectives \nNouns, verbs, and adjectives are parts of speech, or the \nbuilding blocks for writing complete sentences. Nouns \nare people, places, or things. Verbs are action words. \nAdjectives are descriptive words. \nNouns \n A noun is a part of speech that signifies a person, \nplace, or thing. \n Example 1: The rabbit read the book. \n Example 2: Anna visited France. \n Both “rabbit” and “book” are nouns because they are “things.” They are general words for \n people, places, or things, so they are improper nouns. “Anna” is a noun because she is a \n person, and “France” is a noun because it’s a place. Anna is the girl’s name and France is the \n name of a country, so they are proper nouns. \n The previous examples are tangible nouns, or things you can touch or hold, but nouns can also \nbe intangible or abstract. This means that they aren’t things you can touch, like feelings. \n Example 1: Honesty is important. \n Example 2: He is searching for happiness. \n “Honesty” and “happiness” are concepts that are more abstract than “rabbit” or “book,” but \n they are both still nouns. \n Nouns can also be singular or plural. Singular nouns refer to only one person, place or thing, \nand plural nouns refer to more than one. \n Example 1: She owns a dog. \n Example 2: She owns two dogs. \n There is only one dog in the first example, so the noun “dog” remains unchanged. To show \n that there are multiple dogs, an “s” is added to the end of “dog” to make it plural. \nPronouns \n Pronouns are words that replace nouns in a sentence. In the following examples, the first \nexample does not have a pronoun and the second one does. \n Example 1: Jasmine is a princess. \n Example 2: She is a princess. \n “She” is a pronoun used to replace the proper noun “Jasmine.” \n\n\n\nPage 2\n Example pronouns: \nSubject Pronouns Object Pronouns \nI Me \nWe Us \nYou You \nShe Her \nHe Him \nIt It \nThey Them \nAdjectives \n Adjectives describe noun', '{\"quiz\":{\"title\":\"Grade 1 Nouns and Verbs Quiz\",\"max_score\":10,\"items\":[{\"type\":\"mcq\",\"question\":\"What is a noun?\",\"choices\":[\"A person, place, or thing\",\"An action word\",\"A color word\",\"A number word\"],\"answer\":\"A person, place, or thing\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What are verbs?\",\"choices\":[\"Action words\",\"Names of places\",\"Names of people\",\"Tangible things\"],\"answer\":\"Action words\",\"points\":1},{\"type\":\"mcq\",\"question\":\"In the sentence \'Anna visited France,\' what is Anna?\",\"choices\":[\"A person\",\"An action\",\"A country\",\"A feeling\"],\"answer\":\"A person\",\"points\":1},{\"type\":\"mcq\",\"question\":\"What letter is added to the word \'dog\' to make it plural?\",\"choices\":[\"s\",\"ed\",\"ing\",\"ly\"],\"answer\":\"s\",\"points\":1},{\"type\":\"mcq\",\"question\":\"Which word is the action verb in \'Batman drives the Batmobile\'?\",\"choices\":[\"drives\",\"Batman\",\"the\",\"Batmobile\"],\"answer\":\"drives\",\"points\":1},{\"type\":\"true_false\",\"question\":\"A singular noun refers to only one person, place, or thing.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Verbs are words that name people and places.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Words like honesty and happiness are nouns.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1},{\"type\":\"true_false\",\"question\":\"Plural nouns refer to only one thing.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":1},{\"type\":\"true_false\",\"question\":\"In \'Thor throws the hammer,\' the word throws shows an action.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":1}],\"notes\":\"Read each question aloud clearly to Grade 1 learners and give them time to identify naming words versus action words.\"},\"activity\":null,\"exam\":null}', NULL, NULL, '2026-10-12 12:46:42', '2026-10-12 12:47:23'),
(40, 18, 97, 13, 5, 'pending', 'groq', 'Lesson title: IoT\n\nLesson plan excerpt:\nPage 1\nINTERNET OF THINGS\nNOEL V. PAGUIO JR.\n\n\n\nPage 2\nWHAT IS INTERNET OF THINGS?\n•TheInternet of Things (IoT)refers toa network of physical objects \"things“ embedded \nwith sensors, software, and technologies that enable them to connect, collect, and \nexchange data with other devices and systems over the internet or networks. These \nsmart, interconnected devices range from household appliances to industrial tools, \nautomating tasks and enabling remote monitoring and, in many cases, autonomous \noperation.\nIoT enhances operational efficiency and decision-making by allowing for real-time \ndata analysis and automation without manual intervention.\n\n\n\nPage 3\nKEY ASPECTS OF IOT\n•Components: IoT systems combine physical devices (sensors/actuators), \ninternet/network connectivity, data processing, and user interfaces.\n•Functionality: They collect data from their environment, transmit it, and often act on \nit to improve efficiency, convenience, or automation.\n•Examples: Smart thermostats, connected vehicles, wearable fitness trackers, smart \nhome security systems, and industrial sensors.\n•Applications: Commonly used for smart homes, healthcare, industrial IoT and smart \ncities.\n\n\n\nPage 4\nMICROCONTROLLERS\n•A microcontroller (MCU) isa small, self-contained computer on a single chip, \nintegrating a processor, memory (RAM, ROM/Flash), and programmable \ninput/output (I/O) peripherals, designed to execute specific tasks \ninembedded systemslike home appliances, cars, and IoT devices\n\n\n\nPage 5\nWHAT’S INSIDE A MICROCONTROLLER?\n\n\n\nPage 6\nWHAT’S INSIDE A MICROCONTROLLER?\n•CPU –runs your program\n•Memory –stores code and variables\n•Input/Output pins (GPIO) –talk to the outside world\n•Timers / counters\n•Peripherals –ADC (analog reading), UART, I²C, SPI, PWM, etc.\n\n\n\nPage 7\nWHATITISNOT(MICROCONTROLLERS)\n•Not a PC\n•No keyboard, mouse, monitor, or operating system (usually)\n•Not meant for multitasking heavy apps\nIt runs one dedicated job, usually forev', '{\"quiz\":{\"title\":\"IoT Basics Quiz\",\"max_score\":100,\"items\":[{\"type\":\"mcq\",\"question\":\"What does IoT stand for?\",\"choices\":[\"Internet of Things\",\"International Order of Technology\",\"Integrated Operational Tools\",\"Internet of Trade\"],\"answer\":\"Internet of Things\",\"points\":5},{\"type\":\"mcq\",\"question\":\"Which component is NOT part of a typical IoT system?\",\"choices\":[\"Sensors/actuators\",\"User interfaces\",\"Operating system for multitasking\",\"Network connectivity\"],\"answer\":\"Operating system for multitasking\",\"points\":5},{\"type\":\"mcq\",\"question\":\"Which device is an example of a microcontroller development board?\",\"choices\":[\"ESP32\",\"Smartphone\",\"Laptop\",\"Desktop PC\"],\"answer\":\"ESP32\",\"points\":5},{\"type\":\"mcq\",\"question\":\"Which sensor measures ambient light intensity?\",\"choices\":[\"LDR (photosensitive resistor)\",\"IR proximity sensor\",\"PIR motion sensor\",\"Potentiometer\"],\"answer\":\"LDR (photosensitive resistor)\",\"points\":5},{\"type\":\"mcq\",\"question\":\"What is the main function of an actuator?\",\"choices\":[\"Convert electrical signal to physical action\",\"Measure temperature\",\"Store data\",\"Transmit Wi‑Fi signals\"],\"answer\":\"Convert electrical signal to physical action\",\"points\":5},{\"type\":\"true_false\",\"question\":\"A microcontroller is the same as a personal computer.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":5},{\"type\":\"true_false\",\"question\":\"The DHT11 sensor can measure both temperature and humidity.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":5},{\"type\":\"true_false\",\"question\":\"Single Board Computers can run a full operating system on one board.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":5},{\"type\":\"true_false\",\"question\":\"Passive buzzers need an external signal to produce sound.\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\",\"points\":5},{\"type\":\"true_false\",\"question\":\"Wi‑Fi and Bluetooth are features only found in Arduino boards.\",\"choices\":[\"True\",\"False\"],\"answer\":\"False\",\"points\":5},{\"type\":\"fill_blank\",\"question\":\"The ESP32 board includes both Wi‑Fi and _____ connectivity.\",\"choices\":[\"Bluetooth\",\"Zigbee\",\"LoRa\",\"Cellular\"],\"answer\":\"Bluetooth\",\"points\":5},{\"type\":\"fill_blank\",\"question\":\"A sensor converts a physical property into an _____ signal.\",\"choices\":[\"electrical\",\"magnetic\",\"optical\",\"thermal\"],\"answer\":\"electrical\",\"points\":5},{\"type\":\"fill_blank\",\"question\":\"The HC‑SR501 is a _____ motion sensor.\",\"choices\":[\"PIR\",\"IR\",\"Ultrasonic\",\"Magnetic\"],\"answer\":\"PIR\",\"points\":5},{\"type\":\"fill_blank\",\"question\":\"A microcontroller typically contains a CPU, memory, and I/O _____ .\",\"choices\":[\"pins\",\"ports\",\"chips\",\"modules\"],\"answer\":\"pins\",\"points\":5},{\"type\":\"fill_blank\",\"question\":\"Smart thermostats are an example of _____ homes.\",\"choices\":[\"smart\",\"automated\",\"connected\",\"digital\"],\"answer\":\"smart\",\"points\":5},{\"type\":\"identification\",\"question\":\"Name one common place where microcontrollers are used.\",\"choices\":[\"Refrigerator\"],\"answer\":\"Microwave oven\",\"points\":5},{\"type\":\"identification\",\"question\":\"What does the acronym SBC stand for?\",\"choices\":[\"System Bus Controller\"],\"answer\":\"Single Board Computer\",\"points\":5},{\"type\":\"identification\",\"question\":\"Give one type of output device (actuator) mentioned in the lesson.\",\"choices\":[\"OLED screen\"],\"answer\":\"Passive buzzer\",\"points\":5},{\"type\":\"identification\",\"question\":\"Which sensor module detects human movement within a few meters?\",\"choices\":[\"IR proximity sensor\"],\"answer\":\"PIR motion sensor\",\"points\":5},{\"type\":\"identification\",\"question\":\"What is the primary purpose of a microcontroller development board?\",\"choices\":[\"High graphics\"],\"answer\":\"Easy programming\",\"points\":5}],\"notes\":\"Mix question types to keep learners engaged; review key terms like sensor, actuator, and microcontroller before the quiz.\"},\"activity\":null,\"exam\":null}', NULL, NULL, '2026-10-13 06:59:20', '2026-10-13 06:59:20');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `sender_id` int(11) NOT NULL,
  `scope` enum('school_wide','grade_wide','class_specific') DEFAULT 'school_wide',
  `target_grade` int(11) DEFAULT NULL,
  `target_section` varchar(10) DEFAULT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `audience` enum('teachers','parents','everyone') NOT NULL DEFAULT 'everyone',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `body` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `sender_id`, `scope`, `target_grade`, `target_section`, `priority`, `audience`, `created_at`, `updated_at`, `admin_id`, `body`) VALUES
(4, 'sgdf', '', 1, 'school_wide', NULL, NULL, 'normal', 'everyone', '2026-08-14 14:01:43', NULL, NULL, 'sdfcs'),
(6, 'Exam Udma', '', 1, 'school_wide', NULL, NULL, 'high', 'everyone', '2026-08-14 15:50:20', '2026-08-16 03:52:53', NULL, 'Mag review!!!!!'),
(9, 'hahdk', '', 1, 'school_wide', NULL, NULL, 'normal', 'teachers', '2026-10-02 20:33:12', NULL, NULL, 'dfpeepp'),
(10, 'Long Quiz', '', 2, 'class_specific', 1, 'A', 'normal', 'everyone', '2026-10-04 09:14:23', NULL, NULL, 'Please review'),
(11, 'Sample', '', 2, 'class_specific', 1, 'A', 'normal', 'everyone', '2026-10-04 09:18:31', NULL, NULL, 'Hehe'),
(12, 'Exam', '', 2, 'class_specific', 1, 'A', 'normal', 'everyone', '2026-10-06 06:43:11', NULL, NULL, 'Tomorrow'),
(13, 'Exam', '', 1, 'school_wide', NULL, NULL, 'normal', 'everyone', '2026-10-06 07:08:51', NULL, NULL, 'Bayad na bukas');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_reads`
--

CREATE TABLE `announcement_reads` (
  `user_id` int(11) NOT NULL,
  `announcement_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcement_reads`
--

INSERT INTO `announcement_reads` (`user_id`, `announcement_id`, `read_at`) VALUES
(1, 4, '2026-08-16 04:02:03'),
(1, 6, '2026-08-16 08:10:06'),
(1, 9, '2026-10-02 20:46:58'),
(1, 13, '2026-10-06 07:08:52'),
(2, 4, '2026-10-02 20:13:31'),
(2, 6, '2026-10-02 20:13:31'),
(2, 9, '2026-10-02 20:33:55'),
(2, 10, '2026-10-04 09:16:02'),
(2, 11, '2026-10-09 08:39:14'),
(2, 12, '2026-10-09 06:52:27'),
(2, 13, '2026-10-09 06:52:25'),
(3, 4, '2026-10-02 20:19:48'),
(3, 6, '2026-10-02 20:19:48'),
(3, 10, '2026-10-04 09:37:07'),
(3, 11, '2026-10-04 09:36:58'),
(3, 12, '2026-10-10 11:32:04'),
(3, 13, '2026-10-12 12:54:49'),
(95, 4, '2026-10-13 05:14:58'),
(95, 6, '2026-10-13 05:14:58'),
(95, 9, '2026-10-13 05:14:58'),
(95, 13, '2026-10-13 05:14:58');

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `setting_key` varchar(64) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES
('current_quarter', 'Q1', '2026-10-06 07:02:48');

-- --------------------------------------------------------

--
-- Table structure for table `assessments`
--

CREATE TABLE `assessments` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `TYPE` enum('quiz','activity','exam') NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `grade_level` int(11) NOT NULL,
  `section` varchar(10) NOT NULL,
  `max_score` int(11) DEFAULT 100,
  `quarter` varchar(10) DEFAULT 'Q1',
  `quiz_link` varchar(500) DEFAULT NULL,
  `share_token` varchar(32) DEFAULT NULL,
  `share_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `quiz_attendance_date` date DEFAULT NULL,
  `quiz_attendance_session` varchar(2) DEFAULT 'AM',
  `quiz_subject_id` int(11) DEFAULT NULL,
  `quiz_makeup_student_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`quiz_makeup_student_ids`)),
  `quiz_closes_at` datetime DEFAULT NULL,
  `quiz_makeup_closes_at` datetime DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `lesson_plan_id` int(11) DEFAULT NULL,
  `lesson_title` varchar(255) DEFAULT NULL,
  `activity_mode` varchar(20) DEFAULT NULL,
  `activity_target_at` datetime DEFAULT NULL,
  `rubric` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rubric`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessments`
--

INSERT INTO `assessments` (`id`, `title`, `TYPE`, `subject_id`, `grade_level`, `section`, `max_score`, `quarter`, `quiz_link`, `share_token`, `share_enabled`, `quiz_attendance_date`, `quiz_attendance_session`, `quiz_subject_id`, `quiz_makeup_student_ids`, `quiz_closes_at`, `quiz_makeup_closes_at`, `created_by`, `created_at`, `lesson_plan_id`, `lesson_title`, `activity_mode`, `activity_target_at`, `rubric`) VALUES
(12, 'Sample Quiz', 'quiz', 12, 1, 'A', 29, 'Q1', NULL, '080be99cae1aa75e', 0, '2026-10-02', 'AM', NULL, NULL, NULL, NULL, 2, '2026-10-02 02:49:55', 3, 'try', NULL, NULL, NULL),
(13, 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'quiz', 13, 1, 'A', 30, 'Q1', NULL, 'f4fd848e3fa25afb', 1, '2026-10-02', 'AM', NULL, '[]', '2026-10-02 12:42:55', NULL, 2, '2026-10-02 03:42:41', 4, 'PT3', NULL, NULL, NULL),
(15, 'Activity — try', 'activity', 12, 1, 'A', 8, 'Q1', NULL, NULL, 0, NULL, 'AM', NULL, NULL, NULL, NULL, 2, '2026-10-02 04:00:26', 3, 'try', NULL, NULL, NULL),
(16, 'Activity — PT3 Sample', 'activity', 13, 1, 'A', 10, 'Q1', NULL, 'b7774faefa2c73dd', 1, '2026-10-02', 'AM', NULL, '[]', '2026-10-02 14:18:13', NULL, 2, '2026-10-02 05:18:09', 4, 'PT3', NULL, NULL, NULL),
(17, 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'quiz', 13, 1, 'A', 30, 'Q1', NULL, 'd2bbfb992a16b374', 1, '2026-10-02', 'AM', NULL, '[]', '2026-10-02 14:20:17', NULL, 2, '2026-10-02 05:20:12', 4, 'PT3', NULL, NULL, NULL),
(18, 'Try Your Math Skills!', 'quiz', 12, 1, 'A', 20, 'Q1', NULL, '2175e2b2e5d88ec3', 1, '2026-10-02', 'PM', NULL, '[5]', '2026-10-02 14:32:39', '2026-10-04 13:44:14', 2, '2026-10-02 05:32:32', 3, 'try', NULL, NULL, NULL),
(19, 'Activity — Sample', 'activity', 12, 1, 'A', 10, 'Q1', NULL, 'c56c7e0bd5c92532', 1, '2026-10-02', 'PM', NULL, '[5]', '2026-10-02 15:47:55', '2026-10-04 13:43:14', 2, '2026-10-02 05:34:11', 3, 'try', NULL, NULL, NULL),
(20, 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'quiz', 13, 1, 'A', 10, 'Q1', NULL, 'bff87a7ccea261c9', 1, '2026-10-02', 'PM', NULL, '[]', '2026-10-02 15:47:10', NULL, 2, '2026-10-02 05:57:24', 4, 'PT3', NULL, NULL, NULL),
(21, 'Understanding Participation in Campus Organizations', 'quiz', 12, 1, 'A', 20, 'Q1', NULL, '12d0234e71e99f4e', 1, '2026-10-02', 'PM', NULL, '[]', '2026-10-02 15:52:17', NULL, 2, '2026-10-02 06:51:28', 3, 'try', NULL, NULL, NULL),
(22, 'Q1 Periodical Exam', 'exam', 13, 1, 'A', 49, 'Q1', NULL, '621fca5df3b6fcd3', 1, '2026-10-02', 'PM', NULL, '[]', '2026-10-02 17:00:56', NULL, 2, '2026-10-02 08:00:52', 4, 'PT3', NULL, NULL, NULL),
(23, 'Nouns & Verbs Quiz', 'quiz', 18, 1, 'A', 20, 'Q1', NULL, 'a0448bc2717838d9', 1, '2026-10-04', 'PM', NULL, '[]', '2026-10-04 18:05:26', NULL, 2, '2026-10-04 09:04:00', 5, 'Nouns & Verbs', NULL, NULL, NULL),
(25, 'Q1 Periodical Exam', 'exam', 12, 1, 'A', 30, 'Q1', NULL, '13b95ead91ee66da', 1, '2026-10-04', 'PM', NULL, '[]', '2026-10-04 18:22:17', NULL, 2, '2026-10-04 09:22:03', 3, 'try', NULL, NULL, NULL),
(27, 'File System Administration: Provisioning, Partitioning and Mounting Storage', 'quiz', 13, 1, 'A', 18, 'Q1', NULL, NULL, 0, NULL, 'AM', NULL, NULL, NULL, NULL, 2, '2026-10-06 06:41:36', 4, 'PT3', NULL, NULL, NULL),
(30, 'Parts of Speech Quiz', 'quiz', 18, 4, 'SAMPAGUITA', 29, 'Q1', NULL, '2cc09316d72eb281', 1, '2026-10-07', 'AM', 18, '[]', '2026-10-07 16:03:08', NULL, 13, '2026-10-07 07:02:37', 8, 'Sample', NULL, NULL, NULL),
(32, 'Nouns and Verbs Quiz', 'quiz', 24, 1, 'A', 5, 'Q1', NULL, '44710296d7be8a25', 1, '2026-10-10', 'AM', NULL, '[]', '2026-10-10 10:24:17', NULL, 2, '2026-10-10 01:23:54', 11, 'Nouns and Verbs', NULL, NULL, NULL),
(33, 'Activity — Nouns and Verbs', 'activity', 24, 1, 'A', 6, 'Q1', NULL, '672c1fd694e89534', 1, '2026-10-10', 'AM', NULL, '[]', '2026-10-10 10:51:20', NULL, 2, '2026-10-10 01:51:11', 11, 'Nouns and Verbs', NULL, NULL, NULL),
(34, 'Nouns and Verbs Quiz', 'quiz', 24, 1, 'A', 5, 'Q1', NULL, 'ddbeacf6dcd71e9d', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-11 14:46:03', NULL, 2, '2026-10-11 05:45:38', 11, 'Nouns and Verbs', NULL, NULL, NULL),
(35, 'Math Quiz', 'quiz', 12, 1, 'A', 13, 'Q1', NULL, 'd899801d4919264d', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-11 15:32:14', NULL, 2, '2026-10-11 06:32:11', 9, 'math', NULL, NULL, NULL),
(37, 'Munting Pagsusulit: Nouns and Verbs', 'quiz', 18, 1, 'A', 30, 'Q1', NULL, '86d4ac60733ec3ae', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-11 16:38:32', NULL, 2, '2026-10-11 07:38:28', 5, 'Nouns & Verbs', NULL, NULL, NULL),
(38, 'Parts of Plants We Eat Quiz', 'quiz', 13, 1, 'A', 10, 'Q1', NULL, 'fdf57584f9e9af23', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-11 17:15:25', NULL, 2, '2026-10-11 08:15:21', 2, 'Plants', NULL, NULL, NULL),
(39, 'Parts of Plants We Eat Quiz', 'quiz', 13, 1, 'A', 10, 'Q1', NULL, 'b9a3a1ec2cfec6af', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-11 17:26:44', NULL, 2, '2026-10-11 08:26:40', 2, 'Plants', NULL, NULL, NULL),
(40, 'Parts of Plants We Eat Quiz', 'quiz', 13, 1, 'A', 5, 'Q1', NULL, '064b997b94f6138d', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-11 17:45:42', NULL, 2, '2026-10-11 08:45:39', 2, 'Plants', NULL, NULL, NULL),
(41, 'Parts of Plants We Eat Quiz', 'quiz', 13, 1, 'A', 5, 'Q1', NULL, '94d70f4fd4d7d969', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-11 18:02:55', NULL, 2, '2026-10-11 09:02:52', 2, 'Plants', NULL, NULL, NULL),
(49, 'Activity — Plants', 'activity', 13, 1, 'A', 10, 'Q1', NULL, '13891ebbb091a65f', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-12 22:50:00', NULL, 2, '2026-10-11 14:48:48', 2, 'Plants', 'take_home', '2026-10-12 22:50:00', NULL),
(50, 'Activity — Plants', 'activity', 13, 1, 'A', 10, 'Q1', NULL, 'a80cee4d60dc45ca', 1, '2026-10-11', 'PM', NULL, '[]', '2026-10-12 23:27:00', NULL, 2, '2026-10-11 15:24:34', 2, 'Plants', 'take_home', '2026-10-12 23:27:00', NULL),
(52, 'Activity — Plants', 'activity', 13, 1, 'A', 10, 'Q1', NULL, '7506ba53a147920e', 1, '2026-10-12', 'AM', NULL, '[]', '2026-10-12 23:53:00', NULL, 2, '2026-10-11 15:53:16', 2, 'Plants', 'take_home', '2026-10-12 23:53:00', NULL),
(56, 'Exam — NounsVerbsAdjectives', 'exam', 23, 1, 'A', 30, 'Q1', NULL, NULL, 0, NULL, 'AM', NULL, NULL, NULL, NULL, 2, '2026-10-11 18:28:03', 14, 'UseofNounsVerbsAdjectives (1)', NULL, NULL, NULL),
(57, 'Dance', 'activity', 18, 1, 'A', 10, 'Q1', NULL, NULL, 0, NULL, 'AM', NULL, NULL, NULL, NULL, 2, '2026-10-12 10:46:52', NULL, NULL, NULL, NULL, NULL),
(58, 'Grade 1 Science Quiz: IoT Sensors', 'quiz', 13, 1, 'A', 20, 'Q1', NULL, '352480c911c7d7b0', 1, '2026-10-12', 'PM', NULL, '[]', '2026-10-13 00:51:50', NULL, 2, '2026-10-12 15:51:20', 15, 'IoT', NULL, NULL, NULL),
(59, 'IoT Basics Quiz', 'quiz', 13, 5, 'KALAW', 20, 'Q1', NULL, 'be1cb50890c27039', 1, '2026-10-13', 'AM', 13, '[]', '2026-10-13 15:59:52', NULL, 97, '2026-10-13 06:59:49', 18, 'IoT', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `assessment_questions`
--

CREATE TABLE `assessment_questions` (
  `id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `question_bank_id` int(11) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `item_type` varchar(32) NOT NULL DEFAULT 'mcq',
  `question` text NOT NULL,
  `choices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`choices`)),
  `answer` varchar(500) DEFAULT NULL,
  `points` decimal(8,2) NOT NULL DEFAULT 1.00,
  `rubric` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rubric`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_questions`
--

INSERT INTO `assessment_questions` (`id`, `assessment_id`, `question_bank_id`, `sort_order`, `item_type`, `question`, `choices`, `answer`, `points`, `rubric`, `created_at`) VALUES
(1, 2, 12, 0, 'mcq', 'What is the function of the root of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To grow up from the ground and catch the sun.\"]', 'To anchor the plant in the ground.', 2.00, NULL, '2026-10-01 13:35:08'),
(2, 2, 15, 1, 'mcq', 'What is the function of the leaf of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To breathe the air and catch the sun.\"]', 'To breathe the air and catch the sun.', 2.00, NULL, '2026-10-01 13:35:08'),
(3, 2, 18, 2, 'mcq', 'What is the function of the stem of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To grow up from the ground and catch the sun.\"]', 'To grow up from the ground and catch the sun.', 2.00, NULL, '2026-10-01 13:35:08'),
(4, 2, 21, 3, 'mcq', 'What is the function of the fruit of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To hold the seeds and feed the ground.\"]', 'To hold the seeds and feed the ground.', 2.00, NULL, '2026-10-01 13:35:08'),
(5, 2, 13, 4, 'identification', 'What is the name of the part of the plant that holds the seeds?', NULL, 'Seed', 2.00, NULL, '2026-10-01 13:35:08'),
(6, 2, 16, 5, 'identification', 'What is the name of the part of the plant that produces flowers?', NULL, 'Flower', 2.00, NULL, '2026-10-01 13:35:08'),
(7, 2, 19, 6, 'identification', 'What is the name of the part of the plant that is used for planting?', NULL, 'Seed', 2.00, NULL, '2026-10-01 13:35:08'),
(8, 2, 14, 7, 'enumeration', 'Name the three parts of the plant that we use for food:', NULL, 'Fruit, Leaf, and Root', 3.00, NULL, '2026-10-01 13:35:08'),
(9, 2, 17, 8, 'enumeration', 'Name the two parts of the plant that are fruits:', NULL, 'Peppers, Zucchini', 3.00, NULL, '2026-10-01 13:35:08'),
(10, 2, 20, 9, 'enumeration', 'Name the three parts of the plant that we use for food:', NULL, 'Leaf, Root, Fruit', 3.00, NULL, '2026-10-01 13:35:08'),
(11, 6, 44, 0, 'activity', 'Students work in pairs on a short Grade 1 task about \"PT3\" (Science). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 02:14:11'),
(12, 8, 55, 0, 'activity', 'Students work in pairs on a short Grade 1 task about \"try\" (Mathematics). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 02:39:13'),
(13, 9, 55, 0, 'activity', 'Students work in pairs on a short Grade 1 task about \"try\" (Mathematics). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 02:39:55'),
(14, 11, 66, 0, 'activity', 'Work in groups to design a campus organization that can help Criminology students develop leadership skills, social responsibility, and emotional intelligence. Consider the challenges that Criminology students may face and how your organization can address them.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Creativity\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"The organization is innovative and addresses a specific challenge faced by Criminology students.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"The organization is well-thought-out and addresses a common challenge faced by Criminology students.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"The organization is basic and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"The organization is not well-designed and does not address a specific challenge faced by Criminology students.\"}]},{\"name\":\"Practicality\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"The organization is practical and addresses a specific challenge faced by Criminology students.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"The organization is basic and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"The organization is not well-designed and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"The organization is not practical and does not address a specific challenge faced by Criminology students.\"}]}]}', '2026-10-02 02:46:41'),
(15, 12, 56, 0, 'mcq', 'What is the main reason why Criminology students may not participate in campus organizations?', '[\"Heavy academic demands\",\"Financial constraints\",\"Lack of time\"]', 'Heavy academic demands', 2.00, NULL, '2026-10-02 02:49:55'),
(16, 12, 59, 1, 'mcq', 'What is the main goal of the Commission on Higher Education (CHED) for the Bachelor of Science in Criminology program?', '[\"To produce graduates who are technically proficient\",\"To produce graduates who are socially aware and ready for public service\"]', 'To produce graduates who are socially aware and ready for public service', 2.00, NULL, '2026-10-02 02:49:55'),
(17, 12, 62, 2, 'mcq', 'What is one way that campus organizations can help Criminology students develop interpersonal qualities?', '[\"Through lectures alone\",\"Through student-led organizational hierarchies\"]', 'Through student-led organizational hierarchies', 2.00, NULL, '2026-10-02 02:49:55'),
(18, 12, 65, 3, 'mcq', 'What is one way that campus organizations can help Criminology students develop emotional intelligence?', '[\"Through lectures alone\",\"Through student-led organizational hierarchies\"]', 'Through student-led organizational hierarchies', 2.00, NULL, '2026-10-02 02:49:55'),
(19, 12, 57, 4, 'identification', 'What is the name of the theory that states a student\'s growth is directly proportional to the physical and psychological energy they invest in the college experience?', NULL, 'Astin\'s Theory of Student Involvement', 3.00, NULL, '2026-10-02 02:49:55'),
(20, 12, 60, 5, 'identification', 'What is the name of the law that emphasizes the need for Criminologists to maintain high ethical standards and leadership capabilities?', NULL, 'Republic Act No. 11131', 3.00, NULL, '2026-10-02 02:49:55'),
(21, 12, 63, 6, 'identification', 'What is the name of the theory that suggests that students who engage in extracurricular activities gain hands-on experience that prepares them for real-world workplace demands?', NULL, 'Malafaia et al. (2023)', 3.00, NULL, '2026-10-02 02:49:55'),
(22, 12, 58, 7, 'enumeration', 'What are two ways that campus organizations can help Criminology students develop leadership skills?', NULL, 'Refining leadership skills,Developing social responsibility', 4.00, NULL, '2026-10-02 02:49:55'),
(23, 12, 61, 8, 'enumeration', 'What are two ways that financial constraints can affect Criminology students\' participation in campus organizations?', NULL, 'Making membership fees unaffordable,Requiring specialized uniforms', 4.00, NULL, '2026-10-02 02:49:55'),
(24, 12, 64, 9, 'enumeration', 'What are two ways that campus organizations can help Criminology students develop critical thinking skills?', NULL, 'Through leadership roles,Through problem-solving activities', 4.00, NULL, '2026-10-02 02:49:55'),
(25, 13, 67, 0, 'mcq', 'What is the purpose of using NTFS on a Linux server?', '[\"To create a separate file system for company archives\",\"To create a separate file system for finance records\",\"To allow files to be read directly on a Windows machine\",\"To create a separate file system for storage\"]', '3', 1.00, NULL, '2026-10-02 03:42:41'),
(26, 13, 71, 1, 'mcq', 'What is the command used to create a partition on a raw disk using fdisk?', '[\"sudo fdisk -l\",\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\"]', '4', 1.00, NULL, '2026-10-02 03:42:41'),
(27, 13, 74, 2, 'mcq', 'What should you do before typing a device name in a command?', '[\"Type it anyway\",\"Read the device name out loud\",\"Ask someone else\",\"Check the manual\"]', '2', 1.00, NULL, '2026-10-02 03:42:41'),
(28, 13, 76, 3, 'mcq', 'What is the command used to format a partition with the ext4 file system?', '[\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\",\"sudo l\"]', '1', 1.00, NULL, '2026-10-02 03:42:41'),
(29, 13, 80, 4, 'mcq', 'What is the purpose of using a snapshot?', '[\"To create a new file system\",\"To create a new partition\",\"To have an undo button\",\"To create a new device\"]', '3', 1.00, NULL, '2026-10-02 03:42:41'),
(30, 13, 85, 5, 'mcq', 'What should you do with the output of the lsblk command?', '[\"Ignore it\",\"Use it to create a partition\",\"Use it to format a partition\",\"Use it to mount a partition\"]', '2', 1.00, NULL, '2026-10-02 03:42:41'),
(31, 13, 68, 6, 'identification', 'What is the name of the file system used for Storage 1?', NULL, 'ext4', 2.00, NULL, '2026-10-02 03:42:41'),
(32, 13, 69, 7, 'identification', 'What is the name of the file system used for Storage 2?', NULL, 'NTFS', 2.00, NULL, '2026-10-02 03:42:41'),
(33, 13, 72, 8, 'identification', 'What is the purpose of taking a snapshot before running destructive commands?', NULL, 'To have an undo button', 2.00, NULL, '2026-10-02 03:42:41'),
(34, 13, 73, 9, 'identification', 'What is the name of the device used for the existing system disk?', NULL, '/dev/sda', 2.00, NULL, '2026-10-02 03:42:41'),
(35, 13, 77, 10, 'identification', 'What is the purpose of creating a mount point?', NULL, 'To mount a partition', 2.00, NULL, '2026-10-02 03:42:41'),
(36, 13, 78, 11, 'identification', 'What is the command used to mount a partition?', NULL, 'sudo mount', 2.00, NULL, '2026-10-02 03:42:41'),
(37, 13, 79, 12, 'identification', 'What is the command used to unmount a partition?', NULL, 'sudo umount', 2.00, NULL, '2026-10-02 03:42:41'),
(38, 13, 81, 13, 'identification', 'What is the name of the package used to install the NTFS-3g package?', NULL, 'ntfs-3g', 2.00, NULL, '2026-10-02 03:42:41'),
(39, 13, 82, 14, 'identification', 'What is the purpose of using VirtualBox?', NULL, 'To create a virtual machine', 2.00, NULL, '2026-10-02 03:42:41'),
(40, 13, 83, 15, 'identification', 'What is the purpose of taking a screenshot?', NULL, 'To capture the whole terminal window or the whole VirtualBox dialog', 2.00, NULL, '2026-10-02 03:42:41'),
(41, 13, 84, 16, 'identification', 'What is the rule for labeling each image?', NULL, 'With its code (SS-01, SS-02, ...)', 2.00, NULL, '2026-10-02 03:42:41'),
(42, 13, 70, 17, 'enumeration', 'List the two file systems used for Storage 1 and Storage 2', NULL, 'ext4, NTFS', 1.00, NULL, '2026-10-02 03:42:41'),
(43, 13, 75, 18, 'enumeration', 'List the four parts of a block device name', NULL, 'device, type, partition, file system', 1.00, NULL, '2026-10-02 03:42:41'),
(44, 14, 86, 0, 'activity', 'Students work in pairs on a short Grade 1 task about \"PT3\" (Science). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 03:59:24'),
(45, 15, 66, 0, 'activity', 'Work in groups to design a campus organization that can help Criminology students develop leadership skills, social responsibility, and emotional intelligence. Consider the challenges that Criminology students may face and how your organization can address them.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Creativity\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"The organization is innovative and addresses a specific challenge faced by Criminology students.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"The organization is well-thought-out and addresses a common challenge faced by Criminology students.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"The organization is basic and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"The organization is not well-designed and does not address a specific challenge faced by Criminology students.\"}]},{\"name\":\"Practicality\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"The organization is practical and addresses a specific challenge faced by Criminology students.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"The organization is basic and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"The organization is not well-designed and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"The organization is not practical and does not address a specific challenge faced by Criminology students.\"}]}]}', '2026-10-02 04:00:26'),
(46, 16, 86, 0, 'activity', 'Students work in pairs on a short Grade 1 task about \"PT3\" (Science). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 05:18:09'),
(47, 17, 67, 0, 'mcq', 'What is the purpose of using NTFS on a Linux server?', '[\"To create a separate file system for company archives\",\"To create a separate file system for finance records\",\"To allow files to be read directly on a Windows machine\",\"To create a separate file system for storage\"]', '3', 1.00, NULL, '2026-10-02 05:20:12'),
(48, 17, 71, 1, 'mcq', 'What is the command used to create a partition on a raw disk using fdisk?', '[\"sudo fdisk -l\",\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\"]', '4', 1.00, NULL, '2026-10-02 05:20:12'),
(49, 17, 74, 2, 'mcq', 'What should you do before typing a device name in a command?', '[\"Type it anyway\",\"Read the device name out loud\",\"Ask someone else\",\"Check the manual\"]', '2', 1.00, NULL, '2026-10-02 05:20:12'),
(50, 17, 76, 3, 'mcq', 'What is the command used to format a partition with the ext4 file system?', '[\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\",\"sudo l\"]', '1', 1.00, NULL, '2026-10-02 05:20:12'),
(51, 17, 80, 4, 'mcq', 'What is the purpose of using a snapshot?', '[\"To create a new file system\",\"To create a new partition\",\"To have an undo button\",\"To create a new device\"]', '3', 1.00, NULL, '2026-10-02 05:20:12'),
(52, 17, 85, 5, 'mcq', 'What should you do with the output of the lsblk command?', '[\"Ignore it\",\"Use it to create a partition\",\"Use it to format a partition\",\"Use it to mount a partition\"]', '2', 1.00, NULL, '2026-10-02 05:20:12'),
(53, 17, 68, 6, 'identification', 'What is the name of the file system used for Storage 1?', NULL, 'ext4', 2.00, NULL, '2026-10-02 05:20:12'),
(54, 17, 69, 7, 'identification', 'What is the name of the file system used for Storage 2?', NULL, 'NTFS', 2.00, NULL, '2026-10-02 05:20:12'),
(55, 17, 72, 8, 'identification', 'What is the purpose of taking a snapshot before running destructive commands?', NULL, 'To have an undo button', 2.00, NULL, '2026-10-02 05:20:12'),
(56, 17, 73, 9, 'identification', 'What is the name of the device used for the existing system disk?', NULL, '/dev/sda', 2.00, NULL, '2026-10-02 05:20:12'),
(57, 17, 77, 10, 'identification', 'What is the purpose of creating a mount point?', NULL, 'To mount a partition', 2.00, NULL, '2026-10-02 05:20:12'),
(58, 17, 78, 11, 'identification', 'What is the command used to mount a partition?', NULL, 'sudo mount', 2.00, NULL, '2026-10-02 05:20:12'),
(59, 17, 79, 12, 'identification', 'What is the command used to unmount a partition?', NULL, 'sudo umount', 2.00, NULL, '2026-10-02 05:20:12'),
(60, 17, 81, 13, 'identification', 'What is the name of the package used to install the NTFS-3g package?', NULL, 'ntfs-3g', 2.00, NULL, '2026-10-02 05:20:12'),
(61, 17, 82, 14, 'identification', 'What is the purpose of using VirtualBox?', NULL, 'To create a virtual machine', 2.00, NULL, '2026-10-02 05:20:12'),
(62, 17, 83, 15, 'identification', 'What is the purpose of taking a screenshot?', NULL, 'To capture the whole terminal window or the whole VirtualBox dialog', 2.00, NULL, '2026-10-02 05:20:12'),
(63, 17, 84, 16, 'identification', 'What is the rule for labeling each image?', NULL, 'With its code (SS-01, SS-02, ...)', 2.00, NULL, '2026-10-02 05:20:12'),
(64, 17, 70, 17, 'enumeration', 'List the two file systems used for Storage 1 and Storage 2', NULL, 'ext4, NTFS', 1.00, NULL, '2026-10-02 05:20:12'),
(65, 17, 75, 18, 'enumeration', 'List the four parts of a block device name', NULL, 'device, type, partition, file system', 1.00, NULL, '2026-10-02 05:20:12'),
(66, 18, 45, 0, 'mcq', 'What is the number of legs on a chair?', '[\"2\",\"4\",\"6\",\"8\"]', '4', 2.00, NULL, '2026-10-02 05:32:32'),
(67, 18, 48, 1, 'mcq', 'How many wheels does a bicycle have?', '[\"1\",\"2\",\"3\",\"4\"]', '2', 2.00, NULL, '2026-10-02 05:32:32'),
(68, 18, 51, 2, 'mcq', 'How many sides does a triangle have?', '[\"2\",\"3\",\"4\",\"5\"]', '3', 2.00, NULL, '2026-10-02 05:32:32'),
(69, 18, 54, 3, 'mcq', 'How many legs does a dog have?', '[\"1\",\"2\",\"3\",\"4\"]', '4', 2.00, NULL, '2026-10-02 05:32:32'),
(70, 18, 46, 4, 'identification', 'What is the sum of 2 + 2?', NULL, '4', 2.00, NULL, '2026-10-02 05:32:32'),
(71, 18, 49, 5, 'identification', 'What is the shape of a square?', NULL, '4 sides', 2.00, NULL, '2026-10-02 05:32:32'),
(72, 18, 52, 6, 'identification', 'What is the number that comes after 5?', NULL, '6', 2.00, NULL, '2026-10-02 05:32:32'),
(73, 18, 47, 7, 'enumeration', 'List 3 numbers that are greater than 5.', NULL, '6,7,8', 2.00, NULL, '2026-10-02 05:32:32'),
(74, 18, 50, 8, 'enumeration', 'List 2 shapes that are used in art.', NULL, 'circle,triangle', 2.00, NULL, '2026-10-02 05:32:32'),
(75, 18, 53, 9, 'enumeration', 'List 3 colors of the rainbow.', NULL, 'red,blue,green', 2.00, NULL, '2026-10-02 05:32:32'),
(76, 19, 55, 0, 'activity', 'Students work in pairs on a short Grade 1 task about \"try\" (Mathematics). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 05:34:11'),
(77, 20, 34, 0, 'mcq', 'Why did Isla Verde Trading Corp. choose to use NTFS on their Linux server?', '[\"Because it\'s a Windows file system\",\"Because it\'s a Linux file system\",\"Because it allows files to be read directly on a Windows machine\",\"Because it\'s more secure\"]', '3', 1.00, NULL, '2026-10-02 05:57:24'),
(78, 20, 37, 1, 'mcq', 'What is the purpose of taking a snapshot before running destructive commands?', '[\"To create a backup of the disk\",\"To undo any changes made to the disk\",\"To install new software\",\"To upgrade the operating system\"]', '2', 1.00, NULL, '2026-10-02 05:57:24'),
(79, 20, 40, 2, 'mcq', 'What is the correct command to list the block device names?', '[\"lsblk\",\"sudo lsblk\",\"sudo -i lsblk\",\"sudo lsblk -l\"]', '2', 1.00, NULL, '2026-10-02 05:57:24'),
(80, 20, 43, 3, 'mcq', 'What is the correct command to write data to a partition?', '[\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"sudo echo \'Hello World!\' > /dev/sda1\'\",\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"sudo echo \'Hello World!\' > /dev/sda1\"]', '2', 1.00, NULL, '2026-10-02 05:57:24'),
(81, 20, 35, 4, 'identification', 'What does /dev/sda refer to?', NULL, 'The existing system disk', 1.00, NULL, '2026-10-02 05:57:24'),
(82, 20, 38, 5, 'identification', 'What is the purpose of the \'sudo\' command?', NULL, 'To gain superuser privileges', 1.00, NULL, '2026-10-02 05:57:24'),
(83, 20, 41, 6, 'identification', 'What is the purpose of the \'mkfs.ext4\' command?', NULL, 'To format a partition with the ext4 file system', 1.00, NULL, '2026-10-02 05:57:24'),
(84, 20, 36, 7, 'enumeration', 'List the two file systems used on the new disks', NULL, 'ext4, NTFS', 1.00, NULL, '2026-10-02 05:57:24'),
(85, 20, 39, 8, 'enumeration', 'List the four required screenshots for this task', NULL, 'SS-01, SS-02, SS-03, SS-04', 1.00, NULL, '2026-10-02 05:57:24'),
(86, 20, 42, 9, 'enumeration', 'List the two partitions created on Storage 2', NULL, 'Partition 1 - 15 GB, Partition 2 - remaining 15 GB', 1.00, NULL, '2026-10-02 05:57:24'),
(87, 21, 23, 0, 'mcq', 'What is the main reason why Criminology students at USANT are not participating in campus organizations?', '[\"Heavy academic demands\",\"Financial constraints\",\"Both A and B\"]', 'Both A and B', 2.00, NULL, '2026-10-02 06:51:28'),
(88, 21, 26, 1, 'mcq', 'What is the main goal of the Commission on Higher Education (CHED) regarding Criminology education?', '[\"To produce graduates who are technically proficient\",\"To produce graduates who are socially aware and ready for public service\",\"Both A and B\"]', 'Both A and B', 2.00, NULL, '2026-10-02 06:51:28'),
(89, 21, 29, 2, 'mcq', 'What is the main reason why Criminology students at USANT are not participating in campus organizations?', '[\"Lack of time\",\"Lack of interest\",\"Financial constraints\"]', 'Financial constraints', 2.00, NULL, '2026-10-02 06:51:28'),
(90, 21, 32, 3, 'mcq', 'What is the main goal of campus organizations for Criminology students?', '[\"To provide a social life\",\"To provide a leadership opportunity\",\"To provide a training ground for future officers\"]', 'To provide a training ground for future officers', 2.00, NULL, '2026-10-02 06:51:28'),
(91, 21, 24, 4, 'identification', 'What is the name of the theory that posits a student\'s growth is directly proportional to the physical and psychological energy they invest in the college experience?', NULL, 'Astin\'s Theory of Student Involvement', 2.00, NULL, '2026-10-02 06:51:28'),
(92, 21, 27, 5, 'identification', 'What is the name of the law that underscores the need for Criminologists to maintain high ethical standards and leadership capabilities?', NULL, 'Republic Act No. 11131', 2.00, NULL, '2026-10-02 06:51:28'),
(93, 21, 30, 6, 'identification', 'What is the name of the study that suggests that students who engage in extracurricular activities gain hands-on experience that effectively prepares them for real-world workplace demands?', NULL, 'Malafaia et al. (2023)', 2.00, NULL, '2026-10-02 06:51:28'),
(94, 21, 25, 7, 'enumeration', 'What are some of the barriers that hinder Criminology students\' participation in campus organizations?', NULL, 'Heavy academic demands,Financial constraints,Both A and B', 2.00, NULL, '2026-10-02 06:51:28'),
(95, 21, 28, 8, 'enumeration', 'What are some of the benefits of student participation in campus organizations?', NULL, 'Leadership skills,Critical thinking skills,Social responsibility', 2.00, NULL, '2026-10-02 06:51:28'),
(96, 21, 31, 9, 'enumeration', 'What are some of the ways that campus organizations can serve as training grounds for future officers?', NULL, 'Leadership skills,Critical thinking skills,Social responsibility', 2.00, NULL, '2026-10-02 06:51:28'),
(97, 22, 67, 0, 'mcq', 'What is the purpose of using NTFS on a Linux server?', '[\"To create a separate file system for company archives\",\"To create a separate file system for finance records\",\"To allow files to be read directly on a Windows machine\",\"To create a separate file system for storage\"]', '3', 1.00, NULL, '2026-10-02 08:00:52'),
(98, 22, 71, 1, 'mcq', 'What is the command used to create a partition on a raw disk using fdisk?', '[\"sudo fdisk -l\",\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\"]', '4', 1.00, NULL, '2026-10-02 08:00:52'),
(99, 22, 74, 2, 'mcq', 'What should you do before typing a device name in a command?', '[\"Type it anyway\",\"Read the device name out loud\",\"Ask someone else\",\"Check the manual\"]', '2', 1.00, NULL, '2026-10-02 08:00:52'),
(100, 22, 76, 3, 'mcq', 'What is the command used to format a partition with the ext4 file system?', '[\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\",\"sudo l\"]', '1', 1.00, NULL, '2026-10-02 08:00:52'),
(101, 22, 80, 4, 'mcq', 'What is the purpose of using a snapshot?', '[\"To create a new file system\",\"To create a new partition\",\"To have an undo button\",\"To create a new device\"]', '3', 1.00, NULL, '2026-10-02 08:00:52'),
(102, 22, 85, 5, 'mcq', 'What should you do with the output of the lsblk command?', '[\"Ignore it\",\"Use it to create a partition\",\"Use it to format a partition\",\"Use it to mount a partition\"]', '2', 1.00, NULL, '2026-10-02 08:00:52'),
(103, 22, 68, 6, 'identification', 'What is the name of the file system used for Storage 1?', NULL, 'ext4', 1.00, NULL, '2026-10-02 08:00:52'),
(104, 22, 69, 7, 'identification', 'What is the name of the file system used for Storage 2?', NULL, 'NTFS', 1.00, NULL, '2026-10-02 08:00:52'),
(105, 22, 72, 8, 'identification', 'What is the purpose of taking a snapshot before running destructive commands?', NULL, 'To have an undo button', 1.00, NULL, '2026-10-02 08:00:52'),
(106, 22, 73, 9, 'identification', 'What is the name of the device used for the existing system disk?', NULL, '/dev/sda', 1.00, NULL, '2026-10-02 08:00:52'),
(107, 22, 77, 10, 'identification', 'What is the purpose of creating a mount point?', NULL, 'To mount a partition', 1.00, NULL, '2026-10-02 08:00:52'),
(108, 22, 78, 11, 'identification', 'What is the command used to mount a partition?', NULL, 'sudo mount', 1.00, NULL, '2026-10-02 08:00:52'),
(109, 22, 79, 12, 'identification', 'What is the command used to unmount a partition?', NULL, 'sudo umount', 1.00, NULL, '2026-10-02 08:00:52'),
(110, 22, 81, 13, 'identification', 'What is the name of the package used to install the NTFS-3g package?', NULL, 'ntfs-3g', 1.00, NULL, '2026-10-02 08:00:52'),
(111, 22, 82, 14, 'identification', 'What is the purpose of using VirtualBox?', NULL, 'To create a virtual machine', 1.00, NULL, '2026-10-02 08:00:52'),
(112, 22, 83, 15, 'identification', 'What is the purpose of taking a screenshot?', NULL, 'To capture the whole terminal window or the whole VirtualBox dialog', 1.00, NULL, '2026-10-02 08:00:52'),
(113, 22, 84, 16, 'identification', 'What is the rule for labeling each image?', NULL, 'With its code (SS-01, SS-02, ...)', 1.00, NULL, '2026-10-02 08:00:52'),
(114, 22, 70, 17, 'enumeration', 'List the two file systems used for Storage 1 and Storage 2', NULL, 'ext4, NTFS', 1.00, NULL, '2026-10-02 08:00:52'),
(115, 22, 75, 18, 'enumeration', 'List the four parts of a block device name', NULL, 'device, type, partition, file system', 1.00, NULL, '2026-10-02 08:00:52'),
(116, 22, 34, 19, 'mcq', 'Why did Isla Verde Trading Corp. choose to use NTFS on their Linux server?', '[\"Because it\'s a Windows file system\",\"Because it\'s a Linux file system\",\"Because it allows files to be read directly on a Windows machine\",\"Because it\'s more secure\"]', '3', 1.00, NULL, '2026-10-02 08:00:52'),
(117, 22, 37, 20, 'mcq', 'What is the purpose of taking a snapshot before running destructive commands?', '[\"To create a backup of the disk\",\"To undo any changes made to the disk\",\"To install new software\",\"To upgrade the operating system\"]', '2', 1.00, NULL, '2026-10-02 08:00:52'),
(118, 22, 40, 21, 'mcq', 'What is the correct command to list the block device names?', '[\"lsblk\",\"sudo lsblk\",\"sudo -i lsblk\",\"sudo lsblk -l\"]', '2', 1.00, NULL, '2026-10-02 08:00:52'),
(119, 22, 43, 22, 'mcq', 'What is the correct command to write data to a partition?', '[\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"sudo echo \'Hello World!\' > /dev/sda1\'\",\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"sudo echo \'Hello World!\' > /dev/sda1\"]', '2', 1.00, NULL, '2026-10-02 08:00:52'),
(120, 22, 35, 23, 'identification', 'What does /dev/sda refer to?', NULL, 'The existing system disk', 1.00, NULL, '2026-10-02 08:00:52'),
(121, 22, 38, 24, 'identification', 'What is the purpose of the \'sudo\' command?', NULL, 'To gain superuser privileges', 1.00, NULL, '2026-10-02 08:00:52'),
(122, 22, 41, 25, 'identification', 'What is the purpose of the \'mkfs.ext4\' command?', NULL, 'To format a partition with the ext4 file system', 1.00, NULL, '2026-10-02 08:00:52'),
(123, 22, 36, 26, 'enumeration', 'List the two file systems used on the new disks', NULL, 'ext4, NTFS', 1.00, NULL, '2026-10-02 08:00:52'),
(124, 22, 39, 27, 'enumeration', 'List the four required screenshots for this task', NULL, 'SS-01, SS-02, SS-03, SS-04', 1.00, NULL, '2026-10-02 08:00:52'),
(125, 22, 42, 28, 'enumeration', 'List the two partitions created on Storage 2', NULL, 'Partition 1 - 15 GB, Partition 2 - remaining 15 GB', 1.00, NULL, '2026-10-02 08:00:52'),
(126, 22, 12, 29, 'mcq', 'What is the function of the root of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To grow up from the ground and catch the sun.\"]', 'To anchor the plant in the ground.', 1.00, NULL, '2026-10-02 08:00:52'),
(127, 22, 15, 30, 'mcq', 'What is the function of the leaf of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To breathe the air and catch the sun.\"]', 'To breathe the air and catch the sun.', 1.00, NULL, '2026-10-02 08:00:52'),
(128, 22, 18, 31, 'mcq', 'What is the function of the stem of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To grow up from the ground and catch the sun.\"]', 'To grow up from the ground and catch the sun.', 1.00, NULL, '2026-10-02 08:00:52'),
(129, 22, 21, 32, 'mcq', 'What is the function of the fruit of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To hold the seeds and feed the ground.\"]', 'To hold the seeds and feed the ground.', 1.00, NULL, '2026-10-02 08:00:52'),
(130, 22, 13, 33, 'identification', 'What is the name of the part of the plant that holds the seeds?', NULL, 'Seed', 1.00, NULL, '2026-10-02 08:00:52'),
(131, 22, 16, 34, 'identification', 'What is the name of the part of the plant that produces flowers?', NULL, 'Flower', 1.00, NULL, '2026-10-02 08:00:52'),
(132, 22, 19, 35, 'identification', 'What is the name of the part of the plant that is used for planting?', NULL, 'Seed', 1.00, NULL, '2026-10-02 08:00:52'),
(133, 22, 14, 36, 'enumeration', 'Name the three parts of the plant that we use for food:', NULL, 'Fruit, Leaf, and Root', 1.00, NULL, '2026-10-02 08:00:52'),
(134, 22, 17, 37, 'enumeration', 'Name the two parts of the plant that are fruits:', NULL, 'Peppers, Zucchini', 1.00, NULL, '2026-10-02 08:00:52'),
(135, 22, 20, 38, 'enumeration', 'Name the three parts of the plant that we use for food:', NULL, 'Leaf, Root, Fruit', 1.00, NULL, '2026-10-02 08:00:52'),
(136, 22, 1, 39, 'mcq', 'Why was NTFS chosen on the Linux server?', '[\"It is a faster file system.\",\"It is more secure than ext4.\",\"It allows files to be read directly on a Windows machine.\",\"It is only for Linux users.\"]', 'It allows files to be read directly on a Windows machine.', 1.00, NULL, '2026-10-02 08:00:52'),
(137, 22, 4, 40, 'mcq', 'What is the purpose of taking a snapshot before running destructive commands?', '[\"To create a backup of the disk.\",\"To erase the disk completely.\",\"To undo any changes made to the disk.\",\"To increase the disk size.\"]', 'To undo any changes made to the disk.', 1.00, NULL, '2026-10-02 08:00:52'),
(138, 22, 7, 41, 'mcq', 'What is the purpose of formatting a file system?', '[\"To increase the disk size.\",\"To erase the disk completely.\",\"To create a new partition.\",\"To make the file system usable by the operating system.\"]', 'To make the file system usable by the operating system.', 1.00, NULL, '2026-10-02 08:00:52'),
(139, 22, 10, 42, 'mcq', 'What is the recommended way to document your work?', '[\"To write a report.\",\"To create a video.\",\"To insert images into a Word document.\",\"To paste text into a document.\"]', 'To insert images into a Word document.', 1.00, NULL, '2026-10-02 08:00:52'),
(140, 22, 2, 43, 'identification', 'What does /dev/sda represent?', NULL, 'The existing system disk.', 1.00, NULL, '2026-10-02 08:00:52'),
(141, 22, 5, 44, 'identification', 'What is the name of the command used to create a partition table on Storage 1?', NULL, 'fdisk', 1.00, NULL, '2026-10-02 08:00:52'),
(142, 22, 8, 45, 'identification', 'What is the name of the command used to mount a partition?', NULL, 'mount', 1.00, NULL, '2026-10-02 08:00:52'),
(143, 22, 3, 46, 'enumeration', 'List the two file systems used on the new disks.', NULL, 'ext4, NTFS', 1.00, NULL, '2026-10-02 08:00:52'),
(144, 22, 6, 47, 'enumeration', 'List the two partitions created on Storage 2.', NULL, 'Partition 1 - 15 GB, Partition 2 - remaining 15 GB', 1.00, NULL, '2026-10-02 08:00:52'),
(145, 22, 9, 48, 'enumeration', 'List the three file systems mentioned in the task.', NULL, 'ext4, NTFS, Windows', 1.00, NULL, '2026-10-02 08:00:52'),
(146, 23, 87, 0, 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\",\"An action\"]', 'A thing', 2.00, NULL, '2026-10-04 09:04:00'),
(147, 23, 90, 1, 'mcq', 'What is the function of pronouns?', '[\"To replace verbs\",\"To replace nouns\",\"To replace adjectives\",\"To replace adverbs\"]', 'To replace nouns', 2.00, NULL, '2026-10-04 09:04:00'),
(148, 23, 93, 2, 'mcq', 'What is the purpose of helping verbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, NULL, '2026-10-04 09:04:00'),
(149, 23, 96, 3, 'mcq', 'What is the function of adverbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, NULL, '2026-10-04 09:04:00'),
(150, 23, 88, 4, 'identification', 'What is the part of speech that describes a noun?', NULL, 'Adjective', 2.00, NULL, '2026-10-04 09:04:00'),
(151, 23, 91, 5, 'identification', 'What is the part of speech that describes a verb?', NULL, 'Adverb', 2.00, NULL, '2026-10-04 09:04:00'),
(152, 23, 94, 6, 'identification', 'What is the difference between a singular and plural noun?', NULL, 'A singular noun refers to one person, place, or thing, while a plural noun refers to more than one.', 2.00, NULL, '2026-10-04 09:04:00'),
(153, 23, 89, 7, 'enumeration', 'List 3 types of nouns:', NULL, 'Proper noun,Common noun,Collective noun', 2.00, NULL, '2026-10-04 09:04:00'),
(154, 23, 92, 8, 'enumeration', 'List 3 types of verbs:', NULL, 'Action verb,Linking verb,Auxiliary verb', 2.00, NULL, '2026-10-04 09:04:00'),
(155, 23, 95, 9, 'enumeration', 'List 3 examples of adjectives:', NULL, 'Describing size,Describing color,Describing shape', 2.00, NULL, '2026-10-04 09:04:00'),
(156, 24, 97, 0, 'activity', 'Students work in pairs on a short Grade 1 task about \"Nouns & Verbs\" (English). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-04 09:09:48'),
(157, 25, 56, 0, 'mcq', 'What is the main reason why Criminology students may not participate in campus organizations?', '[\"Heavy academic demands\",\"Financial constraints\",\"Lack of time\"]', 'Heavy academic demands', 1.00, NULL, '2026-10-04 09:22:03'),
(158, 25, 59, 1, 'mcq', 'What is the main goal of the Commission on Higher Education (CHED) for the Bachelor of Science in Criminology program?', '[\"To produce graduates who are technically proficient\",\"To produce graduates who are socially aware and ready for public service\"]', 'To produce graduates who are socially aware and ready for public service', 1.00, NULL, '2026-10-04 09:22:03'),
(159, 25, 62, 2, 'mcq', 'What is one way that campus organizations can help Criminology students develop interpersonal qualities?', '[\"Through lectures alone\",\"Through student-led organizational hierarchies\"]', 'Through student-led organizational hierarchies', 1.00, NULL, '2026-10-04 09:22:03'),
(160, 25, 65, 3, 'mcq', 'What is one way that campus organizations can help Criminology students develop emotional intelligence?', '[\"Through lectures alone\",\"Through student-led organizational hierarchies\"]', 'Through student-led organizational hierarchies', 1.00, NULL, '2026-10-04 09:22:03'),
(161, 25, 57, 4, 'identification', 'What is the name of the theory that states a student\'s growth is directly proportional to the physical and psychological energy they invest in the college experience?', NULL, 'Astin\'s Theory of Student Involvement', 1.00, NULL, '2026-10-04 09:22:03'),
(162, 25, 60, 5, 'identification', 'What is the name of the law that emphasizes the need for Criminologists to maintain high ethical standards and leadership capabilities?', NULL, 'Republic Act No. 11131', 1.00, NULL, '2026-10-04 09:22:03'),
(163, 25, 63, 6, 'identification', 'What is the name of the theory that suggests that students who engage in extracurricular activities gain hands-on experience that prepares them for real-world workplace demands?', NULL, 'Malafaia et al. (2023)', 1.00, NULL, '2026-10-04 09:22:03'),
(164, 25, 58, 7, 'enumeration', 'What are two ways that campus organizations can help Criminology students develop leadership skills?', NULL, 'Refining leadership skills,Developing social responsibility', 1.00, NULL, '2026-10-04 09:22:03'),
(165, 25, 61, 8, 'enumeration', 'What are two ways that financial constraints can affect Criminology students\' participation in campus organizations?', NULL, 'Making membership fees unaffordable,Requiring specialized uniforms', 1.00, NULL, '2026-10-04 09:22:03'),
(166, 25, 64, 9, 'enumeration', 'What are two ways that campus organizations can help Criminology students develop critical thinking skills?', NULL, 'Through leadership roles,Through problem-solving activities', 1.00, NULL, '2026-10-04 09:22:03'),
(167, 25, 45, 10, 'mcq', 'What is the number of legs on a chair?', '[\"2\",\"4\",\"6\",\"8\"]', '4', 1.00, NULL, '2026-10-04 09:22:03'),
(168, 25, 48, 11, 'mcq', 'How many wheels does a bicycle have?', '[\"1\",\"2\",\"3\",\"4\"]', '2', 1.00, NULL, '2026-10-04 09:22:03'),
(169, 25, 51, 12, 'mcq', 'How many sides does a triangle have?', '[\"2\",\"3\",\"4\",\"5\"]', '3', 1.00, NULL, '2026-10-04 09:22:03'),
(170, 25, 54, 13, 'mcq', 'How many legs does a dog have?', '[\"1\",\"2\",\"3\",\"4\"]', '4', 1.00, NULL, '2026-10-04 09:22:03'),
(171, 25, 46, 14, 'identification', 'What is the sum of 2 + 2?', NULL, '4', 1.00, NULL, '2026-10-04 09:22:03'),
(172, 25, 49, 15, 'identification', 'What is the shape of a square?', NULL, '4 sides', 1.00, NULL, '2026-10-04 09:22:03'),
(173, 25, 52, 16, 'identification', 'What is the number that comes after 5?', NULL, '6', 1.00, NULL, '2026-10-04 09:22:03'),
(174, 25, 47, 17, 'enumeration', 'List 3 numbers that are greater than 5.', NULL, '6,7,8', 1.00, NULL, '2026-10-04 09:22:03'),
(175, 25, 50, 18, 'enumeration', 'List 2 shapes that are used in art.', NULL, 'circle,triangle', 1.00, NULL, '2026-10-04 09:22:03'),
(176, 25, 53, 19, 'enumeration', 'List 3 colors of the rainbow.', NULL, 'red,blue,green', 1.00, NULL, '2026-10-04 09:22:03'),
(177, 25, 23, 20, 'mcq', 'What is the main reason why Criminology students at USANT are not participating in campus organizations?', '[\"Heavy academic demands\",\"Financial constraints\",\"Both A and B\"]', 'Both A and B', 1.00, NULL, '2026-10-04 09:22:03'),
(178, 25, 26, 21, 'mcq', 'What is the main goal of the Commission on Higher Education (CHED) regarding Criminology education?', '[\"To produce graduates who are technically proficient\",\"To produce graduates who are socially aware and ready for public service\",\"Both A and B\"]', 'Both A and B', 1.00, NULL, '2026-10-04 09:22:03'),
(179, 25, 29, 22, 'mcq', 'What is the main reason why Criminology students at USANT are not participating in campus organizations?', '[\"Lack of time\",\"Lack of interest\",\"Financial constraints\"]', 'Financial constraints', 1.00, NULL, '2026-10-04 09:22:03'),
(180, 25, 32, 23, 'mcq', 'What is the main goal of campus organizations for Criminology students?', '[\"To provide a social life\",\"To provide a leadership opportunity\",\"To provide a training ground for future officers\"]', 'To provide a training ground for future officers', 1.00, NULL, '2026-10-04 09:22:03'),
(181, 25, 24, 24, 'identification', 'What is the name of the theory that posits a student\'s growth is directly proportional to the physical and psychological energy they invest in the college experience?', NULL, 'Astin\'s Theory of Student Involvement', 1.00, NULL, '2026-10-04 09:22:03'),
(182, 25, 27, 25, 'identification', 'What is the name of the law that underscores the need for Criminologists to maintain high ethical standards and leadership capabilities?', NULL, 'Republic Act No. 11131', 1.00, NULL, '2026-10-04 09:22:03'),
(183, 25, 30, 26, 'identification', 'What is the name of the study that suggests that students who engage in extracurricular activities gain hands-on experience that effectively prepares them for real-world workplace demands?', NULL, 'Malafaia et al. (2023)', 1.00, NULL, '2026-10-04 09:22:03'),
(184, 25, 25, 27, 'enumeration', 'What are some of the barriers that hinder Criminology students\' participation in campus organizations?', NULL, 'Heavy academic demands,Financial constraints,Both A and B', 1.00, NULL, '2026-10-04 09:22:03');
INSERT INTO `assessment_questions` (`id`, `assessment_id`, `question_bank_id`, `sort_order`, `item_type`, `question`, `choices`, `answer`, `points`, `rubric`, `created_at`) VALUES
(185, 25, 28, 28, 'enumeration', 'What are some of the benefits of student participation in campus organizations?', NULL, 'Leadership skills,Critical thinking skills,Social responsibility', 1.00, NULL, '2026-10-04 09:22:03'),
(186, 25, 31, 29, 'enumeration', 'What are some of the ways that campus organizations can serve as training grounds for future officers?', NULL, 'Leadership skills,Critical thinking skills,Social responsibility', 1.00, NULL, '2026-10-04 09:22:03'),
(187, 26, 87, 0, 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\",\"An action\"]', 'A thing', 2.00, NULL, '2026-10-06 06:38:42'),
(188, 26, 90, 1, 'mcq', 'What is the function of pronouns?', '[\"To replace verbs\",\"To replace nouns\",\"To replace adjectives\",\"To replace adverbs\"]', 'To replace nouns', 2.00, NULL, '2026-10-06 06:38:42'),
(189, 26, 93, 2, 'mcq', 'What is the purpose of helping verbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, NULL, '2026-10-06 06:38:42'),
(190, 26, 96, 3, 'mcq', 'What is the function of adverbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, NULL, '2026-10-06 06:38:42'),
(191, 26, 88, 4, 'identification', 'What is the part of speech that describes a noun?', NULL, 'Adjective', 2.00, NULL, '2026-10-06 06:38:42'),
(192, 26, 91, 5, 'identification', 'What is the part of speech that describes a verb?', NULL, 'Adverb', 2.00, NULL, '2026-10-06 06:38:42'),
(193, 26, 94, 6, 'identification', 'What is the difference between a singular and plural noun?', NULL, 'A singular noun refers to one person, place, or thing, while a plural noun refers to more than one.', 2.00, NULL, '2026-10-06 06:38:42'),
(194, 26, 89, 7, 'enumeration', 'List 3 types of nouns:', NULL, 'Proper noun,Common noun,Collective noun', 3.00, NULL, '2026-10-06 06:38:42'),
(195, 26, 92, 8, 'enumeration', 'List 3 types of verbs:', NULL, 'Action verb,Linking verb,Auxiliary verb', 3.00, NULL, '2026-10-06 06:38:42'),
(196, 26, 95, 9, 'enumeration', 'List 3 examples of adjectives:', NULL, 'Describing size,Describing color,Describing shape', 3.00, NULL, '2026-10-06 06:38:42'),
(197, 27, 67, 0, 'mcq', 'What is the purpose of using NTFS on a Linux server?', '[\"To create a separate file system for company archives\",\"To create a separate file system for finance records\",\"To allow files to be read directly on a Windows machine\",\"To create a separate file system for storage\"]', '3', 1.00, NULL, '2026-10-06 06:41:36'),
(198, 27, 71, 1, 'mcq', 'What is the command used to create a partition on a raw disk using fdisk?', '[\"sudo fdisk -l\",\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\"]', '4', 1.00, NULL, '2026-10-06 06:41:36'),
(199, 27, 74, 2, 'mcq', 'What should you do before typing a device name in a command?', '[\"Type it anyway\",\"Read the device name out loud\",\"Ask someone else\",\"Check the manual\"]', '2', 1.00, NULL, '2026-10-06 06:41:36'),
(200, 27, 76, 3, 'mcq', 'What is the command used to format a partition with the ext4 file system?', '[\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\",\"sudo l\"]', '1', 1.00, NULL, '2026-10-06 06:41:36'),
(201, 27, 80, 4, 'mcq', 'What is the purpose of using a snapshot?', '[\"To create a new file system\",\"To create a new partition\",\"To have an undo button\",\"To create a new device\"]', '3', 1.00, NULL, '2026-10-06 06:41:36'),
(202, 27, 85, 5, 'mcq', 'What should you do with the output of the lsblk command?', '[\"Ignore it\",\"Use it to create a partition\",\"Use it to format a partition\",\"Use it to mount a partition\"]', '2', 1.00, NULL, '2026-10-06 06:41:36'),
(203, 27, 68, 6, 'identification', 'What is the name of the file system used for Storage 1?', NULL, 'ext4', 0.54, NULL, '2026-10-06 06:41:36'),
(204, 27, 69, 7, 'identification', 'What is the name of the file system used for Storage 2?', NULL, 'NTFS', 0.54, NULL, '2026-10-06 06:41:36'),
(205, 27, 72, 8, 'identification', 'What is the purpose of taking a snapshot before running destructive commands?', NULL, 'To have an undo button', 0.54, NULL, '2026-10-06 06:41:36'),
(206, 27, 73, 9, 'identification', 'What is the name of the device used for the existing system disk?', NULL, '/dev/sda', 0.54, NULL, '2026-10-06 06:41:36'),
(207, 27, 77, 10, 'identification', 'What is the purpose of creating a mount point?', NULL, 'To mount a partition', 0.54, NULL, '2026-10-06 06:41:36'),
(208, 27, 78, 11, 'identification', 'What is the command used to mount a partition?', NULL, 'sudo mount', 0.54, NULL, '2026-10-06 06:41:36'),
(209, 27, 79, 12, 'identification', 'What is the command used to unmount a partition?', NULL, 'sudo umount', 0.54, NULL, '2026-10-06 06:41:36'),
(210, 27, 81, 13, 'identification', 'What is the name of the package used to install the NTFS-3g package?', NULL, 'ntfs-3g', 0.54, NULL, '2026-10-06 06:41:36'),
(211, 27, 82, 14, 'identification', 'What is the purpose of using VirtualBox?', NULL, 'To create a virtual machine', 0.54, NULL, '2026-10-06 06:41:36'),
(212, 27, 83, 15, 'identification', 'What is the purpose of taking a screenshot?', NULL, 'To capture the whole terminal window or the whole VirtualBox dialog', 0.54, NULL, '2026-10-06 06:41:36'),
(213, 27, 84, 16, 'identification', 'What is the rule for labeling each image?', NULL, 'With its code (SS-01, SS-02, ...)', 0.60, NULL, '2026-10-06 06:41:36'),
(214, 27, 70, 17, 'enumeration', 'List the two file systems used for Storage 1 and Storage 2', NULL, 'ext4, NTFS', 3.00, NULL, '2026-10-06 06:41:36'),
(215, 27, 75, 18, 'enumeration', 'List the four parts of a block device name', NULL, 'device, type, partition, file system', 3.00, NULL, '2026-10-06 06:41:36'),
(216, 28, 87, 0, 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\",\"An action\"]', 'A thing', 2.00, NULL, '2026-10-06 07:38:37'),
(217, 28, 90, 1, 'mcq', 'What is the function of pronouns?', '[\"To replace verbs\",\"To replace nouns\",\"To replace adjectives\",\"To replace adverbs\"]', 'To replace nouns', 2.00, NULL, '2026-10-06 07:38:37'),
(218, 28, 93, 2, 'mcq', 'What is the purpose of helping verbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, NULL, '2026-10-06 07:38:37'),
(219, 28, 96, 3, 'mcq', 'What is the function of adverbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, NULL, '2026-10-06 07:38:37'),
(220, 28, 88, 4, 'identification', 'What is the part of speech that describes a noun?', NULL, 'Adjective', 2.00, NULL, '2026-10-06 07:38:37'),
(221, 28, 91, 5, 'identification', 'What is the part of speech that describes a verb?', NULL, 'Adverb', 2.00, NULL, '2026-10-06 07:38:37'),
(222, 28, 94, 6, 'identification', 'What is the difference between a singular and plural noun?', NULL, 'A singular noun refers to one person, place, or thing, while a plural noun refers to more than one.', 2.00, NULL, '2026-10-06 07:38:37'),
(223, 28, 89, 7, 'enumeration', 'List 3 types of nouns:', NULL, 'Proper noun,Common noun,Collective noun', 3.00, NULL, '2026-10-06 07:38:37'),
(224, 28, 92, 8, 'enumeration', 'List 3 types of verbs:', NULL, 'Action verb,Linking verb,Auxiliary verb', 3.00, NULL, '2026-10-06 07:38:37'),
(225, 28, 95, 9, 'enumeration', 'List 3 examples of adjectives:', NULL, 'Describing size,Describing color,Describing shape', 3.00, NULL, '2026-10-06 07:38:37'),
(226, 29, 87, 0, 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\",\"An action\"]', 'A thing', 2.00, NULL, '2026-10-07 05:29:08'),
(227, 29, 90, 1, 'mcq', 'What is the function of pronouns?', '[\"To replace verbs\",\"To replace nouns\",\"To replace adjectives\",\"To replace adverbs\"]', 'To replace nouns', 2.00, NULL, '2026-10-07 05:29:08'),
(228, 29, 93, 2, 'mcq', 'What is the purpose of helping verbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, NULL, '2026-10-07 05:29:08'),
(229, 29, 96, 3, 'mcq', 'What is the function of adverbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, NULL, '2026-10-07 05:29:08'),
(230, 29, 88, 4, 'identification', 'What is the part of speech that describes a noun?', NULL, 'Adjective', 2.00, NULL, '2026-10-07 05:29:08'),
(231, 29, 91, 5, 'identification', 'What is the part of speech that describes a verb?', NULL, 'Adverb', 2.00, NULL, '2026-10-07 05:29:08'),
(232, 29, 94, 6, 'identification', 'What is the difference between a singular and plural noun?', NULL, 'A singular noun refers to one person, place, or thing, while a plural noun refers to more than one.', 2.00, NULL, '2026-10-07 05:29:08'),
(233, 29, 89, 7, 'enumeration', 'List 3 types of nouns:', NULL, 'Proper noun,Common noun,Collective noun', 3.00, NULL, '2026-10-07 05:29:08'),
(234, 29, 92, 8, 'enumeration', 'List 3 types of verbs:', NULL, 'Action verb,Linking verb,Auxiliary verb', 3.00, NULL, '2026-10-07 05:29:08'),
(235, 29, 95, 9, 'enumeration', 'List 3 examples of adjectives:', NULL, 'Describing size,Describing color,Describing shape', 3.00, NULL, '2026-10-07 05:29:08'),
(236, 30, 98, 0, 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\"]', 'A thing', 2.00, NULL, '2026-10-07 07:02:37'),
(237, 30, 101, 1, 'mcq', 'What is an adjective?', '[\"A word that describes a noun\",\"A word that describes a verb\",\"A word that describes an adverb\"]', 'A word that describes a noun', 2.00, NULL, '2026-10-07 07:02:37'),
(238, 30, 104, 2, 'mcq', 'What is a verb?', '[\"A word that describes a noun\",\"A word that describes a verb\",\"A word that describes an adverb\"]', 'A word that describes a verb', 2.00, NULL, '2026-10-07 07:02:37'),
(239, 30, 107, 3, 'mcq', 'What is the difference between a singular and plural noun?', '[\"A singular noun refers to only one person, place or thing, while a plural noun refers to more than one.\",\"A plural noun refers to only one person, place or thing, while a singular noun refers to more than one.\"]', 'A singular noun refers to only one person, place or thing, while a plural noun refers to more than one.', 2.00, NULL, '2026-10-07 07:02:37'),
(240, 30, 99, 4, 'identification', 'What is the function of pronouns in a sentence?', NULL, 'To replace nouns', 3.00, NULL, '2026-10-07 07:02:37'),
(241, 30, 102, 5, 'identification', 'What is the function of adverbs in a sentence?', NULL, 'To describe how verbs are done', 3.00, NULL, '2026-10-07 07:02:37'),
(242, 30, 105, 6, 'identification', 'What is the function of helping verbs in a sentence?', NULL, 'To extend the meaning of verbs', 3.00, NULL, '2026-10-07 07:02:37'),
(243, 30, 100, 7, 'enumeration', 'List the three types of pronouns.', NULL, 'I, Me, We', 4.00, NULL, '2026-10-07 07:02:37'),
(244, 30, 103, 8, 'enumeration', 'List the three main types of adverbs.', NULL, 'Manner, Time, Place', 4.00, NULL, '2026-10-07 07:02:37'),
(245, 30, 106, 9, 'enumeration', 'List the 10 main types of helping verbs.', NULL, 'Am, As, Are, Was, Were, Been, Be, Can, Has, Shall', 4.00, NULL, '2026-10-07 07:02:37'),
(246, 31, 120, 0, 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\",\"A feeling\"]', 'A thing', 1.00, NULL, '2026-10-10 00:11:40'),
(247, 31, 121, 1, 'mcq', 'What is a verb?', '[\"A person\",\"A place\",\"An action\",\"A thing\"]', 'An action', 1.00, NULL, '2026-10-10 00:11:40'),
(248, 31, 122, 2, 'mcq', 'What is an adjective?', '[\"A person\",\"A place\",\"A descriptive word\",\"A thing\"]', 'A descriptive word', 1.00, NULL, '2026-10-10 00:11:40'),
(249, 31, 123, 3, 'mcq', 'What is a pronoun?', '[\"A person\",\"A place\",\"A word that replaces a noun\",\"A thing\"]', 'A word that replaces a noun', 1.00, NULL, '2026-10-10 00:11:40'),
(250, 31, 124, 4, 'mcq', 'What is the difference between a singular and plural noun?', '[\"A singular noun refers to one person, place or thing, while a plural noun refers to two or more.\",\"A singular noun refers to two or more people, places or things, while a plural noun refers to one.\",\"A singular noun refers to one thing, while a plural noun refers to two or more things.\",\"A singular noun refers to two or more things, while a plural noun refers to one.\"]', 'A singular noun refers to one person, place or thing, while a plural noun refers to two or more.', 1.00, NULL, '2026-10-10 00:11:40'),
(251, 32, 126, 0, 'mcq', 'What is a noun that refers to a person, place, or thing?', '[\"a person\",\"a place\",\"a thing\",\"an action\"]', 'a thing', 1.00, NULL, '2026-10-10 01:23:54'),
(252, 32, 127, 1, 'mcq', 'What is a verb that describes an action or state of being?', '[\"a person\",\"a place\",\"an action\",\"a thing\"]', 'an action', 1.00, NULL, '2026-10-10 01:23:54'),
(253, 32, 128, 2, 'mcq', 'What is an adjective that describes a noun?', '[\"a person\",\"a place\",\"a thing\",\"a feeling\"]', 'a feeling', 1.00, NULL, '2026-10-10 01:23:54'),
(254, 32, 129, 3, 'mcq', 'What is a pronoun that replaces a noun in a sentence?', '[\"a person\",\"a place\",\"a thing\",\"a word\"]', 'a word', 1.00, NULL, '2026-10-10 01:23:54'),
(255, 32, 130, 4, 'mcq', 'What is a verb tense that shows an action that happened in the past?', '[\"present\",\"past\",\"future\",\"present perfect\"]', 'past', 1.00, NULL, '2026-10-10 01:23:54'),
(256, 33, 131, 0, 'activity', 'Sort the following words into their correct categories: nouns, verbs, adjectives, and pronouns. Work with a partner or in a small group.', NULL, NULL, 6.00, '{\"categories\":[{\"name\":\"Nouns\",\"max_points\":2,\"levels\":[{\"label\":\"Excellent\",\"points\":2,\"description\":\"All words are correctly identified as nouns.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"Most words are correctly identified as nouns, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"Few words are correctly identified as nouns, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Most words are incorrectly identified as nouns.\"}]},{\"name\":\"Verbs\",\"max_points\":2,\"levels\":[{\"label\":\"Excellent\",\"points\":2,\"description\":\"All words are correctly identified as verbs.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"Most words are correctly identified as verbs, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"Few words are correctly identified as verbs, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Most words are incorrectly identified as verbs.\"}]},{\"name\":\"Adjectives\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"All words are correctly identified as adjectives.\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Most words are correctly identified as adjectives, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"Few words are correctly identified as adjectives, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Most words are incorrectly identified as adjectives.\"}]},{\"name\":\"Pronouns\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"All words are correctly identified as pronouns.\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Most words are correctly identified as pronouns, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"Few words are correctly identified as pronouns, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Most words are incorrectly identified as pronouns.\"}]}]}', '2026-10-10 01:51:11'),
(257, 34, 126, 0, 'mcq', 'What is a noun that refers to a person, place, or thing?', '[\"a person\",\"a place\",\"a thing\",\"an action\"]', 'a thing', 1.00, NULL, '2026-10-11 05:45:38'),
(258, 34, 127, 1, 'mcq', 'What is a verb that describes an action or state of being?', '[\"a person\",\"a place\",\"an action\",\"a thing\"]', 'an action', 1.00, NULL, '2026-10-11 05:45:38'),
(259, 34, 128, 2, 'mcq', 'What is an adjective that describes a noun?', '[\"a person\",\"a place\",\"a thing\",\"a feeling\"]', 'a feeling', 1.00, NULL, '2026-10-11 05:45:38'),
(260, 34, 129, 3, 'mcq', 'What is a pronoun that replaces a noun in a sentence?', '[\"a person\",\"a place\",\"a thing\",\"a word\"]', 'a word', 1.00, NULL, '2026-10-11 05:45:38'),
(261, 34, 130, 4, 'mcq', 'What is a verb tense that shows an action that happened in the past?', '[\"present\",\"past\",\"future\",\"present perfect\"]', 'past', 1.00, NULL, '2026-10-11 05:45:38'),
(262, 35, 109, 0, 'mcq', 'What is the shape of a square?', '[\"Circle\",\"Rectangle\",\"Square\",\"Triangle\"]', 'Square', 1.00, NULL, '2026-10-11 06:32:11'),
(263, 35, 112, 1, 'mcq', 'What is the sum of 2 + 2?', '[\"3\",\"4\",\"5\",\"6\"]', '4', 1.00, NULL, '2026-10-11 06:32:11'),
(264, 35, 115, 2, 'mcq', 'What is the product of 3 x 4?', '[\"10\",\"12\",\"15\",\"18\"]', '12', 1.00, NULL, '2026-10-11 06:32:11'),
(265, 35, 118, 3, 'mcq', 'What is the result of 5 - 2?', '[\"3\",\"4\",\"5\",\"6\"]', '3', 1.00, NULL, '2026-10-11 06:32:11'),
(266, 35, 110, 4, 'identification', 'What is the name of the number that comes after 10?', NULL, '11', 1.00, NULL, '2026-10-11 06:32:11'),
(267, 35, 113, 5, 'identification', 'What is the name of the operation that means to add two numbers together?', NULL, 'Addition', 1.00, NULL, '2026-10-11 06:32:11'),
(268, 35, 116, 6, 'identification', 'What is the name of the operation that means to subtract one number from another?', NULL, 'Subtraction', 1.00, NULL, '2026-10-11 06:32:11'),
(269, 35, 111, 7, 'enumeration', 'List 3 shapes that are used in art', NULL, 'Circle, Square, Triangle', 2.00, NULL, '2026-10-11 06:32:11'),
(270, 35, 114, 8, 'enumeration', 'List 2 types of numbers that are used in math', NULL, 'Whole numbers, Fractions', 2.00, NULL, '2026-10-11 06:32:11'),
(271, 35, 117, 9, 'enumeration', 'List 3 types of math problems that can be solved using addition', NULL, 'Counting money, Measuring ingredients, Counting toys', 2.00, NULL, '2026-10-11 06:32:11'),
(272, 37, 153, 0, 'true_false', 'Nouns are words that name people, places, or things.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-11 07:38:28'),
(273, 37, 154, 1, 'true_false', 'Verbs are descriptive words that modify nouns.', '[\"True\",\"False\"]', 'False', 1.00, NULL, '2026-10-11 07:38:28'),
(274, 37, 155, 2, 'true_false', 'The word \'France\' is a proper noun because it is the name of a place.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-11 07:38:28'),
(275, 37, 156, 3, 'true_false', 'Honesty and happiness are tangible nouns that you can hold in your hand.', '[\"True\",\"False\"]', 'False', 1.00, NULL, '2026-10-11 07:38:28'),
(276, 37, 157, 4, 'true_false', 'Singular nouns refer to only one person, place, or thing.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-11 07:38:28'),
(277, 37, 158, 5, 'true_false', 'Pronouns are words that replace nouns in a sentence.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-11 07:38:28'),
(278, 37, 159, 6, 'fill_blank', 'Verbs indicate _____ or a state of being in sentences.', '[\"action\",\"place\",\"color\"]', 'action', 1.00, NULL, '2026-10-11 07:38:28'),
(279, 37, 160, 7, 'fill_blank', 'To show that there are multiple dogs, an _____ is added to the end of the word.', '[\"s\",\"ed\",\"ing\"]', 's', 1.00, NULL, '2026-10-11 07:38:28'),
(280, 37, 161, 8, 'fill_blank', 'Anna is a noun because she is a _____.', '[\"person\",\"thing\",\"place\"]', 'person', 1.00, NULL, '2026-10-11 07:38:28'),
(281, 37, 162, 9, 'fill_blank', 'In the sentence \'Batman drives the Batmobile,\' the word \'drives\' is a _____.', '[\"verb\",\"noun\",\"pronoun\"]', 'verb', 1.00, NULL, '2026-10-11 07:38:28'),
(282, 37, 163, 10, 'fill_blank', 'Words like \'she\' or \'he\' that take the place of a noun are called _____.', '[\"pronouns\",\"adverbs\",\"places\"]', 'pronouns', 1.00, NULL, '2026-10-11 07:38:28'),
(283, 37, 164, 11, 'fill_blank', 'Words that describe how verbs are done are called _____.', '[\"adverbs\",\"nouns\",\"objects\"]', 'adverbs', 1.00, NULL, '2026-10-11 07:38:28'),
(284, 37, 165, 12, 'matching', 'Match the word to its correct part of speech.', '[\"rabbit | noun\",\"drives | verb\",\"loudly | adverb\"]', 'rabbit | noun; drives | verb; loudly | adverb', 1.00, NULL, '2026-10-11 07:38:28'),
(285, 37, 166, 13, 'matching', 'Match each noun to its specific category.', '[\"Anna | person\",\"France | place\",\"book | thing\"]', 'Anna | person; France | place; book | thing', 1.00, NULL, '2026-10-11 07:38:28'),
(286, 37, 167, 14, 'matching', 'Match the noun to its noun form.', '[\"Anna | proper noun\",\"rabbit | improper noun\",\"honesty | abstract noun\"]', 'Anna | proper noun; rabbit | improper noun; honesty | abstract noun', 1.00, NULL, '2026-10-11 07:38:28'),
(287, 37, 168, 15, 'matching', 'Match the noun to whether it is singular or plural.', '[\"dog | singular\",\"dogs | plural\",\"castle | singular\"]', 'dog | singular; dogs | plural; castle | singular', 1.00, NULL, '2026-10-11 07:38:28'),
(288, 37, 169, 16, 'matching', 'Match the pronoun to its pronoun type.', '[\"She | subject pronoun\",\"Him | object pronoun\",\"They | subject pronoun\"]', 'She | subject pronoun; Him | object pronoun; They | subject pronoun', 1.00, NULL, '2026-10-11 07:38:28'),
(289, 37, 170, 17, 'matching', 'Match the verb form to what it indicates in time.', '[\"throws | current action\",\"threw | past action\",\"was throwing | past verb phrase\"]', 'throws | current action; threw | past action; was throwing | past verb phrase', 1.00, NULL, '2026-10-11 07:38:28'),
(290, 37, 171, 18, 'sequencing', 'Arrange the parts of speech in the sentence: \'Batman drives the Batmobile.\'', '[\"Subject noun (Batman)\",\"Action verb (drives)\",\"Object noun (Batmobile)\"]', 'Subject noun (Batman) | Action verb (drives) | Object noun (Batmobile)', 1.00, NULL, '2026-10-11 07:38:28'),
(291, 37, 172, 19, 'sequencing', 'Arrange the steps to make the singular noun \'dog\' into a plural noun.', '[\"Start with the singular noun dog\",\"Add the letter s to the end\",\"Form the plural noun dogs\"]', 'Start with the singular noun dog | Add the letter s to the end | Form the plural noun dogs', 1.00, NULL, '2026-10-11 07:38:28'),
(292, 37, 173, 20, 'sequencing', 'Arrange the steps to replace a proper noun with a pronoun.', '[\"Identify the proper noun Jasmine\",\"Choose the subject pronoun She\",\"Form the sentence She is a princess\"]', 'Identify the proper noun Jasmine | Choose the subject pronoun She | Form the sentence She is a princess', 1.00, NULL, '2026-10-11 07:38:28'),
(293, 37, 174, 21, 'sequencing', 'Arrange the words in order for the phrase: \'big blue castle\'.', '[\"First adjective (big)\",\"Second adjective (blue)\",\"Modified noun (castle)\"]', 'First adjective (big) | Second adjective (blue) | Modified noun (castle)', 1.00, NULL, '2026-10-11 07:38:28'),
(294, 37, 175, 22, 'sequencing', 'Arrange the parts of speech in the sentence: \'The girl hugged the boy.\'', '[\"Subject noun (The girl)\",\"Action verb (hugged)\",\"Object noun (the boy)\"]', 'Subject noun (The girl) | Action verb (hugged) | Object noun (the boy)', 1.00, NULL, '2026-10-11 07:38:28'),
(295, 37, 176, 23, 'sequencing', 'Arrange the components of the verb phrase: \'Thor was throwing the hammer.\'', '[\"Subject (Thor)\",\"Helping verb (was)\",\"Main action verb (throwing)\"]', 'Subject (Thor) | Helping verb (was) | Main action verb (throwing)', 1.00, NULL, '2026-10-11 07:38:28'),
(296, 37, 177, 24, 'short_answer', 'What is a noun according to the lesson?', NULL, 'A noun is a part of speech that names a person, place, or thing. It can also name abstract feelings like honesty and happiness.', 1.00, NULL, '2026-10-11 07:38:28'),
(297, 37, 178, 25, 'short_answer', 'What is a verb? Give one example of an action verb from the lesson.', NULL, 'A verb indicates an action or a state of being in a sentence. An example from the lesson is \'drives\' in the sentence \'Batman drives the Batmobile.\'', 1.00, NULL, '2026-10-11 07:38:28'),
(298, 37, 179, 26, 'short_answer', 'What is the difference between a singular noun and a plural noun?', NULL, 'A singular noun refers to only one person, place, or thing, such as \'dog\'. A plural noun refers to more than one, such as \'dogs\' with an \'s\' added to the end.', 1.00, NULL, '2026-10-11 07:38:28'),
(299, 37, 180, 27, 'short_answer', 'What is a proper noun? Mention one person or place from the lesson as an example.', NULL, 'A proper noun is a specific name of a person or a place. Examples from the lesson are \'Anna\' for a person\'s name and \'France\' for a country\'s name.', 1.00, NULL, '2026-10-11 07:38:28'),
(300, 37, 181, 28, 'short_answer', 'What does a pronoun do in a sentence?', NULL, 'A pronoun replaces a noun in a sentence. For example, the pronoun \'she\' can replace the proper noun \'Jasmine.\'', 1.00, NULL, '2026-10-11 07:38:28'),
(301, 37, 182, 29, 'short_answer', 'What do adverbs do to verbs in a sentence?', NULL, 'Adverbs modify verbs by describing how actions were done. For example, in the lesson, \'beautifully\' describes how Beyoncé sang.', 1.00, NULL, '2026-10-11 07:38:28'),
(302, 38, 184, 0, 'matching', 'Match each food to the plant part we eat.', '[\"Carrot | Root\",\"Celery | Stem\",\"Spinach | Leaf\"]', 'Carrot | Root; Celery | Stem; Spinach | Leaf', 1.00, NULL, '2026-10-11 08:15:21'),
(303, 38, 185, 1, 'matching', 'Match each plant part to its job in the plant riddle.', '[\"Roots | Gather water\",\"Stem | Elevator for water and sugar\",\"Leaves | Catch the sun\"]', 'Roots | Gather water; Stem | Elevator for water and sugar; Leaves | Catch the sun', 1.00, NULL, '2026-10-11 08:15:21'),
(304, 38, 186, 2, 'matching', 'Match the edible plant part to its vegetable example.', '[\"Flower | Broccoli\",\"Fruit | Cucumber\",\"Seed | Sunflower seed\"]', 'Flower | Broccoli; Fruit | Cucumber; Seed | Sunflower seed', 1.00, NULL, '2026-10-11 08:15:21'),
(305, 38, 187, 3, 'matching', 'Match the plant riddle clue to the correct plant part.', '[\"Attracts the bees | Flower\",\"Holds the seeds inside | Fruit\",\"Starts a new plant\'s birth | Seed\"]', 'Attracts the bees | Flower; Holds the seeds inside | Fruit; Starts a new plant\'s birth | Seed', 1.00, NULL, '2026-10-11 08:15:21'),
(306, 38, 188, 4, 'sequencing', 'Put the plant parts in order from bottom in the ground to top.', '[\"Roots anchor in ground\",\"Stem grows upward\",\"Flower blooms at top\"]', 'Roots anchor in ground | Stem grows upward | Flower blooms at top', 1.00, NULL, '2026-10-11 08:15:21'),
(307, 38, 189, 5, 'sequencing', 'Put the steps of a plant\'s life cycle in order.', '[\"Seed is buried in the earth\",\"Plant grows roots and stem\",\"Fruit gets ripe and falls\"]', 'Seed is buried in the earth | Plant grows roots and stem | Fruit gets ripe and falls', 1.00, NULL, '2026-10-11 08:15:21'),
(308, 38, 190, 6, 'sequencing', 'Put our lesson garden tasks in order.', '[\"Show seed packets\",\"Plant seeds in the soil\",\"Harvest parts to eat\"]', 'Show seed packets | Plant seeds in the soil | Harvest parts to eat', 1.00, NULL, '2026-10-11 08:15:21'),
(309, 38, 191, 7, 'identification', 'What part of the plant anchors it in the ground and gathers water?', '[\"Sun\",\"Soil\"]', 'Roots', 1.00, NULL, '2026-10-11 08:15:21'),
(310, 38, 192, 8, 'identification', 'What plant part holds the pollen and attracts the bees?', '[\"Water\",\"Ground\"]', 'Flower', 1.00, NULL, '2026-10-11 08:15:21'),
(311, 38, 193, 9, 'identification', 'What plant part catches the sun and acts like a kitchen to make food?', '[\"Pollen\",\"Gardener\"]', 'Leaves', 1.00, NULL, '2026-10-11 08:15:21'),
(312, 39, 195, 0, 'identification', 'Which plant part anchors the plant in the ground and gathers water?', '[\"Dirt\",\"Stone\"]', 'Roots', 1.00, NULL, '2026-10-11 08:26:41'),
(313, 39, 196, 1, 'identification', 'Which plant part acts like an elevator to carry water up from the ground?', '[\"Branch\"]', 'Stem', 1.00, NULL, '2026-10-11 08:26:41'),
(314, 39, 197, 2, 'identification', 'Which plant parts act like kitchens that catch the sun to make food?', '[\"Grass\"]', 'Leaves', 1.00, NULL, '2026-10-11 08:26:41'),
(315, 39, 198, 3, 'identification', 'Which colorful plant part holds pollen and attracts bees?', '[\"Petal\"]', 'Flower', 1.00, NULL, '2026-10-11 08:26:41'),
(316, 39, 199, 4, 'identification', 'Which plant part holds the seeds inside, like a cucumber or pepper?', '[\"Twig\"]', 'Fruit', 1.00, NULL, '2026-10-11 08:26:41'),
(317, 39, 200, 5, 'identification', 'What is buried in the earth to start the life cycle of a new plant?', '[\"Pebble\"]', 'Seed', 1.00, NULL, '2026-10-11 08:26:41'),
(318, 39, 201, 6, 'identification', 'Which crunchy orange food from our lesson is an edible root?', '[\"Radish\"]', 'Carrot', 1.00, NULL, '2026-10-11 08:26:41'),
(319, 39, 202, 7, 'identification', 'Which crunchy green stalk from our lesson is an edible stem?', '[\"Corn\"]', 'Celery', 1.00, NULL, '2026-10-11 08:26:41'),
(320, 39, 203, 8, 'identification', 'Which leafy green food from our lesson is an edible leaf?', '[\"Kale\"]', 'Spinach', 1.00, NULL, '2026-10-11 08:26:41'),
(321, 39, 204, 9, 'identification', 'Which green vegetable shaped like a small tree is an edible flower?', '[\"Cabbage\"]', 'Broccoli', 1.00, NULL, '2026-10-11 08:26:41'),
(322, 40, 206, 0, 'identification', 'What plant part is a crunchy orange carrot that grows under the ground?', '[\"water\"]', 'root', 1.00, NULL, '2026-10-11 08:45:39'),
(323, 40, 207, 1, 'identification', 'What plant part is green celery that carries water up like an elevator?', '[\"sun\"]', 'stem', 1.00, NULL, '2026-10-11 08:45:40'),
(324, 40, 208, 2, 'identification', 'What plant part catches the sunlight to make food, like fresh spinach?', '[\"soil\"]', 'leaf', 1.00, NULL, '2026-10-11 08:45:40'),
(325, 40, 209, 3, 'identification', 'What plant part holds the seeds inside, like a cucumber or pepper?', '[\"pollen\"]', 'fruit', 1.00, NULL, '2026-10-11 08:45:40'),
(326, 40, 210, 4, 'identification', 'What tiny plant part is buried in the earth to grow a new plant, like a bean?', '[\"sprout\"]', 'seed', 1.00, NULL, '2026-10-11 08:45:40'),
(327, 41, 206, 0, 'identification', 'What plant part is a crunchy orange carrot that grows under the ground?', '[\"water\"]', 'root', 1.00, NULL, '2026-10-11 09:02:52'),
(328, 41, 207, 1, 'identification', 'What plant part is green celery that carries water up like an elevator?', '[\"sun\"]', 'stem', 1.00, NULL, '2026-10-11 09:02:52'),
(329, 41, 208, 2, 'identification', 'What plant part catches the sunlight to make food, like fresh spinach?', '[\"soil\"]', 'leaf', 1.00, NULL, '2026-10-11 09:02:52'),
(330, 41, 209, 3, 'identification', 'What plant part holds the seeds inside, like a cucumber or pepper?', '[\"pollen\"]', 'fruit', 1.00, NULL, '2026-10-11 09:02:52'),
(331, 41, 210, 4, 'identification', 'What tiny plant part is buried in the earth to grow a new plant, like a bean?', '[\"sprout\"]', 'seed', 1.00, NULL, '2026-10-11 09:02:52'),
(332, 42, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 13:25:14'),
(333, 43, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 14:08:50'),
(334, 44, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 14:33:45'),
(335, 45, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 14:35:55'),
(336, 46, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 14:38:30'),
(337, 47, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 14:43:10'),
(338, 48, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 14:46:30'),
(339, 49, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 14:48:48'),
(340, 50, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 15:24:34'),
(341, 51, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 15:29:56'),
(342, 52, 211, 0, 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 15:53:16'),
(343, 54, 212, 0, 'mcq', 'What is chuchu', '[\"asdsada\",\"asdasda\"]', 'A', 1.00, NULL, '2026-10-11 16:54:52');
INSERT INTO `assessment_questions` (`id`, `assessment_id`, `question_bank_id`, `sort_order`, `item_type`, `question`, `choices`, `answer`, `points`, `rubric`, `created_at`) VALUES
(344, 54, 213, 1, 'identification', 'What is chuchuchu', '[\"Ge\",\"Bai\",\"Lods\"]', 'A', 1.00, NULL, '2026-10-11 16:54:52'),
(345, 55, 214, 0, 'mcq', 'What is a noun?', '[\"A person, place, or thing\",\"An action word\",\"A word that modifies verbs\",\"A connecting word\"]', 'A person, place, or thing', 1.00, NULL, '2026-10-11 18:13:20'),
(346, 55, 215, 1, 'mcq', 'Which of these words is an action verb?', '[\"drives\",\"castle\",\"blue\",\"happiness\"]', 'drives', 1.00, NULL, '2026-10-11 18:13:20'),
(347, 55, 216, 2, 'mcq', 'Which word is an adjective that describes a noun?', '[\"big\",\"rabbit\",\"France\",\"hugged\"]', 'big', 1.00, NULL, '2026-10-11 18:13:20'),
(348, 55, 217, 3, 'mcq', 'What kind of word replaces a noun in a sentence?', '[\"Pronoun\",\"Verb\",\"Adjective\",\"Adverb\"]', 'Pronoun', 1.00, NULL, '2026-10-11 18:13:20'),
(349, 55, 218, 4, 'true_false', 'A singular noun refers to only one person, place, or thing.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-11 18:13:20'),
(350, 55, 219, 5, 'true_false', 'Proper nouns are general words for things like \'rabbit\' and \'book\'.', '[\"True\",\"False\"]', 'False', 1.00, NULL, '2026-10-11 18:13:20'),
(351, 55, 220, 6, 'true_false', 'Adjectives tell us which, what kind, or how many of a noun there is.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-11 18:13:20'),
(352, 55, 221, 7, 'true_false', 'Adverbs modify nouns instead of verbs.', '[\"True\",\"False\"]', 'False', 1.00, NULL, '2026-10-11 18:13:20'),
(353, 55, 222, 8, 'fill_blank', 'Adding an _____ to the end of \'dog\' makes it plural.', '[\"s\",\"ed\",\"ing\",\"ly\"]', 's', 1.00, NULL, '2026-10-11 18:13:20'),
(354, 55, 223, 9, 'fill_blank', 'Verbs are _____ words.', '[\"action\",\"naming\",\"feeling\",\"slow\"]', 'action', 1.00, NULL, '2026-10-11 18:13:20'),
(355, 55, 224, 10, 'fill_blank', 'Adjectives are _____ words that describe nouns.', '[\"descriptive\",\"action\",\"silent\",\"proper\"]', 'descriptive', 1.00, NULL, '2026-10-11 18:13:20'),
(356, 55, 225, 11, 'fill_blank', 'Pronouns like \'she\' are used to _____ nouns.', '[\"replace\",\"remove\",\"count\",\"spell\"]', 'replace', 1.00, NULL, '2026-10-11 18:13:20'),
(357, 55, 226, 12, 'matching', 'Match each word from the lesson to its part of speech.', '[\"France | Proper noun\",\"jumps | Verb\",\"blonde | Adjective\"]', 'France | Proper noun; jumps | Verb; blonde | Adjective', 1.00, NULL, '2026-10-11 18:13:20'),
(358, 55, 227, 13, 'matching', 'Match the pronoun type to its example.', '[\"Subject pronoun | She\",\"Object pronoun | Him\",\"Plural noun | Dogs\"]', 'Subject pronoun | She; Object pronoun | Him; Plural noun | Dogs', 1.00, NULL, '2026-10-11 18:13:20'),
(359, 55, 228, 14, 'matching', 'Match the noun to its noun category.', '[\"book | Tangible noun\",\"honesty | Abstract noun\",\"Anna | Proper noun\"]', 'book | Tangible noun; honesty | Abstract noun; Anna | Proper noun', 1.00, NULL, '2026-10-11 18:13:20'),
(360, 55, 229, 15, 'matching', 'Match the word to what it does.', '[\"Verb | Shows action\",\"Adjective | Modifies a noun\",\"Adverb | Modifies a verb\"]', 'Verb | Shows action; Adjective | Modifies a noun; Adverb | Modifies a verb', 1.00, NULL, '2026-10-11 18:13:20'),
(361, 55, 230, 16, 'sequencing', 'Put the words in order to form the sentence from the lesson.', '[\"The rabbit\",\"read\",\"the book.\"]', 'The rabbit | read | the book.', 1.00, NULL, '2026-10-11 18:13:20'),
(362, 55, 231, 17, 'sequencing', 'Put the words in order to show how \'Thor\' throws a hammer.', '[\"Thor\",\"throws\",\"the hammer.\"]', 'Thor | throws | the hammer.', 1.00, NULL, '2026-10-11 18:13:20'),
(363, 55, 232, 18, 'sequencing', 'Put the actions in order as Thor did them in the lesson.', '[\"Thor\",\"jumped\",\"and caught\",\"the hammer.\"]', 'Thor | jumped | and caught | the hammer.', 1.00, NULL, '2026-10-11 18:13:20'),
(364, 55, 233, 19, 'sequencing', 'Put the words in order to show a girl\'s description.', '[\"The intelligent girl\",\"is\",\"tall.\"]', 'The intelligent girl | is | tall.', 1.00, NULL, '2026-10-11 18:13:20'),
(365, 55, 234, 20, 'identification', 'What do we call nouns that you can touch or hold?', '[\"tense\",\"phrase\"]', 'tangible nouns', 1.00, NULL, '2026-10-11 18:13:20'),
(366, 55, 235, 21, 'identification', 'What do we call nouns like \'honesty\' and \'happiness\' that are feelings or concepts you cannot touch?', '[\"plural\",\"modifier\"]', 'abstract nouns', 1.00, NULL, '2026-10-11 18:13:20'),
(367, 55, 236, 22, 'identification', 'What part of speech describes how verbs or actions were done?', '[\"object\",\"subject\"]', 'adverbs', 1.00, NULL, '2026-10-11 18:13:20'),
(368, 55, 237, 23, 'identification', 'What kind of verbs help to extend the meaning of verbs already used in a sentence?', '[\"proper\",\"singular\"]', 'helping verbs', 1.00, NULL, '2026-10-11 18:13:20'),
(369, 55, 238, 24, 'enumeration', 'Name three parts of speech mentioned as building blocks for sentences in the lesson.', NULL, 'Accept any 3: Nouns, Verbs, Adjectives, Pronouns, Adverbs (Score 1 point if three correct parts of speech are listed).', 1.00, NULL, '2026-10-11 18:13:20'),
(370, 55, 239, 25, 'enumeration', 'Give two examples of subject pronouns listed in the lesson.', NULL, 'Any two of: I, We, You, She, He, It, They (Score 1 point for two correct subject pronouns).', 1.00, NULL, '2026-10-11 18:13:20'),
(371, 55, 240, 26, 'enumeration', 'List two helping verbs from the lesson.', NULL, 'Any two of: is, was, am, are, were, been, be, can, has, shall, will, do, does, did, have, should, may, might, would, must, could, had (Score 1 point for two correct helping verbs).', 1.00, NULL, '2026-10-11 18:13:20'),
(372, 55, 241, 27, 'short_answer', 'What is the difference between a singular noun and a plural noun according to the lesson?', NULL, 'A singular noun refers to only one person, place, or thing. A plural noun refers to more than one person, place, or thing.', 1.00, NULL, '2026-10-11 18:13:20'),
(373, 55, 242, 28, 'short_answer', 'Why are adjectives useful in writing?', NULL, 'Adjectives describe nouns and tell what kind, which, or how many there are. They help readers visualize and understand what an author has written.', 1.00, NULL, '2026-10-11 18:13:20'),
(374, 55, 243, 29, 'short_answer', 'How does a verb tense show when an action happens?', NULL, 'A verb tense shows if an action is currently happening, like \'throws\', or if it already happened in the past, like \'threw\'.', 1.00, NULL, '2026-10-11 18:13:20'),
(375, 56, 244, 0, 'mcq', 'What is a noun?', '[\"A person, place, or thing\",\"An action word\",\"A descriptive word\",\"A helping word\"]', 'A person, place, or thing', 1.00, NULL, '2026-10-11 18:28:03'),
(376, 56, 245, 1, 'mcq', 'Which word is a verb that shows action?', '[\"drives\",\"rabbit\",\"castle\",\"blue\"]', 'drives', 1.00, NULL, '2026-10-11 18:28:03'),
(377, 56, 246, 2, 'mcq', 'What do adjectives do in a sentence?', '[\"Describe nouns\",\"Show actions\",\"Replace names\",\"End sentences\"]', 'Describe nouns', 1.00, NULL, '2026-10-11 18:28:03'),
(378, 56, 247, 3, 'mcq', 'Which word is a proper noun?', '[\"France\",\"book\",\"dog\",\"girl\"]', 'France', 1.00, NULL, '2026-10-11 18:28:03'),
(379, 56, 248, 4, 'true_false', 'Singular nouns name only one person, place, or thing.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-11 18:28:03'),
(380, 56, 249, 5, 'true_false', 'Adverbs modify nouns.', '[\"True\",\"False\"]', 'False', 1.00, NULL, '2026-10-11 18:28:03'),
(381, 56, 250, 6, 'true_false', 'Pronouns are words that replace nouns.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-11 18:28:03'),
(382, 56, 251, 7, 'true_false', 'Happiness is a noun you can touch and hold with your hands.', '[\"True\",\"False\"]', 'False', 1.00, NULL, '2026-10-11 18:28:03'),
(383, 56, 252, 8, 'fill_blank', 'Adding an s to the word dog makes it _____.', '[\"plural\",\"singular\",\"verb\"]', 'plural', 1.00, NULL, '2026-10-11 18:28:03'),
(384, 56, 253, 9, 'fill_blank', 'In the sentence \'She is a princess\', the word She is a _____.', '[\"pronoun\",\"adverb\",\"place\"]', 'pronoun', 1.00, NULL, '2026-10-11 18:28:03'),
(385, 56, 254, 10, 'fill_blank', 'Verbs indicate action or _____ of being.', '[\"state\",\"color\",\"thing\"]', 'state', 1.00, NULL, '2026-10-11 18:28:03'),
(386, 56, 255, 11, 'fill_blank', 'In the phrase \'big blue castle\', the words big and blue are _____.', '[\"adjectives\",\"nouns\",\"pronouns\"]', 'adjectives', 1.00, NULL, '2026-10-11 18:28:03'),
(387, 56, 256, 12, 'matching', 'Match the part of speech to its job.', '[\"Noun | Person, place, or thing\",\"Verb | Action or state of being\",\"Adjective | Describes a noun\"]', 'Noun | Person, place, or thing; Verb | Action or state of being; Adjective | Describes a noun', 1.00, NULL, '2026-10-11 18:28:03'),
(388, 56, 257, 13, 'matching', 'Match the word to its noun category.', '[\"Anna | Person\",\"France | Place\",\"Book | Thing\"]', 'Anna | Person; France | Place; Book | Thing', 1.00, NULL, '2026-10-11 18:28:03'),
(389, 56, 258, 14, 'matching', 'Match each word from the lesson to its correct label.', '[\"Rabbit | Improper noun\",\"Honesty | Abstract noun\",\"Dogs | Plural noun\"]', 'Rabbit | Improper noun; Honesty | Abstract noun; Dogs | Plural noun', 1.00, NULL, '2026-10-11 18:28:03'),
(390, 56, 259, 15, 'matching', 'Match each pronoun type to its example.', '[\"Subject pronoun | She\",\"Object pronoun | Him\",\"Plural subject pronoun | We\"]', 'Subject pronoun | She; Object pronoun | Him; Plural subject pronoun | We', 1.00, NULL, '2026-10-11 18:28:03'),
(391, 56, 260, 16, 'sequencing', 'Put the words in order to make a complete sentence from the lesson.', '[\"The rabbit\",\"read\",\"the book.\"]', 'The rabbit | read | the book.', 1.00, NULL, '2026-10-11 18:28:03'),
(392, 56, 261, 17, 'sequencing', 'Put the words in order to build the sentence about Batman.', '[\"Batman\",\"drives\",\"the Batmobile.\"]', 'Batman | drives | the Batmobile.', 1.00, NULL, '2026-10-11 18:28:03'),
(393, 56, 262, 18, 'sequencing', 'Arrange the steps to show how a singular noun becomes plural.', '[\"Start with singular noun dog\",\"Add the letter s\",\"Get plural noun dogs\"]', 'Start with singular noun dog | Add the letter s | Get plural noun dogs', 1.00, NULL, '2026-10-11 18:28:03'),
(394, 56, 263, 19, 'sequencing', 'Put the words in order to describe the castle.', '[\"big\",\"blue\",\"castle\"]', 'big | blue | castle', 1.00, NULL, '2026-10-11 18:28:03'),
(395, 56, 264, 20, 'identification', 'Identify the word from the lesson that means a noun you can touch or hold.', '[\"loudly\",\"jumped\"]', 'tangible', 1.00, NULL, '2026-10-11 18:28:03'),
(396, 56, 265, 21, 'identification', 'Identify the part of speech that describes how actions are done.', '[\"quiet\",\"castle\"]', 'adverb', 1.00, NULL, '2026-10-11 18:28:03'),
(397, 56, 266, 22, 'identification', 'Identify the word that replaces the girl in \'She hugged him\'.', '[\"singing\",\"drives\"]', 'She', 1.00, NULL, '2026-10-11 18:28:03'),
(398, 56, 267, 23, 'identification', 'Identify the specific country name that is used as a proper noun in the lesson.', '[\"rabbit\",\"hammer\"]', 'France', 1.00, NULL, '2026-10-11 18:28:03'),
(399, 56, 268, 24, 'enumeration', 'Name three parts of speech introduced in the title of our lesson.', NULL, 'Accept: Nouns, Verbs, Adjectives (1 point for listing all three correctly).', 1.00, NULL, '2026-10-11 18:28:03'),
(400, 56, 269, 25, 'enumeration', 'Name three things a noun can signify according to the lesson.', NULL, 'Accept: Person, Place, Thing (1 point for listing these three).', 1.00, NULL, '2026-10-11 18:28:03'),
(401, 56, 270, 26, 'enumeration', 'List two helping verbs mentioned in the lesson.', NULL, 'Accept any two of: is, are, was, were, am, been, be, can, has, shall, will, do, does, did, have, should, may, might, being, would, must, could, had.', 1.00, NULL, '2026-10-11 18:28:03'),
(402, 56, 271, 27, 'short_answer', 'What is the difference between a singular noun and a plural noun?', NULL, 'A singular noun refers to only one person, place, or thing. A plural noun refers to more than one person, place, or thing, often by adding an s.', 1.00, NULL, '2026-10-11 18:28:03'),
(403, 56, 272, 28, 'short_answer', 'Why do writers use adjectives in their sentences?', NULL, 'Writers use adjectives to describe nouns. They help readers visualize and understand what an author has written by telling what kind, which, or how many.', 1.00, NULL, '2026-10-11 18:28:03'),
(404, 56, 273, 29, 'short_answer', 'How do helping verbs help an action verb in a sentence?', NULL, 'Helping verbs help extend the meaning of action verbs. They give further context, such as showing when the action takes place in the present or past.', 1.00, NULL, '2026-10-11 18:28:03'),
(405, 58, 342, 0, 'mcq', 'What kind of device is a sensor?', '[\"Input device\",\"Output device\",\"Sound speaker\",\"Display screen\"]', 'Input device', 1.00, NULL, '2026-10-12 15:51:20'),
(406, 58, 343, 1, 'mcq', 'Which sensor measures temperature and humidity?', '[\"DHT11 sensor\",\"Push button\",\"Active buzzer\",\"OLED screen\"]', 'DHT11 sensor', 1.00, NULL, '2026-10-12 15:51:20'),
(407, 58, 344, 2, 'mcq', 'What does an IR proximity sensor detect without touching?', '[\"Nearby objects\",\"Music songs\",\"Paint colors\",\"Cold ice\"]', 'Nearby objects', 1.00, NULL, '2026-10-12 15:51:20'),
(408, 58, 345, 3, 'mcq', 'What does a photosensitive resistor (LDR) sensor measure?', '[\"Light and brightness\",\"Loud sound\",\"Water level\",\"Wind speed\"]', 'Light and brightness', 1.00, NULL, '2026-10-12 15:51:20'),
(409, 58, 346, 4, 'mcq', 'What kind of movement does the HC-SR501 PIR sensor detect?', '[\"Human or animal movement\",\"Falling leaves\",\"Running water\",\"Blinking lights\"]', 'Human or animal movement', 1.00, NULL, '2026-10-12 15:51:20'),
(410, 58, 347, 5, 'fill_blank', 'Sensors are electronic parts that work as _____ devices.', '[\"input\",\"output\",\"battery\",\"screen\"]', 'input', 1.00, NULL, '2026-10-12 15:51:20'),
(411, 58, 348, 6, 'fill_blank', 'A sensor turns what it finds into an _____ signal.', '[\"electrical\",\"invisible\",\"outdoor\",\"animal\"]', 'electrical', 1.00, NULL, '2026-10-12 15:51:20'),
(412, 58, 349, 7, 'fill_blank', 'A push button sensor knows if a button is pressed or _____.', '[\"released\",\"broken\",\"painted\",\"erased\"]', 'released', 1.00, NULL, '2026-10-12 15:51:20'),
(413, 58, 350, 8, 'fill_blank', 'A potentiometer sensor changes its voltage when you turn a _____.', '[\"knob\",\"wheel\",\"screw\",\"key\"]', 'knob', 1.00, NULL, '2026-10-12 15:51:20'),
(414, 58, 351, 9, 'fill_blank', 'The NEO-M8N GPS module is used to give positioning _____.', '[\"accuracy\",\"brightness\",\"warmth\",\"sound\"]', 'accuracy', 1.00, NULL, '2026-10-12 15:51:20'),
(415, 58, 352, 10, 'short_answer', 'What is the job of a sensor?', NULL, 'A sensor detects or measures physical things around it, like light or heat. It then turns that measurement into an electrical signal that a controller can read.', 2.00, NULL, '2026-10-12 15:51:20'),
(416, 58, 353, 11, 'short_answer', 'How does an IR proximity sensor find nearby objects?', NULL, 'An IR proximity sensor emits and receives infrared light. This lets it detect objects close to it without actually touching them.', 2.00, NULL, '2026-10-12 15:51:20'),
(417, 58, 354, 12, 'short_answer', 'What does a DHT11 sensor tell us about the air?', NULL, 'The DHT11 sensor tells us about the air\'s temperature and humidity. It is a digital sensor that measures how warm or damp the air is.', 2.00, NULL, '2026-10-12 15:51:20'),
(418, 58, 355, 13, 'short_answer', 'How does the HC-SR501 PIR sensor help protect an area?', NULL, 'The HC-SR501 PIR sensor detects movement from people or animals. It can spot this motion up to several meters away to alert a system.', 2.00, NULL, '2026-10-12 15:51:20'),
(419, 58, 356, 14, 'short_answer', 'Where can we see a push button sensor being used at home?', NULL, 'A push button sensor can be used on a doorbell at home. When someone presses the button, it connects the circuit so a bell can ring.', 2.00, NULL, '2026-10-12 15:51:20'),
(420, 59, 377, 0, 'mcq', 'What does IoT stand for?', '[\"Internet of Things\",\"International Order of Technology\",\"Integrated Operational Tools\",\"Internet of Trade\"]', 'Internet of Things', 1.00, NULL, '2026-10-13 06:59:49'),
(421, 59, 378, 1, 'mcq', 'Which component is NOT part of a typical IoT system?', '[\"Sensors/actuators\",\"User interfaces\",\"Operating system for multitasking\",\"Network connectivity\"]', 'Operating system for multitasking', 1.00, NULL, '2026-10-13 06:59:49'),
(422, 59, 379, 2, 'mcq', 'Which device is an example of a microcontroller development board?', '[\"ESP32\",\"Smartphone\",\"Laptop\",\"Desktop PC\"]', 'ESP32', 1.00, NULL, '2026-10-13 06:59:49'),
(423, 59, 380, 3, 'mcq', 'Which sensor measures ambient light intensity?', '[\"LDR (photosensitive resistor)\",\"IR proximity sensor\",\"PIR motion sensor\",\"Potentiometer\"]', 'LDR (photosensitive resistor)', 1.00, NULL, '2026-10-13 06:59:49'),
(424, 59, 381, 4, 'mcq', 'What is the main function of an actuator?', '[\"Convert electrical signal to physical action\",\"Measure temperature\",\"Store data\",\"Transmit Wi‑Fi signals\"]', 'Convert electrical signal to physical action', 1.00, NULL, '2026-10-13 06:59:49'),
(425, 59, 382, 5, 'true_false', 'A microcontroller is the same as a personal computer.', '[\"True\",\"False\"]', 'False', 1.00, NULL, '2026-10-13 06:59:49'),
(426, 59, 383, 6, 'true_false', 'The DHT11 sensor can measure both temperature and humidity.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-13 06:59:49'),
(427, 59, 384, 7, 'true_false', 'Single Board Computers can run a full operating system on one board.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-13 06:59:49'),
(428, 59, 385, 8, 'true_false', 'Passive buzzers need an external signal to produce sound.', '[\"True\",\"False\"]', 'True', 1.00, NULL, '2026-10-13 06:59:49'),
(429, 59, 386, 9, 'true_false', 'Wi‑Fi and Bluetooth are features only found in Arduino boards.', '[\"True\",\"False\"]', 'False', 1.00, NULL, '2026-10-13 06:59:49'),
(430, 59, 387, 10, 'fill_blank', 'The ESP32 board includes both Wi‑Fi and _____ connectivity.', '[\"Bluetooth\",\"Zigbee\",\"LoRa\",\"Cellular\"]', 'Bluetooth', 1.00, NULL, '2026-10-13 06:59:49'),
(431, 59, 388, 11, 'fill_blank', 'A sensor converts a physical property into an _____ signal.', '[\"electrical\",\"magnetic\",\"optical\",\"thermal\"]', 'electrical', 1.00, NULL, '2026-10-13 06:59:49'),
(432, 59, 389, 12, 'fill_blank', 'The HC‑SR501 is a _____ motion sensor.', '[\"PIR\",\"IR\",\"Ultrasonic\",\"Magnetic\"]', 'PIR', 1.00, NULL, '2026-10-13 06:59:49'),
(433, 59, 390, 13, 'fill_blank', 'A microcontroller typically contains a CPU, memory, and I/O _____ .', '[\"pins\",\"ports\",\"chips\",\"modules\"]', 'pins', 1.00, NULL, '2026-10-13 06:59:49'),
(434, 59, 391, 14, 'fill_blank', 'Smart thermostats are an example of _____ homes.', '[\"smart\",\"automated\",\"connected\",\"digital\"]', 'smart', 1.00, NULL, '2026-10-13 06:59:49'),
(435, 59, 392, 15, 'identification', 'Name one common place where microcontrollers are used.', '[\"Refrigerator\"]', 'Microwave oven', 1.00, NULL, '2026-10-13 06:59:49'),
(436, 59, 393, 16, 'identification', 'What does the acronym SBC stand for?', '[\"System Bus Controller\"]', 'Single Board Computer', 1.00, NULL, '2026-10-13 06:59:49'),
(437, 59, 394, 17, 'identification', 'Give one type of output device (actuator) mentioned in the lesson.', '[\"OLED screen\"]', 'Passive buzzer', 1.00, NULL, '2026-10-13 06:59:49'),
(438, 59, 395, 18, 'identification', 'Which sensor module detects human movement within a few meters?', '[\"IR proximity sensor\"]', 'PIR motion sensor', 1.00, NULL, '2026-10-13 06:59:49'),
(439, 59, 396, 19, 'identification', 'What is the primary purpose of a microcontroller development board?', '[\"High graphics\"]', 'Easy programming', 1.00, NULL, '2026-10-13 06:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_scores`
--

CREATE TABLE `assessment_scores` (
  `id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `score` decimal(8,2) NOT NULL,
  `rubric_scores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rubric_scores`)),
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_scores`
--

INSERT INTO `assessment_scores` (`id`, `assessment_id`, `student_id`, `score`, `rubric_scores`, `recorded_at`) VALUES
(2, 12, 5, 29.00, NULL, '2026-10-02 02:50:59'),
(3, 13, 5, 3.00, NULL, '2026-10-02 03:43:52'),
(4, 15, 5, 8.00, '{\"a0_0\":5,\"Creativity\":5,\"a0_1\":3,\"Practicality\":3}', '2026-10-02 04:05:30'),
(5, 18, 5, 4.00, NULL, '2026-10-02 05:47:47'),
(6, 20, 5, 9.00, NULL, '2026-10-02 06:01:34'),
(7, 22, 5, 4.00, NULL, '2026-10-02 08:03:12'),
(8, 23, 5, 4.00, NULL, '2026-10-04 09:07:43'),
(10, 25, 5, 4.00, NULL, '2026-10-04 09:23:31'),
(14, 30, 7, 2.00, NULL, '2026-10-07 07:03:51'),
(16, 32, 5, 2.00, NULL, '2026-10-10 01:25:59'),
(17, 34, 5, 1.00, NULL, '2026-10-11 06:25:53'),
(18, 37, 5, 10.00, NULL, '2026-10-11 07:43:49'),
(19, 38, 5, 1.00, NULL, '2026-10-11 08:18:10'),
(20, 39, 5, 2.00, NULL, '2026-10-11 08:28:21'),
(21, 40, 5, 0.00, NULL, '2026-10-11 08:46:04'),
(22, 41, 5, 0.00, NULL, '2026-10-11 09:03:17'),
(24, 58, 5, 7.00, NULL, '2026-10-12 15:55:22'),
(25, 59, 53, 16.00, NULL, '2026-10-13 07:02:03');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `DATE` date NOT NULL,
  `session` enum('AM','PM') NOT NULL DEFAULT 'AM',
  `subject_id` int(11) DEFAULT NULL,
  `subject_key` int(11) GENERATED ALWAYS AS (ifnull(`subject_id`,0)) STORED,
  `STATUS` enum('Present','Absent','Late','Excused') NOT NULL,
  `recorded_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `DATE`, `session`, `subject_id`, `STATUS`, `recorded_by`, `created_at`) VALUES
(1, 5, '2026-10-01', 'AM', NULL, 'Present', 2, '2026-10-01 13:35:40'),
(2, 5, '2026-10-02', 'AM', NULL, 'Present', 2, '2026-10-02 02:50:07'),
(3, 5, '2026-10-02', 'PM', NULL, 'Present', 2, '2026-10-02 05:16:25'),
(16, 5, '2026-10-03', 'AM', NULL, 'Absent', 2, '2026-10-02 21:14:22'),
(18, 5, '2026-10-04', 'AM', NULL, 'Present', 2, '2026-10-04 08:52:13'),
(19, 5, '2026-10-04', 'PM', NULL, 'Present', 2, '2026-10-04 08:52:19'),
(20, 5, '2026-10-06', 'PM', NULL, 'Present', 2, '2026-10-06 06:32:04'),
(21, 5, '2026-10-06', 'AM', NULL, 'Present', 2, '2026-10-06 07:38:50'),
(22, 5, '2026-10-07', 'AM', NULL, 'Present', 2, '2026-10-07 05:29:20'),
(23, 5, '2026-10-07', 'PM', NULL, 'Present', 2, '2026-10-07 05:29:40'),
(24, 7, '2026-10-07', 'AM', 18, 'Present', 13, '2026-10-07 07:02:55'),
(25, 5, '2026-10-09', 'AM', NULL, 'Present', 2, '2026-10-09 05:46:04'),
(26, 5, '2026-10-09', 'PM', NULL, 'Present', 2, '2026-10-09 05:46:28'),
(27, 5, '2026-10-10', 'AM', NULL, 'Absent', 2, '2026-10-09 23:42:34'),
(29, 5, '2026-10-11', 'PM', NULL, 'Present', 2, '2026-10-11 05:45:44'),
(30, 5, '2026-10-12', 'AM', NULL, 'Present', 2, '2026-10-11 16:00:58'),
(31, 5, '2026-10-12', 'PM', NULL, 'Present', 2, '2026-10-12 15:51:28'),
(32, 5, '2026-10-13', 'AM', NULL, 'Present', 2, '2026-10-12 18:21:18'),
(33, 53, '2026-10-13', 'AM', 13, 'Present', 97, '2026-10-13 06:30:06');

-- --------------------------------------------------------

--
-- Table structure for table `concerns`
--

CREATE TABLE `concerns` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `SUBJECT` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `STATUS` enum('open','resolved','closed') DEFAULT 'open',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `teacher_reply` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `concerns`
--

INSERT INTO `concerns` (`id`, `parent_id`, `teacher_id`, `student_id`, `SUBJECT`, `message`, `STATUS`, `priority`, `teacher_reply`, `replied_at`, `created_at`, `updated_at`) VALUES
(1, 3, 2, 5, 'sdsk', 'dfjkdsk', 'resolved', 'normal', 'sdskdska', '2026-10-02 20:20:19', '2026-10-02 20:15:25', '2026-10-02 20:21:05'),
(2, 3, 2, 5, 'Concern', 'Sample', 'resolved', 'normal', 'Yes?', '2026-10-04 09:38:58', '2026-10-04 09:37:58', '2026-10-04 09:39:11'),
(3, 3, 2, 5, 'Bakit', 'Bakit ulit ulit', 'resolved', 'normal', 'kasi makulit', '2026-10-09 05:44:00', '2026-10-06 07:11:20', '2026-10-10 01:30:13');

-- --------------------------------------------------------

--
-- Table structure for table `concern_reads`
--

CREATE TABLE `concern_reads` (
  `user_id` int(11) NOT NULL,
  `concern_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `concern_reads`
--

INSERT INTO `concern_reads` (`user_id`, `concern_id`, `read_at`) VALUES
(2, 1, '2026-10-04 09:15:18'),
(2, 2, '2026-10-04 09:39:11'),
(2, 3, '2026-10-10 01:30:13'),
(3, 1, '2026-10-07 07:01:31'),
(3, 2, '2026-10-07 07:01:28'),
(3, 3, '2026-10-10 01:30:13');

-- --------------------------------------------------------

--
-- Table structure for table `concern_replies`
--

CREATE TABLE `concern_replies` (
  `id` int(11) NOT NULL,
  `concern_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `concern_replies`
--

INSERT INTO `concern_replies` (`id`, `concern_id`, `sender_id`, `message`, `created_at`) VALUES
(1, 1, 2, 'sdskdska', '2026-10-02 20:20:19'),
(2, 1, 3, 'bfl', '2026-10-02 20:20:42'),
(3, 2, 2, 'Yes?', '2026-10-04 09:38:58'),
(4, 3, 2, 'kasi makulit', '2026-10-09 05:44:00');

-- --------------------------------------------------------

--
-- Table structure for table `inbox_trash`
--

CREATE TABLE `inbox_trash` (
  `user_id` int(11) NOT NULL,
  `item_type` enum('announcement','concern','message') NOT NULL,
  `item_id` int(11) NOT NULL,
  `emptied` tinyint(1) NOT NULL DEFAULT 0,
  `trashed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inbox_trash`
--

INSERT INTO `inbox_trash` (`user_id`, `item_type`, `item_id`, `emptied`, `trashed_at`) VALUES
(2, 'announcement', 13, 0, '2026-10-09 08:37:30');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_plans`
--

CREATE TABLE `lesson_plans` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `grade_level` int(11) NOT NULL,
  `objectives` text DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lesson_plans`
--

INSERT INTO `lesson_plans` (`id`, `title`, `subject_id`, `grade_level`, `objectives`, `file_path`, `uploaded_by`, `created_at`) VALUES
(1, 'activity', 13, 1, NULL, '/assets/lesson-plans/lp_2_1790860913570.pdf', 2, '2026-10-01 13:21:53'),
(2, 'Plants', 13, 1, 'Identify and understand the different parts of plants we eat.', '/assets/lesson-plans/lp_2_1790861182899.pdf', 2, '2026-10-01 13:26:23'),
(3, 'try', 12, 1, NULL, '/assets/lesson-plans/lp_2_1790861538213.docx', 2, '2026-10-01 13:32:18'),
(4, 'PT3', 13, 1, NULL, '/assets/lesson-plans/lp_2_1790904773689.pdf', 2, '2026-10-02 01:32:53'),
(5, 'Nouns & Verbs', 18, 1, NULL, '/assets/lesson-plans/lp_2_1791104140261.pdf', 2, '2026-10-04 08:55:40'),
(8, 'Sample', 18, 4, NULL, '/assets/lesson-plans/lp_13_1791356108005.pdf', 13, '2026-10-07 06:55:08'),
(9, 'math', 12, 1, NULL, '/assets/lesson-plans/lp_2_1791524314034.docx', 2, '2026-10-09 05:38:34'),
(11, 'Nouns and Verbs', 24, 1, NULL, '/assets/lesson-plans/lp_2_1791595108759.pdf', 2, '2026-10-10 01:18:29'),
(12, 'UseofNounsVerbsAdjectives (1)', 23, 1, NULL, '/assets/lesson-plans/lp_2_1791742344383.pdf', 2, '2026-10-11 18:12:24'),
(14, 'UseofNounsVerbsAdjectives (1)', 23, 1, NULL, '/assets/lesson-plans/lp_2_1791743149986.pdf', 2, '2026-10-11 18:25:49'),
(15, 'IoT', 13, 1, NULL, '/assets/lesson-plans/lp_2_1791784697614.pdf', 2, '2026-10-12 05:58:17'),
(16, 'UseofNounsVerbsAdjectives (1)', 20, 1, NULL, '/assets/lesson-plans/lp_2_1791790770640.pdf', 2, '2026-10-12 07:39:30'),
(18, 'IoT', 13, 5, NULL, '/assets/lesson-plans/lp_97_1791873229869.pdf', 97, '2026-10-13 06:33:49');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `SUBJECT` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `category` enum('concern','announcement','general') DEFAULT 'general',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `student_id`, `SUBJECT`, `message`, `category`, `is_read`, `created_at`) VALUES
(1, 2, 3, 5, 'Attendance update for John Carter', 'John Carter was marked Present (AM session) in Grade 1-A on 2026-10-10.', 'announcement', 1, '2026-10-09 23:42:39'),
(2, 2, 3, 5, 'Attendance update for John Carter', 'John Carter was marked Absent (AM session) in Grade 1-A on 2026-10-10.', 'announcement', 1, '2026-10-10 03:18:09'),
(3, 2, 3, 5, 'Attendance update for John Carter', 'John Carter was marked Present (PM session) in Grade 1-A on 2026-10-11.', 'announcement', 1, '2026-10-11 15:33:15');

-- --------------------------------------------------------

--
-- Table structure for table `parent_profiles`
--

CREATE TABLE `parent_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parent_profiles`
--

INSERT INTO `parent_profiles` (`id`, `user_id`, `address`, `emergency_contact`) VALUES
(1, 3, 'San Vicente Ogbon, Nabua, Camarines Sur', '09708668466'),
(2, 14, 'Iriga City', '09181234567'),
(3, 15, 'Naga City', '09181234568'),
(4, 16, 'Pili', '09181234569'),
(5, 35, NULL, NULL),
(6, 36, NULL, NULL),
(7, 37, NULL, NULL),
(8, 38, NULL, NULL),
(9, 39, NULL, NULL),
(10, 40, NULL, NULL),
(11, 41, NULL, NULL),
(12, 43, NULL, NULL),
(13, 44, NULL, NULL),
(14, 46, NULL, NULL),
(15, 47, NULL, NULL),
(16, 48, NULL, NULL),
(17, 49, NULL, NULL),
(18, 50, NULL, NULL),
(19, 51, NULL, NULL),
(20, 52, NULL, NULL),
(21, 53, NULL, NULL),
(22, 54, NULL, NULL),
(23, 55, NULL, NULL),
(24, 56, NULL, NULL),
(25, 57, NULL, NULL),
(26, 59, NULL, NULL),
(27, 60, NULL, NULL),
(28, 61, NULL, NULL),
(29, 62, NULL, NULL),
(30, 63, NULL, NULL),
(31, 64, NULL, NULL),
(32, 65, NULL, NULL),
(33, 66, NULL, NULL),
(34, 67, NULL, NULL),
(35, 69, NULL, NULL),
(36, 70, NULL, NULL),
(37, 71, NULL, NULL),
(38, 72, NULL, NULL),
(39, 73, NULL, NULL),
(40, 74, NULL, NULL),
(41, 76, NULL, NULL),
(42, 77, NULL, NULL),
(43, 79, NULL, NULL),
(44, 81, NULL, NULL),
(45, 82, NULL, NULL),
(46, 83, NULL, NULL),
(47, 85, NULL, NULL),
(48, 86, NULL, NULL),
(49, 88, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `parent_student_links`
--

CREATE TABLE `parent_student_links` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parent_student_links`
--

INSERT INTO `parent_student_links` (`id`, `parent_id`, `student_id`, `created_at`) VALUES
(7, 3, 5, '2026-10-06 07:49:21'),
(8, 3, 7, '2026-10-07 06:52:41'),
(9, 35, 8, '2026-10-10 00:01:57'),
(10, 36, 9, '2026-10-10 00:01:57'),
(11, 37, 10, '2026-10-10 00:01:57'),
(12, 38, 11, '2026-10-10 00:01:57'),
(13, 39, 12, '2026-10-10 00:01:57'),
(14, 40, 13, '2026-10-10 00:01:57'),
(15, 41, 14, '2026-10-10 00:01:57'),
(16, 43, 15, '2026-10-10 00:01:57'),
(17, 44, 16, '2026-10-10 00:01:57'),
(18, 46, 17, '2026-10-10 00:01:57'),
(19, 47, 18, '2026-10-10 00:01:57'),
(20, 48, 19, '2026-10-10 00:01:57'),
(21, 49, 20, '2026-10-10 00:01:57'),
(22, 50, 21, '2026-10-10 00:01:57'),
(23, 51, 22, '2026-10-10 00:01:57'),
(24, 52, 23, '2026-10-10 00:01:57'),
(25, 53, 24, '2026-10-10 00:01:57'),
(26, 54, 25, '2026-10-10 00:01:57'),
(27, 55, 26, '2026-10-10 00:01:57'),
(28, 56, 27, '2026-10-10 00:01:57'),
(29, 57, 28, '2026-10-10 00:01:57'),
(30, 59, 29, '2026-10-10 00:01:57'),
(31, 60, 30, '2026-10-10 00:01:57'),
(32, 61, 31, '2026-10-10 00:01:57'),
(33, 62, 32, '2026-10-10 00:01:57'),
(34, 63, 33, '2026-10-10 00:01:57'),
(35, 64, 34, '2026-10-10 00:01:57'),
(36, 65, 35, '2026-10-10 00:01:57'),
(37, 66, 36, '2026-10-10 00:01:57'),
(38, 67, 37, '2026-10-10 00:01:57'),
(39, 69, 38, '2026-10-10 00:01:57'),
(40, 70, 39, '2026-10-10 00:01:57'),
(41, 71, 40, '2026-10-10 00:01:57'),
(42, 72, 41, '2026-10-10 00:01:57'),
(43, 73, 42, '2026-10-10 00:01:57'),
(44, 74, 43, '2026-10-10 00:01:57'),
(45, 76, 44, '2026-10-10 00:01:57'),
(46, 77, 45, '2026-10-10 00:01:57'),
(47, 79, 46, '2026-10-10 00:01:57'),
(48, 81, 47, '2026-10-10 00:01:57'),
(49, 82, 48, '2026-10-10 00:01:57'),
(50, 83, 49, '2026-10-10 00:01:57'),
(51, 85, 50, '2026-10-10 00:01:57'),
(52, 86, 51, '2026-10-10 00:01:57'),
(53, 88, 52, '2026-10-10 00:01:57'),
(54, 3, 53, '2026-10-13 06:23:54');

-- --------------------------------------------------------

--
-- Table structure for table `question_bank`
--

CREATE TABLE `question_bank` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `quiz_set_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `grade_level` int(11) NOT NULL,
  `lesson_plan_id` int(11) DEFAULT NULL,
  `lesson_title` varchar(255) DEFAULT NULL,
  `item_type` varchar(32) NOT NULL DEFAULT 'mcq',
  `question` text NOT NULL,
  `choices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`choices`)),
  `answer` varchar(500) DEFAULT NULL,
  `points` decimal(8,2) NOT NULL DEFAULT 1.00,
  `source` enum('ai','manual') NOT NULL DEFAULT 'manual',
  `ai_recommendation_id` int(11) DEFAULT NULL,
  `status` enum('active','archived') NOT NULL DEFAULT 'active',
  `rubric` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rubric`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `folder` varchar(20) NOT NULL DEFAULT 'quiz'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_bank`
--

INSERT INTO `question_bank` (`id`, `teacher_id`, `quiz_set_id`, `subject_id`, `grade_level`, `lesson_plan_id`, `lesson_title`, `item_type`, `question`, `choices`, `answer`, `points`, `source`, `ai_recommendation_id`, `status`, `rubric`, `created_at`, `updated_at`, `folder`) VALUES
(1, 2, 1, 13, 1, 1, 'activity', 'mcq', 'Why was NTFS chosen on the Linux server?', '[\"It is a faster file system.\",\"It is more secure than ext4.\",\"It allows files to be read directly on a Windows machine.\",\"It is only for Linux users.\"]', 'It allows files to be read directly on a Windows machine.', 2.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(2, 2, 1, 13, 1, 1, 'activity', 'identification', 'What does /dev/sda represent?', NULL, 'The existing system disk.', 2.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(3, 2, 1, 13, 1, 1, 'activity', 'enumeration', 'List the two file systems used on the new disks.', NULL, 'ext4, NTFS', 3.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(4, 2, 1, 13, 1, 1, 'activity', 'mcq', 'What is the purpose of taking a snapshot before running destructive commands?', '[\"To create a backup of the disk.\",\"To erase the disk completely.\",\"To undo any changes made to the disk.\",\"To increase the disk size.\"]', 'To undo any changes made to the disk.', 2.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(5, 2, 1, 13, 1, 1, 'activity', 'identification', 'What is the name of the command used to create a partition table on Storage 1?', NULL, 'fdisk', 2.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(6, 2, 1, 13, 1, 1, 'activity', 'enumeration', 'List the two partitions created on Storage 2.', NULL, 'Partition 1 - 15 GB, Partition 2 - remaining 15 GB', 3.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(7, 2, 1, 13, 1, 1, 'activity', 'mcq', 'What is the purpose of formatting a file system?', '[\"To increase the disk size.\",\"To erase the disk completely.\",\"To create a new partition.\",\"To make the file system usable by the operating system.\"]', 'To make the file system usable by the operating system.', 2.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(8, 2, 1, 13, 1, 1, 'activity', 'identification', 'What is the name of the command used to mount a partition?', NULL, 'mount', 2.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(9, 2, 1, 13, 1, 1, 'activity', 'enumeration', 'List the three file systems mentioned in the task.', NULL, 'ext4, NTFS, Windows', 3.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(10, 2, 1, 13, 1, 1, 'activity', 'mcq', 'What is the recommended way to document your work?', '[\"To write a report.\",\"To create a video.\",\"To insert images into a Word document.\",\"To paste text into a document.\"]', 'To insert images into a Word document.', 2.00, 'ai', 2, 'active', NULL, '2026-10-01 13:30:43', '2026-10-11 17:17:03', 'exam'),
(11, 2, 1, 13, 1, 1, 'activity', 'activity', 'Students work in pairs on a short Grade 1 task about \"activity\" (Science). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, 'ai', 2, 'active', '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-01 13:30:43', '2026-10-01 13:30:43', 'quiz'),
(12, 2, 2, 13, 1, 2, 'Plants', 'mcq', 'What is the function of the root of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To grow up from the ground and catch the sun.\"]', 'To anchor the plant in the ground.', 2.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(13, 2, 2, 13, 1, 2, 'Plants', 'identification', 'What is the name of the part of the plant that holds the seeds?', NULL, 'Seed', 2.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(14, 2, 2, 13, 1, 2, 'Plants', 'enumeration', 'Name the three parts of the plant that we use for food:', NULL, 'Fruit, Leaf, and Root', 3.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(15, 2, 2, 13, 1, 2, 'Plants', 'mcq', 'What is the function of the leaf of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To breathe the air and catch the sun.\"]', 'To breathe the air and catch the sun.', 2.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(16, 2, 2, 13, 1, 2, 'Plants', 'identification', 'What is the name of the part of the plant that produces flowers?', NULL, 'Flower', 2.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(17, 2, 2, 13, 1, 2, 'Plants', 'enumeration', 'Name the two parts of the plant that are fruits:', NULL, 'Peppers, Zucchini', 3.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(18, 2, 2, 13, 1, 2, 'Plants', 'mcq', 'What is the function of the stem of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To grow up from the ground and catch the sun.\"]', 'To grow up from the ground and catch the sun.', 2.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(19, 2, 2, 13, 1, 2, 'Plants', 'identification', 'What is the name of the part of the plant that is used for planting?', NULL, 'Seed', 2.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(20, 2, 2, 13, 1, 2, 'Plants', 'enumeration', 'Name the three parts of the plant that we use for food:', NULL, 'Leaf, Root, Fruit', 3.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(21, 2, 2, 13, 1, 2, 'Plants', 'mcq', 'What is the function of the fruit of a plant?', '[\"To hold the pollen and attract bees.\",\"To anchor the plant in the ground.\",\"To get ripe and feed the ground.\",\"To hold the seeds and feed the ground.\"]', 'To hold the seeds and feed the ground.', 2.00, 'ai', 3, 'active', NULL, '2026-10-01 13:31:36', '2026-10-11 17:17:03', 'exam'),
(22, 2, 2, 13, 1, 2, 'Plants', 'activity', 'Sort the plant parts into their correct categories: Root, Stem, Leaf, Flower, Fruit, and Seed. Use the pictures and descriptions provided to help you sort.', NULL, NULL, 10.00, 'ai', 3, 'active', '{\"categories\":[{\"name\":\"Accuracy\",\"max_points\":10,\"levels\":[{\"label\":\"Excellent\",\"points\":10,\"description\":\"All plant parts were correctly sorted into their categories.\"},{\"label\":\"Good\",\"points\":8,\"description\":\"Most plant parts were correctly sorted, but some were incorrect.\"},{\"label\":\"Fair\",\"points\":5,\"description\":\"Some plant parts were correctly sorted, but many were incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":3,\"description\":\"Most plant parts were not correctly sorted.\"}]}]}', '2026-10-01 13:31:36', '2026-10-01 13:31:36', 'quiz'),
(23, 2, 3, 12, 1, 3, 'try', 'mcq', 'What is the main reason why Criminology students at USANT are not participating in campus organizations?', '[\"Heavy academic demands\",\"Financial constraints\",\"Both A and B\"]', 'Both A and B', 2.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(24, 2, 3, 12, 1, 3, 'try', 'identification', 'What is the name of the theory that posits a student\'s growth is directly proportional to the physical and psychological energy they invest in the college experience?', NULL, 'Astin\'s Theory of Student Involvement', 2.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(25, 2, 3, 12, 1, 3, 'try', 'enumeration', 'What are some of the barriers that hinder Criminology students\' participation in campus organizations?', NULL, 'Heavy academic demands,Financial constraints,Both A and B', 3.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(26, 2, 3, 12, 1, 3, 'try', 'mcq', 'What is the main goal of the Commission on Higher Education (CHED) regarding Criminology education?', '[\"To produce graduates who are technically proficient\",\"To produce graduates who are socially aware and ready for public service\",\"Both A and B\"]', 'Both A and B', 2.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(27, 2, 3, 12, 1, 3, 'try', 'identification', 'What is the name of the law that underscores the need for Criminologists to maintain high ethical standards and leadership capabilities?', NULL, 'Republic Act No. 11131', 2.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(28, 2, 3, 12, 1, 3, 'try', 'enumeration', 'What are some of the benefits of student participation in campus organizations?', NULL, 'Leadership skills,Critical thinking skills,Social responsibility', 3.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(29, 2, 3, 12, 1, 3, 'try', 'mcq', 'What is the main reason why Criminology students at USANT are not participating in campus organizations?', '[\"Lack of time\",\"Lack of interest\",\"Financial constraints\"]', 'Financial constraints', 2.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(30, 2, 3, 12, 1, 3, 'try', 'identification', 'What is the name of the study that suggests that students who engage in extracurricular activities gain hands-on experience that effectively prepares them for real-world workplace demands?', NULL, 'Malafaia et al. (2023)', 2.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(31, 2, 3, 12, 1, 3, 'try', 'enumeration', 'What are some of the ways that campus organizations can serve as training grounds for future officers?', NULL, 'Leadership skills,Critical thinking skills,Social responsibility', 3.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(32, 2, 3, 12, 1, 3, 'try', 'mcq', 'What is the main goal of campus organizations for Criminology students?', '[\"To provide a social life\",\"To provide a leadership opportunity\",\"To provide a training ground for future officers\"]', 'To provide a training ground for future officers', 2.00, 'ai', 6, 'active', NULL, '2026-10-01 13:56:44', '2026-10-11 17:18:24', 'quiz'),
(33, 2, 3, 12, 1, 3, 'try', 'activity', 'Work in groups to design a campus organization that addresses the unique needs of Criminology students at USANT. Consider the benefits of student participation and the barriers that hinder it.', NULL, NULL, 10.00, 'ai', 6, 'active', '{\"categories\":[{\"name\":\"Creativity\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"The organization is innovative and addresses the unique needs of Criminology students.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"The organization is good, but may not address all the unique needs of Criminology students.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"The organization is fair, but may not be very innovative or address many of the unique needs of Criminology students.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"The organization is not very creative and does not address many of the unique needs of Criminology students.\"}]},{\"name\":\"Relevance\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"The organization is highly relevant to the needs of Criminology students and addresses many of the barriers that hinder participation.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"The organization is somewhat relevant to the needs of Criminology students, but may not address all the barriers that hinder participation.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"The organization is not very relevant to the needs of Criminology students and does not address many of the barriers that hinder participation.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"The organization is not relevant to the needs of Criminology students and does not address any of the barriers that hinder participation.\"}]}]}', '2026-10-01 13:56:44', '2026-10-01 13:56:44', 'quiz'),
(34, 2, 4, 13, 1, 4, 'PT3', 'mcq', 'Why did Isla Verde Trading Corp. choose to use NTFS on their Linux server?', '[\"Because it\'s a Windows file system\",\"Because it\'s a Linux file system\",\"Because it allows files to be read directly on a Windows machine\",\"Because it\'s more secure\"]', '3', 1.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(35, 2, 4, 13, 1, 4, 'PT3', 'identification', 'What does /dev/sda refer to?', NULL, 'The existing system disk', 1.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(36, 2, 4, 13, 1, 4, 'PT3', 'enumeration', 'List the two file systems used on the new disks', NULL, 'ext4, NTFS', 2.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(37, 2, 4, 13, 1, 4, 'PT3', 'mcq', 'What is the purpose of taking a snapshot before running destructive commands?', '[\"To create a backup of the disk\",\"To undo any changes made to the disk\",\"To install new software\",\"To upgrade the operating system\"]', '2', 1.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(38, 2, 4, 13, 1, 4, 'PT3', 'identification', 'What is the purpose of the \'sudo\' command?', NULL, 'To gain superuser privileges', 1.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(39, 2, 4, 13, 1, 4, 'PT3', 'enumeration', 'List the four required screenshots for this task', NULL, 'SS-01, SS-02, SS-03, SS-04', 2.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(40, 2, 4, 13, 1, 4, 'PT3', 'mcq', 'What is the correct command to list the block device names?', '[\"lsblk\",\"sudo lsblk\",\"sudo -i lsblk\",\"sudo lsblk -l\"]', '2', 1.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(41, 2, 4, 13, 1, 4, 'PT3', 'identification', 'What is the purpose of the \'mkfs.ext4\' command?', NULL, 'To format a partition with the ext4 file system', 1.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(42, 2, 4, 13, 1, 4, 'PT3', 'enumeration', 'List the two partitions created on Storage 2', NULL, 'Partition 1 - 15 GB, Partition 2 - remaining 15 GB', 2.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(43, 2, 4, 13, 1, 4, 'PT3', 'mcq', 'What is the correct command to write data to a partition?', '[\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"sudo echo \'Hello World!\' > /dev/sda1\'\",\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"sudo echo \'Hello World!\' > /dev/sda1\"]', '2', 1.00, 'ai', 7, 'active', NULL, '2026-10-02 02:10:10', '2026-10-11 17:18:24', 'quiz'),
(44, 2, 4, 13, 1, 4, 'PT3', 'activity', 'Students work in pairs on a short Grade 1 task about \"PT3\" (Science). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, 'ai', 7, 'active', '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 02:10:10', '2026-10-02 02:10:10', 'quiz'),
(45, 2, 5, 12, 1, 3, 'try', 'mcq', 'What is the number of legs on a chair?', '[\"2\",\"4\",\"6\",\"8\"]', '4', 2.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(46, 2, 5, 12, 1, 3, 'try', 'identification', 'What is the sum of 2 + 2?', NULL, '4', 2.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(47, 2, 5, 12, 1, 3, 'try', 'enumeration', 'List 3 numbers that are greater than 5.', NULL, '6,7,8', 4.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(48, 2, 5, 12, 1, 3, 'try', 'mcq', 'How many wheels does a bicycle have?', '[\"1\",\"2\",\"3\",\"4\"]', '2', 2.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(49, 2, 5, 12, 1, 3, 'try', 'identification', 'What is the shape of a square?', NULL, '4 sides', 2.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(50, 2, 5, 12, 1, 3, 'try', 'enumeration', 'List 2 shapes that are used in art.', NULL, 'circle,triangle', 4.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(51, 2, 5, 12, 1, 3, 'try', 'mcq', 'How many sides does a triangle have?', '[\"2\",\"3\",\"4\",\"5\"]', '3', 2.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(52, 2, 5, 12, 1, 3, 'try', 'identification', 'What is the number that comes after 5?', NULL, '6', 2.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(53, 2, 5, 12, 1, 3, 'try', 'enumeration', 'List 3 colors of the rainbow.', NULL, 'red,blue,green', 4.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(54, 2, 5, 12, 1, 3, 'try', 'mcq', 'How many legs does a dog have?', '[\"1\",\"2\",\"3\",\"4\"]', '4', 2.00, 'ai', 8, 'active', NULL, '2026-10-02 02:37:32', '2026-10-11 17:18:24', 'quiz'),
(55, 2, 5, 12, 1, 3, 'try', 'activity', 'Students work in pairs on a short Grade 1 task about \"try\" (Mathematics). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, 'ai', 8, 'active', '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 02:37:32', '2026-10-02 02:37:32', 'quiz'),
(56, 2, 6, 12, 1, 3, 'try', 'mcq', 'What is the main reason why Criminology students may not participate in campus organizations?', '[\"Heavy academic demands\",\"Financial constraints\",\"Lack of time\"]', 'Heavy academic demands', 2.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(57, 2, 6, 12, 1, 3, 'try', 'identification', 'What is the name of the theory that states a student\'s growth is directly proportional to the physical and psychological energy they invest in the college experience?', NULL, 'Astin\'s Theory of Student Involvement', 3.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(58, 2, 6, 12, 1, 3, 'try', 'enumeration', 'What are two ways that campus organizations can help Criminology students develop leadership skills?', NULL, 'Refining leadership skills,Developing social responsibility', 4.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(59, 2, 6, 12, 1, 3, 'try', 'mcq', 'What is the main goal of the Commission on Higher Education (CHED) for the Bachelor of Science in Criminology program?', '[\"To produce graduates who are technically proficient\",\"To produce graduates who are socially aware and ready for public service\"]', 'To produce graduates who are socially aware and ready for public service', 2.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(60, 2, 6, 12, 1, 3, 'try', 'identification', 'What is the name of the law that emphasizes the need for Criminologists to maintain high ethical standards and leadership capabilities?', NULL, 'Republic Act No. 11131', 3.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(61, 2, 6, 12, 1, 3, 'try', 'enumeration', 'What are two ways that financial constraints can affect Criminology students\' participation in campus organizations?', NULL, 'Making membership fees unaffordable,Requiring specialized uniforms', 4.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(62, 2, 6, 12, 1, 3, 'try', 'mcq', 'What is one way that campus organizations can help Criminology students develop interpersonal qualities?', '[\"Through lectures alone\",\"Through student-led organizational hierarchies\"]', 'Through student-led organizational hierarchies', 2.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(63, 2, 6, 12, 1, 3, 'try', 'identification', 'What is the name of the theory that suggests that students who engage in extracurricular activities gain hands-on experience that prepares them for real-world workplace demands?', NULL, 'Malafaia et al. (2023)', 3.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(64, 2, 6, 12, 1, 3, 'try', 'enumeration', 'What are two ways that campus organizations can help Criminology students develop critical thinking skills?', NULL, 'Through leadership roles,Through problem-solving activities', 4.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(65, 2, 6, 12, 1, 3, 'try', 'mcq', 'What is one way that campus organizations can help Criminology students develop emotional intelligence?', '[\"Through lectures alone\",\"Through student-led organizational hierarchies\"]', 'Through student-led organizational hierarchies', 2.00, 'ai', 9, 'active', NULL, '2026-10-02 02:45:57', '2026-10-11 17:18:24', 'quiz'),
(66, 2, 6, 12, 1, 3, 'try', 'activity', 'Work in groups to design a campus organization that can help Criminology students develop leadership skills, social responsibility, and emotional intelligence. Consider the challenges that Criminology students may face and how your organization can address them.', NULL, NULL, 10.00, 'ai', 9, 'active', '{\"categories\":[{\"name\":\"Creativity\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"The organization is innovative and addresses a specific challenge faced by Criminology students.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"The organization is well-thought-out and addresses a common challenge faced by Criminology students.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"The organization is basic and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"The organization is not well-designed and does not address a specific challenge faced by Criminology students.\"}]},{\"name\":\"Practicality\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"The organization is practical and addresses a specific challenge faced by Criminology students.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"The organization is basic and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"The organization is not well-designed and does not address a specific challenge faced by Criminology students.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"The organization is not practical and does not address a specific challenge faced by Criminology students.\"}]}]}', '2026-10-02 02:45:57', '2026-10-02 02:45:57', 'quiz'),
(67, 2, 7, 13, 1, 4, 'PT3', 'mcq', 'What is the purpose of using NTFS on a Linux server?', '[\"To create a separate file system for company archives\",\"To create a separate file system for finance records\",\"To allow files to be read directly on a Windows machine\",\"To create a separate file system for storage\"]', '3', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(68, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the name of the file system used for Storage 1?', NULL, 'ext4', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(69, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the name of the file system used for Storage 2?', NULL, 'NTFS', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(70, 2, 7, 13, 1, 4, 'PT3', 'enumeration', 'List the two file systems used for Storage 1 and Storage 2', NULL, 'ext4, NTFS', 10.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(71, 2, 7, 13, 1, 4, 'PT3', 'mcq', 'What is the command used to create a partition on a raw disk using fdisk?', '[\"sudo fdisk -l\",\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\"]', '4', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(72, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the purpose of taking a snapshot before running destructive commands?', NULL, 'To have an undo button', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(73, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the name of the device used for the existing system disk?', NULL, '/dev/sda', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(74, 2, 7, 13, 1, 4, 'PT3', 'mcq', 'What should you do before typing a device name in a command?', '[\"Type it anyway\",\"Read the device name out loud\",\"Ask someone else\",\"Check the manual\"]', '2', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(75, 2, 7, 13, 1, 4, 'PT3', 'enumeration', 'List the four parts of a block device name', NULL, 'device, type, partition, file system', 10.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(76, 2, 7, 13, 1, 4, 'PT3', 'mcq', 'What is the command used to format a partition with the ext4 file system?', '[\"sudo mkfs.ext4\",\"sudo mkf\",\"sudo p\",\"sudo l\"]', '1', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(77, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the purpose of creating a mount point?', NULL, 'To mount a partition', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(78, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the command used to mount a partition?', NULL, 'sudo mount', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(79, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the command used to unmount a partition?', NULL, 'sudo umount', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(80, 2, 7, 13, 1, 4, 'PT3', 'mcq', 'What is the purpose of using a snapshot?', '[\"To create a new file system\",\"To create a new partition\",\"To have an undo button\",\"To create a new device\"]', '3', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(81, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the name of the package used to install the NTFS-3g package?', NULL, 'ntfs-3g', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(82, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the purpose of using VirtualBox?', NULL, 'To create a virtual machine', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(83, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the purpose of taking a screenshot?', NULL, 'To capture the whole terminal window or the whole VirtualBox dialog', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(84, 2, 7, 13, 1, 4, 'PT3', 'identification', 'What is the rule for labeling each image?', NULL, 'With its code (SS-01, SS-02, ...)', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(85, 2, 7, 13, 1, 4, 'PT3', 'mcq', 'What should you do with the output of the lsblk command?', '[\"Ignore it\",\"Use it to create a partition\",\"Use it to format a partition\",\"Use it to mount a partition\"]', '2', 5.00, 'ai', 10, 'active', NULL, '2026-10-02 03:40:22', '2026-10-11 17:18:24', 'quiz'),
(86, 2, 7, 13, 1, 4, 'PT3', 'activity', 'Students work in pairs on a short Grade 1 task about \"PT3\" (Science). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, 'ai', 10, 'active', '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-02 03:40:22', '2026-10-02 03:40:22', 'quiz'),
(87, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\",\"An action\"]', 'A thing', 2.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(88, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'identification', 'What is the part of speech that describes a noun?', NULL, 'Adjective', 2.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(89, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'List 3 types of nouns:', NULL, 'Proper noun,Common noun,Collective noun', 3.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(90, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is the function of pronouns?', '[\"To replace verbs\",\"To replace nouns\",\"To replace adjectives\",\"To replace adverbs\"]', 'To replace nouns', 2.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(91, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'identification', 'What is the part of speech that describes a verb?', NULL, 'Adverb', 2.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(92, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'List 3 types of verbs:', NULL, 'Action verb,Linking verb,Auxiliary verb', 3.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(93, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is the purpose of helping verbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(94, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'identification', 'What is the difference between a singular and plural noun?', NULL, 'A singular noun refers to one person, place, or thing, while a plural noun refers to more than one.', 2.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(95, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'List 3 examples of adjectives:', NULL, 'Describing size,Describing color,Describing shape', 3.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(96, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is the function of adverbs?', '[\"To modify nouns\",\"To modify verbs\",\"To modify adjectives\",\"To modify adverbs\"]', 'To modify verbs', 2.00, 'ai', 11, 'active', NULL, '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(97, 2, 8, 18, 1, 5, 'Nouns & Verbs', 'activity', 'Students work in pairs on a short Grade 1 task about \"Nouns & Verbs\" (English). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 10.00, 'ai', 11, 'active', '{\"categories\":[{\"name\":\"Participation\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-04 09:01:36', '2026-10-04 09:01:36', 'quiz'),
(98, 13, 9, 18, 4, 8, 'Sample', 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\"]', 'A thing', 2.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(99, 13, 9, 18, 4, 8, 'Sample', 'identification', 'What is the function of pronouns in a sentence?', NULL, 'To replace nouns', 3.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(100, 13, 9, 18, 4, 8, 'Sample', 'enumeration', 'List the three types of pronouns.', NULL, 'I, Me, We', 4.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(101, 13, 9, 18, 4, 8, 'Sample', 'mcq', 'What is an adjective?', '[\"A word that describes a noun\",\"A word that describes a verb\",\"A word that describes an adverb\"]', 'A word that describes a noun', 2.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(102, 13, 9, 18, 4, 8, 'Sample', 'identification', 'What is the function of adverbs in a sentence?', NULL, 'To describe how verbs are done', 3.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(103, 13, 9, 18, 4, 8, 'Sample', 'enumeration', 'List the three main types of adverbs.', NULL, 'Manner, Time, Place', 4.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(104, 13, 9, 18, 4, 8, 'Sample', 'mcq', 'What is a verb?', '[\"A word that describes a noun\",\"A word that describes a verb\",\"A word that describes an adverb\"]', 'A word that describes a verb', 2.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(105, 13, 9, 18, 4, 8, 'Sample', 'identification', 'What is the function of helping verbs in a sentence?', NULL, 'To extend the meaning of verbs', 3.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(106, 13, 9, 18, 4, 8, 'Sample', 'enumeration', 'List the 10 main types of helping verbs.', NULL, 'Am, As, Are, Was, Were, Been, Be, Can, Has, Shall', 4.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(107, 13, 9, 18, 4, 8, 'Sample', 'mcq', 'What is the difference between a singular and plural noun?', '[\"A singular noun refers to only one person, place or thing, while a plural noun refers to more than one.\",\"A plural noun refers to only one person, place or thing, while a singular noun refers to more than one.\"]', 'A singular noun refers to only one person, place or thing, while a plural noun refers to more than one.', 2.00, 'ai', 12, 'active', NULL, '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(108, 13, 9, 18, 4, 8, 'Sample', 'activity', 'Students work in pairs on a short Grade 4 task about \"Sample\" (English). They write or draw examples, share with a partner, then present one idea.', NULL, NULL, 20.00, 'ai', 12, 'active', '{\"categories\":[{\"name\":\"Participation\",\"max_points\":7,\"levels\":[{\"label\":\"Excellent\",\"points\":7,\"description\":\"Fully engaged; helps partner; stays on task.\"},{\"label\":\"Good\",\"points\":5,\"description\":\"Mostly engaged with little prompting.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs reminders to stay on task.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Rarely participates or off-task.\"}]},{\"name\":\"Correctness\",\"max_points\":7,\"levels\":[{\"label\":\"Excellent\",\"points\":7,\"description\":\"Ideas clearly match the lesson.\"},{\"label\":\"Good\",\"points\":5,\"description\":\"Mostly accurate with small gaps.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Partial understanding shown.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Little connection to the lesson.\"}]},{\"name\":\"Effort\",\"max_points\":6,\"levels\":[{\"label\":\"Excellent\",\"points\":6,\"description\":\"Complete, neat, thoughtful work.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Complete with adequate care.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Incomplete or rushed.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Minimal effort.\"}]}]}', '2026-10-07 07:02:01', '2026-10-07 07:02:01', 'quiz'),
(109, 2, 10, 12, 1, 9, 'math', 'mcq', 'What is the shape of a square?', '[\"Circle\",\"Rectangle\",\"Square\",\"Triangle\"]', 'Square', 1.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(110, 2, 10, 12, 1, 9, 'math', 'identification', 'What is the name of the number that comes after 10?', NULL, '11', 1.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(111, 2, 10, 12, 1, 9, 'math', 'enumeration', 'List 3 shapes that are used in art', NULL, 'Circle, Square, Triangle', 2.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(112, 2, 10, 12, 1, 9, 'math', 'mcq', 'What is the sum of 2 + 2?', '[\"3\",\"4\",\"5\",\"6\"]', '4', 1.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(113, 2, 10, 12, 1, 9, 'math', 'identification', 'What is the name of the operation that means to add two numbers together?', NULL, 'Addition', 1.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(114, 2, 10, 12, 1, 9, 'math', 'enumeration', 'List 2 types of numbers that are used in math', NULL, 'Whole numbers, Fractions', 2.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(115, 2, 10, 12, 1, 9, 'math', 'mcq', 'What is the product of 3 x 4?', '[\"10\",\"12\",\"15\",\"18\"]', '12', 1.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(116, 2, 10, 12, 1, 9, 'math', 'identification', 'What is the name of the operation that means to subtract one number from another?', NULL, 'Subtraction', 1.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(117, 2, 10, 12, 1, 9, 'math', 'enumeration', 'List 3 types of math problems that can be solved using addition', NULL, 'Counting money, Measuring ingredients, Counting toys', 2.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(118, 2, 10, 12, 1, 9, 'math', 'mcq', 'What is the result of 5 - 2?', '[\"3\",\"4\",\"5\",\"6\"]', '3', 1.00, 'ai', 15, 'active', NULL, '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(119, 2, 10, 12, 1, 9, 'math', 'activity', 'Create a simple math project that demonstrates your understanding of basic math concepts such as addition, subtraction, and shapes. You can use paper, pencils, and other materials to create your project.', NULL, NULL, 10.00, 'ai', 15, 'active', '{\"categories\":[{\"name\":\"Creativity\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"The project is highly creative and demonstrates a deep understanding of basic math concepts.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"The project is creative and demonstrates a good understanding of basic math concepts.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"The project is somewhat creative and demonstrates a fair understanding of basic math concepts.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"The project is not creative and demonstrates a poor understanding of basic math concepts.\"}]},{\"name\":\"Accuracy\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"The project accurately demonstrates an understanding of basic math concepts such as addition, subtraction, and shapes.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"The project accurately demonstrates a good understanding of basic math concepts.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"The project somewhat accurately demonstrates a fair understanding of basic math concepts.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"The project does not accurately demonstrate an understanding of basic math concepts.\"}]},{\"name\":\"Effort\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"The project demonstrates a high level of effort and creativity.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"The project demonstrates a good level of effort and creativity.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"The project somewhat demonstrates a fair level of effort and creativity.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"The project does not demonstrate a level of effort and creativity.\"}]}]}', '2026-10-09 05:42:10', '2026-10-09 05:42:10', 'quiz'),
(120, 2, 11, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is a noun?', '[\"A person\",\"A place\",\"A thing\",\"A feeling\"]', 'A thing', 1.00, 'ai', 16, 'active', NULL, '2026-10-10 00:11:23', '2026-10-10 00:11:23', 'quiz'),
(121, 2, 11, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is a verb?', '[\"A person\",\"A place\",\"An action\",\"A thing\"]', 'An action', 1.00, 'ai', 16, 'active', NULL, '2026-10-10 00:11:23', '2026-10-10 00:11:23', 'quiz'),
(122, 2, 11, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is an adjective?', '[\"A person\",\"A place\",\"A descriptive word\",\"A thing\"]', 'A descriptive word', 1.00, 'ai', 16, 'active', NULL, '2026-10-10 00:11:23', '2026-10-10 00:11:23', 'quiz'),
(123, 2, 11, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is a pronoun?', '[\"A person\",\"A place\",\"A word that replaces a noun\",\"A thing\"]', 'A word that replaces a noun', 1.00, 'ai', 16, 'active', NULL, '2026-10-10 00:11:23', '2026-10-10 00:11:23', 'quiz'),
(124, 2, 11, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is the difference between a singular and plural noun?', '[\"A singular noun refers to one person, place or thing, while a plural noun refers to two or more.\",\"A singular noun refers to two or more people, places or things, while a plural noun refers to one.\",\"A singular noun refers to one thing, while a plural noun refers to two or more things.\",\"A singular noun refers to two or more things, while a plural noun refers to one.\"]', 'A singular noun refers to one person, place or thing, while a plural noun refers to two or more.', 1.00, 'ai', 16, 'active', NULL, '2026-10-10 00:11:23', '2026-10-10 00:11:23', 'quiz'),
(125, 2, 11, 18, 1, 5, 'Nouns & Verbs', 'activity', 'Sort the following words into their correct parts of speech: noun, verb, adjective, or pronoun. Use the clues provided to help you decide.', NULL, NULL, 10.00, 'ai', 16, 'active', '{\"categories\":[{\"name\":\"Accuracy\",\"max_points\":10,\"levels\":[{\"label\":\"Excellent\",\"points\":10,\"description\":\"All words are correctly sorted into their parts of speech.\"},{\"label\":\"Good\",\"points\":8,\"description\":\"Most words are correctly sorted, but a few may be incorrect.\"},{\"label\":\"Fair\",\"points\":5,\"description\":\"Some words are correctly sorted, but many are incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":3,\"description\":\"Most words are incorrectly sorted.\"}]}]}', '2026-10-10 00:11:23', '2026-10-10 00:11:23', 'quiz'),
(126, 2, 12, 24, 1, 11, 'Nouns and Verbs', 'mcq', 'What is a noun that refers to a person, place, or thing?', '[\"a person\",\"a place\",\"a thing\",\"an action\"]', 'a thing', 1.00, 'ai', 17, 'active', NULL, '2026-10-10 01:22:25', '2026-10-10 01:22:25', 'quiz'),
(127, 2, 12, 24, 1, 11, 'Nouns and Verbs', 'mcq', 'What is a verb that describes an action or state of being?', '[\"a person\",\"a place\",\"an action\",\"a thing\"]', 'an action', 1.00, 'ai', 17, 'active', NULL, '2026-10-10 01:22:25', '2026-10-10 01:22:25', 'quiz'),
(128, 2, 12, 24, 1, 11, 'Nouns and Verbs', 'mcq', 'What is an adjective that describes a noun?', '[\"a person\",\"a place\",\"a thing\",\"a feeling\"]', 'a feeling', 1.00, 'ai', 17, 'active', NULL, '2026-10-10 01:22:25', '2026-10-10 01:22:25', 'quiz'),
(129, 2, 12, 24, 1, 11, 'Nouns and Verbs', 'mcq', 'What is a pronoun that replaces a noun in a sentence?', '[\"a person\",\"a place\",\"a thing\",\"a word\"]', 'a word', 1.00, 'ai', 17, 'active', NULL, '2026-10-10 01:22:25', '2026-10-10 01:22:25', 'quiz'),
(130, 2, 12, 24, 1, 11, 'Nouns and Verbs', 'mcq', 'What is a verb tense that shows an action that happened in the past?', '[\"present\",\"past\",\"future\",\"present perfect\"]', 'past', 1.00, 'ai', 17, 'active', NULL, '2026-10-10 01:22:25', '2026-10-10 01:22:25', 'quiz');
INSERT INTO `question_bank` (`id`, `teacher_id`, `quiz_set_id`, `subject_id`, `grade_level`, `lesson_plan_id`, `lesson_title`, `item_type`, `question`, `choices`, `answer`, `points`, `source`, `ai_recommendation_id`, `status`, `rubric`, `created_at`, `updated_at`, `folder`) VALUES
(131, 2, 12, 24, 1, 11, 'Nouns and Verbs', 'activity', 'Sort the following words into their correct categories: nouns, verbs, adjectives, and pronouns. Work with a partner or in a small group.', NULL, NULL, 3.00, 'ai', 17, 'active', '{\"categories\":[{\"name\":\"Nouns\",\"max_points\":2,\"levels\":[{\"label\":\"Excellent\",\"points\":2,\"description\":\"All words are correctly identified as nouns.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"Most words are correctly identified as nouns, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"Few words are correctly identified as nouns, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Most words are incorrectly identified as nouns.\"}]},{\"name\":\"Verbs\",\"max_points\":2,\"levels\":[{\"label\":\"Excellent\",\"points\":2,\"description\":\"All words are correctly identified as verbs.\"},{\"label\":\"Good\",\"points\":1,\"description\":\"Most words are correctly identified as verbs, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"Few words are correctly identified as verbs, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Most words are incorrectly identified as verbs.\"}]},{\"name\":\"Adjectives\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"All words are correctly identified as adjectives.\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Most words are correctly identified as adjectives, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"Few words are correctly identified as adjectives, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Most words are incorrectly identified as adjectives.\"}]},{\"name\":\"Pronouns\",\"max_points\":1,\"levels\":[{\"label\":\"Excellent\",\"points\":1,\"description\":\"All words are correctly identified as pronouns.\"},{\"label\":\"Good\",\"points\":0.5,\"description\":\"Most words are correctly identified as pronouns, but one or two may be incorrect.\"},{\"label\":\"Fair\",\"points\":1,\"description\":\"Few words are correctly identified as pronouns, and many may be incorrect.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Most words are incorrectly identified as pronouns.\"}]}]}', '2026-10-10 01:22:25', '2026-10-10 01:22:25', 'quiz'),
(132, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'Ano ang tawag sa salitang ngalan ng tao, bagay, o lugar?', '[\"Pangngalan\",\"Pandiwa\",\"Pang-uri\",\"Kilos\"]', 'Pangngalan', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(133, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'Alin sa mga sumusunod ang salitang kilos o pandiwa?', '[\"tumakbo\",\"mesa\",\"bata\",\"aklat\"]', 'tumakbo', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(134, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'Alin ang ngalan ng tao?', '[\"guro\",\"lapis\",\"pusa\",\"parke\"]', 'guro', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(135, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'Alin ang ngalan ng lugar?', '[\"paaralan\",\"kumanta\",\"bola\",\"masaya\"]', 'paaralan', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(136, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'Ano ang pandiwa sa pangungusap: \'Ang bata ay nagbabasa.\'?', '[\"nagbabasa\",\"Ang\",\"bata\",\"ay\"]', 'nagbabasa', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(137, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'Alin sa mga sumusunod ang ngalan ng bagay?', '[\"bola\",\"lumipad\",\"nanay\",\"Manila\"]', 'bola', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(138, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'Alin ang nagsasaad ng kilos o galaw?', '[\"sumayaw\",\"bahay\",\"aso\",\"tatay\"]', 'sumayaw', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(139, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'identification', 'Ano ang tawag sa mga salitang nagsasaad ng kilos o galaw?', NULL, 'Pandiwa', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(140, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'identification', 'Ano ang tawag sa bahagi ng pananalita na tumutukoy sa ngalan ng tao, bagay, hayop, o lugar?', NULL, 'Pangngalan', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(141, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'identification', 'Tukuyin kung anong uri ng salita ang \'lumalangoy\' (Pangngalan o Pandiwa).', NULL, 'Pandiwa', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(142, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'identification', 'Tukuyin kung anong uri ng salita ang \'doktor\' (Pangngalan o Pandiwa).', NULL, 'Pangngalan', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(143, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'identification', 'Isulat ang pandiwa sa pangungusap: \'Si Ana ay kumanta.\'', NULL, 'kumanta', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(144, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'identification', 'Isulat ang pangngalan para sa bagay sa pangungusap: \'Mabilis ang kotse.\'', NULL, 'kotse', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(145, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'identification', 'Pangngalan o Pandiwa: Ang salitang \'tumalon\' ay isang halimbawa ng ______.', NULL, 'Pandiwa', 1.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(146, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'Magbigay ng dalawang (2) halimbawa ng ngalan ng tao.', NULL, 'Tanggapin ang anumang 2 ngalan ng tao (hal. nanay, tatay, guro, ate, kuya, Ana). 1 puntos bawat tamang sagot.', 2.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(147, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'Magbigay ng dalawang (2) halimbawa ng ngalan ng bagay.', NULL, 'Tanggapin ang anumang 2 ngalan ng bagay (hal. lapis, papel, mesa, aklat, bola). 1 puntos bawat tamang sagot.', 2.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(148, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'Magbigay ng dalawang (2) halimbawa ng ngalan ng lugar.', NULL, 'Tanggapin ang anumang 2 ngalan ng lugar (hal. simbahan, parke, paaralan, palengke). 1 puntos bawat tamang sagot.', 2.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(149, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'Magbigay ng dalawang (2) halimbawa ng salitang kilos o pandiwa.', NULL, 'Tanggapin ang anumang 2 pandiwa (hal. tumakbo, kumain, uminom, lumundag, magbasa). 1 puntos bawat tamang sagot.', 2.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(150, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'Magbigay ng dalawang (2) halimbawa ng ngalan ng hayop.', NULL, 'Tanggapin ang anumang 2 ngalan ng hayop (hal. aso, pusa, ibon, kuneho, isda). 1 puntos bawat tamang sagot.', 2.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(151, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'enumeration', 'Magbigay ng dalawang (2) kilos na ginagawa mo bago pumasok sa paaralan.', NULL, 'Tanggapin ang anumang 2 angkop na kilos (hal. maligo, kumain, magsipilyo, magbihis). 1 puntos bawat tamang sagot.', 2.00, 'ai', 18, 'archived', NULL, '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(152, 2, 13, 18, 1, 5, 'Nouns & Verbs', 'activity', '1. Maghanda ng dalawang basket o kahon sa gitna ng silid-aralan: isa para sa \'Pangngalan\' (may itim na tatsulok ayon sa Montessori grammar symbols) at isa para sa \'Pandiwa\' (may pulang bilog).\n2. Bigyan ang bawat bata o magkapares ng maliliit na picture/word cards (halimbawa: larawan ng aklat, pusa, batang tumatakbo, ibong lumilipad).\n3. Isa-isang lalapit ang mga mag-aaral sa sorting rug o banig upang ilagay ang kard sa tamang basket habang binibigkas ang salita: \'Ito ay [salita], ito ay pangngalan/pandiwa.\'\n4. Kapag natapos ang lahat, magkakaroon ang klase ng maikling pagsusuri at kumpirmasyon sa gabay ng guro gamit ang three-period lesson approach.', NULL, NULL, 15.00, 'ai', 18, 'archived', '{\"categories\":[{\"name\":\"Wastong Pag-uuri (Correct Sorting)\",\"max_points\":6,\"levels\":[{\"label\":\"Excellent\",\"points\":6,\"description\":\"Lahat ng kard ay nauri nang wasto sa tamang basket (Pangngalan o Pandiwa).\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Karamihan ng kard ay nauri nang wasto na may 1 o 2 maliit na pagkakamali.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Kailangan ng gabay ng guro upang maiuri ang kalahati ng mga kard.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Hindi pa gaanong matukoy ang pagkakaiba ng pangngalan at pandiwa kahit may gabay.\"}]},{\"name\":\"Pakikilahok at Pagsunod sa Panuto (Participation)\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Masiglang nakilahok, naghintay ng sariling pagkakataon, at nasunod nang kusa ang mga hakbang.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Nakilahok nang maayos at sumunod sa panuto nang may kaunting paalala.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Kailangang paalalahanan nang madalas upang makibahagi o sumunod sa pila.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Mababa ang interes o hindi nakibahagi sa gawain.\"}]},{\"name\":\"Pangangalaga sa Kagamitan (Care of Materials)\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Buong ingat na hinawakan ang mga kard at maayos na ibinalik sa tamang lagayan pagkatapos.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Naingatan ang mga kard at basket nang may kaunting paalala mula sa guro.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"May pagkakataong nalukot o naihagis ang kard bago nailagay sa basket.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Hindi nagpakita ng pag-iingat sa mga kagamitan sa silid-aralan.\"}]}]}', '2026-10-10 12:18:32', '2026-10-10 12:19:03', 'quiz'),
(153, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'true_false', 'Nouns are words that name people, places, or things.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(154, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'true_false', 'Verbs are descriptive words that modify nouns.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(155, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'true_false', 'The word \'France\' is a proper noun because it is the name of a place.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(156, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'true_false', 'Honesty and happiness are tangible nouns that you can hold in your hand.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(157, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'true_false', 'Singular nouns refer to only one person, place, or thing.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(158, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'true_false', 'Pronouns are words that replace nouns in a sentence.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(159, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'Verbs indicate _____ or a state of being in sentences.', '[\"action\",\"place\",\"color\"]', 'action', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(160, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'To show that there are multiple dogs, an _____ is added to the end of the word.', '[\"s\",\"ed\",\"ing\"]', 's', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(161, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'Anna is a noun because she is a _____.', '[\"person\",\"thing\",\"place\"]', 'person', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(162, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'In the sentence \'Batman drives the Batmobile,\' the word \'drives\' is a _____.', '[\"verb\",\"noun\",\"pronoun\"]', 'verb', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(163, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'Words like \'she\' or \'he\' that take the place of a noun are called _____.', '[\"pronouns\",\"adverbs\",\"places\"]', 'pronouns', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(164, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'Words that describe how verbs are done are called _____.', '[\"adverbs\",\"nouns\",\"objects\"]', 'adverbs', 1.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(165, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'matching', 'Match the word to its correct part of speech.', '[\"rabbit | noun\",\"drives | verb\",\"loudly | adverb\"]', 'rabbit | noun; drives | verb; loudly | adverb', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(166, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'matching', 'Match each noun to its specific category.', '[\"Anna | person\",\"France | place\",\"book | thing\"]', 'Anna | person; France | place; book | thing', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(167, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'matching', 'Match the noun to its noun form.', '[\"Anna | proper noun\",\"rabbit | improper noun\",\"honesty | abstract noun\"]', 'Anna | proper noun; rabbit | improper noun; honesty | abstract noun', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(168, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'matching', 'Match the noun to whether it is singular or plural.', '[\"dog | singular\",\"dogs | plural\",\"castle | singular\"]', 'dog | singular; dogs | plural; castle | singular', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(169, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'matching', 'Match the pronoun to its pronoun type.', '[\"She | subject pronoun\",\"Him | object pronoun\",\"They | subject pronoun\"]', 'She | subject pronoun; Him | object pronoun; They | subject pronoun', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(170, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'matching', 'Match the verb form to what it indicates in time.', '[\"throws | current action\",\"threw | past action\",\"was throwing | past verb phrase\"]', 'throws | current action; threw | past action; was throwing | past verb phrase', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(171, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'sequencing', 'Arrange the parts of speech in the sentence: \'Batman drives the Batmobile.\'', '[\"Subject noun (Batman)\",\"Action verb (drives)\",\"Object noun (Batmobile)\"]', 'Subject noun (Batman) | Action verb (drives) | Object noun (Batmobile)', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(172, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'sequencing', 'Arrange the steps to make the singular noun \'dog\' into a plural noun.', '[\"Start with the singular noun dog\",\"Add the letter s to the end\",\"Form the plural noun dogs\"]', 'Start with the singular noun dog | Add the letter s to the end | Form the plural noun dogs', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(173, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'sequencing', 'Arrange the steps to replace a proper noun with a pronoun.', '[\"Identify the proper noun Jasmine\",\"Choose the subject pronoun She\",\"Form the sentence She is a princess\"]', 'Identify the proper noun Jasmine | Choose the subject pronoun She | Form the sentence She is a princess', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(174, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'sequencing', 'Arrange the words in order for the phrase: \'big blue castle\'.', '[\"First adjective (big)\",\"Second adjective (blue)\",\"Modified noun (castle)\"]', 'First adjective (big) | Second adjective (blue) | Modified noun (castle)', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(175, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'sequencing', 'Arrange the parts of speech in the sentence: \'The girl hugged the boy.\'', '[\"Subject noun (The girl)\",\"Action verb (hugged)\",\"Object noun (the boy)\"]', 'Subject noun (The girl) | Action verb (hugged) | Object noun (the boy)', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(176, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'sequencing', 'Arrange the components of the verb phrase: \'Thor was throwing the hammer.\'', '[\"Subject (Thor)\",\"Helping verb (was)\",\"Main action verb (throwing)\"]', 'Subject (Thor) | Helping verb (was) | Main action verb (throwing)', 3.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(177, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'short_answer', 'What is a noun according to the lesson?', NULL, 'A noun is a part of speech that names a person, place, or thing. It can also name abstract feelings like honesty and happiness.', 2.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(178, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'short_answer', 'What is a verb? Give one example of an action verb from the lesson.', NULL, 'A verb indicates an action or a state of being in a sentence. An example from the lesson is \'drives\' in the sentence \'Batman drives the Batmobile.\'', 2.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(179, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'short_answer', 'What is the difference between a singular noun and a plural noun?', NULL, 'A singular noun refers to only one person, place, or thing, such as \'dog\'. A plural noun refers to more than one, such as \'dogs\' with an \'s\' added to the end.', 2.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(180, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'short_answer', 'What is a proper noun? Mention one person or place from the lesson as an example.', NULL, 'A proper noun is a specific name of a person or a place. Examples from the lesson are \'Anna\' for a person\'s name and \'France\' for a country\'s name.', 2.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(181, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'short_answer', 'What does a pronoun do in a sentence?', NULL, 'A pronoun replaces a noun in a sentence. For example, the pronoun \'she\' can replace the proper noun \'Jasmine.\'', 2.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(182, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'short_answer', 'What do adverbs do to verbs in a sentence?', NULL, 'Adverbs modify verbs by describing how actions were done. For example, in the lesson, \'beautifully\' describes how Beyoncé sang.', 2.00, 'ai', 24, 'active', NULL, '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(183, 2, 15, 18, 1, 5, 'Nouns & Verbs', 'activity', '1. Lay out a Montessori work mat with two labeled sorting baskets: \'Nouns (People, Places, Things)\' and \'Verbs (Action Words)\'.\n2. Distribute word and picture cards taken directly from the lesson (e.g., rabbit, book, France, drives, jumped, caught, sings, castle).\n3. In pairs or small groups, learners take turns reading a card aloud and placing it into the correct basket.\n4. When sorting is complete, pupils check their work with a partner by naming whether the item is a person/place/thing or an action.', NULL, NULL, 20.00, 'ai', 24, 'active', '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly classifies all noun and verb cards into the matching baskets without errors.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Classifies most cards correctly with only 1 to 2 minor sorting mistakes.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Classifies half of the cards correctly but requires prompting from peers or teacher.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Struggles to differentiate between nouns and verbs; needs direct teacher guidance.\"}]},{\"name\":\"Participation and Focus\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Actively engages throughout the entire sorting activity and eagerly takes turns.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Participates willingly in most turns with minor reminders to stay on task.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Participates only when directly called upon by the teacher or partner.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Shows little interest in sorting cards and becomes easily distracted.\"}]},{\"name\":\"Montessori Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles cards and baskets gently, keeps the mat neat, and packs away properly.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials with care with only minor reminders to tidy the work mat.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Leaves materials scattered on the mat until prompted to clean up.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Mishandles cards or baskets and leaves the workspace unorganized.\"}]},{\"name\":\"Collaboration and Peer Communication\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Communicates kindly, listens attentively, and helps partner verify card placement.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Shares materials well and communicates respectfully with their partner.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Works alongside partner but does not discuss or verify card choices together.\"},{\"label\":\"Needs Improvement\",\"points\":2,\"description\":\"Has difficulty sharing the baskets or taking turns with partner.\"}]}]}', '2026-10-11 07:38:10', '2026-10-11 07:38:10', 'quiz'),
(184, 2, 16, 13, 1, 2, 'Plants', 'matching', 'Match each food to the plant part we eat.', '[\"Carrot | Root\",\"Celery | Stem\",\"Spinach | Leaf\"]', 'Carrot | Root; Celery | Stem; Spinach | Leaf', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(185, 2, 16, 13, 1, 2, 'Plants', 'matching', 'Match each plant part to its job in the plant riddle.', '[\"Roots | Gather water\",\"Stem | Elevator for water and sugar\",\"Leaves | Catch the sun\"]', 'Roots | Gather water; Stem | Elevator for water and sugar; Leaves | Catch the sun', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(186, 2, 16, 13, 1, 2, 'Plants', 'matching', 'Match the edible plant part to its vegetable example.', '[\"Flower | Broccoli\",\"Fruit | Cucumber\",\"Seed | Sunflower seed\"]', 'Flower | Broccoli; Fruit | Cucumber; Seed | Sunflower seed', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(187, 2, 16, 13, 1, 2, 'Plants', 'matching', 'Match the plant riddle clue to the correct plant part.', '[\"Attracts the bees | Flower\",\"Holds the seeds inside | Fruit\",\"Starts a new plant\'s birth | Seed\"]', 'Attracts the bees | Flower; Holds the seeds inside | Fruit; Starts a new plant\'s birth | Seed', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(188, 2, 16, 13, 1, 2, 'Plants', 'sequencing', 'Put the plant parts in order from bottom in the ground to top.', '[\"Roots anchor in ground\",\"Stem grows upward\",\"Flower blooms at top\"]', 'Roots anchor in ground | Stem grows upward | Flower blooms at top', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(189, 2, 16, 13, 1, 2, 'Plants', 'sequencing', 'Put the steps of a plant\'s life cycle in order.', '[\"Seed is buried in the earth\",\"Plant grows roots and stem\",\"Fruit gets ripe and falls\"]', 'Seed is buried in the earth | Plant grows roots and stem | Fruit gets ripe and falls', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(190, 2, 16, 13, 1, 2, 'Plants', 'sequencing', 'Put our lesson garden tasks in order.', '[\"Show seed packets\",\"Plant seeds in the soil\",\"Harvest parts to eat\"]', 'Show seed packets | Plant seeds in the soil | Harvest parts to eat', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(191, 2, 16, 13, 1, 2, 'Plants', 'identification', 'What part of the plant anchors it in the ground and gathers water?', '[\"Sun\",\"Soil\"]', 'Roots', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(192, 2, 16, 13, 1, 2, 'Plants', 'identification', 'What plant part holds the pollen and attracts the bees?', '[\"Water\",\"Ground\"]', 'Flower', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(193, 2, 16, 13, 1, 2, 'Plants', 'identification', 'What plant part catches the sun and acts like a kitchen to make food?', '[\"Pollen\",\"Gardener\"]', 'Leaves', 1.00, 'ai', 25, 'active', NULL, '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(194, 2, 16, 13, 1, 2, 'Plants', 'activity', '1. Prepare a Montessori three-part sorting mat labeled with plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. In small groups, children observe real vegetable samples (cut carrots, celery, spinach, broccoli florets, cucumber slices, and sunflower seeds).\n3. Children use child-safe tongs to place each food item onto the correct labeled section of the mat.\n4. Learners taste a sample from each plant part and orally name which part of the plant they are eating.\n5. Learners complete a brief journal page by drawing their favorite edible plant part.', NULL, NULL, 10.00, 'ai', 25, 'active', '{\"categories\":[{\"name\":\"Sorting and Identification\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly sorts all vegetable and seed samples to the right plant part sections on the mat.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly sorts most vegetable samples with minimal teacher guidance.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly sorts some samples but confuses 2 to 3 plant parts.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Requires continuous assistance to sort food samples into plant parts.\"}]},{\"name\":\"Montessori Work Habit and Participation\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Uses tongs carefully, respects food tasting etiquette, and restores work tray neatly.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly and participates well with minor reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Participates but needs frequent reminders to share materials and handle food gently.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Struggles to follow hygiene rules or care for prepared materials.\"}]}]}', '2026-10-11 08:15:10', '2026-10-11 08:15:10', 'quiz'),
(195, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which plant part anchors the plant in the ground and gathers water?', '[\"Dirt\",\"Stone\"]', 'Roots', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(196, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which plant part acts like an elevator to carry water up from the ground?', '[\"Branch\"]', 'Stem', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(197, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which plant parts act like kitchens that catch the sun to make food?', '[\"Grass\"]', 'Leaves', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(198, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which colorful plant part holds pollen and attracts bees?', '[\"Petal\"]', 'Flower', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(199, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which plant part holds the seeds inside, like a cucumber or pepper?', '[\"Twig\"]', 'Fruit', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(200, 2, 17, 13, 1, 2, 'Plants', 'identification', 'What is buried in the earth to start the life cycle of a new plant?', '[\"Pebble\"]', 'Seed', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(201, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which crunchy orange food from our lesson is an edible root?', '[\"Radish\"]', 'Carrot', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(202, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which crunchy green stalk from our lesson is an edible stem?', '[\"Corn\"]', 'Celery', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(203, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which leafy green food from our lesson is an edible leaf?', '[\"Kale\"]', 'Spinach', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(204, 2, 17, 13, 1, 2, 'Plants', 'identification', 'Which green vegetable shaped like a small tree is an edible flower?', '[\"Cabbage\"]', 'Broccoli', 1.00, 'ai', 26, 'active', NULL, '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(205, 2, 17, 13, 1, 2, 'Plants', 'activity', '1. Provide each small table with a 6-compartment sorting mat labeled: Root, Stem, Leaf, Flower, Fruit, Seed.\n2. Give pairs of children small prepared bowls containing clean food samples: carrot rounds, celery sticks, spinach leaves, broccoli florets, cucumber slices, and sunflower seeds.\n3. Using small child-sized tongs, learners examine each item and place it in the correct plant part section on their mat.\n4. Once verified by the teacher, children practice grace and courtesy while tasting each plant part with ranch dressing.', NULL, NULL, 12.00, 'ai', 26, 'active', '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Correctly sorts all 6 plant foods into their proper plant part sections.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Correctly sorts 4 to 5 plant foods with minimal guidance.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Correctly sorts 2 to 3 plant foods with teacher assistance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Sorts 0 to 1 plant food correctly; needs direct support.\"}]},{\"name\":\"Care of Materials and Grace\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Uses tongs carefully, keeps workspace clean, and handles food gently.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Handles materials well with few reminders to keep workspace tidy.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Needs frequent reminders to use tongs and avoid dropping food.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Mishandles food items or tools without regard for cleanliness.\"}]},{\"name\":\"Participation and Communication\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Enthusiastically identifies and names the plant parts aloud during the activity.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Participates willingly and names most plant parts when prompted.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Participates passively and needs encouragement to speak or taste.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Does not participate in sorting or table discussions.\"}]}]}', '2026-10-11 08:26:26', '2026-10-11 08:26:26', 'quiz'),
(206, 2, 18, 13, 1, 2, 'Plants', 'identification', 'What plant part is a crunchy orange carrot that grows under the ground?', '[\"water\"]', 'root', 1.00, 'ai', 27, 'active', NULL, '2026-10-11 08:45:25', '2026-10-11 08:45:25', 'quiz'),
(207, 2, 18, 13, 1, 2, 'Plants', 'identification', 'What plant part is green celery that carries water up like an elevator?', '[\"sun\"]', 'stem', 1.00, 'ai', 27, 'active', NULL, '2026-10-11 08:45:25', '2026-10-11 08:45:25', 'quiz'),
(208, 2, 18, 13, 1, 2, 'Plants', 'identification', 'What plant part catches the sunlight to make food, like fresh spinach?', '[\"soil\"]', 'leaf', 1.00, 'ai', 27, 'active', NULL, '2026-10-11 08:45:25', '2026-10-11 08:45:25', 'quiz'),
(209, 2, 18, 13, 1, 2, 'Plants', 'identification', 'What plant part holds the seeds inside, like a cucumber or pepper?', '[\"pollen\"]', 'fruit', 1.00, 'ai', 27, 'active', NULL, '2026-10-11 08:45:25', '2026-10-11 08:45:25', 'quiz'),
(210, 2, 18, 13, 1, 2, 'Plants', 'identification', 'What tiny plant part is buried in the earth to grow a new plant, like a bean?', '[\"sprout\"]', 'seed', 1.00, 'ai', 27, 'active', NULL, '2026-10-11 08:45:25', '2026-10-11 08:45:25', 'quiz'),
(211, 2, 18, 13, 1, 2, 'Plants', 'activity', '1. Provide each student or pair with a 6-compartment sorting tray labeled with the plant parts: Root, Stem, Leaf, Flower, Fruit, and Seed.\n2. Present washed snack pieces (carrot disk, celery slice, spinach leaf, broccoli bit, cucumber slice, and sunflower seed) in small bowls.\n3. Using tongs or clean hands, learners place each vegetable or food item into its matching plant part section on the tray.\n4. Students show their work to a partner or teacher, name each plant part aloud, and then enjoy their healthy tasting snack.', NULL, NULL, 10.00, 'ai', 27, 'active', '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Correctly matches all 6 plant food items to their plant parts.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Correctly matches 4 to 5 plant food items.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Correctly matches 2 to 3 plant food items with teacher guidance.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Needs full guidance to place food items on the tray.\"}]},{\"name\":\"Independence and Care of Materials\",\"max_points\":5,\"levels\":[{\"label\":\"Excellent\",\"points\":5,\"description\":\"Handles food and tray carefully and tidies up the workspace independently.\"},{\"label\":\"Good\",\"points\":4,\"description\":\"Handles materials properly with minimal reminders.\"},{\"label\":\"Fair\",\"points\":3,\"description\":\"Needs a few reminders to handle food neatly and clean up.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Has difficulty using tongs or keeping the workspace clean.\"}]}]}', '2026-10-11 08:45:25', '2026-10-11 08:45:25', 'quiz'),
(212, 2, 19, 18, 1, NULL, 'Noun', 'mcq', 'What is chuchu', '[\"asdsada\",\"asdasda\"]', 'A', 1.00, 'manual', NULL, 'active', NULL, '2026-10-11 16:54:52', '2026-10-11 17:17:03', 'exam'),
(213, 2, 19, 18, 1, NULL, 'Noun', 'identification', 'What is chuchuchu', '[\"Ge\",\"Bai\",\"Lods\"]', 'A', 1.00, 'manual', NULL, 'active', NULL, '2026-10-11 16:54:52', '2026-10-11 17:17:03', 'exam'),
(214, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'What is a noun?', '[\"A person, place, or thing\",\"An action word\",\"A word that modifies verbs\",\"A connecting word\"]', 'A person, place, or thing', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(215, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'Which of these words is an action verb?', '[\"drives\",\"castle\",\"blue\",\"happiness\"]', 'drives', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(216, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'Which word is an adjective that describes a noun?', '[\"big\",\"rabbit\",\"France\",\"hugged\"]', 'big', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(217, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'What kind of word replaces a noun in a sentence?', '[\"Pronoun\",\"Verb\",\"Adjective\",\"Adverb\"]', 'Pronoun', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(218, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'true_false', 'A singular noun refers to only one person, place, or thing.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(219, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'true_false', 'Proper nouns are general words for things like \'rabbit\' and \'book\'.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(220, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'true_false', 'Adjectives tell us which, what kind, or how many of a noun there is.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(221, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'true_false', 'Adverbs modify nouns instead of verbs.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(222, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Adding an _____ to the end of \'dog\' makes it plural.', '[\"s\",\"ed\",\"ing\",\"ly\"]', 's', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(223, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Verbs are _____ words.', '[\"action\",\"naming\",\"feeling\",\"slow\"]', 'action', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(224, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Adjectives are _____ words that describe nouns.', '[\"descriptive\",\"action\",\"silent\",\"proper\"]', 'descriptive', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(225, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Pronouns like \'she\' are used to _____ nouns.', '[\"replace\",\"remove\",\"count\",\"spell\"]', 'replace', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(226, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'matching', 'Match each word from the lesson to its part of speech.', '[\"France | Proper noun\",\"jumps | Verb\",\"blonde | Adjective\"]', 'France | Proper noun; jumps | Verb; blonde | Adjective', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(227, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'matching', 'Match the pronoun type to its example.', '[\"Subject pronoun | She\",\"Object pronoun | Him\",\"Plural noun | Dogs\"]', 'Subject pronoun | She; Object pronoun | Him; Plural noun | Dogs', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(228, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'matching', 'Match the noun to its noun category.', '[\"book | Tangible noun\",\"honesty | Abstract noun\",\"Anna | Proper noun\"]', 'book | Tangible noun; honesty | Abstract noun; Anna | Proper noun', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(229, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'matching', 'Match the word to what it does.', '[\"Verb | Shows action\",\"Adjective | Modifies a noun\",\"Adverb | Modifies a verb\"]', 'Verb | Shows action; Adjective | Modifies a noun; Adverb | Modifies a verb', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(230, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'sequencing', 'Put the words in order to form the sentence from the lesson.', '[\"The rabbit\",\"read\",\"the book.\"]', 'The rabbit | read | the book.', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(231, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'sequencing', 'Put the words in order to show how \'Thor\' throws a hammer.', '[\"Thor\",\"throws\",\"the hammer.\"]', 'Thor | throws | the hammer.', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(232, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'sequencing', 'Put the actions in order as Thor did them in the lesson.', '[\"Thor\",\"jumped\",\"and caught\",\"the hammer.\"]', 'Thor | jumped | and caught | the hammer.', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(233, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'sequencing', 'Put the words in order to show a girl\'s description.', '[\"The intelligent girl\",\"is\",\"tall.\"]', 'The intelligent girl | is | tall.', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(234, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'identification', 'What do we call nouns that you can touch or hold?', '[\"tense\",\"phrase\"]', 'tangible nouns', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(235, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'identification', 'What do we call nouns like \'honesty\' and \'happiness\' that are feelings or concepts you cannot touch?', '[\"plural\",\"modifier\"]', 'abstract nouns', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(236, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'identification', 'What part of speech describes how verbs or actions were done?', '[\"object\",\"subject\"]', 'adverbs', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(237, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'identification', 'What kind of verbs help to extend the meaning of verbs already used in a sentence?', '[\"proper\",\"singular\"]', 'helping verbs', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(238, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'enumeration', 'Name three parts of speech mentioned as building blocks for sentences in the lesson.', NULL, 'Accept any 3: Nouns, Verbs, Adjectives, Pronouns, Adverbs (Score 1 point if three correct parts of speech are listed).', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(239, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'enumeration', 'Give two examples of subject pronouns listed in the lesson.', NULL, 'Any two of: I, We, You, She, He, It, They (Score 1 point for two correct subject pronouns).', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(240, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'enumeration', 'List two helping verbs from the lesson.', NULL, 'Any two of: is, was, am, are, were, been, be, can, has, shall, will, do, does, did, have, should, may, might, would, must, could, had (Score 1 point for two correct helping verbs).', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(241, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'What is the difference between a singular noun and a plural noun according to the lesson?', NULL, 'A singular noun refers to only one person, place, or thing. A plural noun refers to more than one person, place, or thing.', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(242, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'Why are adjectives useful in writing?', NULL, 'Adjectives describe nouns and tell what kind, which, or how many there are. They help readers visualize and understand what an author has written.', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(243, 2, 20, 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'How does a verb tense show when an action happens?', NULL, 'A verb tense shows if an action is currently happening, like \'throws\', or if it already happened in the past, like \'threw\'.', 1.00, 'ai', 28, 'active', NULL, '2026-10-11 18:13:20', '2026-10-11 18:13:20', 'exam'),
(244, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'What is a noun?', '[\"A person, place, or thing\",\"An action word\",\"A descriptive word\",\"A helping word\"]', 'A person, place, or thing', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(245, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'Which word is a verb that shows action?', '[\"drives\",\"rabbit\",\"castle\",\"blue\"]', 'drives', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(246, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'What do adjectives do in a sentence?', '[\"Describe nouns\",\"Show actions\",\"Replace names\",\"End sentences\"]', 'Describe nouns', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(247, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'Which word is a proper noun?', '[\"France\",\"book\",\"dog\",\"girl\"]', 'France', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(248, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'true_false', 'Singular nouns name only one person, place, or thing.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(249, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'true_false', 'Adverbs modify nouns.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(250, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'true_false', 'Pronouns are words that replace nouns.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(251, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'true_false', 'Happiness is a noun you can touch and hold with your hands.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(252, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Adding an s to the word dog makes it _____.', '[\"plural\",\"singular\",\"verb\"]', 'plural', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(253, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'In the sentence \'She is a princess\', the word She is a _____.', '[\"pronoun\",\"adverb\",\"place\"]', 'pronoun', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(254, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Verbs indicate action or _____ of being.', '[\"state\",\"color\",\"thing\"]', 'state', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(255, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'In the phrase \'big blue castle\', the words big and blue are _____.', '[\"adjectives\",\"nouns\",\"pronouns\"]', 'adjectives', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(256, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'matching', 'Match the part of speech to its job.', '[\"Noun | Person, place, or thing\",\"Verb | Action or state of being\",\"Adjective | Describes a noun\"]', 'Noun | Person, place, or thing; Verb | Action or state of being; Adjective | Describes a noun', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(257, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'matching', 'Match the word to its noun category.', '[\"Anna | Person\",\"France | Place\",\"Book | Thing\"]', 'Anna | Person; France | Place; Book | Thing', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(258, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'matching', 'Match each word from the lesson to its correct label.', '[\"Rabbit | Improper noun\",\"Honesty | Abstract noun\",\"Dogs | Plural noun\"]', 'Rabbit | Improper noun; Honesty | Abstract noun; Dogs | Plural noun', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(259, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'matching', 'Match each pronoun type to its example.', '[\"Subject pronoun | She\",\"Object pronoun | Him\",\"Plural subject pronoun | We\"]', 'Subject pronoun | She; Object pronoun | Him; Plural subject pronoun | We', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(260, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'sequencing', 'Put the words in order to make a complete sentence from the lesson.', '[\"The rabbit\",\"read\",\"the book.\"]', 'The rabbit | read | the book.', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam');
INSERT INTO `question_bank` (`id`, `teacher_id`, `quiz_set_id`, `subject_id`, `grade_level`, `lesson_plan_id`, `lesson_title`, `item_type`, `question`, `choices`, `answer`, `points`, `source`, `ai_recommendation_id`, `status`, `rubric`, `created_at`, `updated_at`, `folder`) VALUES
(261, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'sequencing', 'Put the words in order to build the sentence about Batman.', '[\"Batman\",\"drives\",\"the Batmobile.\"]', 'Batman | drives | the Batmobile.', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(262, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'sequencing', 'Arrange the steps to show how a singular noun becomes plural.', '[\"Start with singular noun dog\",\"Add the letter s\",\"Get plural noun dogs\"]', 'Start with singular noun dog | Add the letter s | Get plural noun dogs', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(263, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'sequencing', 'Put the words in order to describe the castle.', '[\"big\",\"blue\",\"castle\"]', 'big | blue | castle', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(264, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'identification', 'Identify the word from the lesson that means a noun you can touch or hold.', '[\"loudly\",\"jumped\"]', 'tangible', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(265, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'identification', 'Identify the part of speech that describes how actions are done.', '[\"quiet\",\"castle\"]', 'adverb', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(266, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'identification', 'Identify the word that replaces the girl in \'She hugged him\'.', '[\"singing\",\"drives\"]', 'She', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(267, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'identification', 'Identify the specific country name that is used as a proper noun in the lesson.', '[\"rabbit\",\"hammer\"]', 'France', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(268, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'enumeration', 'Name three parts of speech introduced in the title of our lesson.', NULL, 'Accept: Nouns, Verbs, Adjectives (1 point for listing all three correctly).', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(269, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'enumeration', 'Name three things a noun can signify according to the lesson.', NULL, 'Accept: Person, Place, Thing (1 point for listing these three).', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(270, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'enumeration', 'List two helping verbs mentioned in the lesson.', NULL, 'Accept any two of: is, are, was, were, am, been, be, can, has, shall, will, do, does, did, have, should, may, might, being, would, must, could, had.', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(271, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'What is the difference between a singular noun and a plural noun?', NULL, 'A singular noun refers to only one person, place, or thing. A plural noun refers to more than one person, place, or thing, often by adding an s.', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(272, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'Why do writers use adjectives in their sentences?', NULL, 'Writers use adjectives to describe nouns. They help readers visualize and understand what an author has written by telling what kind, which, or how many.', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(273, 2, 21, 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'How do helping verbs help an action verb in a sentence?', NULL, 'Helping verbs help extend the meaning of action verbs. They give further context, such as showing when the action takes place in the present or past.', 1.00, 'ai', 30, 'active', NULL, '2026-10-11 18:27:55', '2026-10-11 18:27:55', 'exam'),
(274, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What is a noun?', '[\"A person, place, or thing\",\"An action word\",\"A word that modifies verbs\",\"A describing word\"]', 'A person, place, or thing', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(275, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'What do verbs show in a sentence?', '[\"Action or state of being\",\"Names of countries\",\"Feelings you touch\",\"Which kind of noun\"]', 'Action or state of being', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(276, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'In the sentence \'The rabbit read the book\', what is the word \'rabbit\'?', '[\"Noun\",\"Verb\",\"Pronoun\",\"Adverb\"]', 'Noun', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(277, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'In the sentence \'Batman drives the Batmobile\', which word is the verb?', '[\"drives\",\"Batman\",\"Batmobile\",\"the\"]', 'drives', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(278, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'mcq', 'A singular noun refers to how many people, places, or things?', '[\"Only one\",\"More than one\",\"Three\",\"None\"]', 'Only one', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(279, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'Verbs are _____ words.', '[\"action\",\"place\",\"proper\"]', 'action', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(280, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'A noun names a person, place, or _____.', '[\"thing\",\"jump\",\"read\"]', 'thing', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(281, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', '\'Anna\' is a girl\'s name, so it is a _____ noun.', '[\"proper\",\"plural\",\"verb\"]', 'proper', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(282, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'Plural nouns refer to _____ than one person, place, or thing.', '[\"more\",\"one\",\"less\"]', 'more', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(283, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'To show more than one dog, we add _____ to the end of the word.', '[\"s\",\"ed\",\"ing\"]', 's', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(284, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'Words that replace nouns in a sentence are called _____.', '[\"pronouns\",\"verbs\",\"objects\"]', 'pronouns', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(285, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'fill_blank', 'Nouns you can touch or hold are _____ nouns.', '[\"tangible\",\"abstract\",\"helping\"]', 'tangible', 1.00, 'ai', 31, 'archived', NULL, '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(286, 2, 22, 18, 1, 5, 'Nouns & Verbs', 'activity', '1. Provide pairs of students with two labeled trays or baskets: one marked \'Noun\' (with a black Montessori triangle symbol) and one marked \'Verb\' (with a red Montessori circle symbol).\n2. Hand each pair a pouch containing 8 picture-and-word cards taken from the lesson (e.g., rabbit, book, France, dog, drives, read, throws, jumped).\n3. Children take turns drawing a card, saying the word aloud, and deciding if it names a person/place/thing (Noun) or shows an action (Verb).\n4. Children place the card into the correct basket.\n5. After sorting, pairs check their answers with the teacher or a prepared control card and return the materials neatly to the shelf.', NULL, NULL, 10.00, 'ai', 31, 'archived', '{\"categories\":[{\"name\":\"Sorting Accuracy\",\"max_points\":4,\"levels\":[{\"label\":\"Excellent\",\"points\":4,\"description\":\"Correctly sorts all 8 noun and verb cards into the proper baskets.\"},{\"label\":\"Good\",\"points\":3,\"description\":\"Correctly sorts 6 to 7 cards with minimal guidance.\"},{\"label\":\"Fair\",\"points\":2,\"description\":\"Correctly sorts 4 to 5 cards; needs teacher prompts to identify actions vs. things.\"},{\"label\":\"Needs Improvement\",\"points\":1,\"description\":\"Sorts fewer than 4 cards correctly; needs full teacher assistance.\"}]},{\"name\":\"Participation and Focus\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Actively participates, reads words aloud, and stays focused throughout the task.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Participates well and takes turns with minor reminders to stay on task.\"},{\"label\":\"Fair\",\"points\":1.5,\"description\":\"Participates only when urged by the partner or teacher.\"},{\"label\":\"Needs Improvement\",\"points\":0.5,\"description\":\"Shows little interest or is frequently distracted during the sorting activity.\"}]},{\"name\":\"Care of Materials\",\"max_points\":3,\"levels\":[{\"label\":\"Excellent\",\"points\":3,\"description\":\"Handles cards and baskets gently and returns them neatly to the shelf.\"},{\"label\":\"Good\",\"points\":2,\"description\":\"Handles materials properly and cleans up with a gentle reminder.\"},{\"label\":\"Fair\",\"points\":1.5,\"description\":\"Leaves materials scattered or requires help putting cards back into the pouch.\"},{\"label\":\"Needs Improvement\",\"points\":0.5,\"description\":\"Mishandles cards or leaves the workspace untidy without packing away.\"}]}]}', '2026-10-11 19:00:47', '2026-10-11 19:01:15', 'quiz'),
(287, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'What part of speech names a person, place, or thing?', '[\"Noun\",\"Verb\",\"Adjective\",\"Adverb\"]', 'Noun', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(288, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'What are verbs in a sentence?', '[\"Action words\",\"Color words\",\"Name of places\",\"Helping letters\"]', 'Action words', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(289, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'Which word is an adjective that describes something?', '[\"Blue\",\"Rabbit\",\"France\",\"Jumped\"]', 'Blue', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(290, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'Which of these words is a pronoun?', '[\"She\",\"Castle\",\"Drives\",\"Book\"]', 'She', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(291, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'mcq', 'What letter is added to the word \'dog\' to make it plural?', '[\"s\",\"ed\",\"ing\",\"ly\"]', 's', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(292, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'A noun that means only one thing is _____.', '[\"singular\",\"plural\",\"verb\",\"adverb\"]', 'singular', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(293, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'A noun that means more than one thing is _____.', '[\"plural\",\"singular\",\"action\",\"pronoun\"]', 'plural', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(294, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Words that replace nouns in a sentence are called _____.', '[\"pronouns\",\"adjectives\",\"places\",\"actions\"]', 'pronouns', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(295, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Descriptive words that modify nouns are called _____.', '[\"adjectives\",\"verbs\",\"subjects\",\"objects\"]', 'adjectives', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(296, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'fill_blank', 'Good values like honesty and happiness are _____ nouns because we cannot touch them.', '[\"abstract\",\"plural\",\"helping\",\"proper\"]', 'abstract', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(297, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'What is a noun? Give one example from our lesson.', NULL, 'A noun is a word for a person, place, or thing. An example of a noun is a dog, Anna, or a book.', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(298, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'Why are words like honesty and happiness considered nouns even if we cannot touch them?', NULL, 'They are intangible or abstract nouns. Even though we cannot touch feelings or ideas, they are still things we can name and talk about.', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(299, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'What do adjectives do in a sentence?', NULL, 'Adjectives are descriptive words that modify or describe nouns. They help us know what kind, which one, or how many things there are.', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(300, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'What is a verb? Give one action verb example from our lesson.', NULL, 'A verb is an action word or a state of being in a sentence. An example of an action verb is drives, read, jumped, or throws.', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(301, 2, 24, 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 'short_answer', 'How do pronouns help us when we write sentences about a person like Jasmine?', NULL, 'Pronouns replace nouns so we do not have to repeat the same name. For example, we can use the word \'she\' instead of saying \'Jasmine\' again.', 1.00, 'ai', 36, 'active', NULL, '2026-10-12 07:40:32', '2026-10-12 07:40:32', 'exam'),
(302, 2, 28, 13, 1, 15, 'IoT', 'mcq', 'What does IoT stand for?', '[\"Internet of Things\",\"Internet of Toys\",\"Inside of Things\",\"Input of Tools\"]', 'Internet of Things', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(303, 2, 28, 13, 1, 15, 'IoT', 'mcq', 'What is the main job of a sensor?', '[\"Detects and measures things\",\"Cooks meals\",\"Washes clothes\",\"Plays video games\"]', 'Detects and measures things', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(304, 2, 28, 13, 1, 15, 'IoT', 'mcq', 'Which of these is an actuator that produces sound or action?', '[\"Buzzer\",\"Light sensor\",\"Temperature sensor\",\"Motion sensor\"]', 'Buzzer', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(305, 2, 28, 13, 1, 15, 'IoT', 'mcq', 'Where can we find a microcontroller working inside our home?', '[\"Microwave oven\",\"Wooden chair\",\"Paper book\",\"Pencil case\"]', 'Microwave oven', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(306, 2, 28, 13, 1, 15, 'IoT', 'mcq', 'What does the DHT11 sensor measure in the air?', '[\"Temperature and humidity\",\"Sound and music\",\"Color of light\",\"Weight of objects\"]', 'Temperature and humidity', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(307, 2, 28, 13, 1, 15, 'IoT', 'true_false', 'A sensor is an input device that gathers information.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(308, 2, 28, 13, 1, 15, 'IoT', 'true_false', 'A microcontroller is a desktop PC with a large monitor and mouse.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(309, 2, 28, 13, 1, 15, 'IoT', 'true_false', 'Actuators turn electrical signals into physical actions.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(310, 2, 28, 13, 1, 15, 'IoT', 'true_false', 'An active buzzer makes sound as soon as it gets power.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(311, 2, 28, 13, 1, 15, 'IoT', 'true_false', 'IoT smart devices cannot connect to the internet.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(312, 2, 28, 13, 1, 15, 'IoT', 'fill_blank', 'IoT stands for Internet of _____.', '[\"Things\",\"Toys\",\"Trees\"]', 'Things', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(313, 2, 28, 13, 1, 15, 'IoT', 'fill_blank', 'Sensors act as _____ devices that gather data.', '[\"input\",\"broken\",\"heavy\"]', 'input', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(314, 2, 28, 13, 1, 15, 'IoT', 'fill_blank', 'An actuator is an _____ device that creates an action.', '[\"output\",\"input\",\"empty\"]', 'output', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(315, 2, 28, 13, 1, 15, 'IoT', 'fill_blank', 'Inside a microcontroller, the _____ runs your program.', '[\"CPU\",\"wheel\",\"tire\"]', 'CPU', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(316, 2, 28, 13, 1, 15, 'IoT', 'fill_blank', 'A photosensitive resistor measures the brightness of _____.', '[\"light\",\"sound\",\"water\"]', 'light', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(317, 2, 28, 13, 1, 15, 'IoT', 'matching', 'Match each electronic part to its primary role:', '[\"Sensor | Input device\",\"Actuator | Output device\",\"CPU | Runs programs\"]', 'Sensor | Input device; Actuator | Output device; CPU | Runs programs', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(318, 2, 28, 13, 1, 15, 'IoT', 'matching', 'Match each sensor to what it detects:', '[\"DHT11 | Temperature and humidity\",\"LDR | Light brightness\",\"PIR sensor | Human movement\"]', 'DHT11 | Temperature and humidity; LDR | Light brightness; PIR sensor | Human movement', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(319, 2, 28, 13, 1, 15, 'IoT', 'matching', 'Match the appliance to its place or function:', '[\"Microwave oven | Kitchen heating appliance\",\"TV remote | Handheld controller\",\"Washing machine | Laundry appliance\"]', 'Microwave oven | Kitchen heating appliance; TV remote | Handheld controller; Washing machine | Laundry appliance', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(320, 2, 28, 13, 1, 15, 'IoT', 'matching', 'Match the microcontroller part to its job:', '[\"Memory | Stores code and variables\",\"CPU | Executes the program\",\"GPIO pins | Talks to outside devices\"]', 'Memory | Stores code and variables; CPU | Executes the program; GPIO pins | Talks to outside devices', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(321, 2, 28, 13, 1, 15, 'IoT', 'matching', 'Match the actuator component to its output:', '[\"Buzzer | Sound tone\",\"OLED screen | Visual display\",\"Relay module | Circuit switch\"]', 'Buzzer | Sound tone; OLED screen | Visual display; Relay module | Circuit switch', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(322, 2, 28, 13, 1, 15, 'IoT', 'sequencing', 'Put the steps of an IoT device action in order:', '[\"Sensor collects data from environment\",\"Device transmits data over network\",\"Actuator performs an action\"]', 'Sensor collects data from environment | Device transmits data over network | Actuator performs an action', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(323, 2, 28, 13, 1, 15, 'IoT', 'sequencing', 'Put the basic electronic signal flow in order:', '[\"Input is detected by sensor\",\"Information is processed by controller\",\"Output is performed by actuator\"]', 'Input is detected by sensor | Information is processed by controller | Output is performed by actuator', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(324, 2, 28, 13, 1, 15, 'IoT', 'sequencing', 'Put the buzzer activation steps in order:', '[\"Controller sends electrical signal\",\"Active buzzer receives power\",\"Buzzer makes sound\"]', 'Controller sends electrical signal | Active buzzer receives power | Buzzer makes sound', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(325, 2, 28, 13, 1, 15, 'IoT', 'sequencing', 'Put the steps of detecting motion in order:', '[\"Person moves within range\",\"PIR sensor detects motion\",\"Sensor sends signal to microcontroller\"]', 'Person moves within range | PIR sensor detects motion | Sensor sends signal to microcontroller', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(326, 2, 28, 13, 1, 15, 'IoT', 'sequencing', 'Put the steps of working with a development board in order:', '[\"Write program code\",\"Power the board\",\"Test code on hardware\"]', 'Write program code | Power the board | Test code on hardware', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(327, 2, 28, 13, 1, 15, 'IoT', 'identification', 'What is the small computer on a single chip designed to run dedicated tasks called?', '[\"toaster\",\"battery\"]', 'Microcontroller', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(328, 2, 28, 13, 1, 15, 'IoT', 'identification', 'What complete computer built on a single circuit board can run a full operating system?', '[\"notebook\",\"cable\"]', 'Single Board Computer', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(329, 2, 28, 13, 1, 15, 'IoT', 'identification', 'Which sensor module uses infrared light to detect nearby objects without touching them?', '[\"thermometer\",\"switch\"]', 'IR proximity sensor', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(330, 2, 28, 13, 1, 15, 'IoT', 'identification', 'Which 3-pin analog sensor provides variable output when you turn its knob?', '[\"resistor\",\"wire\"]', 'Potentiometer', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(331, 2, 28, 13, 1, 15, 'IoT', 'identification', 'Which GNSS module receives satellite signals for positioning and location?', '[\"speaker\",\"lamp\"]', 'NEO-M8N GPS', 1.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(332, 2, 28, 13, 1, 15, 'IoT', 'enumeration', 'Name two household appliances from the lesson that contain microcontrollers.', NULL, 'Award 1 point for each valid appliance listed: microwave ovens, washing machines, TV remotes.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(333, 2, 28, 13, 1, 15, 'IoT', 'enumeration', 'Name two physical properties that sensors can measure.', NULL, 'Award 1 point for each property: temperature, light, distance, water level, sound, motion, magnetic field, touch/pressure.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(334, 2, 28, 13, 1, 15, 'IoT', 'enumeration', 'Name two physical actions that actuators can perform.', NULL, 'Award 1 point for each action: move, light up, make sound, lock/unlock, heat, open/close, display.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(335, 2, 28, 13, 1, 15, 'IoT', 'enumeration', 'Name two internal components found inside a microcontroller chip.', NULL, 'Award 1 point for each component: CPU, memory (RAM/Flash), input/output pins (GPIO), timers/counters, peripherals.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(336, 2, 28, 13, 1, 15, 'IoT', 'enumeration', 'Name two wireless network features present on an ESP32 development board.', NULL, 'Award 1 point each for Wi-Fi and Bluetooth.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(337, 2, 28, 13, 1, 15, 'IoT', 'short_answer', 'What is the Internet of Things (IoT)?', NULL, 'The Internet of Things (IoT) is a network of physical objects embedded with sensors and software. These objects connect and share data with other devices over the internet.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(338, 2, 28, 13, 1, 15, 'IoT', 'short_answer', 'Why are sensors known as input devices?', NULL, 'Sensors are input devices because they collect information from their environment. They measure physical properties like heat or light and send that information into the system.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(339, 2, 28, 13, 1, 15, 'IoT', 'short_answer', 'What does an actuator do in an electronic system?', NULL, 'An actuator receives an electrical signal from the controller and converts it into physical action. It can produce sound, turn on a light, or move a motor.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(340, 2, 28, 13, 1, 15, 'IoT', 'short_answer', 'How is a microcontroller different from a regular computer?', NULL, 'A microcontroller is a single chip made to do one specific job in a loop. Unlike a PC, it usually has no monitor, keyboard, or mouse.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(341, 2, 28, 13, 1, 15, 'IoT', 'short_answer', 'How do IoT devices help people in smart homes?', NULL, 'IoT devices in smart homes automate everyday tasks like adjusting lights or monitoring safety. They allow people to control and monitor their home appliances remotely.', 2.00, 'ai', 37, 'active', NULL, '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(342, 2, 29, 13, 1, 15, 'IoT', 'mcq', 'What kind of device is a sensor?', '[\"Input device\",\"Output device\",\"Sound speaker\",\"Display screen\"]', 'Input device', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(343, 2, 29, 13, 1, 15, 'IoT', 'mcq', 'Which sensor measures temperature and humidity?', '[\"DHT11 sensor\",\"Push button\",\"Active buzzer\",\"OLED screen\"]', 'DHT11 sensor', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(344, 2, 29, 13, 1, 15, 'IoT', 'mcq', 'What does an IR proximity sensor detect without touching?', '[\"Nearby objects\",\"Music songs\",\"Paint colors\",\"Cold ice\"]', 'Nearby objects', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(345, 2, 29, 13, 1, 15, 'IoT', 'mcq', 'What does a photosensitive resistor (LDR) sensor measure?', '[\"Light and brightness\",\"Loud sound\",\"Water level\",\"Wind speed\"]', 'Light and brightness', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(346, 2, 29, 13, 1, 15, 'IoT', 'mcq', 'What kind of movement does the HC-SR501 PIR sensor detect?', '[\"Human or animal movement\",\"Falling leaves\",\"Running water\",\"Blinking lights\"]', 'Human or animal movement', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(347, 2, 29, 13, 1, 15, 'IoT', 'fill_blank', 'Sensors are electronic parts that work as _____ devices.', '[\"input\",\"output\",\"battery\",\"screen\"]', 'input', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(348, 2, 29, 13, 1, 15, 'IoT', 'fill_blank', 'A sensor turns what it finds into an _____ signal.', '[\"electrical\",\"invisible\",\"outdoor\",\"animal\"]', 'electrical', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(349, 2, 29, 13, 1, 15, 'IoT', 'fill_blank', 'A push button sensor knows if a button is pressed or _____.', '[\"released\",\"broken\",\"painted\",\"erased\"]', 'released', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(350, 2, 29, 13, 1, 15, 'IoT', 'fill_blank', 'A potentiometer sensor changes its voltage when you turn a _____.', '[\"knob\",\"wheel\",\"screw\",\"key\"]', 'knob', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(351, 2, 29, 13, 1, 15, 'IoT', 'fill_blank', 'The NEO-M8N GPS module is used to give positioning _____.', '[\"accuracy\",\"brightness\",\"warmth\",\"sound\"]', 'accuracy', 1.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(352, 2, 29, 13, 1, 15, 'IoT', 'short_answer', 'What is the job of a sensor?', NULL, 'A sensor detects or measures physical things around it, like light or heat. It then turns that measurement into an electrical signal that a controller can read.', 2.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(353, 2, 29, 13, 1, 15, 'IoT', 'short_answer', 'How does an IR proximity sensor find nearby objects?', NULL, 'An IR proximity sensor emits and receives infrared light. This lets it detect objects close to it without actually touching them.', 2.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(354, 2, 29, 13, 1, 15, 'IoT', 'short_answer', 'What does a DHT11 sensor tell us about the air?', NULL, 'The DHT11 sensor tells us about the air\'s temperature and humidity. It is a digital sensor that measures how warm or damp the air is.', 2.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(355, 2, 29, 13, 1, 15, 'IoT', 'short_answer', 'How does the HC-SR501 PIR sensor help protect an area?', NULL, 'The HC-SR501 PIR sensor detects movement from people or animals. It can spot this motion up to several meters away to alert a system.', 2.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(356, 2, 29, 13, 1, 15, 'IoT', 'short_answer', 'Where can we see a push button sensor being used at home?', NULL, 'A push button sensor can be used on a doorbell at home. When someone presses the button, it connects the circuit so a bell can ring.', 2.00, 'ai', 34, 'active', NULL, '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quiz'),
(357, 97, 30, 13, 3, 17, 'IoT', 'mcq', 'What does the abbreviation IoT stand for?', '[\"Internet of Things\",\"Inside of Technology\",\"Internet of Tools\",\"Input of Things\"]', 'Internet of Things', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(358, 97, 30, 13, 3, 17, 'IoT', 'mcq', 'Which part inside a microcontroller runs your program?', '[\"CPU\",\"Battery\",\"Screen\",\"Speaker\"]', 'CPU', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(359, 97, 30, 13, 3, 17, 'IoT', 'mcq', 'What type of electronic component is a sensor?', '[\"Input device\",\"Output device\",\"Power generator\",\"Storage disk\"]', 'Input device', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(360, 97, 30, 13, 3, 17, 'IoT', 'mcq', 'Which sensor module measures both temperature and humidity?', '[\"DHT11\",\"Push button\",\"Active buzzer\",\"OLED screen\"]', 'DHT11', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(361, 97, 30, 13, 3, 17, 'IoT', 'mcq', 'What is the main job of an actuator?', '[\"Convert a signal into physical action\",\"Store photos on the internet\",\"Measure room temperature\",\"Connect a keyboard to a computer\"]', 'Convert a signal into physical action', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(362, 97, 30, 13, 3, 17, 'IoT', 'true_false', 'A microcontroller is just like a desktop PC with a keyboard and monitor.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(363, 97, 30, 13, 3, 17, 'IoT', 'true_false', 'Actuators are considered output devices.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(364, 97, 30, 13, 3, 17, 'IoT', 'true_false', 'The ESP32 development board features built-in Wi-Fi and Bluetooth.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(365, 97, 30, 13, 3, 17, 'IoT', 'true_false', 'A Single Board Computer (SBC) can run a full operating system.', '[\"True\",\"False\"]', 'True', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(366, 97, 30, 13, 3, 17, 'IoT', 'true_false', 'A photosensitive resistor is used to measure sound levels.', '[\"True\",\"False\"]', 'False', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(367, 97, 30, 13, 3, 17, 'IoT', 'fill_blank', 'An IR proximity sensor uses _____ light to detect nearby objects without touching them.', '[\"infrared\",\"sunlight\",\"laser\"]', 'infrared', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(368, 97, 30, 13, 3, 17, 'IoT', 'fill_blank', 'The _____ inside a microcontroller stores your code and variables.', '[\"Memory\",\"Wire\",\"Plastic\"]', 'Memory', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(369, 97, 30, 13, 3, 17, 'IoT', 'fill_blank', 'An active _____ makes a single-tone sound as soon as it receives power.', '[\"buzzer\",\"switch\",\"thermometer\"]', 'buzzer', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(370, 97, 30, 13, 3, 17, 'IoT', 'fill_blank', 'A microcontroller usually executes its dedicated job in a continuous _____.', '[\"loop\",\"line\",\"circle\"]', 'loop', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(371, 97, 30, 13, 3, 17, 'IoT', 'fill_blank', 'A push button module detects whether a switch is _____ or released.', '[\"pressed\",\"broken\",\"shaken\"]', 'pressed', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(372, 97, 30, 13, 3, 17, 'IoT', 'identification', 'What 3-pin analog component gives variable voltage when you turn its knob?', '[\"Battery\",\"Resistor\"]', 'Potentiometer', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(373, 97, 30, 13, 3, 17, 'IoT', 'identification', 'What motion sensor module detects movement within 3 to 7 meters using passive infrared?', '[\"ESP32\",\"Camera\"]', 'HC-SR501', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(374, 97, 30, 13, 3, 17, 'IoT', 'identification', 'What is the small computer on a single chip that controls household appliances like microwaves and washing machines?', '[\"Laptop\",\"Desktop\"]', 'Microcontroller', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(375, 97, 30, 13, 3, 17, 'IoT', 'identification', 'What compact 128x64 display actuator is used to show text or images in small projects?', '[\"Microphone\",\"Speaker\"]', 'OLED screen', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(376, 97, 30, 13, 3, 17, 'IoT', 'identification', 'Which module receives satellite signals to provide navigation and positioning data?', '[\"Antenna\",\"Radio\"]', 'NEO-M8N GPS', 1.00, 'ai', 39, 'archived', NULL, '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quiz'),
(377, 97, 31, 13, 5, 18, 'IoT', 'mcq', 'What does IoT stand for?', '[\"Internet of Things\",\"International Order of Technology\",\"Integrated Operational Tools\",\"Internet of Trade\"]', 'Internet of Things', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(378, 97, 31, 13, 5, 18, 'IoT', 'mcq', 'Which component is NOT part of a typical IoT system?', '[\"Sensors/actuators\",\"User interfaces\",\"Operating system for multitasking\",\"Network connectivity\"]', 'Operating system for multitasking', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(379, 97, 31, 13, 5, 18, 'IoT', 'mcq', 'Which device is an example of a microcontroller development board?', '[\"ESP32\",\"Smartphone\",\"Laptop\",\"Desktop PC\"]', 'ESP32', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(380, 97, 31, 13, 5, 18, 'IoT', 'mcq', 'Which sensor measures ambient light intensity?', '[\"LDR (photosensitive resistor)\",\"IR proximity sensor\",\"PIR motion sensor\",\"Potentiometer\"]', 'LDR (photosensitive resistor)', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(381, 97, 31, 13, 5, 18, 'IoT', 'mcq', 'What is the main function of an actuator?', '[\"Convert electrical signal to physical action\",\"Measure temperature\",\"Store data\",\"Transmit Wi‑Fi signals\"]', 'Convert electrical signal to physical action', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(382, 97, 31, 13, 5, 18, 'IoT', 'true_false', 'A microcontroller is the same as a personal computer.', '[\"True\",\"False\"]', 'False', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(383, 97, 31, 13, 5, 18, 'IoT', 'true_false', 'The DHT11 sensor can measure both temperature and humidity.', '[\"True\",\"False\"]', 'True', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(384, 97, 31, 13, 5, 18, 'IoT', 'true_false', 'Single Board Computers can run a full operating system on one board.', '[\"True\",\"False\"]', 'True', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(385, 97, 31, 13, 5, 18, 'IoT', 'true_false', 'Passive buzzers need an external signal to produce sound.', '[\"True\",\"False\"]', 'True', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(386, 97, 31, 13, 5, 18, 'IoT', 'true_false', 'Wi‑Fi and Bluetooth are features only found in Arduino boards.', '[\"True\",\"False\"]', 'False', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(387, 97, 31, 13, 5, 18, 'IoT', 'fill_blank', 'The ESP32 board includes both Wi‑Fi and _____ connectivity.', '[\"Bluetooth\",\"Zigbee\",\"LoRa\",\"Cellular\"]', 'Bluetooth', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(388, 97, 31, 13, 5, 18, 'IoT', 'fill_blank', 'A sensor converts a physical property into an _____ signal.', '[\"electrical\",\"magnetic\",\"optical\",\"thermal\"]', 'electrical', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(389, 97, 31, 13, 5, 18, 'IoT', 'fill_blank', 'The HC‑SR501 is a _____ motion sensor.', '[\"PIR\",\"IR\",\"Ultrasonic\",\"Magnetic\"]', 'PIR', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(390, 97, 31, 13, 5, 18, 'IoT', 'fill_blank', 'A microcontroller typically contains a CPU, memory, and I/O _____ .', '[\"pins\",\"ports\",\"chips\",\"modules\"]', 'pins', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(391, 97, 31, 13, 5, 18, 'IoT', 'fill_blank', 'Smart thermostats are an example of _____ homes.', '[\"smart\",\"automated\",\"connected\",\"digital\"]', 'smart', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(392, 97, 31, 13, 5, 18, 'IoT', 'identification', 'Name one common place where microcontrollers are used.', '[\"Refrigerator\"]', 'Microwave oven', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(393, 97, 31, 13, 5, 18, 'IoT', 'identification', 'What does the acronym SBC stand for?', '[\"System Bus Controller\"]', 'Single Board Computer', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(394, 97, 31, 13, 5, 18, 'IoT', 'identification', 'Give one type of output device (actuator) mentioned in the lesson.', '[\"OLED screen\"]', 'Passive buzzer', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(395, 97, 31, 13, 5, 18, 'IoT', 'identification', 'Which sensor module detects human movement within a few meters?', '[\"IR proximity sensor\"]', 'PIR motion sensor', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz'),
(396, 97, 31, 13, 5, 18, 'IoT', 'identification', 'What is the primary purpose of a microcontroller development board?', '[\"High graphics\"]', 'Easy programming', 5.00, 'ai', 40, 'active', NULL, '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quiz');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_sets`
--

CREATE TABLE `quiz_sets` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `grade_level` int(11) NOT NULL,
  `lesson_plan_id` int(11) DEFAULT NULL,
  `lesson_title` varchar(255) DEFAULT NULL,
  `ai_recommendation_id` int(11) DEFAULT NULL,
  `source` enum('ai','manual') NOT NULL DEFAULT 'manual',
  `status` enum('active','archived') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `kind` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_sets`
--

INSERT INTO `quiz_sets` (`id`, `teacher_id`, `title`, `subject_id`, `grade_level`, `lesson_plan_id`, `lesson_title`, `ai_recommendation_id`, `source`, `status`, `created_at`, `updated_at`, `kind`) VALUES
(1, 2, 'File System Administration Quiz', 13, 1, 1, 'activity', 2, 'ai', 'active', '2026-10-01 13:30:43', '2026-10-01 13:30:43', NULL),
(2, 2, 'Plant Parts Quiz', 13, 1, 2, 'Plants', 3, 'ai', 'active', '2026-10-01 13:31:36', '2026-10-01 13:31:36', NULL),
(3, 2, 'Understanding Participation in Campus Organizations', 12, 1, 3, 'try', 6, 'ai', 'active', '2026-10-01 13:56:44', '2026-10-01 13:56:44', NULL),
(4, 2, 'File System Administration: Provisioning, Partitioning and Mounting Storage', 13, 1, 4, 'PT3', 7, 'ai', 'active', '2026-10-02 02:10:10', '2026-10-02 02:10:10', NULL),
(5, 2, 'Try Your Math Skills!', 12, 1, 3, 'try', 8, 'ai', 'active', '2026-10-02 02:37:32', '2026-10-02 02:37:32', NULL),
(6, 2, 'Factors Affecting Student Participation in Campus Organizations', 12, 1, 3, 'try', 9, 'ai', 'active', '2026-10-02 02:45:57', '2026-10-02 02:45:57', NULL),
(7, 2, 'File System Administration: Provisioning, Partitioning and Mounting Storage', 13, 1, 4, 'PT3', 10, 'ai', 'active', '2026-10-02 03:40:22', '2026-10-02 03:40:22', NULL),
(8, 2, 'Nouns & Verbs Quiz', 18, 1, 5, 'Nouns & Verbs', 11, 'ai', 'active', '2026-10-04 09:01:36', '2026-10-04 09:01:36', NULL),
(9, 13, 'Parts of Speech Quiz', 18, 4, 8, 'Sample', 12, 'ai', 'active', '2026-10-07 07:02:01', '2026-10-07 07:02:01', NULL),
(10, 2, 'Math Quiz', 12, 1, 9, 'math', 15, 'ai', 'active', '2026-10-09 05:42:10', '2026-10-09 05:42:10', NULL),
(11, 2, 'Nouns & Verbs Quiz', 18, 1, 5, 'Nouns & Verbs', 16, 'ai', 'active', '2026-10-10 00:11:23', '2026-10-10 00:11:23', NULL),
(12, 2, 'Nouns and Verbs Quiz', 24, 1, 11, 'Nouns and Verbs', 17, 'ai', 'active', '2026-10-10 01:22:25', '2026-10-10 01:22:25', NULL),
(13, 2, 'Munting Pagsusulit: Pangngalan at Pandiwa (Grade 1)', 18, 1, 5, 'Nouns & Verbs', 18, 'ai', 'archived', '2026-10-10 12:18:32', '2026-10-10 12:19:03', NULL),
(14, 2, 'Plants', 13, 1, NULL, NULL, NULL, 'manual', 'active', '2026-10-11 06:35:15', '2026-10-11 06:35:15', NULL),
(15, 2, 'Munting Pagsusulit: Nouns and Verbs', 18, 1, 5, 'Nouns & Verbs', 24, 'ai', 'active', '2026-10-11 07:38:10', '2026-10-11 07:38:10', NULL),
(16, 2, 'Parts of Plants We Eat Quiz', 13, 1, 2, 'Plants', 25, 'ai', 'active', '2026-10-11 08:15:10', '2026-10-11 08:15:10', NULL),
(17, 2, 'Parts of Plants We Eat Quiz', 13, 1, 2, 'Plants', 26, 'ai', 'active', '2026-10-11 08:26:26', '2026-10-11 08:26:26', NULL),
(18, 2, 'Parts of Plants We Eat Quiz', 13, 1, 2, 'Plants', 27, 'ai', 'active', '2026-10-11 08:45:25', '2026-10-11 08:45:25', NULL),
(19, 2, 'Noun', 18, 1, NULL, NULL, NULL, 'manual', 'active', '2026-10-11 16:54:52', '2026-10-11 16:54:52', NULL),
(20, 2, 'Parts of Speech Quiz: Nouns, Verbs, and Adjectives', 23, 1, 12, 'UseofNounsVerbsAdjectives (1)', 28, 'ai', 'active', '2026-10-11 18:13:20', '2026-10-11 18:13:20', NULL),
(21, 2, 'NounsVerbsAdjectives', 23, 1, 14, 'UseofNounsVerbsAdjectives (1)', 30, 'ai', 'active', '2026-10-11 18:27:55', '2026-10-11 18:27:55', NULL),
(22, 2, 'Grade 1 Nouns and Verbs Quiz', 18, 1, 5, 'Nouns & Verbs', 31, 'ai', 'archived', '2026-10-11 19:00:47', '2026-10-11 19:01:15', NULL),
(23, 2, 'Title', 21, 1, NULL, NULL, NULL, 'manual', 'active', '2026-10-12 07:38:05', '2026-10-12 07:38:05', NULL),
(24, 2, 'Exam', 20, 1, 16, 'UseofNounsVerbsAdjectives (1)', 36, 'ai', 'active', '2026-10-12 07:40:32', '2026-10-12 07:40:32', NULL),
(25, 2, 'Try to', 24, 1, NULL, NULL, NULL, 'manual', 'active', '2026-10-12 08:03:15', '2026-10-12 08:03:15', 'exam'),
(26, 2, 'Eto na', 24, 1, NULL, NULL, NULL, 'manual', 'active', '2026-10-12 08:04:01', '2026-10-12 08:04:01', 'quizzes'),
(27, 2, 'Act', 19, 1, NULL, NULL, NULL, 'manual', 'active', '2026-10-12 08:04:15', '2026-10-12 08:04:15', 'activity'),
(28, 2, 'Exam — IoT', 13, 1, 15, 'IoT', 37, 'ai', 'active', '2026-10-12 08:43:17', '2026-10-12 08:43:17', 'exam'),
(29, 2, 'Grade 1 Science Quiz: IoT Sensors', 13, 1, 15, 'IoT', 34, 'ai', 'active', '2026-10-12 15:50:54', '2026-10-12 15:50:54', 'quizzes'),
(30, 97, 'Grade 3 Science: Introduction to IoT and Smart Devices', 13, 3, 17, 'IoT', 39, 'ai', 'archived', '2026-10-13 06:30:31', '2026-10-13 06:34:30', 'quizzes'),
(31, 97, 'IoT Basics Quiz', 13, 5, 18, 'IoT', 40, 'ai', 'active', '2026-10-13 06:59:27', '2026-10-13 06:59:27', 'quizzes');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_submissions`
--

CREATE TABLE `quiz_submissions` (
  `id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `share_token` varchar(32) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `score` decimal(8,2) NOT NULL DEFAULT 0.00,
  `max_score` decimal(8,2) NOT NULL DEFAULT 0.00,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_submissions`
--

INSERT INTO `quiz_submissions` (`id`, `assessment_id`, `student_id`, `share_token`, `answers`, `score`, `max_score`, `submitted_at`) VALUES
(1, 2, 5, 'e3b7abec3956b2fb', '{\"student_id\":5,\"answers\":{\"1\":\"To anchor the plant in the ground.\",\"2\":\"To breathe the air and catch the sun.\",\"3\":\"To hold the pollen and attract bees.\",\"4\":\"To get ripe and feed the ground.\",\"5\":\"Fruit\",\"6\":\"Branch\",\"7\":\"Seed\",\"8\":\"Fruit\\nLeaves\\nStem\",\"9\":\"Seed\\nPericarp\",\"10\":\"Fruit\\nLeaves\\nStem\"},\"detail\":[{\"question_id\":1,\"given\":\"To anchor the plant in the ground.\",\"correct\":true,\"points\":2},{\"question_id\":2,\"given\":\"To breathe the air and catch the sun.\",\"correct\":true,\"points\":2},{\"question_id\":3,\"given\":\"To hold the pollen and attract bees.\",\"correct\":false,\"points\":2},{\"question_id\":4,\"given\":\"To get ripe and feed the ground.\",\"correct\":false,\"points\":2},{\"question_id\":5,\"given\":\"Fruit\",\"correct\":null,\"points\":2},{\"question_id\":6,\"given\":\"Branch\",\"correct\":null,\"points\":2},{\"question_id\":7,\"given\":\"Seed\",\"correct\":null,\"points\":2},{\"question_id\":8,\"given\":\"Fruit\\nLeaves\\nStem\",\"correct\":null,\"points\":3},{\"question_id\":9,\"given\":\"Seed\\nPericarp\",\"correct\":null,\"points\":3},{\"question_id\":10,\"given\":\"Fruit\\nLeaves\\nStem\",\"correct\":null,\"points\":3}],\"scored_at\":\"2026-10-01T13:42:55.003Z\"}', 4.00, 23.00, '2026-10-01 13:42:55'),
(2, 12, 5, '080be99cae1aa75e', '{\"student_id\":5,\"answers\":{\"15\":\"Financial constraints\",\"16\":\"To produce graduates who are socially aware and ready for public service\",\"17\":\"Through student-led organizational hierarchies\",\"18\":\"Through lectures alone\",\"19\":\"gsagsa\",\"20\":\"sada\",\"21\":\"fsagas\",\"22\":\"sadasd\",\"23\":\"sagasasf\",\"24\":\"sagsa\"},\"detail\":[{\"question_id\":15,\"given\":\"Financial constraints\",\"correct\":false,\"points\":2},{\"question_id\":16,\"given\":\"To produce graduates who are socially aware and ready for public service\",\"correct\":true,\"points\":2},{\"question_id\":17,\"given\":\"Through student-led organizational hierarchies\",\"correct\":true,\"points\":2},{\"question_id\":18,\"given\":\"Through lectures alone\",\"correct\":false,\"points\":2},{\"question_id\":19,\"given\":\"gsagsa\",\"correct\":null,\"points\":3},{\"question_id\":20,\"given\":\"sada\",\"correct\":null,\"points\":3},{\"question_id\":21,\"given\":\"fsagas\",\"correct\":null,\"points\":3},{\"question_id\":22,\"given\":\"sadasd\",\"correct\":null,\"points\":4},{\"question_id\":23,\"given\":\"sagasasf\",\"correct\":null,\"points\":4},{\"question_id\":24,\"given\":\"sagsa\",\"correct\":null,\"points\":4}],\"scored_at\":\"2026-10-02T02:50:59.753Z\"}', 4.00, 29.00, '2026-10-02 02:50:59'),
(3, 11, 5, '114162305e2f2665', '{\"student_id\":\"5\",\"answers\":{\"14\":{\"text\":\"dfdffd\",\"file\":{\"url\":\"/uploads/activity-submissions/act_1790909807218_b4df538b.jpg\",\"name\":\"523575d0-9a0c-4fa3-93a8-d206aec5ed01.jpg\",\"mime\":\"image/jpeg\"}}},\"detail\":[{\"question_id\":14,\"given\":\"dfdffd\",\"correct\":null,\"points\":10}],\"scored_at\":\"2026-10-02T02:56:47.233Z\"}', 0.00, 10.00, '2026-10-02 02:56:47'),
(4, 13, 5, 'f4fd848e3fa25afb', '{\"student_id\":5,\"answers\":{\"25\":\"To allow files to be read directly on a Windows machine\",\"26\":\"sudo mkf\",\"27\":\"Read the device name out loud\",\"28\":\"sudo mkf\",\"29\":\"To create a new partition\",\"30\":\"Use it to create a partition\",\"31\":\"fg\",\"32\":\"gf\",\"33\":\"gh\",\"34\":\"fgf\",\"35\":\"gh\",\"36\":\"gff\",\"37\":\"sd\",\"38\":\"hg\",\"39\":\"df\",\"40\":\"gh\",\"41\":\"vbv\",\"42\":\"cvv\",\"43\":\"fgf\"},\"detail\":[{\"question_id\":25,\"given\":\"To allow files to be read directly on a Windows machine\",\"correct\":true,\"points\":1},{\"question_id\":26,\"given\":\"sudo mkf\",\"correct\":false,\"points\":1},{\"question_id\":27,\"given\":\"Read the device name out loud\",\"correct\":true,\"points\":1},{\"question_id\":28,\"given\":\"sudo mkf\",\"correct\":false,\"points\":1},{\"question_id\":29,\"given\":\"To create a new partition\",\"correct\":false,\"points\":1},{\"question_id\":30,\"given\":\"Use it to create a partition\",\"correct\":true,\"points\":1},{\"question_id\":31,\"given\":\"fg\",\"correct\":null,\"points\":2},{\"question_id\":32,\"given\":\"gf\",\"correct\":null,\"points\":2},{\"question_id\":33,\"given\":\"gh\",\"correct\":null,\"points\":2},{\"question_id\":34,\"given\":\"fgf\",\"correct\":null,\"points\":2},{\"question_id\":35,\"given\":\"gh\",\"correct\":null,\"points\":2},{\"question_id\":36,\"given\":\"gff\",\"correct\":null,\"points\":2},{\"question_id\":37,\"given\":\"sd\",\"correct\":null,\"points\":2},{\"question_id\":38,\"given\":\"hg\",\"correct\":null,\"points\":2},{\"question_id\":39,\"given\":\"df\",\"correct\":null,\"points\":2},{\"question_id\":40,\"given\":\"gh\",\"correct\":null,\"points\":2},{\"question_id\":41,\"given\":\"vbv\",\"correct\":null,\"points\":2},{\"question_id\":42,\"given\":\"cvv\",\"correct\":null,\"points\":1},{\"question_id\":43,\"given\":\"fgf\",\"correct\":null,\"points\":1}],\"scored_at\":\"2026-10-02T03:43:52.601Z\"}', 3.00, 30.00, '2026-10-02 03:43:52'),
(5, 19, 5, 'c56c7e0bd5c92532', '{\"student_id\":\"5\",\"answers\":{\"76\":{\"text\":\"gdg\",\"file\":{\"url\":\"/uploads/activity-submissions/act_1790919894743_567323a2.jpg\",\"name\":\"523575d0-9a0c-4fa3-93a8-d206aec5ed01.jpg\",\"mime\":\"image/jpeg\"}}},\"detail\":[{\"question_id\":76,\"given\":\"gdg\",\"correct\":null,\"points\":10}],\"scored_at\":\"2026-10-02T05:44:54.757Z\"}', 0.00, 10.00, '2026-10-02 05:44:54'),
(6, 18, 5, '2175e2b2e5d88ec3', '{\"student_id\":5,\"answers\":{\"66\":\"2\",\"67\":\"2\",\"68\":\"3\",\"69\":\"2\",\"70\":\"4\",\"71\":\"square\",\"72\":\"6\",\"73\":\"6,7,8\",\"74\":\"Square, Circle\",\"75\":\"Red, Blue, Green\"},\"detail\":[{\"question_id\":66,\"given\":\"2\",\"correct\":false,\"points\":2},{\"question_id\":67,\"given\":\"2\",\"correct\":true,\"points\":2},{\"question_id\":68,\"given\":\"3\",\"correct\":true,\"points\":2},{\"question_id\":69,\"given\":\"2\",\"correct\":false,\"points\":2},{\"question_id\":70,\"given\":\"4\",\"correct\":null,\"points\":2},{\"question_id\":71,\"given\":\"square\",\"correct\":null,\"points\":2},{\"question_id\":72,\"given\":\"6\",\"correct\":null,\"points\":2},{\"question_id\":73,\"given\":\"6,7,8\",\"correct\":null,\"points\":2},{\"question_id\":74,\"given\":\"Square, Circle\",\"correct\":null,\"points\":2},{\"question_id\":75,\"given\":\"Red, Blue, Green\",\"correct\":null,\"points\":2}],\"scored_at\":\"2026-10-02T05:47:47.737Z\"}', 4.00, 20.00, '2026-10-02 05:47:47'),
(7, 20, 5, 'bff87a7ccea261c9', '{\"student_id\":5,\"answers\":{\"77\":\"Because it allows files to be read directly on a Windows machine\",\"78\":\"To undo any changes made to the disk\",\"79\":\"sudo lsblk\",\"80\":\"sudo echo \'Hello World!\' > /dev/sda1\'\",\"81\":\"THE EXISTING SYSTEM DISK\",\"82\":\"to gain superuser privileges\",\"83\":\"TO FORMAT A PARTITION WITH THE EXT4 FILE SYSTEM\",\"84\":\"EXT4, NTF\",\"85\":\"SS-01, SS-02, SS-03, SS-04\",\"86\":\"PARTITION 1 - 15 GB, PARTITION 2 - REMAINING 15 GB\"},\"detail\":[{\"question_id\":77,\"given\":\"Because it allows files to be read directly on a Windows machine\",\"correct\":true,\"points\":1},{\"question_id\":78,\"given\":\"To undo any changes made to the disk\",\"correct\":true,\"points\":1},{\"question_id\":79,\"given\":\"sudo lsblk\",\"correct\":true,\"points\":1},{\"question_id\":80,\"given\":\"sudo echo \'Hello World!\' > /dev/sda1\'\",\"correct\":true,\"points\":1},{\"question_id\":81,\"given\":\"THE EXISTING SYSTEM DISK\",\"correct\":true,\"points\":1},{\"question_id\":82,\"given\":\"to gain superuser privileges\",\"correct\":true,\"points\":1},{\"question_id\":83,\"given\":\"TO FORMAT A PARTITION WITH THE EXT4 FILE SYSTEM\",\"correct\":true,\"points\":1},{\"question_id\":84,\"given\":\"EXT4, NTF\",\"correct\":false,\"points\":1},{\"question_id\":85,\"given\":\"SS-01, SS-02, SS-03, SS-04\",\"correct\":true,\"points\":1},{\"question_id\":86,\"given\":\"PARTITION 1 - 15 GB, PARTITION 2 - REMAINING 15 GB\",\"correct\":true,\"points\":1}],\"scored_at\":\"2026-10-02T06:01:34.304Z\"}', 9.00, 10.00, '2026-10-02 06:01:34'),
(8, 22, 5, '621fca5df3b6fcd3', '{\"student_id\":5,\"answers\":{\"97\":\"To create a separate file system for company archives\",\"98\":\"sudo fdisk -l\",\"99\":\"Type it anyway\",\"100\":\"sudo mkfs.ext4\",\"101\":\"To have an undo button\",\"102\":\"Use it to mount a partition\",\"103\":\"err\",\"104\":\"4rr\",\"105\":\"tg\",\"106\":\"tg\",\"107\":\"rtgt\",\"108\":\"gg\",\"109\":\"gg\",\"110\":\"gt\",\"111\":\"gg\",\"112\":\"gbg\",\"113\":\"gbg\",\"114\":\"gbg\",\"115\":\"gb\",\"116\":\"Because it allows files to be read directly on a Windows machine\",\"117\":\"To install new software\",\"118\":\"sudo -i lsblk\",\"119\":\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"120\":\"tgt\",\"121\":\"gg\",\"122\":\"gb\",\"123\":\"gbg\",\"124\":\"b\",\"125\":\"bb\",\"126\":\"To anchor the plant in the ground.\",\"127\":\"To hold the pollen and attract bees.\",\"128\":\"To anchor the plant in the ground.\",\"129\":\"To hold the pollen and attract bees.\",\"130\":\"gt\",\"131\":\"bb\",\"132\":\"bg\",\"133\":\"tgt\",\"134\":\"gg\",\"135\":\"g\",\"136\":\"It is more secure than ext4.\",\"137\":\"To create a backup of the disk.\",\"138\":\"To erase the disk completely.\",\"139\":\"To paste text into a document.\",\"140\":\"gtgt\",\"141\":\"gbg\",\"142\":\"gbg\",\"143\":\"gbgb\",\"144\":\"gbg\",\"145\":\"bb\"},\"detail\":[{\"question_id\":97,\"given\":\"To create a separate file system for company archives\",\"correct\":false,\"points\":1},{\"question_id\":98,\"given\":\"sudo fdisk -l\",\"correct\":false,\"points\":1},{\"question_id\":99,\"given\":\"Type it anyway\",\"correct\":false,\"points\":1},{\"question_id\":100,\"given\":\"sudo mkfs.ext4\",\"correct\":true,\"points\":1},{\"question_id\":101,\"given\":\"To have an undo button\",\"correct\":true,\"points\":1},{\"question_id\":102,\"given\":\"Use it to mount a partition\",\"correct\":false,\"points\":1},{\"question_id\":103,\"given\":\"err\",\"correct\":false,\"points\":1},{\"question_id\":104,\"given\":\"4rr\",\"correct\":false,\"points\":1},{\"question_id\":105,\"given\":\"tg\",\"correct\":false,\"points\":1},{\"question_id\":106,\"given\":\"tg\",\"correct\":false,\"points\":1},{\"question_id\":107,\"given\":\"rtgt\",\"correct\":false,\"points\":1},{\"question_id\":108,\"given\":\"gg\",\"correct\":false,\"points\":1},{\"question_id\":109,\"given\":\"gg\",\"correct\":false,\"points\":1},{\"question_id\":110,\"given\":\"gt\",\"correct\":false,\"points\":1},{\"question_id\":111,\"given\":\"gg\",\"correct\":false,\"points\":1},{\"question_id\":112,\"given\":\"gbg\",\"correct\":false,\"points\":1},{\"question_id\":113,\"given\":\"gbg\",\"correct\":false,\"points\":1},{\"question_id\":114,\"given\":\"gbg\",\"correct\":false,\"points\":1},{\"question_id\":115,\"given\":\"gb\",\"correct\":false,\"points\":1},{\"question_id\":116,\"given\":\"Because it allows files to be read directly on a Windows machine\",\"correct\":true,\"points\":1},{\"question_id\":117,\"given\":\"To install new software\",\"correct\":false,\"points\":1},{\"question_id\":118,\"given\":\"sudo -i lsblk\",\"correct\":false,\"points\":1},{\"question_id\":119,\"given\":\"sudo -i echo \'Hello World!\' > /dev/sda1\'\",\"correct\":false,\"points\":1},{\"question_id\":120,\"given\":\"tgt\",\"correct\":false,\"points\":1},{\"question_id\":121,\"given\":\"gg\",\"correct\":false,\"points\":1},{\"question_id\":122,\"given\":\"gb\",\"correct\":false,\"points\":1},{\"question_id\":123,\"given\":\"gbg\",\"correct\":false,\"points\":1},{\"question_id\":124,\"given\":\"b\",\"correct\":false,\"points\":1},{\"question_id\":125,\"given\":\"bb\",\"correct\":false,\"points\":1},{\"question_id\":126,\"given\":\"To anchor the plant in the ground.\",\"correct\":true,\"points\":1},{\"question_id\":127,\"given\":\"To hold the pollen and attract bees.\",\"correct\":false,\"points\":1},{\"question_id\":128,\"given\":\"To anchor the plant in the ground.\",\"correct\":false,\"points\":1},{\"question_id\":129,\"given\":\"To hold the pollen and attract bees.\",\"correct\":false,\"points\":1},{\"question_id\":130,\"given\":\"gt\",\"correct\":false,\"points\":1},{\"question_id\":131,\"given\":\"bb\",\"correct\":false,\"points\":1},{\"question_id\":132,\"given\":\"bg\",\"correct\":false,\"points\":1},{\"question_id\":133,\"given\":\"tgt\",\"correct\":false,\"points\":1},{\"question_id\":134,\"given\":\"gg\",\"correct\":false,\"points\":1},{\"question_id\":135,\"given\":\"g\",\"correct\":false,\"points\":1},{\"question_id\":136,\"given\":\"It is more secure than ext4.\",\"correct\":false,\"points\":1},{\"question_id\":137,\"given\":\"To create a backup of the disk.\",\"correct\":false,\"points\":1},{\"question_id\":138,\"given\":\"To erase the disk completely.\",\"correct\":false,\"points\":1},{\"question_id\":139,\"given\":\"To paste text into a document.\",\"correct\":false,\"points\":1},{\"question_id\":140,\"given\":\"gtgt\",\"correct\":false,\"points\":1},{\"question_id\":141,\"given\":\"gbg\",\"correct\":false,\"points\":1},{\"question_id\":142,\"given\":\"gbg\",\"correct\":false,\"points\":1},{\"question_id\":143,\"given\":\"gbgb\",\"correct\":false,\"points\":1},{\"question_id\":144,\"given\":\"gbg\",\"correct\":false,\"points\":1},{\"question_id\":145,\"given\":\"bb\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-02T08:03:12.133Z\"}', 4.00, 49.00, '2026-10-02 08:03:12'),
(9, 23, 5, 'a0448bc2717838d9', '{\"student_id\":5,\"answers\":{\"146\":\"A person\",\"147\":\"To replace nouns\",\"148\":\"To modify verbs\",\"149\":\"To modify adverbs\",\"150\":\"sg\",\"151\":\"sdg\",\"152\":\"sgdgsdg\",\"153\":\"sdghr\",\"154\":\",jh\",\"155\":\"kjhk\"},\"detail\":[{\"question_id\":146,\"given\":\"A person\",\"correct\":false,\"points\":2},{\"question_id\":147,\"given\":\"To replace nouns\",\"correct\":true,\"points\":2},{\"question_id\":148,\"given\":\"To modify verbs\",\"correct\":true,\"points\":2},{\"question_id\":149,\"given\":\"To modify adverbs\",\"correct\":false,\"points\":2},{\"question_id\":150,\"given\":\"sg\",\"correct\":false,\"points\":2},{\"question_id\":151,\"given\":\"sdg\",\"correct\":false,\"points\":2},{\"question_id\":152,\"given\":\"sgdgsdg\",\"correct\":false,\"points\":2},{\"question_id\":153,\"given\":\"sdghr\",\"correct\":false,\"points\":2},{\"question_id\":154,\"given\":\",jh\",\"correct\":false,\"points\":2},{\"question_id\":155,\"given\":\"kjhk\",\"correct\":false,\"points\":2}],\"scored_at\":\"2026-10-04T09:07:43.308Z\"}', 4.00, 20.00, '2026-10-04 09:07:43'),
(10, 24, 5, '89cf0bf9ed066f08', '{\"student_id\":\"5\",\"answers\":{\"156\":{\"text\":\"Hello\",\"file\":{\"url\":\"/uploads/activity-submissions/act_1791105141036_c537e5ef.pdf\",\"name\":\"UseofNounsVerbsAdjectives (1).pdf\",\"mime\":\"application/pdf\"}}},\"detail\":[{\"question_id\":156,\"given\":\"Hello\",\"correct\":null,\"points\":10}],\"scored_at\":\"2026-10-04T09:12:21.043Z\"}', 0.00, 10.00, '2026-10-04 09:12:21'),
(11, 25, 5, '13b95ead91ee66da', '{\"student_id\":5,\"answers\":{\"157\":\"Heavy academic demands\",\"158\":\"To produce graduates who are socially aware and ready for public service\",\"159\":\"Through student-led organizational hierarchies\",\"160\":\"Through student-led organizational hierarchies\",\"161\":\"gf\",\"162\":\"dgs\",\"163\":\"gjg\",\"164\":\"cvnd\",\"165\":\"fhjf\",\"166\":\"tyur\",\"167\":\"6\",\"168\":\"3\",\"169\":\"4\",\"170\":\"3\",\"171\":\"fty\",\"172\":\"th\",\"173\":\"sg\",\"174\":\"fh\",\"175\":\"hkg\",\"176\":\"fjg\",\"177\":\"Financial constraints\",\"178\":\"To produce graduates who are socially aware and ready for public service\",\"179\":\"Lack of interest\",\"180\":\"To provide a leadership opportunity\",\"181\":\"xfg\",\"182\":\"fh\",\"183\":\"sg\",\"184\":\"dtjh\",\"185\":\"kgh\",\"186\":\"hgjfs\"},\"detail\":[{\"question_id\":157,\"given\":\"Heavy academic demands\",\"correct\":true,\"points\":1},{\"question_id\":158,\"given\":\"To produce graduates who are socially aware and ready for public service\",\"correct\":true,\"points\":1},{\"question_id\":159,\"given\":\"Through student-led organizational hierarchies\",\"correct\":true,\"points\":1},{\"question_id\":160,\"given\":\"Through student-led organizational hierarchies\",\"correct\":true,\"points\":1},{\"question_id\":161,\"given\":\"gf\",\"correct\":false,\"points\":1},{\"question_id\":162,\"given\":\"dgs\",\"correct\":false,\"points\":1},{\"question_id\":163,\"given\":\"gjg\",\"correct\":false,\"points\":1},{\"question_id\":164,\"given\":\"cvnd\",\"correct\":false,\"points\":1},{\"question_id\":165,\"given\":\"fhjf\",\"correct\":false,\"points\":1},{\"question_id\":166,\"given\":\"tyur\",\"correct\":false,\"points\":1},{\"question_id\":167,\"given\":\"6\",\"correct\":false,\"points\":1},{\"question_id\":168,\"given\":\"3\",\"correct\":false,\"points\":1},{\"question_id\":169,\"given\":\"4\",\"correct\":false,\"points\":1},{\"question_id\":170,\"given\":\"3\",\"correct\":false,\"points\":1},{\"question_id\":171,\"given\":\"fty\",\"correct\":false,\"points\":1},{\"question_id\":172,\"given\":\"th\",\"correct\":false,\"points\":1},{\"question_id\":173,\"given\":\"sg\",\"correct\":false,\"points\":1},{\"question_id\":174,\"given\":\"fh\",\"correct\":false,\"points\":1},{\"question_id\":175,\"given\":\"hkg\",\"correct\":false,\"points\":1},{\"question_id\":176,\"given\":\"fjg\",\"correct\":false,\"points\":1},{\"question_id\":177,\"given\":\"Financial constraints\",\"correct\":false,\"points\":1},{\"question_id\":178,\"given\":\"To produce graduates who are socially aware and ready for public service\",\"correct\":false,\"points\":1},{\"question_id\":179,\"given\":\"Lack of interest\",\"correct\":false,\"points\":1},{\"question_id\":180,\"given\":\"To provide a leadership opportunity\",\"correct\":false,\"points\":1},{\"question_id\":181,\"given\":\"xfg\",\"correct\":false,\"points\":1},{\"question_id\":182,\"given\":\"fh\",\"correct\":false,\"points\":1},{\"question_id\":183,\"given\":\"sg\",\"correct\":false,\"points\":1},{\"question_id\":184,\"given\":\"dtjh\",\"correct\":false,\"points\":1},{\"question_id\":185,\"given\":\"kgh\",\"correct\":false,\"points\":1},{\"question_id\":186,\"given\":\"hgjfs\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-04T09:23:31.178Z\"}', 4.00, 30.00, '2026-10-04 09:23:31'),
(12, 26, 5, '9bb2930beb175426', '{\"student_id\":5,\"answers\":{\"187\":\"A person\",\"188\":\"To replace adjectives\",\"189\":\"To modify adjectives\",\"190\":\"To modify verbs\",\"191\":\"dxfvc\",\"192\":\"sdg\",\"193\":\"gsg\",\"194\":\"sdg\",\"195\":\"sg\",\"196\":\"hjd\"},\"detail\":[{\"question_id\":187,\"given\":\"A person\",\"correct\":false,\"points\":2},{\"question_id\":188,\"given\":\"To replace adjectives\",\"correct\":false,\"points\":2},{\"question_id\":189,\"given\":\"To modify adjectives\",\"correct\":false,\"points\":2},{\"question_id\":190,\"given\":\"To modify verbs\",\"correct\":true,\"points\":2},{\"question_id\":191,\"given\":\"dxfvc\",\"correct\":false,\"points\":2},{\"question_id\":192,\"given\":\"sdg\",\"correct\":false,\"points\":2},{\"question_id\":193,\"given\":\"gsg\",\"correct\":false,\"points\":2},{\"question_id\":194,\"given\":\"sdg\",\"correct\":false,\"points\":3},{\"question_id\":195,\"given\":\"sg\",\"correct\":false,\"points\":3},{\"question_id\":196,\"given\":\"hjd\",\"correct\":false,\"points\":3}],\"scored_at\":\"2026-10-06T06:39:40.105Z\"}', 2.00, 23.00, '2026-10-06 06:39:40'),
(13, 28, 5, '48f765e76107de9b', '{\"student_id\":5,\"answers\":{\"216\":\"A place\",\"217\":\"To replace nouns\",\"218\":\"To modify verbs\",\"219\":\"To modify adjectives\",\"220\":\"ft\",\"221\":\"dfhrs\",\"222\":\"dhfd\",\"223\":\"dghd\",\"224\":\"\",\"225\":\"fg\"},\"detail\":[{\"question_id\":216,\"given\":\"A place\",\"correct\":false,\"points\":2},{\"question_id\":217,\"given\":\"To replace nouns\",\"correct\":true,\"points\":2},{\"question_id\":218,\"given\":\"To modify verbs\",\"correct\":true,\"points\":2},{\"question_id\":219,\"given\":\"To modify adjectives\",\"correct\":false,\"points\":2},{\"question_id\":220,\"given\":\"ft\",\"correct\":false,\"points\":2},{\"question_id\":221,\"given\":\"dfhrs\",\"correct\":false,\"points\":2},{\"question_id\":222,\"given\":\"dhfd\",\"correct\":false,\"points\":2},{\"question_id\":223,\"given\":\"dghd\",\"correct\":false,\"points\":3},{\"question_id\":224,\"given\":\"\",\"correct\":false,\"points\":3},{\"question_id\":225,\"given\":\"fg\",\"correct\":false,\"points\":3}],\"scored_at\":\"2026-10-06T07:39:50.121Z\"}', 4.00, 23.00, '2026-10-06 07:39:50'),
(14, 29, 5, 'e65879b6aa139fe1', '{\"student_id\":5,\"answers\":{\"226\":\"A thing\",\"227\":\"To replace nouns\",\"228\":\"To modify verbs\",\"229\":\"To modify adjectives\",\"230\":\"drg\",\"231\":\"drue\",\"232\":\"gjd\",\"233\":\"dgjh\",\"234\":\"sfh\",\"235\":\"dfhd\"},\"detail\":[{\"question_id\":226,\"given\":\"A thing\",\"correct\":true,\"points\":2},{\"question_id\":227,\"given\":\"To replace nouns\",\"correct\":true,\"points\":2},{\"question_id\":228,\"given\":\"To modify verbs\",\"correct\":true,\"points\":2},{\"question_id\":229,\"given\":\"To modify adjectives\",\"correct\":false,\"points\":2},{\"question_id\":230,\"given\":\"drg\",\"correct\":false,\"points\":2},{\"question_id\":231,\"given\":\"drue\",\"correct\":false,\"points\":2},{\"question_id\":232,\"given\":\"gjd\",\"correct\":false,\"points\":2},{\"question_id\":233,\"given\":\"dgjh\",\"correct\":false,\"points\":3},{\"question_id\":234,\"given\":\"sfh\",\"correct\":false,\"points\":3},{\"question_id\":235,\"given\":\"dfhd\",\"correct\":false,\"points\":3}],\"scored_at\":\"2026-10-07T05:30:23.559Z\"}', 6.00, 23.00, '2026-10-07 05:30:23'),
(15, 30, 7, '2cc09316d72eb281', '{\"student_id\":7,\"answers\":{\"236\":\"A place\",\"237\":\"A word that describes a noun\",\"238\":\"A word that describes a noun\",\"239\":\"A plural noun refers to only one person, place or thing, while a singular noun refers to more than one.\",\"240\":\"fgf\",\"241\":\"fg\",\"242\":\"sd\",\"243\":\"sd\",\"244\":\"ghg\",\"245\":\"hj\"},\"detail\":[{\"question_id\":236,\"given\":\"A place\",\"correct\":false,\"points\":2},{\"question_id\":237,\"given\":\"A word that describes a noun\",\"correct\":true,\"points\":2},{\"question_id\":238,\"given\":\"A word that describes a noun\",\"correct\":false,\"points\":2},{\"question_id\":239,\"given\":\"A plural noun refers to only one person, place or thing, while a singular noun refers to more than one.\",\"correct\":false,\"points\":2},{\"question_id\":240,\"given\":\"fgf\",\"correct\":false,\"points\":3},{\"question_id\":241,\"given\":\"fg\",\"correct\":false,\"points\":3},{\"question_id\":242,\"given\":\"sd\",\"correct\":false,\"points\":3},{\"question_id\":243,\"given\":\"sd\",\"correct\":false,\"points\":4},{\"question_id\":244,\"given\":\"ghg\",\"correct\":false,\"points\":4},{\"question_id\":245,\"given\":\"hj\",\"correct\":false,\"points\":4}],\"scored_at\":\"2026-10-07T07:03:50.995Z\"}', 2.00, 29.00, '2026-10-07 07:03:50'),
(16, 31, 5, '7bbb4952e01e4447', '{\"student_id\":5,\"answers\":{\"246\":\"A thing\",\"247\":\"An action\",\"248\":\"A descriptive word\",\"249\":\"A person\",\"250\":\"A singular noun refers to one thing, while a plural noun refers to two or more things.\"},\"detail\":[{\"question_id\":246,\"given\":\"A thing\",\"correct\":true,\"points\":1},{\"question_id\":247,\"given\":\"An action\",\"correct\":true,\"points\":1},{\"question_id\":248,\"given\":\"A descriptive word\",\"correct\":true,\"points\":1},{\"question_id\":249,\"given\":\"A person\",\"correct\":false,\"points\":1},{\"question_id\":250,\"given\":\"A singular noun refers to one thing, while a plural noun refers to two or more things.\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-10T00:12:37.009Z\"}', 3.00, 5.00, '2026-10-10 00:12:37'),
(17, 32, 5, '44710296d7be8a25', '{\"student_id\":5,\"answers\":{\"251\":\"a thing\",\"252\":\"a thing\",\"253\":\"a place\",\"254\":\"a word\",\"255\":\"present\"},\"detail\":[{\"question_id\":251,\"given\":\"a thing\",\"correct\":true,\"points\":1},{\"question_id\":252,\"given\":\"a thing\",\"correct\":false,\"points\":1},{\"question_id\":253,\"given\":\"a place\",\"correct\":false,\"points\":1},{\"question_id\":254,\"given\":\"a word\",\"correct\":true,\"points\":1},{\"question_id\":255,\"given\":\"present\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-10T01:25:59.034Z\"}', 2.00, 5.00, '2026-10-10 01:25:59'),
(18, 34, 5, 'ddbeacf6dcd71e9d', '{\"student_id\":5,\"answers\":{\"257\":\"a place\",\"258\":\"an action\",\"259\":\"a place\",\"260\":\"a thing\",\"261\":\"future\"},\"detail\":[{\"question_id\":257,\"given\":\"a place\",\"correct\":false,\"points\":1},{\"question_id\":258,\"given\":\"an action\",\"correct\":true,\"points\":1},{\"question_id\":259,\"given\":\"a place\",\"correct\":false,\"points\":1},{\"question_id\":260,\"given\":\"a thing\",\"correct\":false,\"points\":1},{\"question_id\":261,\"given\":\"future\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-11T06:25:53.966Z\"}', 1.00, 5.00, '2026-10-11 06:25:53'),
(19, 37, 5, '86d4ac60733ec3ae', '{\"student_id\":5,\"answers\":{\"272\":\"True\",\"273\":\"False\",\"274\":\"False\",\"275\":\"True\",\"276\":\"True\",\"277\":\"False\",\"278\":\"place\",\"279\":\"s\",\"280\":\"person\",\"281\":\"noun\",\"282\":\"pronouns\",\"283\":\"objects\",\"284\":\"rabbit | adverb; drives | verb; loudly | noun\",\"285\":\"Anna | person; France | place; book | thing\",\"286\":\"Anna | improper noun; rabbit | abstract noun; honesty | proper noun\",\"287\":\"dog | singular; dogs | plural; castle | singular\",\"288\":\"She | object pronoun; Him | subject pronoun; They | subject pronoun\",\"289\":\"throws | past verb phrase; threw | past action; was throwing | current action\",\"290\":\"Subject noun (Batman) | Action verb (drives) | Object noun (Batmobile)\",\"291\":\"Add the letter s to the end | Form the plural noun dogs | Start with the singular noun dog\",\"292\":\"Identify the proper noun Jasmine | Form the sentence She is a princess | Choose the subject pronoun She\",\"293\":\"First adjective (big) | Second adjective (blue) | Modified noun (castle)\",\"294\":\"Object noun (the boy) | Subject noun (The girl) | Action verb (hugged)\",\"295\":\"Main action verb (throwing) | Subject (Thor) | Helping verb (was)\",\"296\":\"dsgsdfs\",\"297\":\"sdgdsfgs\",\"298\":\"sfdsgd\",\"299\":\"khadidhid\",\"300\":\"sagsdgs\",\"301\":\"sdhsdgs\"},\"detail\":[{\"question_id\":272,\"given\":\"True\",\"correct\":true,\"points\":1},{\"question_id\":273,\"given\":\"False\",\"correct\":true,\"points\":1},{\"question_id\":274,\"given\":\"False\",\"correct\":false,\"points\":1},{\"question_id\":275,\"given\":\"True\",\"correct\":false,\"points\":1},{\"question_id\":276,\"given\":\"True\",\"correct\":true,\"points\":1},{\"question_id\":277,\"given\":\"False\",\"correct\":false,\"points\":1},{\"question_id\":278,\"given\":\"place\",\"correct\":false,\"points\":1},{\"question_id\":279,\"given\":\"s\",\"correct\":true,\"points\":1},{\"question_id\":280,\"given\":\"person\",\"correct\":true,\"points\":1},{\"question_id\":281,\"given\":\"noun\",\"correct\":false,\"points\":1},{\"question_id\":282,\"given\":\"pronouns\",\"correct\":true,\"points\":1},{\"question_id\":283,\"given\":\"objects\",\"correct\":false,\"points\":1},{\"question_id\":284,\"given\":\"rabbit | adverb; drives | verb; loudly | noun\",\"correct\":false,\"points\":1},{\"question_id\":285,\"given\":\"Anna | person; France | place; book | thing\",\"correct\":true,\"points\":1},{\"question_id\":286,\"given\":\"Anna | improper noun; rabbit | abstract noun; honesty | proper noun\",\"correct\":false,\"points\":1},{\"question_id\":287,\"given\":\"dog | singular; dogs | plural; castle | singular\",\"correct\":true,\"points\":1},{\"question_id\":288,\"given\":\"She | object pronoun; Him | subject pronoun; They | subject pronoun\",\"correct\":false,\"points\":1},{\"question_id\":289,\"given\":\"throws | past verb phrase; threw | past action; was throwing | current action\",\"correct\":false,\"points\":1},{\"question_id\":290,\"given\":\"Subject noun (Batman) | Action verb (drives) | Object noun (Batmobile)\",\"correct\":true,\"points\":1},{\"question_id\":291,\"given\":\"Add the letter s to the end | Form the plural noun dogs | Start with the singular noun dog\",\"correct\":false,\"points\":1},{\"question_id\":292,\"given\":\"Identify the proper noun Jasmine | Form the sentence She is a princess | Choose the subject pronoun She\",\"correct\":false,\"points\":1},{\"question_id\":293,\"given\":\"First adjective (big) | Second adjective (blue) | Modified noun (castle)\",\"correct\":true,\"points\":1},{\"question_id\":294,\"given\":\"Object noun (the boy) | Subject noun (The girl) | Action verb (hugged)\",\"correct\":false,\"points\":1},{\"question_id\":295,\"given\":\"Main action verb (throwing) | Subject (Thor) | Helping verb (was)\",\"correct\":false,\"points\":1},{\"question_id\":296,\"given\":\"dsgsdfs\",\"correct\":null,\"points\":1},{\"question_id\":297,\"given\":\"sdgdsfgs\",\"correct\":null,\"points\":1},{\"question_id\":298,\"given\":\"sfdsgd\",\"correct\":null,\"points\":1},{\"question_id\":299,\"given\":\"khadidhid\",\"correct\":null,\"points\":1},{\"question_id\":300,\"given\":\"sagsdgs\",\"correct\":null,\"points\":1},{\"question_id\":301,\"given\":\"sdhsdgs\",\"correct\":null,\"points\":1}],\"scored_at\":\"2026-10-11T07:43:49.854Z\"}', 10.00, 30.00, '2026-10-11 07:43:49'),
(20, 38, 5, 'fdf57584f9e9af23', '{\"student_id\":5,\"answers\":{\"302\":\"Carrot | Leaf; Celery | Root; Spinach | Stem\",\"303\":\"Roots | Elevator for water and sugar; Stem | Catch the sun; Leaves | Gather water\",\"304\":\"Flower | Sunflower seed; Fruit | Broccoli; Seed | Cucumber\",\"305\":\"Attracts the bees | Flower; Holds the seeds inside | Fruit; Starts a new plant\'s birth | Seed\",\"306\":\"Stem grows upward | Roots anchor in ground | Flower blooms at top\",\"307\":\"Plant grows roots and stem | Seed is buried in the earth | Fruit gets ripe and falls\",\"308\":\"Harvest parts to eat | Show seed packets | Plant seeds in the soil\",\"309\":\"Ground\",\"310\":\"Roots\",\"311\":\"Flower\"},\"detail\":[{\"question_id\":302,\"given\":\"Carrot | Leaf; Celery | Root; Spinach | Stem\",\"correct\":false,\"points\":1},{\"question_id\":303,\"given\":\"Roots | Elevator for water and sugar; Stem | Catch the sun; Leaves | Gather water\",\"correct\":false,\"points\":1},{\"question_id\":304,\"given\":\"Flower | Sunflower seed; Fruit | Broccoli; Seed | Cucumber\",\"correct\":false,\"points\":1},{\"question_id\":305,\"given\":\"Attracts the bees | Flower; Holds the seeds inside | Fruit; Starts a new plant\'s birth | Seed\",\"correct\":true,\"points\":1},{\"question_id\":306,\"given\":\"Stem grows upward | Roots anchor in ground | Flower blooms at top\",\"correct\":false,\"points\":1},{\"question_id\":307,\"given\":\"Plant grows roots and stem | Seed is buried in the earth | Fruit gets ripe and falls\",\"correct\":false,\"points\":1},{\"question_id\":308,\"given\":\"Harvest parts to eat | Show seed packets | Plant seeds in the soil\",\"correct\":false,\"points\":1},{\"question_id\":309,\"given\":\"Ground\",\"correct\":false,\"points\":1},{\"question_id\":310,\"given\":\"Roots\",\"correct\":false,\"points\":1},{\"question_id\":311,\"given\":\"Flower\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-11T08:18:10.516Z\"}', 1.00, 10.00, '2026-10-11 08:18:10'),
(21, 39, 5, 'b9a3a1ec2cfec6af', '{\"student_id\":5,\"answers\":{\"312\":\"Petal\",\"313\":\"Cabbage\",\"314\":\"Broccoli\",\"315\":\"Flower\",\"316\":\"Branch\",\"317\":\"Kale\",\"318\":\"Stone\",\"319\":\"Celery\",\"320\":\"Fruit\",\"321\":\"Seed\"},\"detail\":[{\"question_id\":312,\"given\":\"Petal\",\"correct\":false,\"points\":1},{\"question_id\":313,\"given\":\"Cabbage\",\"correct\":false,\"points\":1},{\"question_id\":314,\"given\":\"Broccoli\",\"correct\":false,\"points\":1},{\"question_id\":315,\"given\":\"Flower\",\"correct\":true,\"points\":1},{\"question_id\":316,\"given\":\"Branch\",\"correct\":false,\"points\":1},{\"question_id\":317,\"given\":\"Kale\",\"correct\":false,\"points\":1},{\"question_id\":318,\"given\":\"Stone\",\"correct\":false,\"points\":1},{\"question_id\":319,\"given\":\"Celery\",\"correct\":true,\"points\":1},{\"question_id\":320,\"given\":\"Fruit\",\"correct\":false,\"points\":1},{\"question_id\":321,\"given\":\"Seed\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-11T08:28:21.449Z\"}', 2.00, 10.00, '2026-10-11 08:28:21'),
(22, 40, 5, '064b997b94f6138d', '{\"student_id\":5,\"answers\":{\"322\":\"stem\",\"323\":\"root\",\"324\":\"sun\",\"325\":\"sprout\",\"326\":\"water\"},\"detail\":[{\"question_id\":322,\"given\":\"stem\",\"correct\":false,\"points\":1},{\"question_id\":323,\"given\":\"root\",\"correct\":false,\"points\":1},{\"question_id\":324,\"given\":\"sun\",\"correct\":false,\"points\":1},{\"question_id\":325,\"given\":\"sprout\",\"correct\":false,\"points\":1},{\"question_id\":326,\"given\":\"water\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-11T08:46:04.799Z\"}', 0.00, 5.00, '2026-10-11 08:46:04'),
(23, 41, 5, '94d70f4fd4d7d969', '{\"student_id\":5,\"answers\":{\"327\":\"sprout\",\"328\":\"sun\",\"329\":\"water\",\"330\":\"leaf\",\"331\":\"pollen\"},\"detail\":[{\"question_id\":327,\"given\":\"sprout\",\"correct\":false,\"points\":1},{\"question_id\":328,\"given\":\"sun\",\"correct\":false,\"points\":1},{\"question_id\":329,\"given\":\"water\",\"correct\":false,\"points\":1},{\"question_id\":330,\"given\":\"leaf\",\"correct\":false,\"points\":1},{\"question_id\":331,\"given\":\"pollen\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-11T09:03:17.434Z\"}', 0.00, 5.00, '2026-10-11 09:03:17'),
(24, 54, 5, 'dda716f67e87bbdd', '{\"student_id\":5,\"answers\":{\"343\":\"asdsada\",\"344\":\"Bai\"},\"detail\":[{\"question_id\":343,\"given\":\"asdsada\",\"correct\":true,\"points\":1},{\"question_id\":344,\"given\":\"Bai\",\"correct\":false,\"points\":1}],\"scored_at\":\"2026-10-11T16:55:38.794Z\"}', 1.00, 2.00, '2026-10-11 16:55:38'),
(25, 58, 5, '352480c911c7d7b0', '{\"student_id\":5,\"answers\":{\"405\":\"Input device\",\"406\":\"DHT11 sensor\",\"407\":\"Nearby objects\",\"408\":\"Light and brightness\",\"409\":\"Human or animal movement\",\"410\":\"output\",\"411\":\"outdoor\",\"412\":\"released\",\"413\":\"wheel\",\"414\":\"accuracy\",\"415\":\"afagg\",\"416\":\"fagagaga\",\"417\":\"sfsgsg\",\"418\":\"dndnd\",\"419\":\"iubi\"},\"detail\":[{\"question_id\":405,\"given\":\"Input device\",\"correct\":true,\"points\":1},{\"question_id\":406,\"given\":\"DHT11 sensor\",\"correct\":true,\"points\":1},{\"question_id\":407,\"given\":\"Nearby objects\",\"correct\":true,\"points\":1},{\"question_id\":408,\"given\":\"Light and brightness\",\"correct\":true,\"points\":1},{\"question_id\":409,\"given\":\"Human or animal movement\",\"correct\":true,\"points\":1},{\"question_id\":410,\"given\":\"output\",\"correct\":false,\"points\":1},{\"question_id\":411,\"given\":\"outdoor\",\"correct\":false,\"points\":1},{\"question_id\":412,\"given\":\"released\",\"correct\":true,\"points\":1},{\"question_id\":413,\"given\":\"wheel\",\"correct\":false,\"points\":1},{\"question_id\":414,\"given\":\"accuracy\",\"correct\":true,\"points\":1},{\"question_id\":415,\"given\":\"afagg\",\"correct\":null,\"points\":2},{\"question_id\":416,\"given\":\"fagagaga\",\"correct\":null,\"points\":2},{\"question_id\":417,\"given\":\"sfsgsg\",\"correct\":null,\"points\":2},{\"question_id\":418,\"given\":\"dndnd\",\"correct\":null,\"points\":2},{\"question_id\":419,\"given\":\"iubi\",\"correct\":null,\"points\":2}],\"scored_at\":\"2026-10-12T15:55:22.242Z\"}', 7.00, 20.00, '2026-10-12 15:55:22'),
(26, 59, 53, 'be1cb50890c27039', '{\"student_id\":53,\"answers\":{\"420\":\"Internet of Things\",\"421\":\"Operating system for multitasking\",\"422\":\"ESP32\",\"423\":\"LDR (photosensitive resistor)\",\"424\":\"Convert electrical signal to physical action\",\"425\":\"True\",\"426\":\"True\",\"427\":\"False\",\"428\":\"True\",\"429\":\"True\",\"430\":\"Bluetooth\",\"431\":\"electrical\",\"432\":\"PIR\",\"433\":\"modules\",\"434\":\"smart\",\"435\":\"Microwave oven\",\"436\":\"Single Board Computer\",\"437\":\"Passive buzzer\",\"438\":\"PIR motion sensor\",\"439\":\"Easy programming\"},\"detail\":[{\"question_id\":420,\"given\":\"Internet of Things\",\"correct\":true,\"points\":1},{\"question_id\":421,\"given\":\"Operating system for multitasking\",\"correct\":true,\"points\":1},{\"question_id\":422,\"given\":\"ESP32\",\"correct\":true,\"points\":1},{\"question_id\":423,\"given\":\"LDR (photosensitive resistor)\",\"correct\":true,\"points\":1},{\"question_id\":424,\"given\":\"Convert electrical signal to physical action\",\"correct\":true,\"points\":1},{\"question_id\":425,\"given\":\"True\",\"correct\":false,\"points\":1},{\"question_id\":426,\"given\":\"True\",\"correct\":true,\"points\":1},{\"question_id\":427,\"given\":\"False\",\"correct\":false,\"points\":1},{\"question_id\":428,\"given\":\"True\",\"correct\":true,\"points\":1},{\"question_id\":429,\"given\":\"True\",\"correct\":false,\"points\":1},{\"question_id\":430,\"given\":\"Bluetooth\",\"correct\":true,\"points\":1},{\"question_id\":431,\"given\":\"electrical\",\"correct\":true,\"points\":1},{\"question_id\":432,\"given\":\"PIR\",\"correct\":true,\"points\":1},{\"question_id\":433,\"given\":\"modules\",\"correct\":false,\"points\":1},{\"question_id\":434,\"given\":\"smart\",\"correct\":true,\"points\":1},{\"question_id\":435,\"given\":\"Microwave oven\",\"correct\":true,\"points\":1},{\"question_id\":436,\"given\":\"Single Board Computer\",\"correct\":true,\"points\":1},{\"question_id\":437,\"given\":\"Passive buzzer\",\"correct\":true,\"points\":1},{\"question_id\":438,\"given\":\"PIR motion sensor\",\"correct\":true,\"points\":1},{\"question_id\":439,\"given\":\"Easy programming\",\"correct\":true,\"points\":1}],\"scored_at\":\"2026-10-13T07:02:03.298Z\"}', 16.00, 20.00, '2026-10-13 07:02:03');

-- --------------------------------------------------------

--
-- Table structure for table `sms_queue`
--

CREATE TABLE `sms_queue` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `body` varchar(500) NOT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `attempts` int(11) NOT NULL DEFAULT 0,
  `last_error` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sms_queue`
--

INSERT INTO `sms_queue` (`id`, `parent_id`, `student_id`, `phone`, `body`, `status`, `attempts`, `last_error`, `created_at`, `sent_at`) VALUES
(1, 3, 5, '09708668466', 'ConnectED: John Carter — Present (AM session), Grade 1-A, 2026-10-10.', 'sent', 1, NULL, '2026-10-09 23:42:39', '2026-10-09 23:42:40'),
(2, 3, 5, '09708668466', 'ConnectED: John Carter scored 3/5 on Nouns & Verbs Quiz.', 'sent', 1, NULL, '2026-10-10 00:12:37', '2026-10-10 00:12:37'),
(3, 3, 5, '09708668466', 'ConnectED: John Carter scored 2/5 on Nouns and Verbs Quiz.', 'sent', 1, NULL, '2026-10-10 01:25:59', '2026-10-10 01:26:00'),
(4, 3, 5, '09708668466', 'ConnectED: John Carter — Absent (AM session), Grade 1-A, 2026-10-10.', 'sent', 1, NULL, '2026-10-10 03:18:09', '2026-10-10 03:18:10'),
(5, 3, 5, '09708668466', 'ConnectED: John Carter scored 1/5 on Nouns and Verbs Quiz.', 'sent', 1, NULL, '2026-10-11 06:25:53', '2026-10-11 06:25:55'),
(6, 3, 5, '09708668466', 'ConnectED: John Carter scored 10/30 on Munting Pagsusulit: Nouns and Verbs.', 'sent', 1, NULL, '2026-10-11 07:43:49', '2026-10-11 07:43:50'),
(7, 3, 5, '09708668466', 'ConnectED: John Carter scored 1/10 on Parts of Plants We Eat Quiz.', 'sent', 1, NULL, '2026-10-11 08:18:10', '2026-10-11 08:18:11'),
(8, 3, 5, '09708668466', 'ConnectED: John Carter scored 2/10 on Parts of Plants We Eat Quiz.', 'sent', 1, NULL, '2026-10-11 08:28:21', '2026-10-11 08:28:22'),
(9, 3, 5, '09708668466', 'ConnectED: John Carter scored 0/5 on Parts of Plants We Eat Quiz.', 'sent', 1, NULL, '2026-10-11 08:46:04', '2026-10-11 08:46:05'),
(10, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A) is due Oct 11, 2026, 10:25 PM. It is not submitted yet.', 'sent', 1, NULL, '2026-10-11 13:25:48', '2026-10-11 13:25:50'),
(11, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A) is due Oct 12, 2026, 10:09 PM. It is not submitted yet.', 'sent', 1, NULL, '2026-10-11 14:09:23', '2026-10-11 14:09:26'),
(12, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A) is due Oct 12, 2026, 10:50 PM. It is not submitted yet.', 'sent', 2, NULL, '2026-10-11 14:50:56', '2026-10-11 14:50:58'),
(13, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A). Due Oct 12, 2026, 11:27 PM. Open: http://localhost:5000/activity/a80cee4d60dc45ca', 'sent', 1, NULL, '2026-10-11 15:24:38', '2026-10-11 15:24:39'),
(14, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A) is due Oct 12, 2026, 11:27 PM. It is not submitted yet.', 'sent', 1, NULL, '2026-10-11 15:27:07', '2026-10-11 15:27:08'),
(15, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A). Due Oct 12, 2026, 11:27 PM. Open: http://localhost:5000/activity/a80cee4d60dc45ca', 'sent', 1, NULL, '2026-10-11 15:28:14', '2026-10-11 15:28:15'),
(16, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A). Due Oct 14, 2026, 11:29 PM. Open: http://localhost:5000/activity/52937fd85c870974', 'sent', 1, NULL, '2026-10-11 15:29:59', '2026-10-11 15:30:00'),
(17, 3, 5, '09708668466', 'ConnectED: John Carter — Present (PM session), Grade 1-A, 2026-10-11.', 'sent', 1, NULL, '2026-10-11 15:33:15', '2026-10-11 15:33:16'),
(18, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A). Due Oct 12, 2026, 11:53 PM. Open: http://localhost:5000/activity/7506ba53a147920e', 'sent', 1, NULL, '2026-10-11 15:53:20', '2026-10-11 15:53:22'),
(19, 3, 5, '09708668466', 'ConnectED: Activity \"Activity — Plants\" for John Carter (Grade 1-A) is due Oct 12, 2026, 11:53 PM. It is not submitted yet.', 'sent', 1, NULL, '2026-10-11 15:53:49', '2026-10-11 15:53:50'),
(20, 3, 5, '09708668466', 'ConnectED: John Carter, Grade 1-A. Plants due Oct 12, 11:53 PM. http://localhost:5000/activity/7506ba53a147920e', 'sent', 1, NULL, '2026-10-11 16:01:06', '2026-10-11 16:01:07'),
(21, 3, 5, '09708668466', 'ConnectED: John Carter scored 1/2 on Noun.', 'sent', 1, NULL, '2026-10-11 16:55:38', '2026-10-11 16:55:39'),
(22, 3, 5, '09708668466', 'ConnectED: John Carter scored 7/20 on Grade 1 Science Quiz: IoT Sensors.', 'sent', 1, NULL, '2026-10-12 15:55:22', '2026-10-12 15:55:23'),
(23, 3, 53, '09708668466', 'ConnectED: Eric Tanya scored 16/20 on IoT Basics Quiz.', 'sent', 1, NULL, '2026-10-13 07:02:03', '2026-10-13 07:02:04');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `lrn` varchar(12) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `grade_level` int(11) NOT NULL,
  `section` varchar(10) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('M','F') DEFAULT NULL,
  `STATUS` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `lrn`, `first_name`, `middle_name`, `last_name`, `grade_level`, `section`, `dob`, `gender`, `STATUS`, `created_at`, `deleted_at`) VALUES
(5, '123443222222', 'John', 'M', 'Carter', 1, 'A', NULL, 'F', 'active', '2026-08-17 05:12:58', NULL),
(7, '125544433333', 'Jenny', NULL, 'Talagtag', 4, 'SAMPAGUITA', NULL, 'M', 'active', '2026-10-07 06:52:41', NULL),
(8, '202600000001', 'Liam', 'A', 'Almonte', 1, 'Diligence', '2019-01-01', 'M', 'active', '2026-10-10 00:01:57', NULL),
(9, '202600000002', 'Sofia', 'B', 'Atanacio', 1, 'Faith', '2019-02-02', 'F', 'active', '2026-10-10 00:01:57', NULL),
(10, '202600000003', 'Mateo', 'C', 'Bachiller', 1, 'Hope', '2019-03-03', 'M', 'active', '2026-10-10 00:01:57', NULL),
(11, '202600000004', 'Isla', 'D', 'Barce', 1, 'Honesty', '2019-04-04', 'F', 'active', '2026-10-10 00:01:57', NULL),
(12, '202600000005', 'Noah', 'E', 'Beloro', 1, 'Humility', '2019-05-05', 'M', 'active', '2026-10-10 00:01:57', NULL),
(13, '202600000006', 'Amara', 'F', 'Bermillo', 1, 'Kindness', '2019-06-06', 'F', 'active', '2026-10-10 00:01:57', NULL),
(14, '202600000007', 'Luca', 'G', 'Cabañes', 1, 'Love', '2019-07-07', 'M', 'active', '2026-10-10 00:01:57', NULL),
(15, '202600000008', 'Elena', 'H', 'Cabangon', 1, 'Patience', '2019-08-08', 'F', 'active', '2026-10-10 00:01:57', NULL),
(16, '202600000009', 'Owen', 'I', 'Conejos', 1, 'Peace', '2019-09-09', 'M', 'active', '2026-10-10 00:01:57', NULL),
(17, '202600000010', 'Mia', 'J', 'Cruz', 1, 'Diligence', '2019-10-10', 'F', 'active', '2026-10-10 00:01:57', NULL),
(18, '202600000011', 'Caleb', 'K', 'Dapito', 1, 'Faith', '2019-11-11', 'M', 'active', '2026-10-10 00:01:57', NULL),
(19, '202600000012', 'Aria', 'L', 'Dayupay', 1, 'Hope', '2019-12-12', 'F', 'active', '2026-10-10 00:01:57', NULL),
(20, '202600000013', 'Ethan', 'M', 'De Villa', 1, 'Honesty', '2019-01-13', 'M', 'active', '2026-10-10 00:01:57', NULL),
(21, '202600000014', 'Lila', 'N', 'Dimaiwat', 1, 'Humility', '2019-02-14', 'F', 'active', '2026-10-10 00:01:57', NULL),
(22, '202600000015', 'Hugo', 'O', 'Ibanita', 1, 'Kindness', '2019-03-15', 'M', 'active', '2026-10-10 00:01:57', NULL),
(23, '202600000016', 'Nora', 'P', 'Ibarrientos', 1, 'Love', '2019-04-16', 'F', 'active', '2026-10-10 00:01:57', NULL),
(24, '202600000017', 'Felix', 'Q', 'Ibias', 1, 'Patience', '2019-05-17', 'M', 'active', '2026-10-10 00:01:57', NULL),
(25, '202600000018', 'Clara', 'R', 'Isaac', 1, 'Peace', '2019-06-18', 'F', 'active', '2026-10-10 00:01:57', NULL),
(26, '202600000019', 'Ivan', 'S', 'Jarrett', 2, 'Courage', '2018-07-19', 'M', 'active', '2026-10-10 00:01:57', NULL),
(27, '202600000020', 'Jade', 'T', 'Labios', 2, 'Respect', '2018-08-20', 'F', 'active', '2026-10-10 00:01:57', NULL),
(28, '202600000021', 'Oscar', 'U', 'Lavapie', 2, 'Courage', '2018-09-21', 'M', 'active', '2026-10-10 00:01:57', NULL),
(29, '202600000022', 'Ruby', 'V', 'Llorin', 2, 'Respect', '2018-10-22', 'F', 'active', '2026-10-10 00:01:57', NULL),
(30, '202600000023', 'Nico', 'W', 'Manaog', 2, 'Courage', '2018-11-23', 'M', 'active', '2026-10-10 00:01:57', NULL),
(31, '202600000024', 'Thea', 'X', 'Maninang', 2, 'Respect', '2018-12-24', 'F', 'active', '2026-10-10 00:01:57', NULL),
(32, '202600000025', 'Andre', 'Y', 'Monge', 3, 'Diamond', '2017-01-25', 'M', 'active', '2026-10-10 00:01:57', NULL),
(33, '202600000026', 'Pia', 'Z', 'Nagrampa', 3, 'Diamond', '2017-02-26', 'F', 'active', '2026-10-10 00:01:57', NULL),
(34, '202600000027', 'Leo', 'A', 'Negrito', 3, 'Diamond', '2017-03-27', 'M', 'active', '2026-10-10 00:01:57', NULL),
(35, '202600000028', 'Hanna', 'B', 'Oliveros', 3, 'Diamond', '2017-04-01', 'F', 'active', '2026-10-10 00:01:57', NULL),
(36, '202600000029', 'Marco', 'C', 'Ong', 3, 'Diamond', '2017-05-02', 'M', 'active', '2026-10-10 00:01:57', NULL),
(37, '202600000030', 'Elise', 'D', 'Oronan', 4, 'Banyan', '2016-06-03', 'F', 'active', '2026-10-10 00:01:57', NULL),
(38, '202600000031', 'Paolo', 'E', 'Petalver', 4, 'Narra', '2016-07-04', 'M', 'active', '2026-10-10 00:01:57', NULL),
(39, '202600000032', 'Nina', 'F', 'Pili', 4, 'Banyan', '2016-08-05', 'F', 'active', '2026-10-10 00:01:57', NULL),
(40, '202600000033', 'Simon', 'G', 'Protomartir', 4, 'Narra', '2016-09-06', 'M', 'active', '2026-10-10 00:01:57', NULL),
(41, '202600000034', 'Vera', 'H', 'Puso', 4, 'Banyan', '2016-10-07', 'F', 'active', '2026-10-10 00:01:57', NULL),
(42, '202600000035', 'Rafael', 'I', 'Rebulado', 4, 'Narra', '2016-11-08', 'M', 'active', '2026-10-10 00:01:57', NULL),
(43, '202600000036', 'Cora', 'J', 'Serdan', 4, 'Banyan', '2016-12-09', 'F', 'active', '2026-10-10 00:01:57', NULL),
(44, '202600000037', 'Diego', 'K', 'Sergio', 4, 'Narra', '2016-01-10', 'M', 'active', '2026-10-10 00:01:57', NULL),
(45, '202600000038', 'Willa', 'L', 'Solsona', 5, 'Canary', '2015-02-11', 'F', 'active', '2026-10-10 00:01:57', NULL),
(46, '202600000039', 'Enzo', 'M', 'Tan', 5, 'Canary', '2015-03-12', 'M', 'active', '2026-10-10 00:01:57', NULL),
(47, '202600000040', 'Iris', 'N', 'Tangelon', 5, 'Canary', '2015-04-13', 'F', 'active', '2026-10-10 00:01:57', NULL),
(48, '202600000041', 'Bruno', 'O', 'Tubig', 5, 'Canary', '2015-05-14', 'M', 'active', '2026-10-10 00:01:57', NULL),
(49, '202600000042', 'Ada', 'P', 'Vargas', 6, 'Maya', '2014-06-15', 'F', 'active', '2026-10-10 00:01:57', NULL),
(50, '202600000043', 'Carlo', 'Q', 'Verona', 6, 'Maya', '2014-07-16', 'M', 'active', '2026-10-10 00:01:57', NULL),
(51, '202600000044', 'June', 'R', 'Villamer', 6, 'Maya', '2014-08-17', 'F', 'active', '2026-10-10 00:01:57', NULL),
(52, '202600000045', 'Emilio', 'S', 'Zorilla', 6, 'Maya', '2014-09-18', 'M', 'active', '2026-10-10 00:01:57', NULL),
(53, '123123812048', 'Eric', NULL, 'Tanya', 5, 'KALAW', NULL, 'M', 'active', '2026-10-13 06:23:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `CODE` varchar(20) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `applicable_grades` varchar(20) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `CODE`, `NAME`, `description`, `applicable_grades`, `deleted_at`) VALUES
(12, 'IT 213', 'Math', 'Problem-solving', '1-6', NULL),
(13, 'SCIENCE', 'Science', 'Botany, Physics', '1-6', NULL),
(14, 'AP', 'Araling Panlipunan', 'History, Society, Law', NULL, NULL),
(15, 'MAPEH', 'Music, Arts, PE, Health', 'Music, Arts, PE, Health', NULL, NULL),
(18, '112', 'Filipino', NULL, '1-6', NULL),
(19, '241', 'Makabansa', NULL, '1-6', NULL),
(20, 'GMRC', 'GMRC', NULL, '1-6', NULL),
(21, 'REL', 'Religion', NULL, '1-6', NULL),
(22, 'GEOM', 'Geometry', NULL, '1-6', NULL),
(23, 'GEOG', 'Geography', NULL, '1-6', NULL),
(24, 'READ', 'Reading', NULL, '1-6', NULL),
(25, 'COMP', 'Computer', NULL, '4-6', NULL),
(26, 'TLE', 'TLE', NULL, '4-6', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teacher_assignments`
--

CREATE TABLE `teacher_assignments` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `grade_level` int(11) NOT NULL,
  `section` varchar(10) NOT NULL,
  `school_year` varchar(20) DEFAULT '2025-2026',
  `slot` enum('adviser','assistant','subject') NOT NULL DEFAULT 'subject'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_assignments`
--

INSERT INTO `teacher_assignments` (`id`, `teacher_id`, `subject_id`, `grade_level`, `section`, `school_year`, `slot`) VALUES
(1, 2, NULL, 1, 'A', '2025-2026', 'adviser'),
(3, 4, NULL, 2, 'Bonifacio', '2025-2026', 'adviser'),
(10, 6, 13, 5, 'NARRA', '2025-2026', 'subject'),
(12, 7, 13, 4, 'ORANGE', '2025-2026', 'subject'),
(13, 7, 14, 5, 'NARRA', '2025-2026', 'subject'),
(14, 8, NULL, 2, 'Bonifacio', '2025-2026', 'adviser'),
(15, 8, 12, 2, 'Bonifacio', '2025-2026', 'subject'),
(16, 8, 13, 2, 'Bonifacio', '2025-2026', 'subject'),
(18, 2, NULL, 1, 'A', '2025-2026', 'adviser'),
(19, 13, NULL, 4, 'SAMPAGUITA', '2025-2026', 'adviser'),
(20, 13, 18, 4, 'SAMPAGUITA', '2025-2026', 'subject'),
(21, 13, 12, 4, 'SAMPAGUITA', '2025-2026', 'subject'),
(22, 13, 13, 4, 'SAMPAGUITA', '2025-2026', 'subject'),
(23, 13, 15, 5, 'NARRA', '2025-2026', 'subject'),
(24, 7, NULL, 4, 'ORANGE', '2025-2026', 'adviser'),
(25, 2, NULL, 1, 'A', '2025-2026', 'adviser'),
(26, 13, NULL, 4, 'SAMPAGUITA', '2025-2026', 'adviser'),
(27, 17, 15, 5, 'B', '2025-2026', 'subject'),
(28, 90, NULL, 3, 'Rosa', '2025-2026', 'adviser'),
(29, 90, 12, 3, 'Rosa', '2025-2026', 'subject'),
(30, 90, 13, 3, 'Rosa', '2025-2026', 'subject'),
(31, 90, 18, 3, 'Rosa', '2025-2026', 'subject'),
(32, 23, NULL, 1, 'Diligence', '2025-2026', 'adviser'),
(33, 23, 12, 1, 'Diligence', '2025-2026', 'subject'),
(34, 23, 13, 1, 'Diligence', '2025-2026', 'subject'),
(35, 23, 18, 1, 'Diligence', '2025-2026', 'subject'),
(36, 23, 19, 1, 'Diligence', '2025-2026', 'subject'),
(37, 23, 20, 1, 'Diligence', '2025-2026', 'subject'),
(38, 23, 21, 1, 'Diligence', '2025-2026', 'subject'),
(39, 23, 22, 1, 'Diligence', '2025-2026', 'subject'),
(40, 23, 23, 1, 'Diligence', '2025-2026', 'subject'),
(41, 23, 24, 1, 'Diligence', '2025-2026', 'subject'),
(42, 24, NULL, 1, 'Faith', '2025-2026', 'adviser'),
(43, 24, 12, 1, 'Faith', '2025-2026', 'subject'),
(44, 24, 13, 1, 'Faith', '2025-2026', 'subject'),
(45, 24, 18, 1, 'Faith', '2025-2026', 'subject'),
(46, 24, 19, 1, 'Faith', '2025-2026', 'subject'),
(47, 24, 20, 1, 'Faith', '2025-2026', 'subject'),
(48, 24, 21, 1, 'Faith', '2025-2026', 'subject'),
(49, 24, 22, 1, 'Faith', '2025-2026', 'subject'),
(50, 24, 23, 1, 'Faith', '2025-2026', 'subject'),
(51, 24, 24, 1, 'Faith', '2025-2026', 'subject'),
(52, 25, NULL, 1, 'Hope', '2025-2026', 'adviser'),
(53, 25, 12, 1, 'Hope', '2025-2026', 'subject'),
(54, 25, 13, 1, 'Hope', '2025-2026', 'subject'),
(55, 25, 18, 1, 'Hope', '2025-2026', 'subject'),
(56, 25, 19, 1, 'Hope', '2025-2026', 'subject'),
(57, 25, 20, 1, 'Hope', '2025-2026', 'subject'),
(58, 25, 21, 1, 'Hope', '2025-2026', 'subject'),
(59, 25, 22, 1, 'Hope', '2025-2026', 'subject'),
(60, 25, 23, 1, 'Hope', '2025-2026', 'subject'),
(61, 25, 24, 1, 'Hope', '2025-2026', 'subject'),
(62, 26, NULL, 1, 'Honesty', '2025-2026', 'adviser'),
(63, 26, 12, 1, 'Honesty', '2025-2026', 'subject'),
(64, 26, 13, 1, 'Honesty', '2025-2026', 'subject'),
(65, 26, 18, 1, 'Honesty', '2025-2026', 'subject'),
(66, 26, 19, 1, 'Honesty', '2025-2026', 'subject'),
(67, 26, 20, 1, 'Honesty', '2025-2026', 'subject'),
(68, 26, 21, 1, 'Honesty', '2025-2026', 'subject'),
(69, 26, 22, 1, 'Honesty', '2025-2026', 'subject'),
(70, 26, 23, 1, 'Honesty', '2025-2026', 'subject'),
(71, 26, 24, 1, 'Honesty', '2025-2026', 'subject'),
(72, 27, NULL, 1, 'Humility', '2025-2026', 'adviser'),
(73, 27, 12, 1, 'Humility', '2025-2026', 'subject'),
(74, 27, 13, 1, 'Humility', '2025-2026', 'subject'),
(75, 27, 18, 1, 'Humility', '2025-2026', 'subject'),
(76, 27, 19, 1, 'Humility', '2025-2026', 'subject'),
(77, 27, 20, 1, 'Humility', '2025-2026', 'subject'),
(78, 27, 21, 1, 'Humility', '2025-2026', 'subject'),
(79, 27, 22, 1, 'Humility', '2025-2026', 'subject'),
(80, 27, 23, 1, 'Humility', '2025-2026', 'subject'),
(81, 27, 24, 1, 'Humility', '2025-2026', 'subject'),
(82, 28, NULL, 1, 'Kindness', '2025-2026', 'adviser'),
(83, 28, 12, 1, 'Kindness', '2025-2026', 'subject'),
(84, 28, 13, 1, 'Kindness', '2025-2026', 'subject'),
(85, 28, 18, 1, 'Kindness', '2025-2026', 'subject'),
(86, 28, 19, 1, 'Kindness', '2025-2026', 'subject'),
(87, 28, 20, 1, 'Kindness', '2025-2026', 'subject'),
(88, 28, 21, 1, 'Kindness', '2025-2026', 'subject'),
(89, 28, 22, 1, 'Kindness', '2025-2026', 'subject'),
(90, 28, 23, 1, 'Kindness', '2025-2026', 'subject'),
(91, 28, 24, 1, 'Kindness', '2025-2026', 'subject'),
(92, 29, NULL, 1, 'Love', '2025-2026', 'adviser'),
(93, 29, 12, 1, 'Love', '2025-2026', 'subject'),
(94, 29, 13, 1, 'Love', '2025-2026', 'subject'),
(95, 29, 18, 1, 'Love', '2025-2026', 'subject'),
(96, 29, 19, 1, 'Love', '2025-2026', 'subject'),
(97, 29, 20, 1, 'Love', '2025-2026', 'subject'),
(98, 29, 21, 1, 'Love', '2025-2026', 'subject'),
(99, 29, 22, 1, 'Love', '2025-2026', 'subject'),
(100, 29, 23, 1, 'Love', '2025-2026', 'subject'),
(101, 29, 24, 1, 'Love', '2025-2026', 'subject'),
(102, 30, NULL, 1, 'Patience', '2025-2026', 'adviser'),
(103, 30, 12, 1, 'Patience', '2025-2026', 'subject'),
(104, 30, 13, 1, 'Patience', '2025-2026', 'subject'),
(105, 30, 18, 1, 'Patience', '2025-2026', 'subject'),
(106, 30, 19, 1, 'Patience', '2025-2026', 'subject'),
(107, 30, 20, 1, 'Patience', '2025-2026', 'subject'),
(108, 30, 21, 1, 'Patience', '2025-2026', 'subject'),
(109, 30, 22, 1, 'Patience', '2025-2026', 'subject'),
(110, 30, 23, 1, 'Patience', '2025-2026', 'subject'),
(111, 30, 24, 1, 'Patience', '2025-2026', 'subject'),
(112, 31, NULL, 1, 'Peace', '2025-2026', 'adviser'),
(113, 31, 12, 1, 'Peace', '2025-2026', 'subject'),
(114, 31, 13, 1, 'Peace', '2025-2026', 'subject'),
(115, 31, 18, 1, 'Peace', '2025-2026', 'subject'),
(116, 31, 19, 1, 'Peace', '2025-2026', 'subject'),
(117, 31, 20, 1, 'Peace', '2025-2026', 'subject'),
(118, 31, 21, 1, 'Peace', '2025-2026', 'subject'),
(119, 31, 22, 1, 'Peace', '2025-2026', 'subject'),
(120, 31, 23, 1, 'Peace', '2025-2026', 'subject'),
(121, 31, 24, 1, 'Peace', '2025-2026', 'subject'),
(122, 32, NULL, 2, 'Courage', '2025-2026', 'adviser'),
(123, 32, 12, 2, 'Courage', '2025-2026', 'subject'),
(124, 32, 13, 2, 'Courage', '2025-2026', 'subject'),
(125, 32, 18, 2, 'Courage', '2025-2026', 'subject'),
(126, 32, 19, 2, 'Courage', '2025-2026', 'subject'),
(127, 32, 20, 2, 'Courage', '2025-2026', 'subject'),
(128, 32, 21, 2, 'Courage', '2025-2026', 'subject'),
(129, 32, 22, 2, 'Courage', '2025-2026', 'subject'),
(130, 32, 23, 2, 'Courage', '2025-2026', 'subject'),
(131, 32, 24, 2, 'Courage', '2025-2026', 'subject'),
(132, 33, NULL, 2, 'Respect', '2025-2026', 'adviser'),
(133, 33, 12, 2, 'Respect', '2025-2026', 'subject'),
(134, 33, 13, 2, 'Respect', '2025-2026', 'subject'),
(135, 33, 18, 2, 'Respect', '2025-2026', 'subject'),
(136, 33, 19, 2, 'Respect', '2025-2026', 'subject'),
(137, 33, 20, 2, 'Respect', '2025-2026', 'subject'),
(138, 33, 21, 2, 'Respect', '2025-2026', 'subject'),
(139, 33, 22, 2, 'Respect', '2025-2026', 'subject'),
(140, 33, 23, 2, 'Respect', '2025-2026', 'subject'),
(141, 33, 24, 2, 'Respect', '2025-2026', 'subject'),
(142, 34, NULL, 3, 'Diamond', '2025-2026', 'adviser'),
(143, 34, 12, 3, 'Diamond', '2025-2026', 'subject'),
(144, 34, 13, 3, 'Diamond', '2025-2026', 'subject'),
(145, 34, 18, 3, 'Diamond', '2025-2026', 'subject'),
(146, 34, 19, 3, 'Diamond', '2025-2026', 'subject'),
(147, 34, 20, 3, 'Diamond', '2025-2026', 'subject'),
(148, 34, 21, 3, 'Diamond', '2025-2026', 'subject'),
(149, 34, 22, 3, 'Diamond', '2025-2026', 'subject'),
(150, 34, 23, 3, 'Diamond', '2025-2026', 'subject'),
(151, 34, 24, 3, 'Diamond', '2025-2026', 'subject'),
(152, 91, 22, 4, 'Banyan', '2025-2026', 'subject'),
(153, 93, NULL, 6, 'Maya', '2025-2026', 'adviser'),
(154, 93, 18, 6, 'Maya', '2025-2026', 'subject'),
(155, 93, 19, 6, 'Maya', '2025-2026', 'subject'),
(156, 93, 25, 6, 'Maya', '2025-2026', 'subject'),
(157, 95, NULL, 5, 'KALAW', '2025-2026', 'adviser'),
(158, 95, 18, 5, 'KALAW', '2025-2026', 'subject'),
(159, 95, 19, 5, 'KALAW', '2025-2026', 'subject'),
(160, 95, 25, 5, 'KALAW', '2025-2026', 'subject'),
(165, 96, NULL, 5, 'KALAW', '2025-2026', 'assistant'),
(166, 96, 23, 5, 'KALAW', '2025-2026', 'subject'),
(167, 96, 22, 5, 'KALAW', '2025-2026', 'subject'),
(168, 96, 20, 5, 'KALAW', '2025-2026', 'subject'),
(169, 97, NULL, 3, 'GOLD', '2025-2026', 'adviser'),
(170, 97, 18, 3, 'GOLD', '2025-2026', 'subject'),
(171, 97, 19, 3, 'GOLD', '2025-2026', 'subject'),
(172, 97, 23, 3, 'GOLD', '2025-2026', 'subject'),
(173, 97, 12, 3, 'GOLD', '2025-2026', 'subject'),
(174, 97, 13, 3, 'GOLD', '2025-2026', 'subject'),
(175, 97, 13, 5, 'KALAW', '2025-2026', 'subject');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_profiles`
--

CREATE TABLE `teacher_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `teaching_mode` enum('homeroom','subject','class_adviser','subject_teacher','both') DEFAULT 'homeroom',
  `homeroom_grade` int(11) DEFAULT NULL,
  `homeroom_section` varchar(10) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `subjects_taught` longtext DEFAULT NULL,
  `grades_handled` longtext DEFAULT NULL,
  `homeroom_role` enum('adviser','assistant') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_profiles`
--

INSERT INTO `teacher_profiles` (`id`, `user_id`, `teaching_mode`, `homeroom_grade`, `homeroom_section`, `specialization`, `subjects_taught`, `grades_handled`, `homeroom_role`) VALUES
(1, 2, 'class_adviser', 1, 'A', NULL, NULL, NULL, 'adviser'),
(2, 4, 'class_adviser', 2, 'Bonifacio', NULL, NULL, '[2]', 'adviser'),
(3, 5, 'homeroom', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 6, 'subject_teacher', NULL, NULL, NULL, '[13]', '[5]', NULL),
(5, 7, 'both', 4, 'ORANGE', NULL, '[13,14]', '[4,5]', 'adviser'),
(6, 8, 'both', 2, 'Bonifacio', NULL, '[12,13]', '[2]', 'adviser'),
(7, 13, 'both', 4, 'SAMPAGUITA', NULL, '[18,12,13,15]', '[4,5]', 'adviser'),
(8, 17, 'subject_teacher', NULL, NULL, NULL, '[15]', '[5]', NULL),
(9, 19, 'homeroom', NULL, NULL, NULL, '[12,13,18]', '[3]', NULL),
(10, 23, 'both', 1, 'Diligence', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(11, 24, 'both', 1, 'Faith', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(12, 25, 'both', 1, 'Hope', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(13, 26, 'both', 1, 'Honesty', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(14, 27, 'both', 1, 'Humility', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(15, 28, 'both', 1, 'Kindness', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(16, 29, 'both', 1, 'Love', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(17, 30, 'both', 1, 'Patience', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(18, 31, 'both', 1, 'Peace', NULL, '[12,13,18,19,20,21,22,23,24]', '[1]', 'adviser'),
(19, 32, 'both', 2, 'Courage', NULL, '[12,13,18,19,20,21,22,23,24]', '[2]', 'adviser'),
(20, 33, 'both', 2, 'Respect', NULL, '[12,13,18,19,20,21,22,23,24]', '[2]', 'adviser'),
(21, 34, 'both', 3, 'Diamond', NULL, '[12,13,18,19,20,21,22,23,24]', '[3]', 'adviser'),
(22, 90, 'both', 3, 'Rosa', NULL, NULL, NULL, 'adviser'),
(23, 91, 'subject_teacher', NULL, NULL, NULL, '[22]', '[4]', NULL),
(24, 93, 'class_adviser', 6, 'Maya', NULL, '[18,19,25]', '[6]', 'adviser'),
(25, 95, 'class_adviser', 5, 'KALAW', NULL, '[18,19,25]', '[5]', 'adviser'),
(26, 96, 'class_adviser', 5, 'KALAW', NULL, '[23,22,20]', '[5]', 'assistant'),
(27, 97, 'both', 3, 'GOLD', NULL, '[18,19,23,12,13]', '[3,5]', 'adviser');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','teacher','parent') NOT NULL,
  `STATUS` enum('active','inactive') DEFAULT 'active',
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar_url` varchar(500) DEFAULT NULL,
  `token_version` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `role`, `STATUS`, `must_change_password`, `created_at`, `avatar_url`, `token_version`) VALUES
(1, 'System', 'Admin', 'admin@usant.edu.ph', '$2b$10$gendTIOhcEpY2aOOGg7w6.tmx7LlclD/6dht.TuujqjUjAlXX9l2i', '09170000000', 'admin', 'active', 0, '2026-08-05 11:08:03', '/assets/avatars/user_1_1786804257846.jpg', 0),
(2, 'Agnes', 'Cepe', 'agnesj.cepe@usant.edu.ph', '$2b$10$tfWf9284K5P09yNUWInQ7OGIe9vq5pZflZST./ItZjzknAAnZOi3m', '09123456789', 'teacher', 'active', 0, '2026-08-05 11:53:45', NULL, 0),
(3, 'Cindy', 'Beralde', 'ciberalde@usant.edu', '$2b$10$uZAaHLY9sNFUeEKDHY26KOpwIP80H1vyEyGFt9TbSQT/K/Vtm1DVa', '09708668466', 'parent', 'active', 0, '2026-08-05 12:13:58', '/assets/avatars/user_3_1786367888467.jpg', 0),
(4, 'Ligaya', 'Haha', 'ligaya@usant.edu.ph', '$2b$10$RjYc5BT.PWiOLyi5AyHYAOy/IBaFIlnhOvlGX.e26bMPby.9sEZNC', '09912345678', 'teacher', 'inactive', 0, '2026-08-05 13:53:59', NULL, 0),
(5, 'Bernadette', 'Cepe', 'badette@usant.edu.ph', '$2b$10$nLP3yOV9vPtG39qFQkePY.LF9Vkzd6lQ9VZiW2m8l2X/J..t7ubPq', '72817491378591', 'teacher', 'inactive', 0, '2026-08-05 13:57:20', NULL, 0),
(6, 'Jobert', 'Follero', 'jobert@usant.edu.ph', '$2b$10$2Q1tWwNWLzcPjBeqGl2ueu0oZIZEqNaMALqIyMVMNpVgx5KvmqOLm', '09123123123', 'teacher', 'active', 0, '2026-08-14 02:32:17', NULL, 0),
(7, 'Jane', 'Doe', 'janedoe@usant.edu.ph', '$2b$10$rhH/17fzTLtIXYqyplVyruG.ad2EOyYBjQcFAlAnxyRnoY/xnFHcC', '09915521939', 'teacher', 'inactive', 0, '2026-08-15 03:02:46', NULL, 0),
(8, 'John', 'Doe', 'johndoe@usant.edu.ph', '$2b$10$2c9uUd/HHSrTObOEthZ6wuM6u9KwRRdNKYonQIDOvZgW2RUqaktdW', '0991255678439', 'teacher', 'inactive', 0, '2026-08-15 07:33:36', NULL, 0),
(13, 'Sindi', 'Bireldi', 'sindi@usant.edu.ph', '$2b$10$ZR/55wgx/RqSdj9Ua0CNz.7VFm0n5hKBuaWeDQ.gUh9F/HPbuZIdq', '09123423452', 'teacher', 'active', 0, '2026-10-03 00:25:40', NULL, 0),
(14, 'Sample', 'Parent', 'sample.parent@usant.edu', '$2b$10$81U8SbAziIFfnzY..BbZEu3x4BSy9XB37eNIlcg2Mdk7gEVwKTeSu', '09171234567', 'parent', 'inactive', 1, '2026-10-09 21:28:16', NULL, 0),
(15, 'Sample', 'Parent Two', 'sample.parent2@usant.edu', '$2b$10$P2vqGpGahBDfpSrLV5Q2O.WOA5hGeNrSTqGJ8Ux264JdfW1z9pRla', '09171234568', 'parent', 'inactive', 1, '2026-10-09 21:28:17', NULL, 0),
(16, 'Sample', 'Parent Three', 'sample.parent3@usant.edu', '$2b$10$GG7ThS2.40OxcYkgn3lLVOkMRdtihALequbHAijIpIftnwNGIE0AK', '09171234569', 'parent', 'inactive', 1, '2026-10-09 21:28:18', NULL, 0),
(17, 'Sample', 'Teacher', 'sample.teacher@usant.edu', '$2b$10$zBxUKmSzqoXJthLFqC/1wOUUmLD1fhg11qfe7PsxQF51QcRdPnF9i', '09182234567', 'teacher', 'active', 1, '2026-10-09 21:28:20', NULL, 0),
(19, 'Sample', 'Adviser', 'sample.adviser@usant.edu', '$2b$10$Rfkf5OQOVNoPZM.YwMfPbObL0Hukuc8/HQVeRl8nsVQJj5xshHT/m', '09182234568', 'teacher', 'inactive', 1, '2026-10-09 21:28:20', NULL, 0),
(23, 'Jonaly', 'Catangui', 'jonalycatangui@usant.edu.ph', '$2b$10$s5nCflMZud42NweugzrO8OhrRZpDGfEspArgBhsJfBEp.O.F6M4Ra', '09486077274', 'teacher', 'active', 1, '2026-10-09 23:55:35', NULL, 0),
(24, 'Daisy', 'De La Rama', 'daisy@usant.edu.ph', '$2b$10$7wcL65Yd3FG82eTt8tX78uh7CDL2711fFpWFSuzJ/hbzKbdJg.7Pq', '09194579301', 'teacher', 'active', 1, '2026-10-09 23:55:38', NULL, 0),
(25, 'Christine', 'Jacob', 'chrisjacob@usant.edu.ph', '$2b$10$oAXiMwsILTOTUW03L3uGWOkwxOSDuPyngmc92F29DQlCb4DvlLrtO', '09300544118', 'teacher', 'active', 1, '2026-10-09 23:55:40', NULL, 0),
(26, 'Trazcy', 'Cabaltera', 'trazcy.cabaltera@usant.edu.ph', '$2b$10$8sVvTGG7g.DGPAKOYNGCfOxttXgprYnKmst1fPaGM/Ttb8cKJy1K2', '09454889008', 'teacher', 'active', 1, '2026-10-09 23:55:42', NULL, 0),
(27, 'Maria', 'Parce', 'marialuzon@usant.edu.ph', '$2b$10$FkdYbGn6gHRshxxlf/wDReHpddn86Kpr9iAfroDalTIixqoamKqmC', '09852217491', 'teacher', 'active', 1, '2026-10-09 23:55:46', NULL, 0),
(28, 'Freda', 'Ely', 'fredaely28@usant.edu.ph', '$2b$10$5KqXgIzytFMkar.OmS6S0OBJYMP25pCuFUWn29qWTDJeN4MWKsV3i', '09392918279', 'teacher', 'active', 1, '2026-10-09 23:55:47', NULL, 0),
(29, 'Jesy', 'Serrano', 'jesyserrano@usant.edu.ph', '$2b$10$3Ob5YmjiKyUqtelTZOErBOH6oIa7fgqx8JvQREfE5.2p0xy68soNy', '09989217308', 'teacher', 'active', 1, '2026-10-09 23:55:50', NULL, 0),
(30, 'Rechelle', 'Magistrado', 'rechelle.magistrado@usant.edu.ph', '$2b$10$kVOHjSQkv6CA4/casKOCHeZd25vkW03DGdOldeSt4nBrtAuv.vx9m', '09219488338', 'teacher', 'active', 1, '2026-10-09 23:55:50', NULL, 0),
(31, 'Vivian', 'Landagan', 'landaganvivian9@usant.edu.ph', '$2b$10$zFxXcy02CE7NqlvseiiOveERRWNP2DnOQuMLg8XgVHR7jR1pG9WIy', '09948435323', 'teacher', 'active', 1, '2026-10-09 23:55:53', NULL, 0),
(32, 'Judy', 'Iballar', 'judyiballar21@usant.edu.ph', '$2b$10$3.v/0iTNLQtt3J3oCpOr6uM82nXpBBsdk0Wm2muEJxFLmDA5tVvrO', '09671400815', 'teacher', 'active', 1, '2026-10-09 23:55:54', NULL, 0),
(33, 'Kimbie', 'Iballa', 'kimbie.iballa@usant.edu.ph', '$2b$10$U6YeBkTj.ZtWhA6TLpWWv.1Rcwu/GYpV7xZVkPOJ5kHPjd.xkKhI2', '09095930347', 'teacher', 'active', 1, '2026-10-09 23:55:57', NULL, 0),
(34, 'Janiela', 'Tagum', 'tagumjaniela@usant.edu.ph', '$2b$10$UQga7WxRZhkGICltkrHBjurV8LWIxcw8eQ5s0thHsi5OzRtQ6gDpK', '09482014382', 'teacher', 'active', 1, '2026-10-09 23:55:58', NULL, 0),
(35, 'Ma. Renaflor Glaiza', 'Almonte', 'luv_0814@yahoo.com', '$2b$10$q0XwBIL4MD33jzF60E7n8ONAeRsIp9k0/0DusculKVjAMCSZb.z9K', '09171340090', 'parent', 'active', 1, '2026-10-09 23:56:00', NULL, 0),
(36, 'Gyne Ruth', 'Atanacio', 'gyneruth@gmail.com', '$2b$10$zBln05K0D0e3QZGFfQIKPOcT4RJ41fWFBkL3.hl3MG/uiD24EdgPC', '09880098898', 'parent', 'active', 1, '2026-10-09 23:56:04', NULL, 0),
(37, 'Marianette', 'Bachiller', 'bachillerarablle@gmail.com', '$2b$10$FC9ZQfeyoWKee0CZQQRdwO1rIq02f2UKZ3pKLOvsA811oaG/cGrFO', '09672672125', 'parent', 'active', 1, '2026-10-09 23:56:06', NULL, 0),
(38, 'Renee Mae', 'Barce', 'maebarce0712@gmail.com', '$2b$10$2uIRcyHJsbYwNWhbYF9zyu.kcUTYJ59gD0iz8zV9nuh4wzY3ZkTHm', '09932140366', 'parent', 'active', 1, '2026-10-09 23:56:08', NULL, 0),
(39, 'Mark Anthony', 'Beloro', 'Beloromark800@gmail.com', '$2b$10$6iHBwCx6v6SmEKEmI50/LOkhhcpslE9vy3yePcj3imIIrtJCi1SW2', '09975215243', 'parent', 'active', 1, '2026-10-09 23:56:08', NULL, 0),
(40, 'Loreneil', 'Bermillo', 'loreneilbermillo23@gmail.com', '$2b$10$2PPf9O4hIdtxgKwmfjpwY.X6J3uAbNk6Mqqmw.IFi0e.3MZGxH7wu', '09930319833', 'parent', 'active', 1, '2026-10-09 23:56:09', NULL, 0),
(41, 'Joy', 'CabaÃ±es', 'joy.bayson35@gmail.com', '$2b$10$gU3.a2KoIsworbponnRrReS/6QZMUtaL5B7V9jqsutVbaf/LIf3iq', '09917845007', 'parent', 'active', 1, '2026-10-09 23:56:11', NULL, 0),
(43, 'Elisalve', 'Cabangon', 'cabangonelisalve@gmail.com', '$2b$10$wz2Jc4hD1bWWify4m4GPseGieDF9ngfFQJWiy5ZEbGrZJqCSdwQjS', '09914943418', 'parent', 'active', 1, '2026-10-09 23:56:12', NULL, 0),
(44, 'Ma. Cristina', 'Conejos', 'macristina.conejos001@gmail.com', '$2b$10$OrMqAtf/usovrUj8K7mF.e1yVl9oyoFxWdRrWV9eaHYICe.3fA1Nm', '09938918784', 'parent', 'active', 1, '2026-10-09 23:56:15', NULL, 0),
(46, 'Jenny', 'Cruz', 'cruzjennyvie28@gmail.com', '$2b$10$YnkgoAjgLLkXzCmsUdDZFesweZi7g3qBgboPJNvrDE2HyhuWa.3eG', '09998288225', 'parent', 'active', 1, '2026-10-09 23:56:16', NULL, 0),
(47, 'Joy Anne', 'Dapito', 'joyannesalvadora.dapito@gmail.com', '$2b$10$AcPoXFirnV5NDOzf0DTf0eExKlihOw4xZDboEGpD0zCpJKFixxH3y', '09478580319', 'parent', 'active', 1, '2026-10-09 23:56:17', NULL, 0),
(48, 'Joan', 'Dayupay', 'annedayupay7@gmail.com', '$2b$10$HI07YNxOpwMW.m7njsFaYeSJ/MCZnKFMpqd/m0K6MFOAh14THWSLq', '09489615505', 'parent', 'active', 1, '2026-10-09 23:56:19', NULL, 0),
(49, 'Leora', 'De Villa', 'zimrialeor1234@gmail.com', '$2b$10$DJHE4MGpVaDSTw7kfOBqdOsNeEeERUh3WWTQUImrAelfEOCKTXf1i', '09095248531', 'parent', 'active', 1, '2026-10-09 23:56:19', NULL, 0),
(50, 'Rosabel', 'Dimaiwat', 'Bing101485@gmail.com', '$2b$10$GLhXd4vGS2dzzFYoXW2Y2OOcCwFphKI35NyyDmskEn2f1eear6y82', '09682400606', 'parent', 'active', 1, '2026-10-09 23:56:21', NULL, 0),
(51, 'Babylene', 'Ibanita', 'asea1013@gmail.com', '$2b$10$XbxCTE4w08d0aO.VpJun8OdS5EK9xCb4r61MNA2.COxmJQa6Q9pMG', '09638466115', 'parent', 'active', 1, '2026-10-09 23:56:22', NULL, 0),
(52, 'Betsy', 'Ibarrientos', 'betsiful@gmail.com', '$2b$10$mhLxKu74tYETY60cehKCfu6/SC8wAkXUiOn.sBjGgfTx6AXzA6zTC', '09480374884', 'parent', 'active', 1, '2026-10-09 23:56:23', NULL, 0),
(53, 'Leslie', 'Ibias', 'christinecedron@gmail.com', '$2b$10$1PETKDHnsxCLVjMzw.LPMuXSEM26/Y32FywGG4kaRBiTpq2ww582O', '09095166800', 'parent', 'active', 1, '2026-10-09 23:56:24', NULL, 0),
(54, 'Roxanne Marie', 'Isaac', 'roxannemarieisaac@gmail.com', '$2b$10$FVuHo.2sUbzhJvHI/nCYGeAq3ffqgoZ0qiqAw0f9VUGQzCF5Bu72a', '09121511942', 'parent', 'active', 1, '2026-10-09 23:56:26', NULL, 0),
(55, 'Mary Grace', 'Jarrett', 'gracetabusao09@gmail.com', '$2b$10$8C47w9KafnsRuAJFfp0PkuwvScWv3J.JEMBz.w/6I2VGgDRX37cy.', '09127804068', 'parent', 'active', 1, '2026-10-09 23:56:26', NULL, 0),
(56, 'Shierra May', 'Labios', 'rshierra27@gmail.com', '$2b$10$5IahYmQx0gdDAW/MvzLmTu3oUPCiv61qHznwc.owSL752xJOoDWRm', '09351014764', 'parent', 'active', 1, '2026-10-09 23:56:27', NULL, 0),
(57, 'Lailanie', 'Lavapie', 'lmarcziajazlaine@gmail.com', '$2b$10$rCuzw3A6U6EobIr3RdVZYu8lZkiqLVOBcpsKb9Qdk7rIaCp8fyf/a', '09203215119', 'parent', 'active', 1, '2026-10-09 23:56:29', NULL, 0),
(59, 'Ginalyn', 'Llorin', 'ginalynllorin25@gmail.com', '$2b$10$9v/rbo//DEHM1pq1n8BgPu/UbqMLFsjM71u0WbPI5jRiRc2vbH5zC', '09485728637', 'parent', 'active', 1, '2026-10-09 23:56:30', NULL, 0),
(60, 'Alina', 'Manaog', 'ahavechaina@gmail.com', '$2b$10$HFtjMxhS3EYR8skIuPuhMOZdAf55SXA8j/6ZH5RfTczSHyCgjIrdq', '09123458700', 'parent', 'active', 1, '2026-10-09 23:56:31', NULL, 0),
(61, 'Joana', 'Maninang', 'garenezekielm@gmail.com', '$2b$10$rRmG0hwL2z/odccn3h1vm.ObWt8bAJL8OINw0bmaO7TEnrMGvEACK', '09915527884', 'parent', 'active', 1, '2026-10-09 23:56:33', NULL, 0),
(62, 'Cherissa Mae', 'Monge', 'cherissamae.pagsaligan@gmail.com', '$2b$10$EQCKUKyZi.Dh4hRvf9q/PORtn.GZED1rx43BI3Ce7Oah8nzZA832S', '09914110663', 'parent', 'active', 1, '2026-10-09 23:56:33', NULL, 0),
(63, 'Mikee', 'Nagrampa', 'Mikee_Nagrampa@yahoo.com', '$2b$10$xpslMMdxAKG2aMScEjoqkOtrAIHHzqD5jcIFIZN1wR0lrZnnSM5s6', '09206990069', 'parent', 'active', 1, '2026-10-09 23:56:35', NULL, 0),
(64, 'Nestle Ann', 'Negrito', 'nestlegarcia09@gmail.com', '$2b$10$aSs9d5VKjuuKaSiHSjzjheA/pmPmr3loNVEng05y5eOVBMmT1Jwfe', '09267532894', 'parent', 'active', 1, '2026-10-09 23:56:36', NULL, 0),
(65, 'Sarah Jane', 'Oliveros', 'sarahjane.gabarda@gmail.com', '$2b$10$PRMut9yf7JFJ0eJ7hS6ZvuNJA.igv/zfTzVIkwHDxFoHUMTDHSi3K', '09380029779', 'parent', 'active', 1, '2026-10-09 23:56:37', NULL, 0),
(66, 'Regine', 'Ong', 'regine@gmail.com', '$2b$10$pW1jcnubG6q4xPB6na.AtuvQDNOc4q6t/SUdUW7zIoiIFCxadSE.O', '09915611815', 'parent', 'active', 1, '2026-10-09 23:56:39', NULL, 0),
(67, 'Mcniel', 'Oronan', 'mcnielbarra@yahoo.com', '$2b$10$ZLkciDIzSuplfdFsAsWrt.rmyko6NON4176TblyTM4LxV.19l.o2y', '09499088934', 'parent', 'active', 1, '2026-10-09 23:56:40', NULL, 0),
(69, 'Labyrenth Kay', 'Petalver', 'labyrinya@gmail.com', '$2b$10$wkOXu.hNATFP5mITScxT3ehYY8AVv1iCPmOhsI0HQFgVRn4dsse9S', '09291091585', 'parent', 'active', 1, '2026-10-09 23:56:41', NULL, 0),
(70, 'May Louise', 'Pili', 'vyanlanz@gmail.com', '$2b$10$RtC2AKdnjU9kt.4CIgtwbuUeue4xhin7HWCiyoUZ8DphDVTfgbEmu', '09157702113', 'parent', 'active', 1, '2026-10-09 23:56:43', NULL, 0),
(71, 'Monette', 'Protomartir', 'monetteprotomartir@gmail.com', '$2b$10$eFOkDPnaC8GKwPwMnW1U7../b9Z5ivIJMRbAGn9c18jvuasH5SnZO', '09608531499', 'parent', 'active', 1, '2026-10-09 23:56:44', NULL, 0),
(72, 'Marsha', 'Puso', 'marshanaborpuso1621@gmail.com', '$2b$10$puHlRD7OoDJs6B4iz2qbquAOsCtd5DZzP3NsTB6CuyJq97T.rew8i', '09816264678', 'parent', 'active', 1, '2026-10-09 23:56:45', NULL, 0),
(73, 'PeÃ±afrancia', 'Rebulado', 'penafranciarebulado@gmail.com', '$2b$10$wO2O00/Sm/d9m0L/iZd6zu96/yb0IxKeNhm7SFXdYhw/BkMoKxoBK', '09218927040', 'parent', 'active', 1, '2026-10-09 23:56:46', NULL, 0),
(74, 'Michelle', 'Serdan', 'michelleserdan212@gmail.com', '$2b$10$PlGW4Mhrw9QfyTdGYf3Gz.WSW6OaU8tKNLo0cGkmf/6PXGrYM1t9.', '09994811787', 'parent', 'active', 1, '2026-10-09 23:56:48', NULL, 0),
(76, 'Mailyn', 'Sergio', 'mailyn_oliva@yahoo.com', '$2b$10$uSYaNTLfHfNsmiP6pOA58echDmy5HZyIsvReHmrBL8NoWZLrNSSZK', '09095689859', 'parent', 'active', 1, '2026-10-09 23:56:49', NULL, 0),
(77, 'Joanna Jean', 'Solsona', 'joannajsolsona@gmail.com', '$2b$10$7fAzrXlr754De52CXEJXAOvumlK4kc9e0WjHa2TOjqVt8vjkXoCl.', '09810034018', 'parent', 'active', 1, '2026-10-09 23:56:52', NULL, 0),
(79, 'Emerose', 'Tan', 'Tanemerose1@gmail.com', '$2b$10$n5aPN.OzKzOqp7P5DaBOlen.2iljCJKi5vl97VSL1FOIzW52xntgu', '09109120032', 'parent', 'active', 1, '2026-10-09 23:56:52', NULL, 0),
(81, 'Vilma', 'Tangelon', 'vilma.iriga@gmail.com', '$2b$10$ctZcQeG0TpUcJv.50u.mMe8vdHAxmcsmfuG9aWP0Hqgw9n/jcHgT.', '09397692557', 'parent', 'active', 1, '2026-10-09 23:56:53', NULL, 0),
(82, 'Jinky', 'Tubig', 'jinky.tubig@gmail.com', '$2b$10$t8oTUQYWpKTc3pSowsQlt.gmXLSADQ9nQnIH.pfEb9NxmQAoTSIfW', '09497783753', 'parent', 'active', 1, '2026-10-09 23:56:55', NULL, 0),
(83, 'Julie Ann', 'Vargas', 'gablie_jules@yahoo.com', '$2b$10$sGMXxR.mW4RLYr4R5.PNbusAzvmbUifVeZcq4rakNVYr3AsdT4zsi', '09162565300', 'parent', 'active', 1, '2026-10-09 23:56:56', NULL, 0),
(85, 'Lea Katrine', 'Verona', 'lkverona@cspc.edu.ph', '$2b$10$DBZRnmqhg6Es4uH.lWsYHOKZ/M1eJZDQFAvvJlvtL4ex5FPqueSPq', '09491318237', 'parent', 'active', 1, '2026-10-09 23:56:57', NULL, 0),
(86, 'Daryleen', 'Villamer', 'daryleen@gmail.com', '$2b$10$wEnRVQUzn2fHjKjEfot9guaeODpSX8ATjqX34CBVco1ifcweQSytC', '09423083793', 'parent', 'active', 1, '2026-10-09 23:57:00', NULL, 0),
(88, 'Agnes', 'Zorilla', 'agneszorilla@gmail.com', '$2b$10$.3zOy5Py4cW3Z5D8NbZ/F.IDaH16ZV8p1ox0vnlpPNfgNkH4SxMHW', '09472524636', 'parent', 'active', 1, '2026-10-09 23:57:01', NULL, 0),
(90, 'yuguyg', 'yfyfyf', 'ouhouho@gmailcom', '$2b$10$BXJi7FRESrTJjsS/iz3T8ObARFl.ym/sBYRkVwACKpBhRLi0De.di', NULL, 'teacher', 'active', 1, '2026-10-10 00:06:03', NULL, 0),
(91, 'Argill', 'Bonita', 'agnesjoycepe@usant.edu.ph', '$2b$10$ppFoxMiK21KrhWEFuBzoFOHRlRGIdN88SFNdeV1mtQ.Yy7J7mRQ9K', '09915521939', 'teacher', 'active', 0, '2026-10-10 01:33:48', NULL, 0),
(93, 'Alice', 'Johnson', 'alice@usant.edu.ph', '$2b$10$gWBFk4H5F6q.divva3S0ge8qbj/2miW253xgqIdItcTDmI3XLP0fq', '09107197030', 'teacher', 'active', 1, '2026-10-13 04:24:05', NULL, 0),
(95, 'Jobert', 'Follero', 'jfollero@usant.edu.ph', '$2b$10$CANXdSKn//3EOIT0236d7uiA0PMxZYEK0jccNzT/Judb8aSbFAa66', '09107197030', 'teacher', 'active', 0, '2026-10-13 04:55:44', NULL, 0),
(96, 'Albert', 'Polly', 'albert@usant.edu.ph', '$2b$10$Q9gKgC7jGLbWNXwjiaWeiOCXBC82b4QqozApPvEiw1OnnW3lUUirK', '09153983889', 'teacher', 'active', 1, '2026-10-13 04:57:32', NULL, 0),
(97, 'Kyla', 'Tog', 'kyla@usant.edu.ph', '$2b$10$mxOBl1rGJXapb0KmnO7Ea.iY0MBe2dyaE5l/vG1/YlQ6uPOSMps7y', '09231512321', 'teacher', 'active', 0, '2026-10-13 05:01:56', NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_due_notices`
--
ALTER TABLE `activity_due_notices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_activity_due_notice` (`assessment_id`,`student_id`,`parent_id`,`closes_at`);

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ai_rec_teacher` (`teacher_id`,`status`),
  ADD KEY `idx_ai_rec_lesson` (`lesson_plan_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD PRIMARY KEY (`user_id`,`announcement_id`),
  ADD KEY `announcement_id` (`announcement_id`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_assessments_share_token` (`share_token`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `assessment_questions`
--
ALTER TABLE `assessment_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aq_assessment` (`assessment_id`),
  ADD KEY `idx_aq_bank` (`question_bank_id`);

--
-- Indexes for table `assessment_scores`
--
ALTER TABLE `assessment_scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assessment_id` (`assessment_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_attendance_slot` (`student_id`,`DATE`,`session`,`subject_key`),
  ADD KEY `idx_attendance_student` (`student_id`),
  ADD KEY `idx_attendance_subject` (`subject_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `concerns`
--
ALTER TABLE `concerns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `concern_reads`
--
ALTER TABLE `concern_reads`
  ADD PRIMARY KEY (`user_id`,`concern_id`),
  ADD KEY `idx_concern_reads_concern` (`concern_id`);

--
-- Indexes for table `concern_replies`
--
ALTER TABLE `concern_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_concern_replies_concern` (`concern_id`),
  ADD KEY `idx_concern_replies_sender` (`sender_id`);

--
-- Indexes for table `inbox_trash`
--
ALTER TABLE `inbox_trash`
  ADD PRIMARY KEY (`user_id`,`item_type`,`item_id`),
  ADD KEY `idx_inbox_trash_user` (`user_id`,`emptied`);

--
-- Indexes for table `lesson_plans`
--
ALTER TABLE `lesson_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `parent_profiles`
--
ALTER TABLE `parent_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `parent_student_links`
--
ALTER TABLE `parent_student_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `parent_id` (`parent_id`,`student_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `question_bank`
--
ALTER TABLE `question_bank`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_qb_teacher` (`teacher_id`,`status`),
  ADD KEY `idx_qb_set` (`quiz_set_id`);

--
-- Indexes for table `quiz_sets`
--
ALTER TABLE `quiz_sets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_qs_teacher` (`teacher_id`,`status`),
  ADD KEY `idx_qs_grade` (`teacher_id`,`grade_level`);

--
-- Indexes for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_quiz_sub_assessment_student` (`assessment_id`,`student_id`),
  ADD KEY `idx_quiz_sub_token` (`share_token`);

--
-- Indexes for table `sms_queue`
--
ALTER TABLE `sms_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sms_status_created` (`status`,`created_at`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lrn` (`lrn`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CODE` (`CODE`),
  ADD UNIQUE KEY `uq_subjects_name` (`NAME`);

--
-- Indexes for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_ta_grade_section` (`grade_level`,`section`);

--
-- Indexes for table `teacher_profiles`
--
ALTER TABLE `teacher_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_due_notices`
--
ALTER TABLE `activity_due_notices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4662;

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=325;

--
-- AUTO_INCREMENT for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `assessment_questions`
--
ALTER TABLE `assessment_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=440;

--
-- AUTO_INCREMENT for table `assessment_scores`
--
ALTER TABLE `assessment_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `concerns`
--
ALTER TABLE `concerns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `concern_replies`
--
ALTER TABLE `concern_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lesson_plans`
--
ALTER TABLE `lesson_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `parent_profiles`
--
ALTER TABLE `parent_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `parent_student_links`
--
ALTER TABLE `parent_student_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `question_bank`
--
ALTER TABLE `question_bank`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=397;

--
-- AUTO_INCREMENT for table `quiz_sets`
--
ALTER TABLE `quiz_sets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `sms_queue`
--
ALTER TABLE `sms_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=176;

--
-- AUTO_INCREMENT for table `teacher_profiles`
--
ALTER TABLE `teacher_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD CONSTRAINT `announcement_reads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_reads_ibfk_2` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assessments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_scores`
--
ALTER TABLE `assessment_scores`
  ADD CONSTRAINT `assessment_scores_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assessment_scores_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `concerns`
--
ALTER TABLE `concerns`
  ADD CONSTRAINT `concerns_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `concerns_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `concerns_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lesson_plans`
--
ALTER TABLE `lesson_plans`
  ADD CONSTRAINT `lesson_plans_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lesson_plans_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `parent_profiles`
--
ALTER TABLE `parent_profiles`
  ADD CONSTRAINT `parent_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `parent_student_links`
--
ALTER TABLE `parent_student_links`
  ADD CONSTRAINT `parent_student_links_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `parent_student_links_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `teacher_profiles`
--
ALTER TABLE `teacher_profiles`
  ADD CONSTRAINT `teacher_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
