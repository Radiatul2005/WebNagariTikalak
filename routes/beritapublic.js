const express = require('express');
const router = express.Router();
const db = require('../database'); // Adjust path if necessary

// Route to display a single news article
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch only published news articles
        const [rows] = await db.query(
            `SELECT id, judul, isi_berita, gambar, tanggal_dibuat, author 
             FROM berita 
             WHERE id = ? AND status = 'published'`,
            [id]
        );

        if (rows.length === 0) {
            // If no news found or not published, render a 404 error page
            return res.status(404).render('errors/404', {
                title: 'Berita Tidak Ditemukan',
                message: 'Berita yang Anda cari tidak ditemukan atau belum dipublikasikan.'
            });
        }

        const newsItem = rows[0];

        res.render('users/berita-detail', { // You will create 'users/berita-detail.ejs'
            title: newsItem.judul,
            news: newsItem
        });

    } catch (error) {
        console.error('Error fetching public news detail:', error);
        res.status(500).render('errors/500', { // You will create 'errors/500.ejs'
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat detail berita.',
            error: error
        });
    }
});

// Optional: Route to display all public news articles (for the "Lihat Semua Berita" button)
router.get('/', async (req, res) => {
    try {
        const [allNews] = await db.query(
            `SELECT id, judul, isi_berita, gambar, tanggal_dibuat, author 
             FROM berita 
             WHERE status = 'published' 
             ORDER BY tanggal_dibuat DESC`
        );

        res.render('public/berita-list', { // You will create 'public/berita-list.ejs'
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