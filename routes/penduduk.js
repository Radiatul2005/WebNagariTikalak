// routes/penduduk.js
const express = require('express');
const router = express.Router();
const db = require('../database'); // Sesuaikan path ke database.js Anda

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
        res.render('admin/penduduk', data);
    } catch (error) {
        console.error('Error loading penduduk page:', error);
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat halaman penduduk',
            error: error
        });
    }
});

// API - GET semua data jorong (NEW ENDPOINT)
router.get('/api/jorong', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT id, namaJorong FROM jorong ORDER BY namaJorong ASC`);
        res.json({ message: 'success', data: rows });
    } catch (err) {
        console.error('Error fetching jorong from MySQL:', err.message);
        res.status(500).json({ error: 'Gagal mengambil data jorong: ' + err.message });
    }
});


// API - GET semua data penduduk (MODIFIED)
router.get('/api/penduduk', async (req, res) => {
    try {
        // Query untuk mengambil semua data penduduk, JOIN dengan tabel jorong
        // untuk mendapatkan namaJorong berdasarkan id_jorong, urutkan berdasarkan ID terbaru
        const [rows] = await db.query(`
            SELECT 
                p.id, 
                p.nama, 
                p.nik, 
                p.tanggalLahir, 
                p.alamat, 
                p.dapatBantuan,
                p.id_jorong,           -- Include id_jorong
                j.namaJorong           -- Include namaJorong from jorong table
            FROM 
                penduduk p
            LEFT JOIN 
                jorong j ON p.id_jorong = j.id
            ORDER BY 
                p.id DESC
        `);
        res.json({ message: 'success', data: rows });
    } catch (err) {
        console.error('Error fetching penduduk from MySQL:', err.message);
        res.status(500).json({ error: 'Gagal mengambil data penduduk: ' + err.message });
    }
});

// API - POST data penduduk baru (MODIFIED)
router.post('/api/penduduk', async (req, res) => {
    // Ambil data dari req.body - PASTIKAN NAMA PROPERTI INI SAMA DENGAN 'name' DI INPUT FORM HTML
    const { nama, nik, tanggalLahir, alamat, id_jorong, dapatBantuan, jorong } = req.body; // Mengambil 'id_jorong' dan 'jorong' (string nama)

    const dapatBantuanValue = dapatBantuan ? 1 : 0; // Konversi boolean ke TINYINT(1) MySQL

    try {
        // Query untuk menambahkan data penduduk baru
        // Simpan id_jorong dan nama jorong (string)
        const [result] = await db.query(
            `INSERT INTO penduduk (nama, nik, tanggalLahir, alamat, id_jorong, jorong, dapatBantuan) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [nama, nik, tanggalLahir, alamat, id_jorong, jorong, dapatBantuanValue] // Urutan parameter harus cocok dengan urutan kolom
        );
        res.status(201).json({
            message: 'Penduduk berhasil ditambahkan',
            id: result.insertId,
            data: { ...req.body, id: result.insertId }
        });
    } catch (err) {
        console.error('Error adding penduduk to MySQL:', err.message);
        if (err.code === 'ER_DUP_ENTRY') { // Error code for unique constraint violation in MySQL (untuk NIK)
            res.status(400).json({ error: 'NIK sudah terdaftar. Harap gunakan NIK lain.' });
        } else {
            res.status(500).json({ error: 'Gagal menambahkan penduduk: ' + err.message });
        }
    }
});

// API - PUT memperbarui data penduduk (MODIFIED)
router.put('/api/penduduk/:id', async (req, res) => {
    // Ambil data dari req.body
    const { nama, nik, tanggalLahir, alamat, id_jorong, dapatBantuan, jorong } = req.body; // Mengambil 'id_jorong' dan 'jorong' (string nama)
    const { id } = req.params;
    const dapatBantuanValue = dapatBantuan ? 1 : 0;

    try {
        // Query untuk memperbarui data penduduk
        // Perbarui id_jorong dan nama jorong (string)
        const [result] = await db.query(
            `UPDATE penduduk SET nama = ?, nik = ?, tanggalLahir = ?, alamat = ?, id_jorong = ?, jorong = ?, dapatBantuan = ? WHERE id = ?`,
            [nama, nik, tanggalLahir, alamat, id_jorong, jorong, dapatBantuanValue, id] // Urutan parameter harus cocok dengan urutan kolom
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