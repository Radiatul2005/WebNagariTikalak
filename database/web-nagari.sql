-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 19, 2025 at 03:27 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `web-nagari`
--

-- --------------------------------------------------------

--
-- Table structure for table `berita`
--

CREATE TABLE `berita` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `isi_berita` text NOT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `author` varchar(100) DEFAULT 'Admin Nagari'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `berita`
--

INSERT INTO `berita` (`id`, `judul`, `isi_berita`, `gambar`, `status`, `tanggal_dibuat`, `tanggal_update`, `author`) VALUES
(1, 'Mahasiswa KKN UNAND Ditugaskan di Nagari Tikalak', 'Nagari Tikalak, 7 Juli 2025 – Sebanyak 21 mahasiswa Universitas Andalas (UNAND) memulai kegiatan Kuliah Kerja Nyata (KKN) di Nagari Tikalak, Kecamatan Lintau Buo, Kabupaten Tanah Datar. Kegiatan ini akan berlangsung dari 7 Juli hingga 18 Agustus 2025, dengan tema utama \"Pemberdayaan UMKM Lokal Menuju Kemandirian Ekonomi Nagari.\"\r\n\r\nSelama masa pengabdian, para mahasiswa akan mendampingi pelaku UMKM di Nagari Tikalak dalam berbagai hal, seperti:\r\n\r\npelatihan pemasaran digital,\r\n\r\ndesain kemasan produk,\r\n\r\npencatatan keuangan sederhana,\r\n\r\ndan optimalisasi penggunaan media sosial untuk promosi.\r\n\r\nWali Nagari Tikalak, [nama wali nagari], menyampaikan apresiasi atas penempatan mahasiswa KKN di wilayahnya. “Kami menyambut baik kehadiran mahasiswa UNAND. Semoga kehadiran mereka membawa semangat baru dalam mengembangkan potensi UMKM lokal,” ujarnya.\r\n\r\nKegiatan pembukaan KKN ditandai dengan serah terima mahasiswa dari pihak kampus kepada pemerintah nagari, yang dilanjutkan dengan diskusi bersama pelaku usaha lokal guna menggali kebutuhan serta potensi yang bisa dikembangkan.\r\n\r\nKoordinator mahasiswa KKN, [nama koordinator], menjelaskan bahwa seluruh program yang disusun akan melibatkan masyarakat secara aktif, agar hasilnya berkelanjutan dan sesuai dengan kondisi lapangan.\r\n\r\nDengan semangat kolaborasi dan pengabdian, kehadiran 21 mahasiswa UNAND ini diharapkan dapat memberikan dampak positif bagi pertumbuhan ekonomi Nagari Tikalak, khususnya melalui sektor UMKM yang menjadi tulang punggung ekonomi lokal.', '/uploads/berita/berita-1752724236559-570316302.jpg', 'published', '2025-07-17 03:07:08', '2025-07-17 04:08:11', 'Admin Nagari'),
(2, 'Persiapan HUT RI di Lapangan Bola Tikalak', 'Ini Deskripsi', '/uploads/berita/berita-1755161655194-978837086.jpg', 'published', '2025-08-14 08:54:15', '2025-08-14 08:54:15', 'Admin Nagari');

-- --------------------------------------------------------

--
-- Table structure for table `bidang_anggaran`
--

CREATE TABLE `bidang_anggaran` (
  `id` int(11) NOT NULL,
  `tahun` year(4) NOT NULL,
  `nama_bidang` varchar(255) NOT NULL,
  `jumlah_anggaran` bigint(20) NOT NULL,
  `status` varchar(50) DEFAULT 'Aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bidang_anggaran`
--

INSERT INTO `bidang_anggaran` (`id`, `tahun`, `nama_bidang`, `jumlah_anggaran`, `status`, `created_at`, `updated_at`) VALUES
(7, '2025', 'Kesehatan', 100000000, 'Aktif', '2025-08-15 20:27:29', '2025-08-15 21:15:01'),
(8, '2025', 'Pendidikan', 10000000, 'Aktif', '2025-08-19 13:08:34', '2025-08-19 13:08:48');

-- --------------------------------------------------------

--
-- Table structure for table `jorong`
--

CREATE TABLE `jorong` (
  `id` int(11) NOT NULL,
  `namaJorong` varchar(100) NOT NULL,
  `jumlahWarga` int(11) DEFAULT 0,
  `jumlahPenerimaBantuan` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jorong`
--

INSERT INTO `jorong` (`id`, `namaJorong`, `jumlahWarga`, `jumlahPenerimaBantuan`) VALUES
(1, 'JORONG PASIA', 0, 0),
(2, 'JORONG TANGAH', 0, 0),
(3, 'JORONG BATU API', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `kelompok_tani`
--

CREATE TABLE `kelompok_tani` (
  `id` int(11) NOT NULL,
  `nama_kelompok` varchar(100) NOT NULL,
  `ketua_kelompok` varchar(100) NOT NULL,
  `jumlah_anggota` int(11) NOT NULL DEFAULT 0,
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_diperbarui` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelompok_tani`
--

INSERT INTO `kelompok_tani` (`id`, `nama_kelompok`, `ketua_kelompok`, `jumlah_anggota`, `tanggal_dibuat`, `tanggal_diperbarui`) VALUES
(1, 'Tikalak Tani Maju', 'Budi', 20, '2025-08-03 04:43:51', '2025-08-03 04:43:51');

-- --------------------------------------------------------

--
-- Table structure for table `kelompok_ternak`
--

CREATE TABLE `kelompok_ternak` (
  `id` int(11) NOT NULL,
  `nama_kelompok` varchar(100) NOT NULL,
  `ketua_kelompok` varchar(100) NOT NULL,
  `jumlah_anggota` int(11) NOT NULL DEFAULT 0,
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_diperbarui` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelompok_ternak`
--

INSERT INTO `kelompok_ternak` (`id`, `nama_kelompok`, `ketua_kelompok`, `jumlah_anggota`, `tanggal_dibuat`, `tanggal_diperbarui`) VALUES
(1, 'Pertenakan Tikalak', 'Budi 2', 10, '2025-08-06 03:40:16', '2025-08-06 03:40:16');

-- --------------------------------------------------------

--
-- Table structure for table `penduduk`
--

CREATE TABLE `penduduk` (
  `id` int(11) NOT NULL,
  `nama` text NOT NULL,
  `nik` text NOT NULL,
  `tanggalLahir` text NOT NULL,
  `alamat` text NOT NULL,
  `jorong` varchar(255) NOT NULL,
  `dapatBantuan` int(11) NOT NULL DEFAULT 0,
  `id_jorong` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penduduk`
--

INSERT INTO `penduduk` (`id`, `nama`, `nik`, `tanggalLahir`, `alamat`, `jorong`, `dapatBantuan`, `id_jorong`) VALUES
(10, 'Orang Pertama', '1234567890987653', '2012-12-12', 'tes', '', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `pengeluaran`
--

CREATE TABLE `pengeluaran` (
  `id` int(11) NOT NULL,
  `bidang_id` int(11) NOT NULL,
  `tanggal_pengeluaran` date NOT NULL,
  `keterangan` text NOT NULL,
  `jumlah_pengeluaran` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengeluaran`
--

INSERT INTO `pengeluaran` (`id`, `bidang_id`, `tanggal_pengeluaran`, `keterangan`, `jumlah_pengeluaran`, `created_at`, `updated_at`) VALUES
(9, 7, '2025-08-14', 'Posyandu', 500000, '2025-08-15 21:13:42', '2025-08-15 21:13:42'),
(10, 8, '2025-08-19', 'Dana Sekolah', 500000, '2025-08-19 13:09:06', '2025-08-19 13:09:06');

-- --------------------------------------------------------

--
-- Table structure for table `perangkat_nagari`
--

CREATE TABLE `perangkat_nagari` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `jabatan` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `perangkat_nagari`
--

INSERT INTO `perangkat_nagari` (`id`, `nama`, `jabatan`, `foto`) VALUES
(2, 'Struktur Organisasi', 'Semua Perangkat', '/uploads/struktur.jpg'),
(3, 'pak wali ini', 'Wali Nagari', '/uploads/wali-nagari.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `potensi`
--

CREATE TABLE `potensi` (
  `id` int(11) NOT NULL,
  `nama_potensi` varchar(255) NOT NULL,
  `jenis` enum('UMKM','Pariwisata','Budaya Lokal') NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `deskripsi` text NOT NULL,
  `tanggal_dibuat` datetime DEFAULT current_timestamp(),
  `tanggal_update` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `potensi`
--

INSERT INTO `potensi` (`id`, `nama_potensi`, `jenis`, `foto`, `deskripsi`, `tanggal_dibuat`, `tanggal_update`, `latitude`, `longitude`) VALUES
(7, 'Gudang Naga', 'UMKM', '/uploads/potensi/potensi-1752972788651-936901319.jpg', 'tes', '2025-07-20 07:53:08', '2025-07-20 07:53:08', -0.65692600, 100.59015600),
(8, 'Gudang Naga 2', 'Pariwisata', '/uploads/potensi/potensi-1755063116771-248320359.jpg', 'tes', '2025-08-13 12:31:57', '2025-08-13 12:31:57', -0.65692600, 100.59015600);

-- --------------------------------------------------------

--
-- Table structure for table `struktur_organisasi`
--

CREATE TABLE `struktur_organisasi` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `nip` varchar(30) DEFAULT NULL,
  `posisi` enum('kepala-nagari','sekretaris','kepala-urusan','staf') NOT NULL,
  `bidang` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `urutan` int(3) DEFAULT 0,
  `status_aktif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `struktur_organisasi`
--

INSERT INTO `struktur_organisasi` (`id`, `nama`, `nip`, `posisi`, `bidang`, `foto`, `urutan`, `status_aktif`, `created_at`, `updated_at`) VALUES
(1, 'H. Ahmad Syafrizal, S.Pd', '196805152000031001', 'kepala-nagari', 'Pemerintahan Nagari', 'uploads/kepala-nagari.jpg', 1, 1, '2025-08-06 06:31:06', '2025-08-06 06:31:06'),
(2, 'Dra. Siti Rahmawati', '197203101995032002', 'sekretaris', 'Administrasi & Kesekretariatan', 'uploads/sekretaris.jpg', 2, 1, '2025-08-06 06:31:06', '2025-08-06 06:31:06'),
(3, 'M. Yusuf, S.Sos', '198012252005021003', 'kepala-urusan', 'Kesejahteraan Rakyat', 'uploads/kaurkes.jpg', 3, 1, '2025-08-06 06:31:06', '2025-08-06 06:31:06'),
(4, 'Fitri Handayani, A.Md', '199005102015032001', 'kepala-urusan', 'Pemerintahan', 'uploads/kaurpem.jpg', 4, 1, '2025-08-06 06:31:06', '2025-08-06 06:31:06'),
(5, 'Dedi Kurniawan, S.Kom', '199112152018031002', 'staf', 'Administrasi Kependudukan', 'uploads/staf1.jpg', 5, 1, '2025-08-06 06:31:06', '2025-08-06 06:31:06'),
(6, 'Rina Sari, A.Md.Kom', '199203082019032001', 'staf', 'Pelayanan Publik', 'uploads/staf2.jpg', 6, 1, '2025-08-06 06:31:06', '2025-08-06 06:31:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'bang_oji', '$2b$10$P5iw9Vu4GgUckr7NOO2hg.ahI/SkSyhgk91DzSugb2dwmQVWsq8ky', '2025-07-12 09:19:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `berita`
--
ALTER TABLE `berita`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bidang_anggaran`
--
ALTER TABLE `bidang_anggaran`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jorong`
--
ALTER TABLE `jorong`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `namaJorong` (`namaJorong`);

--
-- Indexes for table `kelompok_tani`
--
ALTER TABLE `kelompok_tani`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kelompok_ternak`
--
ALTER TABLE `kelompok_ternak`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `penduduk`
--
ALTER TABLE `penduduk`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nik` (`nik`) USING HASH;

--
-- Indexes for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bidang_id` (`bidang_id`);

--
-- Indexes for table `perangkat_nagari`
--
ALTER TABLE `perangkat_nagari`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `potensi`
--
ALTER TABLE `potensi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `struktur_organisasi`
--
ALTER TABLE `struktur_organisasi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD KEY `idx_posisi` (`posisi`),
  ADD KEY `idx_status` (`status_aktif`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `berita`
--
ALTER TABLE `berita`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bidang_anggaran`
--
ALTER TABLE `bidang_anggaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `jorong`
--
ALTER TABLE `jorong`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kelompok_tani`
--
ALTER TABLE `kelompok_tani`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `kelompok_ternak`
--
ALTER TABLE `kelompok_ternak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `penduduk`
--
ALTER TABLE `penduduk`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `perangkat_nagari`
--
ALTER TABLE `perangkat_nagari`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `potensi`
--
ALTER TABLE `potensi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `struktur_organisasi`
--
ALTER TABLE `struktur_organisasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD CONSTRAINT `pengeluaran_ibfk_1` FOREIGN KEY (`bidang_id`) REFERENCES `bidang_anggaran` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
