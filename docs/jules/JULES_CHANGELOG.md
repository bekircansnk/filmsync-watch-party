# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [24.07.2026] - XSS Açıkları Giderildi (innerHTML Temizliği)
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` dosyasında statik HTML yerleşimlerinin DOM'a eklenmesi sürecinde güvenli `DOMParser` kullanımı sağlandı (örn. `root.innerHTML` yerine).
  - SVG ve butonların ekranda oluşturulması aşamasındaki doğrudan metin atamaları (`innerHTML`) element oluşturma (`document.createElement`) yapısı ile değiştirildi.
  - Odaya otomatik katılım (`showAutoJoinOverlay`) ve isim giriş modallarında (`showNamePromptModal`) oda isminin (kullanıcı girdisi) DOM'a güvenli yerleştirilmesi (`textContent`) sağlandı.
  - Liste temizleme işlemlerinde kullanılan `innerHTML = ''` ifadeleri güvenli olan `textContent = ''` ile güncellendi (`extension/content.js` ve `extension/popup.js`).

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
