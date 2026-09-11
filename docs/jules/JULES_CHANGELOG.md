# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---


## [11.09.2026] - Otonom İyileştirme: Sapma Düzeltmesi (Drift Correction) ve Dinamik Eşik
- **Geliştirmeler:**
  - `extension/content.js` dosyasındaki `startDriftCorrection` fonksiyonunda istemci-sunucu saat sapmasını (clock skew) hesaba katmak için `/.info/serverTimeOffset` değeri kullanıldı.
  - Oynatma durumu uyuşmazlığına (play state mismatch) ve ağ gecikmesine (network latency) bağlı olarak dinamik sapma eşiği (dynamic threshold) eklendi; uyuşmazlık anında daha hızlı eşitleme (0.5s) ve gecikmeli durumlarda daha esnek bir sapma sınırı (2.0s - 4.0s) sağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
