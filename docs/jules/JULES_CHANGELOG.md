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

## [29.08.2026] - Firebase Event Listener Cleanup Optimizasyonu
- **Performans ve Bellek İyileştirmeleri:**
  - `cleanupFirebase()` içerisinde Firebase realtime database listener (dinleyici) temizliği düzeltildi.
  - `hostId` ve `hostOnly` referansları için eksik `.off()` çağrıları eklendi.
  - Türetilmiş sorgular (`limitToLast`) üzerinden başlatılan dinleyiciler için bellek sızıntısını (memory leak) önlemek amacıyla, `.off()` çağrıları doğrudan türetilmiş sorgu objeleriyle eşleştirilecek şekilde (`.limitToLast(50).off()` ve `.limitToLast(5).off()`) güncellendi.
