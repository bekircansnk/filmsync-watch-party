# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [15.08.2026] - Dinamik Sapma Düzeltme Eşiği Optimizasyonu
- **Geliştirmeler:**
  - `startDriftCorrection` içindeki eşik hesaplama mantığı dinamik hale getirildi.
  - Ağ gecikmesi ve oynatma durumu (play state) uyumsuzluğuna bağlı olarak dinamik bir eşik değeri (dynamicThreshold) hesaplanıyor.
  - Senkronizasyon düzeltmeleri sırasında artık sabit bir değer (2.5s) yerine bu dinamik eşik kullanılarak daha akıcı bir senkronizasyon sağlanıyor.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
