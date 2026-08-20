# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [20.08.2026] - Dinamik Drift Düzeltme İyileştirmesi
- **Eşitleme Geliştirmesi:**
  - `startDriftCorrection` içindeki drift eşiği (eskiden 2.5s) dinamikleştirildi. `playStateMismatch` (oynatma durumu uyumsuzluğu) olduğunda eşik 0.5s'ye düşürülerek daha hızlı tepki verilmesi sağlandı. Ağ gecikmesine bağlı olarak (`timeDiff`), eşiğin daha büyük gecikmeleri tolere etmesi adına `Math.max(2.5, timeDiff * 0.1)` formülüyle hesaplanmasına geçildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
