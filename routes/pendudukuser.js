const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        let totalWarga = 0;
        let totalPenerimaBantuan = 0;
        const jorongData = [];

        const queryJorong = 'SELECT id, namaJorong, jumlahWarga, jumlahPenerimaBantuan FROM jorong';
        
        console.log('Executing query:', queryJorong);
        
        const [results] = await db.query(queryJorong);
        
        console.log('Query results:', results);

        if (results && results.length > 0) {
            results.forEach(row => {
                const jumlahWarga = parseInt(row.jumlahWarga) || 0;
                const jumlahPenerimaBantuan = parseInt(row.jumlahPenerimaBantuan) || 0;
                
                totalWarga += jumlahWarga;
                totalPenerimaBantuan += jumlahPenerimaBantuan;
                
                jorongData.push({
                    id: row.id,
                    namaJorong: row.namaJorong || 'Tidak Diketahui',
                    jumlahWarga: jumlahWarga,
                    jumlahPenerimaBantuan: jumlahPenerimaBantuan
                });
            });
        }

        res.render('users/pendudukuser', {
            title: 'Data Kependudukan - Nagari Tikalak',
            totalWarga: totalWarga,
            totalPenerimaBantuan: totalPenerimaBantuan,
            jorongData: jorongData,
            potensi: [],
            errorMessage: null
        });

    } catch (err) {
        console.error('Error fetching jorong data for user dashboard:', err);
        
        res.render('users/pendudukuser', {
            title: 'Data Kependudukan - Nagari Tikalak',
            totalWarga: 0,
            totalPenerimaBantuan: 0,
            jorongData: [],
            potensi: [],
            errorMessage: 'Gagal memuat data kependudukan dari server. Silakan coba lagi nanti.'
        });
    }
});

module.exports = router;
