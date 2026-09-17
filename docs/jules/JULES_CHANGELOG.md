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

## [$(date +%d.%m.%Y)] - Kenar Çubuğu Performans Optimizasyonu
- **Performans İyileştirmeleri:**
  - `body.filmsync-sidebar-open` stilindeki `transition: width 0.3s ease;` kuralı kaldırılarak izleme partileri sırasında kenar çubuğu açılıp kapandığında oluşan DOM yeniden hesaplama (reflow) yükü azaltıldı. Bu sayede Netflix, YouTube ve Disney+ gibi platformlarda yüksek kare hızlı video oynatımı sırasında oluşabilecek kasmalar önlendi.
- **Hata Düzeltmeleri:**
  - `extension/content.js` içerisindeki geçersiz düzenli ifade bayrakları (Invalid regular expression flags) hatası giderildi. `replace(/\\/$/, '')` kullanımı `replace(/\/$/, '')` olarak güncellendi.
