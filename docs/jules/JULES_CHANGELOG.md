# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [01.09.2026] - Medya Senkronizasyon ve Race Condition İyileştirmeleri
- **Hata Düzeltmeleri & Optimizasyon:**
  - `applyRemoteState` ve `ensureVideoReady` arasında oluşan race condition (yarış durumu) hatası `isApplyingState` kilidi ve `syncLockTimer` eklenerek çözüldü.
  - Oynatıcı (`PlayerAdapter.play`) üzerinde oluşabilecek medya Promise reddi (rejection) hataları try-catch yapısına benzer şekilde ele alınarak eklenti çökmeleri engellendi.
  - Dinleyici ekleyip/kaldırma (`setupVideoListeners` / `removeVideoListeners`) işlemi sırasında oluşan gereksiz karmaşıklıklar temizlenerek senkronizasyon kekelemeleri ve oynatma döngüleri önlendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
