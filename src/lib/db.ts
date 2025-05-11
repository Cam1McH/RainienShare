import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rainien',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Simple db wrapper with basic typing
export const db = {
  async query(sql: string, params?: any[]): Promise<[any[], any]> {
    try {
      const [rows] = await pool.query(sql, params);
      return [rows as any[], null];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
};