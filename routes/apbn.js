var express = require('express');
var router = express.Router();

module.exports = function(db) {
    router.get('/', function(req, res) {
        res.render('admin/apbn');
    });

    // API ENDPOINTS

    // API Dashboard
    router.get('/api/dashboard', function(req, res) {
        var tahun = req.query.tahun;
        var query = `
            SELECT
                ba.nama_bidang,
                ba.jumlah_anggaran AS anggaran,
                COALESCE(SUM(p.jumlah_pengeluaran), 0) AS pengeluaran
            FROM
                bidang_anggaran ba
            LEFT JOIN
                pengeluaran p ON ba.id = p.bidang_id AND YEAR(p.tanggal_pengeluaran) = ?
            WHERE
                ba.tahun = ?
            GROUP BY
                ba.id
        `;
        db.query(query, [tahun, tahun], function(err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server Error' });
            }
            var totalAnggaran = results.reduce(function(sum, item) { return sum + item.anggaran; }, 0);
            var totalPengeluaran = results.reduce(function(sum, item) { return sum + item.pengeluaran; }, 0);
            var sisaAnggaran = totalAnggaran - totalPengeluaran;
            var jumlahBidang = results.length;

            res.json({
                totalAnggaran: totalAnggaran,
                totalPengeluaran: totalPengeluaran,
                sisaAnggaran: sisaAnggaran,
                jumlahBidang: jumlahBidang,
                bidangData: results
            });
        });
    });

    // API Kelola Bidang
    router.get('/api/bidang', function(req, res) {
        db.query('SELECT DISTINCT id, nama_bidang FROM bidang_anggaran ORDER BY nama_bidang ASC', function(err, results) {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });

    router.get('/api/bidang/:id', function(req, res) {
        var id = req.params.id;
        db.query('SELECT * FROM bidang_anggaran WHERE id = ?', [id], function(err, results) {
            if (err) return res.status(500).send(err);
            if (results.length === 0) return res.status(404).send('Bidang not found');
            res.json(results[0]);
        });
    });
    
    router.post('/api/bidang', function(req, res) {
        var { nama_bidang } = req.body;
        db.query('SELECT COUNT(*) AS count FROM bidang_anggaran WHERE nama_bidang = ?', [nama_bidang], function(err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server Error' });
            }
            if (results[0].count > 0) {
                return res.status(409).json({ message: 'Bidang dengan nama ini sudah ada.' });
            }
            
            var query = 'INSERT INTO bidang_anggaran (nama_bidang, jumlah_anggaran, tahun) VALUES (?, 0, YEAR(CURDATE()))';
            db.query(query, [nama_bidang], function(err, result) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Failed to add bidang' });
                }
                res.status(201).json({ id: result.insertId, message: 'Bidang saved successfully' });
            });
        });
    });

    router.put('/api/bidang/:id', function(req, res) {
        var id = req.params.id;
        var { nama_bidang } = req.body;
        var query = 'UPDATE bidang_anggaran SET nama_bidang = ? WHERE id = ?';
        db.query(query, [nama_bidang, id], function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Failed to update bidang');
            }
            res.json({ message: 'Bidang updated successfully' });
        });
    });

    router.delete('/api/bidang/:id', function(req, res) {
        var id = req.params.id;
        db.query('DELETE FROM bidang_anggaran WHERE id = ?', [id], function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Failed to delete bidang');
            }
            res.json({ message: 'Bidang deleted successfully' });
        });
    });


    router.get('/api/anggaran', function(req, res) {
        db.query('SELECT * FROM bidang_anggaran ORDER BY tahun DESC', function(err, results) {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });

    router.get('/api/anggaran/:id', function(req, res) {
        var id = req.params.id;
        db.query('SELECT * FROM bidang_anggaran WHERE id = ?', [id], function(err, results) {
            if (err) return res.status(500).send(err);
            res.json(results[0]);
        });
    });

    router.post('/api/anggaran', function(req, res) {
        var { tahun, bidang_id, jumlah_anggaran } = req.body;

        if (!tahun || !bidang_id || jumlah_anggaran == null) {
            return res.status(400).json({ message: 'Data anggaran tidak lengkap.' });
        }

        db.query('SELECT nama_bidang FROM bidang_anggaran WHERE id = ? LIMIT 1', [bidang_id], function(err, bidangResult) {
            if (err || bidangResult.length === 0) {
                return res.status(404).json({ message: 'Bidang tidak ditemukan.' });
            }
            var nama_bidang = bidangResult[0].nama_bidang;
            
            // Cek apakah entri anggaran untuk tahun dan nama_bidang ini sudah ada
            db.query('SELECT id FROM bidang_anggaran WHERE nama_bidang = ? AND tahun = ?', [nama_bidang, tahun], function(err, results) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Kesalahan server saat memeriksa data.' });
                }
                
                if (results.length > 0) {
                    // Jika sudah ada, update jumlahnya
                    var existingId = results[0].id;
                    db.query('UPDATE bidang_anggaran SET jumlah_anggaran = ? WHERE id = ?', [jumlah_anggaran, existingId], function(err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: 'Gagal memperbarui anggaran.' });
                        }
                        res.json({ message: 'Anggaran berhasil diperbarui.' });
                    });
                } else {
                    // Jika belum ada, buat entri baru
                    var insertQuery = 'INSERT INTO bidang_anggaran (tahun, nama_bidang, jumlah_anggaran) VALUES (?, ?, ?)';
                    db.query(insertQuery, [tahun, nama_bidang, jumlah_anggaran], function(err, result) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: 'Gagal menyimpan anggaran baru.' });
                        }
                        res.status(201).json({ id: result.insertId, message: 'Anggaran berhasil disimpan.' });
                    });
                }
            });
        });
    });

    router.put('/api/anggaran/:id', function(req, res) {
        var id = req.params.id;
        var { tahun, jumlah_anggaran } = req.body;
        
        // Ambil nama_bidang dari entri yang sudah ada
        db.query('SELECT nama_bidang FROM bidang_anggaran WHERE id = ? LIMIT 1', [id], function(err, bidangResult) {
            if (err || bidangResult.length === 0) {
                return res.status(404).json({ message: 'Anggaran tidak ditemukan.' });
            }
            var nama_bidang = bidangResult[0].nama_bidang;
            var query = 'UPDATE bidang_anggaran SET tahun = ?, nama_bidang = ?, jumlah_anggaran = ? WHERE id = ?';
            db.query(query, [tahun, nama_bidang, jumlah_anggaran, id], function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Gagal memperbarui anggaran.' });
                }
                res.json({ message: 'Anggaran berhasil diperbarui.' });
            });
        });
    });

    router.delete('/api/anggaran/:id', function(req, res) {
        var id = req.params.id;
        db.query('DELETE FROM bidang_anggaran WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Anggaran deleted successfully' });
        });
    });

    // API Pengeluaran
    router.get('/api/pengeluaran', function(req, res) {
        var query = `
            SELECT p.*, ba.nama_bidang
            FROM pengeluaran p
            JOIN bidang_anggaran ba ON p.bidang_id = ba.id
            ORDER BY p.tanggal_pengeluaran DESC
        `;
        db.query(query, function(err, results) {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });

    router.get('/api/pengeluaran/:id', function(req, res) {
        var id = req.params.id;
        db.query('SELECT * FROM pengeluaran WHERE id = ?', [id], function(err, results) {
            if (err) return res.status(500).send(err);
            res.json(results[0]);
        });
    });

    router.post('/api/pengeluaran', function(req, res) {
        var { bidang_id, tanggal_pengeluaran, keterangan, jumlah_pengeluaran } = req.body;
        var query = 'INSERT INTO pengeluaran (bidang_id, tanggal_pengeluaran, keterangan, jumlah_pengeluaran) VALUES (?, ?, ?, ?)';
        db.query(query, [bidang_id, tanggal_pengeluaran, keterangan, jumlah_pengeluaran], function(err, result) {
            if (err) return res.status(500).send(err);
            res.status(201).json({ id: result.insertId, message: 'Pengeluaran saved successfully' });
        });
    });

    router.put('/api/pengeluaran/:id', function(req, res) {
        var id = req.params.id;
        var { bidang_id, tanggal_pengeluaran, keterangan, jumlah_pengeluaran } = req.body;
        var query = 'UPDATE pengeluaran SET bidang_id = ?, tanggal_pengeluaran = ?, keterangan = ?, jumlah_pengeluaran = ? WHERE id = ?';
        db.query(query, [bidang_id, tanggal_pengeluaran, keterangan, jumlah_pengeluaran, id], function(err) {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Pengeluaran updated successfully' });
        });
    });

    router.delete('/api/pengeluaran/:id', function(req, res) {
        var id = req.params.id;
        db.query('DELETE FROM pengeluaran WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Pengeluaran deleted successfully' });
        });
    });

    // API Laporan
    router.get('/api/laporan', function(req, res) {
        var tahun = req.query.tahun;
        var query = `
            SELECT
                ba.nama_bidang,
                ba.jumlah_anggaran AS anggaran,
                COALESCE(SUM(p.jumlah_pengeluaran), 0) AS pengeluaran
            FROM
                bidang_anggaran ba
            LEFT JOIN
                pengeluaran p ON ba.id = p.bidang_id AND YEAR(p.tanggal_pengeluaran) = ?
            WHERE
                ba.tahun = ?
            GROUP BY
                ba.id
            ORDER BY
                ba.nama_bidang
        `;
        db.query(query, [tahun, tahun], function(err, results) {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });

    return router;
};