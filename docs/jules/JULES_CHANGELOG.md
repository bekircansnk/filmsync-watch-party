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

## [16.09.2026] - Firebase Bellek Sızıntısı (Memory Leak) Optimizasyonu
- **Performans ve Hata Giderimleri:**
  - Uzun süreli video seanslarında, sekme değişimlerinde veya yeni odalara geçişlerde oluşan bellek sızıntıları giderildi.
  - `cleanupFirebase()` fonksiyonunda abonelikten çıkılmayan (unsubscribed) olay dinleyicileri (`hostId`, `hostOnly`) için `.off()` çağrıları eklendi.
  - `messages` ve `reactions` gibi sorgu limitli dinleyiciler (`.limitToLast()`), Firebase V8 SDK gereksinimlerine uygun şekilde doğru sorgu parametreleriyle abonelikten çıkarıldı.
