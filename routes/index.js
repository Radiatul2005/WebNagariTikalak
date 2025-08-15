const express = require('express');
const router = express.Router();
const db = require('../database');
const fs = require('fs');
const path = require('path');

function validateAndCleanPhotoPath(rawFoto, defaultFoto = null) {
    if (!rawFoto) return defaultFoto;
    let cleanFoto = rawFoto.replace(/^https?:\/\//, '');
    cleanFoto = cleanFoto.replace(/^\/uploads\//, '').replace(/^uploads\//, '').replace(/^\//, '');
    const fullPath = path.join(__dirname, '..', 'public', 'uploads', cleanFoto);
    if (fs.existsSync(fullPath)) {
        return cleanFoto;
    } else {
        return defaultFoto ? defaultFoto.replace(/^\/uploads\//, '').replace(/^uploads\//, '') : null;
    }
}

router.get('/', async (req, res) => {
    try {
        const [allData] = await db.query("SELECT * FROM perangkat_nagari");
        const [waliNagariData] = await db.query("SELECT nama, jabatan FROM perangkat_nagari WHERE jabatan = 'Wali Nagari' LIMIT 1");
        let strukturOrganisasiData = [];
        [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE nama = 'Struktur Organisasi' LIMIT 1");
        if (strukturOrganisasiData.length === 0) {
            [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE LOWER(nama) LIKE '%struktur%' OR LOWER(nama) LIKE '%organisasi%' LIMIT 1");
        }
        if (strukturOrganisasiData.length === 0) {
            [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE LOWER(jabatan) LIKE '%struktur%' OR LOWER(jabatan) LIKE '%organisasi%' LIMIT 1");
        }
        if (strukturOrganisasiData.length === 0) {
            [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE foto IS NOT NULL AND foto != '' AND jabatan != 'Wali Nagari' LIMIT 1");
        }
        if (strukturOrganisasiData.length === 0) {
            [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE id = 2 LIMIT 1");
        }
        const [berita] = await db.query(
            `SELECT id, judul, isi_berita, gambar, tanggal_dibuat, author
            FROM berita
            WHERE status = 'published'
            ORDER BY tanggal_dibuat DESC
            LIMIT 5`
        );
        const waliNagari = waliNagariData.length > 0 ? { 
            ...waliNagariData[0], 
            foto: 'uploads/wali-nagari.jpg' 
        } : null;
        let strukturOrganisasi = null;
        if (strukturOrganisasiData.length > 0) {
            let fotoPath = strukturOrganisasiData[0].foto;
            if (fotoPath) {
                let cleanedPath = fotoPath.replace(/^\/uploads\//, '').replace(/^uploads\//, '').replace(/^\//, '');
                const fullPath = path.join(__dirname, '..', 'public', 'uploads', cleanedPath);
                if (fs.existsSync(fullPath)) {
                    strukturOrganisasi = {
                        ...strukturOrganisasiData[0],
                        foto: `uploads/${cleanedPath}`
                    };
                } else {
                    const defaultPath = path.join(__dirname, '..', 'public', 'default-struktur.jpg');
                    if (fs.existsSync(defaultPath)) {
                        strukturOrganisasi = {
                            ...strukturOrganisasiData[0],
                            foto: 'default-struktur.jpg'
                        };
                    } else {
                        strukturOrganisasi = {
                            ...strukturOrganisasiData[0],
                            foto: null
                        };
                    }
                }
            } else {
                strukturOrganisasi = {
                    ...strukturOrganisasiData[0],
                    foto: null
                };
            }
        }
        res.render('users/dashboard', {
            waliNagari: waliNagari,
            strukturOrganisasi: strukturOrganisasi,
            berita: berita 
        });
    } catch (err) {
        res.status(500).render('users/dashboard', { 
            waliNagari: null, 
            strukturOrganisasi: null, 
            berita: [], 
            error: 'Failed to load data.' 
        });
    }
});

router.get('/users/dashboard', async (req, res) => {
    try {
        const [waliNagariData] = await db.query("SELECT nama, jabatan FROM perangkat_nagari WHERE jabatan = 'Wali Nagari' LIMIT 1");
        const [allData] = await db.query("SELECT * FROM perangkat_nagari");
        let strukturOrganisasiData;
        [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE nama = 'Struktur Organisasi' LIMIT 1");
        if (strukturOrganisasiData.length === 0) {
            [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE nama LIKE '%struktur%' OR nama LIKE '%organisasi%' LIMIT 1");
        }
        if (strukturOrganisasiData.length === 0) {
            [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE jabatan LIKE '%struktur%' OR jabatan LIKE '%organisasi%' LIMIT 1");
        }
        if (strukturOrganisasiData.length === 0) {
            [strukturOrganisasiData] = await db.query("SELECT nama, foto FROM perangkat_nagari WHERE foto IS NOT NULL AND foto != '' AND jabatan != 'Wali Nagari' LIMIT 1");
        }
        const [berita] = await db.query(
            `SELECT id, judul, isi_berita, gambar, tanggal_dibuat, author
            FROM berita
            WHERE status = 'published'
            ORDER BY tanggal_dibuat DESC
            LIMIT 5`
        );
        const waliNagari = waliNagariData.length > 0 ? { 
            ...waliNagariData[0], 
            foto: 'uploads/wali-nagari.jpg' 
        } : null;
        let strukturOrganisasi = null;
        if (strukturOrganisasiData.length > 0) {
            let fotoPath = strukturOrganisasiData[0].foto;
            if (fotoPath) {
                let cleanedPath = fotoPath.replace(/^\/uploads\//, '').replace(/^uploads\//, '').replace(/^\//, '');
                const fullPath = path.join(__dirname, '..', 'public', 'uploads', cleanedPath);
                if (fs.existsSync(fullPath)) {
                    strukturOrganisasi = {
                        ...strukturOrganisasiData[0],
                        foto: `uploads/${cleanedPath}`
                    };
                } else {
                    const defaultPath = path.join(__dirname, '..', 'public', 'default-struktur.jpg');
                    if (fs.existsSync(defaultPath)) {
                        strukturOrganisasi = {
                            ...strukturOrganisasiData[0],
                            foto: 'default-struktur.jpg'
                        };
                    } else {
                        strukturOrganisasi = {
                            ...strukturOrganisasiData[0],
                            foto: null
                        };
                    }
                }
            } else {
                strukturOrganisasi = {
                    ...strukturOrganisasiData[0],
                    foto: null
                };
            }
        }
        res.render('users/dashboard', {
            waliNagari: waliNagari,
            strukturOrganisasi: strukturOrganisasi,
            berita: berita 
        });
    } catch (err) {
        res.status(500).render('users/dashboard', { 
            waliNagari: null, 
            strukturOrganisasi: null, 
            berita: [], 
            error: 'Failed to load data.' 
        });
    }
});

module.exports = router;
