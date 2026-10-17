# 12-FilmSync — Geçmiş Kayıtlardan Derlenen Mimari Kararlar

> Bu dosya projedeki geçmiş mimari ve geliştirme kayıtlarından derlenmiştir.

### R3. Teleparty Stilinde Sağ Dikey Sohbet Sidebarı ve Kontrol Paneli
**Kaynak Dosya:** `ORIGINAL_REQUEST.md`
Sayfa yapısını bozmadan sağa yerleşen, video boyutunu sola kaydırıp daraltan 330px genişliğinde dikey bir sohbet paneli enjekte edilmelidir. En sağda dikey mini araç çubuğu (TP logosu, sohbet gizle/göster, link kopyala, çıkış butonları) bulunmalıdır.

---

### Düzeltildi / Kalıcı Çözüm
**Kaynak Dosya:** `SYSTEM_CHANGELOG.md`
**Temiz Modüler Mimari (`extension/modules/`):** 2.350+ satırlık dev monolitik `content.js` dosyası 5 bağımsız ve modüler yapıya bölündü:
  1. `modules/utils.js`: Zaman biçimlendirme (`formatTime`), film sayfası izolasyon doğrulama (`checkIsMoviePage`), toast ve bildirim araçları.
  2. `modules/playerAdapter.js`: Tüm web sitelerinde (HDFilmCehennemi, Netflix, YouTube, Custom HTML5 players) `try-catch` korumalı ve çökmesiz `play/pause/seek` adaptörü.
  3. `modules/chatUI.js`: Teleparty dikey sohbet paneli, mesaj kutusu, uçan emoji reaksiyonları, klavye dinleyicileri ve DOM yönetimi.
  4. `modul

---

### Düzeltildi / Kalıcı Çözüm
**Kaynak Dosya:** `SYSTEM_CHANGELOG.md`
**"Film Sayfasına Git 🎬" Butonunun Daima Görünür Yapılması (`popup.html` & `popup.js`):** Oda aktif olduğunda Pop-up üzerinde parlak kırmızı gradient stilinde "Film Sayfasına Git 🎬" butonu daima görünür kılındı. REST API ile oda film adresi alınıp sekme tek tıkla o filme yönlendirilir.
- **Sağ Üst Kapatılabilir Canlı Bildirim Kartı (`showMovieRedirectBanner`):** Oda yeni bir dizi bölümü veya film başlattığında kullanıcı henüz o sayfada değilse sağ üst köşede kapatılabilir (x butonlu) ve şık "Yeni Bölüm / Film Başlatıldı! 🍿" kartı belirir. "İzle 🍿" tıklandığında anında o bölüme yönlendirilir.
-

---

### Key Decisions Made
**Kaynak Dosya:** `BRIEFING.md`
Netflix ve Disney+ için sayfa bağlamına enjekte edilen `inject.js` üzerinden API kontrolü yapılması.
- YouTube ve Genel HTML5 oynatıcıları için doğrudan `content.js` bağlamında element kontrollerinin sağlanması.

---

### 2. Netflix API Entegrasyon Detayları
**Kaynak Dosya:** `analysis.md`
Netflix, standart HTML5 `<video>` elementi üzerinde doğrudan seek veya play/pause işlemlerine izin vermez (DRM ve Cadmium oynatıcı mimarisi nedeniyle). Bu nedenle işlemlerin, sayfa bağlamına (main world) enjekte edilen `inject.js` üzerinden Netflix Cadmium API kullanılarak gerçekleştirilmesi gerekir.

---

### A. YouTube Oynatıcı Kontrolleri
**Kaynak Dosya:** `analysis.md`
YouTube'da kontrol, sayfadaki `.html5-video-player` class'ına sahip element üzerinden API fonksiyonları çağrılarak yapılır:
- **Play:** `ytPlayer.playVideo()` veya fallback `<video>.play()`
- **Pause:** `ytPlayer.pauseVideo()` veya fallback `<video>.pause()`
- **Seek:** `ytPlayer.seekTo(seconds, true)` veya fallback `<video>.currentTime = seconds`

---

### 2. Logic Chain (Mantıksal Zincir)
**Kaynak Dosya:** `handoff.md`
1. Gözlem #1 ve #4'e göre; Netflix ve Disney+ oynatıcılarının (Cadmium ve MediaPlayer API) web sitelerindeki kısıtlamaları ve DRM yapıları gereği, isolated world (content.js) bağlamından kontrol edilmeleri mümkün değildir. Bu nedenle sayfa bağlamında (main world) çalışan `inject.js` dosyasının kullanılması zorunludur.
2. Gözlem #4'e göre; Disney+ desteği eklemek için `inject.js`'e `disney-web-player` MediaPlayer API kontrolleri ve tıklama fallback'leri eklenmelidir.
3. Gözlem #4'e göre; `content.js` içindeki `PlayerAdapter` play/pause/seek eylemleri sırasında Disney+ tespit edildiğinde Netflix

---

### 3. Caveats (Kısıtlamalar ve Varsayımlar)
**Kaynak Dosya:** `handoff.md`
**Disney+ Bölge Değişiklikleri:** Disney+'ın bazı ülkelerde (örneğin Ortadoğu - Disney+ Mena) farklı bir altyapı (Hotstar) kullandığı gözlemlenmiştir. Teleparty kodunda `disney` ve `disneymena` olarak iki ayrı klasör olması bunu doğrulamaktadır. Bu analiz, global Disney+ altyapısını (`disney-web-player` ve `mediaPlayer` API) referans almıştır.
- **DRM ve Reklam (Ad) Durumları:** Oynatma esnasında reklam araları girdiğinde senkronizasyonun geçici olarak askıya alınması gerekebilir. Eşitleme motoru (Milestone 2) geliştirilirken reklam durumları göz önünde bulundurulmalıdır.

---

---

### # 2. DOM Etkileşim Simülasyonu (Fallback)
**Kaynak Dosya:** `analysis.md`
API'nin yüklenemediği veya erişilemediği durumlarda, Teleparty'nin kullandığı Shadow DOM buton tetikleme mekanizması işletilir.

*   **Play İşlemi:**
    `toggle-play-pause` Shadow DOM yapısındaki oynat butonuna tıklanır:
    ```javascript
    const player = document.querySelector(".btm-media-player") || document.querySelector("disney-web-player");
    if (player) player.click(); // Kontrolleri uyandır
    
    const toggleBtn = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("toggle-play-pause");
    const playBtn = toggleBtn?.shadowRoot?.querySelector(".play-button");


---

### 4. 2026 Luminous Frosted Glass & Host-Isolated Typography Mimarisi
**Tarih:** 2026-09-12
**Bağlam:** Netflix ve yüksek çözünürlüklü ekranlarda FilmSync fontlarının aşırı küçülmesi, bildirim toastlarının zor okunması ve sağ sohbet panelinin opak siyah `#141414` ile videoyu kapatması/engellemesi sorunu.
**Kararlar:**
1. **Mutlak Piksel Tipografi Standardı:** İğnelenen (injected) içerik scriptlerinde (`content.js`) ve popup dosyalarında `rem` birimleri tamamen yasaklandı; çünkü `rem` daima ana sayfanın (`html`) kök boyutuna bağlanır (Netflix'te 10px / %62.5). Tüm metin, başlık, balon ve toastlar net `px` (`15.5px` balon, `18px` başlık, `15px` toast başlık, `17px` toast gövde, `15px` netflix başlangıç butonu) ve `!important` kuralına bağlandı. `#filmsync-root` kapsayıcısına taban `font-size: 16px !important;` atandı.
2. **2026 Luminous Frosted Glass Cam Mimarisi:** `#filmsync-chat-panel` için `backdrop-filter: blur(20px) saturate(180%)`, `rgba(13, 15, 25, 0.45)` yarı saydam arka plan ve `border-left: 1px solid rgba(255, 255, 255, 0.16)` cam sınırı getirildi. `#filmsync-messages` opak zemin yerine `background: transparent !important` yapıldı. Bu sayede arkadaki video akışı örtülmez, sinematik bir tül zerafetinde görünür.
3. **Tam Boy Video Akışı (Full-Bleed Immersion):** Önceden videoyu `width: calc(100% - 270px)` ile zorla sıkıştıran ve arkasında siyah boşluk bırakan kural kaldırılarak video tam ekran akışında bırakıldı; cam panel videonun sağ kenarında sinematik bir tül gibi süzülür.
4. **Genişletilmiş Dinamik Toast Konteyneri (`#filmsync-toast-container`):** Bildirimler üst üste binmek yerine şık cam kartlar halinde dikey yığınlanır (360px genişlik, 15px başlık, 17px gövde, en fazla 3 adet, süre metin uzunluğuna göre 5s-12s arası dinamik ölçeklenir). Sistem katılım bildirimleri de panel kapalıyken toast olarak iletilir.
5. **1920px+ (Full HD, 2K, 4K) Duyarlı Ölçekleme:** Büyük ekranlarda okunabilirliğin korunması için `@media (min-width: 1920px)` ile panel genişliği 320px'e, toast kartları 390px'e, metinler 16.5px-18px'e ölçeklenir.
6. **Stil Tekilleştirme & Bellek Hijyeni:** Dinamik eklenen `<style>` etiketi `filmsync-injected-styles` ID'si ile tekilleştirildi ve `removeChatUI` ile bellekten temizlenmesi garanti altına alındı.

---

### 5. Chat-First Klavye Önceliği & Double-Escape Tam Ekran Koruması Mimarisi
**Tarih:** 2026-09-12  
**Bağlam:** Kullanıcının video izleme sırasında sohbeti birincil etkileşim kanalı olarak konumlandırması; video kısayollarının (F, M, Space vb.) videoyu etkilemesi yerine doğrudan mesaj kutusunu tetiklemesi ve Escape tuşunun tam ekrandan istem dışı çıkışı engellemesi talebi.  
**Kararlar:**
1. **Chat-First Keyboard Priority (Alfanümerik Tuşlar & Space):** F (tam ekran), M (sessize alma), Space (oynat/duraklat), J, K, L vb. tüm video oynatıcı klavye kısayolları capture fazında yakalanıp engellenir (`e.preventDefault()`, `e.stopPropagation()`, `e.stopImmediatePropagation()`). Alfanümerik tuşlar ve Space sohbet panelini anında açar, `messageInput`'a odaklanır ve basılan karakteri mesaja yazar.
2. **Sadece Ok Tuşları Muafiyeti (Arrow Keys Pass-Through):** Yalnızca `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` ok tuşları video oynatıcıya serbestçe geçirilir; çünkü ok tuşları metin yazımında kullanılmaz ve ileri/geri sarma ile ses ayarı için gereklidir.
3. **Double-Escape Fullscreen Guard (Gecikmeli Çift Basış Koruması):** Sohbet paneli açıkken veya input odaktayken `Escape` tuşuna basıldığında SADECE sohbet paneli kapatılır ve input odağı kaldırılır; tam ekrandan çıkış KESİNLİKLE engellenir (`preventDefault`). Panel kapandıktan sonra 1000ms içinde ikinci kez hızlıca `Escape` basılırsa tam ekrandan çıkışa izin verilir.
4. **Değişmez Mimari Standart:** Bu kural projenin temel etkileşim sözleşmesidir; sonraki geliştirmelerde bozulamaz.



