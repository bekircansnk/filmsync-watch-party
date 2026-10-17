// Pure Node.js ZIP Builder for Film Partisi Chrome Extension (Zero external dependencies)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 Table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function collectFiles(dir, baseDir = dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip backup icon directories to keep the extension zip lean and fast
      if (entry.name.startsWith('icons_')) continue;
      collectFiles(fullPath, baseDir, list);
    } else if (entry.isFile()) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      // Hem doğrudan kök dizinde (Chrome Web Store & doğrudan klasör seçimi için)
      // hem de extension/ alt klasöründe barındırarak %100 uyumluluk sağlar
      list.push({ fullPath, zipPath: relPath });
      list.push({ fullPath, zipPath: `extension/${relPath}` });
    }
  }
  return list;
}

function buildExtensionZipBuffer(extensionDir) {
  const files = collectFiles(extensionDir);
  const localFileParts = [];
  const centralDirParts = [];
  let offset = 0;

  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

  for (const file of files) {
    const rawData = fs.readFileSync(file.fullPath);
    const uncompressedSize = rawData.length;
    const fileCrc = crc32(rawData);
    const compressedData = zlib.deflateRawSync(rawData, { level: 9 });
    const compressedSize = compressedData.length;
    const nameBuf = Buffer.from(file.zipPath, 'utf8');

    // Local File Header (30 bytes + file name)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4);         // Version needed (2.0)
    localHeader.writeUInt16LE(0x0800, 6);     // General purpose bit flag (UTF-8)
    localHeader.writeUInt16LE(8, 8);          // Compression method: Deflate (8)
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(fileCrc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);         // Extra field length

    localFileParts.push(localHeader, nameBuf, compressedData);

    // Central Directory Header (46 bytes + file name)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Signature
    centralHeader.writeUInt16LE(20, 4);         // Version made by
    centralHeader.writeUInt16LE(20, 6);         // Version needed
    centralHeader.writeUInt16LE(0x0800, 8);     // UTF-8 flag
    centralHeader.writeUInt16LE(8, 10);         // Deflate
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(fileCrc, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);         // Extra field length
    centralHeader.writeUInt16LE(0, 32);         // File comment length
    centralHeader.writeUInt16LE(0, 34);         // Disk number
    centralHeader.writeUInt16LE(0, 36);         // Internal file attributes
    centralHeader.writeUInt32LE(0, 38);         // External file attributes
    centralHeader.writeUInt32LE(offset, 42);    // Relative offset of local header

    centralDirParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressedData.length;
  }

  const centralDirBuffer = Buffer.concat(centralDirParts);
  const endOfCentralDir = Buffer.alloc(22);
  endOfCentralDir.writeUInt32LE(0x06054b50, 0); // Signature
  endOfCentralDir.writeUInt16LE(0, 4);          // Disk number
  endOfCentralDir.writeUInt16LE(0, 6);          // Central dir start disk
  endOfCentralDir.writeUInt16LE(files.length, 8);
  endOfCentralDir.writeUInt16LE(files.length, 10);
  endOfCentralDir.writeUInt32LE(centralDirBuffer.length, 12);
  endOfCentralDir.writeUInt32LE(offset, 16);
  endOfCentralDir.writeUInt16LE(0, 20);         // Comment length

  return Buffer.concat([...localFileParts, centralDirBuffer, endOfCentralDir]);
}

function generateZipFile() {
  const extDir = path.join(__dirname, '../extension');
  const outZipPath = path.join(__dirname, '../docs/film-partisi-extension.zip');
  const zipBuf = buildExtensionZipBuffer(extDir);
  fs.writeFileSync(outZipPath, zipBuf);
  console.log(`✅ Eklenti ZIP paketi oluşturuldu: ${outZipPath} (${(zipBuf.length / 1024).toFixed(1)} KB)`);
  return zipBuf;
}

if (require.main === module) {
  generateZipFile();
}

module.exports = { buildExtensionZipBuffer, generateZipFile };
