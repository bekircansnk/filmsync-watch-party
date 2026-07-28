# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [28.07.2026] - Güvenlik İyileştirmeleri (Sentinel)
- **Güvenlik Düzeltmeleri:**
  - `background.js` içinde `page-unload` mesajlarındaki `roomId` parametresine regex doğrulama (`/^[a-zA-Z0-9_-]+$/`) eklendi. Bu sayede, Firebase Realtime Database REST API çağrılarında Path Traversal (Yol Geçişi) saldırılarına karşı yetkisiz veri yazma işlemleri önlendi.
  - Uygulama genelinde herhangi bir admin kimlik bilgisi (credential) veya gizli anahtar (secret) sızıntısı olmadığından emin olundu. Kullanılan `firebaseConfig` anahtarlarının yalnızca istemci tarafında kullanılan açık Web SDK anahtarları olduğu teyit edildi.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
