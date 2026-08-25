# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [25.08.2026] - Drift Correction ve Eşik İyileştirmeleri
- **Ağ Gecikmesi Optimizasyonu:**
  - `startDriftCorrection` fonksiyonunda sabit 2.5 saniyelik sapma eşiği (drift threshold) dinamik hale getirildi.
  - İstemcinin Firebase'den veri çekerken yaşadığı ağ gecikmesi hesaplanarak eşik değerine eklendi.
  - `playStateMismatch` (oynatma durumu uyumsuzluğu) anında daha hassas eşikleme (0.5 sn) uygulanması sağlandı, bu sayede senkronizasyon pürüzsüzleştirildi.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
