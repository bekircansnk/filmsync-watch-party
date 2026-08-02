# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [02.08.2026] - Bellek Sızıntısı (Memory Leak) ve Firebase Temizliği Düzeltmeleri
- **Hata Düzeltmeleri & Optimizasyon:**
  - `extension/content.js` içerisinde Firebase Realtime Database listener (.on) çağrıları için eksik kalan ve bellek sızıntısına yol açan `.off()` temizlik işlemleri eklendi. `.limitToLast()` gibi özel sorgular, doğru unsubscribe için sorgu objeleriyle birebir eşleştirilerek güncellendi. Ayrıca `hostId` ve `hostOnly` dinleyicileri de temizlik rutinine dâhil edildi.
  - Video izleme (video tracking), otomatik senkronizasyon (drift correction), UI koruma (UI keeper) ve Iframe tam ekran (fullscreen keeper) işlevlerini yöneten `setInterval` döngüleri için referans değişkenleri eklendi ve bu interval'ler yeniden atanmadan önce `clearInterval` kullanılarak önceki görevlerin bellek sızıntısına yol açması engellendi.
  - Olası kalıntıları önlemek adına sekme kapanırken (`beforeunload`) ve gizlenirken (`pagehide`) tüm bu interval'leri ve veritabanı dinleyicilerini düzgünce temizleyecek yapı kuruldu.
  - `extension/content.js` içerisindeki sözdizimi hatası (hatalı Regex escape kullanımı) onarıldı.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
