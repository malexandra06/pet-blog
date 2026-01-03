import mysql from 'mysql2';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Oracle2006!',
  database: process.env.DB_NAME || 'blog_users'
});

export default db;
