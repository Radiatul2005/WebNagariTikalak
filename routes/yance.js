// File: routes/yance.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('users/yance'); // Cukup panggil nama file EJS
});

module.exports = router;