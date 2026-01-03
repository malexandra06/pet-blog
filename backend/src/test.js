import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Oracle2006!',
  database: 'blog_users'
});

connection.connect((err) => {
  if (err) {
    console.error('Eroare conexiune:', err);
  } else {
    console.log('Conexiune reușită!');
    connection.end();
  }
});