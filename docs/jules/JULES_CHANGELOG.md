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

## 2026-09-26 - Uzaktan Senkronizasyon ve Manuel Eylemler Arasındaki Yarış Durumlarının Çözümü
**Sorun:** Uzak kaynaklı durumlara yanıt verirken (`applyRemoteState`, `forceSync`, `startDriftCorrection`), `isSyncing` bayrağının `ensureVideoReady`'nin asenkron geri çağırması içinde başlatılması manuel kullanıcı eylemleriyle çakışmalara yol açarak yarış durumlarına ve senkronizasyon döngülerine neden oluyordu. Ayrıca, çoklu asenkron `setTimeout` çağrıları kilitlerin kontrolünü kaybetmesine neden olarak medyanın kekelemesine sebep oluyordu.
**Çözüm:**
1. Eşzamanlı işlemleri düzgün şekilde bloklamak için `isSyncing` kilit bayrağını `ensureVideoReady`'nin asenkron çağrısından *önce* başlatacak şekilde değiştirdik.
2. Yarış koşullarını engellemek amacıyla eşzamanlı senkronizasyonları yönetmek için paylaşılan global bir `syncTimeout` değişkeni eklendi.
3. Fazladan bir iyileştirme olarak, `extension/content.js` içerisindeki regex hatalarından kaynaklı bir `SyntaxError: Invalid regular expression flags` (kötü kurgulanmış `\/\/`) düzeltildi.
