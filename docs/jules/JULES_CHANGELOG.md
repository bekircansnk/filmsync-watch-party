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

## [05.09.2026] - Firebase Memory Leak Optimizasyonu
- **Hata Düzeltmeleri:**
  - `extension/content.js` içindeki `cleanupFirebase()` fonksiyonunda eksik olan `hostId` ve `hostOnly` listener iptalleri eklendi.
  - `limitToLast(50)` ve `limitToLast(5)` gibi türetilmiş query'lere takılı Firebase `.on()` listener'ları için, sadece parent referansa değil doğrudan ilgili query objesine `.off()` çağrısı yapılarak bellek sızıntıları (memory leaks) engellendi.
