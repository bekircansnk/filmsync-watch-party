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


## [2026-10-01] - Performans İyileştirmesi: DOM Reflow Optimizasyonu
- **Düzenlemeler:**
  - `extension/content.js` içindeki `body.filmsync-sidebar-open` sınıfından `transition: width 0.3s ease;` kuralı kaldırılarak animasyon esnasında saniyede 60 kez tetiklenen DOM reflow (yeniden düzenleme) yükü engellendi.
  - Video oynatıcıların (Netflix, Disney+, YouTube vb.) doğru yeniden boyutlandırılabilmesi için `width: calc(100% - 270px)` kuralı korundu, böylece yüksek kare hızlarında (high-framerate) video oynatımı güvence altına alındı.
