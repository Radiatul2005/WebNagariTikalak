const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  try {
    // Fetch perangkat_nagari data for the dashboard
    const [results] = await db.query("SELECT * FROM perangkat_nagari");
    res.render('users/dashboard', { perangkat_nagari: results });
  } catch (err) {
    console.error(err);
    res.render('users/dashboard', { perangkat_nagari: [] });
  }
});

router.get('/users/dashboard', async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM perangkat_nagari");
    res.render('users/dashboard', { perangkat_nagari: results });
  } catch (err) {
    console.error(err);
    res.render('users/dashboard', { perangkat_nagari: [] });
  }
});

module.exports = router;