# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [14.08.2026] - Video Senkronizasyonu Hata Düzeltmeleri
- **Hata Düzeltmeleri:**
  - `applyRemoteState` ve `forceSync` fonksiyonlarında, uzak (remote) durum uygulamasının manuel kullanıcı işlemleriyle (oynat, duraklat, sar) çakışmasına neden olan yarış durumu (race condition) senkron bir kilitleme mekanizması (`isSyncing`) ile çözüldü.
  - Asenkron hazır olma (ready) kontrollerinden önce kilit mekanizması eklendi; kilit aktifken gelen durum güncellemeleri kuyruğa alındı ve kilit süresi dolduğunda sırayla uygulanacak şekilde yeniden düzenlendi.
  - Özel medya oynatıcılara sahip platformlarda (Netflix, Disney+, YouTube vb.) uzantının çökmesini önlemek için, `PlayerAdapter.play()` içinde yerel `videoElement.play()` çağrıları için güvenli (safe) Promise `catch` bloğu eklendi.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
