# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [Güncel] - Sentinel Güvenlik Taraması
- **Güvenlik İncelemesi (Firebase Yapılandırması):**
  - Eklenti konfigürasyon dosyaları (`manifest.json`, `content.js`, `popup.js`, `background.js`) gizli anahtarlar, veritabanı yazma kuralları ve güvensiz kimlik bilgisi sızıntılarına karşı analiz edildi.
  - Kod içinde sabit (hardcoded) olarak bulunan Firebase API anahtarlarının eklentinin istemci tarafında (build süreci ve `.env` yükleyici olmadan) çalışması için bilinçli ve zorunlu olduğu doğrulandı.
  - Sistemde idari (admin) kimlik bilgilerinin (`serviceAccount`, `credential` veya database secret) sızdırılmadığı doğrulandı. Sadece standart Firebase RTDB işlemleri yapılıyor.
  - Tespit edilen güvenlik analizleri ve öğrenimler `.jules/sentinel.md` dosyasına Sentinel günlüğü olarak eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
