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

## [22.09.2024] - Race Condition Fixes & ServerTimeOffset
- **Senkronizasyon ve Race Condition Çözümleri:**
  - `isApplyingState` ve `syncLockTimer` eklenerek `ensureVideoReady` asenkron beklemeleri sırasında kullanıcı manuel tetiklemeleri (play/pause/seek) kilitlendi.
  - Olası senkronizasyon döngülerini ve video kekelemelerini engellemek için tüm debounce ve kilit süreleri `clearTimeout` ile yönetildi.
  - Kilit süresi sonrasında `pendingState` sırası kontrol edilerek eksik senkronizasyonların yutulması engellendi.
  - İstemci ile Firebase sunucusu arasındaki zaman kaymasını dengelemek adına `.info/serverTimeOffset` kullanılarak oynatma süre sapması (`timeDiff`) daha keskin bir hale getirildi.
  - `applyRemoteState` içindeki geçersiz regex `replace(/\\/$/, '')` (SyntaxError: Invalid regular expression flags) hatası `replace(/\/$/, '')` olarak düzeltildi.
