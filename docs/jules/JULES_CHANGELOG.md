# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [17.09.2026] - Firebase Dinleyici Temizleme Optimizasyonu
- **Performans ve Hata Gidermeleri:**
  - Uzun süreli video sekmelerinde ve oda/sekme değişikliklerinde oluşan bellek sızıntılarını (memory leak) önlemek için Firebase Realtime Database dinleyici temizleme (cleanup) işlemleri güncellendi.
  - `limitToLast()` gibi sorgu parametreleriyle kaydedilen dinleyiciler için `.off()` çağrılarına ilgili sorgu parametreleri eklendi.
  - `hostId` ve `hostOnly` dinleyicileri için eksik olan `.off()` çağrıları eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
