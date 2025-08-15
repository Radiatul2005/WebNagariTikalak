const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database');
const fs = require('fs').promises;
const multer = require('multer');
const path = require('path');

const strukturStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'struktur.jpg');
    }
});

const uploadStruktur = multer({ storage: strukturStorage });
const waliNagariStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'wali-nagari.jpg');
    }
});
const uploadWaliNagari = multer({ storage: waliNagariStorage });

function requireAuth(req, res, next) {
    if (!req.session) {
        console.error('Session middleware not configured properly');
        return res.status(500).render('errors/500', {
            title: 'Server Error',
            message: 'Session tidak tersedia',
            error: new Error('Session middleware not configured')
        });
    }
    if (req.session.userId) {
        return next();
    } else {
        return res.redirect('/admin/login');
    }
}

function requireGuest(req, res, next) {
    if (!req.session) {
        console.error('Session middleware not configured properly');
        return res.status(500).render('errors/500', {
            title: 'Server Error',
            message: 'Session tidak tersedia',
            error: new Error('Session middleware not configured')
        });
    }
    if (req.session.userId) {
        return res.redirect('/admin/dashboard');
    } else {
        return next();
    }
}

router.get('/login', requireGuest, (req, res) => {
    res.render('admin/login', { 
        title: 'Login Admin - Nagari Tikalak',
        error: null 
    });
});

router.post('/login', requireGuest, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.render('admin/login', { 
                title: 'Login Admin - Nagari Tikalak',
                error: 'Username dan password harus diisi!' 
            });
        }
        const [users] = await db.query(
            'SELECT id, username, password FROM users WHERE username = ? LIMIT 1',
            [username]
        );
        if (users.length === 0) {
            return res.render('admin/login', { 
                title: 'Login Admin - Nagari Tikalak',
                error: 'Username atau password salah!' 
            });
        }
        const user = users[0];
        let isValidPassword = false;
        try {
            isValidPassword = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
            isValidPassword = (password === user.password);
        }
        if (!isValidPassword) {
            return res.render('admin/login', { 
                title: 'Login Admin - Nagari Tikalak',
                error: 'Username atau password salah!' 
            });
        }
        if (!req.session) {
            console.error('Session is not available');
            return res.render('admin/login', { 
                title: 'Login Admin - Nagari Tikalak',
                error: 'Session tidak tersedia. Silakan coba lagi.' 
            });
        }
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.nama = user.username;
        console.log('Login successful for user:', user.username);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Login error:', err);
        res.render('admin/login', { 
            title: 'Login Admin - Nagari Tikalak',
            error: 'Terjadi kesalahan sistem. Silakan coba lagi.' 
        });
    }
});

router.get('/dashboard', requireAuth, async (req, res) => {
    let totalPenduduk = 0;
    let totalJorong = 0;
    let totalPertanian = 0;
    let totalPerternakan = 0;
    let strukturOrganisasi = null;
    let waliNagari = null;
    try {
        const [pendudukRows] = await db.query('SELECT COUNT(id) AS total FROM penduduk');
        const [jorongRows] = await db.query('SELECT COUNT(id) AS total FROM jorong');
        const [pertanianRows] = await db.query('SELECT COUNT(id) AS total FROM kelompok_tani');
        const [perternakanRows] = await db.query('SELECT COUNT(id) AS total FROM kelompok_ternak');
        const [strukturRows] = await db.query("SELECT * FROM perangkat_nagari WHERE jabatan = 'Semua Perangkat' LIMIT 1");
        const [waliNagariRows] = await db.query("SELECT * FROM perangkat_nagari WHERE jabatan = 'Wali Nagari' LIMIT 1");
        if (pendudukRows.length > 0) totalPenduduk = pendudukRows[0].total;
        if (jorongRows.length > 0) totalJorong = jorongRows[0].total;
        if (pertanianRows.length > 0) totalPertanian = pertanianRows[0].total;
        if (perternakanRows.length > 0) totalPerternakan = perternakanRows[0].total;
        if (strukturRows.length > 0) strukturOrganisasi = strukturRows[0];
        if (waliNagariRows.length > 0) waliNagari = waliNagariRows[0];
        res.render('admin/dashboard', {
            title: 'Admin Dashboard Nagari',
            user: {
                nama: req.session.username,
                username: req.session.username
            },
            totalPenduduk,
            totalJorong,
            totalPertanian,
            totalPerternakan,
            strukturOrganisasi,
            waliNagari
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Gagal memuat data dashboard. ' + error.message,
            error: error
        });
    }
});

router.post('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/admin/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

router.get('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/admin/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

router.post('/struktur_organisasi/upload', requireAuth, uploadStruktur.single('foto'), async (req, res) => {
    try {
        if (!req.file) { 
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' }); 
        }
        const fotoPathBaru = `uploads/struktur.jpg`;
        const namaDefault = "Struktur Organisasi";
        const jabatanDefault = "Semua Perangkat";
        const [existingRows] = await db.query("SELECT * FROM perangkat_nagari WHERE jabatan = 'Semua Perangkat' LIMIT 1");
        if (existingRows.length > 0) {
            await db.query("UPDATE perangkat_nagari SET foto = ? WHERE id = ?", [fotoPathBaru, existingRows[0].id]);
        } else {
            await db.query("INSERT INTO perangkat_nagari (nama, jabatan, foto) VALUES (?, ?, ?)", [namaDefault, jabatanDefault, fotoPathBaru]);
        }
        console.log('Foto struktur berhasil diunggah dan disimpan sebagai struktur.jpg');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error uploading foto struktur organisasi:', error);
        res.status(500).render('errors/500', { title: 'Server Error' });
    }
});

router.post('/wali_nagari/upload', requireAuth, uploadWaliNagari.single('foto'), async (req, res) => {
    try {
        const { nama } = req.body;
        const jabatan = "Wali Nagari";
        let fotoPathBaru = null;
        if (req.file) {
            fotoPathBaru = `uploads/wali-nagari.jpg`;
        }
        const [existingRows] = await db.query("SELECT * FROM perangkat_nagari WHERE jabatan = 'Wali Nagari' LIMIT 1");
        if (existingRows.length > 0) {
            if (fotoPathBaru) {
                await db.query("UPDATE perangkat_nagari SET nama = ?, foto = ? WHERE id = ?", [nama, fotoPathBaru, existingRows[0].id]);
            } else {
                await db.query("UPDATE perangkat_nagari SET nama = ? WHERE id = ?", [nama, existingRows[0].id]);
            }
        } else {
            if (!fotoPathBaru) {
                return res.status(400).json({ success: false, message: 'Harap unggah foto untuk Wali Nagari baru.' });
            }
            await db.query("INSERT INTO perangkat_nagari (nama, jabatan, foto) VALUES (?, ?, ?)", [nama, jabatan, fotoPathBaru]);
        }
        console.log('Data Wali Nagari berhasil diperbarui');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error uploading foto Wali Nagari:', error);
        res.status(500).render('errors/500', { title: 'Server Error' });
    }
});

module.exports = router;
