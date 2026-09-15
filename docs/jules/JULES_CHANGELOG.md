# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [15.09.2026] - Drift Correction (Sapma Düzeltme) İyileştirmesi
- **İyileştirmeler:**
  - Ağ gecikmesini (network latency) kompanse etmek için `startDriftCorrection` fonksiyonuna eşzamanlı (`Promise.all`) `.info/serverTimeOffset` sorgusu eklendi.
  - Sabit 2.5 saniyelik senkronizasyon sapma eşiği, ağ gecikmesine göre (latencySeconds) dinamik olarak ayarlanacak şekilde (dinamik eşik: `Math.max(0.5, 2.5 - latencySeconds)`) iyileştirildi. Bu sayede kesintisiz (seamless) senkronizasyon sağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
