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

## [20.07.2026] - GPU İvmeli Arayüz Optimizasyonları (Bolt Performans Ajanı)
- **Performans İyileştirmeleri:**
  - `extension/content.js` dosyasında DOM reflow ve repaint maliyetlerini düşürmek için layout tetikleyen özellikler (örn. `right`, `width`) `transform: translateX` ile değiştirildi.
  - Video oynatıcı (Netflix, YouTube, Disney+) kare hızını düşüren `transition: all` komutları kaldırılarak sadece gerekli GPU ivmeli özelliklere (örn. `opacity`, `transform`) kısıtlandı.
  - Yan panel açıldığında oluşan ve video kare hızını (fps) geçici olarak düşüren `.filmsync-sidebar-open` sınıfındaki `transition: width 0.3s ease` komutu iptal edilerek sayfa daralması anlık hale getirildi.
