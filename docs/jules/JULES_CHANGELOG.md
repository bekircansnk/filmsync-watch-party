# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - Güvenlik İyileştirmeleri (XSS Düzeltmeleri)
- **Güvenlik (XSS):**
  - `extension/content.js` dosyasında bulunan `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarındaki dinamik \`innerHTML\` kullanımları kaldırılarak, oda isimlerinin güvenli bir şekilde \`textContent\` ile atanması sağlandı.
  - `extension/popup.js` dosyasında bulunan herkese açık odaların listelendiği kartlarda (\`loadPublicRooms\`), oda ID'si, platform adı ve kullanıcı listesi gibi verilerin doğrudan \`innerHTML\` içine yazılması yerine \`textContent\` ile güvenli bir şekilde DOM'a eklenmesi sağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
