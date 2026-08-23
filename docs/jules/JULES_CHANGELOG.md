# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [23.08.2026] - Firebase Bellek Sızıntısı ve Dinleyici İyileştirmeleri
- **Performans İyileştirmeleri:**
  - Uzun süren video sekmelerinde hafıza sızıntılarını önlemek için `cleanupFirebase()` içindeki dinleyici temizlik işlemleri güncellendi.
  - `hostId` ve `hostOnly` için eksik abonelik iptalleri eklendi.
  - `messages` ve `reactions` için `.off()` çağrıları, kayıt esnasındaki sorgu nesneleriyle (örn. `limitToLast(50)`) birebir aynı olacak şekilde güncellendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
