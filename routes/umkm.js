const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('users/umkm');
});

module.exports = router;