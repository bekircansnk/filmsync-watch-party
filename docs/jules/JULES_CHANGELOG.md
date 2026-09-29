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

## [29.09.2026] - XSS Zafiyetleri Giderildi
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` ve `extension/popup.js` dosyalarında tespit edilen DOM-tabanlı XSS zafiyetleri giderildi.
  - Kullanıcı girişlerinin (örn. `roomName`, `roomId`, `platformName`, `displayUsersText`) `.innerHTML` üzerinden sayfaya enjekte edilmeden önce özel `escapeHTML` fonksiyonu ile sanitize edilmesi sağlandı.
