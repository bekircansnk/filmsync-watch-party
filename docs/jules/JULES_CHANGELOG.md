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
  - Video tracking ve UI için setInterval kullanan geri plandaki döngülerin, yeni atanmadan önce önceki değerlerinin clearInterval() ile temizlenmesi sağlandı.
  - cleanupFirebase() ve page teardown fonksiyonlarına interval temizleme ve dinleyicileri (özellikle limitToLast kullanılanları) spesifik of() ile temizleme mekanizmaları eklendi.
  - beforeunload eventindeki sayfa kapanma/ayrılma logiciğinin pagehide event'inde de tetiklenmesi sağlandı, bu sayede uzun süreli yayın sekmelerinde bellek sızıntıları önlendi.
