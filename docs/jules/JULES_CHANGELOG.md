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

## [21.09.2026] - XSS Güvenlik İyileştirmeleri
- **Güvenlik (XSS Koruması):**
  - `extension/content.js` dosyasında `showAutoJoinOverlay` ve `showNamePromptModal` içinde kullanıcı tarafından sağlanan \`roomName\` verisinin \`innerHTML\` üzerinden doğrudan HTML'e enjekte edilmesi engellendi. Metin içeriği \`textContent\` API'si kullanılarak güvenli hale getirildi.
  - `extension/popup.js` dosyasında oda listesi oluşturulurken potansiyel olarak tehlikeli \`roomId\`, \`platformName\` ve \`displayUsersText\` verilerinin \`innerHTML\` ile işlenmesi önlendi, bunun yerine \`textContent\` kullanıldı.
