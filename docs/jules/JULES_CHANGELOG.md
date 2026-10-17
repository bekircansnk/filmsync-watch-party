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

## YYYY-MM-DD
- `startDriftCorrection` fonksiyonundaki senkronizasyon eşiği (threshold) dinamik hale getirildi:
  - Oynatma durumlarında (play/pause) uyuşmazlık olduğunda bekleme süresi 0 saniyeye indirilerek anında tepki vermesi sağlandı.
  - Oynatma süresi sapmalarında (drift), normal 2.5 saniyelik toleransa ağ gecikmesi (network latency) tahmini eklenerek gereksiz senkronizasyonların (rubber-banding) önüne geçildi.
