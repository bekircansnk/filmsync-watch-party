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

## [24.09.2026] - Akıllı Eşitleme ve Dinamik Sapma İyileştirmesi
- **Geliştirmeler:**
  - `extension/content.js` içindeki `startDriftCorrection` algoritması geliştirildi.
  - Sabit 2.5 saniyelik sapma eşiği (threshold) kaldırılarak, ağ gecikmesine (network latency) ve oyun durumu uyumsuzluklarına (playStateMismatch) dayalı dinamik eşik (dynamic threshold) mantığı eklendi.
  - Zamanlama hatalarını önlemek ve senkronizasyon hassasiyetini artırmak için Firebase `/.info/serverTimeOffset` kullanılarak sunucu-istemci zaman farkı hesaplaması eklendi.
