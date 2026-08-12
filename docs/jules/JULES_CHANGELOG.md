# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [12.08.2026] - Performans ve Bellek Sızıntısı İyileştirmeleri
- **Hata Düzeltmeleri:**
  - `cleanupFirebase` fonksiyonu içerisindeki `.off()` çağrıları düzeltilerek, `messages` ve `reactions` dinleyicileri `.limitToLast()` sorgusuyla eşleşecek şekilde güncellendi ve bellek sızıntıları önlendi.
  - `hostId` ve `hostOnly` Firebase dinleyicileri de temizleme işlevine eklendi.
  - Video takibi ve UI koruyucularında kullanılan `setInterval` çağrıları, `clearInterval` ile temizlenebilecek şekilde global değişkenlere atandı.
  - Sayfa kapanışı ve gizlenmesi sırasında (`beforeunload`, `pagehide`) çalışan `handlePageTeardown` fonksiyonu eklendi; bu sayede tüm intervaller ve olay dinleyicileri düzgün şekilde temizlendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
