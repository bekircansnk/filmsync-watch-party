# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [02.08.2026] - XSS Zafiyetlerinin Giderilmesi (Güvenlik Güncellemesi)
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` dosyasında bulunan `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarındaki `innerHTML` tabanlı XSS açıkları giderildi. Kullanıcı girdileri artık güvenli bir şekilde `textContent` kullanılarak DOM'a ekleniyor.
  - `extension/popup.js` dosyasındaki `loadPublicRooms` fonksiyonunda, kullanıcı isimlerini içeren metinlerin (`displayUsersText`) ve diğer potansiyel olarak tehlikeli değişkenlerin doğrudan `innerHTML` ile şablona eklenmesi engellendi. Bu öğeler için `textContent` yöntemi uygulanarak güvenlik sağlandı.
- **Hata Düzeltmeleri:**
  - `extension/content.js` dosyasında `window.location.href.split('?')[0].replace(/\\/$/, '');` şeklinde bulunan ve Node.js/JavaScript standartlarına uymayan hatalı düzenli ifade (Invalid regular expression flags) `/\/$/` olarak düzeltildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
