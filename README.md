# WebAbsen-SpreadSheet - Google Sheets CRUD
Absensi menggunakan google spreadhseet api thingy idk

Aplikasi web sederhana untuk mengelola data kontak menggunakan Google Sheets sebagai database. Dilengkapi dengan tampilan **mobile friendly** berbasis **card view** yang nyaman digunakan di berbagai perangkat.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-lightgrey)

> [!WARNING]
> **Versi Alpha, Banyak bahayanya dan belom selesai**
> 
> Ini adalah proyek eksperimental dengan **TANPA autentikasi**. Siapa pun yang memiliki URL dapat **MENAMBAHKAN, MENGEDIT, atau MENGHAPUS** kontak mana pun.
> 
> **Gunakan hanya untuk:** Pengujian pribadi dengan data dummy
> 
> **JANGAN gunakan untuk:** Data produksi nyata atau informasi sensitif

> [!NOTE]
> **Status Saat Ini:** Alfa v0.1.0
> 
> - ❌ Tidak diperlukan login
> - ❌ Siapa pun dapat menghapus entri apa pun
> - ❌ Tidak ada sistem izin
> - ✅ Dasar CRUD berfungsi
> - ✅ Ramah seluler

> [!WARNING]
> **Risiko Kehilangan Data**
> 
> Setiap pengunjung dapat menghapus SEMUA kontak Anda dengan satu klik. Selalu simpan cadangan Google Sheet Anda.

> [!NOTE]
> **Pengujian Aman:**
> 1. Buat SALINAN spreadsheet Anda terlebih dahulu
> 2. Gunakan data palsu/uji saja
> 3. Jaga kerahasiaan URL
> 4. Periksa "Riwayat Versi" Google Sheets jika data terhapus

## ✨ Fitur Utama

- ✅ **Create** - Menambahkan kontak baru
- 📖 **Read** - Menampilkan daftar kontak dalam bentuk card
- ✏️ **Update** - Mengedit data kontak yang sudah ada
- 🗑️ **Delete** - Menghapus kontak dari database
- 📱 **Mobile Friendly** - Tampilan responsif yang optimal di HP
- 🃏 **Card View** - Kontak ditampilkan dalam card yang rapi
- 🔄 **Real-time Sync** - Data langsung tersimpan ke Google Sheets
- ⚡ **Loading States** - Indikator loading yang informatif
- 🎨 **Modern UI** - Desain bersih dengan efek sentuhan

## 📸 Tampilan Aplikasi

| Desktop View | Mobile View |
|-------------|-------------|
| Form dan daftar kontak dalam layout grid | Card-based layout yang nyaman disentuh |
| Tombol aksi yang jelas | Icon tombol yang lebih besar |

## 🛠️ Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Deployment**: Google Apps Script Web App + GitHub Pages / Local

## 📋 Prasyarat

Sebelum memulai, pastikan Anda memiliki:

- Akun Google (Gmail)
- Google Sheets yang dapat diakses
- Pengetahuan dasar tentang Google Apps Script
- Browser modern (Chrome, Firefox, Safari, Edge)

## 🚀 Cara Instalasi

### 1. Persiapan Google Sheets

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama "Kontak Manager"
3. Buat **4 kolom** dengan header:
   - `id` (kolom A)
   - `nama` (kolom B)
   - `email` (kolom C)
   - `pesan` (kolom D)

| id | nama | email | pesan |
|-------------|-------------|-------------|-------------|
| ID-1776411037479 | Nasi Goreng | mamaia@gmail.com | halo teman teman |

### 2. Setup Google Apps Script

1. Di spreadsheet yang sama, buka menu **Extensions → Apps Script**
2. Hapus kode default dan **copy-paste kode berikut**:

```javascript
var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

function doGet(e) {
  var action = e.parameter.action;
  
  if (action == 'read') {
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    try {
      var data = sheet.getDataRange().getValues();
      
      if (data.length < 2) {
        output.setContent(JSON.stringify([]));
        return output;
      }
      
      var headers = data[0];
      var result = [];
      
      for (var i = 1; i < data.length; i++) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = data[i][j];
        }
        result.push(obj);
      }
      
      output.setContent(JSON.stringify(result));
    } catch (error) {
      output.setContent(JSON.stringify({error: error.toString()}));
    }
    
    return output;
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    var id = params.id;
    
    // Pastikan sheet memiliki header yang benar
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.length < 4 || headers[0] !== 'id') {
      sheet.getRange(1, 1, 1, 4).setValues([['id', 'nama', 'email', 'pesan']]);
    }
    
    if (action == 'create') {
      var newId = "ID-" + new Date().getTime();
      sheet.appendRow([newId, params.nama, params.email, params.pesan]);
      
    } else if (action == 'update') {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
          sheet.getRange(i + 1, 2, 1, 3).setValues([[params.nama, params.email, params.pesan]]);
          break;
        }
      }
      
    } else if (action == 'delete') {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Deploy Web App

1. Klik tombol **Deploy → New deployment**
2. Pilih **Type: Web app**
3. Isi konfigurasi:
   - **Execute as**: `Me` (your account)
   - **Who has access**: `Anyone` (untuk testing) atau `Anyone with link`
4. Klik **Deploy**
5. **Copy URL** yang dihasilkan (contoh: `https://script.google.com/macros/s/.../exec`)
6. Klik **Authorize access** jika diminta

### 4. Konfigurasi Frontend

1. Buka file `index.html` (kode yang sudah diberikan)
2. Cari baris:
```javascript
const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
```
3. **Ganti** dengan URL Web App yang sudah di-copy
4. Simpan file

### 5. Menjalankan Aplikasi

**Cara 1: Local Testing**
- Buka file `index.html` langsung di browser
- Atau gunakan Live Server di VS Code

**Cara 2: Hosting Online**
- Upload ke GitHub Pages
- Upload ke Netlify / Vercel
- Atau gunakan hosting statis lainnya

## 📁 Struktur Proyek

```
kontak-manager/
│
├── index.html          # File utama aplikasi (HTML, CSS, JS)
├── README.md           # Dokumentasi proyek
└── LICENSE             # File lisensi (opsional)
```

## 🔧 Penggunaan Aplikasi

### Menambah Kontak
1. Isi form **Nama**, **Email**, dan **Pesan**
2. Klik tombol **"+ Tambah Kontak"**
3. Data akan langsung tersimpan dan muncul di daftar kontak

### Mengedit Kontak
1. Klik tombol **✏️ (Edit)** pada card kontak yang ingin diubah
2. Form akan terisi dengan data kontak
3. Ubah data sesuai kebutuhan
4. Klik **"💾 Simpan Perubahan"**
5. Data akan diperbarui

### Menghapus Kontak
1. Klik tombol **🗑️ (Delete)** pada card kontak
2. Konfirmasi penghapusan
3. Data akan dihapus dari database

### Melihat Data di Spreadsheet
- Klik link **"📊 Lihat Spreadsheet"** di header
- Akan membuka Google Sheets yang terhubung

## 📱 Responsive Design

Aplikasi ini dirancang untuk bekerja optimal di berbagai ukuran layar:

- **Desktop (> 700px)**: Form horizontal, card grid
- **Tablet (481px - 700px)**: Form adaptif, card full-width
- **Mobile (< 480px)**: Form vertikal, card dengan padding lebih besar

## 🔒 Keamanan

- **CORS**: Menggunakan mode `no-cors` untuk menghindari error
- **Input Sanitization**: HTML escaping untuk mencegah XSS
- **Validasi Form**: Nama dan Email wajib diisi
- **Konfirmasi Hapus**: Mencegah penghapusan tidak sengaja

## 🐛 Troubleshooting

### Data tidak muncul
- **Solusi**: Periksa URL Web App di kode JavaScript
- Pastikan script sudah di-deploy sebagai "Web App"
- Cek console browser (F12) untuk error

### CORS error
- **Solusi**: Sudah menggunakan `mode: 'no-cors'` di fetch
- Pastikan Web App di-set ke "Anyone" dapat mengakses

### Data tidak tersimpan
- **Solusi**: Cek koneksi internet
- Buka spreadsheet langsung untuk melihat apakah ada data baru
- Cek log eksekusi di Google Apps Script (View → Logs)

### Tombol tidak berfungsi
- **Solusi**: Refresh halaman (Ctrl+F5)
- Hapus cache browser
- Coba buka di mode incognito

## 🚢 Deployment ke GitHub Pages

1. Buat repository baru di GitHub
2. Upload file `index.html` ke repository
3. Buka **Settings → Pages**
4. Pilih branch `main` sebagai source
5. Aplikasi akan live di `https://username.github.io/repo-name`

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur-keren`)
3. Commit perubahan (`git commit -m 'Menambah fitur keren'`)
4. Push ke branch (`git push origin fitur-keren`)
5. Buat Pull Request

## 📝 To-Do List

- [ ] Pencarian kontak real-time
- [ ] Filter berdasarkan kategori
- [ ] Export data ke CSV
- [ ] Upload foto kontak
- [ ] Dark mode
- [ ] Notifikasi push
- [ ] Multiple sheets support

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail.

## 👨‍💻 Kontak & Dukungan

- **Issues**: [GitHub Issues](https://github.com/yourusername/kontak-manager/issues)
- **Email**: your.email@example.com
- **Demo**: [Live Demo](https://your-demo-link.com)

## 🙏 Acknowledgments

- Google Apps Script Documentation
- Font Awesome (untuk icon inspirasi)
- Komunitas open source

---

## ⭐ Jika proyek ini bermanfaat

Berikan ⭐ di GitHub dan bagikan ke teman-teman Anda!

**Dibuat dengan ❤️ untuk memudahkan manajemen kontak**
