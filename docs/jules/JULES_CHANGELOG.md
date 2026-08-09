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

## 2026-05-18 - XSS Zafiyetlerinin Giderilmesi
**Ne:** `extension/content.js` ve `extension/popup.js` dosyalarındaki potansiyel XSS (Cross-Site Scripting) zafiyetleri düzeltildi.
**Neden:** Kullanıcıların girdiği oda isimleri (`roomName`), kimlikler (`roomId`) ve platform bilgileri gibi dinamik metinler doğrudan `innerHTML` şablon dizelerinde kullanılıyordu. Bu durum, kötü niyetli kullanıcıların zararlı JavaScript kodları enjekte etmesine olanak tanıyabilirdi.
**Nasıl:** Dinamik içerikler `innerHTML` içinden çıkarıldı ve yerine `document.createElement`, `.textContent` ve `.dataset` gibi güvenli DOM yöntemleri kullanıldı. Bu sayede dinamik veriler her zaman düz metin olarak işlenir ve çalıştırılabilir kod olarak yorumlanması engellenir.
