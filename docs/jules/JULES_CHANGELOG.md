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

## 2026-08-05 - Performans İyileştirmesi (DOM Reflow Minimizasyonu)
- `extension/content.js` dosyasında yer alan UI bileşenlerinin animasyonlarında kullanılan ve layout hesaplamalarını tetikleyen (`width`, `right`, `all`) geçiş efektleri (transition) temizlendi.
- Arayüz animasyonları, GPU donanım hızlandırmasından (hardware acceleration) faydalanacak şekilde `transform` ve `opacity` özellikleri ile değiştirildi ve `will-change` kullanıldı.
- `body.filmsync-sidebar-open` sınıfından `width` geçiş efekti kaldırılarak, kenar çubuğu açılıp kapanırken video oynatıcıları (Netflix, Disney+, YouTube) üzerindeki yeniden hesaplama fırtınaları (reflow storms) önlendi, yüksek kare hızlı video oynatımı sağlandı.
