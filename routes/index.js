const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/dashboard', (req, res) => {
  db.query("SELECT * FROM perangkat_nagari", (err, results) => {
    if (err) {
      console.error(err);
      return res.render('users/dashboard', { perangkat: [] });
    }
    res.render('users/dashboard', { perangkat: results });
  });
});

module.exports = router;
