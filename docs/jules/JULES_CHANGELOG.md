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

## 16.10.2026 - XSS Zafiyeti Onarıldı
**Bulgular:**
- `extension/content.js` içindeki `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında `innerHTML` kullanılarak `roomName` değişkeni doğrudan DOM'a enjekte ediliyordu. Bu durum olası bir Cross-Site Scripting (XSS) zafiyetine yol açıyordu.
- `extension/popup.js` dosyasında `card.innerHTML` içinde kullanıcı bazlı dinamik metinlerin (`platformName`, `displayUsersText`, `roomId`) DOM'a yazdırıldığı ve benzer şekilde XSS açığı potansiyeli barındırdığı gözlemlendi.

**Düzeltmeler:**
- `extension/content.js` içerisindeki `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında, doğrudan string interpolation (`\${roomName}`) yerine `<span>` elementleri eklenip, metinlerin bu elementlerin içerisine `textContent` kullanılarak güvenli bir şekilde aktarılması sağlandı. Ayrıca daha sağlam bir yapı için node bazlı (örneğin `overlay.querySelector`) erişim uygulandı.
- `extension/popup.js` içerisindeki oda listesi kart oluşturma sürecinde `innerHTML` yerine elementler seçilerek içerikleri güvenli `textContent` metodu ile güncellendi.
- Böylece kötü amaçlı kullanıcıların kod enjekte etmesinin önüne geçildi.
