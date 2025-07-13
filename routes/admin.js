const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database'); // sesuaikan path

// GET Login Page
router.get('/login', (req, res) => {
  res.render('admin/login');
});

// POST Login Process
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).send('DB error');

    if (results.length === 0) {
      return res.render('admin/login', { error: 'Username tidak ditemukan' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('admin/login', { error: 'Password salah' });
    }

    // Simpan sesi atau token sesuai kebutuhan
    res.redirect('/admin/dashboard');
  });
});

// GET Dashboard
router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard');
});

module.exports = router;
