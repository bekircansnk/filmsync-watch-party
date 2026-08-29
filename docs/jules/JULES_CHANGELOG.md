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

## 29.08.2026 - XSS (Cross-Site Scripting) Güvenlik Zafiyeti Giderildi
**Zafiyet:** Kullanıcı tarafından girilen oda adı (roomName) ve aktif üye isimleri (displayUsersText) doğrudan `innerHTML` üzerinden DOM'a enjekte ediliyordu. Bu durum, zararlı JavaScript kodlarının çalıştırılmasına (XSS) yol açabilecek bir güvenlik açığı oluşturuyordu. Ayrıca HTML özniteliklerinde (attributes) string interpolation ile değer atanması (data-code, data-room) attribute-based XSS riski taşıyordu.
**Çözüm:** `extension/content.js` ve `extension/popup.js` dosyalarında yer alan güvensiz `innerHTML` kullanımları, placeholder (yer tutucu) class'lar (ör. `.room-name-container`) kullanılarak yeniden yapılandırıldı. Kullanıcı girdileri, DOM API'nin daha güvenli metotları olan `textContent` (metin eklemek için) ve `setAttribute` (özellik atamak için) aracılığıyla güvenli bir şekilde DOM'a eklendi.
