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

## [20.07.2026] - Bellek Sızıntısı ve Kapanış Optimizasyonları (Jules Otonom)
- **Hata Düzeltmeleri ve Performans Optimizasyonları:**
  - `extension/content.js` içindeki Firebase bağlantı temizleme işlemi (`cleanupFirebase`) düzeltildi; `hostId` ve `hostOnly` dinleyicileri eklendi, `limitToLast()` sorguları için base reference yerine direkt sorgu örnekleri üzerinden `.off()` çağrıları yapıldı.
  - Video takibi, gecikme düzeltmesi, arayüz koruyucu ve iframe tam ekran kontrolleri (`setInterval`) için global değişkenler tanımlandı ve yeniden atanmadan önce `clearInterval` ile temizlenmesi sağlandı.
  - Sayfa kapanış işlemleri (teardown), yeni bir `handleTeardown` fonksiyonuna taşınarak arka plan süreçleri temizlendi ve bu fonksiyon bellek kurallarına uygun olarak hem `beforeunload` hem de `pagehide` olaylarına bağlandı.
