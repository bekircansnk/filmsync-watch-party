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
## [19.07.2026] - Firebase Listener Bellek Sızıntısı Düzeltmeleri
- **Hata Düzeltmeleri:**
  - `cleanupFirebase` fonksiyonu güncellendi. Firebase Realtime Database abonelik iptalleri eksiksiz hale getirildi.
  - Eksik olan `hostId` ve `hostOnly` dinleyicileri için `.off()` çağrıları eklendi.
  - Sorgu ile başlatılan dinleyiciler (`limitToLast(50)` ve `limitToLast(5)`) için abonelik iptallerinin tam eşleşmesi sağlandı, bu sayede uzun süreli video sekmelerinde oluşabilecek bellek sızıntılarının (memory leak) önüne geçildi.
