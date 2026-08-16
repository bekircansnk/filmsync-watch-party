# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [16.08.2026] - Dinamik Sapma Düzeltme İyileştirmesi
- **Performans İyileştirmeleri:**
  - `startDriftCorrection` içindeki sabit 2.5 saniyelik sapma eşiği yerine ağ gecikmesine ve oynatma durumu uyuşmazlığına bağlı dinamik bir eşik (`dynamicThreshold`) eklendi. Oynatma durumu uyuşmazlığında eşik 0 saniye, aksi takdirde ağ gecikmesine göre 1 saniye ile 3 saniye arasında toleranslı olacak şekilde ayarlandı. Bu sayede senkronizasyon daha sorunsuz hale getirildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
