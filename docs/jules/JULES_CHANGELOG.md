# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [13.08.2026] - Performans İyileştirmesi ve Hafıza Sızıntısı Giderimi
- **Hata Düzeltmeleri ve Optimizasyonlar:**
  - `extension/content.js` dosyasında, uzun süreli kullanımlarda hafıza sızıntısına (memory leak) neden olan `setInterval` çağrıları (örn: videoTracking, driftCorrection, uiKeeper, iframeFullscreenKeeper) değişkenlere atandı ve yeni bir interval başlatılmadan önce eskisinin temizlenmesi (clearInterval) sağlandı.
  - `cleanupFirebase()` fonksiyonunda eksik olan `hostId` ve `hostOnly` dinleyicilerinin `.off()` çağrıları eklendi.
  - Sınırlı sorgularla (örn: `.limitToLast()`) kaydedilen Firebase dinleyicileri (messages ve reactions) için `.off()` çağrıları sorgunun kendisine bağlanarak (detach from the exact query instance) bellek sızıntıları önlendi.
  - Sayfa gizlendiğinde (pagehide event) veya kapandığında çalışacak `handleTeardown()` fonksiyonu eklenerek, tüm aktif interval ve Firebase dinleyicilerinin temizlenmesi garanti altına alındı.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
