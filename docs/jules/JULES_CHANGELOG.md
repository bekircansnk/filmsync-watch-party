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

## 2024-07-23 - DOM Reflow ve Animasyon İyileştirmeleri

**Öğrenim:** `body.filmsync-sidebar-open` gibi genişlik (width) ve konum (right) özelliklerinde yapılan değişiklikler, video oynatıcısı üzerinde yüksek CPU tüketimine ve sayfanın (DOM) sürekli yeniden hesaplanmasına (reflow) neden olarak FPS kayıplarına yol açmaktadır. Ek olarak `transition: all` kullanımı her özelliği izlediği için gereksiz performans yükü getirir.

**Aksiyon:**
- Yan panel (sidebar) açıldığında videoyu sıkıştıran `width: calc(100% - 270px)` üzerindeki `transition: width` animasyonu kaldırılarak DOM reflow yükü azaltıldı.
- `#filmsync-mini-toolbar` (mini araç çubuğu) animasyonu `right` özelliğinden, GPU hızlandırmalı (GPU-accelerated) `transform: translateX` kullanımına geçirildi ve `will-change: transform, opacity` eklendi.
- Dosya içerisindeki tüm `transition: all` tanımları belirli (spesifik) CSS özelliklerine (örn: `opacity`, `transform`, `background-color`) dönüştürüldü.
