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

## [04.09.2026] - Sentinel: XSS Zafiyetlerinin Giderilmesi (innerHTML Temizliği)
- **Vulnerability (Ne):** `extension/content.js` ve `extension/popup.js` dosyalarında, kullanıcı girdileri veya dış kaynaklı metinler (örn. oda adı veya kullanıcı listesi) `innerHTML` üzerinden doğrudan DOM'a ekleniyordu.
- **Learning (Neden):** `innerHTML` kullanımı, içindeki string eğer sanitize edilmemişse script tag'leri veya zararlı HTML bileşenleri üzerinden Cross-Site Scripting (XSS) zafiyetlerine neden olabilir. Güvenli yaklaşım her zaman `textContent` kullanmaktır.
- **Prevention (Nasıl):** `innerHTML` ile doğrudan atanan dinamik metinler (`roomName`, `roomId`, `platformName`, `displayUsersText`) şablonlardan çıkarılarak, oluşturulan elementlere `textContent` ile veya özellik atamaları yapılarak (örn. `setAttribute`) güvenli şekilde enjekte edildi.
