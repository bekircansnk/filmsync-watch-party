# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [30.07.2026] - Bolt: Performans İyileştirmeleri (DOM Reflow Optimizasyonu)
- **Performans İyileştirmeleri:**
  - `extension/content.js` içerisinde CSS layout-triggering animasyonlar yerine GPU hızlandırmalı transform özelliklerine geçiş yapıldı.
  - `#filmsync-mini-toolbar` animasyonları için `transition: all` kaldırılarak `transform` ve `opacity` geçişlerine odaklanıldı ve `will-change: transform` eklendi.
  - Kenar çubuğu açıldığında `body.filmsync-sidebar-open` sınıfına bağlı olan `transition: width 0.3s ease;` kuralı kaldırılarak, Netflix, YouTube ve Disney+ üzerinde ağır DOM reflow/layout-shift yükü önlendi, kare hızı (framerate) korundu.
  - Geriye kalan `transition: all` kuralları spesifik, performansı düşürmeyen CSS özelliklerine dönüştürüldü.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
