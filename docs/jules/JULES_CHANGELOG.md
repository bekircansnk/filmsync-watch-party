# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [26.07.2026] - Bellek Sızıntısı ve Kapanış İşlemleri İyileştirmeleri
- Uzun süreli video sekmelerindeki bellek sızıntılarını önlemek için interval atamaları takip edilecek şekilde güncellendi ve yeni atamalar öncesi eskileri `clearInterval()` ile temizlendi.
- `cleanupFirebase()` içindeki `messages` ve `reactions` dinleyici temizlikleri (`.off()` çağrıları), sorgu limitleri (`.limitToLast()`) ile tam eşleşecek şekilde düzenlendi, böylece hatalı serbest bırakmalar önlendi. Ayrıca `hostId` ve `hostOnly` dinleyicileri için `.off()` çağrıları eklendi.
- Sayfa kapatma (teardown) mantığı `handlePageTeardown` fonksiyonuna çıkarıldı ve sekmeler arası geçiş/iframe yenilenmelerinde daha güvenilir çalışması için `pagehide` ve `beforeunload` olaylarına bağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
