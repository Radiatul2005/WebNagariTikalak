const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database'); // Pastikan path ini benar ke database.js Anda

// GET Login Page
router.get('/login', (req, res) => {
  res.render('admin/login');
});

// POST Login Process
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Menggunakan await karena db.query dari mysql2/promise mengembalikan Promise
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (results.length === 0) {
      return res.render('admin/login', { error: 'Username tidak ditemukan' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('admin/login', { error: 'Password salah' });
    }

    // TODO: Simpan sesi atau token di sini
    // Contoh sederhana dengan express-session: req.session.userId = user.id;

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Login DB Error:', err);
    // Render halaman login dengan pesan error internal
    return res.status(500).render('admin/login', { error: 'Terjadi kesalahan server saat login. Silakan coba lagi.' });
  }
});

// GET Dashboard - DI SINI PERUBAHANNYA
router.get('/dashboard', async (req, res) => { // Jadikan fungsi ini async
    let totalPenduduk = 0; // Inisialisasi

    try {
        // Query untuk menghitung jumlah penduduk dari tabel 'penduduk'
        const [rows] = await db.query('SELECT COUNT(id) AS total FROM penduduk');
        if (rows.length > 0) {
            totalPenduduk = rows[0].total; // Ambil nilai 'total' dari hasil query
        }

        // Render halaman dashboard dan kirimkan variabel totalPenduduk
        res.render('admin/dashboard', {
            title: 'Admin Dashboard Nagari', // Anda bisa sesuaikan judul
            totalPenduduk: totalPenduduk, // Variabel yang akan dikirim ke dashboard.ejs
            // Tambahkan data lain yang mungkin dibutuhkan di dashboard
        });
    } catch (error) {
        console.error('Error fetching total penduduk for dashboard:', error);
        // Tangani error dengan merender halaman error atau dashboard dengan data kosong
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Gagal memuat data dashboard. ' + error.message,
            error: error
        });
    }
});

module.exports = router;