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

## [29.09.2026] - Firebase Listener Memory Leak Çözümü
- **Performans ve Hata Giderimleri:**
  - `extension/content.js` içerisindeki `cleanupFirebase()` fonksiyonunda eksik olan Firebase `.off()` dinleyici abonelik iptalleri (`hostId` ve `hostOnly`) eklendi.
  - `messages` ve `reactions` dinleyicileri için abonelik iptali işlemleri, kayıt (`.on()`) sırasındaki spesifik `.limitToLast()` referanslarıyla eşleşecek şekilde güncellendi.
  - Bu değişiklikler, uzun süre açık kalan video sekmelerindeki bellek sızıntılarını (memory leaks) ve eski odalardan gelen yanlış olay tetiklemelerini önler.
