# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [30.07.2026] - Bellek Sızıntısı ve Firebase Dinleyici Düzeltmeleri
- **Hata Düzeltmeleri:**
  - `setInterval` fonksiyonlarından kaynaklanan bellek sızıntılarını (memory leaks) önlemek amacıyla aralık (interval) referansları global değişkenlere atandı ve sekme değişikliği/kapanması durumunda `clearInterval` ile düzgün bir şekilde temizlenmesi sağlandı.
  - `cleanupFirebase` içerisindeki Firebase `off()` çağrıları, temel referans yerine doğru sorgu örneklerine (`limitToLast` vb.) hedeflenerek düzeltildi, böylece hayalet (orphan) dinleyiciler engellendi.
  - `hostId` ve `hostOnly` dinleyicileri için eksik olan `off()` temizleme çağrıları eklendi.
  - `content.js` içerisindeki RegExp literal hatası düzeltildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
