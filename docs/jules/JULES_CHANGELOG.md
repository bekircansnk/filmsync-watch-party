# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [25.07.2026] - Bellek Sızıntısı Optimizasyonları ve Temizlik
- **Performans Optimizasyonu ve Hata Giderme:**
  - `extension/content.js` dosyasında arka plan işlemleri (interval) için `videoTrackingInterval`, `driftCorrectionInterval`, `uiKeeperInterval`, `iframeKeeperInterval` değişkenleri tanımlandı.
  - İlgili başlatma fonksiyonlarında setInterval çağrılmadan önce `clearInterval` ile önceki interval'in temizlenmesi sağlandı.
  - Firebase abonelik iptalleri: `cleanupFirebase` fonksiyonu, `hostId` ve `hostOnly` dinleyicilerinden çıkacak (unsubscribe) şekilde güncellendi.
  - `.limitToLast(50)` mesajlar ve `.limitToLast(5)` reaksiyonlar için dinleyici kapatma çağrıları, base referans yerine tam query (sorgu) referansı üzerinde `off()` kullanacak şekilde düzeltildi.
  - Sayfa kapatma/yenileme (`beforeunload`) temizlik mantığı `handlePageTeardown` fonksiyonuna çıkartılarak aynı zamanda `pagehide` olayına (event) bağlandı. Bu sayede uzun süre açık kalan sekmelerde bellek sızıntıları (memory leaks) engellendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
