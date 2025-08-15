const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/potensi');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'potensi-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan untuk potensi!'), false);
        }
    }
});

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    try {
        res.render('admin/potensi', {
            title: 'Kelola Potensi Nagari - Admin Panel',
            currentPage: 'potensi',
        });
    } catch (error) {
        console.error('Error rendering potensi page:', error);
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat halaman potensi',
            error: error
        });
    }
});

router.get('/api/list', async (req, res) => {
    try {
        let query = `SELECT id, nama_potensi, jenis, foto, deskripsi, latitude, longitude, tanggal_dibuat FROM potensi ORDER BY tanggal_dibuat DESC`;
        const [rows] = await db.query(query);

        const [totalPotensiRows] = await db.query(`SELECT COUNT(*) as total FROM potensi`);
        const totalPotensi = totalPotensiRows[0].total;

        res.json({
            success: true,
            data: rows,
            total: totalPotensi,
            stats: {
                total: totalPotensi,
                umkm: rows.filter(p => p.jenis === 'UMKM').length,
                pariwisata: rows.filter(p => p.jenis === 'Pariwisata').length,
                budaya_lokal: rows.filter(p => p.jenis === 'Budaya Lokal').length
            }
        });
    } catch (error) {
        console.error('Error fetching potensi data from DB:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data potensi dari database'
        });
    }
});

router.get('/api/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rows] = await db.query(
            `SELECT id, nama_potensi, jenis, foto, deskripsi, latitude, longitude, tanggal_dibuat FROM potensi WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Potensi tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching single potensi from DB:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data potensi'
        });
    }
});

router.post('/api/create', upload.single('foto'), async (req, res) => {
    try {
        const { nama_potensi, jenis, deskripsi, latitude, longitude } = req.body;

        if (!nama_potensi || !jenis || !deskripsi) {
            return res.status(400).json({
                success: false,
                message: 'Nama potensi, jenis, dan deskripsi harus diisi!'
            });
        }

        const parsedLatitude = (latitude && !isNaN(parseFloat(latitude))) ? parseFloat(latitude) : null;
        const parsedLongitude = (longitude && !isNaN(parseFloat(longitude))) ? parseFloat(longitude) : null;

        const imageUrl = req.file ? `/uploads/potensi/${req.file.filename}` : '/uploads/potensi/default-potensi.jpg';

        const [result] = await db.query(
            `INSERT INTO potensi (nama_potensi, jenis, foto, deskripsi, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`,
            [nama_potensi.trim(), jenis, imageUrl, deskripsi.trim(), parsedLatitude, parsedLongitude]
        );

        const newPotensiItem = {
            id: result.insertId,
            nama_potensi: nama_potensi.trim(),
            jenis: jenis,
            foto: imageUrl,
            deskripsi: deskripsi.trim(),
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            tanggal_dibuat: new Date().toISOString().split('T')[0]
        };

        res.status(201).json({
            success: true,
            message: 'Potensi berhasil dibuat!',
            data: newPotensiItem
        });

    } catch (error) {
        console.error('Error creating potensi in DB:', error);
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting uploaded file:', err);
            });
        }
        res.status(500).json({
            success: false,
            message: 'Gagal membuat potensi: ' + error.message
        });
    }
});

router.put('/api/:id', upload.single('foto'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nama_potensi, jenis, deskripsi, latitude, longitude } = req.body;

        if (!nama_potensi || !jenis || !deskripsi) {
            return res.status(400).json({
                success: false,
                message: 'Nama potensi, jenis, dan deskripsi harus diisi!'
            });
        }

        const parsedLatitude = (latitude && !isNaN(parseFloat(latitude))) ? parseFloat(latitude) : null;
        const parsedLongitude = (longitude && !isNaN(parseFloat(longitude))) ? parseFloat(longitude) : null;

        let updateQuery = `UPDATE potensi SET nama_potensi = ?, jenis = ?, deskripsi = ?, latitude = ?, longitude = ?, tanggal_update = CURRENT_TIMESTAMP()`;
        const queryParams = [nama_potensi.trim(), jenis, deskripsi.trim(), parsedLatitude, parsedLongitude];

        if (req.file) {
            const [oldImageRows] = await db.query(`SELECT foto FROM potensi WHERE id = ?`, [id]);
            if (oldImageRows.length > 0 && oldImageRows[0].foto && !oldImageRows[0].foto.includes('default-potensi.jpg')) {
                const oldImagePath = path.join(__dirname, '../public', oldImageRows[0].foto);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateQuery += `, foto = ?`;
            queryParams.push(`/uploads/potensi/${req.file.filename}`);
        }

        updateQuery += ` WHERE id = ?`;
        queryParams.push(id);

        const [result] = await db.query(updateQuery, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Potensi tidak ditemukan atau tidak ada perubahan'
            });
        }

        const [updatedRows] = await db.query(
            `SELECT id, nama_potensi, jenis, foto, deskripsi, latitude, longitude, tanggal_dibuat FROM potensi WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Potensi berhasil diperbarui!',
            data: updatedRows[0]
        });
    } catch (error) {
        console.error('Error updating potensi in DB:', error);
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting newly uploaded file on update error:', err);
            });
        }
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui potensi: ' + error.message
        });
    }
});

router.delete('/api/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const [imageRows] = await db.query(`SELECT foto FROM potensi WHERE id = ?`, [id]);

        if (imageRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Potensi tidak ditemukan'
            });
        }

        const imageUrlToDelete = imageRows[0].foto;

        const [result] = await db.query(`DELETE FROM potensi WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Potensi tidak ditemukan atau sudah dihapus'
            });
        }

        if (imageUrlToDelete && !imageUrlToDelete.includes('default-potensi.jpg')) {
            const imagePath = path.join(__dirname, '../public', imageUrlToDelete);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error deleting potensi image file:', err);
                });
            }
        }

        res.json({
            success: true,
            message: 'Potensi berhasil dihapus!'
        });
    } catch (error) {
        console.error('Error deleting potensi from DB:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus potensi: ' + error.message
        });
    }
});

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Ukuran file terlalu besar. Maksimal 5MB.'
            });
        }
    }

    if (error.message === 'Hanya file gambar yang diperbolehkan untuk potensi!') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
});

module.exports = router;
