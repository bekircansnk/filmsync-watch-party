# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [20.07.2026] - Güvenlik Düzeltmeleri (XSS Önlemleri)
- **Hata Düzeltmeleri:**
  - `extension/content.js` dosyasındaki `showAutoJoinOverlay` fonksiyonunda bulunan XSS (Cross-Site Scripting) açığı `innerHTML` kullanımı yerine güvenli `textContent` kullanılarak giderildi.
  - `extension/content.js` dosyasındaki `showNamePromptModal` fonksiyonunda bulunan XSS açığı `innerHTML` yerine `textContent` kullanılarak kapatıldı. Ayrıca hatalı bir regex ('/\\/$/') sözdizimi ('/\/$/') olarak düzeltildi.
  - `extension/popup.js` dosyasındaki `publicRoomList` içerisinde oda bilgilerinin render edilmesi sırasındaki string interpolasyonu (`innerHTML`) kaldırılarak, oda bilgileri (Oda ID, Platform Adı, Aktif Üye Sayısı) güvenli `textContent` ile eklendi. Oda silme butonu güvenli DOM elemanı (document.createElement) olarak oluşturulacak şekilde refaktör edildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
