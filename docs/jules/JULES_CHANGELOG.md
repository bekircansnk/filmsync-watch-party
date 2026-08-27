# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [27.08.2026] - DOM Reflow Optimizasyonu
- **Performans İyileştirmesi:**
  - Sidebar açılıp kapanırken video oynatıcı (Netflix, Disney+, YouTube) kapsayıcılarının genişlik değişimini anime eden (`transition: width`) kural kaldırıldı. Bu sayede tarayıcının sürekli DOM reflow (yeniden hesaplama) yapması engellenerek, video izleme partilerinde kare hızı (framerate) düşüşleri ve kasmalar giderildi. Genişlik değişimleri artık anında gerçekleşiyor.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
