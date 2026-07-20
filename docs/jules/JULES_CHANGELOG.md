# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [20.07.2026] - Dinamik Senkronizasyon ve Loglama İyileştirmeleri
- **Hata Düzeltmeleri ve İyileştirmeler:**
  - `startDriftCorrection` içerisindeki sabit 2.5 saniyelik sapma eşiği, ağ gecikmesine (network latency) duyarlı hale getirilerek dinamik bir eşik değeri ile güncellendi.
  - Oynatma durumu uyumsuzlukları ve duraklatma durumlarında daha hassas senkronizasyon (0.5s) sağlandı.
  - Yapılandırılmış `Logger` nesnesi oluşturuldu ve `startDriftCorrection` içindeki loglamalar bu yapı üzerinden geçirilerek standartlaştırıldı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
