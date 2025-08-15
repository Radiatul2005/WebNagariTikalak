const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        const [jorongRows] = await db.query(`
            SELECT 
                namaJorong, 
                jumlahWarga, 
                jumlahPenerimaBantuan 
            FROM jorong 
            WHERE namaJorong IS NOT NULL 
            ORDER BY namaJorong ASC
        `);

        const processedJorongData = jorongRows.map(jorong => ({
            namaJorong: jorong.namaJorong || 'Nama Jorong Tidak Tersedia',
            jumlah_warga: parseInt(jorong.jumlahWarga) || 0,
            jumlah_keluarga: 0,
            jumlah_penerima_bantuan: parseInt(jorong.jumlahPenerimaBantuan) || 0
        }));

        console.log('Processed Jorong Data:', processedJorongData);

        res.render('admin/jorong', { jorongData: processedJorongData });

    } catch (err) {
        console.error('Error fetching jorong data:', err);
        res.render('admin/jorong', { jorongData: [], error: 'Failed to load jorong data.' });
    }
});

router.post('/add', async (req, res) => {
    try {
        const { namaJorong } = req.body;

        if (!namaJorong || namaJorong.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Nama jorong tidak boleh kosong'
            });
        }

        const [existingJorong] = await db.query(
            'SELECT id FROM jorong WHERE namaJorong = ?',
            [namaJorong.trim()]
        );

        if (existingJorong.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Jorong dengan nama tersebut sudah ada'
            });
        }

        await db.query(
            'INSERT INTO jorong (namaJorong, jumlahWarga, jumlahPenerimaBantuan) VALUES (?, ?, ?)',
            [namaJorong.trim(), 0, 0]
        );

        res.json({
            success: true,
            message: 'Jorong berhasil ditambahkan'
        });

    } catch (err) {
        console.error('Error adding jorong:', err);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

module.exports = router;
