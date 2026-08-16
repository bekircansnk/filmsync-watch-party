# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [16.08.2026] - Bellek Sızıntılarını ve Firebase Teardown Hatalarını Giderme
- **Performans ve Kararlılık İyileştirmeleri:**
  - `cleanupFirebase` fonksiyonu içindeki eksik `.off()` abonelik iptalleri eklendi (`hostId`, `hostOnly`).
  - Dinamik kuyruklara (ör. `messages`, `reactions`) bağlı `.limitToLast()` sorguları için dinleyici sonlandırma işlemleri izole edildi ve bellek sızıntıları önlendi.
  - Uzun süren oturumlarda şişme yapmaması adına periyodik arkaplan işlemleri (ör. `setInterval`) tekrar atanmadan önce `clearInterval` kullanılarak temizlendi.
  - Sayfa kapanışı ve gizlenmesi sırasındaki veri aktarım güvenilirliğini artırmak için temizlik fonksiyonu (`handlePageTeardown`) hem `beforeunload` hem de `pagehide` olaylarına bağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
