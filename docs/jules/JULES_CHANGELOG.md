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

## [19.09.2026] - Güvenlik Denetimi: Firebase API Anahtarları ve Yapılandırma Analizi
- **Güvenlik Analizi Bulguları:**
  - `manifest.json`, `content.js`, `popup.js` ve `background.js` dosyaları olası gizli anahtar (secret) sızıntıları, veritabanı yazma kuralları ve güvenilmeyen yetki maruziyetleri açısından analiz edildi.
  - İstemci tarafı eklenti dosyalarında sabit kodlanmış (hardcoded) olarak bulunan Firebase API anahtarlarının idari yetki (admin credential) sağlamadığı, yalnızca Firebase Web SDK için herkese açık (public) tanımlayıcılar olduğu doğrulandı. Bu yapılandırmalar bir güvenlik zafiyeti oluşturmadığı için korundu.
  - Herhangi bir yönetici kimlik bilgisinin veya hassas veritabanı yazma yetkisinin açığa çıkmadığı tespit edildi (`background.js` REST API çağrıları dâhil).
