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

## [15.09.2026] - Performans İyileştirmesi: DOM Yeniden Akış Optimizasyonu
- **Performans Optimizasyonları:**
  - `extension/content.js` dosyasında, kenar çubuğu açılıp kapandığında `body` ve video kapsayıcılarının genişliklerinde kullanılan CSS `transition` özelliği kaldırıldı. Bu sayede, animasyon sırasında oluşan sürekli DOM yeniden akış (reflow) yükü azaltılarak Netflix, Disney+ ve YouTube üzerinde yüksek kare hızlı (high-frame-rate) video oynatımı sağlandı.
  - Kenar çubuğu açılıp kapandıktan hemen sonra video oynatıcıların yeni boyutlara düzgün bir şekilde adapte olmasını garantilemek için `document.body.classList.add('filmsync-sidebar-open');` ve `removeChatUI` fonksiyonlarına `window.dispatchEvent(new Event('resize'))` tetikleyicisi eklendi.
