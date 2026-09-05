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

## [05.09.2026] - Log ve API Kancası İyileştirmeleri
- **İyileştirmeler:**
  - `extension/content.js` ve `extension/popup.js` içerisindeki `console` çıktıları, daha düzenli bir `Logger` yapısına taşındı.
  - Netflix, Disney+ ve YouTube `postMessage` API kancalarına eklentinin çökmesini engellemek için try-catch blokları eklendi.
- **Hata Düzeltmeleri:**
  - `extension/content.js` içindeki RegExp sözdizimi hatası düzeltildi.
