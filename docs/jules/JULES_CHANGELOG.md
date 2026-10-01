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

## 2026-10-01 - XSS Zafiyetlerinin Giderilmesi
**Bulgular:** `extension/content.js` ve `extension/popup.js` dosyalarında, kullanıcı girdilerinin (oda adları, platform adları ve kullanıcı listeleri) DOM'a `.innerHTML` ile doğrudan şablon dizeleri içerisinde aktarıldığı tespit edildi. Bu durum, DOM tabanlı Cross-Site Scripting (XSS) zafiyetlerine yol açabilir.
**Çözüm:** Tip dönüşümü (`String(str)`) kullanılarak potansiyel tip karmaşası (type-juggling) atlatmalarını engelleyen güvenli bir `escapeHTML` yardımcı fonksiyonu tanımlandı. Güvensiz `.innerHTML` kullanımlarında, şablon dizelerine aktarılan dinamik veriler (örn. `roomName`, `roomId`, `platformName`, `displayUsersText`) bu fonksiyon kullanılarak sanitize edildi. Ayrıca content.js dosyasında bulunan düzenli ifade sözdizimi hataları (Invalid regular expression flags) düzeltildi.
