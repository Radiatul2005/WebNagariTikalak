const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT id, judul, isi_berita, gambar, tanggal_dibuat, author 
             FROM berita 
             WHERE id = ? AND status = 'published'`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).render('errors/404', {
                title: 'Berita Tidak Ditemukan',
                message: 'Berita yang Anda cari tidak ditemukan atau belum dipublikasikan.'
            });
        }

        const newsItem = rows[0];

        res.render('users/berita-detail', {
            title: newsItem.judul,
            news: newsItem
        });

    } catch (error) {
        console.error('Error fetching public news detail:', error);
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat detail berita.',
            error: error
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const [allNews] = await db.query(
            `SELECT id, judul, isi_berita, gambar, tanggal_dibuat, author 
             FROM berita 
             WHERE status = 'published' 
             ORDER BY tanggal_dibuat DESC`
        );

        res.render('public/berita-list', {
            title: 'Daftar Berita',
            berita: allNews
        });

    } catch (error) {
        console.error('Error fetching all public news:', error);
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat daftar berita.',
            error: error
        });
    }
});

module.exports = router;
