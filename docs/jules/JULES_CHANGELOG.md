# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [21.07.2026] - Performans ve Layout Optimizasyonları (Bolt)
- **Performans İyileştirmeleri:**
  - Sidebar açılıp kapanırken oluşan sürekli DOM reflow (layout recalculation) sorunları düzeltildi. `body.filmsync-sidebar-open` sınıfından `transition: width 0.3s ease;` kaldırılarak video player çerçevelerinin anında daraltılması sağlandı, böylece Netflix, Disney+ ve YouTube'da video oynatımı sırasında frame dropları önlendi.
  - `#filmsync-mini-toolbar` animasyonu layout tetikleyen `right` özelliği yerine, GPU hızlandırmalı `transform: translateX()` ve `will-change: transform;` kullanacak şekilde yeniden düzenlendi.
  - `transition: all` kullanımı gereksiz layout hesaplamalarından kaçınmak için `transform`, `opacity`, `background` gibi spesifik özelliklere hedeflendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
