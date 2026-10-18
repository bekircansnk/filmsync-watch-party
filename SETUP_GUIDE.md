# 🚀 Film Partisi — Geliştirici ve Kurulum Rehberi (SETUP GUIDE)

---
title: "Film Partisi Geliştirici ve Ortam Kurulum Kılavuzu"
document_type: "SETUP_GUIDE"
version: "1.2.0"
date: "2026-10-17"
audience: "DEVELOPER"
---

Bu rehber, **Film Partisi (FilmSync)** projesini GitHub'dan sıfır bir bilgisayara veya yeni bir çalışma ortamına klonlayıp geliştirmeye devam etmek için gereken tüm adımları içerir.

---

## 📋 1. Ön Gereksinimler

- **İşletim Sistemi:** macOS (Önerilen), Linux veya Windows
- **Tarayıcı:** Google Chrome, Brave, Microsoft Edge veya Safari (macOS)
- **Node.js:** v18.0 veya üzeri (Doğrulama test paketini çalıştırmak için)
- **Git & SSH:** GitHub hesabınızda kayıtlı SSH anahtarı (`id_ed25519` veya `id_rsa`)

---

## 📥 2. Projeyi GitHub'dan Klonlama

Terminali açın ve repoyu klonlayın:

```bash
git clone git@github.com:bekircansnk/filmsync-watch-party.git
cd filmsync-watch-party
```

---

## 🔑 3. Firebase Yapılandırması ve Anahtar Yönetimi

FilmSync, gerçek zamanlı oda ve durum eşitlemesi için **Firebase Realtime Database (RTDB)** altyapısını kullanır.

### Yapılandırma Dosyaları:
Firebase istemci yapılandırması şu 2 dosyada tanımlıdır:
- `extension/content.js` (Satır ~1-15)
- `extension/popup.js` (Satır ~1-15)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBckyDBVxN6xFC5bBKkiyxNvww5seXRM1U",
  authDomain: "movieparty-af87f.firebaseapp.com",
  databaseURL: "https://movieparty-af87f-default-rtdb.firebaseio.com",
  projectId: "movieparty-af87f",
  storageBucket: "movieparty-af87f.firebasestorage.app",
  messagingSenderId: "563223702114",
  appId: "1:563223702114:web:00815dcbe7645d83b83f3b",
  measurementId: "G-4KR5X5Y4ZS"
};
```

> 🔒 **Geliştirici Notu:** Kendi Firebase projenizi açmak isterseniz:
> 1. [Firebase Console](https://console.firebase.google.com)'a gidin.
> 2. Yeni bir proje açın ve **Realtime Database** oluşturun.
> 3. `database.rules.json` dosyasındaki güvenlik kurallarını Firebase Console > Realtime Database > Rules sekmesine yapıştırıp yayınlayın.
> 4. Web uygulaması ekleyip aldığınız `firebaseConfig` objesini `popup.js` ve `content.js` dosyalarına girin.

---

## 🧩 4. Eklentiyi Tarayıcıya Yükleme (Geliştirici Modu)

FilmSync saf JavaScript (Vanilla JS, Manifest V3) mimarisiyle yazıldığından **derleme (build/npm run) gerektirmez**. Doğrudan tarayıcıya yüklenebilir.

### Google Chrome / Brave / Edge için:
1. Tarayıcınızda adres çubuğuna `chrome://extensions` yazın (Brave için `brave://extensions`).
2. Sağ üst köşedeki **"Geliştirici Modu" (Developer Mode)** anahtarını açın.
3. Sol üstteki **"Paketlenmemiş Öğe Yükle" (Load unpacked)** butonuna tıklayın.
4. Açılan dosya seçim penceresinde projenin içindeki **`extension/`** klasörünü seçin.
5. Film Partisi uzantısı tarayıcı araç çubuğunuza eklenecektir!

### Kod Değişikliklerini Canlıya Alma:
- Kodlarda (`popup.js`, `content.js`, `manifest.json` vb.) değişiklik yaptığınızda `chrome://extensions` sayfasına gidip Film Partisi kartındaki **Yenile (Döngü ikonu)** butonuna basmanız yeterlidir.
- Sayfayı yenilediğinizde yeni kodlar derhal yürürlüğe girer.

---

## 🧪 5. Doğrulama Testlerini Çalıştırma (Verification Suite)

Projede 63 adet kritik senaryoyu (URL normalizasyonu, Netflix Cadmium API zırhı, XSS korumaları, clock skew toleransı, double-escape tam ekran koruması vb.) test eden otomatik bir doğrulama paketi mevcuttur.

Yeni bir geliştirme yaptıktan sonra testleri çalıştırmak için:

```bash
node scripts/verify_filmsync.js
```

**Beklenen Çıktı:**
```
--- FilmSync Test Suite Başlatılıyor ---
✅ Test 1: URL Trailing Slash Normalizasyonu Başarılı.
...
✅ Test 63: 2026 Frosted Glass (Cam Efekti) Bütüncül UI/UX ve Tasarım Tutarlılığı Başarılı.

🎉 TÜM TESTLER (63/63) EKSİKSİZ VE BAŞARIYLA GEÇTİ! ALTYAPI KUSURSUZ, STABİL VE YÜKSEK PERFORMANSLI.
```

---

## 🍎 6. macOS Safari Web Extension Olarak Derleme (Opsiyonel)

Projeyi Safari için yerel bir macOS uygulaması (`Film Partisi.app`) olarak paketlemek isterseniz:

```bash
bash scripts/build_safari_app.sh
```

Bu script Objective-C `clang` derleyicisini çalıştırır, Safari extension sandbox entitlements'larını tanımlar ve `/tmp/filmsync_safari_build/Film Partisi.app` çıktısını üretir.

---

## 🛠️ 7. Geliştirme Protokolü ve Katkı Kuralları

- **Kod Standartları:** Türkçe arayüz metinleri, İngilizce değişken ve fonksiyon adları.
- **Git Dal Stratejisi:** Geliştirmeler için `mac/<ozellik-adi>` veya `feature/<ozellik-adi>` dalı açın; değişiklikleri commit edip uzaka push edin.
- **Test Şartı:** Kod tabanına dokunulduğunda `node scripts/verify_filmsync.js` çalıştırılarak 0 hata teyit edilmelidir.
