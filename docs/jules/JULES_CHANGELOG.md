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

## [03.09.2026] - Otomatik Senkronizasyon (Drift Correction) İyileştirmesi
- **Geliştirme:**
  - `extension/content.js` içindeki `startDriftCorrection` mantığı ağ gecikmesine ve oynatma durumu uyuşmazlığına göre dinamik olarak ayarlanacak şekilde güncellendi.
  - Oynatma durumları uyuşmadığında eşik daraltıldı, ağ gecikmesi durumunda ise jitter oluşumunu engellemek amacıyla eşik (max 5.0s olacak şekilde) esnetildi.
