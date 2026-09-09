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

## [20.07.2026] - Firebase Dinleyici Sızıntılarının Düzeltilmesi (Performans)
- **Performans İyileştirmeleri:**
  - `extension/content.js` dosyasındaki `cleanupFirebase` fonksiyonu, sekmeler arası geçişte veya odadan ayrılma durumunda eski Firebase dinleyicilerinin bellekte sızıntı (memory leak) yapmasını önleyecek şekilde güncellendi.
  - Özel sorgularla (`limitToLast`) kaydedilen dinleyiciler (`messages` ve `reactions`), Firebase'in gerektirdiği şekilde tam referansları çağrılarak (`.limitToLast().off()`) güvenli biçimde temizlendi.
  - Önceden unutulmuş olan `hostId` ve `hostOnly` dinleyicileri de temizleme rutinine eklendi.
