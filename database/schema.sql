-- ============================================================
-- University Research Opportunity Portal — Database Schema
-- ============================================================

-- Create and select database
CREATE DATABASE IF NOT EXISTS research_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE research_portal;

-- Drop table if exists (for clean re-runs)
DROP TABLE IF EXISTS opportunities;

-- ============================================================
-- Opportunities Table
-- ============================================================
CREATE TABLE opportunities (
  id                   INT           AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(255)  NOT NULL,
  description          TEXT          NOT NULL,
  research_area        VARCHAR(150)  NOT NULL,
  faculty_name         VARCHAR(150)  NOT NULL,
  department           VARCHAR(150)  NOT NULL,
  required_skills      TEXT          NOT NULL,
  available_positions  INT           NOT NULL DEFAULT 1,
  application_deadline DATE          NOT NULL,
  status               ENUM('Open','Closed') NOT NULL DEFAULT 'Open',
  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT chk_positions CHECK (available_positions >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Data — Sample research opportunities
-- ============================================================
INSERT INTO opportunities
  (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
VALUES
(
  'AI-Powered Medical Diagnosis System',
  'Develop a deep learning model to assist doctors in diagnosing diseases from medical images including X-rays, MRI scans, and CT scans. The project involves data collection, model training, and deployment of a web-based diagnostic tool.',
  'Artificial Intelligence',
  'Dr. Ayesha Tariq',
  'Computer Science',
  'Python, TensorFlow, OpenCV, REST APIs, Medical Imaging',
  3,
  '2026-12-15',
  'Open'
),
(
  'Blockchain-Based Academic Credential Verification',
  'Build a decentralized system to issue, store, and verify academic credentials on a blockchain network. This eliminates fraudulent degree certificates and streamlines employer verification processes.',
  'Blockchain & Distributed Systems',
  'Dr. Imran Hussain',
  'Computer Science',
  'Solidity, Ethereum, Node.js, Web3.js, React',
  2,
  '2026-11-30',
  'Open'
),
(
  'Smart Campus IoT Monitoring Platform',
  'Design and implement an IoT-based monitoring system for university facilities including energy consumption tracking, HVAC optimization, and occupancy detection using sensor networks.',
  'Internet of Things',
  'Prof. Sana Khan',
  'Electrical Engineering',
  'Arduino, Raspberry Pi, MQTT, Python, InfluxDB, Grafana',
  4,
  '2026-12-01',
  'Open'
),
(
  'Natural Language Processing for Urdu Text',
  'Develop NLP tools and models specifically trained for the Urdu language, including sentiment analysis, named entity recognition, and machine translation. This research addresses the gap in low-resource language processing.',
  'Natural Language Processing',
  'Dr. Fatima Malik',
  'Computer Science',
  'Python, NLTK, spaCy, Transformers, PyTorch, Linguistics',
  2,
  '2026-11-15',
  'Open'
),
(
  'Cybersecurity Threat Detection with ML',
  'Research and implement machine learning models to detect and classify network intrusions, malware, and zero-day attacks in real-time using traffic analysis and behavioral patterns.',
  'Cybersecurity',
  'Dr. Omar Farooq',
  'Computer Science',
  'Python, Scikit-learn, Network Analysis, Wireshark, Linux',
  3,
  '2026-12-20',
  'Open'
),
(
  'Autonomous Drone Navigation System',
  'Develop an autonomous navigation system for drones using computer vision and SLAM (Simultaneous Localization and Mapping) for indoor environments without GPS dependency.',
  'Robotics & Computer Vision',
  'Prof. Hassan Ali',
  'Electrical Engineering',
  'ROS, Python, C++, OpenCV, SLAM, Control Systems',
  2,
  '2026-10-31',
  'Closed'
);

-- ============================================================
-- Verify insertion
-- ============================================================
SELECT id, title, faculty_name, status FROM opportunities;
