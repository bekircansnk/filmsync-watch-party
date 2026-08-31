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

## 31.08.2026 - Race Condition Düzeltmeleri ve Performans
- **Hata Düzeltmeleri:**
  - `applyRemoteState` ve `forceSync` fonksiyonlarında, asenkron `ensureVideoReady` çağrısından kaynaklanan race condition sorunları giderildi.
  - Video elementi beklenirken native oynatıcı event'lerinin (play, pause) dinleyici tarafından tetiklenmesini engellemek için `isSyncing` kilidi anında aktif edilecek şekilde düzenlendi.
  - Kod tekrarını önlemek ve lock yönetimini tek bir merkezden yapmak adına `releaseSyncLock(delay)` fonksiyonu oluşturuldu.
