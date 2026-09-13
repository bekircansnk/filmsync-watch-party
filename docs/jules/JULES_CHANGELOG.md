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

## [13.09.2026] - Performans ve Layout Optimizasyonları
- **Performans:** Netflix, Disney+ ve YouTube üzerinde yüksek kare hızlı (high-frame-rate) video oynatımını sağlamak ve DOM reflow (yeniden hesaplama) yükünü en aza indirmek için yan menü açılıp kapanırken uygulanan CSS `transition` efekti kaldırıldı.
- **Düzen (Layout):** Yan menü oluşturulduğunda ve kaldırıldığında, yayın platformlarının video oynatıcı boyutlarını yeni pencere ölçülerine anında adapte edebilmesi için `window.dispatchEvent(new Event('resize'))` tetikleyicileri eklendi.
