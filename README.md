# 📂 ConvFile - Professional PDF & Document Tool

**ConvFile** adalah aplikasi web serbaguna (All-in-One) untuk mengelola, mengompres, dan mengonversi berbagai jenis dokumen (PDF, Word, Excel, PPT, dan Gambar) secara instan. 

Aplikasi ini berjalan **100% di sisi klien (Client-Side)**. Artinya, semua proses dilakukan langsung di dalam browser Anda tanpa mengirim file ke server eksternal, sehingga menjamin **keamanan dan privasi** data Anda secara penuh.

## 🖥️ Tampilan Aplikasi

![Tampilan Awal ConvFile](screenshot/screenshot.png)

*Antarmuka pengguna ConvFile yang bersih dan modern. Gambar di atas menunjukkan fitur konversi Word ke PDF dengan tampilan jendela *workspace*.*

## ✨ Fitur Utama

ConvFile dibagi menjadi beberapa kategori alat utama untuk memudahkan pekerjaan dokumen Anda:

### 🛠️ Utilitas PDF
* **Merge PDF:** Gabungkan banyak file PDF menjadi satu dokumen tunggal.
* **Split PDF:** Pisahkan halaman-halaman dalam satu PDF menjadi file-file terpisah (diunduh dalam bentuk file `.zip`).
* **Compress PDF:** Perkecil ukuran file PDF Anda tanpa mengorbankan terlalu banyak kualitas.

### 📥 Konversi KE PDF
* **JPG/PNG ke PDF:** Ubah dan gabungkan satu atau beberapa gambar menjadi dokumen PDF berkualitas tinggi.
* **Word ke PDF:** Konversi dokumen `.doc` atau `.docx` menjadi PDF melalui metode Print/Cetak browser.
* **PPT ke PDF:** Ubah slide presentasi PowerPoint (`.ppt`, `.pptx`) menjadi dokumen PDF.
* **Excel ke PDF:** Cetak lembar kerja Excel (`.xls`, `.xlsx`) menjadi format PDF.

### 📤 Konversi DARI PDF
* **PDF ke Word:** Ekstrak teks dan layout dasar dari PDF untuk dijadikan dokumen Microsoft Word (`.doc`).
* **PDF ke PPT:** Ubah halaman PDF kembali menjadi slide teks PowerPoint.
* **PDF ke Excel:** Ekstrak data berbentuk tabel dari PDF ke dalam Spreadsheet Excel.
* **PDF ke JPG:** Ekstrak setiap halaman dalam PDF menjadi sekumpulan gambar JPG resolusi tinggi.
* **PDF ke PDF/A:** Konversi PDF biasa menjadi standar arsip jangka panjang (PDF/A).

### 🎨 Fitur Tambahan UI/UX
* **Dark Mode / Light Mode:** Mendukung tema gelap dan terang untuk kenyamanan mata.
* **Sistem Drag & Drop:** Unggah file dengan mudah hanya dengan menarik dan melepaskannya ke area yang disediakan.
* **Riwayat Konversi (Local History):** Melacak file yang baru saja Anda proses (disimpan secara lokal di browser).

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini murni menggunakan HTML, CSS, dan Vanilla JavaScript. Tidak perlu menginstal Node.js, NPM, atau *build tools* apapun.

1.  Unduh atau *clone* seluruh file proyek ini (`index.html`, `style.css`, `script.js`).
2.  Buka file `index.html` menggunakan browser modern (Google Chrome, Microsoft Edge, atau Mozilla Firefox sangat disarankan).
3.  Aplikasi siap digunakan! Pastikan Anda terhubung ke internet saat pertama kali memuat halaman agar browser dapat mengunduh library eksternal (CDN).

## 🧰 Library & Teknologi yang Digunakan

ConvFile memanfaatkan kekuatan pustaka *open-source* JavaScript untuk memproses dokumen langsung di browser:

* **[pdf.js](https://mozilla.github.io/pdf.js/)** - Untuk membaca dan merender dokumen PDF.
* **[pdf-lib](https://pdf-lib.js.org/)** - Untuk memanipulasi (Merge, Split) dan membuat dokumen PDF.
* **[jsPDF](https://parall.ax/products/jspdf)** - Generator PDF sisi klien (digunakan untuk Image ke PDF).
* **[SheetJS (xlsx)](https://sheetjs.com/)** - Untuk membaca, mengekstrak, dan menulis file Excel.
* **[PptxGenJS](https://gitbrent.github.io/PptxGenJS/)** - Untuk membuat dan menulis file PowerPoint.
* **[docx-preview](https://github.com/VolodymyrBaydalka/docxjs)** - Untuk merender tampilan dokumen Word sebelum dikonversi.
* **[JSZip](https://stuk.github.io/jszip/)** & **[FileSaver.js](https://github.com/eligrey/FileSaver.js)** - Untuk mengompres output menjadi `.zip` dan memicu proses unduhan.

## 🐛 Catatan Troubleshooting

**Penting:** Jika Anda mengalami kendala `Gagal: docx.renderAsync is not a function` saat menggunakan fitur Word ke PDF (seperti yang terlihat pada tangkapan layar), pastikan Anda **hanya** menggunakan library `docx-preview` dan telah menghapus pemanggilan script `docx@7.1.0` di dalam tag `<head>` pada file `index.html` untuk menghindari bentrokan penamaan variabel global.
