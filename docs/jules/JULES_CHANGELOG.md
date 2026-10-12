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

## [12.10.2026] - Dinamik Senkronizasyon Eşiği
- **Hata Giderimleri ve İyileştirmeler:**
  - `extension/content.js` içindeki `startDriftCorrection` fonksiyonunda yer alan sabit 2.5 saniyelik senkronizasyon sapma eşiği (drift threshold) dinamik hale getirildi.
  - Ağ gecikmesi ve oynatma durumu uyuşmazlıklarına dayalı olarak zamanla artan, ancak maksimum (2.5s) ile sınırlanan dinamik bir eşik değeri (dynamicThreshold) eklendi (`Math.min(2.5, 1.0 + timeSinceUpdate * 0.05)`).
