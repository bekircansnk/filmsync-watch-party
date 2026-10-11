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

## [11.10.2026] - XSS Zafiyetlerinin Giderilmesi
- **Güvenlik İyileştirmeleri (XSS Koruması):**
  - `extension/content.js` ve `extension/popup.js` dosyalarında `innerHTML` kullanımları incelendi.
  - Kullanıcı girdisi içeren değişkenler (oda adı, kullanıcı bilgileri vb.) için `escapeHTML` fonksiyonu eklendi ve bu değişkenler DOM'a basılmadan önce sanitize edildi.
  - `extension/content.js` içerisinde `showAutoJoinOverlay` ve `showNamePromptModal` metotlarındaki `roomName` değişkeni artık `escapeHTML` ile işlenmektedir.
  - `extension/popup.js` içerisinde genel odaların render edildiği `card.innerHTML` bloğundaki değişkenler (`roomId`, `platformName`, `displayUsersText`) XSS açıklarına karşı güvence altına alındı.
