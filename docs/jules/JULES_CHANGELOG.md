# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [07.08.2026] - Dinamik Senkronizasyon Eşiği
- **Geliştirmeler:**
  - `extension/content.js` içerisindeki `startDriftCorrection` fonksiyonunda kullanılan sabit 2.5 saniyelik sapma toleransı dinamik hale getirildi.
  - Durum uyuşmazlığında daha hızlı tepki (1.0s) ve oynatma anında ağ gecikmesine (`timeDiff`) bağlı olarak artan daha esnek tolerans (2.0s - 4.0s) hesaplaması eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
