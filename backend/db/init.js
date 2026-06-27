import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

export async function initDatabase() {
  const schemaSql = await fs.readFile(SCHEMA_PATH, 'utf8');
  await pool.query(schemaSql);
  console.log('Database schema ready.');
}
