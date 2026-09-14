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

## [14.09.2026] - Güvenlik İyileştirmeleri
- **Güvenlik (XSS):**
  - \`extension/popup.js\` içinde yer alan \`loadPublicRooms\` fonksiyonundaki \`innerHTML\` kullanımları sanitize edildi. Oda ID'si, platform adı ve üye sayıları gibi değişkenler artık güvenli bir şekilde \`textContent\` ve \`setAttribute\` aracılığıyla DOM'a ekleniyor.
  - \`extension/content.js\` içindeki \`showAutoJoinOverlay\` ve \`showNamePromptModal\` fonksiyonlarında kullanıcı tarafından belirlenen oda isimlerinin doğrudan \`innerHTML\` içine yazılması engellendi, yerine \`textContent\` kullanıldı.
