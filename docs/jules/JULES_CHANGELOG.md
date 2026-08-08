# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [20.07.2026] - XSS Açıkları Giderildi (Jules Otonom Düzeltme)
- **Güvenlik (XSS) İyileştirmeleri:**
  - `extension/content.js` içerisinde bulunan `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında dinamik `roomName` değişkeninin `innerHTML` ile doğrudan enjekte edilmesi engellendi. Güvenli `textContent` kullanımına geçildi.
  - `extension/popup.js` içerisinde herkese açık odalar listelenirken `roomId`, `platformName`, ve `displayUsersText` gibi değerlerin doğrudan `innerHTML`'e yazılması engellendi, DOM API'leri ve `textContent` kullanılarak güvenli bir şekilde render edilmesi sağlandı.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
