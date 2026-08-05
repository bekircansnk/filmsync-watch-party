# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [05.08.2026] - Drift Correction Dinamik Eşik Güncellemesi
- **İyileştirmeler:**
  - `extension/content.js` dosyasındaki `startDriftCorrection` fonksiyonunda kullanılan sabit 2.5 saniyelik eşik değeri yerine, ağ gecikmesine (`timeDiff`) dayalı dinamik bir eşik (`dynamicThreshold`) hesaplaması eklendi (1.5s - 3.0s arası). Bu sayede ağ gecikmelerine daha hassas bir senkronizasyon sağlandı.
  - Olası bir syntax hatası (geçersiz regular expression flag) düzeltildi.
  - Global namespace kirliliğini önlemek adına `Logger` objesi tanımlanarak konsol logları yapılandırıldı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
