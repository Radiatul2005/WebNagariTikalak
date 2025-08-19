# WebNagariTikalak

Website resmi **Nagari Tikalak** berbasis **Node.js** dan **Express.js**.  
Menyediakan informasi lengkap tentang pemerintahan, layanan publik, berita, dan potensi daerah Nagari Tikalak.

## 🌟 Fitur Utama
- **Profil Nagari** — informasi geografis, demografis, dan sejarah
- **Struktur Pemerintahan** — profil aparatur dan organisasi nagari
- **Berita & Pengumuman** — update kegiatan dan kebijakan
- **Potensi Daerah** — wisata, ekonomi, dan sumber daya alam
- **Kontak & Lokasi** — informasi kontak dan peta lokasi

## 🛠️ Teknologi
- **Backend**: Node.js, Express.js  
- **Frontend**: EJS, HTML5, CSS3, JavaScript  
- **Framework CSS**: Bootstrap  
- **Database**: MySQL (`web-nagari`)  

## 📋 Persyaratan Sistem
- Node.js >= 18  
- npm >= 9  
- MySQL >= 5.7  

## 🚀 Instalasi & Menjalankan Lokal
```bash
# Clone repository
git clone https://github.com/Radiatul2005/WebNagariTikalak.git
cd WebNagariTikalak

# Install dependency
npm install

# Setup database
mysql -u root -p -e "CREATE DATABASE web-nagari;"
mysql -u root -p web-nagari < database/web-nagari.sql

# Buat file .env di root proyek
cat > .env <<EOL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=web-nagari
PORT=3000
GOOGLE_MAPS_API_KEY=your_api_key_here
EOL

# Jalankan server
node app.js
# atau
npm start

# Akses di browser
# http://localhost:3000
