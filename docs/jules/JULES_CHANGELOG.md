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

## [01.08.2026] - Bellek Sızıntısı İyileştirmeleri (Uzun Süreli Oturumlar)
- **Performans Optimizasyonu:**
  - `extension/content.js` içerisinde kullanılan tüm `setInterval` çağrıları (video takibi, otomatik eşitleme vb.) yeniden atanmadan önce `clearInterval` ile temizlenecek şekilde düzenlendi. Bu sayede uzun süreli video oynatımlarında bellek sızıntıları ve performans düşüşleri engellendi.
  - Sayfa kapandığında (`beforeunload` ve `pagehide` olayları) açık olan tüm interval'ları temizleyen `handlePageUnload` mekanizması eklendi.
  - `cleanupFirebase` fonksiyonu içerisindeki `.off()` çağrıları güncellendi:
    - Eksik olan `hostId` ve `hostOnly` listener'larının kapatılması sağlandı.
    - `messages` ve `reactions` listener'ları için Firebase SDK'nın gerektirdiği biçimde tam query (`.limitToLast()`) bazlı `.off()` çağrıları kullanıldı.
- **Hata Düzeltmeleri:**
  - `applyRemoteState` içerisinde hatalı tanımlanan Regular Expression (RegEx) kaçış (escape) karakteri hatası düzeltildi.
