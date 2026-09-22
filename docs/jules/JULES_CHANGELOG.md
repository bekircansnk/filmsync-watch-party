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

## [22.09.2026] - Sentinel: DOM XSS Güvenlik Açığı Giderildi
- **Güvenlik (XSS):**
  - `extension/content.js` ve `extension/popup.js` dosyalarında, kullanıcı girdilerinin (Oda adları, platform isimleri, kullanıcı listeleri vb.) doğrudan `.innerHTML` ile oluşturulan template literallerinin içine enjekte edilmesinden kaynaklanan DOM Tabanlı XSS zafiyeti tespit edildi.
  - Bu alanlara ait dinamik verilerin, DOM elementleri oluşturulduktan sonra `.textContent` ve `.dataset` metodları ile güvenli bir şekilde atanması sağlandı.
  - Olası bir XSS senaryosunda saldırganın `roomName` veya `platformName` üzerinden eklenti bağlamında zararlı JavaScript kodu çalıştırması engellendi.
  - `extension/content.js` dosyasındaki mevcut bir Regex syntax hatası (`Invalid regular expression flags`) düzeltildi.
