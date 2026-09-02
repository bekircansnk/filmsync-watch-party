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

## [02.09.2026] - Logger ve PlayerAdapter İyileştirmeleri
- **Hata Düzeltmeleri ve İyileştirmeler:**
  - `extension/content.js` ve `extension/popup.js` içerisindeki standart konsol logları (console.log, console.error vb.) yapılandırılmış `Logger` sınıfı ile değiştirildi.
  - `extension/content.js` içerisinde yer alan `PlayerAdapter` nesnesindeki (Netflix, Disney+, YouTube için) `window.postMessage` çağrılarına uygulamanın çökmesini engellemek için try-catch blokları eklendi.
