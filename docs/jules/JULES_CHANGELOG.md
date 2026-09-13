# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [13.09.2026] - isSyncing Kilit Mekanizması ve Regex Düzeltmeleri
- **Hata Düzeltmeleri:**
  - `isSyncing` durumu için paylaşımlı bir global `syncTimeout` değişkeni eklendi.
  - applyRemoteState, forceSync ve startDriftCorrection içindeki race condition ve mükerrer timeout durumları engellendi.
  - Geçersiz regex (`/\/$/`) dizimi (`/\/$/`) olarak düzeltilip syntax validasyon hatası giderildi.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
