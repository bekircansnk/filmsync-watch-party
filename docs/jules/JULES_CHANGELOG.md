# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [24.08.2026] - Firebase Listener Bellek Sızıntısı Düzeltmeleri
- **Performans Optimizasyonu:**
  - `extension/content.js` dosyasında `cleanupFirebase()` fonksiyonu güncellendi.
  - Odanın değişmesi veya iframe/sekme yenilenmesi durumlarında `hostId` ve `hostOnly` dinleyicileri için eksik `.off()` çağrıları eklendi.
  - `messages` ve `reactions` dinleyicilerini kaldırırken, dinleyici kaydı sırasında kullanılan sorgu parametreleri (`limitToLast(50)` ve `limitToLast(5)`) kullanılarak `.off()` çağrılarının düzgün çalışması sağlandı, böylece uzun süreli açık kalan sekmelerde oluşabilecek bellek sızıntılarının (memory leak) önüne geçildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
