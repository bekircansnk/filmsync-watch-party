# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [11.08.2026] - FilmSync Hafıza Sızıntısı ve Performans İyileştirmeleri
- **Performans ve Hafıza İyileştirmeleri:**
  - `extension/content.js` dosyasında uzun süre açık kalan video sekmelerinde hafıza sızıntısını (memory leak) önlemek için arka planda çalışan `setInterval` döngüleri (`videoTrackingInterval`, `driftCorrectionInterval`, `uiKeeperInterval`, `iframeKeeperInterval`) değişkenlere atandı.
  - İlgili zamanlayıcılar (intervals) yeniden başlatılmadan önce `clearInterval` ile sıfırlanması sağlandı.
  - Sayfa yenilenmesi (beforeunload) veya sekme gizlenmesi (pagehide) gibi durumlarda tüm aktif zamanlayıcıların temizlenmesini sağlayan `clearAllIntervals` fonksiyonu `teardownExtension` içine eklendi.
- **Firebase Listener Temizliği:**
  - `cleanupFirebase` fonksiyonu, odadan çıkışlarda ve sayfa geçişlerinde Firebase üzerinden dinlenen (`.on()` ile bağlanan) tüm olayların eksiksiz bir şekilde sonlandırılması için güncellendi.
  - `.limitToLast()` gibi sorgularla oluşturulan dinleyiciler `.off()` metodunun tam eşleşen sorgu referansı üzerinden (örneğin `.limitToLast(50).off()`) çağrılarak hafızada asılı kalan (zombie) dinleyiciler temizlendi.
  - Eksik olan `hostId` ve `hostOnly` dinleyicileri de temizleme rutinine eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
