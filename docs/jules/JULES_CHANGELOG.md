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

## [2026-07-19] - Firebase Güvenlik Düzeltmesi (Sentinel)
- **Güvenlik İyileştirmesi:**
  - İstemci tarafında (client-side) bulunan yetkisiz oda silme (`DELETE`) işlemleri kaldırıldı. Firebase kurallarının istemci üzerinden açıkça veri silinmesine izin veren güvenlik açığı giderilerek yetkisiz `DELETE` istekleri engellendi. Uygulama tasarımı, veritabanı temizleme işlemlerini güvenli bir şekilde ele alacak yapıya hazırlandı.
