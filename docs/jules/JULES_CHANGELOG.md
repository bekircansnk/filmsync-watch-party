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

## [30.08.2026] - Eşitleme Kilit Mekanizması Düzeltmeleri
- **Hata Düzeltmeleri:**
  - `applyRemoteState`, `forceSync` ve `startDriftCorrection` fonksiyonlarındaki potansiyel yarış durumları (race conditions) önlendi.
  - Oynatıcı olaylarının senkronizasyon döngülerine girmesini engellemek için `releaseSyncLock` adlı merkezi bir debounce kilit yönetim fonksiyonu eklendi.
  - `ensureVideoReady` bekleme süresince `isSyncing` kilidi aktif tutularak üst üste binen isteklerin video hazır olana kadar yarışması engellendi.
