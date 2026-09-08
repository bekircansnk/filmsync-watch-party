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

## [08.09.2026] - Firebase Dinleyici Temizliği ve Bellek Sızıntısı Giderme
- **Performans ve Hata Düzeltmeleri:**
  - Uzun süren video sekmelerinde bellekte oluşan sızıntıları önlemek için `extension/content.js` içerisindeki `cleanupFirebase()` fonksiyonu güncellendi.
  - Eksik olan `hostId` ve `hostOnly` dinleyicileri için `.off()` çağrıları eklendi.
  - `messages` ve `reactions` dinleyicilerinin başarıyla temizlenmesi için abonelikten çıkma (.off) çağrılarına `.limitToLast(50)` ve `.limitToLast(5)` sorguları (query) eklendi, böylece `.on()` kayıtlarıyla tam eşleşme sağlandı.
