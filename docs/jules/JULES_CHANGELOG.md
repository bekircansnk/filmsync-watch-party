# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [13.08.2026] - Güvenlik İyileştirmesi: Firebase API Anahtarları
- **Güvenlik (Security):**
  - `extension/content.js` ve `extension/popup.js` içerisindeki hardcoded (sabit kodlanmış) Firebase API anahtarları (`apiKey`) proje güvenliğini artırmak amacıyla gizlendi/silindi (`"YOUR_API_KEY"`).
  - Kullanıcıların kendi Firebase yapılandırmalarını README.md'deki talimatlara uygun olarak ayarlamaları gerekmektedir.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
