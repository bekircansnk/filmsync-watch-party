# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [08.08.2026] - Performans ve Bellek Sızıntısı İyileştirmeleri
- **Hata Düzeltmeleri ve İyileştirmeler:**
  - `cleanupFirebase()` fonksiyonu, eksik olan `hostId` ve `hostOnly` `.on()` dinleyicilerini kaldıracak şekilde güncellendi.
  - `.limitToLast()` içeren sorgulardaki (mesajlar ve reaksiyonlar) `.off()` çağrıları düzeltilerek bellek sızıntıları engellendi.
  - Sınırsız aralıkları (interval) temizlemek için global takip değişkenleri (`videoTrackingInterval`, `driftCorrectionInterval`, vb.) oluşturuldu.
  - Mevcut aralıkların üzerine yazılmasını ve bellekte açık kalmasını önlemek için bir `clearAllIntervals()` fonksiyonu eklendi; bu fonksiyon, başlatma süreçleri sırasında, `cleanupFirebase()` içerisinde ve sayfa kapanışlarında tetikleniyor.
  - Sayfa kapanış süreçlerini daha güvenli yönetmek için `beforeunload` ve `pagehide` olaylarını dinleyen yeni bir `handlePageTeardown` fonksiyonu eklendi.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
