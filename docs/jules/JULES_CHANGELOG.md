# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [07.08.2026] - Hafıza Sızıntısı ve Firebase Dinleyici İyileştirmeleri
- **Performans Optimizasyonları:**
  - Uzun süren video sekmelerinde hafıza sızıntılarını (memory leak) önlemek için arka plan döngüleri (`setInterval`) temizlenebilir hale getirildi. Değişkenlere atanarak (`videoTrackingInterval`, `driftCorrectionInterval`, vb.) yenilenmeden önce `clearInterval` ile temizlenmeleri sağlandı.
  - Sayfa kapanış ve sekme değişim olaylarına `pagehide` dinleyicisi eklendi.
  - Firebase dinleyicileri kapatılırken (`.off()`) `messages` ve `reactions` için `.limitToLast()` sorgularının birebir kullanılması sağlandı. Bu sayede bellek sızıntısına yol açan abonelik kapanmama sorunu çözüldü. Ayrıca `hostId` ve `hostOnly` dinleyicilerinin temizlenmesi eklendi.
  - `cleanupFirebase()` metoduna açık olan tüm `setInterval` arka plan döngülerini temizleme özelliği eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
