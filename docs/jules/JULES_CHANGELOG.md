# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [16.09.2026] - Güvenlik İyileştirmeleri ve XSS Zafiyetlerinin Giderilmesi (Sentinel Görevi)
- **Güvenlik Analizi:**
  - Firebase `apiKey`, `projectId` ve diğer istemci yapılandırma değerleri analiz edildi. Bunların Firebase Web SDK için genel tanımlayıcılar olduğu ve idari (admin) erişim sağlamadığı, bu nedenle bir güvenlik açığı teşkil etmediği doğrulandı.
  - Kod tabanında Service Account JSON dosyaları veya yetkili (admin) token'ları gibi hassas kimlik bilgilerinin ifşa edilmediği tespit edildi.
  - Uygulama, Firebase Realtime Database'e doğrudan istemci üzerinden REST API ve Web SDK ile yazmaktadır. Sunucu taraflı (`database.rules.json`) kuralları bu repoda bulunmadığı için doğrudan değerlendirilemedi. Veritabanının istemci tarafı doğrudan yazma izinleriyle çalışması nedeniyle, olası zararlı veri enjeksiyonlarına karşı istemci tarafında savunma mekanizmaları güçlendirildi.
- **Güvenlik Yamaları (XSS Koruması):**
  - `extension/popup.js` içerisindeki herkese açık oda kartları (`public-room-card`) oluşturulurken kullanılan ve kullanıcı denetimli verilerin doğrudan DOM'a eklendiği güvensiz `innerHTML` kullanımı kaldırıldı. DOM elemanları güvenli `document.createElement` ve `textContent` yöntemleriyle oluşturularak XSS zafiyeti giderildi.
  - `extension/content.js` içerisindeki davet linkiyle katılım (`showAutoJoinOverlay`) ve isim sorma (`showNamePromptModal`) ekranlarındaki `innerHTML` kullanımları güvenli DOM API'leri ile değiştirildi. Böylece dış kaynaklardan alınan oda isimlerinin zararlı script (XSS) çalıştırması engellendi.



## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
