# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Güvenlik İyileştirmeleri (Sentinel):**
  - Firebase REST API uç noktaları için `extension/background.js` içinde `roomId` parametresine Path Traversal'a (dizin geçişi) karşı regex tabanlı girdi doğrulama eklendi.
  - İstemci tarafı Firebase API anahtarlarının incelenmesi tamamlandı. Kötü amaçlı bir yönetici yetkisinin ifşa edilmediği ve bu uygulamanın standart bir istemci uygulaması kısıtlamalarına uygun olduğu doğrulandı.

- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
