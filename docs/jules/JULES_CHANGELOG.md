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

## [28.08.2026] - Senkronizasyon Döngüsü ve Zamanlayıcı İyileştirmeleri
- **Hata Düzeltmeleri:**
  - Uzak medya eylemleri (play, pause, seek) sırasında `PlayerAdapter` üzerinde oluşabilecek yarış koşullarını ve senkronizasyon döngülerini (synchronization loops) önlemek amacıyla zamanlayıcı (debounce/lock timer) yapısı güncellendi.
  - Olası çoklu `applyRemoteState`, `forceSync` ve `startDriftCorrection` çağrılarında zamanlayıcıların üst üste binip olay dinleyicilerini erken geri yüklemesini önlemek için ortak bir `syncLockTimer` değişkeni oluşturuldu ve kullanıldı.
  - Zamanlayıcı süreleri bittiğinde bekleyen durumların (`pendingState`) işlenmesi iyileştirildi.
