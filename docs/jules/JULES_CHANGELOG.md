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

## [11.10.2026] - Drift Correction İyileştirmesi
- **Geliştirmeler:**
  - `extension/content.js` içindeki `startDriftCorrection` fonksiyonunda yer alan sabit 2.5 saniyelik sapma eşiği dinamik hale getirildi.
  - Ağ gecikmesi ve durum uyumsuzluklarına göre eşik değeri (`dynamicThreshold`) hesaplanarak, maksimum 5.0 saniye ile sınırlandırıldı. Bu sayede kesintisiz senkronizasyon sağlandı.
