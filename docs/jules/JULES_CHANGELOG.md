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

## [11.10.2026] - Loglama ve Hata Yönetimi İyileştirmeleri
- **İyileştirmeler:**
  - `extension/content.js` ve `extension/popup.js` içindeki tüm standart `console.log`, `console.error` ve `console.warn` çıktıları özel bir `Logger` sınıfı ile yapılandırılmış loglara dönüştürüldü. Yeni loglar zaman damgası (timestamp) ve seviye (INFO, ERROR, WARN) içeriyor.
- **Hata Yönetimi (Robustness):**
  - `PlayerAdapter.play()` fonksiyonu asenkron yapıda çalıştığı durumlarda çökmesini önlemek için, dönüş değeri bir `Promise` ise olası hatalar (rejection) yakalanacak şekilde asenkron hata yakalama bloğu (catch bloğu) eklendi.

  - `PlayerAdapter` üzerinden çalıştırılan platforma özel `postMessage` API hook'ları (Netflix, Disney+, YouTube) `try-catch` bloğu içerisine alınarak tarayıcı eklentisinin çökmesi engellendi.
