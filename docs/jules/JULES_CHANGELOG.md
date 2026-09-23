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

## [23.09.2026] - Performans ve Hafıza Yönetimi
- **Performans ve Hafıza Yönetimi:**
  - `extension/content.js` içerisindeki Firebase `.on()` dinleyicileri için `.off()` çağrıları düzeltildi.
  - V8 SDK gereksinimi olarak `limitToLast` ile yapılan sorgular için `.off()` fonksiyonuna ilgili sorgu parametreleri eklendi, böylece uzun süreli video sekmelerinde hafıza sızıntısı (memory leak) engellendi.
  - `hostId` ve `hostOnly` için eksik dinleyici iptalleri eklendi.
  - Hatalı regex kullanımı düzeltildi.
