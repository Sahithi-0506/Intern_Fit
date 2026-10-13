-- Seed: Real Verified Companies Operating in India
-- Data strictly reflects official corporate domains and verified careers portals.

INSERT INTO companies (name, official_website_url, careers_page_url, domain, logo_url, is_known_recruiter) VALUES
('Microsoft India', 'https://www.microsoft.com/en-in', 'https://careers.microsoft.com/v2/global/en/home.html', 'microsoft.com', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', TRUE),
('Google India', 'https://about.google', 'https://careers.google.com/students', 'google.com', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', TRUE),
('Amazon India', 'https://www.amazon.in', 'https://www.amazon.jobs/en/teams/in-student-programs', 'amazon.jobs', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', TRUE),
('Tata Consultancy Services (TCS)', 'https://www.tcs.com', 'https://www.tcs.com/careers/india/entry-level', 'tcs.com', 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg', TRUE),
('Infosys Limited', 'https://www.infosys.com', 'https://www.infosys.com/careers/instep.html', 'infosys.com', 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg', TRUE),
('Flipkart', 'https://www.flipkart.com', 'https://www.flipkartcareers.com', 'flipkartcareers.com', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg', TRUE),
('Swiggy', 'https://www.swiggy.com', 'https://careers.swiggy.com', 'swiggy.com', 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg', TRUE),
('Wipro', 'https://www.wipro.com', 'https://careers.wipro.com/global-campus', 'wipro.com', 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Logo.svg', TRUE)
ON DUPLICATE KEY UPDATE careers_page_url=VALUES(careers_page_url);
