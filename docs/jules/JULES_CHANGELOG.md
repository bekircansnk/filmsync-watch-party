# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [28.07.2026] - Güvenlik İyileştirmeleri (XSS Önlemleri)
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` dosyasında bulunan `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarındaki XSS (Cross-Site Scripting) açıkları giderildi.
  - Kullanıcıdan veya URL'den alınan dinamik değişkenlerin (örneğin `roomName`) doğrudan `innerHTML` kullanılarak DOM'a eklenmesi engellendi.
  - Bunun yerine, güvenli bir yöntem olan `.textContent` kullanılarak potansiyel zararlı kod enjeksiyonlarının önüne geçildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
