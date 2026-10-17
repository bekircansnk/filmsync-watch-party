const express = require('express');
const path = require('path');
const fs = require('fs');
const { buildExtensionZipBuffer, generateZipFile } = require('./scripts/build_extension_zip');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Her başlatmada güncel ZIP paketini oluştur
try {
  generateZipFile();
} catch (err) {
  console.error('[FilmSync] Başlangıç ZIP oluşturma hatası:', err);
}

// Tüm yanıtlarda eski önbellek (stale cache) tutulmasını engelle
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Doğrudan Eklenti ZIP İndirme Rotası (Her çağrıda en güncel extension/ klasörünü paketler)
app.get(['/film-partisi-extension.zip', '/api/download-extension'], (req, res) => {
  try {
    const extDir = path.join(__dirname, 'extension');
    const zipBuffer = buildExtensionZipBuffer(extDir);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="film-partisi-extension.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    return res.send(zipBuffer);
  } catch (err) {
    console.error('[FilmSync] ZIP indirme hatası:', err);
    const staticZip = path.join(__dirname, 'docs', 'film-partisi-extension.zip');
    if (fs.existsSync(staticZip)) {
      return res.download(staticZip, 'film-partisi-extension.zip');
    }
    return res.status(500).send('Eklenti paketi oluşturulamadı.');
  }
});

// Statik dosyalar (/docs ve /extension)
app.use(express.static(path.join(__dirname, 'docs'), { etag: false, lastModified: false }));
app.use('/extension', express.static(path.join(__dirname, 'extension'), { etag: false, lastModified: false }));

// SPA ve davet parametresi (?join=ABCD) fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`[FilmSync] Server running at http://${HOST}:${PORT}`);
});
