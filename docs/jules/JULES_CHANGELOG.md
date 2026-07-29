# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [29.07.2026] - Performans ve Video Oynatıcı Optimizasyonları
- **Performans İyileştirmeleri:**
  - `extension/content.js` dosyasında `transition: all` kullanımı kaldırılarak spesifik GPU-hızlandırmalı özellikler (`transform`, `opacity`, `background-color`, `box-shadow`) hedeflendi.
  - Video oynatıcı üzerinde çalışan UI animasyonlarındaki DOM reflow (yeniden düzenleme) yükünü hafifletmek için `right` yerine `transform: translateX` ile konumlandırma yapıldı ve `will-change` eklendi.
  - Netflix, YouTube ve Disney+ platformlarında yüksek kare hızını korumak için, sayfa daraltma mantığı sırasındaki animasyon (transition: width) kaldırılarak genişlik değişikliklerinin anında gerçekleşmesi sağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
