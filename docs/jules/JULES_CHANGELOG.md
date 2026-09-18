# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [18.09.2026] - Akıllı Senkronizasyon (Auto-Sync) İyileştirmesi
- **Performans/Kararlılık:**
  - `startDriftCorrection` içindeki sabit 2.5 saniyelik sapma toleransı dinamik hale getirildi.
  - Firebase `/.info/serverTimeOffset` kullanılarak sunucu saatine göre sapmalar (drift) düzeltildi.
  - Ağ gecikmesi hesaplanarak (`latency`) duraklatma ve oynatma durumlarına göre daha hassas bir tolerans sınırı (`dynamicThreshold`) sağlandı.



## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
