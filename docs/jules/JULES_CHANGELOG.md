# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [01.08.2026] - Performans Optimizasyonları (DOM Reflow ve GPU İzolasyonu)
- **Hata Düzeltmeleri:**
  - Sidebar açılış/kapanış anında (video izlerken) oluşan yüksek kare kayıpları ve takılmalar engellendi. `body.filmsync-sidebar-open` sınıfındaki `transition: width` kuralı kaldırılarak, boyutlandırmanın tek bir boyama (paint) döngüsünde anında gerçekleşmesi sağlandı.
  - Olası layout thrashing (sayfa yerleşim motorunun yorulması) sorunlarını önlemek adına projedeki tüm `transition: all` kuralları GPU hızlandırmalı özelliklere (örn: `transform`, `opacity`, `background-color`) çevrildi ve `will-change: transform` kuralları eklendi.
  - `#filmsync-mini-toolbar` elementi `right` özelliği yerine, daha performanslı olan `transform: translateX()` kullanılarak taşındı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
