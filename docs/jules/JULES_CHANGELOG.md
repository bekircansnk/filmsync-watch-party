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

## [14.10.2026] - Performans İyileştirmesi: DOM Reflow Optimizasyonu
- **Optimizasyon:**
  - Netflix, Disney+ ve YouTube gibi platformlarda watch party sırasında video oynatımında kare atlamalarını (dropped frames) ve aşırı DOM reflow (yeniden hesaplama) yükünü önlemek amacıyla, `body.filmsync-sidebar-open` sınıfındaki `width` CSS geçişi (transition) kaldırılarak anlık (instantaneous) boyut değişimine geçildi.
