# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [18.08.2026] - Dinamik Sapma Düzeltmesi (Drift Correction) Eşik Ayarı
- **Hata Düzeltmeleri / İyileştirmeler:**
  - `extension/content.js` dosyasındaki `startDriftCorrection` metodunda bulunan sabit 2.5 saniyelik zaman sapma eşiği (drift threshold) dinamik hale getirildi.
  - Oynatma durumu uyuşmazlığında anında eşitleme sağlandı (`driftThreshold = 0`).
  - Duraklatılmış durumda daha katı bir eşik (`0.5s`) belirlendi.
  - Oynatma sırasında ağ gecikmesine bağlı olarak esnek bir eşik hesaplandı ve `3.0s` ile sınırlandırıldı. Bu sayede senkronizasyon stabilitesi artırıldı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
