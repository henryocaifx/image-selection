import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export async function ensureTableExists() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS character_lora (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        lora TEXT NOT NULL,
        user_email TEXT,
        portrait_selected INTEGER,
        half_body_selected INTEGER,
        full_body_selected INTEGER,
        total_selected INTEGER,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } finally {
    client.release();
  }
}

export default pool;
