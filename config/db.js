// ./config/db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env variables again if needed, or rely on app.js loading it
dotenv.config({ path: path.resolve('./.env') }); 

const pool = new Pool({
  // Use environment variables for sensitive info
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, 
});

// Export the pool so app.js and routes can use it
export default pool;