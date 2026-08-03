# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [03.08.2026] - Performans Optimizasyonu: DOM Reflow Azaltıldı
- **Performans:**
  - `extension/content.js` dosyasındaki CSS geçişleri optimize edildi.
  - Oynatıcı kenar çubuğu açılıp kapanırken yaşanan kare hızı düşüşlerini (layout reflow fırtınaları) önlemek için `body.filmsync-sidebar-open` sınıfından `transition: width 0.3s ease;` kuralı kaldırıldı.
  - Video oynatımı sırasında yüksek kare hızını (high-frame-rate) korumak adına tüm `transition: all` kuralları, `transform`, `opacity`, `background-color` ve `box-shadow` gibi spesifik, GPU hızlandırmalı özelliklerle değiştirildi.
  - Performans iyileştirmelerini desteklemek üzere ilgili elemanlara `will-change` bildirimleri eklendi.
- **Hata Düzeltmeleri:**
  - `applyRemoteState` içindeki URL normalizasyonu sırasında karşılaşılan hatalı regex (Geçersiz düzenli ifade flag'leri) düzeltildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
