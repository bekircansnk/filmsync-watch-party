# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [17.08.2026] - Bellek Sızıntısı ve Event Listener İyileştirmeleri
- **Hata Düzeltmeleri:**
  - `cleanupFirebase()` fonksiyonunda eksik olan Firebase event listener iptalleri eklendi (`hostId` ve `hostOnly`).
  - Sorgu tabanlı listener'ların iptalinde spesifik sorgular hedeflendi (`limitToLast` eklendi).
  - Sekme kapanması (`beforeunload` ve `pagehide`) sırasında uzun süreli arkaplan döngülerini (intervals) sonlandırmak üzere `teardownIntervals()` fonksiyonu geliştirildi.
  - Sınırsız arkaplan döngüleri, olası bellek sızıntılarını önlemek amacıyla atanmadan önce `clearInterval` ile sıfırlanacak şekilde optimize edildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
