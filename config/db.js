// ./config/db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env variables for local development environment
dotenv.config({ path: path.resolve('./.env') }); 


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  user: process.env.DB_USER || 'cambric4',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'members_only_db',
  password: process.env.DB_PASSWORD || 'KamasU1324!',
  port: process.env.DB_PORT || 5432, 
  
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Required by many cloud providers
    : false, 
});

// Export the pool so app.js and routes can use it
export default pool;