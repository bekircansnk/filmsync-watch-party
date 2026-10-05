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

## [05.10.2026] - Yapılandırılmış Loglama ve Dayanıklı API Kancaları (Jules)
- **Performans & Kararlılık:**
  - `extension/content.js`, `extension/popup.js` ve `extension/inject.js` dosyalarına yapılandırılmış bir `Logger` nesnesi eklendi.
  - Tüm düz `console.log/warn/error` çıktıları, ISO zaman damgaları ve log seviyeleri içeren yapılandırılmış loglayıcı yöntemleriyle değiştirildi.
  - `inject.js` ve `PlayerAdapter` içindeki API kancalarına (Netflix, Disney+, YouTube) sağlam `try-catch` blokları eklendi.
  - Eklentinin çökmesini önlemek için `videoElement.play()` üzerindeki yakalanmayan promise istisnaları düzeltildi.
