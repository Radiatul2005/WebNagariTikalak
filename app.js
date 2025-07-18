// app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Load environment variables
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var wilayahRouter = require('./routes/wilayah');
var apiRouter = require('./routes/api');
var adminRouter = require('./routes/admin');
var pendudukRouter = require('./routes/penduduk'); // Tetap import route penduduk
var jorongRouter = require('./routes/jorong');
var beritaRouter = require('./routes/berita'); // Tetap import route penduduk
var beritaPublicRouter = require('./routes/beritaPublic'); 

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Security: Helmet with CSP - Sesuaikan scriptSrc dan connectSrc
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://cdnjs.cloudflare.com"], // Hapus gstatic.com
      imgSrc: ["'self'", "data:", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://*.googleusercontent.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com"], // Hapus Firestore dan Auth
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'none'"]
    }
  }
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.'
});
app.use(limiter);

// Compression
const compression = require('compression');
app.use(compression());

// CORS
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true
}));

// Basic middleware
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Static files with cache control
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Global variables for EJS views - Hapus variabel Firebase
app.use((req, res, next) => {
  res.locals.siteName = 'Nagari Tikalak';
  res.locals.currentYear = new Date().getFullYear();
  res.locals.googleMapsApiKey = process.env.Maps_API_KEY || '';
  res.locals.baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.locals.currentPath = req.path;
  // HAPUS BARIS INI: res.locals.firebaseConfig = process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : {};
  // HAPUS BARIS INI: res.locals.initialAuthToken = process.env.INITIAL_AUTH_TOKEN || '';
  // HAPUS BARIS INI: res.locals.appId = process.env.APP_ID || 'default-app-id';
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wilayah', wilayahRouter);
app.use('/api', apiRouter); // Anda bisa menggunakan ini untuk API penduduk atau membuat yang terpisah
app.use('/admin', adminRouter);
app.use('/penduduk', pendudukRouter); // Daftarkan route penduduk
app.use('/jorong', jorongRouter);
app.use('/berita', beritaRouter); // Daftarkan route berita
app.use('/berita-public', beritaPublicRouter); // Daftarkan route berita publik

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${res.locals.baseUrl}/sitemap.xml`);
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${res.locals.baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${res.locals.baseUrl}/wilayah</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
    <url>
    <loc>${res.locals.baseUrl}/penduduk</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`);
});

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// 404 handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.error(`Error ${err.status || 500}: ${err.message}`);
  console.error(err.stack);

  res.status(err.status || 500);
  if (err.status === 404) {
    res.render('errors/404', {
      title: 'Halaman Tidak Ditemukan',
      url: req.originalUrl
    });
  } else if (err.status === 500) {
    res.render('errors/500', {
      title: 'Kesalahan Server Internal'
    });
  } else {
    res.render('error');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;