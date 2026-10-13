-- Seed: Approved College Email Domains
-- Placement-cell-managed allowlist of approved student domains in India

INSERT INTO allowed_email_domains (domain, college_name, is_active) VALUES
('internfit.edu', 'InternFit University (Engineering Campus)', TRUE),
('nitt.edu', 'National Institute of Technology, Tiruchirappalli', TRUE),
('iitb.ac.in', 'Indian Institute of Technology Bombay', TRUE),
('iitd.ac.in', 'Indian Institute of Technology Delhi', TRUE),
('iitm.ac.in', 'Indian Institute of Technology Madras', TRUE),
('bits-pilani.ac.in', 'Birla Institute of Technology and Science, Pilani', TRUE),
('vitstudent.ac.in', 'Vellore Institute of Technology', TRUE),
('iiit.ac.in', 'International Institute of Information Technology, Hyderabad', TRUE),
('thapar.edu', 'Thapar Institute of Engineering and Technology', TRUE),
('rvce.edu.in', 'R.V. College of Engineering, Bengaluru', TRUE)
ON DUPLICATE KEY UPDATE college_name=VALUES(college_name);
