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

## [24.07.2026] - Güvenlik İyileştirmesi (XSS Koruması)
- **Güvenlik İyileştirmesi:** Kullanıcı adları ve oda adları (roomName) HTML yapısı içerisine dinamik olarak eklenirken meydana gelebilecek Cross-Site Scripting (XSS) güvenlik açığı düzeltildi. `showAutoJoinOverlay` ve `showNamePromptModal` pencerelerinde dinamik içeriklerin yerleştirilmesi için doğrudan `innerHTML` kullanımı yerine, daha güvenli olan `textContent` özelliği kullanıldı. Bu değişiklik sayesinde kötü niyetli javascript kodlarının oda adları aracılığıyla tarayıcıda çalıştırılması engellendi.
- **Güvenlik Analizi (Firebase Kimlik Bilgileri):** İstenildiği üzere yapılandırma dosyaları (`manifest.json`, `content.js`, `popup.js`, `background.js`) hardcoded (sabit kodlanmış) sırlar ve yönetici yetkileri sızıntısına karşı analiz edildi. Proje düz bir JavaScript Chrome eklentisi olduğundan ve herhangi bir build adımı ya da `.env` ortam değişkeni yükleyicisi bulunmadığından, Firebase Web SDK konfigürasyon (API Key vb.) bilgilerinin istemci scriptlerinde (content.js, popup.js) sabit kodlanmış olarak kalması zorunlu görülmüştür (Zaten bu salt okunur yapılandırmadır ve veri erişimi veritabanı kuralları (Firebase Console) aracılığıyla korunmalıdır). Yönetici (`admin`) yetkisine sahip kimlik bilgilerine veya zararlı sızıntılara rastlanmamıştır.
