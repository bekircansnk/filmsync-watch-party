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

## [04.10.2026] - Güvenlik Denetimi ve Yapılandırma İncelemesi
- **Güvenlik ve Kimlik Bilgileri Kontrolü:**
  - Eklenti yapılandırma dosyaları (`manifest.json`, `content.js`, `popup.js`, `background.js`) hardcoded (sabit kodlanmış) sırlar, veritabanı yazma kuralları ve güvensiz kimlik bilgisi sızıntılarına karşı tarandı.
  - `content.js` ve `popup.js` içerisindeki Firebase Web API anahtarlarının (örneğin 'AIzaSy...' ile başlayan) Firebase SDK için herkese açık istemci tanımlayıcıları olduğu, hassas yönetici kimlik bilgileri olmadığı doğrulandı.
  - Koda gömülü herhangi bir yönetici kimlik bilgisine (service account vb.) veya hassas veritabanı yazma erişimi sızıntısına rastlanmadı.
