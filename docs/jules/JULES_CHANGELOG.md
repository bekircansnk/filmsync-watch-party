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

## [17.09.2026] - Otomatik Eşitleme ve Hata Düzeltmeleri
- **Otomatik Eşitleme (Drift Correction):**
  - Ağ gecikmesini (`serverTimeOffset`) hesaba katarak senkronizasyon hassasiyeti artırıldı.
  - Sabit 2.5 saniyelik sapma eşiği yerine ağ gecikmesine bağlı dinamik bir eşik değeri (dynamicThreshold) hesaplanarak entegre edildi.
  - Hem sunucu gecikmesi hem de oda durumu bilgisi `Promise.all` ile eşzamanlı çekilerek hız kazanıldı.
- **Hata Düzeltmeleri:**
  - `content.js` içerisinde bulunan ve SyntaxError fırlatan geçersiz regex ifadeleri düzeltildi.
