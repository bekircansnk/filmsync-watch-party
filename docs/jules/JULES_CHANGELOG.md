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

## [16.09.2026] - Güvenlik İyileştirmeleri (XSS Koruması)
- **Güvenlik (XSS):**
  - `extension/content.js` içindeki `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında, doğrudan HTML enjeksiyonu (`innerHTML`) kullanılarak eklenen kullanıcı kaynaklı `roomName` değişkeni, güvenli olan `document.createElement` ve `textContent` kullanılarak yeniden yapılandırıldı.
  - `extension/popup.js` içindeki genel oda listesi bölümünde, `platformName` ve `displayUsersText` değişkenlerinin doğrudan `innerHTML` ile sayfaya basılması engellendi, bunlar yerine `textContent` metodu kullanıldı.
