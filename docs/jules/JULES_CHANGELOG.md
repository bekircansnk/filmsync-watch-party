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

## 01.09.2026 - Video Eşitleme İyileştirmesi
- `ensureVideoReady` ve `applyRemoteState` arasında yaşanabilen yarış koşullarını engellemek için `isSyncing` kilidi daha erken bir aşamada aktif edilecek şekilde düzenlendi.
- Artık video hazır olana kadar beklerken diğer işlemlerin durum bozması engelleniyor.
- `syncLockTimeout` eklenerek birden çok `setTimeout` çağrısının birbirine karışması ve durumu beklenenden erken bozması düzeltildi.
