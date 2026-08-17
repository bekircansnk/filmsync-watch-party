# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [17.08.2026] - Sentinel: Path Traversal ve Güvenlik İyileştirmeleri
- **Güvenlik İyileştirmeleri:**
  - `extension/background.js` ve `extension/popup.js` içerisindeki Firebase REST API çağrılarında (fetch istekleri) path traversal (dizin aşımı) zafiyetlerini engellemek için `roomId` ve `userId` gibi dinamik URL parametrelerine regex maskesi (`/^[a-zA-Z0-9_-]+$/`) ile sıkı doğrulama (strict validation) eklendi.
  - Manifest ve Firebase config ayarları analiz edildi. Güvenlik açığı oluşturmayan Firebase yapılandırması korundu ancak yetkisiz yazma işlemlerine karşı güvenilir doğrulama eklendi.


## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
