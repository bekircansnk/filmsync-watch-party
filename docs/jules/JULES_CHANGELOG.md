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

## [2026-07-20] - Dinamik Eşitleme ve Senkronizasyon İyileştirmeleri
- **İyileştirmeler:**
  - Medya durumu senkronizasyonunda asenkron yarış koşullarını ve kilitlenmeleri önlemek için `isApplyingState` kilidi eklendi.
  - İstemci ve sunucu saat farkından kaynaklanan senkronizasyon hatalarını çözmek için `/.info/serverTimeOffset` (saat sapması) hesaplaması eklendi.
  - `startDriftCorrection` içerisinde dinamik tolerans (drift threshold) mekanizması oluşturuldu; ağ gecikmesi veya oynatma durumu uyumsuzluğuna göre tolerans 0.5 ile 4.0 saniye arasında ayarlanıyor.
  - Zamanlayıcı çakışmalarını önlemek için `syncLockTimer` eklendi; kilit açıldığında `pendingState` (bekleyen durumlar) güvenli şekilde işleniyor.
  - Hatalı regex deseni (`/\/$/`) düzeltilerek (`/\/$/`) yönlendirme kontrolündeki eşleşme hatası giderildi.
