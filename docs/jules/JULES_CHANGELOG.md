# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [26.07.2026] - XSS Zafiyeti Güvenlik Düzeltmeleri
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` ve `extension/popup.js` içerisindeki tüm `innerHTML` kullanımları kaldırılarak Cross-Site Scripting (XSS) zafiyeti giderildi.
  - Odaya katılma ekranlarındaki (Auto-Join Overlay ve Name Prompt Modal) dinamik kullanıcı verileri (`roomName`) artık güvenli bir şekilde `textContent` kullanılarak DOM'a enjekte ediliyor.
  - Statik HTML ve SVG elementlerinin güvenli bir şekilde DOM'a eklenmesi için `DOMParser` tabanlı `safeHTML` yardımcı fonksiyonu oluşturuldu.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
