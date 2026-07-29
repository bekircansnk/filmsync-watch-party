# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [20.07.2026] - Performans Optimizasyonları ve Bellek Sızıntısı Giderimi
- **Hata Düzeltmeleri & İyileştirmeler:**
  - `extension/content.js` dosyasında uzun süreli sekmelerde oluşabilecek bellek sızıntılarını (memory leaks) önlemek için interval'lar (`setInterval`) yeniden atandıklarında temizlenecek (`clearInterval`) şekilde güncellendi.
  - Odayı kapatırken, sayfa yenilenirken veya başka sayfaya geçildiğinde Firebase üzerinde dinleyicilerin tamamen temizlenebilmesi için `cleanupFirebase()` fonksiyonuna `.off()` çağrıları eklendi.
  - Özel Firebase sorgularının (`.limitToLast()`) `.off()` ile doğru referans üzerinden kapatılması sağlandı.
  - Sayfa kapanma temizlik işlemleri daha güvenilir olması için `beforeunload` ve `pagehide` olaylarına bağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
