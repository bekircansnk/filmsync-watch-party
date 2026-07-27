# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [27.07.2026] - Performans ve Bellek Sızıntısı İyileştirmeleri
- **Firebase Dinleyici Temizliği:** `extension/content.js` dosyasında `cleanupFirebase()` fonksiyonu güncellendi. `hostId` ve `hostOnly` dinleyicileri `.off()` çağrılarına eklendi, mesajlar (`.limitToLast(50)`) ve reaksiyonlar (`.limitToLast(5)`) için `.off()` temizlik limitleri düzeltildi.
- **Interval Sızıntısı Çözümü:** `extension/content.js` dosyasında interval'lar global değişkenlere (videoTrackingInterval, vb.) atandı ve `setInterval` atamalarından önce `clearInterval` kullanıldı. Temizleme (cleanup) aşamasına bu interval'ların temizlenmesi eklendi.
- **Daha Güvenilir Teardown:** Sayfa yenilenmesi (veya arka plana atılması) esnasında durumun güvenli bir şekilde sunucuya/Service Worker'a bildirilmesi için `beforeunload` işlemine ek olarak `pagehide` eventi dinlenmeye başlandı.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
