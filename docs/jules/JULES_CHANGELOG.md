# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [04.08.2026] - Güvenlik İyileştirmeleri (Path Traversal Düzeltmesi ve Yapılandırma İncelemesi)
- **Güvenlik İyileştirmesi:**
  - `background.js` ve `popup.js` içerisindeki tüm Firebase REST API `fetch` çağrılarına, güvenilmeyen kaynaklardan gelen dinamik parametreleri (`roomId`, `userId`, `hostId` vb.) doğrulayan (`/^[a-zA-Z0-9_-]+$/`) bir regex (düzenli ifade) eklendi. Bu sayede olası Path Traversal (yol geçişi) saldırıları ve yetkisiz veri tabanı yazma işlemleri engellendi.
- **Yapılandırma İncelemesi:**
  - Uzantının yapılandırma dosyalarındaki (`content.js`, `popup.js`) Firebase API anahtarları ve yapılandırmaları incelendi. İnceleme sonucunda, bu anahtarların yönetici (administrative) kimlik bilgileri içermediği, yalnızca Chrome eklentisinin işlevselliği için gerekli olan standart, güvenli istemci (client SDK) anahtarları olduğu doğrulandı.
  - Hassas bir kimlik bilgisi sızıntısına rastlanmadı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
