# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [20.08.2026] - Firebase Hafıza Sızıntısı (Memory Leak) Düzeltmesi
- **Performans ve Hata Düzeltmeleri:**
  - `extension/content.js` içindeki `cleanupFirebase()` fonksiyonu, odaya tekrar girişlerde veya iframe yenilemelerinde oluşabilecek hafıza sızıntılarını önlemek için güncellendi.
  - Orijinal dinleyiciler (`.limitToLast(50).on(...)` vb.) kaydedilirken kullanılan aynı sorgu nesneleri, `off()` çağrılarında da tam eşleşme sağlanacak şekilde (`.limitToLast(50).off()`) düzenlendi.
  - Eksik olan `hostId` ve `hostOnly` Firebase dinleyicilerinin temizlenme (teardown) işlemi eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
