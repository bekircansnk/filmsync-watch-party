# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [25.08.2026] - Sentinel: Path Traversal Koruması (REST API)
- **Hata Düzeltmeleri (Güvenlik):**
  - `background.js` ve `popup.js` içerisindeki tüm Firebase REST API (`fetch`) isteklerine dinamik URL parametreleri (`roomId`, `userId`) eklenmeden önce Regex tabanlı maskeleme (`/^[a-zA-Z0-9_-]+$/`) uygulandı.
  - Kötü niyetli kullanıcıların (veya eklenti mesajlarının) zararlı yol argümanları (örn: `../../`) enjekte ederek Firebase Realtime Database'deki yetkisiz verilere erişme (Path Traversal) zafiyeti giderildi.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
