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

## [2024-05-24] - Otonom Bakım ve İyileştirme
- **Hata Düzeltmeleri:**
  - Eşzamanlama (senkronizasyon) sırasındaki yarış koşulları (race conditions) giderildi. `isApplyingState` kilidi ve `syncLockTimer` ile manuel eylemler ile asenkron işlemler birbirinden izole edildi.
  - Zaman kayması (drift correction) algoritmasında sunucu saat sapması dikkate alınacak şekilde `Date.now()` yerine `.info/serverTimeOffset` değeri kullanılmaya başlandı.
  - `applyRemoteState` içerisindeki regex sentaks hatası düzeltildi.
