# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [05.08.2026] - Bellek Sızıntısı ve Performans İyileştirmeleri
- **Performans İyileştirmeleri (Bellek Sızıntısı Giderme):**
  - Uzun süreli çalışan sekmelerde bellek sızıntılarını önlemek için tüm aralık (interval) değişkenleri (`videoTrackingInterval`, `driftCorrectionInterval`, vb.) izole edildi ve yeniden atama öncesinde `clearInterval` kullanılarak temizlenmesi sağlandı.
  - Sayfa kapanışı veya yenileme sırasında dinleyicilerin ve zamanlayıcıların doğru şekilde kapatılması için `beforeunload` ve `pagehide` olaylarına bağlı `handlePageTeardown` fonksiyonu eklendi.
  - `cleanupFirebase` fonksiyonundaki Firebase olay dinleyicilerini durdurma işlemleri düzeltildi. Eksik olan `hostId` ve `hostOnly` dinleyicileri kapatıldı, `messages` ve `reactions` sorgularına ait olayların iptal edilmesi için tam sorgu hedefleri (`.limitToLast()`) kullanıldı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
