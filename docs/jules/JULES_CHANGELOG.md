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

## [07.09.2026] - Güvenlik Analizi
- **Firebase Güvenlik İncelemesi:**
  - Eklenti yapılandırma dosyaları (manifest.json, vb.) incelendi. İstemci tarafındaki Firebase API anahtarının herkese açık (public) olduğu ve yönetici (admin) kimlik bilgisi içermediği doğrulandı.
  - İstemci üzerinden yapılan doğrudan veritabanı yazma/güncelleme işlemleri nedeniyle sunucu tarafı kurallarının açık olduğu tespit edildi, ancak istemci kodunda bu durumu düzeltecek bir işlem yapılamaz.
