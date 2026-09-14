# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [14.09.2026] - Drift Correction ve Regex Düzeltmesi
- **Geliştirmeler:**
  - `startDriftCorrection` fonksiyonundaki sapma tolerans değeri (2.5 saniye) dinamikleştirildi. `Promise.all` ile eş zamanlı `.info/serverTimeOffset` sorgusu yapılarak ağ gecikmesi ölçüldü ve bu doğrultuda dinamik tolerans değeri belirlendi. Ayrıca zaman farklılıkları sunucu saati ile doğru hizalandı.
- **Hata Düzeltmeleri:**
  - `extension/content.js` içindeki hatalı olan regex söz dizimi (`replace(/\/$/, '')`) düzeltilerek geçersiz regex uyarıları çözümlendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
