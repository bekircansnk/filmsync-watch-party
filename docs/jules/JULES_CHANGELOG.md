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

## [07.09.2026] - Oynatıcı DOM Reflow Optimizasyonu (Bolt)
- **Performans İyileştirmeleri:**
  - `extension/content.js` içerisinde `.filmsync-sidebar-open` sınıfındaki `width` animasyonu (`transition: width 0.3s ease;`) kaldırılarak Netflix, Disney+ ve YouTube'da sohbet paneli açılırken oluşan yoğun DOM reflow yükü (layout thrashing) engellendi. Bu sayede yüksek kare hızlarında (high-frame-rate) video oynatılırken yaşanan takılmalar giderildi.
