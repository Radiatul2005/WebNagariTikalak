var express = require('express');
var router = express.Router();

// Contoh endpoint API
router.get('/', function(req, res, next) {
  res.json({ message: 'API works!' });
});

module.exports = router;
