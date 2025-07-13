const express = require('express');
const router = express.Router();

// Route untuk menampilkan peta wilayah Nagari Tikalak
router.get('/', (req, res) => { // This route handles requests to /wilayah because app.use('/wilayah', router)
    try {
        // Data yang akan dikirim ke view
        const data = {
            title: 'Peta Wilayah Nagari Tikalak',
            pageTitle: 'Wilayah - Nagari Tikalak',
            description: 'Peta interaktif wilayah Nagari Tikalak, X Koto Singkarak, Kabupaten Solok, Sumatera Barat',
            // Koordinat Nagari Tikalak
            coordinates: {
                lat: -0.6198,
                lng: 100.5598
            },
            // Informasi wilayah
            wilayahInfo: {
                nama: 'Nagari Tikalak',
                kecamatan: 'X Koto Singkarak',
                kabupaten: 'Solok',
                provinsi: 'Sumatera Barat',
                kodePos: '27365',
                ketinggian: '±500 mdpl',
                zonaWaktu: 'WIB (UTC+7)'
            },
            // Batas wilayah
            batasWilayah: {
                utara: 'Nagari Koto Baru',
                selatan: 'Nagari Sumani',
                timur: 'Danau Singkarak',
                barat: 'Nagari Paninjauan'
            },
            // API Key Google Maps (diteruskan melalui res.locals)
            googleMapsApiKey: res.locals.googleMapsApiKey // This will automatically get the key from app.js
        };

        // Render view wilayah.ejs - Assuming it's directly in 'views' folder
        res.render('users/wilayah', data); // <-- Changed from 'users/wilayah'
    } catch (error) {
        console.error('Error loading wilayah page:', error);
        res.status(500).render('errors/500', { // Render 500 error page if applicable
            title: 'Terjadi Kesalahan',
            message: 'Terjadi kesalahan saat memuat halaman wilayah',
            error: error
        });
    }
});

// Route for API wilayah data (if needed) - no changes here
router.get('/api/wilayah-data', (req, res) => {
    try {
        const wilayahData = {
            success: true,
            data: {
                koordinat: {
                    lat: -0.6198,
                    lng: 100.5598
                },
                nama: 'Nagari Tikalak',
                alamat: 'Nagari Tikalak, Kecamatan X Koto Singkarak, Kabupaten Solok, Sumatera Barat',
                kodePos: '27365',
                transportasi: [
                    'Jalan Raya Padang - Solok',
                    'Angkutan Umum tersedia',
                    'Akses ojek online'
                ],
                batasWilayah: {
                    utara: 'Nagari Koto Baru',
                    selatan: 'Nagari Sumani',
                    timur: 'Danau Singkarak',
                    barat: 'Nagari Paninjauan'
                }
            }
        };

        res.json(wilayahData);
    } catch (error) {
        console.error('Error fetching wilayah data:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data wilayah',
            error: error.message
        });
    }
});

// Route for route calculation (if needed backend integration) - no changes here
router.post('/api/calculate-route', (req, res) => {
    try {
        const { origin, travelMode } = req.body;
        
        if (!origin) {
            return res.status(400).json({
                success: false,
                message: 'Lokasi asal harus diisi'
            });
        }

        const routeRequest = {
            origin: origin,
            destination: 'Nagari Tikalak, X Koto Singkarak, Solok, Sumatera Barat',
            travelMode: travelMode || 'DRIVING',
            timestamp: new Date().toISOString()
        };

        console.log('Route calculation requested:', routeRequest);

        res.json({
            success: true,
            message: 'Permintaan rute berhasil diproses',
            data: routeRequest
        });
    } catch (error) {
        console.error('Error calculating route:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghitung rute',
            error: error.message
        });
    }
});

module.exports = router;