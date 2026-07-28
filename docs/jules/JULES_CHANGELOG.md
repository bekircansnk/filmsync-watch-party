# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## 2026-07-28
- Tüm eklenti dosyalarındaki (`extension/content.js`, `extension/popup.js`, `extension/inject.js`) standart `console.log`, `console.warn` ve `console.error` çıktıları merkezi ve yapılandırılmış bir `Logger` nesnesi (Logger.info, Logger.warn, Logger.error) ile değiştirildi.
- Tarayıcı eklentisi çökmelerini önlemek amacıyla `extension/inject.js` içerisinde bulunan Netflix, Disney+ ve YouTube API kancalarındaki (hook) `.play()` çağrılarına sağlam (robust) Promise `catch` blokları eklendi. Artık işlenmeyen Promise reddedilmeleri düzgün bir şekilde yakalanıp `Logger.error` ile günlüğe kaydedilecek.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
