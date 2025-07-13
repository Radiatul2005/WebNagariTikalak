// routes/penduduk.js
const express = require('express');
const router = express.Router();
const db = require('../database'); // Sesuaikan path ke database.js

// Middleware untuk parsing body JSON dan URL-encoded
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// GET - Menampilkan halaman daftar penduduk
router.get('/', (req, res) => {
    try {
        const data = {
            title: 'Data Penduduk Nagari Tikalak',
            pageTitle: 'Penduduk - Nagari Tikalak',
            description: 'Manajemen data penduduk Nagari Tikalak.'
        };
        res.render('admin/penduduk', data); // Pastikan ini mengarah ke views/users/penduduk.ejs
    } catch (error) {
        console.error('Error loading penduduk page:', error);
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat halaman penduduk',
            error: error
        });
    }
});

// API - GET semua data penduduk
router.get('/api/penduduk', async (req, res) => {
    try {
        // Query untuk mengambil semua data penduduk, urutkan berdasarkan ID terbaru
        const [rows] = await db.query(`SELECT * FROM penduduk ORDER BY id DESC`);
        res.json({ message: 'success', data: rows });
    } catch (err) {
        console.error('Error fetching penduduk from MySQL:', err.message);
        res.status(500).json({ error: 'Gagal mengambil data penduduk: ' + err.message });
    }
});

// API - POST data penduduk baru
router.post('/api/penduduk', async (req, res) => {
    const { nama, nik, nomor_kartu_keluarga, tanggalLahir, alamat, namaKepalaKeluarga, dapatBantuan } = req.body;
    const dapatBantuanValue = dapatBantuan ? 1 : 0; // MySQL TINYINT(1)

    try {
        // PERBAIKAN DI SINI: Tambahkan satu '?' lagi di bagian VALUES
        const [result] = await db.query(
            `INSERT INTO penduduk (nama, nik, nomor_kartu_keluarga, tanggalLahir, alamat, namaKepalaKeluarga, dapatBantuan) VALUES (?, ?, ?, ?, ?, ?, ?)`, // <<< SEKARANG ADA 7 TANDA TANYA
            [nama, nik, nomor_kartu_keluarga, tanggalLahir, alamat, namaKepalaKeluarga, dapatBantuanValue]
        );
        res.status(201).json({
            message: 'Penduduk berhasil ditambahkan',
            id: result.insertId,
            data: { ...req.body, id: result.insertId }
        });
    } catch (err) {
        console.error('Error adding penduduk to MySQL:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'NIK sudah terdaftar. Harap gunakan NIK lain.' });
        } else {
            res.status(500).json({ error: 'Gagal menambahkan penduduk: ' + err.message });
        }
    }
});

// API - PUT memperbarui data penduduk
router.put('/api/penduduk/:id', async (req, res) => {
    const { nama, nik, nomor_kartu_keluarga, tanggalLahir, alamat, namaKepalaKeluarga, dapatBantuan } = req.body;
    const { id } = req.params;
    const dapatBantuanValue = dapatBantuan ? 1 : 0;

    try {
        // Query untuk memperbarui data penduduk
        const [result] = await db.query(
            `UPDATE penduduk SET nama = ?, nik = ?, nomor_kartu_keluarga=?, tanggalLahir = ?, alamat = ?, namaKepalaKeluarga = ?, dapatBantuan = ? WHERE id = ?`,
            [nama, nik, nomor_kartu_keluarga, tanggalLahir, alamat, namaKepalaKeluarga, dapatBantuanValue, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Penduduk tidak ditemukan.' });
        } else {
            res.json({ message: 'Penduduk berhasil diperbarui', changes: result.affectedRows });
        }
    } catch (err) {
        console.error('Error updating penduduk in MySQL:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'NIK sudah terdaftar. Harap gunakan NIK lain.' });
        } else {
            res.status(500).json({ error: 'Gagal memperbarui penduduk: ' + err.message });
        }
    }
});

// API - DELETE menghapus data penduduk
router.delete('/api/penduduk/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Query untuk menghapus data penduduk
        const [result] = await db.query(`DELETE FROM penduduk WHERE id = ?`, [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Penduduk tidak ditemukan.' });
        } else {
            res.json({ message: 'Penduduk berhasil dihapus', changes: result.affectedRows });
        }
    } catch (err) {
        console.error('Error deleting penduduk from MySQL:', err.message);
        res.status(500).json({ error: 'Gagal menghapus penduduk: ' + err.message });
    }
});

module.exports = router;