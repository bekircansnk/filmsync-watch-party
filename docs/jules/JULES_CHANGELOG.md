# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [15.08.2026] - Hafıza Sızıntısı ve Interval Optimizasyonları
- **Hata Düzeltmeleri:**
  - `cleanupFirebase()` içinde `.on()` ile bağlanan `hostId` ve `hostOnly` dinleyicileri için `.off()` çağrıları eklendi.
  - Sorgu bağlı olan dinleyiciler (`messages` ve `reactions`) için base ref yerine doğru şekilde `limitToLast()` üzerinden `.off()` çağrıldı.
  - Video tracking, auto-sync, UI keeper ve iframe fullscreen keeper fonksiyonlarında oluşturulan `setInterval` zamanlayıcıları globale taşınarak yeniden atanmadan ve bağlantı temizlenirken (cleanup) `clearInterval` ile sıfırlanması sağlandı. Bu sayede uzun süren video sekmelerinde hafıza sızıntısı önlendi.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
