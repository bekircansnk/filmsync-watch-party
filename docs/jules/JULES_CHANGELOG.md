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

## [01.09.2026] - Firebase Listener Temizleme Optimizasyonu
- **Hata Düzeltmeleri:**
  - `cleanupFirebase()` içerisinde Firebase dinleyicilerinin (.on()) kapatılması (.off()) işlemi iyileştirildi.
  - `hostId` ve `hostOnly` dinleyicileri için eksik olan iptal çağrıları eklendi.
  - `messages` ve `reactions` için `.off()` çağrılarının ilgili `.limitToLast()` sorgularını hedeflemesi sağlanarak hafıza sızıntısı (memory leak) ve mükerrer tetiklenme sorunları giderildi.
