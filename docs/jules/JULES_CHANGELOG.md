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

## [28.09.2026] - Sentinel: Güvenlik Denetimi (Firebase Credentials)
- **Güvenlik İyileştirmeleri:**
  - Eklenti yapılandırma dosyalarında (`manifest.json`, `content.js`, `popup.js`, `background.js`) detaylı bir güvenlik denetimi gerçekleştirildi.
  - İstemci tarafında yer alan Firebase `apiKey` değerlerinin yönetici şifresi (administrative credential) olmadığı, projenin genel tanımlayıcıları (public identifiers) olduğu doğrulandı. Bu nedenle kod içerisinden gizlenmelerine veya silinmelerine gerek olmadığı tespit edildi.
  - Yerel veritabanı yazma kuralları dosyası (`database.rules.json`) bulunmadığı ve güvenlik kurallarının doğrudan Firebase Konsolu üzerinden yönetildiği görüldü. Uygulama içerisinde sızdırılmış kritik bir sunucu şifresi veya yetkisiz erişim riski tespit edilmedi.
