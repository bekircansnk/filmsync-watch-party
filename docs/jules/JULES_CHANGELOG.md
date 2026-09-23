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
## [23.09.2026] - Senkronizasyon Kilit Mekanizması İyileştirildi
- **Hata Düzeltmeleri:**
  - Uzak sunucudan gelen eşitleme komutları işlenirken, asenkron video hazır olma durumunu (`ensureVideoReady`) bekleme sırasında kullanıcı hareketlerinin araya girmesi ve senkronizasyon döngülerine neden olması hatası (race condition) engellendi. `isSyncing` kilidi asenkron beklemeden önce aktifleştirilecek şekilde yeniden yapılandırıldı.
  - Video üzerinde oluşabilecek kekelemeleri önlemek için konan eşitleme gecikmelerinde `syncTimeout` değişkeni ile debounce mekanizması uygulandı.
