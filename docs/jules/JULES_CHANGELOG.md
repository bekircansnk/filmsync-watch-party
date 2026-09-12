# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - `extension/content.js` dosyasında, odadan ayrılma (cleanupFirebase) işlemi sırasında tüm aktif Firebase veri tabanı dinleyicilerinin (hostId, hostOnly, limitli mesajlar ve reaksiyonlar dahil) doğru şekilde kapatılması sağlandı. Bu sayede uzun süren oturumlarda oluşabilecek bellek sızıntılarının (memory leak) önüne geçildi.
  - Video URL'si yönlendirme bildirimlerinde regex söz dizimi hatası (SyntaxError: Invalid regular expression flags) giderildi.
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
