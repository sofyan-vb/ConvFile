const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());

// Setup penyimpanan file sementara
const upload = multer({ dest: 'uploads/' });

// Endpoint: Word to PDF
app.post('/convert/word-to-pdf', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Tidak ada file yang diunggah.');
    }

    // Baca file yang baru diupload
    const inputPath = req.file.path;
    const outputFormat = '.pdf';

    fs.readFile(inputPath, (err, data) => {
        if (err) {
            return res.status(500).send('Gagal membaca file.');
        }

        // Proses Konversi
        libre.convert(data, outputFormat, undefined, (err, done) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Gagal melakukan konversi. Pastikan LibreOffice terinstal.');
            }

            // Kirim file PDF kembali ke Frontend
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=hasil-konversi.pdf');
            res.send(done);

            // Bersihkan file sementara (hapus file upload)
            fs.unlinkSync(inputPath); 
        });
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    console.log(`Siap menerima request konversi...`);
});