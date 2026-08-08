# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [08.08.2026] - Animasyon ve Reflow Optimizasyonları (GPU Hızlandırma)
- **Performans İyileştirmeleri:**
  - Sidebar açılıp kapanma animasyonlarında (`#filmsync-mini-toolbar` ve araç çubukları) `right` yerine `transform: translateX()` kullanılarak DOM reflow (yeniden hesaplama) işlemleri engellendi.
  - `body.filmsync-sidebar-open` genişlik geçişi (`transition: width`) kaldırılarak, Netflix, YouTube ve Disney+ oynatıcılarının kare hızı düşüşü yaşamadan anında yeniden boyutlanması sağlandı.
  - Genel tarayıcı oluşturma yükünü hafifletmek için `extension/content.js` içerisindeki tüm `transition: all` kullanımları, hedeflenen spesifik özelliklere (örneğin `transform`, `opacity`, `background-color`) dönüştürüldü.
  - Gerekli yerlere `will-change: transform;` eklenerek tarayıcıya animasyon için GPU hazırlığı yapması talimatı verildi.




## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
