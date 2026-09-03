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

## [03.09.2026] - Güvenlik İyileştirmeleri (Sentinel)
- **Güvenlik (XSS):**
  - `extension/popup.js` içindeki genel oda listeleme fonksiyonunda DOM tabanlı XSS (Cross-Site Scripting) zafiyeti giderildi. Kullanıcı adlarının ve oda bilgilerinin `innerHTML` yerine `textContent` ile güvenli bir şekilde render edilmesi sağlandı.
  - Açık Firebase veritabanı kuralları hakkında `.jules/sentinel.md` dosyasına güvenlik raporu eklendi.
