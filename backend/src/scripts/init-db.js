import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import { pool } from '../db/pool.js';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function initDB() {
  const sqlPath = path.join(__dirname, '..', 'migrations', 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  try {
    await pool.query(sql);
    console.log('Database initialized');
  } catch (err) {
    console.error('Failed to initialize DB', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDB();
