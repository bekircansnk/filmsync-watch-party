# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [15.08.2026] - Güvenlik Güncellemesi: XSS Önleme (Sentinel)
- **Güvenlik İyileştirmeleri (XSS Önleme):**
  - `extension/content.js` dosyasında `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında, oda isimlerinin (roomName) doğrudan `innerHTML` içerisine şablon dizesi olarak enjekte edilmesi engellendi. Dinamik veriler için statik HTML taslakları kullanılıp değerler güvenli bir şekilde `textContent` ile eklendi.
  - `extension/popup.js` dosyasında `loadPublicRooms` içerisinde açık oda kartları oluşturulurken `roomId`, `platformName` ve `displayUsersText` değişkenlerinin doğrudan `innerHTML` içerisine yazılması engellendi. Dinamik veriler güvenli bir şekilde `textContent` ve `.dataset` yöntemleriyle eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
