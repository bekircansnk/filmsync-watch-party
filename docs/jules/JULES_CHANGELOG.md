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
## [01.09.2026] - XSS ve Veritabanı Güvenliği Raporu (Sentinel)
- **Güvenlik İyileştirmeleri:**
  - Firebase Realtime Database'in herkese açık yazma yetkisi (REST API üzerinden) olduğu tespit edildi ve belgelendi (`.jules/sentinel.md`). Sunucu tarafı yapılandırma gerektirir.
  - `extension/popup.js` dosyasında yer alan `loadPublicRooms` içerisindeki DOM render işleminde, iç içe template string yerine `.setAttribute()` kullanılarak XSS güvenlik açığı giderildi.
  - Ayrıca, 'Boş Odayı Sil' (DELETE api çağrısı) istemci bazlı zafiyetini (herkese açık silme işlemi) engellemek adına popup.js'ten kaldırıldı.
