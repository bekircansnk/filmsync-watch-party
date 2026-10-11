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

## [11.10.2026] - Firebase Listener Memory Leak Düzeltmesi
- **Performans İyileştirmeleri:**
  - `extension/content.js` içindeki `cleanupFirebase` fonksiyonu güncellendi.
  - Odaya ait tüm dinleyicilerin (özellikle query bazlı `messages` ve `reactions` gibi limitlenmiş olanlar ve eksik olan `hostId`, `hostOnly`) bağlantı koparma (teardown) işlemleri düzeltildi.
  - `.off()` metodunun kayıt anındaki referans ile birebir eşleşmesi sağlanarak uzun süren sekme oturumlarındaki bellek sızıntıları (memory leaks) engellendi.
