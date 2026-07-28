# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [28.07.2026] - Akıllı Eşitleme (Drift Correction) İyileştirmesi
- **Performans ve Senkronizasyon İyileştirmeleri:**
  - `startDriftCorrection` içerisindeki sapma toleransı eşiği (eskiden sabit 2.5s) dinamik hale getirildi. Ağ gecikmesi (`timeDiff`) ve durum uyumsuzluklarına göre (oynatma durumu uyumsuzsa daha hızlı tepki için 0.5s) tolerans seviyesi ayarlanarak senkronizasyon deneyimi akıcı hale getirildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
