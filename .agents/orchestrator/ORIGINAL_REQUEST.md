# Original User Request

## Initial Request — 2026-07-12T19:48:39+03:00

FilmSync eklentisini, `/Users/bekir/Uygulamalarim/12-FilmSync/teleparty` dizinindeki orijinal Teleparty kaynak kodlarını inceleyip tersine mühendislikle analiz ederek; dikey sohbet paneli, buffering algılayıcı, host kontrolü, uçan emojiler ve gelişmiş çoklu platform video senkronizasyon yeteneklerine sahip birebir bir watch party uygulamasına dönüştürmek.

Working directory: `/Users/bekir/Uygulamalarim/12-FilmSync`
Integrity mode: development

## Requirements

### R1. Çoklu Platform Video Senkronizasyon Motoru (Netflix, YouTube, Disney+ ve Genel HTML5)
Eklenti; Netflix'in Cadmium oynatıcı API'si, YouTube'un HTML5 oynatıcısı, Disney+ oynatıcısı ve genel HTML5 video elementine sahip tüm web sitelerini başarıyla tespit edip kontrol etmelidir. Orijinal Teleparty eklenti kodlarındaki (`teleparty/content_scripts/` ve `teleparty/lib/`) adaptör mantıkları deobfuscate edilerek analiz edilebilir ve entegre edilebilir.

### R2. Gelişmiş Senkronizasyon ve Sapma (Drift) Dengeleme
Firebase Realtime Database (RTDB) üzerinden odadaki üyelerin zaman sapmaları (drift) izlenmeli, sapma 1.5 saniyeden büyük olduğunda yumuşak seek ile süreler eşitlenmelidir. Oynatma, duraklatma ve seek olaylarında döngüsel tetiklenmeleri (ping-pong etkisi) engelleyecek debounce/kilitleme mekanizmaları kurulmalıdır.

### R3. Teleparty Stilinde Sağ Dikey Sohbet Sidebarı ve Kontrol Paneli
Sayfa yapısını bozmadan sağa yerleşen, video boyutunu sola kaydırıp daraltan 330px genişliğinde dikey bir sohbet paneli enjekte edilmelidir. En sağda dikey mini araç çubuğu (TP logosu, sohbet gizle/göster, link kopyala, çıkış butonları) bulunmalıdır.

### R4. Buffering, Emojiler ve Netflix Detay Entegrasyonu
Üyelerin video yüklenme (buffering) durumları Firebase'e yazılmalı ve panelde gösterilmelidir. Sohbet altında emoji reaksiyon barı bulunmalı ve tıklanan reaksiyonlar video üzerinde yüzen emojiler olarak yukarı uçmalıdır. Netflix film detay sayfalarında "Start a FilmSync" butonu yer almalıdır.

### R5. Popup Arayüzünün Avatar ve Host Kontrolüne Göre Güncellenmesi
Eklenti popup arayüzü Teleparty tarzında avatar seçici (🍿, 🍕, 🍔, 🍪, 🍩, 🔥) ve "Sadece Host Kontrolü" switch seçeneği içerecek şekilde güncellenmeli ve bu ayarlar Firebase RTDB ile entegre edilmelidir.

## Acceptance Criteria

### Video Playback & Sync
- [ ] Eklenti, Netflix ve YouTube üzerinde video tespit edildiğinde dikey toolbar ve sidebar'ı başarıyla render etmeli ve video alanını sola kaydırarak daraltmalıdır.
- [ ] Bir sekmedeki play/pause/seek olayları Firebase RTDB'ye hatasız yazılmalı ve aynı odaya bağlı diğer sekmelerdeki oynatıcıyı 1.5 saniye içinde senkronize etmelidir.
- [ ] Oynatma ve seek işlemlerinde sonsuz oynatma/durdurma döngüleri (ping-pong) yaşanmamalıdır.
- [ ] Sadece Host Kontrolü (hostOnly) aktif olduğunda, host olmayan kullanıcıların oynatıcı kontrolleri engellenmeli/oda sahibi durumuna geri çekilmelidir.

### UI/UX & Sohbet
- [ ] Sohbet paneli içinden mesajlaşma, canlı kullanıcı listesi, kullanıcı avatarları ve buffering durum göstergesi anlık olarak çalışmalıdır.
- [ ] Reaksiyon emojilerine basıldığında veya Firebase'e düştüğünde video üzerinde yüzen emojiler render edilmelidir.
- [ ] Netflix film detay sayfalarında "Start a FilmSync" butonu çıkmalı ve tıklandığında filmi başlatıp otomatik oda kurmalıdır.
