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
## 31.08.2026 - Odalar icin Guvenlik Iyilestirmeleri
- **Guvenlik Iyilestirmeleri:**
  - `extension/content.js` icindeki `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarinda `innerHTML` kullanilarak yapilan guvensiz metin eklemeleri guvenli DOM metodlari (`textContent`) ile degistirildi.
  - `extension/popup.js` icindeki genel oda listeleme dongusunde (`loadPublicRooms`), `innerHTML` uzerinden kullanici girdilerinin DOM'a islenmesi ve nitelik bazli XSS acigi, `textContent` ve `setAttribute` kullanilarak engellendi.
