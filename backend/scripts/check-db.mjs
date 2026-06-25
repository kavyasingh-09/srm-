import pool from '../db/pool.js';

const tables = await pool.query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name`
);

console.log('Connected database:', process.env.DATABASE_URL?.replace(/:\/\/[^@]+@/, '://***@'));
console.log('Tables in public schema:', tables.rows.length ? tables.rows.map((r) => r.table_name).join(', ') : '(none)');

await pool.end();
