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

## [22.09.2026] - Dinamik Sapma Düzeltme Optimizasyonu
- **Senkronizasyon İyileştirmeleri:**
  - `startDriftCorrection` içindeki sabit 2.5s'lik tolerans değeri, ağ gecikmesine bağlı dinamik bir değere dönüştürüldü.
  - Eşzamanlı `Promise.all` ile ağ gecikmesi ölçümü sağlandı.
  - Oynatma durumu farklılıkları için (play/pause) tepki süresi 0.5s'ye düşürüldü, böylece kullanıcı hissi iyileştirildi.
- **Hata Düzeltmeleri:**
  - `extension/content.js` dosyasındaki geçersiz regex bayrağı (Invalid regular expression flags) hatası giderildi (`replace(/\\/$/, '')` kullanımı düzeltildi).
