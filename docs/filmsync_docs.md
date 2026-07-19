# 🍿 FilmSync Watch Party - Teknik Dokümantasyon

FilmSync, arkadaşlarınızla her web sitesindeki HTML5 tabanlı videoları eşzamanlı olarak izlemenizi ve aynı ekran üzerinde cam efektli (Glassmorphic) yüzen sohbet arayüzü ile mesajlaşmanızı sağlayan modern bir uygulamadır.

---

## 🛠️ Sistem Mimarisi

Uygulama iki temel katmandan oluşmaktadır:

```
[ Tarayıcı / Eklenti ] <---(WebSocket)---> [ Node.js Sunucu (Backend) ]
         │
         ├── Content Script Injection (Sayfadaki Videoyu Yakalar)
         └── Yüzen Sohbet Arayüzü (Glassmorphic UI & Mesajlaşma)
```

### 1. Backend (`/backend/server.js`)
- Node.js ve saf `ws` (WebSocket) kütüphanesi kullanılmıştır.
- **Şifreli Oda Yönetimi:** Odalara katılmak için isteğe bağlı şifre tanımlanabilir.
- **Mesaj Dağıtımı:** Gelen sohbet mesajlarını odadaki herkese anlık yayınlar.
- **Aktif Üye Takibi:** Odadaki kullanıcıların online durumlarını takip eder ve listeyi günceller.

### 2. Chrome Eklentisi (`/extension`)
- **Content Script (`content.js`):**
  - Sayfadaki `<video>` etiketini aralıklarla tarayarak yakalar.
  - Sayfanın sağ alt köşesine Apple tarzı cam efektine sahip yüzen sohbet baloncuğu ve penceresini enjekte eder.
  - Video olaylarını (play/pause/seek) dinler ve sunucuyla eşitler.
  - **Klavye Kısayolu:** Sayfada `Enter` tuşuna basıldığında mesaj penceresi otomatik açılır ve input alanına odaklanır.
  - **Tam Ekran Uyumluluğu:** Tarayıcı tam ekran yapıldığında sohbet arayüzü tam ekran olan elementin altına programatik olarak taşınır.
- **Popup UI (`popup.html` / `popup.js`):**
  - Kullanıcı adı, Oda Kodu, Şifre ve Sunucu bilgilerini `chrome.storage.local` üzerinde saklar.

---

## 🚀 Kurulum ve Test

### Eklentiyi Yükleme
1.  Chrome tarayıcısında `chrome://extensions/` adresine gidin.
2.  **Geliştirici modu** seçeneğini aktif edin.
3.  **Paketlenmemiş öğe yükle** diyerek `/12-FilmSync/extension` klasörünü seçin.

### Sunucuyu Başlatma
Projenin kök dizininde şu komutla sunucuyu başlatabilirsiniz:
```bash
pnpm backend:start
```
Varsayılan olarak sunucu `ws://localhost:4000` adresinde yayına başlar.
