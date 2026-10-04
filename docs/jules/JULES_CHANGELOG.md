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

## [04.10.2026] - Firebase Event Listener Cleanup
- **Hata Düzeltmeleri:**
  - Uzun süren oturumlarda memory leak (bellek sızıntısı) oluşmasını engellemek amacıyla `cleanupFirebase()` fonksiyonundaki Firebase listener temizleme işlemleri düzeltildi.
  - `hostId`, `hostOnly` gibi eksik listener'ların temizlenmesi eklendi.
  - `.limitToLast()` kullanılarak dinlenen referansların tamamen aynı sorgu yapısıyla kapatılması sağlandı (`.limitToLast(50).off()`).
