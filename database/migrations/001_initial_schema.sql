-- Migration 001: Initial Schema for InternFit
-- Description: Complete relational schema supporting authentication, domain allowlist,
-- companies, real internships, skills, applications, risk assessments, resumes,
-- alumni reviews, alumni access requests, reports, notifications, outbox, and audit logs.
-- Unified roles: 'student', 'alumni', 'admin_placement_cell'.

CREATE TABLE IF NOT EXISTS allowed_email_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  college_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('student', 'alumni', 'admin_placement_cell') NOT NULL DEFAULT 'student',
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_evt_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_prt_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  college_name VARCHAR(255) NULL,
  degree VARCHAR(100) NULL,
  branch VARCHAR(100) NULL,
  year_of_study INT NULL,
  graduation_year INT NULL,
  cgpa DECIMAL(4,2) NULL,
  has_active_backlogs BOOLEAN DEFAULT FALSE,
  bio TEXT NULL,
  linkedin_url VARCHAR(500) NULL,
  github_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alumni_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  graduation_year INT NOT NULL,
  degree VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  current_company VARCHAR(255) NOT NULL,
  current_role VARCHAR(255) NOT NULL,
  linkedin_url VARCHAR(500) NOT NULL,
  verification_status ENUM('not_requested', 'pending', 'approved', 'rejected', 'revoked') NOT NULL DEFAULT 'not_requested',
  rejection_reason TEXT NULL,
  verified_by_user_id VARCHAR(36) NULL,
  verified_at TIMESTAMP NULL,
  is_open_to_mentorship BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alumni_access_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  request_note TEXT NULL,
  status ENUM('pending', 'approved', 'rejected', 'revoked') NOT NULL DEFAULT 'pending',
  decided_by_user_id VARCHAR(36) NULL,
  decision_notes TEXT NULL,
  decided_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_aar_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  official_website_url VARCHAR(500) NOT NULL,
  careers_page_url VARCHAR(500) NULL,
  domain VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500) NULL,
  is_known_recruiter BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_companies_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS internships (
  id VARCHAR(36) PRIMARY KEY,
  company_id INT NULL,
  company_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  responsibilities LONGTEXT NULL,
  selection_process TEXT NULL,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  work_mode ENUM('onsite', 'hybrid', 'remote', 'unknown') NOT NULL DEFAULT 'onsite',
  duration VARCHAR(100) NOT NULL,
  stipend_amount VARCHAR(100) NOT NULL,
  is_stipend_disclosed BOOLEAN NOT NULL DEFAULT TRUE,
  category ENUM('paid_internship', 'unpaid_internship', 'hiring_challenge', 'coding_competition', 'prize_only', 'learning_opportunity') NOT NULL DEFAULT 'paid_internship',
  start_date VARCHAR(100) NULL,
  application_deadline DATETIME NULL,
  eligible_degrees JSON NULL,
  eligible_years JSON NULL,
  eligible_branches JSON NULL,
  min_cgpa DECIMAL(4,2) NULL,
  allows_backlogs BOOLEAN DEFAULT FALSE,
  original_application_url VARCHAR(1000) NOT NULL,
  source_type ENUM('official_careers_page', 'placement_cell_notice', 'authorized_ats', 'verified_recruiter_portal') NOT NULL DEFAULT 'official_careers_page',
  source_url VARCHAR(1000) NOT NULL,
  source_evidence_notes TEXT NULL,
  listing_status ENUM('draft', 'pending_review', 'published', 'expired', 'closed', 'rejected', 'archived') NOT NULL DEFAULT 'published',
  verification_status ENUM('unverified', 'placement_cell_verified', 'third_party_verified') NOT NULL DEFAULT 'placement_cell_verified',
  reviewed_by_user_id VARCHAR(36) NULL,
  reviewed_at TIMESTAMP NULL,
  last_checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  INDEX idx_internships_city (city),
  INDEX idx_internships_status (listing_status),
  INDEX idx_internships_deadline (application_deadline),
  INDEX idx_internships_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS internship_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  internship_id VARCHAR(36) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_type ENUM('required', 'preferred') NOT NULL DEFAULT 'required',
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
  INDEX idx_skills_name (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS internship_audit_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  internship_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_internships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  internship_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_internship (user_id, internship_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  internship_id VARCHAR(36) NOT NULL,
  status ENUM('saved', 'applied_self_reported', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn') NOT NULL DEFAULT 'applied_self_reported',
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  external_platform VARCHAR(100) NOT NULL,
  notes TEXT NULL,
  destination_domain VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_app_user_internship (user_id, internship_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
  INDEX idx_apps_user (user_id),
  INDEX idx_apps_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS application_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL,
  is_self_reported BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS url_risk_assessments (
  id VARCHAR(36) PRIMARY KEY,
  submitted_url VARCHAR(1500) NOT NULL,
  normalized_url VARCHAR(1500) NOT NULL,
  destination_domain VARCHAR(255) NOT NULL,
  final_destination_url VARCHAR(1500) NULL,
  risk_level ENUM('lower_risk', 'moderate_risk', 'high_risk', 'insufficient_evidence') NOT NULL,
  evidence_score INT NOT NULL,
  warning_signs JSON NOT NULL,
  positive_indicators JSON NOT NULL,
  official_source_evidence TEXT NULL,
  missing_evidence_notes TEXT NULL,
  is_reviewed_by_placement_cell BOOLEAN DEFAULT FALSE,
  recommendations JSON NOT NULL,
  user_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_risk_domain (destination_domain),
  INDEX idx_risk_level (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_resumes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size_bytes INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  extracted_text LONGTEXT NOT NULL,
  detected_skills JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resume_analyses (
  id VARCHAR(36) PRIMARY KEY,
  resume_id VARCHAR(36) NOT NULL,
  internship_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  matched_skills JSON NOT NULL,
  missing_skills JSON NOT NULL,
  preferred_matched_skills JSON NOT NULL,
  uncertain_skills JSON NOT NULL,
  skill_coverage_percentage DECIMAL(5,2) NOT NULL,
  eligibility_overall ENUM('eligible', 'ineligible', 'unable_to_determine') NOT NULL,
  eligibility_breakdown JSON NOT NULL,
  learning_recommendations JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES student_resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
  INDEX idx_res_an_user_int (user_id, internship_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alumni_reviews (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  internship_id VARCHAR(36) NULL,
  company_name VARCHAR(255) NOT NULL,
  review_text TEXT NOT NULL,
  application_advice TEXT NULL,
  work_culture_rating INT NULL,
  learning_rating INT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  moderation_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  moderation_notes TEXT NULL,
  reviewed_by_admin_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE SET NULL,
  INDEX idx_reviews_company (company_name),
  INDEX idx_reviews_status (moderation_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(36) PRIMARY KEY,
  reporter_user_id VARCHAR(36) NOT NULL,
  target_type ENUM('internship', 'url', 'review') NOT NULL,
  target_id VARCHAR(255) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  status ENUM('pending', 'investigating', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
  admin_notes TEXT NULL,
  resolved_by_user_id VARCHAR(36) NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'action_required') NOT NULL DEFAULT 'info',
  link VARCHAR(500) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_outbox (
  id VARCHAR(36) PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_body LONGTEXT NOT NULL,
  text_body TEXT NOT NULL,
  status ENUM('queued', 'sending', 'sent', 'failed', 'dry_run_logged') NOT NULL DEFAULT 'queued',
  retry_count INT NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_outbox_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_user_id VARCHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_user_id),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
