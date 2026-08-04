# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [04.08.2026] - Performans ve Layout (Düzen) İyileştirmeleri
- **Performans Optimizasyonları:**
  - `extension/content.js` içerisinde layout kırılmalarına ve framerate düşüşlerine (DOM reflow/layout thrashing) sebep olan tüm `transition: all` özellikleri tespit edildi. Bu özellikler GPU destekli ve render döngüsünü zorlamayan `transform`, `opacity`, `background-color` gibi daha spesifik kurallarla değiştirildi.
  - Netflix, YouTube ve Disney+ oynatıcılarının yeniden boyutlandırılması esnasında sürekli tetiklenen ve performans kaybına yol açan `body.filmsync-sidebar-open` sınıfındaki `transition: width 0.3s ease;` özelliği kaldırıldı. Bu sayede oynatıcı boyutu anında değiştirilerek yüksek framerate korunmuş oldu.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
