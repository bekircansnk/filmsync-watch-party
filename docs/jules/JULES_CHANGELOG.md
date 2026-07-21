# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [21.07.2026] - Dinamik Sapma Eşiği (Drift Threshold) Geliştirmesi
- **Geliştirmeler:**
  - `startDriftCorrection` fonksiyonundaki senkronizasyon mantığı güncellendi.
  - Oynatma süreleri arasındaki gecikmeleri düzeltmek için kullanılan sabit 2.5 saniyelik eşik, ağ gecikmesi (network latency) ve oynatma durumu uyuşmazlığına bağlı olarak dinamik olarak hesaplanacak şekilde değiştirildi. Ağ gecikmesi durumlarında eşik gevşetilirken, durum uyuşmazlıklarında (oynat/duraklat) daha hızlı tepki vermesi sağlandı.
  - Oynatma durumu uyuşmazlığı olduğunda, sapma dinamik eşikten küçükse sadece oynat/duraklat işlemleri yapılarak, gereksiz seek (ileriye/geriye sarma) kaynaklı görüntü atlamaları engellendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
