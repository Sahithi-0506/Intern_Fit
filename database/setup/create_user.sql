-- ====================================================================
-- InternFit — Database Setup & Least-Privilege User Provisioning
-- ====================================================================
-- INSTRUCTIONS FOR MYSQL WORKBENCH:
-- 1. Open MySQL Workbench (where you are already connected as root@localhost).
-- 2. Open a new SQL Query tab (Ctrl + T).
-- 3. Copy and paste the contents of this script.
-- 4. Execute the script (Ctrl + Shift + Enter).
-- 5. This creates the 'internfit_db' database and a dedicated 'internfit_user'.
--    It does NOT modify root credentials or affect any existing databases.
-- ====================================================================

-- 1. Create the dedicated database
CREATE DATABASE IF NOT EXISTS internfit_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create the dedicated application user (least privilege, restricted to localhost)
-- You can change the password below to any password you prefer.
-- Then set DB_PASSWORD in server/.env to match.
CREATE USER IF NOT EXISTS 'internfit_user'@'localhost'
  IDENTIFIED BY 'InternFit_App_Pass_2026!';

-- 3. Grant privileges ONLY on the internfit_db database
GRANT ALL PRIVILEGES ON internfit_db.* TO 'internfit_user'@'localhost';

-- 4. Apply privilege changes
FLUSH PRIVILEGES;

-- 5. Verify the configuration
SELECT user, host FROM mysql.user WHERE user = 'internfit_user';
SHOW GRANTS FOR 'internfit_user'@'localhost';
