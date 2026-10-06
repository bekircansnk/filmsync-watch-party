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

## [06.10.2026] - XSS Zafiyet Giderimi ve Güvenlik İyileştirmeleri
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` ve `extension/popup.js` içerisine HTML kaçış (escapeHTML) fonksiyonu eklendi.
  - Odaya katılım modalı ve popup'ta kullanıcı adları ve oda isimlerinin HTML enjeksiyonuna (XSS) karşı güvenli bir şekilde render edilmesi sağlandı.
  - DOM manipülasyonu esnasında `innerHTML` yerine kullanılmak üzere dinamik değişkenler (örn. `roomName`, `userNames`, vb.) yeni kaçış fonksiyonundan geçirildi.
- **Hata Düzeltmeleri:**
  - `extension/content.js` içerisinde yer alan `replace(/\\/$/, '')` hatalı Regex sözdizimi, Node derleme sorununu çözecek şekilde `replace(/\/$/, '')` olarak düzeltildi.
