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

## [11.09.2024] - Güvenlik Taraması
- **Firebase Güvenlik Denetimi:**
  - Firebase API anahtarının, public bir anahtar olduğu doğrulanmıştır.
  - Kod tabanında sızdırılmış yönetici kimlik bilgisi (admin credentials) veya gizli anahtar (secret key) bulunmamaktadır.
  - Kullanılan `DELETE`, `PUT`, `PATCH`, ve `POST` veritabanı işlemleri istemci tabanlı özellikleri ve çöp toplamayı (garbage collection) hedeflemekte olup, bu işlemlerin güvenliği sunucu tarafındaki Firebase Güvenlik Kuralları (Firebase Security Rules) ile sağlanmaktadır.
