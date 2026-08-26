# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [26.08.2026] - Firebase Event Listener Sızıntılarının Giderilmesi
- **Hata Düzeltmeleri:**
  - Firebase `on()` çağrılarının kaldırılmasındaki memory leak (bellek sızıntısı) sorunları düzeltildi.
  - `messages` ve `reactions` için olan listener'lar `.limitToLast()` içerecek şekilde temizlendi, aksi halde query mismatch nedeniyle dinleyiciler iptal edilmiyordu.
  - Unutulan `hostId` ve `hostOnly` listener'larının iptal işlemleri `cleanupFirebase()` fonksiyonuna eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
