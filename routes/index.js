const express = require('express');
const router = express.Router();
const db = require('../database'); // Make sure this path is correct for your DB connection!

// This route serves your root URL (e.g., '/') and renders the dashboard.
router.get('/', async (req, res) => {
    try {
        // Fetch perangkat_nagari data
        const [perangkat_nagari] = await db.query("SELECT * FROM perangkat_nagari");

        // Fetch published news data for the dashboard
        // Select original column names: id, judul, isi_berita, gambar, tanggal_dibuat, author
        const [berita] = await db.query( // Renamed variable from 'news' to 'berita'
            `SELECT id, judul, isi_berita, gambar, tanggal_dibuat, author
             FROM berita
             WHERE status = 'published'
             ORDER BY tanggal_dibuat DESC
             LIMIT 5` // Get the 5 most recent published news articles
        );

        res.render('users/dashboard', {
            perangkat_nagari: perangkat_nagari,
            berita: berita // Passed as 'berita' to match EJS expectation
        });
    } catch (err) {
        console.error("Error on '/' route:", err);
        // Provide fallback empty arrays for robustness
        res.status(500).render('users/dashboard', { perangkat_nagari: [], berita: [], error: 'Failed to load data.' });
    }
});

// This route specifically handles '/users/dashboard'.
// It's good practice to have this if users might directly navigate to /users/dashboard.
router.get('/users/dashboard', async (req, res) => {
    try {
        // Fetch perangkat_nagari data
        const [perangkat_nagari] = await db.query("SELECT * FROM perangkat_nagari");

        // Fetch published news data for the dashboard
        // Select original column names: id, judul, isi_berita, gambar, tanggal_dibuat, author
        const [berita] = await db.query( // Renamed variable from 'news' to 'berita'
            `SELECT id, judul, isi_berita, gambar, tanggal_dibuat, author
             FROM berita
             WHERE status = 'published'
             ORDER BY tanggal_dibuat DESC
             LIMIT 5`
        );

        res.render('users/dashboard', {
            perangkat_nagari: perangkat_nagari,
            berita: berita // Passed as 'berita' to match EJS expectation
        });
    } catch (err) {
        console.error("Error on '/users/dashboard' route:", err);
        // Provide fallback empty arrays for robustness
        res.status(500).render('users/dashboard', { perangkat_nagari: [], berita: [], error: 'Failed to load data.' });
    }
});

module.exports = router;