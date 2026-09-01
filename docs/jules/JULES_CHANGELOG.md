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

## [01.09.2026] - XSS Güvenlik İyileştirmeleri
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` içerisindeki `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında yer alan `innerHTML` kullanımları sanitize edildi. Dinamik `roomName` değişkenleri, DOM kirliliğini ve XSS'i önlemek amacıyla doğrudan şablon içine yazılmak yerine, CSS sınıfları kullanılarak `.textContent` ile güvenli bir şekilde atanacak biçimde güncellendi.
  - `extension/popup.js` içerisindeki `loadPublicRooms` döngüsündeki `innerHTML` kullanımlarında da benzer şekilde `roomId`, `platformName` ve `displayUsersText` değişkenleri `.textContent` ile aktarıldı. Kullanıcıdan gelen dinamik verilerin HTML niteliklerine (örn. `data-code`, `data-room`) doğrudan şablon üzerinden atanması engellenerek, `.setAttribute()` kullanımı tercih edildi.
