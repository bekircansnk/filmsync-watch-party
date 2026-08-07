# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - XSS Zafiyetlerinin Giderilmesi (Güvenlik İyileştirmesi)
- **Güvenlik (XSS):**
  - `extension/content.js` içerisinde bulunan `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarındaki `.innerHTML` kullanımları revize edildi. Dinamik olarak alınan `roomName` değişkeni, olası Cross-Site Scripting (XSS) saldırılarını engellemek amacıyla güvenli olan `.textContent` yöntemi ile DOM'a enjekte edilecek şekilde değiştirildi.
  - `extension/popup.js` içerisindeki `loadPublicRooms` fonksiyonunda bulunan, açık odaların listelenmesi sırasındaki dinamik HTML metin yerleştirmeleri (interpolation) düzeltildi. `roomId`, `platformName` ve `displayUsersText` değişkenleri, statik bir şablon içerisine `.textContent` aracılığıyla güvenli bir biçimde yerleştirilerek DOM tabanlı XSS riskleri ortadan kaldırıldı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
