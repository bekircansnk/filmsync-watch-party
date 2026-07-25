# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [25.07.2026] - Güvenlik İyileştirmeleri (Reflected XSS Koruması)
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` dosyasına `escapeHTML` yardımcı fonksiyonu eklendi.
  - Davet linki ile açılan modal arayüzlerinde (`overlay.innerHTML` ve `modal.innerHTML`) kullanılan dinamik `roomName` değişkeni, olası Reflected XSS (Siteler Arası Komut Dosyası Çalıştırma) saldırılarını engellemek adına `escapeHTML` fonksiyonu ile güvenli hale getirildi.
  - Firebase API anahtarının (`apiKey`) istemci tarafında herkese açık (public) bırakılmasının Firebase Client SDK yapısı gereği beklendiği doğrulandı, veritabanında `rules` (kurallar) ihlali yaratacak admin yetkili sızıntılar tespit edilmedi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
