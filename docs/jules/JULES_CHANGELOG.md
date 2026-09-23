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

## [23.09.2026] - Dinamik Sapma Düzeltme (Drift Correction) İyileştirmesi
- **Geliştirme:**
  - `startDriftCorrection` fonksiyonundaki eşitleme mantığı güncellendi.
  - Ağ gecikmesini (network latency) ölçmek ve sunucu saat farkını (.info/serverTimeOffset) hesaba katmak için eşzamanlı (`Promise.all`) veri çekimi eklendi.
  - Sapma toleransı, oynatma durumu uyuşmazlığına ve ağ gecikmesine göre dinamik hale getirildi, böylece gereksiz sıçramalar (jitter) önlendi ve senkronizasyon pürüzsüzleştirildi.
