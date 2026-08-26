# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [26.08.2026] - 🛡️ Sentinel: [YÜKSEK] Firebase REST API Path Traversal Güvenlik Açığının Kapatılması
- **Güvenlik İyileştirmeleri:**
  - `background.js` ve `popup.js` içerisinde kullanıcıdan veya dışarıdan alınan `roomId` değerlerinin Firebase REST API `fetch` çağrılarında (ör. `PATCH`, `POST`, `DELETE`, `GET`) URL'ye eklenmeden önce `/^[a-zA-Z0-9_-]+$/` maskesi ile doğrulama (regex validation) adımından geçmesi zorunlu hale getirildi.
  - Kötü niyetli kullanıcıların oda ID'si üzerinden dinamik yolları manipüle ederek yetkisiz verilere erişmesini (Path Traversal) veya veri silmesini engelleyen güvenlik denetimleri eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
