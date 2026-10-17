# FilmSync — Canlı Bilgi Tabanı (Living Knowledge Base)

> **Proje:** FilmSync (Evo & Beko Watch Party)  
> **Konum:** `/Users/bekir/Uygulamalarim/12-FilmSync`  
> **Mimari Türü:** Manifest V3 Bağımsız WebExtension + Firebase Realtime Database  
> **Son Güncelleme:** 2026-09-12  

---

## 1. Mimari Genel Bakış
FilmSync, kullanıcıların Netflix, Disney+, YouTube ve HTML5 video platformları üzerinde senkronize video izlemesini ve eşzamanlı sohbet etmesini sağlayan modern bir Watch Party tarayıcı eklentisidir.

### Temel Katmanlar:
1. **Background Service Worker (`extension/background.js`):**
   - URL değişimlerini ve sekme geçişlerini izler.
   - Sadece aktif video izleme sayfalarında (`netflix.com/watch/`, `youtube.com/watch` vb.) tetiklenir; browse sayfalarında ağ ve CPU tasarrufu sağlar.
   - Firebase REST API üzerinden oda kurulumu ve yönetimi yapar.
2. **Content Script (`extension/content.js`):**
   - Sayfa DOM'u ile etkileşime geçer; video elementlerini ve oynatıcı durumunu izler.
   - 2026 Luminous Frosted Glass arayüzünü (sağ çekmece paneli, mini araç çubuğu ve dinamik bildirim kartları) enjekte eder.
   - Firebase Realtime Database websocket bağlantısını sürdürür ve saat kayması (clock skew) telafisi yapar.
3. **Inject Script (`extension/inject.js`):**
   - Sayfanın kendi JavaScript bağlamında (window context) çalışır.
   - Netflix Cadmium Player (`netflix.appContext.state.playerApp.getAPI().videoPlayer`) ve React Fiber ağacı (derinlik 35) üzerinden özel video kontrollerine erişir.
   - `window.postMessage` köprüsü üzerinden Content Script ile iki yönlü iletişim kurar.
4. **Kullanıcı Kokpiti (`extension/popup.html` & `popup.js`):**
   - Oda oluşturma, 4 harfli kod ile katılma, açık odalar listesi ve rol ayrımı (Host / Misafir).

---

## 2. Senkronizasyon ve Oynatma Motoru (Sync Engine)
- **Saat Kayması (Clock Skew) Telafisi:** İstemci ile sunucu arasındaki `clientTime - serverTime` farkını hesaplayarak remote seek değerine ekler; ağ gecikmelerinden kaynaklanan sapmaları sıfırlar.
- **Soft Drift vs. Hard Seek:**
  - `|Δt| <= 0.4s`: Kusursuz senkron (müdahale yok).
  - `0.4s < |Δt| <= 2.5s`: Soft drift (oynatma hızı 0.95x veya 1.05x yapılarak tampon bozmadan yumuşak yakalama).
  - `|Δt| > 2.5s`: Hard seek (oynatıcı doğrudan hedef saniyeye atlar).
- **Ping-Pong Döngü Kırıcı:** Programatik olarak uygulanan play/pause/seek emirleri sonrası 1200ms soğuma penceresi (suppression cooldown) tetiklenir; istemcinin kendi uyguladığı emri Firebase'e geri yansıtması önlenir.
- **Netflix 1500ms Keyframe Seek Deadband:** Netflix oynatıcısı keyframe sınırlarına kilitlendiği için 1.5 saniyenin altındaki seek istekleri yutulur; döngüsel geri sekme engellenir.
- **Pending Play Queue (Buffer Güvenliği):** Video henüz `readyState < 3` veya buffering aşamasındayken gelen play emirleri kuyruğa alınır ve `canplay` / `playing` anında güvenle yürütülür (siyah ekran koruması).

---

## 3. 2026 Luminous Frosted Glass UI / UX Tasarımı
- **Görsel Geçirgenlik (Full-Bleed Immersion):**
  - Sağ çekmece paneli (`#filmsync-chat-panel`), `background: rgba(13, 15, 25, 0.45) !important` ve `backdrop-filter: blur(20px) saturate(180%) !important` ile arkadaki video akışını engellemez, sinematik bir cam tülü gibi hissettirir.
  - `#filmsync-messages` şeffaf zemin (`background: transparent !important`) kullanır.
  - Video konteynerleri daraltılmaz; video arka planda tam ekran olarak akmaya devam eder.
- **Kontrast ve Okunabilirlik:**
  - Başlıklar, kullanıcı adları ve mesaj balonları ince kenarlıklar (`border: 1px solid rgba(255, 255, 255, 0.16)`) ve gölgeler (`text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6)`) ile parlak video sahnelerinde dahi kristal netliğinde okunur.
- **Dinamik Yığınlanan Cam Toast Kartları (`#filmsync-toast-container`):**
  - Minimum 360px genişliğinde, 15px başlık ve 17px gövde boyutuyla TV ve uzak monitör izlemelerinde mükemmel okunabilirlik.
  - En fazla 3 kart yığınlanır (FIFO), mesaj uzunluğuna göre 5s ile 12s arasında dinamik süreyle ekranda kalır.
  - Panel açıkken gereksiz toast gösterilmez; panel kapalıyken sistem katılım bildirimleri ve arkadaş mesajları anında gösterilir.

---

## 4. Host-Proof Tipografi İzolasyonu
- **Sıfır `rem` Kuralı:** İğnelenen eklenti arayüzlerinde (`content.js`, `popup.html`, `popup.js`) `rem` birimleri tamamen yasaklanmıştır.
- **Kök Sayfa Bağışıklığı:** Netflix'in `html { font-size: 10px; }` veya dinamik kök boyut manipülasyonlarının eklentiyi küçültmesi, mutlak `px` değerleri ve `!important` kuralıyla tamamen engellenmiştir.
- **1920px+ Duyarlı Ölçekleme:** 1080p, 1440p ve 4K ekranlarda metinlerin küçülmemesi için `@media (min-width: 1920px)` sorgusu ile panel 320px, toast 390px, metinler 16.5px-18px seviyesine orantılı ölçeklenir.

---

## 5. Bellek ve Kaynak Hijyeni
- **Stil Tekilleştirme:** `createChatUI` içinde stil etiketi `filmsync-injected-styles` ID'si ile denetlenir; mükerrer `<style>` enjeksiyonları önlenir ve `removeChatUI` ile bellekten temizlenir.
- **Observer Teardown:** Sayfa `/watch` moduna girdiğinde browse buton gözlemcisi derhal `.disconnect()` edilir; CPU yükü %0'a indirilir.
- **Fare Hareketi Throttling:** 60/120 FPS fare hareketleri 150ms aralıkla sınırlandırılarak DOM reflow fırtınaları engellenir.

---

## 6. Chat-First Klavye Etkileşimi & Double-Escape Tam Ekran Koruması
- **Chat-First Klavye Önceliği:** Video izleme sırasında alfanümerik tüm tuşlar ve Boşluk (Space) tuşu video oynatıcı kısayollarını (tam ekran, sessize alma, duraklatma vb.) capture fazında bloke eder. Sohbet panelini anında açar, mesaj giriş kutusunu odaklar, basılan karakteri mesaja aktarır ve imleci metnin sonuna taşır.
- **Odak İzolasyonu (Yalnızca Mesaj Girişi Muaf):** Panel açıkken panel içi başka bir öğeye (reaksiyon butonları, mesaj geçmişi, başlık kontrolleri) tıklanmış olsa dahi harf/boşluk tuşuna basıldığında mesaj giriş kutusu odaklanır ve metin yazılır. Sadece kullanıcı doğrudan `messageInput` içindeyken tarayıcının doğal karakter girişine izin verilir.
- **Sadece Ok Tuşları İzinli (Video Scrubbing):** Metin girişinde kullanılmayan `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` tuşları video oynatıcıya serbestçe aktarılır; izleyici videoyu ileri/geri sarabilir ve sesi ayarlayabilir. Mesaj yazılırken ise ok tuşları mesaj içi imleç hareketi için input içinde tutulur (`stopPropagation`).
- **Double-Escape Fullscreen Guard & Keyboard Lock:** Sohbet paneli açıkken veya mesaj yazarken `Escape` tuşuna basıldığında tam ekrandan çıkış engellenir (`e.preventDefault()`), sadece sohbet paneli gizlenir ve input odağı kaldırılır. Chromium tarayıcılarda tam ekranda Escape kaçışını engellemek için `navigator.keyboard.lock(['Escape'])` devrededir. İzleyici tam ekrandan çıkmak isterse, panel kapandıktan sonraki 1000ms içinde ikinci kez `Escape` tuşuna basmalıdır; bu durumda klavye kilidi çözülür ve `document.exitFullscreen()` ile tam ekrandan çıkılır.
- **Değişmez Kural:** Bu etkileşim modeli kalıcı ve ihlal edilemez bir mimari kuraldır.

