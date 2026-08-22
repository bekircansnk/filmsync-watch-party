# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [22.08.2026] - XSS Zafiyetlerinin Giderilmesi
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` dosyasındaki `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında bulunan `innerHTML` şablonlarındaki doğrudan değişken yerleştirmeleri (interpolation) kaldırıldı.
  - Olası Cross-Site Scripting (XSS) saldırılarını önlemek için, oda adı (`roomName`) gibi dinamik kullanıcı girdileri güvenli `textContent` API'si kullanılarak DOM'a eklendi.
  - `extension/popup.js` dosyasındaki `loadPublicRooms` fonksiyonunda bulunan oda kartı (`card.innerHTML`) render işlemi güvenli hale getirildi. Oda ID, platform adı ve aktif kullanıcı sayısı (`roomId`, `platformName`, `displayUsersText`) değişkenleri doğrudan `innerHTML` içerisine eklenmek yerine `textContent` ve `createElement` yöntemleri ile yönetildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
