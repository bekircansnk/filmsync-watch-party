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

## [01.10.2026] - Drift Correction ve Server Time Offset İyileştirmeleri
- **Geliştirmeler:**
  - `extension/content.js` içindeki drift correction (sapma düzeltme) mantığı, Firebase `.info/serverTimeOffset` kullanılarak atomik saat eşitlemesi ile güncellendi.
  - Ağ gecikmeleri (network latency) veya kullanıcı durum uyumsuzluklarına dayalı dinamik `dynamicThreshold` hesaplaması eklendi.
  - `Date.now()` hesaplamaları, yerel makine saatindeki kaymaları önlemek için `timeSinceUpdate` olarak revize edildi.
