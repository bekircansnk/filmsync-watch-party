# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [03.08.2026] - Hafıza Sızıntısı ve Firebase Dinleyici İyileştirmeleri
- **Performans Optimizasyonu:**
  - `startVideoTracking`, `startDriftCorrection`, `startUIKeeper` ve `startIframeFullscreenKeeper` için atanan `setInterval` referansları izlenmeye başlandı. Yeni interval atanmadan önce eski interval'ın temizlenmesi sağlandı.
  - Sekme kapandığında veya gezinme olduğunda `beforeunload` ve `pagehide` olayları kullanılarak tüm aktif interval'ların temizlenmesi için `teardownAll()` fonksiyonu eklendi.
- **Hata Düzeltmeleri:**
  - `cleanupFirebase()` metodunda eksik olan `hostId` ve `hostOnly` dinleyicileri eklendi.
  - `messages` ve `reactions` için olan limitli Firebase dinleyicileri (örn. `.limitToLast(50)`) iptal edilirken tam referans (`limitToLast(50).off()`) kullanılarak callback'lerin havada kalması engellendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
