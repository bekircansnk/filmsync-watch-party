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

## [12.10.2026] - Bellek Sızıntısı ve Firebase Temizliği Optimizasyonu
- **Hata Düzeltmeleri:**
  - Uzun süren video sekmelerinde (örneğin film izlerken) ortaya çıkan bellek sızıntılarını (memory leak) önlemek amacıyla Firebase listener'larının (.on() çağrılarının) .off() ile doğru bir şekilde sonlandırılması sağlandı.
  - `cleanupFirebase` fonksiyonuna `hostId` ve `hostOnly` aboneliklerini iptal eden .off() çağrıları eklendi.
  - `messages` ve `reactions` listener'larının düzgün bir şekilde temizlenebilmesi için kayıt anında kullanılan kısıtlayıcı sorgu parametreleri (`.limitToLast(50)` ve `.limitToLast(5)`) temizlik işlemi sırasında da birebir eşleştirilerek kullanıldı.
