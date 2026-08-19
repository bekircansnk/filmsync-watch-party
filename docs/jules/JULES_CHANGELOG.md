# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.08.2026] - Firebase Performans İyileştirmesi ve Memory Leak Çözümü
- **Performans İyileştirmeleri:**
  - `extension/content.js` dosyasında `cleanupFirebase` fonksiyonu güncellendi.
  - Odayı değiştirirken veya sekmeler arasında gezinirken uzun süreli video izlemelerinde meydana gelebilen bellek sızıntılarını (memory leaks) engellemek adına `.on()` ile başlatılan dinleyiciler (`hostId`, `hostOnly`, limitlenmiş `messages` ve `reactions` sorguları) için tam ve eksiksiz olarak `.off()` çağrıları eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
