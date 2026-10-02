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

## [02.10.2026] - Dinamik Eşitleme ve Tolerans Ayarları (Jules)
- **Hata Düzeltmeleri & Geliştirmeler:**
  - `extension/content.js` içindeki `startDriftCorrection` fonksiyonunda yer alan sabit 2.5 saniyelik eşitleme eşiği dinamik bir tolerans mantığı ile değiştirildi.
  - Ağ gecikmelerini hesaba katmak amacıyla Firebase'in `.info/serverTimeOffset` dinleyicisi eklenerek `serverTimeOffset` değişkeni tanımlandı ve sunucu saati tahmin edildi (`estimatedServerTime`).
  - Eşitleme sapması hesaplamalarında kullanılan `timeDiff` değişkeni, anlamsal doğruluğu artırmak için `timeSinceUpdate` olarak yeniden adlandırıldı.
  - Oynatma durumu farklılıkları veya zaman sapmalarında eşitleme tetikleyici koşul, dinamik eşiğe bağlı hale getirildi. Maksimum 3.0 saniye ve asgari 1.5 saniye arasında değişen bu değer oynatıcı senkronizasyonunu kusursuzlaştırır.
