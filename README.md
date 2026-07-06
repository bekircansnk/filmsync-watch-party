# 🍿 FilmSync Watch Party (Hybrid: Local & Firebase Bulut)

[TR] FilmSync, arkadaşlarınızla aynı anda senkronize film/dizi izlemenizi ve ekran üzerinde yüzen cam efektli (Glassmorphic) sohbet penceresi ile mesajlaşmanızı sağlayan modern bir tarayıcı eklentisidir.

[EN] FilmSync is a modern browser extension that allows you to watch movies/TV shows in sync with your friends and chat using a floating Glassmorphic chat interface on the same screen.

---

## ✨ Features / Özellikler

- **Dual Mode (Lokal / Bulut):** 
  - *Local Mode:* Test immediately on your own machine using the local WebSocket server without any cloud setup.
  - *Cloud Mode:* Connect instantly to Google Firebase Realtime Database for serverless synchronization with friends globally.
- **Glassmorphic Floating Chat:** Beautiful floating chat bubble and window injected directly onto the page with Apple-style neumorphic/glass effects.
- **Keyboard Shortcut (Enter):** Press `Enter` on any page to open the chat window, type your message, and hit `Enter` again to send (zero distractions).
- **Fullscreen Support:** The chat interface automatically appends itself inside the fullscreen element so you can continue chatting in fullscreen.
- **Password Protection:** Set optional passwords when hosting rooms to prevent unauthorized access.
- **Online Members List:** View active users in your room in real-time.

---

## 🚀 Installation Guide / Kurulum Kılavuzu

### [TR] Türkçe Kurulum Adımları
1.  **Projeyi İndirin:** Bu depoyu bilgisayarınıza ZIP olarak indirin ve klasöre çıkartın.
2.  **Eklenti Sayfasına Gidin:** Google Chrome tarayıcınızdan **`chrome://extensions/`** adresine gidin.
3.  **Geliştirici Modunu Açın:** Sayfanın sağ üst köşesinde bulunan **"Geliştirici modu"** (Developer mode) seçeneğini aktif edin.
4.  **Eklentiyi Yükleyin:** Sol üstte beliren **"Paketlenmemiş öğe yükle"** (Load unpacked) butonuna tıklayın ve depodan çıkardığınız **`extension`** klasörünü seçip onaylayın.
5.  **Yerel Sunucuyu Başlatma (Lokal Test İçin):**
    - `12-FilmSync` klasöründe terminal açın.
    - Bağımlılıkları yüklemek için: `pnpm install` veya `npm install`
    - Sunucuyu çalıştırmak için: `npm run backend:start` veya `node backend/server.js`

---

### [EN] English Installation Steps
1.  **Download Project:** Download this repository as a ZIP file to your computer and extract it.
2.  **Go to Extensions Page:** Open Google Chrome and navigate to **`chrome://extensions/`**.
3.  **Enable Developer Mode:** Turn on the **"Developer mode"** toggle in the top right corner.
4.  **Load the Extension:** Click the **"Load unpacked"** button in the top left and select the **`extension`** folder from the extracted files.
5.  **Start Local Server (For Local Testing):**
    - Open a terminal in the `12-FilmSync` directory.
    - Install dependencies: `pnpm install` or `npm install`
    - Start the server: `npm run backend:start` or `node backend/server.js`

---

## ⚡ Firebase Cloud Configuration / Firebase Bulut Yapılandırması

[TR] Eklentinin içinde varsayılan olarak paylaşılan ücretsiz bir Google Firebase Realtime Database projesi tanımlıdır. Eğer kendi özel ve bağımsız veritabanınızı kurmak isterseniz:
1.  [Firebase Console](https://console.firebase.google.com) üzerinden ücretsiz bir Firebase projesi oluşturun.
2.  **Realtime Database** servisini aktif edin ve okuma/yazma kurallarını test moduna (public) ayarlayın.
3.  Projenizin Web SDK yapılandırmasını kopyalayın.
4.  Kopyaladığınız bilgileri eklenti içindeki **`extension/content.js`** dosyasındaki `defaultFirebaseConfig` alanına yapıştırın.

[EN] By default, a shared free Google Firebase Realtime Database project is configured. To configure your own private and independent database:
1.  Create a free Firebase project on [Firebase Console](https://console.firebase.google.com).
2.  Enable **Realtime Database** and set read/write rules to test mode (public).
3.  Copy your Web SDK configuration credentials.
4.  Replace the `defaultFirebaseConfig` values inside the **`extension/content.js`** file with your new credentials.
