// lib/db.ts
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'rainien',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

