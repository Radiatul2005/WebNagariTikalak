const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/berita');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'berita-' + uniqueSuffix + path.extname(file.originalname));
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
            cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
        }
    }
});

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    try {
        res.render('admin/berita', {
            title: 'Kelola Berita - Admin Panel',
            currentPage: 'berita'
        });
    } catch (error) {
        console.error('Error rendering berita page:', error);
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat halaman berita',
            error: error
        });
    }
});

router.get('/api/list', async (req, res) => {
    try {
        const { status } = req.query;
        let query = `SELECT id, judul, isi_berita, gambar, status, tanggal_dibuat as date, author
                     FROM berita`;
        const queryParams = [];
        if (status && status !== 'all') {
            query += ` WHERE status = ?`;
            queryParams.push(status);
        }
        query += ` ORDER BY tanggal_dibuat DESC`;
        const [rows] = await db.query(query, queryParams);
        const [allBerita] = await db.query(`SELECT status FROM berita`);
        const publishedCount = allBerita.filter(b => b.status === 'published').length;
        const draftCount = allBerita.filter(b => b.status === 'draft').length;
        res.json({
            success: true,
            data: rows,
            total: allBerita.length,
            stats: {
                total: allBerita.length,
                published: publishedCount,
                draft: draftCount
            }
        });
    } catch (error) {
        console.error('Error fetching berita data from DB:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data berita dari database'
        });
    }
});

router.get('/api/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rows] = await db.query(`SELECT id, judul, isi_berita, gambar, status, tanggal_dibuat as date, author FROM berita WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Berita tidak ditemukan'
            });
        }
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching single berita from DB:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data berita'
        });
    }
});

router.post('/api/create', upload.single('image'), async (req, res) => {
    try {
        const { title, content, status } = req.body;
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Judul dan konten berita harus diisi'
            });
        }
        const imageUrl = req.file ? `/uploads/berita/${req.file.filename}` : '/uploads/berita/default-news.jpg';
        const newsStatus = status || 'draft';
        const author = 'Admin Nagari';
        const [result] = await db.query(
            `INSERT INTO berita (judul, isi_berita, gambar, status, author) VALUES (?, ?, ?, ?, ?)`,
            [title.trim(), content.trim(), imageUrl, newsStatus, author]
        );
        const newNewsItem = {
            id: result.insertId,
            title: title.trim(),
            content: content.trim(),
            image: imageUrl,
            status: newsStatus,
            date: new Date().toISOString().split('T')[0],
            author: author
        };
        res.status(201).json({
            success: true,
            message: 'Berita berhasil dibuat',
            data: newNewsItem
        });
    } catch (error) {
        console.error('Error creating berita in DB:', error);
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting uploaded file:', err);
            });
        }
        res.status(500).json({
            success: false,
            message: 'Gagal membuat berita: ' + error.message
        });
    }
});

router.put('/api/:id', upload.single('image'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, content, status } = req.body;
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Judul dan konten berita harus diisi'
            });
        }
        let updateQuery = `UPDATE berita SET judul = ?, isi_berita = ?, status = ?, tanggal_update = CURRENT_TIMESTAMP()`;
        const queryParams = [title.trim(), content.trim(), status || 'draft'];
        if (req.file) {
            const [oldImageRows] = await db.query(`SELECT gambar FROM berita WHERE id = ?`, [id]);
            if (oldImageRows.length > 0 && oldImageRows[0].gambar && !oldImageRows[0].gambar.includes('default')) {
                const oldImagePath = path.join(__dirname, '../public', oldImageRows[0].gambar);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateQuery += `, gambar = ?`;
            queryParams.push(`/uploads/berita/${req.file.filename}`);
        }
        updateQuery += ` WHERE id = ?`;
        queryParams.push(id);
        const [result] = await db.query(updateQuery, queryParams);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Berita tidak ditemukan atau tidak ada perubahan'
            });
        }
        const [updatedRows] = await db.query(`SELECT id, judul, isi_berita, gambar, status, tanggal_dibuat as date, author FROM berita WHERE id = ?`, [id]);
        res.json({
            success: true,
            message: 'Berita berhasil diperbarui',
            data: updatedRows[0]
        });
    } catch (error) {
        console.error('Error updating berita in DB:', error);
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting newly uploaded file on update error:', err);
            });
        }
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui berita: ' + error.message
        });
    }
});

router.put('/api/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [currentStatusRows] = await db.query(`SELECT status FROM berita WHERE id = ?`, [id]);
        if (currentStatusRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Berita tidak ditemukan'
            });
        }
        const currentStatus = currentStatusRows[0].status;
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        const [result] = await db.query(`UPDATE berita SET status = ?, tanggal_update = CURRENT_TIMESTAMP() WHERE id = ?`, [newStatus, id]);
        if (result.affectedRows === 0) {
            return res.status(500).json({ success: false, message: 'Gagal mengubah status berita' });
        }
        const [updatedRows] = await db.query(`SELECT id, judul, isi_berita, gambar, status, tanggal_dibuat as date, author FROM berita WHERE id = ?`, [id]);
        res.json({
            success: true,
            message: `Berita berhasil ${newStatus === 'published' ? 'dipublikasi' : 'dijadikan draft'}`,
            data: updatedRows[0]
        });
    } catch (error) {
        console.error('Error toggling berita status in DB:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengubah status berita: ' + error.message
        });
    }
});

router.delete('/api/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [imageRows] = await db.query(`SELECT gambar FROM berita WHERE id = ?`, [id]);
        if (imageRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Berita tidak ditemukan'
            });
        }
        const imageUrlToDelete = imageRows[0].gambar;
        const [result] = await db.query(`DELETE FROM berita WHERE id = ?`, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Berita tidak ditemukan atau sudah dihapus'
            });
        }
        if (imageUrlToDelete && !imageUrlToDelete.includes('default-news.jpg') && !imageUrlToDelete.includes('placeholder')) {
            const imagePath = path.join(__dirname, '../public', imageUrlToDelete);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error deleting news image file:', err);
                });
            }
        }
        res.json({
            success: true,
            message: 'Berita berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting berita from DB:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus berita: ' + error.message
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
    if (error.message === 'Hanya file gambar yang diperbolehkan!') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next(error);
});

module.exports = router;
