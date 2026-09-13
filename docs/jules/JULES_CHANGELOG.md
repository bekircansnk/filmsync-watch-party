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

## [19.07.2026] - Drift Correction & Clock Skew Enhancements
- **Özellik İyileştirmeleri:**
  - `extension/content.js` içerisindeki `startDriftCorrection` fonksiyonuna Firebase `/.info/serverTimeOffset` desteği eklendi, böylece istemci ve sunucu arasındaki saat sapmaları (clock skew) giderildi.
  - Oynatma durumu uyumsuzlukları ve ağ gecikmelerine (latency) bağlı olarak dinamik eşik (dynamic threshold) hesaplaması entegre edildi.
  - Eşik değeri, eşitsizlik durumunda `-1`, uyumsuzluk yoksa `Math.max(1.5, latency * 2)` olarak belirlenip eşitleme iyileştirildi.
- **Hata Düzeltmeleri:**
  - `extension/content.js` içerisinde geçersiz regex (Invalid regular expression flags) hatasına neden olan `/\\/$/` kullanımı `/\/$/` olarak düzeltildi.
