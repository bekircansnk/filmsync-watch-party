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

## [30.08.2026] - Senkronizasyon İyileştirmeleri
- **Hata Düzeltmeleri:**
  - `startDriftCorrection` fonksiyonunda kullanılan sabit 2.5 saniyelik sapma eşiği dinamik hale getirildi. Artık eşik değeri, ağ gecikmesine veya oynatma durumu uyumsuzluklarına göre (0.5s ile 4.0s arasında) dinamik olarak ayarlanarak daha pürüzsüz bir eşitleme sağlanmaktadır.
  - `applyRemoteState` fonksiyonundaki geçersiz regex bayrağı hatası düzeltildi (URL normalizasyonunda ters eğik çizgi kullanılması).
