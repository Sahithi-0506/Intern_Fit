-- Seed: Default Verified Demo Accounts for All 3 InternFit Roles
-- Passwords:
-- Admin / Placement Cell: admin@internfit.edu / Admin@123
-- Alumni: alumni@internfit.edu / Alumni@123
-- Student: student@internfit.edu / Student@123

INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_email_verified, is_active)
VALUES
('usr-admin-demo-001', 'admin@internfit.edu', '$2a$10$DW./6c.b8aj66aD3jfXprOJZXu8XPT/c8A19h.S8oSLLQUDnCChga', 'Prof. Ramesh', 'Sharma (Placement Cell)', 'admin_placement_cell', TRUE, TRUE),
('usr-alumni-demo-002', 'alumni@internfit.edu', '$2a$10$6HzI7QB9Uq8nE.biEEHKhuzK0lgjN1IA6FUO6WKm0NVQKGwv3gera', 'Pooja', 'Nair', 'alumni', TRUE, TRUE),
('usr-student-demo-003', 'student@internfit.edu', '$2a$10$0Ulo6HKgX11EqF96DWQbn.BH.1B/KMBTR9TE5yu7X9Zbn1Bv/V4TG', 'Aditya', 'Verma', 'student', TRUE, TRUE)
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role), is_email_verified=TRUE, is_active=TRUE;

INSERT INTO alumni_profiles (user_id, graduation_year, degree, branch, current_company, current_role, linkedin_url, verification_status, is_open_to_mentorship)
VALUES
('usr-alumni-demo-002', 2023, 'B.Tech', 'Computer Science and Engineering', 'Microsoft India', 'Software Engineer II', 'https://linkedin.com/in/pooja-nair-alumni', 'approved', TRUE)
ON DUPLICATE KEY UPDATE verification_status='approved', current_company=VALUES(current_company), current_role=VALUES(current_role);

INSERT INTO alumni_access_requests (user_id, request_note, status, decided_by_user_id, decision_notes, decided_at)
VALUES
('usr-alumni-demo-002', 'Graduated batch of 2023 CSE. Verifying Microsoft corporate badge for alumni mentorship and internship guidance.', 'approved', 'usr-admin-demo-001', 'Verified via Microsoft corporate email directory and alumni records.', NOW())
ON DUPLICATE KEY UPDATE status='approved';

INSERT INTO student_profiles (user_id, college_name, degree, branch, year_of_study, graduation_year, cgpa, has_active_backlogs, bio, linkedin_url, github_url)
VALUES
('usr-student-demo-003', 'InternFit University (Engineering Campus)', 'B.Tech', 'Computer Science and Engineering', 3, 2026, 8.75, FALSE, 'Aspiring Full Stack & Cloud Developer looking for Summer 2026 engineering internships.', 'https://linkedin.com/in/aditya-verma-student', 'https://github.com/aditya-verma')
ON DUPLICATE KEY UPDATE college_name=VALUES(college_name), cgpa=VALUES(cgpa);
