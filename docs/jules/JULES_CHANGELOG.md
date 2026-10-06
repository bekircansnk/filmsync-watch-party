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

## [06.10.2026] - Güvenlik Denetimi
- **Güvenlik Analizi:**
  - `manifest.json`, `content.js`, `popup.js` ve `background.js` dosyaları Firebase API anahtarları, veritabanı yazma kuralları ve yönetici kimlik bilgilerinin sızdırılması ihtimaline karşı incelendi.
  - Kod tabanında bulunan Firebase Web API anahtarlarının (ör. `AIza...`) herkese açık istemci tanımlayıcıları olduğu doğrulandı ve herhangi bir yönetici kimlik bilgisi sızıntısı bulunmadı. Veritabanı güvenlik kurallarının proje dışında (Firebase Console) yönetildiği onaylandı.
