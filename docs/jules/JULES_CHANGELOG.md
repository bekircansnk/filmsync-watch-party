# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [21.08.2026] - Sentinel: Path Traversal Zafiyeti Düzeltmesi
- **Güvenlik (Sentinel):**
  - `extension/background.js` dosyasındaki `chrome.runtime.onMessage` dinleyicisine gelen mesaj yüklerindeki `roomId`, `userId` ve `hostId` parametreleri için regex (`/^[a-zA-Z0-9_-]+$/`) doğrulaması eklendi.
  - Bu sayede, kötü amaçlı olarak gönderilebilecek payload'ların dinamik Firebase REST API yollarına manipüle ederek (Path Traversal) yetkisiz veri okuma/yazma girişimleri engellendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
