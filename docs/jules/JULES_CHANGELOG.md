# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [06.08.2026] - Performans ve Bellek Sızıntısı İyileştirmeleri
- **İyileştirmeler:**
  - `content.js` içerisindeki aralık (interval) döngüleri global değişkenlere atandı (`videoTrackingInterval`, `driftCorrectionInterval`, vb.).
  - Aralıklar başlatılmadan önce eski aralıkların `clearInterval` ile temizlenmesi sağlandı.
  - Sekme kapanması veya sayfa değişimi durumlarında (`beforeunload` ve `pagehide`) tüm çalışan aralıkları temizleyen `teardownIntervals` fonksiyonu eklendi, bellek sızıntıları engellendi.
  - `cleanupFirebase` fonksiyonundaki dinleyici temizleme işlemleri düzeltildi; `hostId` ve `hostOnly` dinleyicileri kapatıldı, `messages` ve `reactions` dinleyicileri `.limitToLast().off()` kullanılarak doğru şekilde temizlendi.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
