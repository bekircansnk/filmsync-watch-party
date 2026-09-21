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

## [21.09.2026] - Otomatik Eşitleme ve Hata Giderme
- **Geliştirmeler:**
  - `startDriftCorrection` fonksiyonunda senkronizasyon eşiği dinamik hale getirildi.
  - Gecikme hesaplamaları için `Promise.all` kullanılarak Firebase `.info/serverTimeOffset` değeri ile birleştirilip doğru zaman sapması bulundu.
  - Ağ gecikmesi ve durum uyumsuzluklarına göre esnek tepki gösteren bir eşik (dynamic threshold) yapısı eklendi, böylece senkronizasyon daha pürüzsüz hale getirildi.
