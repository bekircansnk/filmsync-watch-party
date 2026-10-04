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

## [04.10.2026] - Oynatıcı Performans Optimizasyonu
- **Performans İyileştirmesi:**
  - Netflix, Disney+ ve YouTube gibi platformlarda izleme partileri (watch party) esnasında, yan panel (sidebar) açıldığında oynatıcının daraltılması sırasında oluşan DOM yeniden hesaplama (reflow) yükünü minimize etmek için CSS `transition` özelliği `extension/content.js` içerisindeki `body.filmsync-sidebar-open` sınıfından kaldırıldı. Bu değişiklik, düzen değişikliklerinin tek bir kerede uygulanmasını sağlayarak yüksek kare hızlarında (high-framerate) video oynatımının stabil kalmasına yardımcı olacaktır.
