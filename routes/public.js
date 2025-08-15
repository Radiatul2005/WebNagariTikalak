var express = require('express');
var router = express.Router();

module.exports = function(db) {
    // Rute untuk Halaman Utama APBN Publik
    router.get('/apbn', function(req, res) {
        // Mendapatkan tahun saat ini
        const currentYear = new Date().getFullYear();

        // Query untuk mendapatkan data ringkasan total dan per bidang
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

        db.query(query, [currentYear, currentYear], function(err, results) {
            if (err) {
                console.error(err);
                return res.status(500).send('Terjadi kesalahan pada server.');
            }

            // Hitung total anggaran dan pengeluaran dari data yang diambil
            const totalAnggaran = results.reduce((sum, item) => sum + item.anggaran, 0);
            const totalPengeluaran = results.reduce((sum, item) => sum + item.pengeluaran, 0);
            const sisaAnggaran = totalAnggaran - totalPengeluaran;

            // Render halaman EJS dan kirim data ke sana
            res.render('users/apbn_public', {
                tahun: currentYear,
                totalAnggaran: totalAnggaran,
                totalPengeluaran: totalPengeluaran,
                sisaAnggaran: sisaAnggaran,
                bidangData: results
            });
        });
    });

    return router;
};