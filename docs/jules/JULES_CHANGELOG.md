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

## [11.09.2026] - Sidebar Layout Optimization
- **Performans İyileştirmesi:**
  - Video oynatıcıların DOM reflow yükünü azaltmak ve Netflix, Disney+, YouTube gibi platformlarda yüksek kare hızlarını korumak amacıyla `body.filmsync-sidebar-open` CSS sınıfındaki `transition: width` kuralı kaldırıldı.
  - Kenar çubuğu (sidebar) açıldığında, kapatıldığında ve ilk yüklendiğinde video oynatıcıların doğru boyutlandırılmasını sağlamak için `window.dispatchEvent(new Event('resize'))` eklendi.
