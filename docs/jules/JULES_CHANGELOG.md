# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [28.07.2026] - Bellek Sızıntısı ve Firebase Temizleme Düzeltmeleri
- **Hata Düzeltmeleri & İyileştirmeler:**
  - `extension/content.js` dosyasında `videoTrackingInterval`, `driftCorrectionInterval`, `uiKeeperInterval` ve `iframeFullscreenKeeperInterval` değişkenleri tanımlanarak `setInterval` çağrıları kontrol altına alındı. Birden çok interval oluşumu kaynaklı bellek sızıntılarını önlemek için her `setInterval` öncesi mevcut olan varsa `clearInterval` ile temizlendi.
  - `cleanupFirebase` fonksiyonu içindeki eksik Firebase olay dinleyici abonelik iptalleri eklendi (`hostId` ve `hostOnly`). `messages` ve `reactions` için çağrılan `.off()` metodu, kayıttakiyle birebir aynı sorgu kısıtı olacak şekilde (`.limitToLast(50).off()` ve `.limitToLast(5).off()`) güncellendi, böylece bellek sızıntıları engellendi.
  - Sayfa ayrılışında çalışan temizleme (teardown) kodları `handlePageUnload` isminde ayrı bir fonksiyona çıkarıldı. Yalnızca `beforeunload` değil, bellek yönetimi tavsiyelerine uygun şekilde `pagehide` olayına da bağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
