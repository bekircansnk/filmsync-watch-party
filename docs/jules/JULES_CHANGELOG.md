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

## [30.09.2026] - Performans İyileştirmesi: DOM Reflow Optimizasyonu
- **Performans:**
  - `extension/content.js` içindeki `body.filmsync-sidebar-open` ve video oynatıcı (Netflix, Disney+, YouTube vb.) stilleri güncellendi.
  - `width: calc(100% - 270px)` yerine `padding-right: 270px` ve `box-sizing: border-box` kullanılarak, kenar çubuğu (sidebar) açıldığında yaşanan DOM reflow (yeniden hesaplama) yükü minimize edildi.
  - Bu sayede, "watch party" sırasında yüksek kare hızında (high-frame-rate) video oynatımında meydana gelebilecek takılma ve performans sorunlarının önüne geçildi.
