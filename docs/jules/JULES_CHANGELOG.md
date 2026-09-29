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

## 2026-09-29 - Otomatik Eşitleme ve Sapma Kontrolü İyileştirmesi
- **Hata Düzeltmeleri & İyileştirmeler:**
  - `extension/content.js` dosyasında `serverTimeOffset` değeri `.info/serverTimeOffset` üzerinden takip edilmeye başlandı.
  - `startDriftCorrection` fonksiyonundaki sapma eşiği (threshold) sabit 2.5 saniyeden, ağ gecikmesi ve durum uyumsuzluklarına göre esnek bir şekilde uyarlanabilen dinamik bir yapıya kavuşturuldu.
  - Video url karşılaştırmalarında hata fırlatan hatalı regex ( `replace(/\\/$/, '')` ) düzeltilip `replace(/\/$/, '')` haline getirildi.
