# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [21.08.2026] - Firebase Listener Memory Leak Düzeltmeleri
- **Hata Düzeltmeleri:**
  - `extension/content.js` dosyasındaki `cleanupFirebase` fonksiyonu, tüm Firebase event listener'larını doğru şekilde kapatacak biçimde güncellendi.
  - `hostId` ve `hostOnly` için `.off()` çağrıları eklendi.
  - `messages` ve `reactions` için olan `.off()` çağrıları, memory leak oluşumunu önlemek amacıyla kayıt anında kullanılan `.limitToLast()` sorgularıyla tam eşleşecek şekilde düzeltildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
