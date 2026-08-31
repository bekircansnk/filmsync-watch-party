# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.

## [31.08.2026] - Firebase Dinleyici Optimizasyonu
- **Performans ve Hata Düzeltmeleri:**
  - Uzun süren video sekmelerinde oluşabilecek bellek sızıntılarını önlemek için Firebase dinleyicileri (listener) temizleme işlemleri düzeltildi.
  - `cleanupFirebase()` içerisinde `.limitToLast()` gibi türetilmiş sorgular üzerinde tanımlanan dinleyicilerin, yine aynı sorgu objesi üzerinden (`.off()`) kapatılması sağlandı.
  - `hostId` ve `hostOnly` referanslarına ait eksik `.off()` çağrıları eklendi.
