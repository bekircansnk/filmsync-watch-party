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

## [26.09.2026] - Log Temizliği ve Uzantı Kararlılığı
- **İyileştirmeler:**
  - `extension/content.js` ve `extension/popup.js` dosyalarındaki `console.log` çıktıları özel bir `Logger` objesi oluşturularak yapılandırıldı.
  - `extension/inject.js` içerisindeki mesaj dinleyici API kancaları uzantının çökmesini önlemek amacıyla `try-catch` blokları içerisine alındı.
- **Hata Düzeltmeleri:**
  - `extension/content.js` dosyasında regex ayrıştırma hatasına neden olan geçersiz regex bayrağı düzeltildi.
