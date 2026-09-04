## [04.09.2026] - Dinamik Sapma Düzeltmesi (Drift Correction)
- **Hata Düzeltmeleri/İyileştirmeler:**
  - `extension/content.js` içindeki `startDriftCorrection` mantığı güncellendi.
  - Sabit 2.5 saniyelik eşik değeri yerine ağ gecikmesine (latency) ve oynatma durumu uyuşmazlığına bağlı dinamik bir eşik değeri (dynamic threshold) kullanıldı. Bu sayede senkronizasyon daha sorunsuz hale getirildi.

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
