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

## [18.05.2024] - Güvenlik Değerlendirmesi: Firebase Yapılandırması
- **Güvenlik İyileştirmeleri:**
  - Uzantı yapılandırma dosyaları (manifest.json, content.js, popup.js, background.js) sabit kodlanmış sırlar, veritabanı yazma kuralları ve güvensiz kimlik bilgisi sızıntısı açısından incelendi.
  - İstemci tarafı kodunda açığa çıkan Firebase API anahtarlarının genel tanımlayıcılar olduğu ve yönetimsel kimlik bilgileri olmadığı doğrulandı.
  - İstemci tarafı `DELETE` isteklerinin sunucusuz mimaride çöp toplama amacıyla tasarlandığı ve hassas veritabanı yazma erişimlerinin açığa çıkmadığı teyit edildi. Güvenlik sunucu tarafı Firebase kurallarına dayanmaktadır.
