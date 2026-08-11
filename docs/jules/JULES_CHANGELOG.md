# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [11.08.2026] - DOM Yeniden Akış (Reflow) Optimizasyonu
- **Performans İyileştirmeleri:**
  - Sidebar açılıp kapandığında video oynatıcı (Netflix, Disney+, YouTube) ve sayfa gövdesinin genişliğinin (width) `transition: width 0.3s ease` ile anime edilmesi kaldırılarak, her animasyon karesinde meydana gelen maliyetli DOM yeniden akış (reflow) hesaplamalarının önüne geçildi. Bu sayede yüksek kare hızlarında (FPS) video oynatımı sırasında takılmalar önlendi.
  - `extension/content.js` içindeki genel `transition: all` CSS kuralı, DOM yeniden akışına neden olan özellikleri dışlayacak şekilde spesifik GPU hızlandırmalı özelliklerle (`transform`, `opacity`, `background-color`, `box-shadow`, `border-color`) değiştirildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
