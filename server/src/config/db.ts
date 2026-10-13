import mysql from 'mysql2/promise';
import { config } from './env';

export let isMySQLConnected = false;
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool | null {
  return pool;
}

export async function initDatabaseConnection(): Promise<boolean> {
  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    isMySQLConnected = true;
    console.log(`[Database] Successfully connected to MySQL 8 (${config.db.name} on ${config.db.host}:${config.db.port})`);
    return true;
  } catch (err: any) {
    isMySQLConnected = false;
    console.warn(`[Database Notice] MySQL connection could not be established (${err.message}).`);
    console.warn(`To configure MySQL with least privileges:`);
    console.warn(`  1. Open MySQL Workbench (where root is connected).`);
    console.warn(`  2. Execute database/setup/create_user.sql`);
    console.warn(`  3. Run npm run db:migrate`);
    console.warn(`[Database Notice] Active fallback repository store enabled so all features remain functional.`);
    return false;
  }
}
