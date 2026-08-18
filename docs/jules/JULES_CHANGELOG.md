# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [18.08.2026] - Hafıza Sızıntısı ve Performans İyileştirmeleri
- **Performans Optimizasyonları:**
  - `extension/content.js` dosyasında setInterval çağrıları değişkenlere (`videoTrackingInterval`, `driftCorrectionInterval`, vb.) atandı.
  - İlgili fonksiyonlarda interval'ler başlatılmadan önce eski interval'ler temizlenerek bellek sızıntıları önlendi.
- **Hata Düzeltmeleri:**
  - `cleanupFirebase()` içinde eksik `.off()` çağrıları düzeltildi, query'lere (`.limitToLast(50)`, `.limitToLast(5)`) tam eşleşen dinleyiciler `.off()` ile doğru şekilde temizlendi.
  - Sayfa kapanışı veya yenilenmesi durumunda çalışan `beforeunload` ve `pagehide` eventleri içerisine kapsamlı `fullTeardown()` fonksiyonu entegre edilerek tüm interval ve Firebase listener'ları düzgünce temizlendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
