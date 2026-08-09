# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [09.08.2026] - Güvenlik İyileştirmeleri: Path Traversal Koruması
- **Güvenlik (Security):**
  - Firebase REST API uç noktalarına (`fetch` çağrıları) gönderilen dinamik yol parametreleri (`roomId`, `userId`) için Path Traversal (Yol Geçişi) zafiyetini önlemek amacıyla Regex (`/^[a-zA-Z0-9_-]+$/`) doğrulama kontrolleri `background.js` ve `popup.js` dosyalarına eklendi. Geçersiz formatlar tespit edildiğinde işlemler güvenli bir şekilde engellendi veya hata mesajı döndürüldü.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
