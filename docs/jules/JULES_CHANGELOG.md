# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---
## [28.08.2026] - XSS (Cross-Site Scripting) Güvenlik Düzeltmeleri
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` dosyasında `roomName` değişkeninin doğrudan `innerHTML` içerisine enjekte edilmesi engellendi, bunun yerine `textContent` ile güvenli şekilde DOM'a eklenmesi sağlandı.
  - `extension/popup.js` dosyasında açık odalar listelenirken `displayUsersText`, `roomId` ve `platformName` gibi kullanıcı kaynaklı verilerin `innerHTML` kullanılarak ekranda gösterilmesi sırasında oluşabilecek XSS zafiyetleri düzeltildi. Veriler önce `innerHTML` ile şablon oluşturulup sonrasında güvenli `textContent` ve `setAttribute` metotlarıyla elementlere atandı.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
