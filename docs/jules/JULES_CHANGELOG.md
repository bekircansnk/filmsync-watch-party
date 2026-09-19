# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.09.2026] - XSS Zafiyetlerinin Giderilmesi (Güvenli DOM Manipülasyonu)
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` içindeki `showAutoJoinOverlay` fonksiyonunda `roomName` değişkeninin doğrudan `innerHTML` içine yazılması engellendi, `textContent` ile güvenli hale getirildi.
  - `extension/content.js` içindeki `showNamePromptModal` fonksiyonunda `roomName` değişkeninin doğrudan `innerHTML` içine yazılması engellendi, `textContent` ile güvenli hale getirildi.
  - `extension/popup.js` içindeki `loadPublicRooms` fonksiyonunda kullanıcı tarafından sağlanan verileri içeren değişkenlerin (örn. `displayUsersText`, `platformName`, `roomId`) doğrudan HTML olarak yorumlanması engellendi. Bu veriler `textContent` kullanılarak güvenli bir şekilde DOM'a eklendi ve butonlar dinamik olarak oluşturuldu.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
