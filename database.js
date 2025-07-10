const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'web-nagari' // sesuai permintaan kamu
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Terhubung ke database web-nagari');
});

module.exports = db;
