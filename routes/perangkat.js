const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.query("SELECT * FROM perangkat_nagari WHERE jabatan = 'Wali Nagari' LIMIT 1", (err, results) => {
    if (err) throw err;
    const wali = results[0];
    res.render('dashboard', { wali }); // kirim data ke index.ejs
  });
});

module.exports = router;
