const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        const [potensiDataRaw] = await db.query(
            `SELECT id, nama_potensi, jenis, foto, deskripsi, latitude, longitude, tanggal_dibuat
             FROM potensi
             ORDER BY tanggal_dibuat DESC`
        );

        const potensiData = potensiDataRaw.map(item => {
            let lat = null;
            let long = null;

            if (item.latitude !== null && item.latitude !== undefined) {
                lat = parseFloat(item.latitude);
                if (isNaN(lat)) {
                    const latString = String(item.latitude);
                    if (!isNaN(parseFloat(latString))) {
                        lat = parseFloat(latString);
                    } else {
                        lat = null;
                    }
                }
            }

            if (item.longitude !== null && item.longitude !== undefined) {
                long = parseFloat(item.longitude);
                if (isNaN(long)) {
                    const longString = String(item.longitude);
                    if (!isNaN(parseFloat(longString))) {
                        long = parseFloat(longString);
                    } else {
                        long = null;
                    }
                }
            }

            return {
                ...item,
                latitude: lat,
                longitude: long
            };
        });

        res.render('users/potensiUser', {
            title: 'Potensi Nagari - Nagari Tikalak',
            potensi: potensiData
        });

    } catch (error) {
        res.status(500).render('errors/500', {
            title: 'Kesalahan Server Internal',
            message: 'Terjadi kesalahan saat memuat potensi nagari.',
            error: error
        });
    }
});

module.exports = router;
