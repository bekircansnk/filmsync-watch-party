# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [01.08.2026] - Güvenlik İyileştirmeleri (Sentinel)
- **Güvenlik Düzeltmeleri:**
  - `extension/background.js` dosyasındaki Firebase REST API isteklerinde kullanılan dinamik değişkenler (`roomId`, `userId`, `hostId`) için sıkı regex doğrulaması (`/^[a-zA-Z0-9_-]+$/`) eklendi.
  - Bu sayede Chrome mesajlaşma altyapısından gelebilecek güvenilmeyen girdiler nedeniyle oluşabilecek "Path Traversal" (Dizin Atlatma) zafiyetleri önlendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
