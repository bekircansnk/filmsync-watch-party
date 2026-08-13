# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - XSS Güvenlik İyileştirmeleri
- **Güvenlik İyileştirmesi:**
  - `extension/content.js` dosyasında `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında kullanılan `innerHTML` içerisine kullanıcıdan veya URL'den gelen `roomName` değişkeninin doğrudan yazılması engellendi. Metinler güvenli olan `textContent` ile değiştirildi.
  - `extension/popup.js` dosyasında açık odalar listesi oluşturulurken kullanılan `innerHTML` içine dinamik olarak `roomId`, `platformName` ve kullanıcı isimlerini barındıran `displayUsersText` değişkenlerinin yazılması XSS açığı oluşturabileceği için `textContent` ile sanitize edildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
