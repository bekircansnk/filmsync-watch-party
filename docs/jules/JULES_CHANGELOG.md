# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [12.08.2026] - Sidebar Yeniden Boyutlandırma Optimizasyonu
- **Performans İyileştirmesi:**
  - `extension/content.js` dosyasında, sidebar açıldığında oluşan animasyonlu `width` değişimi (`transition: width 0.3s ease;`) kaldırılarak anlık boyutlandırmaya geçildi. Bu sayede Netflix, Disney+ ve YouTube gibi platformlarda izleme partileri sırasında ardışık DOM yeniden hesaplamalarının (reflow) ve video kare hızı düşüşlerinin önüne geçildi.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
