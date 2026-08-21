# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [21.08.2026] - Performans Optimizasyonu (Video Oynatıcı Layout)
- **Performans İyileştirmeleri:**
  - Sidebar enjeksiyonu (`body.filmsync-sidebar-open`) sırasında yaşanan DOM reflow (yeniden hesaplama) yükünü azaltmak ve Netflix, Disney+, YouTube gibi platformlarda video oynatımındaki framerate düşüşlerini önlemek için `transition: width` kuralı kaldırıldı. Artık boyutlandırma anında gerçekleşerek main-thread yükü hafifletiliyor.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
