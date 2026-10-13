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
- **Performans ve Senkronizasyon İyileştirmeleri:**
  - `extension/content.js` içindeki `startDriftCorrection` fonksiyonunda dinamik sapma eşiği (dynamic drift threshold) hesaplaması eklendi. Önceden sabit 2.5s olan eşik, artık ağ gecikmesine ve oynatma durumu uyuşmazlıklarına göre dinamik olarak (durum uyuşmazlığında 0.5s, ağ gecikmesine göre 1.0s ile 4.0s arasında) ayarlanarak sorunsuz senkronizasyon sağlandı.
