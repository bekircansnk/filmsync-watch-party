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

## [06.09.2026] - Log Yapılandırması ve Hata Yakalama
- **Geliştirmeler:**
  - `extension/content.js` ve `extension/popup.js` dosyalarındaki düz `console.log`, `console.warn` ve `console.error` çıktıları, daha düzenli bir yapı sağlayan `Logger` nesnesi ile değiştirildi.
  - Video oynatıcı platformları (Netflix, Disney+, YouTube) ile haberleşen `PlayerAdapter` içerisindeki `postMessage` API kancalarına (hooks) tarayıcı eklentisi çökmelerini önlemek için güvenli `try-catch` blokları eklendi.
