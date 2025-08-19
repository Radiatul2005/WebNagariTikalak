// tikalakweb/database.js
const mysql = require('mysql2/promise'); // <<< PENTING: import 'mysql2/promise'

// Konfigurasi koneksi database MySQL dari environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true, // Tunggu koneksi jika pool sedang sibuk
    connectionLimit: 10,     // Maksimal 10 koneksi pada satu waktu
    queueLimit: 0            // Antrian tak terbatas untuk koneksi
    // --- PASTIKAN TIDAK ADA typeCast ATAU decimalAsNumber: false DI SINI ---
};

// Buat connection pool
const pool = mysql.createPool(dbConfig); // <<< PENTING: gunakan createPool dari 'mysql2/promise'

// Coba koneksi saat pool dibuat untuk memastikan kredensial benar
pool.getConnection()
    .then(connection => {
        console.log('✅ Terhubung ke database MySQL (web-nagari)'); // Menggunakan nama DB Anda
        connection.release(); // Lepaskan koneksi kembali ke pool
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke database MySQL:', err.message);
        console.error('Pastikan DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT di .env sudah benar.');
        // Jika koneksi awal gagal, ada baiknya keluar dari proses aplikasi.
        process.exit(1); 
    });

module.exports = pool; // Export pool agar bisa digunakan di router