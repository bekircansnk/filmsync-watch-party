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

## 2026-08-03 - FilmSync XSS Zafiyetleri Düzeltildi
**Bulgular:** `extension/content.js` ve `extension/popup.js` dosyalarında, kullanıcıdan alınan verilerin (örn. oda isimleri, platform adları vb.) doğrudan `innerHTML` aracılığıyla DOM'a yerleştirildiği tespit edildi. Bu durum, potansiyel olarak Siteler Arası Betik Çalıştırma (XSS) saldırılarına zemin hazırlıyordu.
**Düzeltmeler:**
- `extension/content.js` dosyasındaki `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında, HTML şablonları statik hale getirildi ve dinamik `roomName` değişkenleri `querySelector` ve `textContent` kullanılarak güvenli bir şekilde eklendi.
- `extension/popup.js` dosyasında genel oda listesi kartları (`card.innerHTML`) oluşturulurken dinamik veriler doğrudan şablon içinden çıkarıldı. Yerine statik bir HTML iskeleti kullanıldı ve `roomId`, `platformName`, `displayUsersText` değişkenleri ile silme/katıl butonlarına ait mantıklar DOM API'leri (`textContent` ve `dataset`) aracılığıyla güvenli bir biçimde bağlandı.
