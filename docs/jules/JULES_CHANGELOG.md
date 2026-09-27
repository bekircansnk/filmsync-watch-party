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

## [27.09.2026] - Firebase Listener Memory Leak Düzeltmesi
- **Performans Optimizasyonu:**
  - `extension/content.js` içindeki `cleanupFirebase` fonksiyonuna eksik olan `hostId` ve `hostOnly` abonelik iptalleri eklendi.
  - Firebase V8 SDK'sında bellek sızıntılarını önlemek için `messages` ve `reactions` dinleyicilerinin iptalinde eksik olan sorgu parametreleri (`limitToLast(50)` ve `limitToLast(5)`) `.off()` çağrılarına eklendi.
