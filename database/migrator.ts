import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from server/.env if available, or process.env
const envPath = path.resolve(__dirname, '../server/.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'internfit_user',
  password: process.env.DB_PASSWORD || 'Aishu@123',
  database: process.env.DB_NAME || 'internfit_db',
  multipleStatements: true,
};

function computeChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

export async function runMigrations() {
  console.log(`[Database Migrator] Connecting to ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}...`);
  let connection: mysql.Connection;

  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (err: any) {
    console.error(`\n========================================================================`);
    console.error(`[Database Connection Error] Could not connect to MySQL.`);
    console.error(`Details: ${err.message}`);
    console.error(`\nIf you have not set up the database user yet:`);
    console.error(`1. Open MySQL Workbench (where you have an active session as root@localhost).`);
    console.error(`2. Run the script at: database/setup/create_user.sql`);
    console.error(`3. Verify credentials in server/.env`);
    console.error(`========================================================================\n`);
    throw err;
  }

  try {
    // 1. Ensure migrations tracking table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Fetch applied migrations
    const [rows] = await connection.query<any[]>(`SELECT version, name, checksum FROM schema_migrations ORDER BY id ASC`);
    const appliedMap = new Map<string, string>();
    for (const r of rows) {
      appliedMap.set(r.version, r.checksum);
    }

    // 3. Read migration files
    const migrationsDir = path.resolve(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    console.log(`[Database Migrator] Found ${files.length} migration files.`);

    for (const file of files) {
      const version = file.split('_')[0];
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const checksum = computeChecksum(sqlContent);

      if (appliedMap.has(version)) {
        const recordedChecksum = appliedMap.get(version);
        if (recordedChecksum !== checksum) {
          throw new Error(
            `CRITICAL INTEGRITY ERROR: Checksum mismatch for migration ${file}! ` +
            `Expected ${recordedChecksum}, but file has ${checksum}. ` +
            `Migrations must never be edited once applied. Safe recovery required.`
          );
        }
        console.log(`[Database Migrator] [SKIP] ${file} already applied (checksum verified).`);
      } else {
        console.log(`[Database Migrator] [APPLYING] ${file}...`);
        await connection.query(sqlContent);
        await connection.query(
          `INSERT INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)`,
          [version, file, checksum]
        );
        console.log(`[Database Migrator] [SUCCESS] ${file} applied successfully.`);
      }
    }

    console.log(`[Database Migrator] All migrations are up to date!`);
  } finally {
    await connection.end();
  }
}

export async function runSeeds() {
  console.log(`[Database Seeder] Seeding genuine data...`);
  let connection: mysql.Connection;

  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (err: any) {
    console.error(`[Database Seeder Error] Could not connect: ${err.message}`);
    throw err;
  }

  try {
    const seedsDir = path.resolve(__dirname, 'seeds');
    const seedFiles = [
      '001_seed_approved_domains.sql',
      '002_seed_real_companies.sql',
      '003_seed_real_opportunities.sql',
      '004_seed_demo_users.sql',
    ];

    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`[Database Seeder] Executing ${file}...`);
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        await connection.query(sqlContent);
        console.log(`[Database Seeder] Completed ${file}`);
      }
    }
    console.log(`[Database Seeder] Seed execution completed.`);
  } finally {
    await connection.end();
  }
}

// CLI execution
const isMain = typeof require !== 'undefined'
  ? require.main === module
  : (process.argv[1] && (process.argv[1].includes('migrator.ts') || process.argv[1].includes('migrator.js')));

if (isMain) {
  const action = process.argv[2] || 'migrate';
  if (action === 'migrate') {
    runMigrations().catch(err => {
      console.error(err);
      process.exit(1);
    });
  } else if (action === 'seed') {
    runSeeds().catch(err => {
      console.error(err);
      process.exit(1);
    });
  } else {
    console.log('Usage: ts-node database/migrator.ts [migrate|seed]');
  }
}
