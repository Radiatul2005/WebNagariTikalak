const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    res.render('admin/kelompoktani', {
        title: 'Manajemen Kelompok Tani - Nagari Tikalak'
    });
});

router.get('/api/kelompoktani', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                nama_kelompok,
                ketua_kelompok,
                jumlah_anggota,
                tanggal_dibuat,
                tanggal_diperbarui
            FROM kelompok_tani 
            ORDER BY tanggal_dibuat DESC
        `;
        
        const [results] = await db.query(query);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching kelompok tani data:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil data kelompok tani'
        });
    }
});

router.get('/api/kelompoktani/stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_kelompok,
                SUM(jumlah_anggota) as total_anggota,
                AVG(jumlah_anggota) as rata_rata_anggota
            FROM kelompok_tani
        `;
        
        const [results] = await db.query(query);
        
        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Error fetching kelompok tani stats:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal mengambil statistik kelompok tani'
        });
    }
});

router.post('/api/kelompoktani', async (req, res) => {
    try {
        const { nama_kelompok, ketua_kelompok, jumlah_anggota } = req.body;

        if (!nama_kelompok || !ketua_kelompok || !jumlah_anggota) {
            return res.status(400).json({
                success: false,
                error: 'Semua field harus diisi'
            });
        }

        if (parseInt(jumlah_anggota) < 0) {
            return res.status(400).json({
                success: false,
                error: 'Jumlah anggota tidak boleh negatif'
            });
        }

        const checkQuery = 'SELECT id FROM kelompok_tani WHERE nama_kelompok = ?';
        const [existing] = await db.query(checkQuery, [nama_kelompok]);
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Nama kelompok tani sudah ada'
            });
        }

        const insertQuery = `
            INSERT INTO kelompok_tani (nama_kelompok, ketua_kelompok, jumlah_anggota) 
            VALUES (?, ?, ?)
        `;
        
        const [result] = await db.query(insertQuery, [nama_kelompok, ketua_kelompok, parseInt(jumlah_anggota)]);
        
        res.json({
            success: true,
            message: 'Data kelompok tani berhasil ditambahkan',
            data: {
                id: result.insertId,
                nama_kelompok,
                ketua_kelompok,
                jumlah_anggota: parseInt(jumlah_anggota)
            }
        });
    } catch (error) {
        console.error('Error adding kelompok tani:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal menambahkan data kelompok tani'
        });
    }
});

router.put('/api/kelompoktani/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kelompok, ketua_kelompok, jumlah_anggota } = req.body;

        if (!nama_kelompok || !ketua_kelompok || !jumlah_anggota) {
            return res.status(400).json({
                success: false,
                error: 'Semua field harus diisi'
            });
        }

        if (parseInt(jumlah_anggota) < 0) {
            return res.status(400).json({
                success: false,
                error: 'Jumlah anggota tidak boleh negatif'
            });
        }

        const checkQuery = 'SELECT id FROM kelompok_tani WHERE nama_kelompok = ? AND id != ?';
        const [existing] = await db.query(checkQuery, [nama_kelompok, id]);
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Nama kelompok tani sudah ada'
            });
        }

        const updateQuery = `
            UPDATE kelompok_tani 
            SET nama_kelompok = ?, ketua_kelompok = ?, jumlah_anggota = ?, tanggal_diperbarui = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const [result] = await db.query(updateQuery, [nama_kelompok, ketua_kelompok, parseInt(jumlah_anggota), id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Data kelompok tani tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            message: 'Data kelompok tani berhasil diperbarui'
        });
    } catch (error) {
        console.error('Error updating kelompok tani:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal memperbarui data kelompok tani'
        });
    }
});

router.delete('/api/kelompoktani/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteQuery = 'DELETE FROM kelompok_tani WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Data kelompok tani tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            message: 'Data kelompok tani berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting kelompok tani:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal menghapus data kelompok tani'
        });
    }
});

module.exports = router;
