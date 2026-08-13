# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [13.08.2026] - Performans Optimizasyonu: Sidebar Yeniden Boyutlandırma
- **Performans İyileştirmesi (Bolt):**
  - Netflix, Disney+ ve YouTube üzerinde sidebar (sohbet arayüzü) açılıp kapanırken yaşanan DOM reflow (yeniden hesaplama) yükünü azaltmak için `body.filmsync-sidebar-open` sınıfından `transition: width 0.3s ease;` özelliği kaldırıldı. Bu sayede `width` (genişlik) değişimi animasyonsuz olarak anında gerçekleşiyor, bu da animasyon sırasındaki her karede tetiklenen sürekli yeniden hesaplama (reflow) yükünü ortadan kaldırarak video kare hızının (framerate) düşmesini engelliyor.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
