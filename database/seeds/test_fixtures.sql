-- TEST FIXTURES ONLY — NEVER LOAD IN PRODUCTION
-- Isolated test data clearly labelled with [TEST_FIXTURE]

INSERT INTO companies (name, official_website_url, careers_page_url, domain, logo_url, is_known_recruiter) VALUES
('[TEST_FIXTURE] Acme Corp Testing', 'https://example-test.com', 'https://example-test.com/careers', 'example-test.com', NULL, FALSE)
ON DUPLICATE KEY UPDATE domain=VALUES(domain);

INSERT INTO internships (
  id, company_name, title, description, location, city, work_mode, duration, stipend_amount,
  is_stipend_disclosed, category, original_application_url, source_type, source_url,
  listing_status, verification_status, last_checked_at
) VALUES (
  'test-fixture-001',
  '[TEST_FIXTURE] Acme Corp Testing',
  '[TEST_FIXTURE] Quality Assurance Test Intern',
  'Automated test fixture opportunity for integration and regression testing suites.',
  'Test City, Test State',
  'Test City',
  'remote',
  '1 Month',
  '₹10,000 / month',
  TRUE,
  'paid_internship',
  'https://example-test.com/apply/qa-intern',
  'placement_cell_notice',
  'https://example-test.com/notice',
  'draft',
  'unverified',
  NOW()
) ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO internship_skills (internship_id, skill_name, skill_type) VALUES
('test-fixture-001', 'Jest', 'required'),
('test-fixture-001', 'TypeScript', 'required');
