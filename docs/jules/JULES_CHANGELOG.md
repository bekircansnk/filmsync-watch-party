# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [24.07.2026] - Hafıza Sızıntısı (Memory Leak) Optimizasyonları ve Firebase Temizleme Düzeltmeleri
- **Performans ve Hata Düzeltmeleri:**
  - Firebase veritabanı dinleyicilerini temizleyen `cleanupFirebase` fonksiyonu, spesifik sorgulara (`.limitToLast()`) `.off()` uygulanacak şekilde düzeltildi (ör. `messages` ve `reactions` için).
  - Eksik olan `hostId` ve `hostOnly` dinleyicileri `.off()` çağrılarına eklendi.
  - Uzun süreli açık kalan sekmelerde hafıza sızıntılarını önlemek amacıyla global aralık (interval) değişkenleri tanımlandı (`videoTrackingInterval`, `driftCorrectionInterval`, vb.).
  - Her aralık tetikleyici fonksiyona, önceki aralığı temizleyen `clearInterval` mantığı eklendi.
  - Sayfa kapandığında çalışan temizleme mantığı, hem `beforeunload` hem de `pagehide` olaylarına bağlı çalışan sağlam bir `handlePageTeardown` fonksiyonuna taşındı. Bu fonksiyon aynı zamanda aktif aralıkları (interval) da temizler.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
