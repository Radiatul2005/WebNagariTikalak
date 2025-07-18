const express = require('express');
const router = express.Router();
const db = require('../database'); // Adjust path if your database.js is elsewhere

// GET route for the Jorong data page
// This route is defined as '/' because its actual base path will be set in app.js
router.get('/', async (req, res) => {
    try {
        // First, get all unique jorong names from the 'jorong' table
        // Assuming you have a 'jorong' table with a 'nama_jorong' column
        const [allJorongs] = await db.query(`SELECT namaJorong FROM jorong WHERE namaJorong IS NOT NULL`);

        // Initialize jorongMap with all jorongs, setting counts to 0
        const jorongMap = new Map();
        allJorongs.forEach(j => {
            // Only add if namaJorong is not null or undefined
            if (j.namaJorong) {
                jorongMap.set(j.namaJorong, {
                    nama_jorong: j.namaJorong,
                    jumlah_warga: 0,
                    jumlah_keluarga: 0, // Still 0 as no family identifier in 'penduduk'
                    jumlah_penerima_bantuan: 0
                });
            }
        });

        // Now, fetch data from the 'penduduk' table
        const [pendudukRows] = await db.query(`SELECT jorong, dapatBantuan FROM penduduk WHERE jorong IS NOT NULL`);

        // Iterate through 'penduduk' data to update counts in the map
        pendudukRows.forEach(row => {
            const jorongName = row.jorong;
            const isAidRecipient = row.dapatBantuan === 1;

            // Only update if the jorong exists in our initial list and is not null
            if (jorongName && jorongMap.has(jorongName)) {
                const jorongData = jorongMap.get(jorongName);
                jorongData.jumlah_warga++; // Increment citizen count

                if (isAidRecipient) {
                    jorongData.jumlah_penerima_bantuan++;
                }
            }
        });

        // Convert the map values to an array for rendering
        const processedJorongData = Array.from(jorongMap.values()).map(jorong => ({
            namaJorong: jorong.nama_jorong,
            jumlah_warga: jorong.jumlah_warga,
            jumlah_keluarga: jorong.jumlah_keluarga,
            jumlah_penerima_bantuan: jorong.jumlah_penerima_bantuan
        }));

        // Sort the data by jorong name for consistent display
        // Add null check to prevent localeCompare error
        processedJorongData.sort((a, b) => {
            const nameA = a.namaJorong || '';
            const nameB = b.namaJorong || '';
            return nameA.localeCompare(nameB);
        });

        res.render('admin/jorong', { jorongData: processedJorongData });

    } catch (err) {
        console.error('Error fetching jorong data:', err);
        // Render with an empty array or a specific error message if data fetching fails
        res.render('admin/jorong', { jorongData: [], error: 'Failed to load jorong data.' });
    }
});

module.exports = router;