# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [06.08.2026] - Performans Optimizasyonları ve UI Refactor
- **Performans:**
  - `extension/content.js` içerisinde DOM reflow (yeniden hesaplama) fırtınasını önlemek adına `body.filmsync-sidebar-open` sınıfından `transition: width` kuralı kaldırıldı.
  - `#filmsync-mini-toolbar` bileşeni, `right` yerine GPU hızlandırmalı `transform: translateX` ve `will-change: transform` kullanacak şekilde güncellendi.
  - Genel reflow tetiklemelerini engellemek için `transition: all` kullanımları spesifik özelliklere (`transform`, `opacity`, `background-color`, `box-shadow`, `border-color`) çevrildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
