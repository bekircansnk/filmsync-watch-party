# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [17.08.2026] - Güvenlik Düzeltmeleri
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` içerisinde bulunan modal ve overlay (`showAutoJoinOverlay`, `showNamePromptModal`) ekranlarındaki XSS (Cross-Site Scripting) açıkları, `innerHTML` yerine güvenli `textContent` kullanımıyla giderildi.
  - `extension/popup.js` içerisindeki açık odaların listelendiği (`loadPublicRooms`) kart yapısında bulunan XSS açığı, kullanıcıdan gelen verilerin DOM'a statik elementler oluşturulup `textContent` ile atanması yöntemiyle düzeltildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
