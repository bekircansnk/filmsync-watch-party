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

## [09.10.2026] - Dinamik Sapma Düzeltme (Drift Correction) Geliştirmesi
- **Geliştirmeler:**
  - `extension/content.js` içindeki sapma düzeltme (drift correction) algoritması dinamik bir eşik değeri kullanacak şekilde güncellendi.
  - Oynatıcı süre hesaplamalarındaki ağ gecikmelerini daha hassas bir şekilde ölçmek için `.info/serverTimeOffset` kullanılarak `serverTimeOffset` hesaplandı.
  - Sabit 2.5 saniyelik eşik, güncellenme süresine göre maksimum 5.0 saniyeye kadar ölçeklenen dinamik bir eşik sistemi ile değiştirildi (`Math.min(5.0, 2.5 + (timeSinceUpdate * 0.1))`).
