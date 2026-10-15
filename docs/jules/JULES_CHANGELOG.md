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

## [15.10.2026] - Performans ve Reflow Optimizasyonu
- **Hata Düzeltmeleri / İyileştirmeler:**
  - `extension/content.js` içindeki `body.filmsync-sidebar-open` css sınıfından `width` ve `transition: width` özellikleri kaldırıldı.
  - `body.filmsync-sidebar-open` durumu için Netflix, YouTube ve Disney+ oynatıcılarına uygulanan genişlik (`width`) ve konum (`left`) bazlı daraltma kuralları, yüksek FPS'li videolarda DOM reflow yükünü (frame düşüşleri ve kasmaları) azaltmak amacıyla donanım hızlandırmalı `transform` (translateX ve scale) özelliğine çevrildi.
