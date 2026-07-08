# 🍿 FilmSync Watch Party (Firebase Bulut)

[TR] FilmSync, arkadaşlarınızla aynı anda senkronize film/dizi izlemenizi ve ekran üzerinde yüzen cam efektli (Glassmorphic) sohbet penceresi ile mesajlaşmanızı sağlayan modern bir Google Chrome tarayıcı eklentisidir.

[EN] FilmSync is a modern Google Chrome browser extension that allows you to watch movies/TV shows in sync with your friends and chat using a floating Glassmorphic chat interface on the same screen.

---

## ✨ Features / Özellikler

- **Cloud Mode (Firebase RTDB):** Google Firebase Realtime Database üzerinden tüm dünyadaki arkadaşlarınızla sunucusuz, sıfır gecikmeli süre senkronizasyonu.
- **Glassmorphic Floating Chat:** Sayfa üzerine doğrudan enjekte edilen, Apple tarzı yarı saydam şık sohbet balonu ve mesajlaşma arayüzü.
- **Keyboard Shortcut (Enter):** Sohbet panelini hızlıca açıp kapatmak için pratik `Enter` kısayolu.
- **Fullscreen Support:** Tam ekranda da kaybolmayan, video player'ın tam ekran elementinin içine kendisini otomatik taşıyan akıllı arayüz katmanı.
- **Password Protection:** Güvenli izleme partileri için şifreli oda kurma seçeneği.
- **Online Members List:** Odadaki diğer aktif katılımcıları canlı olarak görüntüleme.

---

## 🚀 Installation Guide / Kurulum Kılavuzu

### [TR] Türkçe Kurulum Adımları
1.  **Projeyi İndirin:** Bu depoyu bilgisayarınıza ZIP olarak indirin ve klasöre çıkartın.
2.  **Eklenti Sayfasına Gidin:** Google Chrome tarayıcınızdan **`chrome://extensions/`** adresine gidin.
3.  **Geliştirici Modunu Açın:** Sayfanın sağ üst köşesinde bulunan **"Geliştirici modu"** (Developer mode) seçeneğini aktif edin.
4.  **Eklentiyi Yükleyin:** Sol üstte beliren **"Paketlenmemiş öğe yükle"** (Load unpacked) butonuna tıklayın ve depodan çıkardığınız **`extension`** klasörünü seçip onaylayın.

---

### [EN] English Installation Steps
1.  **Download Project:** Download this repository as a ZIP file to your computer and extract it.
2.  **Go to Extensions Page:** Open Google Chrome and navigate to **`chrome://extensions/`**.
3.  **Enable Developer Mode:** Turn on the **"Developer mode"** toggle in the top right corner.
4.  **Load the Extension:** Click the **"Load unpacked"** button in the top left and select the **`extension`** folder from the extracted files.

---

## ⚡ Firebase Configuration / Firebase Yapılandırması

[TR] Eklentinin içinde varsayılan olarak tanımlı bir veritabanı bulunmaktadır. Kendi özel veritabanınızı entegre etmek isterseniz:
1.  [Firebase Console](https://console.firebase.google.com) üzerinden bir proje oluşturun.
2.  **Realtime Database** servisini aktif edip okuma/yazma kurallarını test moduna getirin.
3.  Web SDK yapılandırma bilgilerinizi kopyalayın.
4.  **`extension/content.js`** ve **`extension/popup.js`** dosyalarındaki `firebaseConfig` objelerini kendi bilgilerinizle güncelleyin.

[EN] To configure your own private Firebase Realtime Database:
1.  Create a project on [Firebase Console](https://console.firebase.google.com).
2.  Enable **Realtime Database** and set read/write rules to test mode.
3.  Copy your Web SDK configuration credentials.
4.  Update the `firebaseConfig` objects in both **`extension/content.js`** and **`extension/popup.js`** with your credentials.

