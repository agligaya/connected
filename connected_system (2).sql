-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 17, 2026 at 07:42 AM
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
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `ACTION` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_name` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `user_name`, `ACTION`, `target_type`, `target_name`, `details`, `created_at`) VALUES
(1, 1, 'System Admin', 'Updated teacher assignments', 'teacher', 'Teacher ID 5', NULL, '2026-08-14 06:26:10'),
(2, 1, 'System Admin', 'Deactivated account', 'user', 'User ID 5', NULL, '2026-08-14 06:26:26'),
(3, 1, 'System Admin', 'Deactivated account', 'user', 'User ID 4', NULL, '2026-08-14 07:03:36'),
(4, 1, 'System Admin', 'Created announcement', 'announcement', 'sgdf', 'Scope: school_wide', '2026-08-14 14:01:43'),
(5, 1, 'System Admin', 'Created announcement', 'announcement', 'frvrf', 'Scope: school_wide', '2026-08-14 14:04:22'),
(6, 1, 'System Admin', 'Created announcement', 'announcement', 'Exam Udma', 'Scope: school_wide', '2026-08-14 15:50:20'),
(7, 1, 'System Admin', 'Created account', 'teacher', 'Jane Doe', 'janedoe@usant.edu.ph', '2026-08-15 03:02:46'),
(8, 1, 'System Admin', 'Created account', 'teacher', 'John Doe', 'johndoe@usant.edu.ph', '2026-08-15 07:33:36'),
(9, 1, 'System Admin', 'Deactivated account', 'user', 'User ID 8', NULL, '2026-08-15 11:23:49'),
(10, 1, 'System Admin', 'Updated announcement', 'announcement', 'Exam Udma', 'Scope: school_wide', '2026-08-16 03:37:35'),
(11, 1, 'System Admin', 'Updated announcement', 'announcement', 'Exam Udma', 'Scope: school_wide', '2026-08-16 03:37:48'),
(12, 1, 'System Admin', 'Created announcement', 'announcement', 'dgfdgs', 'Scope: school_wide', '2026-08-16 03:38:02'),
(13, 1, 'System Admin', 'Deleted announcement', 'announcement', 'dgfdgs', NULL, '2026-08-16 03:45:22'),
(14, 1, 'System Admin', 'Updated announcement', 'announcement', 'Exam Udma', 'Scope: school_wide', '2026-08-16 03:52:53'),
(15, 1, 'System Admin', 'Deleted announcement', 'announcement', 'frvrf', NULL, '2026-08-16 08:10:11'),
(16, 1, 'System Admin', 'Created announcement', 'announcement', 'dd', 'Scope: school_wide', '2026-08-17 05:13:16'),
(17, 1, 'System Admin', 'Updated announcement', 'announcement', 'dd', 'Scope: school_wide', '2026-08-17 05:13:35');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `body` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `sender_id`, `scope`, `target_grade`, `target_section`, `priority`, `created_at`, `updated_at`, `admin_id`, `body`) VALUES
(4, 'sgdf', '', 1, 'school_wide', NULL, NULL, 'normal', '2026-08-14 14:01:43', NULL, NULL, 'sdfcs'),
(6, 'Exam Udma', '', 1, 'school_wide', NULL, NULL, 'high', '2026-08-14 15:50:20', '2026-08-16 03:52:53', NULL, 'Mag review!!!!!'),
(8, 'dd', '', 1, 'school_wide', NULL, NULL, 'normal', '2026-08-17 05:13:16', '2026-08-17 05:13:35', NULL, 'dds yan sya');

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
(1, 8, '2026-08-17 05:13:22'),
(2, 4, '2026-08-16 03:51:54'),
(2, 6, '2026-08-16 08:11:35');

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
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assessment_scores`
--

CREATE TABLE `assessment_scores` (
  `id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `DATE` date NOT NULL,
  `STATUS` enum('Present','Absent','Late') NOT NULL,
  `recorded_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 3, 'San Vicente Ogbon, Nabua, Camarines Sur', '09708668466');

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
(5, 3, 5, '2026-08-17 05:12:58');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `lrn`, `first_name`, `middle_name`, `last_name`, `grade_level`, `section`, `dob`, `gender`, `STATUS`, `created_at`) VALUES
(5, '123443222222', 'Cams', 'M', 'Lasr', 1, 'A', NULL, 'F', 'active', '2026-08-17 05:12:58');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `CODE` varchar(20) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `applicable_grades` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `CODE`, `NAME`, `description`, `applicable_grades`) VALUES
(12, 'IT 213', 'Mathematics', 'Problem-solving', '1-6'),
(13, 'SCIENCE', 'Science', 'Botany, Physics', '1-6'),
(14, 'AP', 'Araling Panlipunan', 'History, Society, Law', '5'),
(15, 'MAPEH', 'Music, Arts, PE, Health', 'Music, Arts, PE, Health', '4-6');

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
  `school_year` varchar(20) DEFAULT '2025-2026'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_assignments`
--

INSERT INTO `teacher_assignments` (`id`, `teacher_id`, `subject_id`, `grade_level`, `section`, `school_year`) VALUES
(1, 2, NULL, 1, 'A', '2025-2026'),
(2, 2, NULL, 1, 'Mangga', '2025-2026'),
(3, 4, NULL, 2, 'Bonifacio', '2025-2026'),
(10, 6, 13, 5, 'NARRA', '2025-2026'),
(11, 5, NULL, 1, 'Mangga', '2025-2026'),
(12, 7, 13, 4, 'ORANGE', '2025-2026'),
(13, 7, 14, 5, 'NARRA', '2025-2026'),
(14, 8, NULL, 2, 'Bonifacio', '2025-2026'),
(15, 8, 12, 2, 'Bonifacio', '2025-2026'),
(16, 8, 13, 2, 'Bonifacio', '2025-2026'),
(17, 2, NULL, 1, 'Mangga', '2025-2026'),
(18, 2, NULL, 1, 'A', '2025-2026');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_profiles`
--

CREATE TABLE `teacher_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `teaching_mode` enum('homeroom','subject') DEFAULT 'homeroom',
  `homeroom_grade` int(11) DEFAULT NULL,
  `homeroom_section` varchar(10) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `subjects_taught` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`subjects_taught`)),
  `grades_handled` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`grades_handled`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_profiles`
--

INSERT INTO `teacher_profiles` (`id`, `user_id`, `teaching_mode`, `homeroom_grade`, `homeroom_section`, `specialization`, `subjects_taught`, `grades_handled`) VALUES
(1, 2, 'homeroom', 1, 'Mangga', NULL, NULL, NULL),
(2, 4, 'homeroom', 2, 'Bonifacio', NULL, '\"English, Math\"', '\"2\"'),
(3, 5, '', 1, 'Mangga', NULL, NULL, NULL),
(4, 6, '', NULL, NULL, NULL, '[13]', '[5]'),
(5, 7, '', NULL, NULL, NULL, '[13,14]', '[4,5]'),
(6, 8, '', 2, 'Bonifacio', NULL, '[12,13]', '[2]');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `role`, `STATUS`, `created_at`, `avatar_url`) VALUES
(1, 'System', 'Admin', 'admin@usant.edu', '$2b$10$gendTIOhcEpY2aOOGg7w6.tmx7LlclD/6dht.TuujqjUjAlXX9l2i', '09170000000', 'admin', 'active', '2026-08-05 11:08:03', '/assets/avatars/user_1_1786804257846.jpg'),
(2, 'Agnes', 'Cepe', 'agnesj.cepe@usant.edu.ph', '$2b$10$tfWf9284K5P09yNUWInQ7OGIe9vq5pZflZST./ItZjzknAAnZOi3m', '09123456789', 'teacher', 'active', '2026-08-05 11:53:45', NULL),
(3, 'Cindy', 'Beralde', 'ciberalde@usant.edu', '$2b$10$uZAaHLY9sNFUeEKDHY26KOpwIP80H1vyEyGFt9TbSQT/K/Vtm1DVa', '09708668466', 'parent', 'active', '2026-08-05 12:13:58', '/assets/avatars/user_3_1786367888467.jpg'),
(4, 'Ligaya', 'Haha', 'ligaya@usant.edu.ph', '$2b$10$RjYc5BT.PWiOLyi5AyHYAOy/IBaFIlnhOvlGX.e26bMPby.9sEZNC', '09912345678', 'teacher', 'inactive', '2026-08-05 13:53:59', NULL),
(5, 'Bernadette', 'Cepe', 'badette@usant.edu.ph', '$2b$10$nLP3yOV9vPtG39qFQkePY.LF9Vkzd6lQ9VZiW2m8l2X/J..t7ubPq', '72817491378591', 'teacher', 'inactive', '2026-08-05 13:57:20', NULL),
(6, 'Jobert', 'Follero', 'jobert@usant.edu.ph', '$2b$10$2Q1tWwNWLzcPjBeqGl2ueu0oZIZEqNaMALqIyMVMNpVgx5KvmqOLm', '09123123123', 'teacher', 'active', '2026-08-14 02:32:17', NULL),
(7, 'Jane', 'Doe', 'janedoe@usant.edu.ph', '$2b$10$rhH/17fzTLtIXYqyplVyruG.ad2EOyYBjQcFAlAnxyRnoY/xnFHcC', '09915521939', 'teacher', 'active', '2026-08-15 03:02:46', NULL),
(8, 'John', 'Doe', 'johndoe@usant.edu.ph', '$2b$10$2c9uUd/HHSrTObOEthZ6wuM6u9KwRRdNKYonQIDOvZgW2RUqaktdW', '0991255678439', 'teacher', 'inactive', '2026-08-15 07:33:36', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_id` (`user_id`);

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
-- Indexes for table `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `created_by` (`created_by`);

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
  ADD UNIQUE KEY `student_id` (`student_id`,`DATE`),
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
  ADD UNIQUE KEY `CODE` (`CODE`);

--
-- Indexes for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `subject_id` (`subject_id`);

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
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assessment_scores`
--
ALTER TABLE `assessment_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `concerns`
--
ALTER TABLE `concerns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lesson_plans`
--
ALTER TABLE `lesson_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `parent_profiles`
--
ALTER TABLE `parent_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `parent_student_links`
--
ALTER TABLE `parent_student_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `teacher_profiles`
--
ALTER TABLE `teacher_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
