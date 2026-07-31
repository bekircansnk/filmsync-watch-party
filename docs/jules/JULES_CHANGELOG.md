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

## [31.07.2026] - Bellek Sızıntısı ve Performans İyileştirmeleri (Memory Leaks & Optimizations)
- **Hata Düzeltmeleri ve Optimizasyonlar:**
  - `extension/content.js` dosyasında, `setInterval` kullanılarak oluşturulan arkaplan döngüleri (video izleme, drift düzeltme, UI koruyucu, iframe tam ekran koruyucu) için global takip değişkenleri (`videoTrackingInterval`, vb.) eklendi ve yeniden atanmadan önce `clearInterval` ile temizlenmesi sağlandı, bu sayede uzun süreli kullanımlarda bellek sızıntıları (memory leak) önlendi.
  - `cleanupFirebase` fonksiyonu güncellendi; `messages` ve `reactions` için dinleyiciler `.limitToLast()` sorgusu kullanılarak kapatıldı (`.off()`). Ayrıca eksik olan `hostId` ve `hostOnly` `.off()` çağrıları eklendi, böylece gereksiz firebase dinleyicilerinin bellekte kalması engellendi.
  - Tarayıcı sekmesi kapatıldığında veya yenilendiğinde (navigation/reload) tetiklenen temizlik işlemleri `teardownScript` adlı bir fonksiyona çıkartıldı ve `beforeunload` etkinliğine ek olarak `pagehide` etkinliğine de bağlandı, bu sayede güvenilir bir arkaplan aralığı temizliği sağlandı.
