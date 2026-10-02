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

## [02.10.2026] - Firebase Hafıza Sızıntısı Düzeltmeleri
- **Hata Düzeltmeleri:**
  - `extension/content.js` içerisindeki `cleanupFirebase` fonksiyonunda, `hostId` ve `hostOnly` referansları için eksik `.off()` çağrıları eklendi.
  - `messages` ve `reactions` referansları için `.off()` çağrıları, dinleyicilerin kaydedildiği spesifik sorgulara (`.limitToLast(50)` ve `.limitToLast(5)`) karşılık gelecek şekilde güncellendi. Türetilmiş sorgulardaki dinleyicilerin temel referanstan `.off()` çağrılarak kapatılamaması sorunu giderildi.
