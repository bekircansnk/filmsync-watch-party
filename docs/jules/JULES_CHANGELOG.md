# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [25.07.2026] - Sapma Düzeltme Mantığı Geliştirmesi
- **İyileştirmeler:**
  - `startDriftCorrection` içerisindeki sapma eşiği mantığı (drift correction threshold logic) dinamik hale getirildi. Artık sabit 2.5 saniye yerine, ağ gecikmesi (network latency) ve oynatma durumu uyumsuzluğuna (play state mismatch) bağlı olarak eşik değerleri ayarlanıyor. Bu sayede senkronizasyon deneyimi iyileştirildi ve gereksiz atlamalar engellendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
