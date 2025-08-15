// app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var app = express();
var mysql = require('mysql'); // Pastikan ini ada

// Load environment variables
require('dotenv').config();

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'web-nagari' 
});
// ===========================================
// Import all your routers
// ===========================================
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var wilayahRouter = require('./routes/wilayah');
var apiRouter = require('./routes/api');
var adminRouter = require('./routes/admin');
var pendudukRouter = require('./routes/penduduk');
var jorongRouter = require('./routes/jorong');
var beritaRouter = require('./routes/berita');
var beritaPublicRouter = require('./routes/beritapublic'); 
var pendudukuserRouter = require('./routes/pendudukuser');
var potensiRouter = require('./routes/potensi');
var potensiuserRouter = require('./routes/potensiuser');
var kelompoktaniRouter = require('./routes/kelompoktani');
var kelompokternakRouter = require('./routes/kelompokternak');
var umkmRouter = require('./routes/umkm');
var lolieRouter = require('./routes/lolie');
var yanceRouter = require('./routes/yance');
var makcikRouter = require('./routes/makcik'); 
var kakmiaRouter = require('./routes/kakmia'); 
var bundaRouter = require('./routes/bunda'); // Assuming you have a bunda route
var apbnRouter = require('./routes/apbn'); // Import APBN router

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ===========================================
// --- PENTING: LOKASI YANG DIPERBAIKI ---
// Middleware express-session HARUS di sini,
// SEBELUM semua rute yang menggunakannya.
// ===========================================
app.use(session({
    secret: 'nagari-tikalak-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ===========================================
// Security, Rate Limiting, Compression, CORS, dll.
// ===========================================
const helmet = require('helmet');
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://*.googleusercontent.com", "https://tse3.mm.bing.net", "http://localhost:*", "https://localhost:*", "*"],
            connectSrc: ["'self'", "https://maps.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameSrc: ["'none'"]
        }
    }
}));

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.'
});
app.use(limiter);

const compression = require('compression');
app.use(compression());

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global variables for EJS views
app.use((req, res, next) => {
    res.locals.siteName = 'Nagari Tikalak';
    res.locals.currentYear = new Date().getFullYear();
    res.locals.googleMapsApiKey = process.env.Maps_API_KEY || '';
    res.locals.baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    res.locals.currentPath = req.path;
    next();
});

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

db.connect(function(err) {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + db.threadId);
});
// ===========================================
// Rute Anda sekarang akan menggunakan session
// ===========================================
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wilayah', wilayahRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/penduduk', pendudukRouter);
app.use('/jorong', jorongRouter);
app.use('/berita', beritaRouter);
app.use('/berita-public', beritaPublicRouter);
app.use('/pendudukuser', pendudukuserRouter);
app.use('/potensi', potensiRouter);
app.use('/potensiuser', potensiuserRouter);
app.use('/kelompoktani', kelompoktaniRouter);
app.use('/kelompokternak', kelompokternakRouter);
app.use('/umkm', umkmRouter);
app.use('/lolie', lolieRouter); 
app.use('/yance', yanceRouter);
app.use('/makcik', makcikRouter);
app.use('/kakmia', kakmiaRouter);
app.use('/bunda', bundaRouter); // Assuming you have a bunda route
app.use('/admin/apbn', apbnRouter(db)); // Use APBN router

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com"
  );
  next();
});
// Health check and sitemap routes
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Sitemap: ${res.locals.baseUrl}/sitemap.xml`);
});

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

// 404 handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.error(`Error ${err.status || 500}: ${err.message}`);
    if (err.stack) {
        console.error(err.stack);
    }

    res.status(err.status || 500);
    if (err.status === 404) {
        res.render('errors/404', {
            title: 'Halaman Tidak Ditemukan',
            url: req.originalUrl
        });
    } else {
        res.render('errors/500', {
            title: 'Kesalahan Server Internal',
        });
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
