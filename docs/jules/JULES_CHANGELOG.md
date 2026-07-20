# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [20.07.2026] - Hafıza Sızıntısı ve Firebase Dinleyici Optimizasyonları
- **Bellek Yönetimi İyileştirmeleri:**
  - `extension/content.js` dosyasındaki uzun süreli sekmelerde oluşabilecek bellek sızıntılarını önlemek için global `setInterval` değişkenleri eklendi (`videoTrackingInterval`, `driftCorrectionInterval`, `uiKeeperInterval`, `iframeFullscreenKeeperInterval`).
  - Yeni interval atanmadan önce `clearInterval` kullanılarak eski intervallerin temizlenmesi sağlandı.
- **Firebase ve Sayfa Temizliği:**
  - `cleanupFirebase()` fonksiyonu, tüm `.on()` dinleyicilerini (hostId, hostOnly dahil) düzgünce temizleyecek şekilde güncellendi. Sorgular üzerindeki callback'lerin kaldırılması için kesin sorgu referanslarına `.off()` eklendi.
  - Oynatıcı olaylarını ve intervalleri tamamen temizlemek için isimlendirilmiş bir `handlePageTeardown` fonksiyonu oluşturuldu ve `beforeunload` ile birlikte `pagehide` olaylarına bağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
