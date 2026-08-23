# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [23.08.2026] - Performans Optimizasyonu (Sayfa Daraltma Reflow Giderimi)
- **Performans İyileştirmeleri:**
  - `extension/content.js` dosyasında `body.filmsync-sidebar-open` için tanımlı olan `width` animasyonu (`transition: width 0.3s ease;`) kaldırıldı. Bu sayede, Netflix, Disney+ ve YouTube gibi platformlarda sohbet paneli açılıp kapanırken ortaya çıkan sürekli DOM reflow (layout yeniden hesaplama) işlemleri engellendi ve video oynatma sırasındaki kare hızı (frame rate) düşüşleri önlendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
