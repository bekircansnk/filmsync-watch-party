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

## [03.10.2024] - Güvenlik Denetimi: Firebase Konfigürasyonu
- **Denetim Sonucu:** Uzantı dosyaları (`manifest.json`, `content.js`, `popup.js`, `background.js`) incelendi.
- **Firebase API Anahtarları:** Dosyalarda bulunan API anahtarları (örn. `AIzaSyBckyDBVxN6xFC5bBKkiyxNvww5seXRM1U`), Firebase projesi için halka açık istemci tanımlayıcılarıdır ve mimari tasarım gereği buradadır. Yönetimsel (administrative) bir yetki veya güvenlik açığı barındırmaz.
- **Veritabanı Kuralları:** Projede yerel güvenlik kuralı dosyası (`firebase.json` veya `database.rules.json`) bulunmamaktadır. Veritabanı okuma/yazma kuralları Firebase Console üzerinden harici olarak yönetilmektedir.
- **Gizli Bilgi Sızıntısı:** Herhangi bir hardcoded sistem şifresi, service account bilgisi veya hassas veri sızıntısı (credential leakage) tespit edilmedi.
