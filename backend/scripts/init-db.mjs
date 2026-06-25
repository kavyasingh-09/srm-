import { initDatabase } from '../db/init.js';
import pool from '../db/pool.js';

try {
  await initDatabase();
  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log('Tables:', tables.rows.map((r) => r.table_name).join(', ') || '(none)');
} catch (err) {
  console.error('Database init failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
