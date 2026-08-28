# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [28.08.2026] - Güvenlik Denetimi
- **Güvenlik İyileştirmeleri:**
  - Uzantı yapılandırma dosyaları (manifest.json, content.js, popup.js, background.js) incelendi.
  - Sabit kodlanmış yönetici kimlik bilgileri, veritabanı yazma kuralı sızıntıları veya güvensiz kimlik bilgisi ifşası bulunmadı.
  - Firebase Client SDK API anahtarlarının genel kullanıma açık olması gerektiği ve korunmasının Firebase Güvenlik Kurallarına dayandığı doğrulandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
