const express = require('express');
const router = express.Router();
const db = require('../database');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

async function updateJorongCounts(id_jorong) {
    let connection;
    try {
        connection = await db.getConnection();
        const [countResult] = await connection.query(
            `SELECT COUNT(*) as totalWarga FROM penduduk WHERE id_jorong = ?`,
            [id_jorong]
        );
        const totalWarga = countResult[0].totalWarga;
        const [bantuanResult] = await connection.query(
            `SELECT COUNT(*) as totalPenerimaBantuan FROM penduduk WHERE id_jorong = ? AND dapatBantuan = 1`,
            [id_jorong]
        );
        const totalPenerimaBantuan = bantuanResult[0].totalPenerimaBantuan;
        const [updateResult] = await connection.query(
            `UPDATE jorong SET jumlahWarga = ?, jumlahPenerimaBantuan = ? WHERE id = ?`,
            [totalWarga, totalPenerimaBantuan, id_jorong]
        );
    } catch (error) {
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

router.get('/', (req, res) => {
    try {
        const data = {
            title: 'Data Penduduk Nagari Tikalak (Admin)',
            pageTitle: 'Penduduk - Admin Nagari Tikalak',
            description: 'Manajemen data penduduk Nagari Tikalak.'
        };
        res.render('admin/penduduk', data);
    } catch (error) {
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat halaman penduduk admin',
            error: error
        });
    }
});

router.get('/api/jorong', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.query(`SELECT id, namaJorong FROM jorong ORDER BY namaJorong ASC`);
        res.json({ message: 'success', data: rows });
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil data jorong: ' + err.message });
    } finally {
        if (connection) connection.release();
    }
});

router.get('/api/penduduk', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.query(`
            SELECT
                p.id,
                p.nama,
                p.nik,
                p.tanggalLahir,
                p.alamat,
                p.dapatBantuan,
                p.id_jorong,
                j.namaJorong
            FROM
                penduduk p
            LEFT JOIN
                jorong j ON p.id_jorong = j.id
            ORDER BY
                p.id DESC
        `);
        res.json({ message: 'success', data: rows });
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil data penduduk: ' + err.message });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/api/penduduk', async (req, res) => {
    const { nama, nik, tanggalLahir, alamat, id_jorong, dapatBantuan } = req.body;
    const dapatBantuanValue = dapatBantuan ? 1 : 0;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO penduduk (nama, nik, tanggalLahir, alamat, id_jorong, dapatBantuan) VALUES (?, ?, ?, ?, ?, ?)`,
            [nama, nik, tanggalLahir, alamat, id_jorong, dapatBantuanValue]
        );

        await updateJorongCounts(id_jorong);

        await connection.commit();

        res.status(201).json({
            message: 'Penduduk berhasil ditambahkan dan jumlah warga jorong telah diperbarui',
            id: result.insertId,
            data: { ...req.body, id: result.insertId }
        });
    } catch (err) {
        if (connection) await connection.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'NIK sudah terdaftar. Harap gunakan NIK lain.' });
        } else {
            res.status(500).json({ error: 'Gagal menambahkan penduduk: ' + err.message });
        }
    } finally {
        if (connection) connection.release();
    }
});

router.put('/api/penduduk/:id', async (req, res) => {
    const { nama, nik, tanggalLahir, alamat, id_jorong, dapatBantuan } = req.body;
    const { id } = req.params;
    const dapatBantuanValue = dapatBantuan ? 1 : 0;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [oldData] = await connection.query(`SELECT id_jorong, dapatBantuan FROM penduduk WHERE id = ?`, [id]);

        if (oldData.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Penduduk tidak ditemukan.' });
        }

        const oldJorongId = oldData[0].id_jorong;
        const oldDapatBantuan = oldData[0].dapatBantuan;

        const [result] = await connection.query(
            `UPDATE penduduk SET nama = ?, nik = ?, tanggalLahir = ?, alamat = ?, id_jorong = ?, dapatBantuan = ? WHERE id = ?`,
            [nama, nik, tanggalLahir, alamat, id_jorong, dapatBantuanValue, id]
        );

        if (result.affectedRows === 0) {
            await connection.commit();
            return res.status(200).json({ message: 'Penduduk ditemukan tetapi tidak ada perubahan data.', changes: 0 });
        }

        if (oldJorongId !== parseInt(id_jorong) || oldDapatBantuan !== dapatBantuanValue) {
             if (oldJorongId !== parseInt(id_jorong)) {
                await updateJorongCounts(oldJorongId);
            }
            await updateJorongCounts(id_jorong);
        }

        await connection.commit();

        res.json({
            message: 'Penduduk berhasil diperbarui dan jumlah warga jorong telah diperbarui',
            changes: result.affectedRows
        });
    } catch (err) {
        if (connection) await connection.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'NIK sudah terdaftar. Harap gunakan NIK lain.' });
        } else {
            res.status(500).json({ error: 'Gagal memperbarui penduduk: ' + err.message });
        }
    } finally {
        if (connection) connection.release();
    }
});

router.delete('/api/penduduk/:id', async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [pendudukData] = await connection.query(`SELECT id_jorong FROM penduduk WHERE id = ?`, [id]);

        if (pendudukData.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Penduduk tidak ditemukan.' });
        }

        const jorongId = pendudukData[0].id_jorong;

        const [result] = await connection.query(`DELETE FROM penduduk WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Penduduk tidak ditemukan.' });
        }

        await updateJorongCounts(jorongId);

        await connection.commit();

        res.json({
            message: 'Penduduk berhasil dihapus dan jumlah warga jorong telah diperbarui',
            changes: result.affectedRows
        });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: 'Gagal menghapus penduduk: ' + err.message });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/api/jorong/update-counts', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [jorongList] = await connection.query(`SELECT id FROM jorong`);

        for (const jorong of jorongList) {
            await updateJorongCounts(jorong.id);
        }

        await connection.commit();

        res.json({
            message: 'Berhasil memperbarui jumlah warga untuk semua jorong',
            updated: jorongList.length
        });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: 'Gagal memperbarui jumlah warga jorong: ' + err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
