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

## [10.09.2026] - Eşitleme ve Hata Düzeltmeleri
- **Senkronizasyon (Drift Correction):**
  - `startDriftCorrection` içerisindeki eşikleme mantığı ağ gecikmesi (`serverTimeOffset`) ve oynatma durumu farklılıklarına göre dinamik olarak ayarlandı.
  - İstemci-sunucu saat farklarını kompanze etmek için Firebase üzerinden `.info/serverTimeOffset` kullanılarak gerçek sunucu zamanı elde edildi.
  - Uzak medya durumlarının eşzamanlı uygulanmasından kaynaklanan yarış koşullarını ve eşitleme döngülerini önlemek için `isApplyingState` kilidi ve `syncLockTimer` eklendi.
  - Düzenli ifadelerdeki hata (invalid regular expression flags) giderilerek `replace(/\/\$/, '')` kullanımına geçildi.
