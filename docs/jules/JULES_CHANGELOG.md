# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [10.08.2026] - Bellek Sızıntısı ve Firebase Temizliği Optimizasyonu
- **Hata Düzeltmeleri ve Performans Optimizasyonları:**
  - `extension/content.js` içerisinde Firebase realtime database dinleyici kayıtları (hostId, hostOnly, son mesajlar ve reaksiyonlar) için `cleanupFirebase()` fonksiyonundaki eksik `.off()` çağrıları düzeltildi.
  - Uzun süren video oturumlarındaki bellek sızıntılarını önlemek için `startVideoTracking`, `startDriftCorrection`, `startUIKeeper` ve `startIframeFullscreenKeeper` içinde kullanılan `setInterval` çağrıları değişkenlere atanarak atanmadan önce `clearInterval` ile temizlenebilir hale getirildi.
  - Sekme değişimi veya sayfa yenilenmesi durumunda tüm interval'ları ve timeout'ları güvenle temizleyen `runTeardown` fonksiyonu oluşturuldu. `beforeunload` ve `pagehide` olaylarına bağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
