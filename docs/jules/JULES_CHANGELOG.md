# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [04.08.2026] - Güvenlik Güncellemesi: XSS Önlemleri
- **Hata Düzeltmeleri:**
  - `extension/content.js` içindeki `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında bulunan dinamik `innerHTML` kullanımı yerine, güvenli olan `textContent` ataması yapıldı, böylece potansiyel Cross-Site Scripting (XSS) açıklarının önüne geçildi.
  - `extension/popup.js` içerisindeki açık odalar listesi oluşturulurken kullanılan şablonlarda `innerHTML` ile doğrudan veri yerleştirilmesi yerine, elementler oluşturulduktan sonra içeriklerin `textContent` ile atanması sağlandı.
  - Modal içindeki ad giriş inputuna erişilebilirlik (a11y) standartlarına uygun olarak `for` özelliğine sahip `<label>` etiketi eklendi.
  - `extension/content.js` dosyasında yer alan hatalı Regex (URL normalizasyonunda `/\/$/`) düzeltilerek geçerli bir syntax haline getirildi.



## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
