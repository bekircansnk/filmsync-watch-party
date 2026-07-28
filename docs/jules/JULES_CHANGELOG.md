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

## [28.07.2026] - PlayerAdapter Refaktörü ve Senkronizasyon İyileştirmeleri
- **Refaktör ve Kararlılık (Stability):**
  - `PlayerAdapter` yapısı genişletildi. `ensureVideoReady` fonksiyonu bu adaptöre taşındı ve `try-catch` blokları ile koruma altına alındı.
  - Olay kitleme (debouncing) mekanizması `PlayerAdapter.lockEvents` adı altında birleştirilerek global flag kalabalığı azaltıldı.
  - `applyRemoteState`, `forceSync` ve `startDriftCorrection` fonksiyonları bu yeni adaptör metotlarını kullanacak şekilde güncellendi. Senkronizasyon süreçlerinde yaşanan yarış koşulları ve kekelemeler (stuttering) büyük ölçüde engellendi.
  - Video play, pause ve seek olayları gibi asenkron ve riskli native işlemler, çökmeleri engellemek adına `try-catch` bloklarına alındı ve `play()` işlemine `.catch()` eklendi.
  - `setupVideoListeners` ve `removeVideoListeners` fonksiyonları `try-catch` içerisine alınarak özel video oynatıcılarına sahip sitelerde uzantının çökmesi engellendi.
