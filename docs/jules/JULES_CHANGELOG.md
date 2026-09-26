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

## [26.09.2026] - XSS Zafiyet Gidermesi
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` ve `extension/popup.js` dosyalarında kullanıcı girdilerini DOM'a enjekte etmeden önce temizlemek için `escapeHTML` yardımcı fonksiyonu eklendi.
  - DOM tabanlı XSS zafiyetlerini (Cross-Site Scripting) önlemek için `innerHTML` atamalarındaki kullanıcı tanımlı değişkenler (örn. `roomName`, `roomId`, `displayUsersText`, `platformName`) sanitize edildi.
