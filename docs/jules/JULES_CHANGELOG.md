# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

## [10.08.2026] - Güvenlik ve Kimlik Bilgisi Denetimi (PROMPT-SEC-001)
- **Güvenlik İyileştirmeleri:**
  - `extension/manifest.json`, `extension/content.js`, `extension/popup.js` ve `extension/background.js` yapılandırma dosyaları incelendi.
  - Sadece istemci tarafında kullanılan standart Firebase API anahtarlarının mevcut olduğu doğrulandı.
  - Veritabanı yazma izinleri ve REST API çağrıları kontrol edilerek hiçbir `databaseSecret` veya yönetici seviyesinde token/kimlik bilgisinin ifşa edilmediğinden emin olundu.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
